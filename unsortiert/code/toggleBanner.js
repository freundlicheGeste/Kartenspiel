function closeAllOverlays() {
    // Liste aller Banner-IDs
    const ids = ['rewards-panel'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Scoreboard separat (da es über Klassen gesteuert wird)
    const scoreboard = document.getElementById('scoreboard-overlay');
    if (scoreboard) scoreboard.classList.remove('open');
}

/**
 * Schaltet das Belohnungs-Panel (Rewards) an/aus
 */
function toggleRewards() {
    const panel = document.getElementById('rewards-panel');
    if (!panel) return;

    const isVisible = panel.style.display === 'flex';

    if (!isVisible) {
        // Schließt Scoreboard, Settings etc.
        closeAllOverlays();

        // Panel anzeigen (als Flex für die Zentrierung)
        panel.style.display = 'flex';

        // UI mit aktuellen Daten aus dem localStorage befüllen
        if (typeof updateRewardsUI === 'function') {
            updateRewardsUI();
        }

        pauseGame();
    } else {
        panel.style.display = 'none';
        resumeGame();
    }
}