const XPManager = {
    // Einstellungen
    settings: {
        showRemainingXP: false, // Per Toggle umschaltbar
        animationSpeed: 40      // ms pro Schritt
    },

    // Der zentrale Update-Call
    updateUI(addedPoints = 0) {
        const player = kts.game.player;

        // 1. Session-Puffer aktualisieren
        if (typeof sessionXP !== 'undefined') {
            sessionXP += addedPoints;
            if (sessionXP < 0) sessionXP = 0;
        }

        // 2. Daten berechnen
        const totalXP = player.XP + (sessionXP || 0);
        const level = calculateLevel(totalXP);
        const xpInCurrentLevel = totalXP % 1000;
        const progressPercent = (xpInCurrentLevel / 1000) * 100;

        // 3. UI: Level Nummer
        this.animateValue('level-number', level);

        // 4. UI: XP Nummer (Logik-Toggle: "Schon erreicht" vs "Noch benötigt")
        const xpDisplayValue = this.settings.showRemainingXP
            ? (1000 - xpInCurrentLevel)
            : xpInCurrentLevel;
        this.animateValue('xp-number', xpDisplayValue);

        // 5. UI: Progress Bar & Gesamt-Text
        this.updateBarElements(totalXP, progressPercent);

        // 6. Level-Up Logik
        if (lastCheckedLevel !== null && level > lastCheckedLevel) {
            triggerLevelUpUI(level);
        }
        lastCheckedLevel = level;
    },

    // Hilfsfunktion für die Animation (dein Badge-Stil)
    animateValue(elementId, targetValue) {
        const el = document.getElementById(elementId);
        if (!el) return;

        let current = parseInt(el.innerText) || 0;
        if (current === targetValue) return;

        // Falls bereits eine Animation läuft, stoppen (optional, verhindert "Zittern")
        if (el._animationTimeout) clearTimeout(el._animationTimeout);

        const step = current < targetValue ? 1 : -1;

        const tick = () => {
            current += step;
            el.innerText = current;

            if (current !== targetValue) {
                el._animationTimeout = setTimeout(tick, this.settings.animationSpeed);
            }
        };

        tick();
    },

    // Hilfsfunktion für die rechte Bar (Balken & Text)
    updateBarElements(totalXP, progressPercent) {
        const prog = document.getElementById('progress-wrapper');
        const xpTextEl = document.getElementById('bar-xp-text');
        const fill = document.getElementById('bar-progress-fill');

        if (!prog || !xpTextEl || !fill) return;

        // Modus-Abfrage (aus deinen ursprünglichen App-Settings/Variablen)
        if (activeBarRightMode === 'progress') {
            prog.style.display = 'block';
            xpTextEl.style.display = 'none';
            // Balken werden meist direkt gesetzt (CSS transition nutzen für Smoothness!)
            fill.style.width = `${progressPercent}%`;
        } else {
            prog.style.display = 'none';
            xpTextEl.style.display = 'block';
            xpTextEl.innerText = formatXP(totalXP) + " XP";
        }
    },

    // Toggle-Funktion für deine Settings
    toggleXPDisplayMode() {
        this.settings.showRemainingXP = !this.settings.showRemainingXP;
        this.updateUI(0); // UI mit aktuellen Werten neu zeichnen
    }
};