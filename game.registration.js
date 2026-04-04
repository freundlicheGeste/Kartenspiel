/* =====================================================
   GAME REGISTRATION
   Verantwortlich für: Spielstart und -ende registrieren,
   Deck-Statistiken schreiben, Globale Stats pflegen.
   Abhängigkeiten: deck.utils.js, game.state.js
===================================================== */

/* =====================================================
   SPIELSTART
===================================================== */

/**
 * Registriert den Beginn einer neuen Runde.
 * Erkennt Tab-Reloads und setzt den winStreak zurück wenn
 * ein Spiel ohne Abschluss abgebrochen wurde.
 * @param {Object[]} deck
 */
function registerGameStart(deck) {
    if (kts.game.activeGameInProgress && kts.game.winStreak !== 0) {
        console.log('⚠️ Tab-Reload oder Spiel-Abbruch erkannt. Win-Streak zurückgesetzt.');
        kts.game.winStreak = 0;
    }

    kts.game.activeGameInProgress = true;
    saveToDisk();
}

/* =====================================================
   SPIELENDE
===================================================== */

/**
 * Registriert das erfolgreiche Spielende und aktualisiert alle Statistiken.
 * Legt ein neues Deck-Profil an falls das Deck zum ersten Mal gespielt wird.
 *
 * @param {Object[]} deck      - Die 52 gespielten Karten (currentDeckObjects)
 * @param {number}   score
 * @param {number}   moves
 * @param {number}   duration  - Spielzeit in Sekunden
 * @param {boolean}  [autoSolved=false]
 */
function registerGameEnd(deck, score, moves, duration, autoSolved = false) {
    // Sicherheitsnetz: Falls deck leer ist, currentInitialDeck als Fallback nutzen
    const key = (deck.length === 52) ? getDeckKey(deck) : getDeckKey(currentInitialDeck);
    const dateStr = new Date().toISOString();

    // ---- DECK ANLEGEN ----
    let isDeckNew = false;

    if (!kts.stats.decks[key]) {
        const generatedCount = Object.values(kts.stats.decks)
            .filter(d => !d.isHardcoded).length + 1;
        const deckNum = generatedCount.toString().padStart(2, '0');

        kts.stats.decks[key] = {
            label: `Generated Deck #${deckNum}`,
            isHardcoded: false,
            bestScore: 0,
            bestMoves: Infinity,
            bestTime: Infinity,
            plays: 0,
            wins: 0,
            autoSolveCount: 0,
            lastPlayed: null,
            player: kts.game.player.name,
            history: [],
        };

        kts.game.currentDeckName = kts.stats.decks[key].label;
        isDeckNew = true;
    }

    // ---- DECK-STATS AKTUALISIEREN ----
    const deckStats = kts.stats.decks[key];

    if (score > (deckStats.bestScore || 0)) deckStats.bestScore = score;
    if (!deckStats.bestMoves || moves < deckStats.bestMoves) deckStats.bestMoves = moves;
    if (!deckStats.bestTime || duration < deckStats.bestTime) deckStats.bestTime = duration;

    deckStats.plays++;
    deckStats.wins++;
    deckStats.lastPlayed = dateStr;
    deckStats.player = kts.game.player.name;

    if (autoSolved) deckStats.autoSolveCount++;

    // Historie (max. 50 Einträge — ältester fliegt raus)
    deckStats.history.push({ score, moves, time: duration, player: kts.game.player.name, date: dateStr });
    if (deckStats.history.length > 50) deckStats.history.shift();

    // ---- GLOBALE STATS AKTUALISIEREN ----
    const g = kts.stats;
    g.totalWins++;
    g.totalMoves += moves;
    g.totalTime += duration;
    g.totalScores += score;
    if (!g.totalAutoSolves) g.totalAutoSolves = 0;
    if (autoSolved) g.totalAutoSolves++;

    // ---- GAME-STATE ----
    kts.game.winStreak++;
    kts.game.activeGameInProgress = false;

    saveToDisk();

    // ---- DEBUG-LOG (nur bei neuem Deck) ----
    if (isDeckNew /*&& typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE*/) {
        console.groupCollapsed(`🎉 Neues Deck: ${kts.stats.decks[key].label}`);
        console.groupCollapsed('🔑 Deck-Key:'); console.log(key); console.groupEnd();
        console.groupCollapsed('Deck-Objects:'); console.log(currentDeckObjects); console.groupEnd();
        console.groupCollapsed('🗂️ Gespeicherter Eintrag'); console.log(kts.stats.decks[key]); console.groupEnd();
        console.log('🧱 Deck-Daten (Initial):', JSON.stringify(currentInitialDeck));
        console.groupEnd();
    }
}
