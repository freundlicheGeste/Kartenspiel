function renderInputDialog(contentElement, addFooterButton, options = {}) {
    const {
        title = "EINGABE",
        placeholder = "Name...",
        initialValue = "",
        onConfirm = () => { }
    } = options;

    contentElement.innerHTML = `
        <div class="dialog-container">
            <div class="dialog-title">
                ${title.toUpperCase()}
            </div>
            
            <div id="input-wrapper" class="dialog-input-wrapper">
                <input type="text" 
                       id="dialog-user-input" 
                       class="dialog-input"
                       value="${initialValue}" 
                       placeholder="${placeholder}"
                       maxlength="18">
            </div>
            
            <div class="dialog-hint">
                Max. 18 Zeichen (A-Z, 0-9, ÄÖÜ)
            </div>
        </div>
    `;

    const input = document.getElementById('dialog-user-input');
    const wrapper = document.getElementById('input-wrapper');

    setTimeout(() => { if (input) { input.focus(); input.select(); } }, 200);

    const validate = () => {
        const val = input.value.trim();
        const validRegex = /^[a-zA-Z0-9äöüÄÖÜß\s.\-_#]+$/;

        if (val === "" || !validRegex.test(val)) {
            // Fehler-Klasse hinzufügen und nach der Animation wieder entfernen
            wrapper.classList.add('shake-error');
            wrapper.addEventListener('animationend', () => {
                wrapper.classList.remove('shake-error');
            }, { once: true });
            return;
        }
        onConfirm(val);
        closePanel('base-panel-id');
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validate();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            closePanel('base-panel-id');
        }
    });

    addFooterButton("SPEICHERN", validate, 'btn-confirm');
    addFooterButton("ABBRECHEN", () => closePanel('base-panel-id'));
}