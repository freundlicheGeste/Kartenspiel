/* =====================================================
   GAME OVER
   Verantwortlich für: Stillstand erkennen (canMakeAnyMove),
   Game-Over-Aktionen verarbeiten (handleGameOverAction).
   Abhängigkeiten: game.state.js, game.pause.js
===================================================== */

/* =====================================================
   AKTIONS-HANDLER
===================================================== */

/**
 * Verarbeitet die Auswahl des Spielers im Game-Over-Dialog.
 * @param {'ignore'|'new'|'restart'|'shuffle'|'undo'} action
 */
function handleGameOverAction(action) {
    switch (action) {
        case 'ignore':
            ignoreStalemate = true;
            resumeGame();
            break;

        case 'new':
            ignoreStalemate = false;
            newGame();
            break;

        case 'restart':
            ignoreStalemate = false;
            restartGame();
            break;

        case 'shuffle':
            ignoreStalemate = false;
            shuffleRescue();
            resumeGame();
            break;

        case 'undo':
            ignoreStalemate = false;
            undoLastMove();
            resumeGame();
            break;

        default:
            console.warn('[handleGameOverAction] Unbekannte Aktion:', action);
            gameState.set(GameStates.BEENDET);
            break;
    }
}

/* =====================================================
   STILLSTAND-ERKENNUNG
===================================================== */

/**
 * Prüft ob noch irgendein legaler Zug möglich ist.
 * Gibt true zurück sobald ein einziger Zug gefunden wird (early exit).
 *
 * Prüfreihenfolge:
 *  1. Verdeckte Karte oben in einer Spalte → kann umgedreht werden
 *  2. Stock/Waste-Karten → legal auf Spalte oder Foundation legbar
 *  3. Offene Tableau-Karten → prüft ob Zug echten Fortschritt bringt
 *     (Foundation, verdeckte Karte freilegen, König in leere Spalte)
 *
 * @returns {boolean}
 */
function canMakeAnyMove() {
    const stockPile   = document.getElementById('stock-pile');
    const wastePile   = document.getElementById('waste-pile');
    const columns     = Array.from(document.querySelectorAll('.column'));
    const foundations = Array.from(document.querySelectorAll('.foundation'));
    const allTargets  = [...columns, ...foundations];

    // 1. Verdeckte Karte oben → kann umgedreht werden
    for (const col of columns) {
        if (col.lastElementChild?.classList.contains('back')) return true;
    }

    // 2. Stock & Waste → irgendwo legal legbar
    const loopCards = [
        ...Array.from(wastePile.children),
        ...Array.from(stockPile.children),
    ];
    for (const card of loopCards) {
        for (const target of allTargets) {
            if (validateMove(card, target)) return true;
        }
    }

    // 3. Offene Tableau-Karten → nur sinnvolle Züge zählen
    const tableauCards = Array.from(document.querySelectorAll('.column .card:not(.back)'));

    for (const card of tableauCards) {
        const colChildren = Array.from(card.parentElement.children);
        const cardIndex   = colChildren.indexOf(card);
        const cardBelow   = cardIndex > 0 ? colChildren[cardIndex - 1] : null;

        for (const target of allTargets) {
            if (card.parentElement === target) continue;
            if (!validateMove(card, target)) continue;

            // Foundation-Zug ist immer Fortschritt
            if (target.classList.contains('foundation')) return true;

            if (target.classList.contains('column')) {
                // Deckt eine verdeckte Karte auf
                if (cardBelow?.classList.contains('back')) return true;

                // Leert eine Spalte → nur wenn ein König bereitsteht
                if (cardIndex === 0 && _kingIsAvailable()) return true;

                // König zieht in leere Spalte und war nicht allein
                if (card.dataset.value === 'K' && target.children.length === 0 && cardIndex > 0) return true;

                // Legt eine Foundation-bereite Karte frei
                if (cardBelow && !cardBelow.classList.contains('back')) {
                    for (const f of foundations) {
                        if (validateMove(cardBelow, f)) return true;
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Prüft ob irgendwo im Spiel ein König verfügbar ist,
 * der in eine leere Spalte gezogen werden könnte.
 * Extrahiert aus canMakeAnyMove() um Lesbarkeit zu verbessern.
 * @returns {boolean}
 */
function _kingIsAvailable() {
    // König auf dem Tableau (nicht bereits ganz unten)
    const kingOnBoard = Array.from(document.querySelectorAll('.column .card:not(.back)'))
        .some(k => k.dataset.value === 'K' &&
                   Array.from(k.parentElement.children).indexOf(k) > 0);

    if (kingOnBoard) return true;

    // König im Waste oder Stock
    return (
        Array.from(document.getElementById('waste-pile').querySelectorAll('.card'))
            .some(k => k.dataset.value === 'K') ||
        Array.from(document.getElementById('stock-pile').querySelectorAll('.card'))
            .some(k => k.dataset.value === 'K')
    );
}
