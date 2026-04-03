function toggleLevelDetails() {
    const summary = document.getElementById('level-summary');
    const details = document.getElementById('level-details');

    // Wir prüfen, ob "none" gesetzt ist oder die Eigenschaft leer ist
    if (summary.style.display === 'none') {
        summary.style.display = 'flex';
        details.style.display = 'none';
    } else {
        summary.style.display = 'none';
        details.style.display = 'flex';
    }
}