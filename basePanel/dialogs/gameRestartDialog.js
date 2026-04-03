function renderRestartConfirm(contentElement, addFooterButton) {
    if (!gameState.is(GameStates.RUNNING)) {
        return;
    }
    // 1. Content setzen
    contentElement.style.background = "transparent"; // Optional: Hintergrund im Dialog cleaner
    contentElement.style.border = "none";

    const isRoundOne = kts.game.winStreak < 1;

    if (isRoundOne) {
        contentElement.innerHTML = `
        <div class="dialog-text-wrapper">
            Möchtest du das aktuelle Spiel<br>wirklich neu starten?
        </div>
    `;
    } else {
        contentElement.innerHTML = `
        <div class="dialog-text-wrapper">
            Möchtest du das aktuelle Spiel wirklich neu starten? Damit wird auch die Siegesserie zurück gesetzt.
        </div>
    `;
    }

    // 2. Buttons mit Logik und Farben setzen
    addFooterButton("ABBRECHEN", () => closePanel('base-panel-id'));

    // Hier nutzen wir 'btn-danger' für den roten Rand
    addFooterButton("JA, NEUSTART", () => {
        console.log("Spiel wird neu gestartet...");
        closePanel('base-panel-id');
        // Bei Bestätigung: Streak nullen und Neustart ausführen
        kts.game.winStreak = 0;
        saveToDisk();
        restartGame();
    }, 'btn-danger');
}

function triggerRestartDialog() {
    // Prüfe, ob einer der gültigen Zustände aktiv ist
    const canRestart = gameState.is(GameStates.RUNNING) || gameState.is(GameStates.GESTARTET);
    // Wenn nicht
    if (!canRestart) {
        openPanel('info', {
            title: "NICHT MÖGLICH",
            message: "Ein Neustart kann nur während eines laufenden Spiels angefordert werden.",
            buttonText: "VERSTANDEN",
            icon: "🚫"
        });
        return;
    }

    const isRoundOne = kts.game.winStreak < 1;
    openPanel('confirm', {
        message: isRoundOne
            ? "Möchtest du das aktuelle Spiel<br>neu starten?"
            : "Möchtest du das aktuelle Spiel neu starten?<br><br>Damit wird auch die <strong>Siegesserie</strong><br> zurückgesetzt.",
        buttons: [
            {
                text: "JA, NEUSTART",
                className: "btn-danger",
                callback: () => { kts.game.winStreak = 0; saveToDisk(); restartGame(); }
            },
            { text: "ABBRECHEN" }
        ]
    });
}