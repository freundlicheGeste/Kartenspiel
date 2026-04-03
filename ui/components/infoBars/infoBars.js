// left bar     -- mode: 'auto', 'deck', 'player'
// right bar    -- mode: 'progress', 'xp'
// leftBarState -- mode: 'deck', 'player'

// Runtime-Variablen (werden beim Tab-Reload zurückgesetzt)
let barInterval = null;
let leftBarState = 'player'; // Auf 'player' setzen, damit der erste Toggle zu 'deck' wird
let activeBarRightMode = 'progress'; // Temporärer State für die rechte Bar
let isLevelUpActive = false;

function applyBarSettings() {
    const leftBar = document.getElementById('bar-left');
    const rightBar = document.getElementById('bar-right');

    // Initialen Modus aus der gespeicherten Config laden (nur beim Anwenden/Start)
    activeBarRightMode = kts.cfg.barRightMode || 'progress';

    // 1. Sichtbarkeit anwenden
    if (leftBar) leftBar.classList.toggle('hidden', !kts.cfg.barLeftVisible);
    if (rightBar) rightBar.classList.toggle('hidden', !kts.cfg.barRightVisible);

    // 2. Linke Bar Timer-Management
    clearInterval(barInterval);

    if (kts.cfg.barLeftVisible) {
        //folgender code bis 3. war hier, dann wird allerdings nichts angezeigt, wenn manuell die sichtbarkeit getoggelt wird
    }

    if (kts.cfg.barLeftMode === 'auto') {
        // Dauer bis zum Anzeige-Wechsel (Standard 15000)
        const speed = kts.cfg.barInterval || 15000;
        // Timer starten
        barInterval = setInterval(() => {
            if (!isLevelUpActive) switchLeftBarContent();
        }, speed);
        // Sofort einmal triggern, damit nicht 3s gewartet wird
        switchLeftBarContent();
    } else {
        // Manueller Modus
        leftBarState = (kts.cfg.barLeftMode === 'deck') ? 'player' : 'deck';
        switchLeftBarContent();
    }

    // 3. Rechte Bar aktualisieren
    if (kts.cfg.barRightVisible) {
        updateRightBar(); // Nutzt jetzt kts.cfg.barRightMode
    }
}

function switchLeftBarContent() {
    const el = document.getElementById('bar-left-text');
    if (!el || isLevelUpActive) return;

    // Wechsel den State
    leftBarState = (leftBarState === 'deck') ? 'player' : 'deck';
    // Kleiner Fade-Out Effekt beim Wechseln
    el.style.opacity = 0;

    setTimeout(() => {
        let textToShow = "";
        let colorClass = "";

        // kts.game.activeGameInProgress statt gameState.is(GameStates.RUNNING)
        // weil es früher greift und kürzer als gameState.is(GameStates.RUNNING) || gameState.is(GameStates.GESTARTET) ist
        if (leftBarState === 'deck') {
            // Logik-Wechsel: Replay vs. Aktiv vs. Inaktiv
            if (isReplayMode && kts.game.activeGameInProgress) {
                textToShow = "Replay: " + (kts.game.currentDeckName || "Deck");
                colorClass = 'color-replay replay-icon'; // Blaues Leuchten & Icon
            } else if (kts.game.activeGameInProgress) {
                // Normales laufendes Spiel
                textToShow = kts.game.currentDeckName || "Standard Deck";
                colorClass = 'color-deck';
            } else {
                // Vor dem Spiel (Menü-Modus)
                textToShow = (kts.cfg.deckSource === 'deck-generated') ? "Deck: Zufällig" : "Deck: Integriert";
                colorClass = 'color-deck';
            }
        } else {
            // ... Code für den Player-Zweig
            if (kts.game.activeGameInProgress) {
                // Während des Spiels: Spieler-Level
                textToShow = `Level ${kts.game.player.level}` || "Spieler-Level";
                colorClass = 'color-level';
            } else {
                // Vor dem Spiel: Spieler-Name
                textToShow = kts.game.player.name || "Spieler";
                colorClass = 'color-player';
            }
        }

        updateLeftBarDisplay(textToShow, colorClass);
        el.style.opacity = 1;
    }, 300);
}

