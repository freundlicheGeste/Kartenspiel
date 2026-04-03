/* =====================================================
   CARD CREATION / FLIP
   Verantwortlich für: DOM-Erstellung, visuelle Darstellung.
   Enthält keine Move- oder Spiellogik.
   Abhängigkeiten: card.utils.js
===================================================== */

/**
 * Erstellt ein Karten-DOM-Element vollständig konfiguriert.
 * Event-Handler werden hier registriert, die eigentliche Logik
 * liegt in card.move.js (handleMoveLogic) und card.animate.js (flipCard).
 *
 * @param {Object}  data    - { value, color, suit, symbol }
 * @param {boolean} isBack  - Karte verdeckt anzeigen
 * @param {number}  index   - Stapel-Position (bestimmt top-Offset)
 * @param {boolean} isUndo  - Undo-Animation auslösen
 * @returns {HTMLElement}
 */
function createCardElement(data, isBack = false, index = 0, isUndo = false) {
    validateCardData(data, 'CREATE');

    const card = document.createElement('div');

    // Stabile ID: erster Buchstabe der Farbe (H/D/C/S) + Wert (A, K, 10 …)
    card.dataset.cardId = cardToId(data);
    card.dataset.value = data.value;
    card.dataset.color = data.color;
    card.dataset.suit = data.suit;
    card.dataset.symbol = data.symbol;
    card.style.top = ((index || 0) * cardDistance) + 'px';

    if (isBack) {
        applyCardBack(card, data);
    } else {
        card.className = `card ${data.color} ${kts.cfg.designFront}`;
        card.classList.add(data.suit);
        setCardFace(card);
    }

    _attachCardEvents(card);

    if (isUndo) {
        card.classList.add('card-undo-effect');
        setTimeout(() => card.classList.remove('card-undo-effect'), 350);
    }

    return card;
}

/**
 * Registriert alle Event-Handler an einer Karte.
 * Intern – nicht von außen aufrufen.
 * @param {HTMLElement} card
 */
function _attachCardEvents(card) {
    // Einfachklick: Karte umdrehen ODER bewegen (je nach Konfiguration)
    card.onclick = e => {
        if (!canAct()) return;

        if (card.classList.contains('back')) {
            // Nur die oberste Karte einer Spalte darf umgedreht werden
            if (card.parentElement.classList.contains('column') &&
                card === card.parentElement.lastElementChild) {
                flipCard(card);
            }
            return;
        }

        if (!kts.cfg.smartDblClick) {
            handleMoveLogic(e);
        }
    };

    // Doppelklick: nur wenn smartDblClick aktiv
    if (kts.cfg.smartDblClick) {
        card.ondblclick = handleMoveLogic;
    }

    // Drag & Drop
    card.draggable = true;
    card.ondragstart = e => {
        if (!canAct()) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text', card.dataset.cardId);
    };
}

/* =====================================================
   KARTEN-GESICHT
===================================================== */

/**
 * Setzt den sichtbaren Inhalt einer Karten-Vorderseite.
 * Wird von applyCardFront (card.utils.js) und flipCard (card.animate.js) genutzt.
 * @param {HTMLElement} card
 */
function setCardFace(card) {
    card.innerHTML = `<b>${card.dataset.value}</b><br>${card.dataset.symbol}`;
    card.classList.add(card.dataset.suit, card.dataset.color);
}

/* =====================================================
   UI HELPER
===================================================== */

/**
 * Löst eine kurze Shake-Animation auf einer Karte aus (ungültiger Zug).
 * @param {HTMLElement} card
 */
function shakeCard(card) {
    card.classList.remove('shake');
    void card.offsetWidth; // Reflow erzwingen damit die Animation neu startet
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 300);
}
