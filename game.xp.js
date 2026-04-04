/* =====================================================
   EXPERIENCE & LEVEL
   Verantwortlich für: XP-Berechnung, Level-Anzeige,
   Level-Up-Animation und -Sound, Session-XP committen.
   Abhängigkeiten: game.state.js
===================================================== */

const XP_PER_LEVEL = 10000;

let sessionXP        = 0;
let lastCheckedLevel = null;

/* =====================================================
   LEVEL BERECHNUNG
===================================================== */

/**
 * Berechnet das Level aus dem Gesamt-XP-Wert.
 * Level 1: 0–9999 XP, Level 2: 10000–19999 XP, usw.
 * @param {number} xp
 * @returns {number}
 */
function calculateLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/* =====================================================
   UI UPDATE
===================================================== */

/**
 * Aktualisiert die Level- und XP-Anzeige.
 * Addiert addedPoints zur laufenden Session-XP.
 * Löst Level-Up-Animation aus wenn ein neues Level erreicht wurde.
 * @param {number} [addedPoints=0]
 */
function updateLevelUI(addedPoints = 0) {
    sessionXP = Math.max(0, sessionXP + addedPoints);

    const player         = kts.game.player;
    const totalXP        = player.XP + sessionXP;
    const level          = calculateLevel(totalXP);
    const xpInLevel      = totalXP % XP_PER_LEVEL;
    const progressPercent = (xpInLevel / XP_PER_LEVEL) * 100;

    if (lastCheckedLevel === null) lastCheckedLevel = level;

    const levelEl = document.getElementById('level-number');
    if (levelEl) levelEl.innerText = level;

    const xpEl = document.getElementById('xp-number');
    if (xpEl) xpEl.innerText = xpInLevel;

    updateRightBar?.(totalXP, progressPercent);

    if (level > lastCheckedLevel) {
        triggerLevelUpUI(level);
        lastCheckedLevel = level;
    }
}

/* =====================================================
   SPIELENDE XP
===================================================== */

/**
 * Verarbeitet XP am Ende einer gewonnenen Runde.
 * Nutzt nur den Spiel-Score (kein Timer-Bonus).
 * @param {number} finalScoreWithoutTimer
 */
function handleGameWinXP(finalScoreWithoutTimer) {
    const player   = kts.game.player;
    const oldLevel = calculateLevel(player.XP);

    player.XP += finalScoreWithoutTimer;

    const newLevel = calculateLevel(player.XP);
    if (newLevel > oldLevel) {
        player.level = newLevel;
        if (!player.unlockedRewards.includes(newLevel)) {
            player.unlockedRewards.push(newLevel);
        }
        triggerLevelUpAnimation(newLevel);
    }

    saveToDisk();
    updateLevelUI();
}

/**
 * Übernimmt die Session-XP permanent ins Spielerprofil.
 * Wird beim Sieg aufgerufen — nicht vorher.
 */
function commitSessionXP() {
    const player   = kts.game.player;
    const oldLevel = calculateLevel(player.XP);

    player.XP += sessionXP;
    sessionXP  = 0;

    const newLevel = calculateLevel(player.XP);
    if (newLevel > oldLevel) {
        player.level = newLevel;
        triggerLevelUpAnimation(newLevel);
    }

    saveToDisk();
    updateLevelUI();
}

/* =====================================================
   LEVEL-UP ANIMATIONEN
===================================================== */

/**
 * Zeigt eine Level-Up-Karte auf dem Bildschirm an.
 * Entfernt sich nach 4 Sekunden automatisch.
 * @param {number} newLevel
 */
function triggerLevelUpAnimation(newLevel) {
    const card       = document.createElement('div');
    card.className   = 'level-up-card';
    card.innerHTML   = `
        <div style="font-size:1.2em;">LEVEL UP</div>
        <div style="font-size:4em;margin:10px 0;">${newLevel}</div>
        <div style="font-size:0.8em;text-align:center;">NEUER RANG<br>FREIGESCHALTET</div>`;
    document.body.appendChild(card);
    setTimeout(() => card.remove(), 4000);
}

/**
 * Löst einen Flash-Effekt und Sound auf einem Element aus.
 * @param {HTMLElement} element
 */
function triggerLevelUpEffect(element) {
    element.classList.remove('level-up-flash');
    void element.offsetWidth; // Reflow für Animations-Neustart
    element.classList.add('level-up-flash');

    playLevelUpSound?.();
    console.log('⭐ LEVEL UP!');

    setTimeout(() => element.classList.remove('level-up-flash'), 1000);
}

/**
 * Wird von updateLevelUI() aufgerufen wenn das Level steigt.
 * @param {number} level
 */
function triggerLevelUpUI(level) {
    triggerLevelUpAnimation(level);
}

/* =====================================================
   AUDIO
===================================================== */

/**
 * Spielt einen einfachen synthetischen Fanfare-Sound via Web Audio API.
 * Fallback wenn keine Audio-Datei vorhanden ist.
 */
function playOldLevelUpSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();

    const playNote = (freq, startTime, duration) => {
        const osc  = context.createOscillator();
        const gain = context.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const now = context.currentTime;
    playNote(659, now + 0.3, 0.4); // E5
    playNote(554, now + 0.15, 0.2); // C#5
}
