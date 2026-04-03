function renderQuitConfirm(contentElement, addFooterButton) {
    if (!gameState.is(GameStates.RUNNING)) {
        return;
    }
    // 1. Content setzen
    contentElement.style.background = "transparent"; // Optional: Hintergrund im Dialog cleaner
    contentElement.style.border = "none";

    contentElement.innerHTML = `
        <div class="dialog-text-wrapper">
            Möchtest du das aktuelle Spiel<br>wirklich beenden?
        </div>
    `;

    // 2. Buttons mit Logik und Farben setzen
    addFooterButton("ABBRECHEN", () => closePanel('base-panel-id'));

    // Hier nutzen wir 'btn-danger' für den roten Rand
    addFooterButton("JA, BEENDEN", () => {
        if (IS_DEV_MODE) {
            console.log("Spiel wird beendet...");
        }
        // Bei Bestätigung: Streak nullen und Neustart ausführen
        kts.game.winStreak = 0;
        saveToDisk();
        quitGame();
        closePanel('base-panel-id');
    }, 'btn-danger');
}

function triggerQuitDialog() {
    if (!gameState.is(GameStates.RUNNING)) {
        if (IS_DEV_MODE) {
            console.groupCollapsed('%cSpiel beenden [Dialog]',
                'color: #e21477; font-weight: bold;')
            console.log(`Game State: ${gameState.current}`);
            console.log('Dialog wird nur im Game State RUNNING ausgelöst.');
            console.groupEnd();
        }
        return;
    }
    // Spiel pausieren, wenn Game State RUNNING
    pauseGame();

    openPanel('confirm', {
        message: "Möchtest du das aktuelle Spiel<br>wirklich beenden?",
        buttons: [
            {
                text: "ABBRECHEN",
                callback: () => {
                    if (IS_DEV_MODE) {
                        console.log('%cSpiel beenden [Dialog][ABGEBROCHEN]',
                            'color: #e21477; font-weight: bold;');
                    }
                    resumeGame();
                }
            },
            {
                text: "JA, BEENDEN",
                className: "btn-danger",
                callback: () => {
                    if (IS_DEV_MODE) {
                        console.log('%cSpiel beenden [Dialog][AUSGEFÜHRT]',
                            'color: #e21477; font-weight: bold;');
                    }
                    quitGame();
                }
            }
        ]
    });
}