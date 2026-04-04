/* =====================================================
   UI ANIMATIONS
   Verantwortlich für: Partikel-Effekte (Foundation,
   Reset, Dust), Suit-Frame-Orbit, Victory-Bounce.
   Debug-Funktionen mit window.* Prefix klar getrennt.
   Abhängigkeiten: keine
===================================================== */

/* =====================================================
   RESET-EXPLOSION (Waste → Stock)
===================================================== */

/**
 * Kartensymbol-Partikel die beim Stock-Reset aus dem Waste fliegen.
 */
function triggerResetExplosion() {
    const wastePile = document.getElementById('waste-pile');
    if (!wastePile) return;

    const rect         = wastePile.getBoundingClientRect();
    const suits        = ['♥', '♦', '♠', '♣'];

    for (let i = 0; i < 20; i++) {
        const p      = document.createElement('div');
        p.className  = 'reset-particle';
        p.textContent = suits[Math.floor(Math.random() * suits.length)];
        p.style.color = (p.textContent === '♥' || p.textContent === '♦') ? '#e74c3c' : '#2c3e50';

        const startY      = rect.top  + Math.random() * 130;
        const startX      = rect.left + Math.random() * rect.width * 0.5;
        const moveLeft    = -(80 + Math.random() * 60);
        const moveVertical = (Math.random() - 0.5) * 20;

        p.style.opacity   = 0.4 + Math.random() * 0.6;
        p.style.fontSize  = `${1.0 + Math.random() * 0.6}rem`;
        p.style.left      = `${startX}px`;
        p.style.top       = `${startY}px`;
        p.style.animationDelay = `${i * 15}ms`;

        p.style.setProperty('--dx', `${moveLeft}px`);
        p.style.setProperty('--dy', `${moveVertical}px`);
        p.style.setProperty('--dr', `${(Math.random() - 0.5) * 720}deg`);

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000 + i * 15);
    }
}

/* =====================================================
   FOUNDATION-EXPLOSION
===================================================== */

/**
 * Radiale Suit-Symbol-Explosion wenn eine Karte auf die Foundation gelegt wird.
 * @param {string} targetId    - ID des Foundation-Slots (z.B. 'f-hearts')
 * @param {string} suitSymbol  - Suit-Symbol (♥ ♦ ♣ ♠)
 */
