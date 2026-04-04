/* =====================================================
   CARD UTILS
   Reine Hilfsfunktionen – kein DOM-State, keine Seiteneffekte.
   Darf von allen anderen card.*.js importiert/genutzt werden.
===================================================== */

/* ---- Guard ---------------------------------------- */

/**
 * Zentrale Prüfung ob eine Spieleraktion erlaubt ist.
 * Ersetzt den wiederholten if (gameState.is(PAUSIERT) || isAnimating) Guard.
 */
function canAct() {
    return !gameState.is(GameStates.PAUSIERT) && !isAnimating;
}

/* ---- Design-Klassen (SSOT) ------------------------ */

/**
 * Setzt eine Karte auf ihr Rückseiten-Design zurück.
 * Einzige Stelle, an der designBack gesetzt wird.
 * @param {HTMLElement} el
 * @param {Object} cardData - { color } – wird gebraucht um die Farbklasse zu erhalten
 */
function applyCardBack(el, cardData) {
    el.className = `card ${cardData.color} back ${kts.cfg.designBack}`;
    el.innerHTML = '';
    el.style.animationDelay = '';
    el.style.transform = '';
}

/**
 * Wandelt eine Rückseite in eine sichtbare Vorderseite um.
 * Einzige Stelle, an der designFront gesetzt und setCardFace aufgerufen wird.
 * @param {HTMLElement} el
 * @param {Object} cardData - { color, suit, symbol, value }
 */
function applyCardFront(el, cardData) {
    if (kts.cfg.designBack?.trim()) el.classList.remove(kts.cfg.designBack);
    el.classList.remove('back');
    if (kts.cfg.designFront?.trim()) el.classList.add(kts.cfg.designFront);
    el.classList.add(cardData.suit, cardData.color);
    setCardFace(el);
}

/* ---- DOM → Data ----------------------------------- */

/**
 * Liest die card-Datensätze aus einem DOM-Element.
 * Verhindert das wiederholte manuelle Auslesen von dataset.*
 * @param {HTMLElement} el
 * @returns {{ value, color, suit, symbol }}
 */
function cardElToData(el) {
    return {
        value: el.dataset.value,
        color: el.dataset.color,
        suit: el.dataset.suit,
        symbol: el.dataset.symbol,
    };
}

/* ---- Stack-Hilfsfunktionen ------------------------ */

/**
 * Gibt die Karte selbst und alle Karten darunter im selben Container zurück.
 * @param {HTMLElement} card
 * @returns {HTMLElement[]}
 */
function getCardStack(card) {
    const parent = card.parentElement;
    const index = Array.from(parent.children).indexOf(card);
    return Array.from(parent.children).slice(index);
}

/**
 * Verschiebt einen Kartenstapel physisch in einen Ziel-Container.
 * @param {HTMLElement} card   - Unterste Karte des zu bewegenden Stacks
 * @param {HTMLElement} target - Ziel-Container (column | foundation)
 */
function moveStackToTarget(card, target) {
    const stack = getCardStack(card);
    let nextTopIndex = target.children.length;

    stack.forEach(c => {
        if (target.classList.contains('foundation')) {
            c.style.top = '0px';
            c.style.left = '0px';
        } else {
            c.style.top = (nextTopIndex * cardDistance) + 'px';
        }
        target.appendChild(c);
        nextTopIndex++;
    });
}

/* ---- Animation-Cleanup (SSOT) --------------------- */

/**
 * Beendet eine laufende Karten-Animation sauber.
 * Ersetzt den wiederholten Cleanup-Block in den execute*-Funktionen.
 * @param {HTMLElement[]} els - Animierte Elemente
 * @param {Function}      [cb] - Optionaler Callback nach Cleanup
 */
function finishAnimation(els = [], cb) {
    els.forEach(c => {
        c.classList.remove('moving');
        c.style.transform = 'none';
        c.style.transition = '';
    });
    isAnimating = false;
    runAutoLogic?.();
    cb?.();
}

/* ---- Validierung ---------------------------------- */

/**
 * Prüft ob ein Karten-Datensatz vollständig ist.
 * Wirft einen Konsolenfehler bei fehlenden Pflichtfeldern.
 * @param {Object} data
 * @param {string} [context]
 */
function validateCardData(data, context = '') {
    const required = ['value', 'color', 'suit', 'symbol'];
    required.forEach(key => {
        if (!data[key]) {
            console.warn(`[validateCardData${context ? ' @ ' + context : ''}] Fehlende Eigenschaft: "${key}"`, data);
        }
    });
}