function updateRightBar(totalXP, progressPercent) {
    const prog = document.getElementById('progress-wrapper');
    const xpTextEl = document.getElementById('bar-xp-text');
    const fill = document.getElementById('bar-progress-fill');

    if (!prog || !xpTextEl || !fill) return;

    // Falls die Funktion ohne Parameter aufgerufen wird (Initialisierung)
    if (totalXP === undefined) {
        const baseXP = Number(kts.game.player.XP) || 0;
        const session = Number(sessionXP) || 0;

        totalXP = baseXP + session;
        progressPercent = ((totalXP % 1000) / 1000) * 100;
    }
    if (isNaN(totalXP)) {
        console.error("❌ NaN detected in updateRightBar", {
            playerXP: kts.game.player.XP,
            sessionXP,
            totalXP
        });
    }

    // Wir nutzen hier activeBarRightMode (temporär) statt kts.cfg (weil erst nach der Session die Punkte gespeichert werden)
    if (activeBarRightMode === 'progress') {
        prog.style.display = 'block';
        xpTextEl.style.display = 'none';
        fill.style.width = `${progressPercent}%`;
    } else {
        prog.style.display = 'none';
        xpTextEl.style.display = 'block';
        xpTextEl.innerText = formatXP(totalXP) + " XP";
    }
}

function updateLeftBarDisplay(text, typeClass) {
    const textSpan = document.getElementById('bar-left-text');
    if (!textSpan) return;

    // 1. Spielernamen immer hart kürzen (z.B. max 12 Zeichen)
    let processedText = text;
    if (typeClass === 'color-player' && text.length > 12) {
        processedText = text.substring(0, 10) + "..";
    }

    // Text setzen
    textSpan.innerText = processedText;

    // Klassen setzen (Basis-Klasse + Farbe)
    // Wir stellen sicher, dass 'ticker-text' immer dabei ist für die Animation
    textSpan.className = 'ticker-text ' + typeClass;

    // 2. Ticker nur aktivieren, wenn der Text wirklich zu lang für die 180px ist
    // (Bei 180px Breite passen ca. 15-18 Zeichen in fetter Schrift)
    if (processedText.length > 16) {
        textSpan.classList.remove('no-ticker');
    } else {
        textSpan.classList.add('no-ticker');
    }
}

function refreshLeftBar(forceState = null) {
    // 1. Timer zurücksetzen, damit der Rhythmus neu startet
    if (kts.cfg.barLeftMode === 'auto') {
        clearInterval(barInterval);
        const speed = kts.cfg.barInterval || 15000;
        barInterval = setInterval(() => {
            if (!isLevelUpActive) switchLeftBarContent();
        }, speed);
    }

    // 2. Optional: Einen spezifischen Status erzwingen
    // Wenn wir ein Spiel starten, wollen wir meistens sofort das Deck sehen.
    if (forceState) {
        // Wir setzen den state auf das Gegenteil von dem, was wir wollen, 
        // da switchLeftBarContent() ihn als erstes flippt.
        leftBarState = (forceState === 'deck') ? 'player' : 'deck';
    }

    switchLeftBarContent();
}

function toggleRightBarContent() {
    // kts.cfg.barRightMode = (kts.cfg.barRightMode === 'progress') ? 'xp' : 'progress';
    // Ändert NUR den Runtime-State, speichert NICHT in kts.cfg
    activeBarRightMode = (activeBarRightMode === 'progress') ? 'xp' : 'progress';
    updateRightBar();
}

/* ==========================================================================
   LEVEL-UP (seitliche Bars)
   ========================================================================== */

// Level Up Event
function triggerLevelUpUI(newLevel) {
    isLevelUpActive = true;
    const leftBar = document.getElementById('bar-left');
    const leftText = document.getElementById('bar-left-text');
    const rightBar = document.getElementById('bar-right');
    const progressFill = document.getElementById('bar-progress-fill');
    const progressContainer = document.querySelector('.progress-container');

    // Backup des aktuellen Modus, um ihn nach 10 Sek wiederherzustellen
    const backupMode = activeBarRightMode;

    // Linke Bar auf Level umstellen
    leftText.innerText = "LEVEL " + newLevel;
    leftText.className = 'color-level-up'; // Magenta Klasse

    // Rechte Bar auf Progress zwingen
    activeBarRightMode = 'progress'; // Für die Animation erzwingen
    updateRightBar();

    leftBar.classList.remove('hidden');
    rightBar.classList.remove('hidden');

    leftBar.classList.add('flash', 'color-level-up');
    rightBar.classList.add('flash', 'color-level-up');
    progressFill.classList.add('color-level-up');
    progressContainer.classList.add('color-level-up');

    // Nach 10 Sek zurücksetzen
    setTimeout(() => {
        isLevelUpActive = false;
        leftBar.classList.remove('flash', 'color-level-up');
        rightBar.classList.remove('flash', 'color-level-up');
        progressFill.classList.remove('color-level-up');
        progressContainer.classList.remove('color-level-up');
        // Wiederherstellen des ursprünglichen Modus (aus Config oder vorherigem Toggle)
        activeBarRightMode = backupMode;
        applyBarSettings(); // Startet den Auto-Wechsel Timer neu
    }, 10000);
}

