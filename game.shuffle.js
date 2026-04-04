/* =====================================================
   GAME SHUFFLE RESCUE
   Verantwortlich für: Notfall-Mischen verdeckter
   Tableau-Karten wenn kein Zug mehr möglich ist.
   Abhängigkeiten: app_core.js (validateMove, stock,
   cardDistance), scoring_system.js, game_messages.js,
   card_utils.js, card_creation.js
===================================================== */

/**
 * Mischt alle verdeckten Tableau-Karten neu und verteilt
 * sie an Ort und Stelle. Verhängt eine Strafe ab dem
 * ersten Einsatz.
 * Wird von handleGameOverAction() und dem Shuffle-Button
 * aufgerufen.
 */
function shuffleRescue() {
    if (!gameState.is(GameStates.RUNNING) && !gameState.is(GameStates.PAUSIERT)) return;

    pushState();
    shuffleCount++;

    const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.SHUFFLE_RESCUE);
    updateScore(penaltyPoints);
    triggerGameMsg(PENALTY.SHUFFLE_RESCUE, penaltyPoints);
    logExtraPoints?.(`SHUFFLE_RESCUE [${penaltyPoints}]`);

    // Strategie wählen je nach Spielsituation
    if (_canRescueByRecycling()) {
        _rescueByRecycling();
    } else if (_canRescueByTableauShuffle()) {
        _rescueByTableauShuffle();
    } else {
        _rescueByFullRedeal();
    }

    ignoreStalemate = false;
    runAutoLogic();
}

/**
 * Prüft ob Karten vom Waste/Stock zurückgemischt werden können.
 * Sinnvoll wenn Stock & Waste Karten haben, aber keine Züge möglich sind.
 */
function _canRescueByRecycling() {
    const wastePile = document.getElementById('waste-pile');
    const stockPile = document.getElementById('stock-pile');
    const wasteCount = wastePile?.children.length || 0;
    // Karten im Stock-Array (nicht DOM) + Waste
    return stock.length + wasteCount >= 5;
}

/**
 * Mischt alle Stock- und Waste-Karten neu durch und legt sie
 * als neuen Stock bereit. Verdeckte Tableau-Karten bleiben.
 */
function _rescueByRecycling() {
    const wastePile = document.getElementById('waste-pile');
    const stockPile = document.getElementById('stock-pile');

    // Waste-Karten als Objekte sammeln
    const wasteCards = Array.from(wastePile.children).map(el => cardElToData(el));

    // Alles zusammenwerfen: bestehender Stock + Waste
    let pool = [...stock, ...wasteCards];

    // Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // DOM bereinigen
    wastePile.innerHTML = '';
    stockPile.innerHTML = '';
    stockPile.classList.remove('empty');

    // Neuen Stock aufbauen
    stock = pool;

    // Karten im Stock-DOM anlegen (verdeckt)
    const backDesign = kts.cfg.designBack;
    pool.forEach(cardData => {
        const cardEl = createCardElement(cardData, true);
        applyCardBack(cardEl, cardData);
        stockPile.appendChild(cardEl);
    });

    updateStackVisuals('stock-pile');
    updateStackVisuals('waste-pile');
    updateStockEmpty?.();

    triggerGameMsg('Stock neu gemischt!');
}

/**
 * Prüft ob verdeckte Tableau-Karten vorhanden sind zum Tauschen.
 */
function _canRescueByTableauShuffle() {
    return document.querySelectorAll('.column .card.back').length > 0;
}

/**
 * Verbesserter Tableau-Shuffle: Tauscht verdeckte Karten so,
 * dass möglichst viele sinnvolle Züge entstehen.
 */
function _rescueByTableauShuffle() {
    const hiddenCards = Array.from(document.querySelectorAll('.column .card.back'));
    const cardDataList = hiddenCards.map(c => cardElToData(c));

    // Sortierung: Karten die gut auf offene Tableau-Karten passen nach vorne
    const openTops = Array.from(document.querySelectorAll('.column .card:last-child:not(.back)'))
        .map(c => ({ value: c.dataset.value, color: c.dataset.color }));

    // Versuche nützliche Karten nach oben zu bringen (letzte Position = oberste Karte)
    cardDataList.sort((a, b) => {
        const aUseful = _isUsefulCard(a, openTops) ? 1 : 0;
        const bUseful = _isUsefulCard(b, openTops) ? 1 : 0;
        return bUseful - aUseful;
    });

    // Leicht randomisieren damit es nicht deterministisch ist
    _softShuffle(cardDataList);

    hiddenCards.forEach((cardEl, idx) => {
        const newData = cardDataList[idx];
        cardEl.dataset.cardId = cardToId(newData);
        cardEl.dataset.value = newData.value;
        cardEl.dataset.suit = newData.suit;
        cardEl.dataset.color = newData.color;
        cardEl.dataset.symbol = newData.symbol;
        applyCardBack(cardEl, newData);
    });
}

/**
 * Letzter Ausweg: Alle Karten außer Foundation zurück in den Stock.
 * Wird nur beim 3. Shuffle-Einsatz ausgeführt.
 */
function _rescueByFullRedeal() {
    const wastePile = document.getElementById('waste-pile');
    const stockPile = document.getElementById('stock-pile');
    let pool = [...stock];

    // Waste einsammeln
    Array.from(wastePile.children).forEach(el => {
        pool.push(cardElToData(el));
    });
    wastePile.innerHTML = '';

    // Verdeckte Tableau-Karten einsammeln
    document.querySelectorAll('.column .card.back').forEach(el => {
        pool.push(cardElToData(el));
        el.remove();
    });

    // Offene Tableau-Karten nachrücken lassen
    document.querySelectorAll('.column').forEach(col => {
        const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
        visible.forEach((card, index) => {
            card.style.top = (index * cardDistance) + 'px';
        });
    });

    // Pool mischen
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Als neuen Stock setzen
    stock = pool;
    stockPile.innerHTML = '';
    stockPile.classList.remove('empty');

    const backDesign = kts.cfg.designBack;
    pool.forEach(cardData => {
        const cardEl = createCardElement(cardData, true);
        applyCardBack(cardEl, cardData);
        stockPile.appendChild(cardEl);
    });

    updateStackVisuals('stock-pile');
    updateStockEmpty?.();
    triggerGameMsg('Notfall-Umverteilung!');
}

/** Prüft ob eine Karte sinnvoll auf eine der offenen Spalten-Tops gelegt werden könnte */
function _isUsefulCard(card, openTops) {
    const v = valMap[card.value];
    return openTops.some(top => {
        const tv = valMap[top.value];
        return top.color !== card.color && tv === v + 1;
    });
}

/** Leichtes Mischen — behält nützliche Karten grob vorne, bringt aber Zufall rein */
function _softShuffle(arr) {
    // Nur die hinteren 60% mischen
    const start = Math.floor(arr.length * 0.4);
    for (let i = arr.length - 1; i > start; i--) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
