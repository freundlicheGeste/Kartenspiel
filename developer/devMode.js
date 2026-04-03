/**
 * Spiel Startzeit ausgeben
 * console.log("gameStartTime:", gameStartTime);
*/


/*
debugTestHighscoreEffect()
in der mittleren InfoBar einen neuen Highscore simulieren

openPanel('win', gameExResult);
Gewonnen Banner mit Dummy Werten testen
*/

function debugCoinPosition() {
    // Falls schon eine Test-Münze existiert, entfernen
    const oldTest = document.getElementById('debug-coin');
    if (oldTest) oldTest.remove();

    const container = document.getElementById('coin-stats-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pSize = 22;
    const testCoin = document.createElement('div');

    testCoin.id = 'debug-coin';
    testCoin.className = 'coin-particle'; // Nutzt dein bestehendes CSS

    // SVG ohne Ränder (wie in der Partikel-Logik)
    testCoin.innerHTML = `
        <svg viewBox="0 0 500 500" style="width:100%; height:100%; overflow:visible; shape-rendering:geometricPrecision;">
            <circle cx="250" cy="250" r="245" fill="#d4af37" />
            <circle cx="250" cy="250" r="190" fill="#f1c40f" />
            <path d="M250 120 L310 210 L410 210 L330 290 L360 390 L250 330 L140 390 L170 290 L90 210 L190 210 Z" fill="#d4af37" />
        </svg>`;

    // Die exakt gleiche Positions-Logik wie in spawnCoinParticles
    const startX = rect.left + 17 - (pSize / 2);
    const startY = rect.top + 17 - (pSize / 2);

    testCoin.style.left = startX + 'px';
    testCoin.style.top = startY + 'px';

    // WICHTIG: Animation deaktivieren, damit sie stehen bleibt
    testCoin.style.animation = 'none';
    testCoin.style.opacity = '0.8'; // Leicht transparent, damit man sieht was darunter liegt
    testCoin.style.outline = '1px solid cyan'; // Hilfsrahmen zur Ausrichtung

    document.body.appendChild(testCoin);

    console.log(`Debug-Coin aktiv bei X: ${startX}, Y: ${startY}`);
}