// Beispiel-Datenobjekt, Aufruf mit openPanel('win', gameExResult);
const gameExResult = {
    baseScore: 634,
    score: 980,
    moves: 150,
    time: 145,
    winStreak: 2,
    timeBonus: 180,
    speedBonus: 20,
    puristBonus: 20,
    lastPlayed: Date.now(),
    bestScore: 1250,
    isNewRecord: true,
    // Combo-Stats aus sessionStats mitschicken!
    flipComboCount: 5,
    foundationComboCount: 4,
    flipBonus: 10,
    foundationBonus: 16,
    streakBonus: 50,
    wasAutoSolved: false
};

const noComboResult = {
    baseScore: 634,
    score: 954,
    moves: 150,
    time: 145,
    winStreak: 2,
    timeBonus: 180,
    speedBonus: 20,
    puristBonus: 20,
    lastPlayed: Date.now(),
    bestScore: 1250,
    isNewRecord: false,
    // Combo-Stats aus sessionStats mitschicken!
    flipComboCount: 5,
    foundationComboCount: 4,
    flipBonus: 0,
    foundationBonus: 0,
    streakBonus: 50,
    wasAutoSolved: false
};

function renderWin(contentElement, addFooterButton, data) {
    setTimeout(animateScoreRows, 50);
    // Zeit-Formatierung
    const formattedDate = data.lastPlayed ? new Date(data.lastPlayed).toISOString().split('T')[0] : 'NEU';

    const titleText = data.isNewRecord ? `🔥 NEUER REKORD! 🔥` : `🎉 Runde ${data.winStreak} 🎉`;

    contentElement.innerHTML = `
        <div class="dialog-text-wrapper" style="padding-bottom: 10px;">
    <div style="color: var(--accent-color); font-size: 1.5em; font-weight: bold; text-transform: uppercase;">
        ${titleText}
    </div>
</div>

<div class="section-container">
    <div class="ui-container">
        <div class="ui-header">PUNKTEÜBERSICHT</div>
        <div class="ui-content score-list">

            <div class="row">
                <span class="label">
                    <svg class="icon">
                        <use href="#icon-base"></use>
                    </svg>
                    Basis-Punkte
                </span>
                <span class="value" data-value="">${data.baseScore}</span>
            </div>

            ${data.speedBonus > 0 ? `
            <div class="row highlight-achievment">
                <span class="label">
                    <svg class="icon">
                        <use href="#icon-speed"></use>
                    </svg>
                    Bonus: Geschwindigkeit
                </span>
                <span class="value" data-value="">${data.speedBonus}</span>
            </div>` : ''}

            ${data.puristBonus > 0 ? `
            <div class="row highlight-achievment">
                <span class="label">
                    <svg class="icon">
                        <use href="#icon-purist"></use>
                    </svg>
                    Bonus: Purist
                </span>
                <span class="value" data-value="">${data.puristBonus}</span>
            </div>` : ''}

            ${(data.flipComboCount > 0) ? `
<div class="row highlight-combo ${data.flipBonus === 0 ? 'bonus-disabled' : ''}">
    <span class="label">
        <svg class="icon">
            <use href="#icon-flip"></use>
        </svg>
        Combo: Aufgedeckte Karten (${data.flipComboCount}x)
    </span>
    <span class="value" data-value="">${data.flipBonus > 0 ? data.flipBonus : 'OFF'}</span>
</div>` : ''}

${(data.foundationComboCount > 0) ? `
<div class="row highlight-combo ${data.foundationBonus === 0 ? 'bonus-disabled' : ''}">
    <span class="label">
        <svg class="icon">
            <use href="#icon-foundation"></use>
        </svg>
        Combo: Abgelegte Karten (${data.foundationComboCount}x)
    </span>
    <span class="value" data-value="">${data.foundationBonus > 0 ? data.foundationBonus : 'OFF'}</span>
</div>` : ''}

            ${data.streakBonus > 0 ? `
            <div class="row highlight-streak">
                <span class="label">
                    <svg class="icon">
                        <use href="#icon-streak"></use>
                    </svg>
                    Bonus: Siegesserie
                </span>
                <span class="value" data-value="">${data.streakBonus}</span>
            </div>` : ''}

            <div class="row highlight-streak">
                <span class="label">
                    <svg class="icon">
                        <use href="#icon-time"></use>
                    </svg>
                    Bonus: Zeit
                </span>
                <span class="value" data-value="">${data.timeBonus}</span>
            </div>

            <div class="total highlight-gold">
                <span>GESAMT</span>
                <span class="value" data-value="${data.score}">0</span>
            </div>

        </div>
    </div>

    <div class="ui-container">
    <div class="ui-header">DETAILS</div>
    <div class="ui-content" style="font-size: 0.85em; opacity: 0.9;">

        <div class="detail-line">
            <span>Deck: <strong class="highlight-gold">${kts.game.currentDeckName}</strong></span>
        </div>

        <div class="detail-line">
            <span>Zeit: <span class="highlight-streak">${formatTime(data.time)}</span></span>
            <span class="combo-right">Combo (Flip): <span class="highlight-combo">${data.flipComboCount || 0}</span></span>
        </div>

        <div class="detail-line">
            <span>Züge: <span class="highlight-green">${data.moves}</span></span>
            <span class="combo-right">Combo (Ablagestapel): <span class="highlight-combo">${data.foundationComboCount || 0}</span></span>
        </div>

    </div>
</div>

    <div class="ui-container" style="${data.isNewRecord ? 'border-color: var(--accent-color);' : ''}">
        <div class="ui-header">BESTLEISTUNG</div>
        <div class="ui-content" style="text-align: center;">
            <span
                style="font-size: 1.4em; ${data.isNewRecord ? 'color: gold; font-weight: bold;' : ''}">${data.isNewRecord
            ? '🎉' : 'Rekord:'} ${data.bestScore} Punkte ${data.isNewRecord ? '🎉' : ''}</span><br>
            <small style="opacity: 0.6;">Zuletzt: ${formattedDate}</small>
        </div>
    </div>
</div>
    `;

    // Buttons
    addFooterButton("NÄCHSTES SPIEL", () => {
        closePanel('base-panel-id');
        newGame();
    });

    addFooterButton("NOCHMAL", () => {
        closePanel('base-panel-id');
        restartGame();
    });

    addFooterButton("HIGHSCORES", () => {
        closePanel('base-panel-id');
        toggleScoreboard();

        // Verzögerung von 2000 Millisekunden (2 Sekunden)
        setTimeout(() => {
            quitGame();
        }, 2000);
    });

    addFooterButton("BEENDEN", () => {
        closePanel('base-panel-id');
        quitGame();
    }, 'btn-danger');
}