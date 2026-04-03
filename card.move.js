/* =====================================================
   CARD MOVE
   Verantwortlich für: Spieler-Züge (Klick, Drag & Drop),
   Move-Pipeline als SSOT (onPlayerMove → commitMove → score).
   Abhängigkeiten: card.utils.js, card.animate.js
===================================================== */

/* =====================================================
   MOVE-PIPELINE (SSOT)
   Reihenfolge: onPlayerMove → [physische Bewegung] → commitMove
===================================================== */

/**
 * Muss VOR jeder physischen Kartenbewegung aufgerufen werden.
 * Sichert den State, erhöht den Zug-Zähler und plant den nächsten Hint.
 *
 * @param {HTMLElement|null} movedCard
 * @param {HTMLElement|null} sourceParent
 */
function onPlayerMove(movedCard = null, sourceParent = null) {
    if (gameState.is(GameStates.PAUSIERT)) return;

    triggerGameStart();

    if (gameState.is(GameStates.DEMO) || gameState.is(GameStates.RECORDING)) return;

    clearHints();

    // 1. State sichern (vor dem Zug)
    pushState();

    // 2. Zug-Zähler erhöhen
    moves++;
    const moveEl = document.getElementById('moves-count');
    if (moveEl) moveEl.innerText = moves;

    // 3. Letzten Zug merken (für Hint-System)
    if (movedCard && sourceParent) {
        lastUserMove = {
            cardId: movedCard.dataset.cardId,
            fromId: sourceParent.id || sourceParent.dataset.colIndex,
        };
    }

    setTimeout(scheduleNextHint, 300);
}

/**
 * SSOT für alle Move-Abschlüsse: Recording, Scoring, Combo.
 * Wird von executeMoveToFoundation und executeMoveToTableau aufgerufen.
 * Ersetzt den duplizierten afterPlayerMove + applyMoveScore Block.
 *
 * @param {HTMLElement} movedCard
 * @param {HTMLElement} sourceParent
 * @param {HTMLElement} target
 * @param {'FOUNDATION'|'TABLEAU'} moveType
 */
function commitMove(movedCard, sourceParent, target, moveType) {
    afterPlayerMove(movedCard, sourceParent, target);
    applyMoveScore(movedCard, sourceParent, target);

    if (moveType === 'FOUNDATION') {
        processCombo('FOUNDATION');
    }
}

/**
 * Internes Recording + Dev-Logging nach einem Zug.
 * @param {HTMLElement}      movedCard
 * @param {HTMLElement}      sourceParent
 * @param {HTMLElement|null} target
 */
function afterPlayerMove(movedCard, sourceParent, target = null) {
    if (!movedCard || !sourceParent) return;

    let resolvedTarget = target || movedCard.parentElement;
    if (resolvedTarget && !resolvedTarget.id && !resolvedTarget.dataset.colIndex) {
        resolvedTarget = resolvedTarget.closest('.column, .foundation, .slot, #waste-pile');
    }

    if (!gameState.is(GameStates.DEMO) && IS_DEV_MODE) {
        recordStep('M', movedCard, sourceParent, resolvedTarget);
    }
}

/* =====================================================
   DRAG & DROP
===================================================== */

/**
 * Drop-Handler für alle Spalten und Foundation-Felder.
 * Delegiert die eigentliche Bewegung an die passende execute*-Funktion.
 * @param {DragEvent} e
 */
function handleDrop(e) {
    e.preventDefault();
    if (!canAct()) return;

    const target = e.currentTarget;
    const cardId = e.dataTransfer.getData('text');
    const card   = document.querySelector(`[data-card-id="${cardId}"]`);

    if (!card || !validateMove(card, target)) return;

    // Z-Index-Boost während der Bewegung
    card.classList.add('on-top');

    // Foundation-Schutz: Karten die gerade aus der Foundation gezogen wurden,
    // sollen nicht sofort automatisch zurückgelegt werden.
    if (card.parentElement?.classList.contains('foundation')) {
        card.dataset.tempIgnoreAuto = 'true';
        card.classList.add('protected');
        setTimeout(() => {
            delete card.dataset.tempIgnoreAuto;
            card.classList.remove('protected');
        }, 2500);
    }

    const sourceParent = card.parentElement;
    onPlayerMove(card, sourceParent);

    if (target.classList.contains('foundation')) {
        executeMoveToFoundation(card, target, sourceParent);
    } else {
        executeMoveToTableau(getCardStack(card), target, sourceParent);
    }

    setTimeout(() => card.classList.remove('on-top'), 50);
    runAutoLogic();
}

/* =====================================================
   KLICK-BEWEGUNG
===================================================== */

/**
 * Verarbeitet einen Klick (oder Doppelklick) auf eine Karte.
 * Prüft Foundation (Prio 1) dann Tableau (Prio 2).
 * Visuelles Feedback (shakeCard) wenn kein Zug möglich.
 * @param {MouseEvent} e
 */
function handleMoveLogic(e) {
    if (!canAct()) return;

    const card = e.currentTarget;
    if (card.classList.contains('back')) return;

    // Quelle Foundation: Karten müssen gezogen (Drag) werden
    if (card.parentElement?.classList.contains('foundation')) {
        shakeCard(card);
        return;
    }

    // Priorität 1: Foundation
    const fTarget = document.getElementById(`f-${card.dataset.suit}`);
    if (fTarget && validateMove(card, fTarget)) {
        const sourceParent = card.parentElement;
        onPlayerMove(card, sourceParent);
        executeMoveToFoundation(card, fTarget, sourceParent);
        return;
    }

    // Priorität 2: Tableau – erste legale Spalte
    const columns = document.querySelectorAll('.column');
    for (const col of columns) {
        if (card.parentElement === col) continue; // Eigene Spalte überspringen

        if (validateMove(card, col)) {
            const sourceParent = card.parentElement;
            onPlayerMove(card, sourceParent);
            executeMoveToTableau(getCardStack(card), col, sourceParent);
            return;
        }
    }

    // Kein legaler Zug gefunden
    shakeCard(card);
}
