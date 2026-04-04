/* =====================================================
   UI STUBS & BRIDGE-FUNKTIONEN
   Verantwortlich für: Sichere Fallback-Implementierungen
   für alle UI-Funktionen, die von anderen Modulen
   aufgerufen werden, aber in externen Dateien
   (basePanel, infoBars, buttonBar, …) definiert sind.

   WARUM:
   Alle anderen .js-Dateien nutzen optional chaining
   (foo?.()) wo möglich. Wo das nicht möglich ist
   (direkte Aufrufe wie openPanel('win', data)), braucht
   es eine garantiert vorhandene globale Funktion.

   KONVENTION:
   • Jede Stub-Funktion loggt in DEV_MODE eine Warnung.
   • Echte Implementierungen in ihren jeweiligen
     Dateien (basePanel.js, infoBars.js usw.) überschreiben
     diese Stubs — da JS letzte Definition gewinnt,
     müssen die echten Dateien NACH diesem Stub geladen werden.
   • Dieser File muss als ERSTER Script-Tag geladen werden
     (nach app_storage.js).

   Abhängigkeiten: devLogs.js (IS_DEV_MODE)
===================================================== */

/* =====================================================
   PANEL-SYSTEM
   Echte Impl.: basePanel/basePanel.js
===================================================== */

/**
 * Öffnet ein benanntes Panel mit optionalen Daten.
 * @param {string} panelName
 * @param {Object} [data]
 */
function openPanel(panelName, data = {}) {
    if (typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE) {
        console.warn(`[ui_stubs] openPanel('${panelName}') — echte Impl. noch nicht geladen.`);
    }
}

/**
 * Schließt ein Panel per ID.
 * @param {string} panelId
 */
function closePanel(panelId) {
    if (typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE) {
        console.warn(`[ui_stubs] closePanel('${panelId}') — echte Impl. noch nicht geladen.`);
    }
}

/**
 * Schließt alle offenen Overlays.
 */
function closeAllOverlays() { }

/* =====================================================
   DIALOG-TRIGGER
   Echte Impl.: basePanel/dialogs/
===================================================== */

function triggerStalemateDialog() {
    if (typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE) {
        console.warn('[ui_stubs] triggerStalemateDialog() — Impl. fehlt.');
    }
}

function triggerQuitDialog() {
    if (typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE) {
        console.warn('[ui_stubs] triggerQuitDialog() — Impl. fehlt.');
    }
}

function triggerRestartDialog() {
    if (typeof IS_DEV_MODE !== 'undefined' && IS_DEV_MODE) {
        console.warn('[ui_stubs] triggerRestartDialog() — Impl. fehlt.');
    }
}

/* =====================================================
   INFO BARS
   Echte Impl.: ui/components/infoBars/infoBars.js
===================================================== */

/**
 * Aktualisiert die linke Info-Bar.
 * @param {'player'|'deck'} mode
 */
function refreshLeftBar(mode) { }

/**
 * Aktualisiert die rechte Info-Bar (XP/Progress).
 * @param {number} totalXP
 * @param {number} progressPercent
 */
function updateRightBar(totalXP, progressPercent) { }

/**
 * Aktualisiert die mittlere Stats-Bar mit Deck-Bestleistungen.
 * @param {Object[]} deck
 * @param {string}   deckName
 */
function updateStatsInfoBar(deck, deckName) { }

/**
 * Wendet gespeicherte Bar-Einstellungen an.
 */
function applyBarSettings() { }

/* =====================================================
   STATUS BAR / LEVEL
   Echte Impl.: ui/components/statusBar/statusBar.js
===================================================== */

function toggleLevelDetails() { }
function toggleRightBarContent() { }

/* =====================================================
   BUTTON BAR
   Echte Impl.: ui/components/buttonBar/buttonBar.js
===================================================== */

function toggleControls() { }

/* =====================================================
   AUDIO
   Echte Impl.: audio/gameSounds.js
===================================================== */

function playVictorySound() { }
function playDealSound() { }
function playFinalDealSound() { }
function playLevelUpSound() { }
function toggleMute() { }

/* =====================================================
   STORAGE MIGRATION
   Echte Impl.: wird optional von app_storage.js gerufen
===================================================== */

function migrateStorage() { }

/* =====================================================
   REWARDS / MISC
   Echte Impl.: player/rewards.js
===================================================== */

function toggleRewards() { }