/* =====================================================
   GAME QUIT
   Verantwortlich für: Spiel bewusst beenden (Aufgeben).
   Setzt Streak zurück und persistiert den State.
   Abhängigkeiten: game.state.js, game.reset.js
===================================================== */

/**
 * Beendet das aktuelle Spiel ohne Wertung.
 * Unterschied zu resetGame(): quitGame() setzt zusätzlich
 * den winStreak zurück und persistiert via saveToDisk().
 */
function quitGame() {
    kts.game.activeGameInProgress = false;
    kts.game.winStreak = 0;
    saveToDisk();

    gameState.set(GameStates.BEENDET);
    resetGame();
}
