let IS_DEV_MODE = false;

// Speicher für Session-Logs
const devLogs = [];

// Timestamp erzeugen
function getTimestamp() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} `
        + `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Basis-Logger
function log(type, message) {
    if (!IS_DEV_MODE) return;

    const styles = {
        INFO: "color: #3498db; font-weight: bold;",
        WARNUNG: "color: #f1c40f; font-weight: bold;",
        FEHLER: "color: #e74c3c; font-weight: bold;",
        ERFOLG: "color: #2ecc71; font-weight: bold;",
        STEP: "color: #f01cb1; font-style: italic", // RECORDING
        POINTS: "color: #6af01c; font-style: italic", // PUNKTE
    };

    const timestamp = getTimestamp();
    const prefix = `[${timestamp}] [DEV - ${type}]`;
    const fullMessage = `${prefix} ${message}`;

    // Konsole
    console.log(`%c${fullMessage}`, styles[type] || styles.INFO);

    // speichern
    devLogs.push(fullMessage);
}

function simplelog(message) {
    if (!IS_DEV_MODE) return;

    const prefix = `[DEV - LOG]`;
    const fullMessage = `${prefix} ${message}`;

    // Konsole
    console.log(`${fullMessage}`);

    // speichern
    devLogs.push(fullMessage);
}

// Öffentliche Funktionen
function devInfo(msg) {
    log("INFO", msg);
}

function devWarn(msg) {
    log("WARNUNG", msg);
}

function devError(msg) {
    log("FEHLER", msg);
}

function devSuccess(msg) {
    log("ERFOLG", msg);
}

/**
 * Loggt das Punkte-System
 * (deaktiviert in GameStates.DEMO )
 * @param {*} msg 
 */
function logExtraPoints(msg) {
    if (!gameState.is(GameStates.DEMO)) {
        log("POINTS", msg);
    }
}

/**
 * Loggt die Karten-Bewegungen
 * (deaktiviert in GameStates.DEMO )
 * @param {*} msg 
 */
function logMoveSteps(msg) {
    if (!gameState.is(GameStates.DEMO)) {
        log("STEP", msg);
    }
}

function devLog(msg) {
    simplelog(msg);
}

// Logs als TXT herunterladen
function downloadDevLogs(filename = "dev-logs.txt") {
    if (!IS_DEV_MODE) return;

    const blob = new Blob([devLogs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}