function triggerFoundationExplosion(targetId, suitSymbol) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const rect    = target.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const isRed   = suitSymbol === '♥' || suitSymbol === '♦';
    const color   = isRed ? '#e74c3c' : '#2c3e50';

    for (let i = 0; i < 12; i++) {
        const p      = document.createElement('div');
        p.className  = 'foundation-particle';
        p.textContent = suitSymbol;
        p.style.color = color;

        const baseAngle   = (i / 12) * Math.PI * 2;
        const angle       = baseAngle + (Math.random() - 0.5) * 0.5;
        const distance    = 50 + Math.random() * 40;

        p.style.left = `${centerX}px`;
        p.style.top  = `${centerY}px`;
        p.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        p.style.setProperty('--dr', `${(Math.random() - 0.5) * 720}deg`);

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

/* =====================================================
   SUIT-FRAME (Karten-Orbit)
===================================================== */

/**
 * Legt einen animierten Suit-Symbol-Rahmen um eine Karte.
 * @param {HTMLElement} cardElement
 * @param {string}      suitSymbol
 * @param {boolean}     [animatePulse=true]
 * @param {boolean}     [animateRotate=true]
 */
function createSuitFrame(cardElement, suitSymbol, animatePulse = true, animateRotate = true) {
    cardElement.querySelector('.card-glow-frame')?.remove();

    const frame   = document.createElement('div');
    frame.className = 'card-glow-frame';

    const isRed = suitSymbol === '♥' || suitSymbol === '♦';
    const color = isRed ? '#e74c3c' : '#000000';

    for (let i = 0; i < 32; i++) {
        const p           = document.createElement('div');
        p.className       = 'frame-particle';
        p.textContent     = suitSymbol;
        p.style.color     = color;
        p.style.fontSize  = `${0.8 + Math.random() * 0.5}rem`;
        p.style.opacity   = '0';

        const baseOpacity = 0.4 + Math.random() * 0.6;
        p.style.setProperty('--base-op', baseOpacity);

        const side   = Math.floor(Math.random() * 4);
        const offset = Math.random() * 4;
        let x, y;
        switch (side) {
            case 0: x = Math.random() * 100; y = -offset;        break; // TOP
            case 1: x = 100 - offset;        y = Math.random() * 100; break; // RIGHT
            case 2: x = Math.random() * 100; y = 100 - offset;   break; // BOTTOM
            case 3: x = -offset;             y = Math.random() * 100; break; // LEFT
        }
        p.style.left      = `${x}%`;
        p.style.top       = `${y}%`;
        p.style.transform = `translate(-50%,-50%) rotate(${(Math.random() - 0.5) * 30}deg)`;

        const animations = [];
        if (animatePulse)  animations.push(`frame-pulse ${2 + Math.random() * 2}s infinite ease-in-out`);
        if (animateRotate) animations.push(`frame-rotate ${3 + Math.random() * 3}s infinite linear`);
        if (animations.length) p.style.animation = animations.join(', ');

        frame.appendChild(p);
        requestAnimationFrame(() => { p.style.opacity = baseOpacity; });
    }

    cardElement.appendChild(frame);
}

/**
 * Entfernt einen Suit-Frame mit Fade-out.
 * @param {HTMLElement} cardElement
 */
function removeSuitFrame(cardElement) {
    const frame = cardElement?.querySelector('.card-glow-frame');
    if (!frame) return;
    frame.style.transition = 'opacity 0.5s ease-out';
    frame.style.opacity    = '0';
    setTimeout(() => frame.remove(), 500);
}

/**
 * Zeigt einen temporären Suit-Frame-Orbit für eine Dauer.
 * @param {HTMLElement} cardElement
 * @param {string}      suitSymbol
 * @param {number}      [duration=1000]
 */
function triggerTemporaryOrbit(cardElement, suitSymbol, duration = 1000) {
    createSuitFrame(cardElement, suitSymbol, true, 1.2);
    setTimeout(() => removeSuitFrame(cardElement), duration);
}

/* =====================================================
   HIGHSCORE-REGEN
===================================================== */

/**
 * Lässt 50 Mini-Karten als Regen vom oberen Bildschirmrand fallen.
 * Wird bei neuem Highscore ausgelöst.
 */
function triggerCardRain() {
    const symbols = ['♠', '♥', '♦', '♣'];
    const colors  = ['#000', '#e74c3c', '#e74c3c', '#000'];

    for (let i = 0; i < 50; i++) {
        const card    = document.createElement('div');
        const idx     = Math.floor(Math.random() * 4);
        card.className = 'falling-card';
        card.innerHTML = `
            <div class="card-mini-top">${symbols[idx]}</div>
            <div class="card-mini-center">${symbols[idx]}</div>`;

        card.style.left  = Math.random() * 100 + 'vw';
        card.style.color = colors[idx];

        const size = Math.random() * 20 + 30;
        card.style.width           = size + 'px';
        card.style.height          = (size * 1.4) + 'px';
        card.style.animationDuration = (Math.random() * 2 + 3) + 's';
        card.style.animationDelay  = (Math.random() * 2) + 's';

        document.body.appendChild(card);
        setTimeout(() => card.remove(), 6500);
    }
}

/* =====================================================
   VICTORY CASCADE
===================================================== */

/**
 * Löst die Sieg-Animation aus: Karten springen aus den Foundations
 * und hüpfen über den Bildschirm.
 */
function startVictoryCascade() {
    const foundations = Array.from(document.querySelectorAll('.foundation'));

    for (let i = 1; i <= 13; i++) {
        foundations.forEach((f, fIdx) => {
            const cards = Array.from(f.querySelectorAll('.card'));
            const card  = cards[cards.length - i];
            if (!card) return;

            setTimeout(() => {
                const rect    = card.getBoundingClientRect();
                card.style.left = rect.left + 'px';
                card.style.top  = rect.top  + 'px';
                document.body.appendChild(card);
                _animateBouncingCard(card);
            }, i * 250 + fIdx * 60);
        });
    }
}

/**
 * Physik-Loop für eine hüpfende Karte.
 * Entfernt sich selbst wenn sie aus dem Sichtfeld fliegt oder ein neues Spiel startet.
 * @param {HTMLElement} card
 */
function _animateBouncingCard(card) {
    card.classList.add('victory-card');

    let x  = parseFloat(card.style.left);
    let y  = parseFloat(card.style.top);
    let vx = (Math.random() * 10) - 5;
    let vy = Math.random() * -10 - 5;

    const gravity   = 0.7;
    const bounce    = -0.7;
    const deathTimer = setTimeout(() => card.remove(), 10000);

    function step() {
        if (gameState.is(GameStates.RUNNING)) {
            clearTimeout(deathTimer);
            card.remove();
            return;
        }

        x += vx;
        y += vy;
        vy += gravity;

        if (y + 130 > window.innerHeight) {
            y   = window.innerHeight - 130;
            vy *= bounce;
            if (Math.abs(vy) < 1) vx = vx > 0 ? 5 : -5;
        }

        card.style.left = x + 'px';
        card.style.top  = y + 'px';

        if (x + 200 >= 0 && x <= window.innerWidth + 200 && y <= window.innerHeight + 500) {
            requestAnimationFrame(step);
        } else {
            clearTimeout(deathTimer);
            card.remove();
        }
    }

    requestAnimationFrame(step);
}

/* =====================================================
   DEBUG-TOOLS (window.* — nur in DEV_MODE sinnvoll)
===================================================== */

window.debugFoundationEffect = function (suitSymbol = '♥', targetId = 'f-hearts') {
    const target = document.getElementById(targetId);
    if (!target) { console.error(`#${targetId} nicht gefunden`); return; }

    const dummy       = document.createElement('div');
    dummy.className   = 'card red hearts';
    dummy.style.cssText = 'position:absolute;top:0;left:0;z-index:10;';
    dummy.innerHTML   = `<b>A</b><br>${suitSymbol}`;
    target.appendChild(dummy);

    triggerFoundationExplosion(targetId, suitSymbol);
    setTimeout(() => dummy.remove(), 1200);
};

window.testBurst = function () {
    let count = 0;
    const iv  = setInterval(() => {
        window.debugFoundationEffect('♥', 'f-hearts');
        if (++count >= 2) clearInterval(iv);
    }, 200);
};

window.testAllFrames = function () {
    const map = { 'f-hearts': '♥', 'f-diamonds': '♦', 'f-spades': '♠', 'f-clubs': '♣' };
    Object.entries(map).forEach(([id, sym]) => {
        const card = document.getElementById(id)?.lastElementChild;
        if (card) createSuitFrame(card, sym, true, true);
    });
};

window.debugSingle = function (symbol, pulse, rotate) {
    const card = document.querySelector('.foundation .card');
    if (card) createSuitFrame(card, symbol, pulse, rotate);
};
