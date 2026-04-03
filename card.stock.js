/* =====================================================
   CARD STOCK
   Verantwortlich für: Stock ↔ Waste Zyklus.
   Einzige Datei, die das stock-Array besitzt und mutiert.
   Abhängigkeiten: card.utils.js, card.creation.js
===================================================== */

let stockResetCount = 0;

/* =====================================================
   STOCK → WASTE
===================================================== */

/**
 * Deckt die oberste Karte des Stock-Stapels auf und legt sie auf den Waste.
 * Löst resetStockFromWaste() aus wenn der Stock leer ist.
 */
function revealNextStockCard() {
    if (!canAct()) return;

    if (stock.length === 0) {
        resetStockFromWaste();
        return;
    }

    const stockPile = document.getElementById('stock-pile');
    const wastePile = document.getElementById('waste-pile');
    const cardEl    = stockPile.lastElementChild;
    if (!cardEl) return;

    recordStep('S');
    logMoveSteps('STOCK_TO_WASTE [0]');
    onPlayerMove();

    isAnimating = true;

    // Delta für die Flip-Animation berechnen
    const stockRect = stockPile.getBoundingClientRect();
    const wasteRect = wastePile.getBoundingClientRect();
    const deltaX    = wasteRect.left - stockRect.left;
    const deltaY    = wasteRect.top  - stockRect.top;

    const cardData = stock.pop();

    // Karte optisch zur Vorderseite wechseln (SSOT via applyCardFront)
    applyCardFront(cardEl, cardData);

    // Slide-Animation
    cardEl.style.opacity    = '1';
    cardEl.style.filter     = 'none';
    cardEl.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.1s ease-out';
    cardEl.style.transform  = `translate(${deltaX}px, ${deltaY}px)`;

    setTimeout(() => {
        cardEl.style.transition = 'none';
        cardEl.style.transform  = '';

        wastePile.appendChild(cardEl);
        if (stock.length === 0) stockPile.classList.add('empty');

        isAnimating = false;
        updateStackVisuals('stock-pile');
        updateStackVisuals('waste-pile');
        runAutoLogic();
    }, 400);

    updateStockEmpty();
}

/* =====================================================
   WASTE → STOCK (Reset)
===================================================== */

/**
 * Dreht den kompletten Waste-Stapel zurück in den Stock.
 * Zählt Resets und verhängt Strafpunkte ab dem 3. Reset.
 */
function resetStockFromWaste() {
    const wastePile  = document.getElementById('waste-pile');
    const stockPile  = document.getElementById('stock-pile');
    const wasteCards = Array.from(wastePile.children).reverse();

    if (wasteCards.length === 0 || isAnimating) return;

    recordStep('R');
    pushState();
    isAnimating = true;

    // stock-Array komplett neu aufbauen (SSOT: cardElToData)
    stock = [];

    if (!gameState.is(GameStates.DEMO)) {
        stockResetCount++;
        if (stockResetCount >= 3) {
            const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.STOCK_RESET);
            updateScore(penaltyPoints);
            triggerGameMsg(PENALTY.STOCK_RESET, penaltyPoints);
            logExtraPoints(`STOCK_RESET [${penaltyPoints}]`);
        } else {
            logExtraPoints(`STOCK_RESET [${stockResetCount}]`);
        }
    }

    wasteCards.forEach((cardEl, index) => {
        setTimeout(() => {
            // 1. Daten aus DOM lesen (SSOT: cardElToData)
            stock.push(cardElToData(cardEl));

            // 2. Optik zurücksetzen (SSOT: applyCardBack)
            applyCardBack(cardEl, cardElToData(cardEl));
            cardEl.classList.remove('stock-dealing-animation');
            stockPile.appendChild(cardEl);

            if (index === wasteCards.length - 1) {
                stockPile.classList.remove('empty');
                isAnimating = false;
                updateStackVisuals('stock-pile');
                updateStackVisuals('waste-pile');
            }
        }, index * 20);
    });

    updateStockEmpty();
}
