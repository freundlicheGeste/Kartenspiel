const MAX_UNDO = 20;
let undoCount = 0;
let isUndoPausingAuto = false;
let lastMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

let undoStack = [];
let redoStack = [];

// Zentrale Snapshot-Funktion (EINHEITLICH!)
function createSnapshot() {
    return {
        stock: JSON.parse(JSON.stringify(stock || [])),
        waste: getCardDataFromElement(document.getElementById('waste-pile')),
        tableau: Array.from(document.querySelectorAll('.column')).map(getCardDataFromElement),
        foundations: Array.from(document.querySelectorAll('.foundation')).map(getCardDataFromElement),
        moves,
        score
    };
}

// Wird bei JEDEM validen Zug/Move aufgerufen
function pushState() {
    undoStack.push(createSnapshot());

    if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
    }

    // CRITICAL: Zukunft löschen
    redoStack = [];

    updateUndoUI();
}

function undoLastMove() {
    if (undoStack.length === 0 || isAnimating) return;

    const current = createSnapshot();
    redoStack.push(current);

    const prev = undoStack.pop();

    applyState(prev, 'undo');

    spawnUndoParticles();
    updateUndoUI();

    applyUndoPenalty();
    // Entferne das empty Icon und setzt den cursor, wenn stock und waste leer sind.
    updateStockEmpty();
}

function redoLastMove() {
    if (redoStack.length === 0 || isAnimating) return;

    const current = createSnapshot();
    undoStack.push(current);

    const next = redoStack.pop();

    applyState(next, 'redo');

    spawnRedoParticles();
    updateUndoUI();
    // Entferne das empty Icon und setzt den cursor, wenn stock und waste leer sind.
    updateStockEmpty();
}

function applyState(state, mode = 'undo') {
    stock = state.stock;
    moves = state.moves;
    score = state.score;

    renderFullState(state, mode);

    updateScore(0);
    document.getElementById('moves-count').innerText = moves;
}

// UI Aktualisierung (Diese Funktion nach jedem Zug/Undo/Redo aufrufen!)
function updateUndoUI() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    // Undo Logik
    const canUndo = undoStack.length > 0 && !isAnimating;
    undoBtn.classList.toggle('disabled', !canUndo);

    // Redo Logik
    const canRedo = redoStack.length > 0 && !isAnimating;
    redoBtn.classList.toggle('disabled', !canRedo);

    updateTimeButtons();
    updateUndoBadge();
    updateRedoBadge();
}

function updateTimeButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const undoBadge = document.getElementById('undo-count-badge');
    const redoBadge = document.getElementById('redo-count-badge');

    // Undo
    if (parseInt(undoBadge.innerText) > 0) {
        undoBtn.classList.remove('disabled');
    } else {
        undoBtn.classList.add('disabled');
    }

    // Redo
    if (parseInt(redoBadge.innerText) > 0) {
        redoBtn.classList.remove('disabled');
    } else {
        redoBtn.classList.add('disabled');
    }

    animateBadgeStepwise(undoBadge, undoStack.length);
    animateBadgeStepwise(redoBadge, redoStack.length);
}

function updateUndoBadge(count = undoStack.length) {
    const undoBadge = document.getElementById('undo-count-badge');
    const undoBtn = document.getElementById('undo-btn');

    undoBadge.innerText = count;

    const isMax = count >= MAX_UNDO;
    undoBadge.classList.toggle('maxed', count >= MAX_UNDO);

    if (count > 0 && count <= MAX_UNDO) {
        undoBtn.classList.remove('disabled');
        if (!isMax) { // keine Animation mehr, wenn MAX erreicht
            undoBadge.classList.add('badge-pop');
            setTimeout(() => undoBadge.classList.remove('badge-pop'), 200);
        }
    } else {
        undoBtn.classList.add('disabled');
    }
}

