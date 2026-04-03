/* =====================================================
   GAME INIT
   Verantwortlich für: Spielstart-Flow, neues Spiel,
   Neustart, Replay, Deck-Rekonstruktion.
   Nutzt cardToId() + cardIdToObj() aus deck.utils.js (SSOT) —
   ersetzt 4 lokale suitMap-Kopien und inline Suit-Konvertierungen.
   Abhängigkeiten: game.state.js, game.reset.js,
                   deck.utils.js, deck.generator.js, deck.manager.js
===================================================== */

let instantPlay  = false;
let isReplayMode = false;

/* =====================================================
   HAUPTFLOW (SSOT)
===================================================== */

/**
 * Vereinheitlichter Spielstart-Flow.
 * Wird von newGame(), restartGame() und replayGame() aufgerufen.
 * Reihenfolge ist bewusst — nicht umstellen ohne Seiteneffekte zu prüfen.
 *
 * @param {Object[]} deck - Vollständiges 52-Karten-Array (Objekte)
 */
function initGameFlow(deck) {
    // 0. Alles zurücksetzen
    resetGame();

    // 1. Deck-Key setzen (SSOT: getDeckKey aus deck.utils.js)
    //    Ersetzt: deck.map(c => `${c.suit[0].toUpperCase()}-${c.value}`).join('|')
    kts.game.currentDeckKey = getDeckKey(deck);

    // 2. Globale Referenzen setzen (KOPIE — Original bleibt für Replay intakt)
    currentInitialDeck  = deck.map(cardToId);   // SSOT: cardToId aus deck.utils.js
    currentDeckObjects  = [...deck];

    // 3. Spiel registrieren (setzt activeGameInProgress = true)
    registerGameStart(deck);

    // 4. UI-Elemente aktualisieren
    updateStatsInfoBar(deck, kts.game.currentDeckName);
    refreshLeftBar('deck');
    hintUI.setVisibility(kts.cfg.showHintBulb);

    // 5. Austeilen (Kopie übergeben — deck.pop() leert das Array)
    if (instantPlay) {
        const tempDeck = [...deck];
        createTableauColumns(tempDeck);
        stock = tempDeck; // Restliche 24 Karten landen im Stock

        gameState.set(GameStates.GESTARTET);
        runAutoLogic();
    } else {
        startDealingAnimation([...deck]);
    }

    // 6. Startnachricht
    _showStartMessage();

    // 7. UI einblenden
    document.getElementById('status-bar')?.style.setProperty('display', 'grid');
    document.getElementById('info-bars')?.style.setProperty('display', 'flex');

    // Start-Overlays entfernen (z.B. nach Tab-Reload)
    document.getElementById('start-overlay')?.classList.add('hidden');
    document.getElementById('start-screen-overlay')?.classList.add('hidden');

    // WICHTIG: State setzen + Interaktion freigeben auch vor RUNNING
    gameState.set(GameStates.GESTARTET);
    enableInteraction();
}

/* =====================================================
   NEUES SPIEL
===================================================== */

/**
 * Startet ein komplett neues Spiel.
 * Prüft zuerst ob ein Deck in den Settings gepinnt ist.
 * @param {string} [source] - 'deck-generated' | 'deck-hardcoded'
 */
function newGame(source = kts.cfg.deckSource) {
    isReplayMode = false;

    const pinnedId = kts.cfg.pinnedDeckId;

    // Gepinntes Deck hat Priorität
    if (pinnedId && pinnedId !== 'none' && kts.stats.decks[pinnedId]) {
        console.log(`%c📌 Lade gepinntes Deck: ${kts.stats.decks[pinnedId].label || 'Spezial-Deck'}`, 'color: #ffca28; font-weight: bold;');
        isReplayMode              = true; // Replay-Banner anzeigen
        kts.game.currentDeckName  = kts.stats.decks[pinnedId].label || 'Gepinntes Deck';
        currentDeckObjects        = reconstructDeckFromId(pinnedId);
    } else {
        const deckData            = (source === 'deck-generated') ? generateSolvableDeck() : generateHardcodedDeck();
        kts.game.currentDeckName  = deckData.identifier;
        currentDeckObjects        = [...deckData.deck];
    }

    initGameFlow(currentDeckObjects);
}

