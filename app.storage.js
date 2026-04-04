/* =====================================================
   APP STORAGE
   Verantwortlich für: LocalStorage-Template (SSOT),
   Typdefinitionen, initStorage(), saveToDisk().
   Muss als ERSTE JS-Datei geladen werden —
   alle anderen Dateien setzen kts voraus.
   Abhängigkeiten: keine
===================================================== */

/**
 * Der Schlüssel, unter dem die Anwendungsdaten im LocalStorage gespeichert werden.
 * @type {string}
 */
const STORAGE_KEY = 'kts_v1_storage';

/* =====================================================
   TEMPLATE (SSOT für Defaults)
===================================================== */

/**
 * Standardwerte für alle im Speicher liegenden Variablen.
 * Wird bei initStorage() als Basis-Klon genutzt.
 * @type {Object}
 */
const kts_template = {
    sys: { version: '0.9.9', date: '2026-03-29' },
    cfg: {
        isInitialStart: true,
        autoFoundation: true,
        autoFlip: true,
        autoHint: true,
        hintDelay: 20000,
        showHintBulb: true,
        devHintSpeed: false,
        smartDblClick: false,
        timePenalty: false,
        designBack: 'design-standard',
        designFront: 'front-standard',
        deckSource: 'deck-hardcoded',
        pinCurrentDeck: true,
        pinnedDeckId: 'none',
        audio: {
            mute: false,
            volEffects: 0.5,
        },
        barLeftVisible: true,
        barRightVisible: true,
        barLeftMode: 'auto',
        barRightMode: 'progress',
        barInterval: 12000,
    },
    game: {
        activeGameInProgress: false,
        currentDeckName: 'Unknown',
        currentDeckKey: '',
        winStreak: 0,
        player: {
            name: 'Spieler 1',
            level: 1,
            XP: 0,
            unlockedRewards: [],
        },
    },
    stats: {
        totalWins: 2,
        totalGames: 2,
        totalMoves: 278,
        totalTime: 250,
        totalScores: 12558,
        totalAutoSolves: 0, // NEU Trackt Auto-Solves für "Faulpelz König"
        decks: {
            "H-5|S-4|S-5|D-9|H-10|C-2|D-3|C-4|C-8|D-2|D-7|D-Q|H-7|H-4|C-5|S-J|H-9|H-2|D-8|H-A|D-K|S-A|C-7|C-Q|S-7|D-5|S-Q|C-K|D-6|C-3|D-J|C-A|S-9|S-8|C-6|H-8|S-3|C-9|H-6|H-3|C-J|C-10|S-K|H-J|S-10|D-10|S-6|H-Q|D-4|S-2|H-K|D-A": {
                "label": "Dibbi Dabbi",
                "isHardcoded": false,
                "bestScore": 6684,
                "bestMoves": 139,
                "bestTime": 116,
                "plays": 2,
                "wins": 2,
                "autoSolveCount": 0, // NEU: Trackt Auto-Solves pro Deck
                "player": "Absalon",
                "lastPlayed": "2026-02-26T15:22:15.087Z",
                "history": [
                    { "score": 5874, "moves": 142, "time": 134, "player": "Ron", "date": "2026-02-26T15:17:01.912Z" },
                    { "score": 6684, "moves": 139, "time": 116, "player": "Absalon", "date": "2026-02-26T15:22:15.087Z" }
                ]
            }
        },
    },
};

/**
 * Die globale Variable, mit der das gesamte Spiel arbeitet.
 * Wird von initStorage() befüllt.
 * @type {Object}
 */
let kts = {};

/* =====================================================
   PERSISTENZ
===================================================== */

/**
 * Speichert den aktuellen kts-Zustand als JSON im LocalStorage.
 */
function saveToDisk() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kts));
    } catch (e) {
        console.error('[saveToDisk] Fehler beim Speichern:', e);
    }
}

/* =====================================================
   INIT
===================================================== */

/**
 * Initialisiert kts beim App-Start.
 * Lädt gespeicherte Daten oder fällt auf das Template zurück.
 * Führt Migration und Hardcoded-Deck-Init aus.
 */
function initStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    // Basis ist immer ein frischer Klon des Templates
    kts = JSON.parse(JSON.stringify(kts_template));

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);

            if (parsed.sys) Object.assign(kts.sys, parsed.sys);
            if (parsed.cfg) Object.assign(kts.cfg, parsed.cfg);

            _lastSavedCardDesign = kts.cfg.designBack + kts.cfg.designFront;

            // Spieler-Daten: Deep-Merge (Unterobjekte nicht überschreiben)
            if (parsed.game) {
                if (parsed.game.player) Object.assign(kts.game.player, parsed.game.player);
                const { player, points, ...flatGameStats } = parsed.game;
                Object.assign(kts.game, flatGameStats);
            }

            // Stats: Decks separat mergen damit Template-Keys erhalten bleiben
            if (parsed.stats) {
                Object.keys(parsed.stats).forEach(key => {
                    if (key !== 'decks') kts.stats[key] = parsed.stats[key];
                });
                if (parsed.stats.decks) kts.stats.decks = parsed.stats.decks;
            }

            kts.cfg.isInitialStart = false;
            console.log('✅ App-Daten geladen. Version: ' + kts.sys.version);

        } catch (e) {
            console.error('[initStorage] Daten korrupt — Template wird genutzt.');
        }
    } else {
        console.log('[initStorage] Erster App-Start: Template initialisiert.');
    }

    migrateStorage?.();
    initializeHardcodedDecks?.();
    checkReloadPenalty();

    updateLevelUI?.();
    applyBarSettings?.();
    logShortcuts?.();

    resetGame();
    document.body.classList.add('lock-scroll');
}

/**
 * Erkennt Tab-Reload oder Browser-Close während eines laufenden Spiels.
 * Setzt winStreak zurück wenn das Spiel nicht sauber beendet wurde.
 */
function checkReloadPenalty() {
    if (!kts.game.activeGameInProgress) return;

    if (kts.game.winStreak > 0) {
        console.log('%c Win-Streak durch Abbruch verloren!', 'color: #ff4d4d; font-weight: bold;');
        kts.game.winStreak = 0;
    }

    kts.game.activeGameInProgress = false;
    saveToDisk();
}

// Initialisierung direkt beim Laden
initStorage();