/*
| **Event-Key** | **Deutscher Text (Vorschlag)** | **Wirkung**               |
| ------------- | ------------------------------ | ------------------------- |
| `HINT`        | **Tipp-Abzug**                 | Kurz & klar               |
| `SHUFFLE`     | **Misch-Gebühr**               | Klingt nach "Kosten"      |
| `STACK_RUSH`  | **Kombi-Rausch!**              | Emotionaler als Triple    |
| `UNDO`        | **Korrektur-Abzug**            | Neutraler als Strafe      |
| `FOUNDATION`  | **Basis-Raub**                 | Kurz für Foundation-Thief |
| `EXPLORER`    | **Entdecker-Glück!**           | Passend zu Explorer       |
| `STREAK`      | **Runden-Serie!**              | Klassisch                 |
*/

/**
 * Alle verfügbaren Spiel-Ereignisse als "Enum"
 */
const GameEvents = Object.freeze({
    EXPLORER: "EXPLORER",
    STACK_RUSH: "STACK_RUSH",
    HINT: "HINT",
    SHUFFLE: "SHUFFLE",
    UNDO: "UNDO",
    FOUNDATION: "FOUNDATION",
    START: "START",
    STREAK: "STREAK",
    REPLAY: "REPLAY",
    STOCK_RESET: "STOCK_RESET"
});

// Die Konfiguration bleibt intern (wie zuvor)
const EventConfigs = {
    [GameEvents.EXPLORER]: { label: "Entdecker-Glück!", isPenalty: false },
    [GameEvents.STACK_RUSH]: { label: "Kombi-Rausch!", isPenalty: false },
    // Strafen
    [GameEvents.HINT]: { label: "Tipp-Abzug", isPenalty: true }, // hintSystem.js
    [GameEvents.SHUFFLE]: { label: "Misch-Gebühr", isPenalty: true },
    [GameEvents.UNDO]: { label: "Korrektur-Abzug", isPenalty: true },
    [GameEvents.FOUNDATION]: { label: "Stapel-Raub", isPenalty: true },
    // Nachrichten
    [GameEvents.START]: { label: "Los geht's!", isPenalty: false },
    [GameEvents.STREAK]: { label: "Runde", isPenalty: false },
    [GameEvents.REPLAY]: { label: "Neustart:", isPenalty: false }, // deckGenerator.js
    [GameEvents.STOCK_RESET]: { label: "Stapel zurück legen:", isPenalty: true },
};

let isMessageActive = false;
let messageQueue = [];
let isProcessingQueue = false;

/**
 * @param {string} key - Entweder ein GameEvent oder ein Key aus der Punkte-Config
 * @param {number|string} [overrideValue] - Optionaler Wert (falls nicht aus Config)
 */
function triggerGameMsg(key, overrideValue = null) {
    if (isMessageActive) return;

    // 1. Suche in EventConfigs (für reine Text-Events wie START)
    let config = EventConfigs[key];
    let value = overrideValue;
    let label = config?.label;
    let isPenalty = config?.isPenalty ?? false;

    // 2. Fallback: Suche in der POINTS_CONFIG (für alles mit Punkten)(wenn kein festes Event gefunden wurde)
    if (!config) {
        // Wir suchen in allen Kategorien der POINTS_CONFIG nach dem Key
        for (const type in POINTS_CONFIG) {
            if (POINTS_CONFIG[type][key]) {
                const item = POINTS_CONFIG[type][key];
                label = item.label;
                value = value ?? item.value; // Wenn kein overrideValue (z.B. von Combo) kommt, nimm den Config-Wert
                isPenalty = (value < 0);
                break;
            }
        }
    }

    if (!label) return; // Wenn gar nichts gefunden wurde (weder Event noch Punkte-Label) -> Abbruch

    isMessageActive = true;

    // Nachricht zusammenbauen (formatieren)
    let message = label;
    if (typeof value === "number") {
        const sign = (value > 0) ? "+" : "";
        message = `${label} ${sign}${value}`;
    } else if (value) {
        message = `${label} ${value}`;
    }

    showGameMsg(message, isPenalty);
    // Nach 500ms die nächste Nachricht erlauben
    setTimeout(() => { isMessageActive = false; }, 500);
}

function triggerGameMsgQueue(eventKey, value = null) {
    // CODE DER ANDEREN METHODE HIER EINFÜGEN

    // In die Warteschlange werfen
    messageQueue.push({ text, isPenalty: config.isPenalty });

    // Queue-Verarbeitung starten, falls sie nicht läuft
    processQueue();
}

function processQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;

    isProcessingQueue = true;
    const nextMsg = messageQueue.shift();

    showGameMsg(nextMsg.text, nextMsg.isPenalty);

    // Warte 600ms bis zur nächsten Nachricht, damit sie sich nicht überlappen
    setTimeout(() => {
        isProcessingQueue = false;
        processQueue();
    }, 600);
}

/**
 * Zeigt eine temporäre Nachricht (Toast) auf dem Spiel-Board an.
 * Die Nachricht wird dem Element mit der ID `game-board` hinzugefügt
 * und nach ca. 2,55 Sekunden automatisch wieder entfernt.
 *
 * @param {string} text - Der anzuzeigende Nachrichtentext.
 * @param {boolean} [isPenalty=false] - Wenn `true`, wird die CSS-Klasse `penalty` hinzugefügt
 * und die Nachricht als Strafmeldung dargestellt.
 * @returns {void}
 */
function showGameMsg(text, isPenalty = false) {
    const board = document.getElementById('game-board');
    if (!board) return;

    const toast = document.createElement('div');
    toast.className = `game-message ${isPenalty ? 'penalty' : ''}`;
    toast.innerText = text;

    // Auf dem Spiel-Board anzeigen
    board.appendChild(toast);
    // Nach der Animation wieder entfernen
    setTimeout(() => toast.remove(), 2550);
}