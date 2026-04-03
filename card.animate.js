/* =====================================================
   CARD ANIMATIONS
   Verantwortlich für: visuelle Übergänge (Flip, Foundation, Tableau).
   Weiß nichts über Spielregeln oder Scoring —
   nur wann und wie sich Karten bewegen.
   Abhängigkeiten: card.utils.js, card.creation.js
===================================================== */

/* =====================================================
   FLIP
===================================================== */

/**
 * Dreht eine verdeckte Karte mit Animation um.
 * Scoring und State-Sicherung werden hier ausgelöst,
 * weil flip ein atomarer Spielerzug ist.
 * @param {HTMLElement} card
 */
function flipCard(card) {
    if (!canAct()) return;

    pushState();
    isAnimating = true;

    // Hint-Highlights entfernen
    document.querySelectorAll('.hint-highlight, .hint-source-highlight, .hint-target-highlight')
        .forEach(el => el.classList.remove(
            'hint-highlight', 'hint-source-highlight', 'hint-target-highlight'
        ));

    card.classList.add('flip-animate');
    recordStep('F', card, card.parentElement);

    // Hälfte der Animation: Karte umdrehen
    setTimeout(() => {
        requestAnimationFrame(() => applyCardFront(card, cardElToData(card)));
    }, 200);

    // Ende der Animation: Zustand freigeben
    setTimeout(() => {
        card.classList.remove('flip-animate');
        setTimeout(() => {
            isAnimating = false;
            runAutoLogic?.();
        }, 50);
    }, 450);

    // Scoring (parallel zur Animation)
    setTimeout(() => {
        if (!gameState.is(GameStates.DEMO)) {
            const actionPoints = getScoreValue(PointType.ACTION, ACTION.FLIP_CARD);
            updateScore(actionPoints);
            logMoveSteps(`FLIP_CARD [${actionPoints}]`);
            processCombo('FLIP');
        }
    }, 200);
}

/* =====================================================
   FOUNDATION-ANIMATION
===================================================== */

/**
 * Verschiebt eine Karte mit FLIP-RSVP-Animation zur Foundation.
 * Scoring und Recording übernimmt card.move.js via commitMove().
 *
 * @param {HTMLElement} card
 * @param {HTMLElement} target      - Foundation-Container
 * @param {HTMLElement} sourceParent
 */
function executeMoveToFoundation(card, target, sourceParent) {
    if (!card || !target || isAnimating) return;
    isAnimating = true;

    const startRect = card.getBoundingClientRect();

    // Physische Verschiebung sofort
    card.style.top  = '0px';
    card.style.left = '0px';
    target.appendChild(card);

    // Move-Pipeline (Recording + Scoring)
    commitMove(card, sourceParent, target, 'FOUNDATION');

    // Animations-Startposition berechnen (nach appendChild, da sich das Layout geändert hat)
    const targetRect = target.getBoundingClientRect();
    const deltaX = startRect.left - targetRect.left;
    const deltaY = startRect.top  - targetRect.top;

    card.classList.add('moving');
    card.style.transition = 'none';
    card.style.transform  = `translate(${deltaX}px, ${deltaY}px)`;

    void card.offsetHeight; // Reflow

    card.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    card.style.transform  = 'translate(0,0)';

    setTimeout(() => finishAnimation([card]), 600);
}

/* =====================================================
   TABLEAU-ANIMATION
===================================================== */

/**
 * Verschiebt einen Kartenstapel mit Slide-Animation ins Tableau.
 * Scoring und Recording übernimmt card.move.js via commitMove().
 *
 * @param {HTMLElement[]} stack      - Zu bewegender Stapel (unterste Karte zuerst)
 * @param {HTMLElement}   col        - Ziel-Spalte
 * @param {HTMLElement}   sourceParent
 */
function executeMoveToTableau(stack, col, sourceParent) {
    if (!canAct()) return;
    isAnimating = true;

    // Startpositionen vor dem Verschieben merken
    const startRects = stack.map(c => c.getBoundingClientRect());
    let nextTopIndex = col.children.length;

    // Move-Pipeline (Recording + Scoring) vor dem DOM-Update
    commitMove(stack[0], sourceParent, col, 'TABLEAU');

    // Physisch verschieben
    stack.forEach(c => {
        c.style.top = (nextTopIndex * cardDistance) + 'px';
        col.appendChild(c);
        nextTopIndex++;
    });

    // Delta zwischen alter und neuer Position berechnen
    stack.forEach((c, i) => {
        const targetRect = c.getBoundingClientRect();
        const deltaX = startRects[i].left - targetRect.left;
        const deltaY = startRects[i].top  - targetRect.top;
        c.style.transition = 'none';
        c.style.transform  = `translate(${deltaX}px, ${deltaY}px)`;
        c.classList.add('moving');
    });

    void stack[0].offsetHeight; // Reflow

    stack.forEach(c => {
        c.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        c.style.transform  = 'translate(0,0)';
    });

    setTimeout(() => finishAnimation(stack), 600);
}
