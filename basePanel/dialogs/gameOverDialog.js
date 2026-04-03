function renderStalemate(contentElement, addFooterButton) {
    // Textinhalt des Dialogs
    contentElement.innerHTML = `
        <div class="dialog-text-wrapper">
            <div style="color: var(--accent-color); font-size: 1.4em; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
                Stillstand!
            </div>
            Es sind keine weiteren Züge mehr möglich.
        </div>
    `;

    // Die 4 Buttons im Footer (werden durch das Grid automatisch 2x2 angeordnet)
    addFooterButton("NEUES SPIEL", () => {
        closePanel('base-panel-id');
        handleGameOverAction('new');
    });

    addFooterButton("NEUSTARTEN", () => {
        closePanel('base-panel-id');
        handleGameOverAction('restart');
    });

    addFooterButton("SHUFFLE (-50)", () => {
        closePanel('base-panel-id');
        handleGameOverAction('shuffle');
    });

    // Button mit grauer/gedimmter Optik (btn-dimmed Klasse hinzufügen)
    addFooterButton("IGNORIEREN", () => {
        closePanel('base-panel-id');
        handleGameOverAction('ignore');
    }, 'btn-dimmed');

    addFooterButton("UNDO", () => {
        closePanel('base-panel-id');
        handleGameOverAction('undo');
    });
}

function triggerStalemateDialog() {
    const SVG_COIN = `<svg class="coin-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--accent-color-dark)" stroke-width="2"/><path d="M12 7v10M15 9h-4a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-4" fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round"/></svg>`;

    openPanel('confirm', { // triggert automatisch GameState PAUSE
        title: "Stillstand!",
        message: "Es sind keine weiteren Züge mehr möglich. <br>Wie möchtest du fortfahren?",
        buttons: [
            { text: "NEUES SPIEL", callback: () => handleGameOverAction('new') },
            { text: "NEU STARTEN", callback: () => handleGameOverAction('restart') },
            /*{ text: "SHUFFLE (-50)", callback: () => handleGameOverAction('shuffle') },*/
            {
                text: `SHUFFLE (<span class="highlight-gold">-50</span> ${SVG_COIN})`,
                callback: () => handleGameOverAction('shuffle')
            },
            { text: "IGNORIEREN", className: "btn-dimmed", callback: () => handleGameOverAction('ignore') },
            { text: "ZUG RÜCKGÄNGIG (UNDO)", className: "btn-confirm", callback: () => handleGameOverAction('undo') }
        ]
    });
}