/* =====================================================
   NEUSTART (gleiches Deck)
===================================================== */

/**
 * Startet das aktuelle Deck neu.
 * Wenn presetDeck übergeben wird (z.B. aus replayGame),
 * wird dieses Deck anstelle des gespeicherten genutzt.
 * @param {Object[]|null} [presetDeck]
 */
function restartGame(presetDeck = null) {
    const workingDeck = presetDeck ? [...presetDeck] : [...currentDeckObjects];

    if (presetDeck) {
        kts.game.currentDeckName = getActiveDeckName(workingDeck);
    }

    currentDeckObjects = [...workingDeck];

    // activeGameInProgress zurücksetzen damit registerGameStart() greift
    kts.game.activeGameInProgress = false;

    initGameFlow(workingDeck);
}

/* =====================================================
   REPLAY (Deck aus Scoreboard)
===================================================== */

/**
 * Startet ein gespeichertes Deck aus dem Scoreboard neu.
 * @param {string} deckId - Deck-Key aus kts.stats.decks
 */
function replayGame(deckId) {
    isReplayMode = true;

    const deckData = kts.stats.decks[deckId];
    kts.game.currentDeckName = deckData?.label || 'Replay Deck';

    // Scoreboard schließen
    const overlay = document.getElementById('scoreboard-overlay');
    if (overlay?.classList.contains('open')) toggleScoreboard();

    restartGame(reconstructDeckFromId(deckId));
}

/* =====================================================
   DECK-HILFSFUNKTIONEN
===================================================== */

/**
 * Rekonstruiert ein Karten-Objekt-Array aus einem Deck-Key-String.
 * SSOT: Nutzt cardIdToObj() aus deck.utils.js —
 * ersetzt 4 lokale suitMap-Definitionen (gameInit, deckGenerator,
 * deckManager, card.creation).
 * @param {string} deckId - z.B. 'H-A|S-10|D-K|…'
 * @returns {Object[]}
 */
function reconstructDeckFromId(deckId) {
    return deckId.split('|').map(cardId => {
        const obj = cardIdToObj(cardId); // SSOT aus deck.utils.js
        if (!obj) console.warn(`[reconstructDeckFromId] Unbekannte Karten-ID: "${cardId}"`);
        return obj;
    }).filter(Boolean);
}

/**
 * Ermittelt den Anzeigenamen für das aktive Deck.
 * Priorität: expliziter Name > Stats-Label > Fallback nach Quelle.
 * @param {Object[]}    deck
 * @param {string|null} [explicitIdentifier]
 * @returns {string}
 */
function getActiveDeckName(deck, explicitIdentifier = null) {
    if (explicitIdentifier) return explicitIdentifier;

    const stats = kts.stats?.decks?.[getDeckKey(deck)];
    if (stats?.label) return stats.label;

    return kts.cfg.deckSource === 'deck-generated' ? 'Zufälliges Deck' : 'Standard Deck';
}

/* =====================================================
   INTERNE HILFSFUNKTIONEN
===================================================== */

/**
 * Zeigt die kontextabhängige Startnachricht.
 * Replay, erster Zug, oder Streak-Teaser.
 */
function _showStartMessage() {
    if (isReplayMode) {
        showGameMsg('REPLAY GESTARTET');
        console.log('%c🎮 Replay gestartet.', 'color: #00d5ff;');
        return;
    }

    // Hinweis: if (kts.game.winStreak = 0) würde den Wert auf 0 setzen!
    // Immer === verwenden.
    if (kts.game.winStreak === 0) {
        showGameMsg(`Los geht's ${kts.game.player.name}!`);
    } else {
        const bonusChance = kts.game.winStreak * 50;
        showGameMsg(`Sichere dir ${bonusChance} extra Punkte!`);
    }
}
