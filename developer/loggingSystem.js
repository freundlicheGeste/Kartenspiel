function logGameState() {
    // Ein minimales Timeout stellt sicher, dass DOM-Änderungen abgeschlossen sind
    setTimeout(() => {
        const stockCount = typeof stock !== 'undefined' ? stock.length : 0;
        const wasteCount = document.getElementById('waste-pile')?.children.length || 0;
        const foundationCount = document.querySelectorAll('.foundation .card').length;
        const tableauVisible = document.querySelectorAll('.column .card:not(.back)').length;
        const tableauHidden = document.querySelectorAll('.column .card.back').length;
        const totalCards = stockCount + wasteCount + foundationCount + tableauVisible + tableauHidden;

        // Hilfsfunktion für Farben (Blau wenn 0/leer, sonst Weiß)
        const getStyle = (count, isZeroSpecial = true) =>
            (count === 0 && isZeroSpecial) ? 'color: #44bbff;' : 'color: #ffffff;';

        console.groupCollapsed(
            `%c🎴 Game State Update [${new Date().toLocaleTimeString()}]`,
            'color: #e2b714; font-weight: bold;'
        );

        console.log(`%cStock:       ${stockCount.toString().padEnd(2)} Karten`, getStyle(stockCount));
        console.log(`%cWaste:       ${wasteCount.toString().padEnd(2)} Karten`, getStyle(wasteCount));
        console.log(`%cFoundations: ${foundationCount.toString().padEnd(2)} Karten`, getStyle(foundationCount));
        console.log(`%cTableau:     ${tableauVisible} offen / ${tableauHidden} verdeckt`, getStyle(tableauHidden));

        // Zusammenfassung mit Fehlerprüfung (52 Karten Check)
        const summaryStyle = totalCards === 52 ? 'color: #44ff44; font-weight: bold;' : 'color: #ff4444; font-weight: bold;';
        console.log(`%cSummary:     ${totalCards} / 52`, summaryStyle);

        // Status-Meldungen
        if (stockCount === 0 && tableauHidden > 0) {
            if (tableauHidden > 0) {
                console.log("%c⚠️ Kritisch: Stock leer, Tableau blockiert!", "color: #ff4444; font-style: italic;");
            } else if (stockCount === 0 && tableauHidden === 0) {
                console.log("%c✅ Weg frei für Auto-Solve!", "color: #44ff44; font-style: italic;");
            }
        }

        console.groupEnd();
    }, 50); // 50ms reichen meistens aus, um nach dem DOM-Update zu feuern
}

/* =====================================================
   UNGENUTZT
===================================================== */

function logGameStateClassic() {
    const stockCount = stock.length;
    const wasteCount = document.getElementById('waste-pile')?.children.length || 0;
    const foundationCount = document.querySelectorAll('.foundation .card').length;
    const tableauVisible = document.querySelectorAll('.column .card:not(.back)').length;
    const tableauHidden = document.querySelectorAll('.column .card.back').length;

    console.group(`🎴 Game State Update [${new Date().toLocaleTimeString()}]`);
    console.log(`Stock:      ${stockCount} Karten`);
    console.log(`Waste:      ${wasteCount} Karten`);
    console.log(`Foundations: ${foundationCount} / 52`);
    console.log(`Tableau:    ${tableauVisible} offen, ${tableauHidden} verdeckt`);
    console.groupEnd();
}

function logGameStateSimple() {
    const stockCount = stock.length;
    const wasteCount = document.getElementById('waste-pile')?.children.length || 0;
    const foundationCount = document.querySelectorAll('.foundation .card').length;
    const tableauVisible = document.querySelectorAll('.column .card:not(.back)').length;
    const tableauHidden = document.querySelectorAll('.column .card.back').length;

    console.log(`S: ${stockCount}, W: ${wasteCount}, F: ${foundationCount}, T ${tableauVisible}o, ${tableauHidden}v`);
}