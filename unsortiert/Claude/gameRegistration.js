function registerGameStart(deck) {
    // Falls noch ein Spiel aktiv war, wurde es abgebrochen -> Streak verloren!
    if (kts.game.activeGameInProgress && kts.game.winStreak != 0) {
        console.log("⚠️ Tab-Reload oder Spiel-Abbruch erkannt. Win-Streak zurückgesetzt.");
        kts.game.winStreak = 0;
    }

    // Das neue Spiel als "läuft gerade" markieren
    kts.game.activeGameInProgress = true;

    saveToDisk();
}

/**
 * Registriert das Spielende und trackt Statistiken.
 * @param {boolean} autoSolved - Wurde das Spiel per Button beendet?
 */
function registerGameEnd(deck, score, moves, duration, autoSolved = false) {
    // Sicherstellen, dass wir den Key vom VOLLSTÄNDIGEN Deck nehmen.
    // Falls 'deck' (currentDeckObjects) durch einen Fehler doch leer ist,
    // haben wir immer noch 'currentInitialDeck' als Backup-Array.
    const key = (deck.length === 52) ? getDeckKey(deck) : getDeckKey(currentInitialDeck);
    const dateStr = new Date().toISOString();

    //-- DECK --//

    let isDeckNew = false;

    // Deck anlegen, falls neu
    if (!kts.stats.decks[key]) {
        // Zählen, wie viele "Generated Decks" wir schon haben für die Nummerierung
        const generatedCount = Object.values(kts.stats.decks).filter(d => !d.isHardcoded).length + 1;
        const deckNum = generatedCount.toString().padStart(2, '0');

        kts.stats.decks[key] = {
            label: `Generated Deck #${deckNum}`,
            isHardcoded: false,
            bestScore: 0,
            bestMoves: Infinity,
            bestTime: Infinity,
            plays: 0,
            wins: 0,
            autoSolveCount: 0, // NEU: Trackt Auto-Solves pro Deck
            lastPlayed: null,
            player: "Nelson Muntz",
            history: []
        };

        kts.game.currentDeckName = kts.stats.decks[key].label;

        isDeckNew = true;
    }

    //-- STATS --//

    // STATS (Deck) aktualisieren
    const deckStats = kts.stats.decks[key];

    // Rekorde prüfen
    // Score: Höher ist besser (0 ist als Initialwert okay)
    if (score > (deckStats.bestScore || 0)) deckStats.bestScore = score;
    // Moves: Niedriger ist besser (Prüfen auf null/Infinity/0)
    if (!deckStats.bestMoves || moves < deckStats.bestMoves) {
        deckStats.bestMoves = moves;
    }
    // Time: Niedriger ist besser (Prüfen auf null/Infinity/0)
    if (!deckStats.bestTime || duration < deckStats.bestTime) {
        deckStats.bestTime = duration;
    }

    deckStats.plays++;
    deckStats.wins++;
    deckStats.lastPlayed = dateStr;

    // Auto-Solve für dieses Deck zählen
    if (autoSolved) deckStats.autoSolveCount++;

    //-- PLAYER --//
    deckStats.player = kts.game.player.name;

    // Historie erstellen (Spielername = der zuletzt gespeicherte)
    deckStats.history.push({ score, moves, time: duration, player: kts.game.player.name, date: dateStr });

    // --- HISTORY-BREMSE ---
    // Wenn mehr als 50 Einträge vorhanden sind, den ältesten entfernen
    if (deckStats.history.length > 50) {
        deckStats.history.shift();
    }

    // STATS aktualisieren (totalGames wird momentan jedes gestartete gezählt, nicht nur verlorene, siehe registerGameStart)
    const globalStats = kts.stats;
    globalStats.totalWins++;
    globalStats.totalMoves += moves;
    globalStats.totalTime += duration;
    globalStats.totalScores += score;

    // Globaler Faulpelz-Zähler
    if (!globalStats.totalAutoSolves) globalStats.totalAutoSolves = 0;
    if (autoSolved) globalStats.totalAutoSolves++;

    //-- GAME --//

    const gameStates = kts.game;
    // SSOT winStreak Zähler
    gameStates.winStreak++; // Spiel gewonnen
    gameStates.activeGameInProgress = false; // Spiel erfolgreich beendet

    saveToDisk();

    if (isDeckNew) {
        // --- (DEBUG) AUSGABE ---
        console.groupCollapsed(`🎉 Neues Deck: ${kts.stats.decks[key].label}`);

        console.groupCollapsed("🔑 Deck-Key: ");
        console.log(key);
        console.groupEnd();

        console.groupCollapsed(" Deck-Objects:");
        console.log(currentDeckObjects);
        console.groupEnd();

        console.groupCollapsed("🗂️ Gespeicherter Deck-Eintrag");
        console.log(kts.stats.decks[key]);
        console.groupEnd();

        console.log("🧱 Deck-Daten (Initial):");
        console.log(JSON.stringify(currentInitialDeck));

        console.groupEnd();

        // ! Gibt Fehlermeldung in der Konsole
        //copyToClipboard(JSON.stringify(currentInitialDeck));
        //printCurrentDeckForCode();
    }
}