function updateRedoBadge(count = redoStack.length) {
    const redoBadge = document.getElementById('redo-count-badge');
    const redoBtn = document.getElementById('redo-btn');

    redoBadge.innerText = count;

    const isMax = count >= MAX_UNDO;
    redoBadge.classList.toggle('maxed', count >= MAX_UNDO);

    if (count > 0 && count <= MAX_UNDO) {
        redoBtn.classList.remove('disabled');
        if (!isMax) { // keine Animation mehr, wenn MAX erreicht
            redoBadge.classList.add('badge-pop');
            setTimeout(() => redoBadge.classList.remove('badge-pop'), 200);
        }
    } else {
        redoBtn.classList.add('disabled');
    }
}

function spawnUndoParticle(button) {
    const particle = document.createElement('div');
    particle.className = 'undo-particle';
    particle.style.left = button.offsetLeft + 10 + 'px';
    particle.style.top = button.offsetTop - 5 + 'px';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
}

function animateBadgeCount(el, newValue) {
    const start = parseInt(el.innerText) || 0;
    const duration = 200;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(start + (newValue - start) * progress);
        el.innerText = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function animateBadgeStepwise(el, targetValue) {
    let current = parseInt(el.innerText) || 0;

    if (current === targetValue) return;

    const step = current < targetValue ? 1 : -1;

    function tick() {
        current += step;
        el.innerText = current;

        if (current !== targetValue) {
            setTimeout(tick, 40); // Geschwindigkeit hier einstellen
        }
    }

    tick();
}

/**
 * UI komplett aus dem Daten-State rekonstruieren (mit FLIP-Gleit-Animation)
 */
function renderFullState(state, mode = 'undo') {
    if (isAnimating) {
        console.warn("Animation active, forcing state render");
    }
    isAnimating = true; // Animation sperren

    // Alle Container-IDs, die wir leeren müssen
    const containers = [
        document.getElementById('stock-pile'),
        document.getElementById('waste-pile'),
        ...document.querySelectorAll('.column'),
        ...document.querySelectorAll('.foundation')
    ];

    // 1. Alle alten Karten im DOM löschen
    containers.forEach(c => { if (c) c.innerHTML = ''; });

    // 2. Hilfsfunktion für die FLIP-Animation
    function glideCardIntoPlaceALTERHUT(cardData, targetParent, isBack = false, yOffset = 0, zIndex = 1) {
        // Prüfen auf defekte Kartenwerte
        validateCardData(cardData, 'RENDER');

        // a) Karte erstellen (Zustand: Last)
        const cardEl = createCardElement(cardData, isBack);

        // Z-Index und Position im Tableau setzen (Zustand: Last)
        if (targetParent.classList.contains('column')) {
            cardEl.style.top = yOffset + "px";
        }

        // Wir blenden die Karte kurz aus, um ein kurzes "Ploppen" zu verhindern
        cardEl.style.opacity = '0';

        // Karte ans Ziel anhängen (Zustand: Last)
        targetParent.appendChild(cardEl);

        // b) Delta berechnen (Zustand: Invert)
        // Wir nehmen an, dass die Karte von der Mausposition oder der Mitte des Spielfelds gleitet,
        // da wir ihre exakte alte Position im DOM nicht im State speichern.
        // Ein Start von der Mausposition fühlt sich oft am natürlichsten an.


        // Falls wir keine Mausposition haben (z.B. bei Shortcut), nehmen wir die Mitte des Spielfelds
        //const startX = (lastMousePos?.x || (window.innerWidth / 2)) - 50;
        //const startY = (lastMousePos?.y || (window.innerHeight / 2)) - 75;


        // Neu vom Undo Button einfliegen lassen getUndoOrigin()
        const origin = getUndoOrigin();

        const startX = origin.x - 50;
        const startY = origin.y - 75;


        // Wir brauchen einen Reflow, damit der Browser die 'Last' Position kennt
        void cardEl.offsetWidth;

        // Jetzt holen wir uns die 'Last' Position im DOM
        const rectLast = cardEl.getBoundingClientRect();

        // Invert: Die Differenz berechnen
        const deltaX = startX - rectLast.left;
        const deltaY = startY - rectLast.top;

        // c) Den 'Invert' Zustand anwenden (bevor die Gleit-Klasse dazu kommt)
        // Die Karte ist jetzt visuell an ihrer Startposition, aber physisch an ihrer Zielposition.
        cardEl.style.transition = 'none';
        cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        //cardEl.style.opacity = '1';

        // d) Play: Die Gleit-Klasse hinzufügen und das Transform auf (0,0) setzen
        requestAnimationFrame(() => {
            void cardEl.offsetWidth;
            cardEl.classList.add('card-undo-glide');
            cardEl.style.transform = 'translate(0,0)';
            cardEl.style.opacity = '1';

            // WICHTIG: Der Fix für den z-Index
            setTimeout(() => {
                cardEl.classList.remove('card-undo-glide');

                // Wir entfernen Inline-Styles, die die normale CSS-Stapelung stören könnten
                cardEl.style.transform = '';
            }, 300);
        });

        return cardEl;
    }
    function glideCardIntoPlace(cardData, targetParent, isBack = false, yOffset = 0, mode = 'undo') {

        validateCardData(cardData, 'RENDER');

        const cardEl = createCardElement(cardData, isBack);

        if (targetParent.classList.contains('column')) {
            cardEl.style.top = yOffset + "px";
        }

        cardEl.style.opacity = '0';
        targetParent.appendChild(cardEl);

        // 👉 Ursprung bestimmen (Undo / Redo)
        //const origin = getTimeOrigin(mode);

        const rectLast = cardEl.getBoundingClientRect();

        // 👉 leichte Kurve / Chaos einbauen
        const randomOffsetX = (Math.random() - 0.5) * 80;
        const randomOffsetY = (Math.random() - 0.5) * 80;

        //const startX = origin.x + randomOffsetX;
        //const startY = origin.y + randomOffsetY;

        const startX = (lastMousePos?.x || (window.innerWidth / 2)) - 50;
        const startY = (lastMousePos?.y || (window.innerHeight / 2)) - 75;

        const deltaX = startX - rectLast.left;
        const deltaY = startY - rectLast.top;

        // Invert
        cardEl.style.transition = 'none';
        cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;

        requestAnimationFrame(() => {
            void cardEl.offsetWidth;

            cardEl.classList.add('card-undo-glide');

            // 👉 kleine Ease-Unterschiede
            cardEl.style.transition = mode === 'redo'
                ? 'transform 0.35s cubic-bezier(0.2, 1.2, 0.3, 1), opacity 0.3s'
                : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s';

            cardEl.style.transform = 'translate(0,0) scale(1)';
            cardEl.style.opacity = '1';

            // 👉 Trail während Bewegung
            let trailCount = 0;
            const trailInterval = setInterval(() => {
                spawnTimeTrail(
                    rectLast.left + Math.random() * 20,
                    rectLast.top + Math.random() * 20,
                    mode === 'redo' ? '#00f2ff' : '#3498db'
                );

                trailCount++;
                if (trailCount > 6) clearInterval(trailInterval);
            }, 40);

            setTimeout(() => {
                cardEl.classList.remove('card-undo-glide');
                cardEl.style.transform = '';
            }, 450);
        });

        return cardEl;
    }

    // --- Start des eigentlichen Renders ---

    // 3. Stock neu aufbauen
    const stockEl = document.getElementById('stock-pile');
    if (stockEl && state.stock) {
        state.stock.forEach(data => {
            glideCardIntoPlace(data, stockEl, true);
        });
    }

    // 4. Waste neu aufbauen
    const wasteEl = document.getElementById('waste-pile');
    if (wasteEl && state.waste) {
        state.waste.forEach(data => {
            glideCardIntoPlace(data, wasteEl, false);
        });
    }

    // 5. Tableau neu aufbauen
    document.querySelectorAll('.column').forEach((col, i) => {
        if (state.tableau[i]) {
            state.tableau[i].forEach((data, idx) => {
                const yPos = idx * (typeof cardDistance !== 'undefined' ? cardDistance : 25);
                //glideCardIntoPlace(data, col, data.isBack, yPos, 100 + idx);
                glideCardIntoPlace(data, col, data.isBack, yPos, mode);
            });
        }
    });

    // 6. Foundation neu aufbauen
    document.querySelectorAll('.foundation').forEach((f, i) => {
        if (state.foundations[i]) {
            state.foundations[i].forEach(data => {
                glideCardIntoPlace(data, f, false);
            });
        }
    });

    // 7. Visuals (Schatten & 3D-Effekt) aktualisieren
    updateStackVisuals('stock-pile');
    updateStackVisuals('waste-pile');

    // 8. Animation sperren aufheben (nachdem alle Karten gestartet sind)
    setTimeout(() => { isAnimating = false; }, 350);

    //normalizeAllZIndices();
}

// Helper um Card-Objekte aus DOM-Elementen zu extrahieren
function getCardDataFromElement(parent) {
    if (!parent) return [];

    return Array.from(parent.children).map(c => {
        const data = {
            id: c.dataset.cardId,
            value: c.dataset.value,
            suit: c.dataset.suit,
            color: c.dataset.color,
            symbol: c.dataset.symbol,
            isBack: c.classList.contains('back')
        };
        // Prüfen auf defekte Kartenwerte
        validateCardData(data, 'SNAPSHOT');

        return data;
    });
}

function updateStackVisuals(pileId) {
    const pile = document.getElementById(pileId);
    if (!pile) return;

    const cards = Array.from(pile.children);

    cards.forEach((card, index) => {
        // Ganz dezenter Versatz für den 3D-Effekt
        const offset = Math.floor(index / 4) * 0.8;

        card.style.transform = `translate(-${offset}px, -${offset}px)`;

        // Schatten nur für die oberste Karte
        if (index === cards.length - 1) {
            card.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.4)';
        } else {
            card.style.boxShadow = 'none';
        }
    });
}