/* ==========================================================================
   INFO BARS (Highsocre Stats Bar)(mitte)
   ========================================================================== */

/**
 * Aktualisiert die Highscore-Leiste und triggert Animationen
 */
function updateStatsInfoBar(deck, deckName = "dieses Deck", triggerAnimation = false, isNewRecord = false) {
    const bar = document.getElementById('deck-best-stats');
    if (!bar) return;

    const key = getDeckKey(deck);
    const stats = (kts.stats && kts.stats.decks) ? kts.stats.decks[key] : null;

    if (stats && (stats.bestMoves || stats.bestScore)) {

        let formattedTime = formatTime(stats.bestTime);

        const movesEl = document.getElementById('best-moves-val');
        const scoreEl = document.getElementById('best-score-val');
        const timeEl = document.getElementById('best-time-val');

        if (movesEl) movesEl.innerText = stats.bestMoves || "0";
        if (scoreEl) scoreEl.innerText = stats.bestScore || "0";
        if (timeEl) timeEl.innerText = formattedTime || "00:00";

        bar.classList.remove('hidden');

        // ---> NEU
        const label = document.getElementById('best-stats-title'); // Falls du ein Label hast

        if (isNewRecord) {
            // Füge ein "NEW RECORD" Badge hinzu, falls es noch nicht da ist
            if (!document.getElementById('new-record-badge')) {
                const badge = document.createElement('span');
                badge.id = 'new-record-badge';
                badge.className = 'record-badge';
                badge.innerText = 'NEW RECORD!';
                label.appendChild(badge);
            }
            triggerAnimation = true; // Rekord erzwingt immer Animation
        }

        // --- ANIMATIONS LOGIK ---
        if (triggerAnimation) {
            [movesEl, scoreEl, timeEl].forEach(el => {
                if (!el) return;
                // Animation neu triggern (Klasse entfernen und neu hinzufügen)
                el.classList.remove('stats-update-pulse');
                void el.offsetWidth; // Reflow erzwingen
                el.classList.add('stats-update-pulse');
            });
        }
        // <--- NEU

        if (deckName) {
            console.groupCollapsed(`%c HIGHSCORE %c für ${deckName}`, 'color: #ffd700; font-weight: bold;', 'color: #fff; font-weight: normal;');
            console.log(`%c Moves →%c ${stats.bestMoves}`, 'color: #fff', 'color: #00ff41; font-weight: bold;');
            console.log(`%c Score →%c ${stats.bestScore}`, 'color: #fff', 'color: #ffd700; font-weight: bold;');
            console.log(`%c Time  →%c ${stats.bestTime} (${formatTime(stats.bestTime)})`, 'color: #fff', 'color: #00e5ff; font-weight: bold;');
            console.groupEnd();
        }
    } else {
        // Falls das Deck neu ist, blenden wir die Leiste aus
        bar.classList.add('hidden');
    }
}

/**
 * DEBUG-FUNKTION: Simuliert einen Highscore-Update zum Testen der UI
 */
function debugTestHighscoreEffect() {
    console.log("%c 🧪 Debug: Teste Highscore-Animation...", "color: #bb86fc;");

    // Wir nehmen ein fiktives Deck für den Test
    const dummyDeck = ["H-10", "S-A"];
    const key = getDeckKey(dummyDeck);

    // Kurzzeitiges Mocking der Stats, falls keine existieren
    if (!kts.stats.decks[key]) {
        kts.stats.decks[key] = { bestMoves: 42, bestScore: 9999, bestTime: 120, label: "Test Deck" };
    }

    // Aufruf mit dem Animations-Flag
    updateStatsInfoBar(dummyDeck, "DEBUG MODE", true);
}

/* ==========================================================================
   HILFSFUNKTIONEN
   ========================================================================== */

// XP Formatierung mit Tausenderpunkt
function formatXP(amount) {
    return new Intl.NumberFormat('de-DE').format(amount);
}