const APP_SHORTCUTS = {
    // Shortcuts mit Shift + Alt
    modifier: {
        'Digit1': { label: 'Linke Bar (Status)', dev: true, action: () => document.getElementById('bar-left').classList.toggle('hidden') },
        'Digit2': { label: 'Rechte Bar (XP/Progress)', dev: true, action: () => document.getElementById('bar-right').classList.toggle('hidden') },
        'KeyC': { label: 'Changelog', action: () => togglePanel('changelog') },
        'KeyD': { label: 'Debug Stats (Dummy)', dev: true, action: () => toggleDebugStats() },
        'KeyI': { label: 'Informationen & Regeln', action: () => togglePanel('gameInfo') },
        'KeyK': { label: 'Panel Controls Übersicht', dev: true, action: () => togglePanel('controls') },
        'KeyR': { label: 'Belohnungen (Rewards)', action: () => togglePanel('rewards') },
        'KeyW': { label: 'Win-Dialog (Test)', dev: true, action: () => togglePanel('win', gameExResult) },
        'KeyY': { label: 'Stalemate Dialog', dev: true, action: () => /*togglePanel('stalemate')*/ triggerStalemateDialog() }
    },
    // Einfache Tasten ohne Modifier
    simple: {
        'm': { label: 'Mute Toggle', action: () => toggleMute() },
        'p': { label: 'Einstellungen', action: () => togglePanel('settings') },
        'q': { label: 'Spiel abbrechen', action: () => /*togglePanel('quit')*/ triggerQuitDialog() },
        'r': { label: 'Neustart', action: () => /*togglePanel('restart')*/ triggerRestartDialog() },
        's': { label: 'Scoreboard', action: () => toggleScoreboard() },
        'u': { label: 'Undo', action: () => undoLastMove() },
        'escape': { label: 'Panel schließen', action: () => closePanel('base-panel-id') }
    }
};

// Konsolen Gruppe der Tastenkombinationen erstellen
function logShortcuts() {
    console.groupCollapsed('%c 🛠️ APP SHORTCUTS', 'color: #ffd700; font-weight: bold; font-size: 1.2em;');

    // 1. OFFIZIELLE KOMBINATIONEN (Shift + Alt)
    console.log('%c--- SHIFT + ALT + KEY ---', 'color: #888; font-style: italic; margin-top: 5px;');
    for (const [code, data] of Object.entries(APP_SHORTCUTS.modifier)) {
        if (data.dev) continue; // Hier nur die non-dev anzeigen
        // Macht aus "Digit1" einfach "1" und aus "KeyC" einfach "C"
        const keyChar = code.replace('Key', '').replace('Digit', '');
        console.log(`%c ${keyChar} %c → ${data.label}`, 'color: #ffd700; font-weight: bold;', 'color: #fff;');
    }

    // 2. EINFACHE TASTEN
    console.log('%c--- KEY ---', 'color: #888; font-style: italic; margin-top: 10px;');
    for (const [key, data] of Object.entries(APP_SHORTCUTS.simple)) {
        if (data.dev) continue;
        console.log(`%c ${key.toUpperCase()} %c → ${data.label}`, 'color: #ffd700; font-weight: bold;', 'color: #fff;');
    }

    if (IS_DEV_MODE) {
        // 3. DEVELOPER TOOLS (Alles mit dev: true)
        console.log('%c--- 🚧 DEVELOPER TOOLS ---', 'color: #ff00ff; font-weight: bold; margin-top: 15px;');

        // Wir suchen in beiden Bereichen (modifier & simple) nach dev-Einträgen
        const allDevEntries = [
            ...Object.entries(APP_SHORTCUTS.modifier),
            ...Object.entries(APP_SHORTCUTS.simple)
        ].filter(([_, data]) => data.dev);

        allDevEntries.forEach(([key, data]) => {
            const isCombo = key.startsWith('Key') || key.startsWith('Digit');
            const prefix = isCombo ? 'Shift+Alt+' : '';
            const displayKey = key.replace('Key', '').replace('Digit', '').toUpperCase();

            console.log(
                `%c ${prefix}${displayKey} %c → ${data.label}`,
                'color: #ff00ff; font-weight: bold; background: rgba(255,0,255,0.1); padding: 1px 4px; border-radius: 3px;',
                'color: #ffb3ff; font-style: italic;'
            );
        });
    }

    console.groupEnd();
}

// Tastenkombinationen aktivieren
window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement.tagName.toLowerCase();
    if (activeEl === 'input' || activeEl === 'textarea') return;

    // Sonderfall: Leertaste für Spielstart
    if (gameState.is(GameStates.IDLE) && e.code === 'Space') {
        e.preventDefault();
        newGame();
        return;
    }

    // A: Check für Shift + Alt Shortcuts
    if (e.shiftKey && e.altKey) {
        const shortcut = APP_SHORTCUTS.modifier[e.code];
        if (shortcut) {
            e.preventDefault();
            shortcut.action();
        }
        return;
    }

    // B: Check für einfache Shortcuts
    const simpleShortcut = APP_SHORTCUTS.simple[e.key.toLowerCase()];
    if (simpleShortcut) {
        simpleShortcut.action();
    }
});