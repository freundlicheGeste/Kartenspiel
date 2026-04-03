const CHANGELOG_DATA = [
    {
        version: "0.9.9",
        date: "2026-03-26",
        title: "SSOT & Logging",
        changes: [
            "CHANGE: Punkte-System (nicht mehr im localStorage)",
            "CHANGE: Dialoge (Confirm, Info, Input)",
            "NEW: Spiel jetzt Game-States gesteuert",
            "NEW: DEV Logging",
            "NEW: Spiele-Aufzeichnungen & Wiedergabe",
            "NEW: Undo-Redo UI",
            "FIX: Undo- & Hint-System",
            "FIX: Layout (css)"
        ]
    },
    {
        version: "0.9.8",
        date: "2026-03-16",
        title: "Bug-Hunter",
        changes: [
            "FIX: Tipp-System (Timer), Bulb-Anzeige",
            "FIX: Karten mischen",
            "NEW: Settings für Tipps, InfoPanels",
            "NEW: Config-Werte für Tipps, InfoPanels",
            "NEW: Scoreboard-Features (Replay, Delete, Name-Change)",
            "OPTIMIZATION: SSOT und DRY",
            "TODO: Belohnungs-System"
        ]
    },
    {
        version: "0.9.7",
        date: "2026-03-12",
        title: "UI Standardisierung",
        changes: [
            "Panels & Dialoge nutzen jetzt alle das basePanel.css",
            "Eigenständige Button- & Stats-Bar",
            "Tastatur-Shortcuts & Audio-Einstellungen im Settings-Panel",
            "Bugfixes, Startscreen statt direkter Deck-Erstellung beim App-Start"
        ]
    },
    {
        version: "0.9.6",
        date: "2026-02-26",
        title: "Das 'Polish' Update",
        changes: [
            "Kartenregen-Animation bei neuem Rekord hinzugefügt 🃏",
            "Win-Streak Schutz: Tab-Refresh zählt nun als Abbruch.",
            "Neustart-Option mit Sicherheitsabfrage integriert.",
            "Dynamisches Punkte-Tableau im Info-Banner."
        ]
    },
    {
        version: "0.9.5",
        date: "2026-02-24",
        title: "Stabilitäts-Fixes",
        changes: [
            "Fehler in der Auto-Logik beim Spielstart behoben.",
            "Speichersystem für Deck-Statistiken optimiert."
        ]
    }
];

function renderChangelog(contentElement, addFooterButton) {
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

    const currentVer = kts.sys.version;
    let html = '<div class="changelog-wrapper">';

    html += CHANGELOG_DATA.map(entry => {
        const isCurrent = entry.version === currentVer;
        const currentClass = isCurrent ? 'current' : '';

        return `
            <div class="changelog-entry ${currentClass}">
                <div class="changelog-header">
                    <strong class="changelog-title">
                        v${entry.version} - ${entry.title}
                    </strong>
                    ${isCurrent ? '<span class="badge-current">AKTUELL</span>' : ''}
                </div>
                <div class="changelog-date">Veröffentlicht am: ${entry.date}</div>
                <ul class="changelog-list">
                    ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>
            `;
    }).join('');

    contentElement.innerHTML = html + '</div>';

    // Den Footer-Button hinzufügen
    addFooterButton("ZURÜCK", handleCloseAction, 'btn-confirm');
}