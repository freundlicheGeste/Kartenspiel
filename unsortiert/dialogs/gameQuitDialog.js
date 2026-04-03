function showGameQuitDialog() {
    if (!gameState.is(GameStates.RUNNING)) {
        devInfo("Dialog nur im RUNNING State");
        return;
    }
    // Spiel pausieren, wenn Game State RUNNING
    pauseGame();

    showConfirm(
        "Möchtest du das aktuelle Spiel<br>wirklich beenden?",
        {
            onCancel: () => {
                devWarn("Spiel beenden [ABGEBROCHEN]");
                resumeGame();
            },
            onConfirm: () => {
                devSuccess("Spiel beenden [AUSGEFÜHRT]");
                quitGame();
            }
        }
    );
}