function spawnUndoParticles() {
    const undoBtn = document.querySelector('#undo-btn');
    if (!undoBtn) return;
    const rect = undoBtn.getBoundingClientRect();

    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'undo-particle';
        // Ein wirbelndes Icon oder einfach ein blauer Kreis
        p.innerHTML = `<div style="width:10px;height:10px;background:#3498db;border-radius:50%;box-shadow:0 0 5px #fff;"></div>`;

        const startX = (rect.left + rect.width / 2);
        const startY = (rect.top + rect.height / 2);

        p.style.position = 'fixed';
        p.style.left = startX + 'px';
        p.style.top = startY + 'px';
        /*
                // Wirbel-Effekt (nach innen oder spiralförmig)
                const xDiff = (Math.random() - 0.5) * 80;
                const yDiff = (Math.random() - 0.5) * 80;
        
                p.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${xDiff}px, ${yDiff}px) scale(0)`, opacity: 0 }
                ], { duration: 600, easing: 'ease-out' });
        */
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;

        const xDiff = Math.cos(angle) * velocity;
        const yDiff = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${xDiff}px, ${yDiff}px) scale(0.5)`, opacity: 0 }
        ], { duration: 600, easing: 'ease-out' });

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function spawnRedoParticles() {
    const redoBtn = document.querySelector('#redo-btn');
    if (!redoBtn) return;
    const rect = redoBtn.getBoundingClientRect();

    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'redo-particle';

        const startX = (rect.left + rect.width / 2);
        const startY = (rect.top + rect.height / 2);
        p.style.left = startX + 'px';
        p.style.top = startY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const xDiff = Math.cos(angle) * velocity;
        const yDiff = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${xDiff}px, ${yDiff}px) scale(1.5)`, opacity: 0 }
        ], { duration: 500, easing: 'ease-out' });

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 500);
    }
}

function getUndoOrigin() {
    const undoBtn = document.getElementById('undo-btn');
    if (!undoBtn) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const rect = undoBtn.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getTimeOrigin(type = 'undo') {
    const btn = document.getElementById(type === 'undo' ? 'undo-btn' : 'redo-btn');
    if (!btn) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const rect = btn.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function spawnTimeTrail(x, y, color = '#3498db') {
    const p = document.createElement('div');
    p.style.position = 'fixed';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.width = '6px';
    p.style.height = '6px';
    p.style.borderRadius = '50%';
    p.style.background = color;
    p.style.pointerEvents = 'none';
    p.style.boxShadow = `0 0 8px ${color}`;

    document.body.appendChild(p);

    p.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.3)', opacity: 0 }
    ], { duration: 400, easing: 'ease-out' });

    setTimeout(() => p.remove(), 400);
}