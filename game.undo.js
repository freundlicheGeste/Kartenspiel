/* =====================================================
   GAME UNDO / REDO
   Verantwortlich für: State-Snapshots, Undo/Redo-Stack,
   DOM-Rekonstruktion, Partikel-Effekte, Badge-UI.
   Bereinigt: updateTimeButtons() und updateUndoUI()
   hatten doppelte Badge-Logik — zusammengeführt.
   getUndoOrigin() und getTimeOrigin('undo') waren
   identisch — auf getTimeOrigin() vereinheitlicht.
   Abhängigkeiten: card.utils.js, card.creation.js,
                   scoring.system.js
===================================================== */

const MAX_UNDO = 20;
let undoCount = 0;
let undoStack = [];
let redoStack = [];

/* =====================================================
   SNAPSHOT
===================================================== */

/**
 * Erstellt einen vollständigen State-Snapshot des Spielfelds.
 * SSOT — wird von pushState(), undoLastMove() und redoLastMove() genutzt.
 * @returns {Object}
 */
function createSnapshot() {
    return {
        stock: JSON.parse(JSON.stringify(stock || [])),
        waste: _cardDataFromEl(document.getElementById('waste-pile')),
        tableau: Array.from(document.querySelectorAll('.column')).map(_cardDataFromEl),
        foundations: Array.from(document.querySelectorAll('.foundation')).map(_cardDataFromEl),
        moves,
        score,
    };
}

/**
 * Sichert den aktuellen State auf den Undo-Stack.
 * Löscht den Redo-Stack (Zukunft ist nach einer Aktion ungültig).
 */
function pushState() {
    undoStack.push(createSnapshot());
    if (undoStack.length > MAX_UNDO) undoStack.shift();

    redoStack = []; // Zukunft löschen
    updateUndoUI();
}

/* =====================================================
   UNDO / REDO
===================================================== */

/**
 * Macht den letzten Zug rückgängig.
 */
function undoLastMove() {
    if (undoStack.length === 0 || isAnimating) return;

    redoStack.push(createSnapshot());
    applyState(undoStack.pop(), 'undo');

    spawnParticles('undo');
    updateUndoUI();
    applyUndoPenalty?.();
    updateStockEmpty?.();
}

/**
 * Wiederholt den zuletzt rückgängig gemachten Zug.
 */
function redoLastMove() {
    if (redoStack.length === 0 || isAnimating) return;

    undoStack.push(createSnapshot());
    applyState(redoStack.pop(), 'redo');

    spawnParticles('redo');
    updateUndoUI();
    updateStockEmpty?.();
}

/**
 * Stellt einen gespeicherten State auf dem Spielfeld wieder her.
 * @param {Object} state
 * @param {'undo'|'redo'} mode
 */
function applyState(state, mode = 'undo') {
    stock = state.stock;
    moves = state.moves;
    score = state.score;

    renderFullState(state, mode);

    updateScore(0);
    const movesEl = document.getElementById('moves-count');
    if (movesEl) movesEl.innerText = moves;
}

/* =====================================================
   DOM REKONSTRUKTION
===================================================== */

/**
 * Baut das komplette Spielfeld aus einem Snapshot neu auf.
 * @param {Object}        state
 * @param {'undo'|'redo'} mode
 */
function renderFullState(state, mode) {
    isAnimating = true;

    // Stock
    const stockEl = document.getElementById('stock-pile');
    if (stockEl) {
        stockEl.innerHTML = '';
        state.stock.forEach(data => glideCardIntoPlace(data, stockEl, true));
    }

    // Waste
    const wasteEl = document.getElementById('waste-pile');
    if (wasteEl) {
        wasteEl.innerHTML = '';
        state.waste.forEach(data => glideCardIntoPlace(data, wasteEl, false));
    }

    // Tableau
    document.querySelectorAll('.column').forEach((col, i) => {
        col.innerHTML = '';
        state.tableau[i]?.forEach((data, idx) => {
            const yPos = idx * (typeof cardDistance !== 'undefined' ? cardDistance : 25);
            glideCardIntoPlace(data, col, data.isBack, yPos, mode);
        });
    });

    // Foundation
    document.querySelectorAll('.foundation').forEach((f, i) => {
        f.innerHTML = '';
        state.foundations[i]?.forEach(data => glideCardIntoPlace(data, f, false));
    });

    updateStackVisuals('stock-pile');
    updateStackVisuals('waste-pile');

    setTimeout(() => { isAnimating = false; }, 350);
}

/* =====================================================
   UI
===================================================== */

/**
 * Aktualisiert den Enabled-State und die Badges von Undo/Redo-Buttons.
 * SSOT — ersetzt doppelte Logik aus updateUndoUI() + updateTimeButtons().
 */
