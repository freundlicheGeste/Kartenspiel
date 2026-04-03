function renderInfo(contentElement, addFooterButton) {
    const panelId = 'base-panel-id';

    // Logik für das Schließen
    const handleCloseAction = () => {
        // Event-Listener entfernen, damit er nicht mehrfach feuert, wenn das Panel zu ist
        document.removeEventListener('keydown', handleKeys);
        closePanel(panelId);
    };

    // Event-Listener für die Tasten
    const handleKeys = (event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
            event.preventDefault();
            handleCloseAction();
        }
    };

    // Listener hinzufügen
    document.addEventListener('keydown', handleKeys);

    // --- STEUERUNG --- //
    const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ALT_KEY_TEXT = IS_MAC ? '<kbd>⌥</kbd>' : '<kbd>Alt</kbd>';
    const SHIFT_KEY_TEXT = IS_MAC ? '<kbd>⇧</kbd>' : '<kbd>Shift</kbd>';

    // 1. Einfache Befehle generieren (Tabelle)
    let simpleShortcutsHTML = '';
    for (const [key, data] of Object.entries(APP_SHORTCUTS.simple)) {
        if (data.dev) continue; // Überspringen falls Dev-Tool
        const displayKey = key === 'escape' ? 'Esc' : key.toUpperCase();
        simpleShortcutsHTML += `
            <tr>
                <td><kbd>${displayKey}</kbd></td>
                <td>${data.label}</td>
            </tr>`;
    }

    // 2. Kombinationen generieren (Grid)
    let comboShortcutsHTML = '';
    for (const [code, data] of Object.entries(APP_SHORTCUTS.modifier)) {
        if (data.dev) continue;
        const keyChar = code.replace('Key', '').replace('Digit', '');
        comboShortcutsHTML += `
            <div class="shortcut-item">
                ${SHIFT_KEY_TEXT} + ${ALT_KEY_TEXT} + <kbd>${keyChar}</kbd> 
                <span>${data.label}</span>
            </div>`;
    }

    // --- PUNKTE --- //
    // 1. Zuordnung von Keys zu lesbaren Texten (Label-Mapping)
    // Wir trennen das Mapping von der Config, damit wir bestimmen können, 
    // in welcher Reihenfolge und mit welchem Text was im UI erscheint.
    const displayMapping = [
        { type: PointType.ACTION, key: ACTION.FLIP_CARD, label: 'Karte aufdecken (Spielfeld)' },
        { type: PointType.ACTION, key: ACTION.WASTE_TO_TABLEAU, label: 'Vom Stapel ins Feld' },
        { type: PointType.ACTION, key: ACTION.WASTE_TO_FOUNDATION, label: 'Vom Stapel zum Ziel' },
        { type: PointType.ACTION, key: ACTION.TABLEAU_TO_TABLEAU, label: 'Von Feld zu Feld' },
        { type: PointType.ACTION, key: ACTION.TABLEAU_TO_FOUNDATION, label: 'Vom Feld zum Ziel' },

        { type: PointType.BONUS, key: BONUS.FLIP_COMBO, label: 'Combo: Schnelles Aufdecken **' },
        { type: PointType.BONUS, key: BONUS.FOUNDATION_COMBO, label: 'Combo: Schnelles Ablegen **' },
        { type: PointType.BONUS, key: BONUS.STREAK_START, label: 'Start-Bonus (Siegesserie)' },
        { type: PointType.BONUS, key: BONUS.SPEED_BONUS, label: 'Speed-Bonus: Ziel unter 2:25 Min' },
        { type: PointType.BONUS, key: BONUS.PURIST_BONUS, label: 'Purist-Bonus: Ohne Auto-Hilfen' },

        { type: PointType.PENALTY, key: PENALTY.UNDO_PENALTY, label: 'Zug rückgängig machen (ab 3x)' },
        { type: PointType.PENALTY, key: PENALTY.STOCK_RESET, label: 'Stapel-Reset (ab 3x)' },
        { type: PointType.PENALTY, key: PENALTY.TIME_PENALTY, label: 'Zeitstrafe (alle 10s) *' },
        { type: PointType.PENALTY, key: PENALTY.HINT_PENALTY, label: 'Tipp benutzt (ab 2x)' },
        { type: PointType.PENALTY, key: PENALTY.FROM_FOUNDATION, label: 'Karte vom Ziel zurück' },
        { type: PointType.PENALTY, key: PENALTY.SHUFFLE_RESCUE, label: 'Karten mischen (Shuffle)' }
    ];

    // 2. HTML Zeilen generieren
    const rowsHTML = displayMapping.map(item => {
        const value = getScoreValue(item.type, item.key);

        const colorClass = value >= 0 ? 'highlight-green' : 'highlight-red';
        const prefix = value > 0 ? '+' : '';

        return `
            <div class="status-row">
                <div class="ui-content">${item.label}</div>
                <div class="status-cell status-value ${colorClass}">
                    ${prefix}${value}
                </div>
            </div>`;
    }).join('');

    // 3. Das gesamte Panel zusammenbauen
    contentElement.innerHTML = `
        <h3 class="panel-section-title first-section">STEUERUNG</h3>
        <div class="section-container" style="border: 1px solid rgba(255, 215, 0, 0.8); border-radius: 6px; border-collapse: separate;">
            <table class="shortcut-table">
                ${simpleShortcutsHTML}
            </table>
        </div>
        <div class="section-container" style="margin-top: 8px; padding: 8px; border: 1px solid rgba(255, 215, 0, 0.8); border-radius: 6px; border-collapse: separate;">
        <p class="hint-text-small" style="margin: 0;">Kombination: ${IS_MAC ? 'Shift + Option + Taste' : 'Shift + Alt + Taste'}</p>    
        <table class="shortcut-table">
                ${comboShortcutsHTML}
            </table>
        </div>

        <h3 class="panel-section-title">PUNKTE</h3>
        <div class="section-container">
            <div class="ui-container">
                <div class="ui-header">AKTUELLE WERTE</div>
                ${rowsHTML}
            </div>
            <div style="font-size: 0.75em; opacity: 0.6; padding: 5px 8px; font-style: italic;">
                * falls in den Einstellungen aktiviert<br>
                ** nur wenn "Auto-Ablegen" & "Auto-Flip" in den Einstellungen deaktiviert
            </div>
        </div>

        <h3 class="panel-section-title">REGELN</h3>
        <div class="section-container">
            <div class="ui-container" style="padding: 15px;">
                <ul style="margin: 0; padding-left: 18px; color: #eee; font-size: 0.9em; line-height: 1.6;">
                    <li>Spielfeld: Karten abwechselnd in <b style="color: #ff4d4d;">Rot</b> und <b>Schwarz</b> stapeln (absteigend).</li>
                    <li>Nur <b>Könige</b> dürfen auf leere Felder bewegt werden.</li>
                    <li>Ziel: Alle Karten auf die passenden Farbstapel legen (aufsteigend; Ass - König).</li>
                </ul>
            </div>
        </div>
    `;

    addFooterButton("ZURÜCK", () => closePanel('base-panel-id'), 'btn-confirm');
}