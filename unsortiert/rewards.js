/**
 * Prüft, ob ein Reward freigeschaltet ist, ohne es im KTS zu speichern.
 * @param {Object} reward - Das Reward-Objekt
 * @returns {boolean}
 */
function isRewardUnlocked(reward) {
    const player = kts.game.player;
    const stats = kts.stats;

    // 1. Check nach Level
    if (reward.level && player.level >= reward.level) return true;

    // 2. Check nach XP (z.B. "Fleißiger Wicht")
    if (reward.minXP && player.XP >= reward.minXP) return true;

    // 3. Check nach Statistiken (z.B. Siege)
    if (reward.minWins && stats.totalWins >= reward.minWins) return true;

    // 4. Check nach Win-Streak
    if (reward.minStreak && kts.game.winStreak >= reward.minStreak) return true;

    return false;
}

// Erweitertes Reward-Array
const LEVEL_REWARDS = [
    { level: 2, title: "Anfänger", msg: "Design: Rote Streifen", type: 'unlock' },
    { level: 10, title: "Solitär-Ritter", msg: "Undo kostet nur noch 1 Pkt!", type: 'perk' },
    { minXP: 1230, title: "Fleißiger Wicht", msg: "XP-Meilenstein erreicht!", type: 'badge' },
    { minStreak: 5, title: "Serientäter", msg: "5 Siege in Folge!", type: 'streak' }
];




// ALTER SHIT >

/**
 * Belohnungssystem bis Level 20
 * Leicht erweiterbar durch Hinzufügen von Objekten.
 */
const LEVEL_REWARDOS = [
    { level: 2, title: "Anfänger", msg: "Neues Design: Rote Streifen freigeschaltet!" },
    { level: 3, title: "Karten-Lehrling", msg: "Bonus: +2 Punkte pro Foundation-Karte permanent!" },
    { level: 5, title: "Stapel-Experte", msg: "Neues Design: 'Wave' freigeschaltet!" },
    { level: 10, title: "Solitär-Ritter", msg: "Spezial: 'Undo' kostet nur noch 1 Punkt!" },
    { level: 15, title: "Großmeister", msg: "Goldener Kartenrücken verfügbar!" },
    { level: 20, title: "Legende", msg: "Du hast alle Decks gemeistert!" },
];

function updateRewardsUI() {
    const container = document.getElementById('rewards-list');
    if (!container) return;

    // Hole das Array direkt vom geladenen Objekt
    const unlocked = kts.game.player.unlockedRewards || [];

    // Debugging-Hilfe: Falls nichts freigeschaltet ist, obwohl es sollte
    console.log("Freigeschaltete Level:", unlocked);

    container.innerHTML = LEVEL_REWARDS.map(r => {
        // Wir wandeln beide Werte sicherheitshalber in Zahlen um für den Vergleich
        const isUnlocked = unlocked.some(lvl => Number(lvl) === Number(r.level));

        return `
            <div class="reward-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="reward-icon">${isUnlocked ? '🎁' : '🔒'}</div>
                <div class="reward-info">
                    <strong>Level ${r.level}: ${r.title}</strong>
                    <p>${r.msg}</p>
                    ${isUnlocked ? '<span style="color:#ffd700; font-size:0.6em;">FREIGESCHALTET</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}