// Karten austeilen
function playDealSound() {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = context.sampleRate * 0.05; // Sehr kurz (50ms)
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    // Weißes Rauschen erzeugen
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    noise.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';

    filter.frequency.setValueAtTime(3000, context.currentTime); // Filtert die ganz hohen Frequenzen raus
    filter.frequency.exponentialRampToValueAtTime(500, context.currentTime + 0.05);

    const gain = context.createGain();
    const volume = kts.cfg.audio.volEffects;
    gain.gain.setValueAtTime(volume * 0.4, context.currentTime); // Etwas leiser, da es oft triggert
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    noise.start();
}

// Letzte Karte austeilen
function playFinalDealSound() {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    // Ein abfallender Ton für das "Einrasten"
    osc.frequency.setValueAtTime(200, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.2);

    gain.gain.setValueAtTime(kts.cfg.audio.volEffects * 0.6, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.2);
}

// Karten mischen
function playShuffleSound() {
    if (kts.cfg.audio.mute) return;

    for (let i = 0; i < 6; i++) {
        setTimeout(() => playDealSound(), i * 40);
    }
}

// Level-Up Sound
function playLevelUpSound() {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const masterVol = kts.cfg.audio.volEffects;

    const playTone = (freq, start, duration) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'square'; // 'square' klingt retro und kraftvoll

        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + duration);

        gain.gain.setValueAtTime(masterVol * 0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

        osc.connect(gain);
        gain.connect(context.destination);
        osc.start(start);
        osc.stop(start + duration);
    };

    // Zwei Töne kurz hintereinander
    playTone(440, context.currentTime, 0.1);      // A4
    playTone(659.25, context.currentTime + 0.1, 0.3); // E5
}

// Ploppen
function playRevealSound() {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'triangle'; // Weicher als Square, aber perkussiver als Sine
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    gain.gain.setValueAtTime(kts.cfg.audio.volEffects * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(now + 0.1);
}

// Spiel gewonnen/beendet (kein guter Sound)
function playVictorySound() {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const now = context.currentTime;
    const masterVol = kts.cfg.audio.volEffects;

    // Funktion für eine einzelne Note des Akkords
    const playNote = (freq, gameStartTime, duration, type = 'sine') => {
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, gameStartTime);
        // Kleiner Pitch-Slide nach oben für mehr "Glanz"
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, gameStartTime + duration);

        gain.gain.setValueAtTime(0, gameStartTime);
        gain.gain.linearRampToValueAtTime(masterVol * 0.3, gameStartTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, gameStartTime + duration);

        osc.connect(gain);
        gain.connect(context.destination);

        osc.start(gameStartTime);
        osc.stop(gameStartTime + duration);
    };

    // Ein C-Dur Akkord (C4, E4, G4, C5)
    playNote(261.63, now, 1.5);          // C4
    playNote(329.63, now + 0.2, 1.5);    // E4
    playNote(392.00, now + 0.4, 1.5);    // G4
    playNote(523.25, now + 0.6, 2.0);    // C5 (Oktave)

    // Ein kleiner "Glitzer-Effekt" obendrauf (hohe Töne)
    for (let i = 0; i < 5; i++) {
        playNote(1000 + (i * 200), now + 0.8 + (i * 0.1), 0.5, 'triangle');
    }
}

// dumpfer Ton (passt nicht als StartSound)
function playStartSound() {
    // 1. MASTER CHECK: Wenn stumm, dann sofort raus
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, context.currentTime + 0.1);

    // 2. LAUTSTÄRKE: Wir nutzen den Wert aus der Config
    const volume = kts.cfg.audio.volEffects;
    gainNode.gain.setValueAtTime(volume, context.currentTime); // (0.1 - 1.0)
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
}

// Basis-Funktion für alle Sounds (um Code zu sparen)
function playSynthSound(freq, type, duration, volMult = 1) {
    if (kts.cfg.audio.mute) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Dynamische Lautstärke basierend auf Config * Multiplikator
    const masterVol = kts.cfg.audio.volEffects;
    gain.gain.setValueAtTime(masterVol * volMult, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    osc.stop(now + duration);
}

// Spezifische Sounds:
const sounds = {
    move: () => playSynthSound(400, 'sine', 0.1, 0.3),         // Kurzes "Plopp"
    flip: () => playSynthSound(600, 'triangle', 0.15, 0.4),    // Etwas heller
    error: () => {                                             // Tiefer Doppel-Ton
        playSynthSound(150, 'sawtooth', 0.1, 0.2);
        setTimeout(() => playSynthSound(120, 'sawtooth', 0.1, 0.2), 80);
    },
    success: () => playSynthSound(880, 'sine', 0.3, 0.5)       // Hoher Bestätigungston
};