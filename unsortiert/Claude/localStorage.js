/**
 * Der Schlüssel, unter dem die Anwendungsdaten im LocalStorage gespeichert werden.
 * @type {string}
 */
const STORAGE_KEY = 'kts_v1_storage';

/**
 * @typedef {Object} GameHistory
 * @property {number} score  - Erzielte Punkte in dieser Runde.
 * @property {number} moves  - Anzahl der Züge.
 * @property {number} time   - Benötigte Zeit in Sekunden.
 * @property {string} player - Name des Spielers in dieser Runde.
 * @property {string} date   - ISO-Datum des Spielendes.
 */

/**
 * @typedef {Object} DeckStats
 * @property {string}        label       - Anzeigename des Decks.
 * @property {boolean}       isHardcoded - Ob es ein fest verbautes oder generiertes Deck ist.
 * @property {number}        bestScore   - Highscore für dieses Deck.
 * @property {number}        bestMoves   - Wenigste Züge zum Sieg.
 * @property {number}        bestTime    - Schnellste Zeit zum Sieg.
 * @property {number}        plays       - Wie oft wurde das Deck gespielt.
 * @property {number}        wins        - Wie oft wurde das Deck gewonnen.
 * @property {string}        player      - Name des Rekordhalters.
 * @property {string}        lastPlayed  - ISO-Datum der letzten Spielsession.
 * @property {GameHistory[]} history     - Liste der letzten Spielergebnisse.
 */

/**
 * @typedef {Object} PlayerStats
 * @property {string}   name            - Der Name des Spielers.
 * @property {number}   level           - Das aktuelle Level.
 * @property {number}   XP              - Aktuelle Erfahrungspunkte.
 */

/**
 * @typedef {Object} AppConfig
 * @property {boolean} isInitialStart  - Flag für Willkommens-Notizen.
 * @property {boolean} autoFoundation  - Automatische Ablage auf Foundation.
 * @property {boolean} autoFlip        - Automatisches Umdrehen verdeckter Karten.
 * @property {boolean} autoHint        - Automatische Hinweise einschalten.
 * @property {number}  hintDelay       - Verzögerung für Hinweise in ms.
 * @property {boolean} showHintBulb    - Anzeige der Hinweis-Glühbirne.
 * @property {boolean} devHintSpeed    - Dev-Modus für schnelle Hinweise.
 * @property {boolean} smartDblClick   - Intelligenter Doppelklick zum Bewegen.
 * @property {boolean} timePenalty     - Zeitstrafe aktivieren/deaktivieren.
 * @property {string}  designBack      - ID des gewählten Rückseiten-Designs.
 * @property {string}  designFront     - ID des gewählten Vorderseiten-Designs.
 * @property {string}  deckSource      - Quelle des Kartendecks.
 * @property {boolean} pinCurrentDeck  - Aktuelles Deck anpinnen.
 * @property {Object}  audio           - Audio-Einstellungen.
 * @property {boolean} audio.mute      - Ton aus/an.
 * @property {number}  audio.volEffects- Lautstärke Effekte (0.0 bis 1.0).
 * @property {boolean} barLeftVisible  - Sichtbarkeit linke Bar.
 * @property {boolean} barRightVisible - Sichtbarkeit rechte Bar.
 * @property {string}  barLeftMode     - Modus der linken Bar.
 * @property {string}  barRightMode    - Modus der rechten Bar.
 * @property {number}  barInterval     - Update-Intervall der Bars.
 */

/**
 * @typedef {Object} KtsStorage
 * @property {Object}      sys                - Systeminformationen.
 * @property {string}      sys.version        - Die aktuelle App-Version.
 * @property {string}      sys.date           - Das Release Datum der App-Version.
 * @property {AppConfig}   cfg                - Benutzereinstellungen.
 * @property {Object}      game               - Aktueller Spielstatus.
 * @property {boolean}     game.activeGameInProgress - Läuft gerade ein Spiel?
 * @property {string}      game.currentDeckName - ID des aktuell geladenen Decks.
 * @property {number}      game.winStreak     - Aktuelle Serie an Siegen.
 * @property {PlayerStats} game.player        - Informationen zum Spielerprofil.
 * @property {PointsConfig} game.points       - Die Punkte-Konfiguration.
 * @property {Object}      stats              - Statistik-Container.
 * @property {number}      stats.totalGames   - Anzahl aller Spiele.
 * @property {number}      stats.totalWins    - Anzahl aller Siege.
 * @property {number}      stats.totalMoves   - Anzahl aller Spielzüge.
 * @property {number}      stats.totalTime    - Gesamte Spielzeit.
 * @property {number}      stats.totalScores  - Gesamtpunktzahl über alle Spiele.
 * @property {Object.<string, DeckStats>} stats.decks - Dynamische Deck-Statistiken.
 */

/**
 * Standardwerte für alle im Speicher liegenden Variablen (Template).
 * @type {KtsStorage}
 */
const kts_template = {
    sys: { version: "0.9.9", date: "2026-03-29" },
    cfg: {
        isInitialStart: true,
        autoFoundation: true,
        autoFlip: true,
        autoHint: true,
        hintDelay: 10000,
        showHintBulb: true,
        devHintSpeed: false,
        smartDblClick: true,
        timePenalty: false,
        designBack: "design-standard",
        designFront: "front-standard",
        deckSource: "deck-hardcoded",
        pinCurrentDeck: true,
        audio: {
            mute: false,
            volEffects: 0.5
        },
        barLeftVisible: true,
        barRightVisible: true,
        barLeftMode: "auto",
        barRightMode: "progress",
        barInterval: 12000
    },
    game: {
        activeGameInProgress: false,
        currentDeckName: "Unknown",
        currentDeckKey: "", // NEU für RECORDING
        winStreak: 0,
        player: {
            name: "Spieler 1",
            level: 1,
            XP: 0
        }
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
        }
    }
};

/**
 * Die globale Variable, mit der das Spiel arbeitet.
 * @type {KtsStorage}
 */
let kts = {};

/**
 * Speichert den aktuellen Zustand des globalen `kts`-Objekts 
 * als JSON-String im LocalStorage.
 * @throws {Error} Wenn der Speicherzugriff fehlschlägt (z.B. QuotaExceeded).
 * @returns {void}
 */
function saveToDisk() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kts));
    } catch (e) {
        console.error("Fehler beim Speichern auf Disk:", e);
    }
}