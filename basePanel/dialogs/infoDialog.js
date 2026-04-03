function renderInfoDialog(contentElement, addFooterButton, options = {}) {
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

    const {
        title = "HINWEIS",
        message = "Diese Aktion ist zurzeit nicht möglich.",
        buttonText = "OK"
    } = options;

    contentElement.innerHTML = `
       ${title ? `<div class="info-title">${title}</div>` : ''}
            <div class="info-message">${message}</div>
    `;

    // Ein einzelner Button zum Schließen
    addFooterButton(buttonText, handleCloseAction, 'btn-confirm');
}