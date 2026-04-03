/* =====================================================
   GAME PAUSE
   Verantwortlich für: Spiel pausieren und fortsetzen.
   Pausenzeit wird in totalPausedTime akkumuliert und
   von getElapsedSeconds() (game.running.js) abgezogen.
   Abhängigkeiten: game.state.js, game.running.js
===================================================== */

/**
 * Pausiert das laufende Spiel.
 * Nur möglich wenn State = RUNNING.
 * Sperrt das Board und pausiert das Hint-System.
 */
function pauseGame() {
    if (!gameState.is(GameStates.RUNNING)) return;

    pauseStartedAt = Date.now();
    gameState.set(GameStates.PAUSIERT);

    document.body.classList.add('lock-scroll');
    document.getElementById('game-board')?.classList.add('game-paused');

    pauseHintSystem();
}

/**
 * Setzt ein pausiertes Spiel fort.
 * Nur möglich wenn State = PAUSIERT.
 * Addiert die Pausendauer zu totalPausedTime (SSOT in game.running.js).
 * Stellt den vorherigen State wieder her (z.B. RUNNING).
 */
function resumeGame() {
    if (!gameState.is(GameStates.PAUSIERT)) return;

    totalPausedTime += Date.now() - pauseStartedAt;
    pauseStartedAt   = null;

    gameState.set(gameState.getPrevious() || GameStates.RUNNING);

    document.body.classList.remove('lock-scroll');
    document.getElementById('game-board')?.classList.remove('game-paused');

    resumeHintSystem();
}
