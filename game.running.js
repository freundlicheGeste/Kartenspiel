/* =====================================================
   GAME RUNNING
   Verantwortlich für: Spieler-Session starten,
   Timer laufen lassen, Zeitstrafe anwenden.
   Bugfix: Falsche Boolean-Logik in triggerGameStart()
   und startGameSession() korrigiert.
   Abhängigkeiten: game.state.js
===================================================== */

let gameTimerId    = null;
let gameStartTime  = null;
let totalPausedTime = 0;
let pauseStartedAt  = null;
let lastPenaltySecond = null;

/* =====================================================
   SESSION START
===================================================== */

/**
 * Wird beim ersten Spielerzug aufgerufen (via onPlayerMove).
 * Startet die Uhr und wechselt von GESTARTET → RUNNING.
 *
 * Bugfix: Vorher stand
 *   if (!gameState.is(GameStates.DEMO || !gameState.is(...)))
 * Der || stand im falschen Scope — GameStates.DEMO ist ein
 * Truthy-String, der Ausdruck war immer true.
 * Korrekt: beide is()-Aufrufe separat prüfen.
 */
function triggerGameStart() {
    if (!gameState.is(GameStates.GESTARTET)) return;

    gameStartTime     = Date.now();
    totalPausedTime   = 0;
    pauseStartedAt    = null;
    lastPenaltySecond = null;

    // BUGFIX: Vorher: GameStates.DEMO || !gameState.is(...) → immer truthy
    const isSpecialMode = gameState.is(GameStates.DEMO) || gameState.is(GameStates.RECORDING);
    if (!isSpecialMode) {
        gameState.set(GameStates.RUNNING);
    }

    _startGameSession();
}

/**
 * Aktiviert Buttons und startet den Timer.
 * Nicht aufrufen bevor triggerGameStart() gelaufen ist.
 *
 * Bugfix: Vorher stand
 *   if (!gameState.is(GameStates.DEMO || !gameState.is(GameStates.RECORDING)))
 * Selber Scope-Bug wie oben — korrigiert.
 */
function _startGameSession() {
    // BUGFIX: Vorher: GameStates.DEMO || !gameState.is(...) → immer truthy
    const isSpecialMode = gameState.is(GameStates.DEMO) || gameState.is(GameStates.RECORDING);
    if (!isSpecialMode) {
        kts.stats.totalGames++;
        saveToDisk();
    }

    ['button-restart', 'button-undo', 'button-hint', 'button-shuffle'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });

    _startGameTimer();
}

/* =====================================================
   TIMER
===================================================== */

/**
 * Startet den 1-Sekunden-Intervall-Timer.
 * Löscht einen eventuell noch laufenden Timer zuerst (SSOT).
 */
function _startGameTimer() {
    clearInterval(gameTimerId);

    gameTimerId = setInterval(() => {
        if (!gameState.is(GameStates.RUNNING)) return;

        const elapsed = getElapsedSeconds();
        updateTimerDisplay(elapsed);
        applyTimePenalty(elapsed);
    }, 1000);
}

/**
 * Gibt die netto gespielte Zeit in Sekunden zurück.
 * Zieht Pausenzeiten vom Gesamtdelta ab.
 * @returns {number}
 */
function getElapsedSeconds() {
    if (!gameStartTime) return 0;
    return Math.floor((Date.now() - gameStartTime - totalPausedTime) / 1000);
}

/**
 * Aktualisiert die Timer-Anzeige in der Status-Bar.
 * @param {number} seconds
 */
function updateTimerDisplay(seconds) {
    const display = document.getElementById('timer-display');
    if (display) display.innerText = formatTime(seconds);
}

/* =====================================================
   ZEITSTRAFE
===================================================== */

/**
 * Verhängt alle 10 Sekunden eine Strafpunkt-Abzug,
 * wenn die Zeitstrafen-Option aktiviert ist.
 * lastPenaltySecond verhindert Doppel-Auslösung bei
 * mehrfachen Timer-Ticks auf derselben Sekunde.
 * @param {number} seconds - Aktuelle Spielzeit
 */
function applyTimePenalty(seconds) {
    const usePenalty = document.getElementById('opt-timepenalty')?.checked;
    if (!usePenalty) return;

    if (seconds > 0 && seconds % 10 === 0 && seconds !== lastPenaltySecond) {
        lastPenaltySecond = seconds;

        const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.TIME_PENALTY);
        updateScore(penaltyPoints);
        triggerGameMsg(PENALTY.TIME_PENALTY, penaltyPoints);
        logExtraPoints(`TIME_PENALTY: ${penaltyPoints}`);
    }
}
