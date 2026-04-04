/* =====================================================
   DEV LOGS
   Verantwortlich für: IS_DEV_MODE-Flag, Logging-
   Funktionen (devInfo, devWarn, devLog, logMoveSteps,
   logExtraPoints), Log-Export.

   SSOT: Alle Logging-Funktionen leben hier.
   Muss als EINE DER ERSTEN Dateien geladen werden —
   app_core.js referenziert IS_DEV_MODE und devInfo().

   Abhängigkeiten: keine
===================================================== */

let IS_DEV_MODE = false;

/** Gespeicherte Log-Einträge der aktuellen Session. */
const devLogs = [];

/* =====================================================
   INTERNE HILFSFUNKTIONEN
===================================================== */

function _getTimestamp() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} `
         + `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const _logStyles = {
    INFO:    'color: #3498db; font-weight: bold;',
    WARNUNG: 'color: #f1c40f; font-weight: bold;',
    FEHLER:  'color: #e74c3c; font-weight: bold;',
    ERFOLG:  'color: #2ecc71; font-weight: bold;',
    STEP:    'color: #f01cb1; font-style: italic;',
    POINTS:  'color: #6af01c; font-style: italic;',
};

function _log(type, message) {
    if (!IS_DEV_MODE) return;
    const fullMessage = `[${_getTimestamp()}] [DEV-${type}] ${message}`;
    console.log(`%c${fullMessage}`, _logStyles[type] || _logStyles.INFO);
    devLogs.push(fullMessage);
}

/* =====================================================
   ÖFFENTLICHE API
===================================================== */

function devInfo(msg)    { _log('INFO',    msg); }
function devWarn(msg)    { _log('WARNUNG', msg); }
function devError(msg)   { _log('FEHLER',  msg); }
function devSuccess(msg) { _log('ERFOLG',  msg); }

/**
 * Allgemeiner Dev-Log — akzeptiert beliebig viele Argumente
 * (wie console.log). DOM-Elemente und Objekte werden lesbar
 * serialisiert, damit Hint-Objekte (card, target, priority)
 * vollständig in der Konsole erscheinen.
 *
 * Beispiel: devLog('HINT RESULT:', move)
 *   → [DEV-LOG] HINT RESULT: {"card":"<div#f-hearts[hearts]>","priority":100}
 *
 * @param {...*} args
 */
function devLog(...args) {
    if (!IS_DEV_MODE) return;

    const _serialize = val => {
        if (val === null || val === undefined) return String(val);
        if (val instanceof HTMLElement) {
            const id  = val.id ? `#${val.id}` : '';
            const cid = val.dataset?.cardId || val.dataset?.suit || '';
            return `<${val.tagName.toLowerCase()}${id}${cid ? `[${cid}]` : ''}>`;
        }
        if (typeof val === 'object') {
            try {
                return JSON.stringify(val, (_k, v) => {
                    if (v instanceof HTMLElement) return _serialize(v);
                    return v;
                });
            } catch (_) { return String(val); }
        }
        return String(val);
    };

    const line = `[DEV-LOG] ${args.map(_serialize).join(' ')}`;
    console.log(line);
    devLogs.push(line);
}

/**
 * Loggt Karten-Bewegungen (SSOT — nicht in scoring_system.js duplizieren).
 * Stumm im DEMO-Modus.
 * @param {string} msg
 */
function logMoveSteps(msg) {
    if (!IS_DEV_MODE) return;
    if (typeof gameState !== 'undefined' && gameState.is(GameStates.DEMO)) return;
    _log('STEP', msg);
}

/**
 * Loggt Bonus/Straf-Punkte (SSOT — nicht in scoring_system.js duplizieren).
 * Stumm im DEMO-Modus.
 * @param {string} msg
 */
function logExtraPoints(msg) {
    if (!IS_DEV_MODE) return;
    if (typeof gameState !== 'undefined' && gameState.is(GameStates.DEMO)) return;
    _log('POINTS', msg);
}

/**
 * Lädt alle Session-Logs als .txt herunter.
 * @param {string} [filename]
 */
function downloadDevLogs(filename = 'dev-logs.txt') {
    if (!IS_DEV_MODE) return;
    const blob = new Blob([devLogs.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
