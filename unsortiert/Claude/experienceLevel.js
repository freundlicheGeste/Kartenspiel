const XP_PER_LEVEL = 10000;

/* ==========================================================================
   XP STATUS BAR
   ========================================================================== */

// Variable zum Speichern des letzten Levels (am besten oben im Script oder in kts.state)
let lastCheckedLevel = null;

function updateLevelUI(addedPoints = 0) {
    const player = kts.game.player;

    if (typeof sessionXP !== 'undefined') {
        sessionXP += addedPoints;
        if (sessionXP < 0) sessionXP = 0;
    }

    const totalXP = player.XP + (sessionXP || 0);
    const level = calculateLevel(totalXP);

    // Fortschritt innerhalb des aktuellen 1000er Blocks
    const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
    const progressPercent = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

    if (lastCheckedLevel === null) {
        lastCheckedLevel = level;
    }

    // UI-Elemente
    const levelNumEl = document.getElementById('level-number');
    if (levelNumEl) levelNumEl.innerText = level;

    // Falls du hier die XP im aktuellen Level (0-999) anzeigen willst:
    const levelXpEl = document.getElementById('xp-number');
    if (levelXpEl) levelXpEl.innerText = xpInCurrentLevel;

    // Fortschrittsbalken & Text (einheitliche Funktion aufrufen!)
    updateRightBar(totalXP, progressPercent);

    if (level > lastCheckedLevel) {
        triggerLevelUpUI(level);
        lastCheckedLevel = level;
    }
}

function playOldLevelUpSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();

    // Hilfsfunktion für einen einzelnen Ton der Fanfare
    const playNote = (freq, gameStartTime, duration) => {
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.type = 'square'; // Etwas vollerer Klang als 'sine'
        osc.frequency.setValueAtTime(freq, gameStartTime);

        gain.gain.setValueAtTime(0.3, gameStartTime); // Lautstärke der Fanfare
        gain.gain.exponentialRampToValueAtTime(0.01, gameStartTime + duration);

        osc.connect(gain);
        gain.connect(context.destination);

        osc.start(gameStartTime);
        osc.stop(gameStartTime + duration);
    };

    // Drei Töne: Grundton, Quarte, Quinte (oder Oktave)
    const now = context.currentTime;
    //playNote(440, now, 0.2);       // A4
    playNote(659, now + 0.3, 0.4);  // E5
    playNote(554, now + 0.15, 0.2); // C#5
}

// Hilfsfunktion für den Effekt
function triggerLevelUpEffect(element) {
    element.classList.remove('level-up-flash');
    void element.offsetWidth; // Reflow erzwingen für Neustart der Animation
    element.classList.add('level-up-flash');

    // Level-Up Sound abspielen
    playLevelUpSound();

    // Optional: Ein Soundeffekt oder Log
    console.log("⭐ LEVEL UP!");

    // Nach der Animation Klasse entfernen (optional)
    setTimeout(() => {
        element.classList.remove('level-up-flash');
    }, 1000);
}

/* ==========================================================================
   XP SYSTEM
   ========================================================================== */

/**
 * Wird am Ende der Runde aufgerufen.
 * Verarbeitet NUR den finalScore (Basis-Punkte), NICHT den Zeitbonus.
 */
function handleGameWinXP(finalScoreWithoutTimer) {
    const p = kts.game.player;
    const oldLevel = calculateLevel(p.XP);

    // Wir nehmen nur die Punkte aus dem Spielverlauf
    const xpGained = finalScoreWithoutTimer;
    p.XP += xpGained;

    const newLevel = calculateLevel(p.XP);

    if (newLevel > oldLevel) {
        p.level = newLevel;
        // Speichere das neue Level in den unlockedRewards, falls noch nicht geschehen
        if (!p.unlockedRewards.includes(newLevel)) {
            p.unlockedRewards.push(newLevel);
        }
        triggerLevelUpAnimation(newLevel);
    }

    saveToDisk();
    updateLevelUI();
}

/**
 * Berechnet das Level basierend auf festen 1000 XP Schritten.
 * Level 1: 0-999 XP
 * Level 2: 1000-1999 XP etc.
 */
function calculateLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function triggerLevelUpAnimation(newLevel) {
    const card = document.createElement('div');
    card.className = 'level-up-card';
    card.innerHTML = `
        <div style="font-size: 1.2em;">LEVEL UP</div>
        <div style="font-size: 4em; margin: 10px 0;">${newLevel}</div>
        <div style="font-size: 0.8em; text-align: center;">NEUER RANG<br>FREIGESCHALTET</div>
    `;
    document.body.appendChild(card);
    setTimeout(() => card.remove(), 4000);
}

/**
 * Übernimmt die sessionXP fest in das Spielerprofil (beim Sieg)
 */
function commitSessionXP() {
    const p = kts.game.player;
    const oldLevel = calculateLevel(p.XP);

    p.XP += sessionXP; // Jetzt erst permanent machen
    sessionXP = 0;     // Puffer leeren

    const newLevel = calculateLevel(p.XP);
    if (newLevel > oldLevel) {
        p.level = newLevel;
        triggerLevelUpAnimation(newLevel);
    }

    saveToDisk();
    updateLevelUI();
}