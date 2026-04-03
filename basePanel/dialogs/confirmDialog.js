function renderConfirmDialog(contentElement, addFooterButton, options = {}) {
    const {
        title = "",
        message = "Bist du sicher?",
        buttons = []
    } = options;

    contentElement.innerHTML = `
        <div class="dialog-text-wrapper" style="text-align: center;">
            ${title ? `<div style="color: var(--accent-color); font-size: 1.2em; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">${title}</div>` : ''}
            <div style="line-height: 1.4; color: var(--content-text-color);">${message}</div>
        </div>
    `;

    // Hilfsfunktion zum Schließen und Aufräumen
    const cleanupAndClose = () => {
        window.removeEventListener('keydown', handleKeys);
        closePanel('base-panel-id');
    };

    // Key-Handler: Enter bestätigt den ERSTEN Button (meistens Ja/OK), ESC bricht ab
    const handleKeys = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            cleanupAndClose();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            // Finde den ersten Button, der nicht "ABBRECHEN" heißt oder die erste Aktion ist
            const primaryBtn = buttons.length > 0 ? buttons[0] : null;
            if (primaryBtn && primaryBtn.callback) primaryBtn.callback();
            cleanupAndClose();
        }
    };

    window.addEventListener('keydown', handleKeys);

    // Buttons generieren
    if (buttons.length > 0) {
        buttons.forEach(btn => {
            addFooterButton(btn.text, () => {
                if (btn.callback) btn.callback();
                cleanupAndClose();
            }, btn.className || '');
        });
    } else {
        addFooterButton("ABBRECHEN", cleanupAndClose);
        addFooterButton("OK", cleanupAndClose, 'btn-confirm');
    }
}