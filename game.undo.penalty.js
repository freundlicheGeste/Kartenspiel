/* =====================================================
   UNDO PENALTY
   Verantwortlich für: Strafpunkte beim Undo-Einsatz.
   Regel: Die ersten zwei Undos pro Spiel sind gratis,
          ab dem dritten wird jedes Mal bestraft.
   Abhängigkeiten: scoring_system.js, game_messages.js,
                   game_state.js, game_undo.js (undoCount)
===================================================== */

const UNDO_FREE_USES = 2; // Erste N Undos ohne Strafe

/**
 * Verhängt Strafpunkte für einen Undo-Einsatz.
 * Wird von undoLastMove() aufgerufen — nach applyState().
 * Zählt undoCount hoch und bestraft erst ab dem dritten Einsatz.
 *
 * undoCount ist in game_undo.js deklariert und wird von
 * _resetGameState() auf 0 zurückgesetzt.
 */
function applyUndoPenalty() {
    if (!gameState.is(GameStates.RUNNING)) return;
    if (gameState.is(GameStates.DEMO))     return;

    undoCount++;

    if (undoCount <= UNDO_FREE_USES) {
        // Gratis-Undo — beim letzten freien Hinweis anzeigen
        if (undoCount === UNDO_FREE_USES) {
            triggerGameMsg({ label: 'Letzter gratis Undo!' }, null);
        }
        logExtraPoints?.(`UNDO #${undoCount} — gratis (max ${UNDO_FREE_USES})`);
        return;
    }

    const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.UNDO_PENALTY);
    updateScore(penaltyPoints);
    triggerGameMsg(PENALTY.UNDO_PENALTY, penaltyPoints);
    logExtraPoints?.(`UNDO_PENALTY #${undoCount} [${penaltyPoints}]`);
}
