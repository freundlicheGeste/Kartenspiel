/* =====================================================
   APP UI
   Verantwortlich für: Score-Anzeige mit Coin-Partikeln,
   Stock-Empty-Indikator, animateValue(), Score-Zeilen-
   Animation für das Win-Panel.

   SSOT: updateScore() lebt hier (UI-Schicht).
   scoring_system.js deklariert nur die `score`-Variable
   und getScoreValue(). Alle visuellen Score-Updates
   laufen ausschließlich über diese Funktion.

   Abhängigkeiten: app_storage.js (kts), app_core.js (score),
                   game_xp.js (updateLevelUI)
===================================================== */

/* =====================================================
   SCORE-ANZEIGE (SSOT)
===================================================== */

/**
 * Aktualisiert den Punktestand und alle Score-Displays.
 * Löst Coin-Partikel und Level-Up-Check aus.
 *
 * SSOT — einzige Stelle wo `score` mutiert und angezeigt wird.
 * scoring_system.js ruft diese Funktion auf, definiert sie nicht.
 *
 * @param {number} points  Delta (positiv = Gewinn, negativ = Verlust).
 *                         0 = nur Display aktualisieren, kein Partikel.
 */
function updateScore(points) {
    if (points !== 0) {
        score = Math.max(0, score + points);
        spawnCoinParticles(points > 0);
        updateLevelUI?.(points);
    }

    const displays = ['score-display', 'coin-display'];
    displays.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = score;

        if (points !== 0) {
            const cls = points > 0 ? 'score-gain' : 'score-loss';
            el.classList.add(cls);
            setTimeout(() => el.classList.remove(cls), 600);
        }
    });
}

/* =====================================================
   COIN-PARTIKEL
===================================================== */

/**
 * Spawnt Münz-Partikel an der Hauptmünze (links unten).
 * Positiver Delta → Partikel fliegen hoch.
 * Negativer Delta → Partikel fallen runter.
 * @param {boolean} isGain
 */
function spawnCoinParticles(isGain) {
    const mainCoin = document.querySelector('.main-coin-svg');
    if (!mainCoin) return;

    const rect  = mainCoin.getBoundingClientRect();
    const pSize = 22;

    for (let i = 0; i < 6; i++) {
        const p     = document.createElement('div');
        p.className = 'coin-particle';
        p.innerHTML = `
            <svg viewBox="0 0 500 500" style="width:100%;height:100%;overflow:visible;">
                <circle cx="250" cy="250" r="245" fill="#d4af37"/>
                <circle cx="250" cy="250" r="190" fill="#f1c40f"/>
                <path d="M250 120 L310 210 L410 210 L330 290 L360 390 L250 330 L140 390 L170 290 L90 210 L190 210 Z"
                      fill="#d4af37"/>
            </svg>`;

        const startX = (rect.left + rect.width  / 2) - pSize / 2;
        const startY = (rect.top  + rect.height / 2) - pSize / 2;

        p.style.left = startX + 'px';
        p.style.top  = startY + 'px';

        const xDiff    = (Math.random() - 0.5) * 110;
        const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);

        p.style.setProperty('--x-diff', `${xDiff}px`);
        p.style.setProperty('--rot',    `${rotation}deg`);
        p.style.animation = `${isGain ? 'coin-fly-up' : 'coin-fly-down'} 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s forwards`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

/* =====================================================
   STOCK-LEER-INDIKATOR
===================================================== */

/**
 * Zeigt das leere-Symbol am Stock-Pile wenn Stock leer
 * aber Waste noch Karten hat (Reset möglich).
 */
function updateStockEmpty() {
    const stockPile = document.getElementById('stock-pile');
    const wastePile = document.getElementById('waste-pile');
    if (!stockPile || !wastePile) return;

    const isStockEmpty  = stockPile.children.length === 0;
    const wasteHasCards = wastePile.children.length > 0;

    if (isStockEmpty && wasteHasCards) {
        stockPile.classList.add('empty');
        stockPile.style.cursor = 'pointer';
    } else if (!isStockEmpty) {
        stockPile.classList.remove('empty');
        stockPile.style.cursor = 'pointer';
    } else {
        stockPile.classList.remove('empty');
        stockPile.style.cursor = 'default';
    }
}

/* =====================================================
   WERT-ANIMATION
===================================================== */

/**
 * Animiert ein Zahlen-Element von seinem aktuellen Wert
 * zum Zielwert mit Roll-Up-Effekt.
 * @param {string} id       - Element-ID
 * @param {number} newValue - Zielwert
 */
function animateValue(id, newValue) {
    const displayEl = document.getElementById(id);
    if (!displayEl || displayEl.innerText == newValue) return;

    const wrapper = displayEl.parentElement;
    displayEl.classList.remove('roll-up');
    displayEl.classList.add('old-value-exit');
    setTimeout(() => displayEl.remove(), 400);

    const newNode     = document.createElement('span');
    newNode.id        = id;
    newNode.className = 'streak-value roll-up';
    newNode.innerText = newValue;
    wrapper.appendChild(newNode);
}

/* =====================================================
   WIN-PANEL SCORE-ZEILEN-ANIMATION
===================================================== */

/**
 * Animiert Score-Zeilen im Win-Panel sequenziell ein.
 * Jede Zeile erscheint mit Verzögerung, Total zählt hoch.
 */
function animateScoreRows() {
    const rows  = document.querySelectorAll('.score-list .row');
    const total = document.querySelector('.score-list .total');

    rows.forEach((row, index) => {
        setTimeout(() => row.classList.add('show'), index * 140);
    });

    if (total) {
        const totalValueEl = total.querySelector('.value');
        const finalTotal   = parseInt(totalValueEl?.dataset.value ?? '0');

        setTimeout(() => {
            total.classList.add('show');
            _countUp(totalValueEl, 0, finalTotal, 900);
        }, rows.length * 140 + 150);
    }
}

/**
 * Zählt ein Element von start auf end hoch.
 * Nur intern von animateScoreRows() genutzt.
 * @param {HTMLElement} el
 * @param {number}      start
 * @param {number}      end
 * @param {number}      [duration=300]
 */
function _countUp(el, start, end, duration = 300) {
    if (!el) return;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        el.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = end.toLocaleString();
    }

    requestAnimationFrame(step);
}
