/* =====================================================
   GAME MESSAGES
   Verantwortlich für: Toast-Nachrichten, Event-Konfiguration,
   Message-Queue für überlappungsfreie Anzeige.
   Bugfix: triggerGameMsgQueue() hatte undefined `text`-Variable
   — Funktion war unvollständig und würde crashen.
   Queue-Logik jetzt fertiggestellt und nutzbar.
   Abhängigkeiten: scoring.system.js (POINTS_CONFIG)
===================================================== */

/* =====================================================
   EVENT-KONFIGURATION (SSOT)
===================================================== */

const GameEvents = Object.freeze({
    EXPLORER:    'EXPLORER',
    STACK_RUSH:  'STACK_RUSH',
    HINT:        'HINT',
    SHUFFLE:     'SHUFFLE',
    UNDO:        'UNDO',
    FOUNDATION:  'FOUNDATION',
    START:       'START',
    STREAK:      'STREAK',
    REPLAY:      'REPLAY',
    STOCK_RESET: 'STOCK_RESET',
});

/**
 * Konfiguration für alle rein text-basierten Events.
 * Events mit Punkten (ACTION, BONUS, PENALTY) werden
 * direkt aus POINTS_CONFIG in scoringSystem.js gelesen.
 */
const EventConfigs = {
    [GameEvents.EXPLORER]:    { label: 'Entdecker-Glück!',    isPenalty: false },
    [GameEvents.STACK_RUSH]:  { label: 'Kombi-Rausch!',       isPenalty: false },
    [GameEvents.HINT]:        { label: 'Tipp-Abzug',          isPenalty: true  },
    [GameEvents.SHUFFLE]:     { label: 'Misch-Gebühr',        isPenalty: true  },
    [GameEvents.UNDO]:        { label: 'Korrektur-Abzug',     isPenalty: true  },
    [GameEvents.FOUNDATION]:  { label: 'Stapel-Raub',         isPenalty: true  },
    [GameEvents.START]:       { label: "Los geht's!",         isPenalty: false },
    [GameEvents.STREAK]:      { label: 'Runde',               isPenalty: false },
    [GameEvents.REPLAY]:      { label: 'Neustart:',           isPenalty: false },
    [GameEvents.STOCK_RESET]: { label: 'Stapel zurücklegen:', isPenalty: true  },
};

/* =====================================================
   SOFORT-NACHRICHT
===================================================== */

let isMessageActive = false;

/**
 * Zeigt eine Spiel-Nachricht an.
 * Sucht zuerst in EventConfigs, dann in POINTS_CONFIG.
 * Wenn beide leer: Abbruch ohne Fehler.
 *
 * @param {string}        key           - GameEvent-Key oder POINTS_CONFIG-Key
 * @param {number|string|null} [overrideValue] - Optionaler Wert (z.B. für Combo-Punkte)
 */
function triggerGameMsg(key, overrideValue = null) {
    if (isMessageActive) return;

    let label, isPenalty, value;

    // 1. EventConfigs (reine Text-Events)
    const eventCfg = EventConfigs[key];
    if (eventCfg) {
        label     = eventCfg.label;
        isPenalty = eventCfg.isPenalty;
        value     = overrideValue;
    } else {
        // 2. POINTS_CONFIG (Punkte-Events — sucht in allen Kategorien)
        for (const type in POINTS_CONFIG) {
            const item = POINTS_CONFIG[type][key];
            if (!item) continue;

            label     = item.label   ?? null;
            value     = overrideValue ?? item.value ?? null;
            isPenalty = typeof value === 'number' && value < 0;
            break;
        }
    }

    if (!label) return; // Unbekannter Key — kein Crash

    // Nachricht formatieren
    let message = label;
    if (typeof value === 'number') {
        message = `${label} ${value > 0 ? '+' : ''}${value}`;
    } else if (value) {
        message = `${label} ${value}`;
    }

    isMessageActive = true;
    showGameMsg(message, isPenalty ?? false);
    setTimeout(() => { isMessageActive = false; }, 500);
}

/* =====================================================
   QUEUE-NACHRICHT (für mehrere schnell aufeinander folgende Events)
===================================================== */

let messageQueue      = [];
let isProcessingQueue = false;

/**
 * Fügt eine Nachricht in die Queue ein — wird angezeigt sobald
 * die vorherige Nachricht abgeschlossen ist.
 * Bugfix: `text` war undefined — jetzt korrekt aus Key+Value gebaut.
 *
 * @param {string}        key
 * @param {number|null}   [value]
 */
function triggerGameMsgQueue(key, value = null) {
    let label, isPenalty;

    const eventCfg = EventConfigs[key];
    if (eventCfg) {
        label     = eventCfg.label;
        isPenalty = eventCfg.isPenalty;
    } else {
        for (const type in POINTS_CONFIG) {
            const item = POINTS_CONFIG[type][key];
            if (!item) continue;
            label     = item.label ?? String(key);
            value     = value ?? item.value ?? null;
            isPenalty = typeof value === 'number' && value < 0;
            break;
        }
    }

    if (!label) return;

    let text = label;
    if (typeof value === 'number') text = `${label} ${value > 0 ? '+' : ''}${value}`;
    else if (value) text = `${label} ${value}`;

    messageQueue.push({ text, isPenalty: isPenalty ?? false });
    _processQueue();
}

/**
 * Verarbeitet die Message-Queue sequenziell.
 * 600ms zwischen jeder Nachricht damit sie sich nicht überlappen.
 */
function _processQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;

    isProcessingQueue = true;
    const { text, isPenalty } = messageQueue.shift();

    showGameMsg(text, isPenalty);

    setTimeout(() => {
        isProcessingQueue = false;
        _processQueue();
    }, 600);
}

/* =====================================================
   TOAST-ANZEIGE
===================================================== */

/**
 * Erstellt und zeigt einen temporären Toast auf dem Spielfeld.
 * Entfernt sich nach ~2.5 Sekunden automatisch.
 *
 * @param {string}  text
 * @param {boolean} [isPenalty=false] - Wenn true: Penalty-Styling
 */
function showGameMsg(text, isPenalty = false) {
    const board = document.getElementById('game-board');
    if (!board) return;

    const toast       = document.createElement('div');
    toast.className   = `game-message${isPenalty ? ' penalty' : ''}`;
    toast.innerText   = text;

    board.appendChild(toast);
    setTimeout(() => toast.remove(), 2550);
}