function updateUndoUI() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const undoBadge = document.getElementById('undo-count-badge');
    const redoBadge = document.getElementById('redo-count-badge');

    if (!undoBtn || !redoBtn) return;

    const canUndo = undoStack.length > 0 && !isAnimating;
    const canRedo = redoStack.length > 0 && !isAnimating;

    undoBtn.classList.toggle('disabled', !canUndo);
    redoBtn.classList.toggle('disabled', !canRedo);

    // Badge-Zahlen animiert aktualisieren (SSOT — war in updateTimeButtons dupliziert)
    if (undoBadge) animateBadgeStepwise?.(undoBadge, undoStack.length);
    if (redoBadge) animateBadgeStepwise?.(redoBadge, redoStack.length);
}

function updateUndoBadge() {
    const badge = document.getElementById('undo-count-badge');
    if (badge) animateBadgeStepwise?.(badge, undoStack.length);
}

function updateRedoBadge() {
    const badge = document.getElementById('redo-count-badge');
    if (badge) animateBadgeStepwise?.(badge, redoStack.length);
}

/* =====================================================
   PARTIKEL-EFFEKTE
===================================================== */

/**
 * Spawnt Partikel-Effekte beim Undo oder Redo.
 * SSOT — ersetzt spawnUndoParticles() + spawnRedoParticles().
 * @param {'undo'|'redo'} type
 */
function spawnParticles(type) {
    const origin = getTimeOrigin(type);
    const count = type === 'undo' ? 8 : 10;
    const color = type === 'undo' ? '#3498db' : '#2ecc71';
    const scale = type === 'undo' ? 'scale(0.5)' : 'scale(1.5)';
    const dur = type === 'undo' ? 600 : 500;
    const cls = type === 'undo' ? 'undo-particle' : 'redo-particle';

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = cls;
        p.innerHTML = `<div style="width:10px;height:10px;background:${color};border-radius:50%;box-shadow:0 0 5px #fff;"></div>`;
        p.style.cssText = `position:fixed;left:${origin.x}px;top:${origin.y}px;`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const xDiff = Math.cos(angle) * velocity;
        const yDiff = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${xDiff}px,${yDiff}px) ${scale}`, opacity: 0 },
        ], { duration: dur, easing: 'ease-out' });

        document.body.appendChild(p);
        setTimeout(() => p.remove(), dur);
    }
}

/**
 * Ermittelt die Bildschirmmitte eines Undo- oder Redo-Buttons.
 * SSOT — ersetzt getUndoOrigin() + getTimeOrigin().
 * @param {'undo'|'redo'} type
 * @returns {{ x: number, y: number }}
 */
function getTimeOrigin(type = 'undo') {
    const btn = document.getElementById(type === 'undo' ? 'undo-btn' : 'redo-btn');
    if (!btn) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Zeichnet einen Partikel-Punkt an einer bestimmten Position.
 * Für Mouse-Trail-Effekte während Undo/Redo.
 * @param {number} x
 * @param {number} y
 * @param {string} [color]
 */
function spawnTimeTrail(x, y, color = '#3498db') {
    const p = document.createElement('div');
    Object.assign(p.style, {
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        boxShadow: `0 0 8px ${color}`,
    });

    document.body.appendChild(p);
    p.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.3)', opacity: 0 },
    ], { duration: 400, easing: 'ease-out' });
    setTimeout(() => p.remove(), 400);
}

/* =====================================================
   VISUALS
===================================================== */

/**
 * Aktualisiert den 3D-Versatz und Schatten der Karten in einem Stapel.
 * @param {string} pileId - Element-ID (z.B. 'stock-pile', 'waste-pile')
 */
function updateStackVisuals(pileId) {
    const pile = document.getElementById(pileId);
    if (!pile) return;

    Array.from(pile.children).forEach((card, index, arr) => {
        const offset = Math.floor(index / 4) * 0.8;
        card.style.transform = `translate(-${offset}px, -${offset}px)`;
        card.style.boxShadow = index === arr.length - 1
            ? '2px 2px 6px rgba(0,0,0,0.4)'
            : 'none';
    });
}

/* =====================================================
   INTERNE HILFSFUNKTIONEN
===================================================== */

/**
 * Liest Karten-Datensätze aus einem DOM-Container.
 * @param {HTMLElement|null} parent
 * @returns {Object[]}
 */
function _cardDataFromEl(parent) {
    if (!parent) return [];
    return Array.from(parent.children).map(c => {
        const data = {
            id: c.dataset.cardId,
            value: c.dataset.value,
            suit: c.dataset.suit,
            color: c.dataset.color,
            symbol: c.dataset.symbol,
            isBack: c.classList.contains('back'),
        };
        validateCardData?.(data, 'SNAPSHOT');
        return data;
    });
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