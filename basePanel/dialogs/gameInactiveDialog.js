function renderGameNotActive(contentElement, addFooterButton) {
    //contentElement.style.background = "transparent";
    //contentElement.style.border = "none";

    contentElement.innerHTML = `
        <div class="dialog-text-wrapper">
            Diese Funktion ist nur bei aktivem Spiel möglich.
        </div>
    `;

    // 2. Buttons mit Logik und Farben setzen
    addFooterButton("ZURÜCK", () => closePanel('base-panel-id'));
}