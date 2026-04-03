function renderInfo(contentElement, addFooterButton) {
    const points = kts.game.points;
    const currentStreak = kts.game.winStreak || 0;
    const streakGoal = 5; // Ziel für den nächsten Bonus
    const progressPercent = Math.min((currentStreak / streakGoal) * 100, 100);

    contentElement.innerHTML = `
        <h3 class="panel-section-title first-section">PROGRESS</h3>
        <div class="section-container">
            <div class="ui-container">
                <div class="ui-header">SIEGES-SERIE: ${currentStreak}</div>
                <div class="ui-content" style="padding: 15px;">
                    <div class="progress-container" style="background: rgba(0,0,0,0.3); height: 12px; border-radius: 6px; overflow: hidden; border: 1px solid var(--accent-color-dark);">
                        <div class="progress-fill" style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, var(--accent-color-dark), var(--accent-color)); transition: width 0.8s ease-out;"></div>
                    </div>
                    <div style="font-size: 0.75em; text-align: center; margin-top: 8px; color: var(--accent-color);">
                        ${currentStreak < streakGoal
            ? `Noch ${streakGoal - currentStreak} Siege bis zum Bonus!`
            : "Bonus aktiv! 🔥"}
                    </div>
                </div>
            </div>
        </div>

        <h3 class="panel-section-title" style="margin-top: 25px;">PUNKTE-WERTUNG</h3>
        <div class="section-container">
            </div>

        <h3 class="panel-section-title" style="margin-top: 25px;">SPIELREGELN</h3>
        <div class="section-container">
            <div class="ui-container" style="padding: 15px;">
                <ul class="rules-list">
                    <li>Spielfeld: Karten abwechselnd in <b style="color: #ff4d4d;">Rot</b> und <b>Schwarz</b> stapeln (absteigend).</li>
                    <li>Nur <b>Könige</b> dürfen auf leere Felder bewegt werden.</li>
                    <li>Ziel: Alle Karten auf die passenden Farbstapel legen (aufsteigend; Ass - König).</li>
                </ul>
            </div>
        </div>
    `;

    addFooterButton("ZURÜCK", () => closePanel('base-panel-id'));
}