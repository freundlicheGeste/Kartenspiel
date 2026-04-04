/*   Waste -> Stock Animation   */
function triggerResetExplosion() {
    const wastePile = document.getElementById('waste-pile');
    if (!wastePile) return;

    const rect = wastePile.getBoundingClientRect();
    const pileWidth = rect.width;
    const pileHeight = 130; // Deine Stapelhöhe
    const pileTop = rect.top;
    const pileLeft = rect.left;

    const suits = ['♥', '♦', '♠', '♣'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'reset-particle';
        p.textContent = suits[Math.floor(Math.random() * suits.length)];

        const isRed = p.textContent === '♥' || p.textContent === '♦';
        p.style.color = isRed ? '#e74c3c' : '#2c3e50';

        // --- STREUUNG (Start) ---
        // Y-Achse: Zufällig über die Höhe (130px)
        const startY = pileTop + (Math.random() * pileHeight);

        // X-Achse: Zufällig über die Breite des Stapels (NEU!)
        const startX = pileLeft + (Math.random() * pileWidth * 0.5); // Startet in der linken Hälfte des Stapels

        // --- OPTIK (Varianz) ---
        // Opacity: Zufällig zwischen 0.4 und 1.0 (NEU!)
        const startOpacity = 0.4 + (Math.random() * 0.6);
        p.style.opacity = startOpacity;

        // Größe: Zufällig zwischen 1.0rem und 1.6rem (NEU!)
        const startSize = 1.0 + (Math.random() * 0.6);
        p.style.fontSize = `${startSize}rem`;

        // --- ZIEL-LOGIK ---
        // X-Achse: Nach LINKS (negativ)
        const moveLeft = -(80 + Math.random() * 60); // 80px bis 140px nach links

        // Y-Achse: Geringe vertikale Abweichung
        const moveVertical = (Math.random() - 0.5) * 20;

        p.style.setProperty('--dx', `${moveLeft}px`);
        p.style.setProperty('--dy', `${moveVertical}px`);
        p.style.setProperty('--dr', `${(Math.random() - 0.5) * 720}deg`);

        p.style.left = `${startX}px`;
        p.style.top = `${startY}px`;

        // Startverzögerung (wie besprochen, für weicheren Flow)
        p.style.animationDelay = `${i * 15}ms`;

        document.body.appendChild(p);

        // Cleanup (Delay berücksichtigen!)
        setTimeout(() => p.remove(), 1000 + (i * 15));
    }
}

/* x -> Foundation */
function triggerFoundationExplosion(targetId, suitSymbol) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    // Absolute Mitte des Foundation-Slots auf dem Bildschirm berechnen
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Die Farbe des Suits bestimmen
    const isRed = suitSymbol === '♥' || suitSymbol === '♦';
    const suitColor = isRed ? '#e74c3c' : '#2c3e50';

    const particleCount = 12; // Leicht erhöht für besseren radialen Effekt

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'foundation-particle';
        p.textContent = suitSymbol;
        p.style.color = suitColor;

        // --- EXPLOSIONS-LOGIK (Radial Fix) ---
        // Wir erzwingen eine gleichmäßigere Verteilung über 360 Grad,
        // indem wir den Winkel basierend auf dem Index berechnen,
        // aber ein bisschen Zufall hinzufügen, damit es organisch wirkt.
        const baseAngle = (i / particleCount) * Math.PI * 2;
        const randomAngleOffset = (Math.random() - 0.5) * 0.5; // ±~14 Grad Zufall
        const angle = baseAngle + randomAngleOffset;

        // Zufällige Flugdistanz (radial nach außen)
        const distance = 50 + Math.random() * 40; // 50px bis 90px

        // Berechnung von DX und DY basierend auf Winkel und Distanz
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        p.style.setProperty('--dx', `${moveX}px`);
        p.style.setProperty('--dy', `${moveY}px`);
        // Zufällige Rotation beim Fliegen
        p.style.setProperty('--dr', `${(Math.random() - 0.5) * 720}deg`);

        // WICHTIG: Startposition ist die Mitte, aber absolut (fixed)
        p.style.left = `${centerX}px`;
        p.style.top = `${centerY}px`;

        // Wir fügen die Partikel direkt dem Body hinzu, um Positionierungskonflikte zu vermeiden
        document.body.appendChild(p);

        // Schnelles Cleanup für einen knackigen Effekt
        setTimeout(() => p.remove(), 800); // Länger als die Animation
    }
}

/**
 * Testet die Foundation-Explosion manuell.
 * Standardmäßig auf dem Herz-Stapel mit dem Herz-Symbol.
 */
/**
 * Smart Debug für die Foundation-Explosion.
 * Erstellt eine Dummy-Karte, um den Effekt realistisch zu testen.
 */
window.debugFoundationEffect = function (suitSymbol = '♥', targetId = 'f-hearts') {
    const target = document.getElementById(targetId);

    console.log(`%c [Smart Debug] %c Teste Burst: ${suitSymbol} auf #${targetId}`,
        'background: #e74c3c; color: white; border-radius: 3px;', 'color: #ccc;');

    if (!target) {
        console.error(`Fehler: Element #${targetId} nicht gefunden!`);
        return;
    }

    // 1. Prüfen, ob triggerFoundationExplosion existiert
    if (typeof triggerFoundationExplosion !== 'function') {
        console.error("Fehler: triggerFoundationExplosion() wurde nicht gefunden!");
        return;
    }

    // --- TEMPORÄRE DUMMY-KARTE ERSTELLEN ---
    const dummyCard = document.createElement('div');
    dummyCard.className = 'card red hearts'; // Passe Klassen ggf. an deine Karten an
    dummyCard.style.position = 'absolute';
    dummyCard.style.top = '0';
    dummyCard.style.left = '0';
    dummyCard.style.zIndex = '10'; // Unter den Partikeln, aber über dem Slot-Hintergrund

    // Kleiner visueller Inhalt (wie deine echten Karten)
    const value = 'A'; // Ass als Test
    dummyCard.innerHTML = `<b>${value}</b><br>${suitSymbol}`;

    // Karte in den Slot legen
    target.appendChild(dummyCard);

    // --- BURST TRIGGERN ---
    // Der Burst startet JETZT, da die Karte "angekommen" ist.
    triggerFoundationExplosion(targetId, suitSymbol);

    // --- CLEANUP ---
    // Die Dummy-Karte nach der Animation wieder entfernen, 
    // damit der Slot für den nächsten Test leer ist.
    setTimeout(() => {
        dummyCard.remove();
        console.log(`%c [Debug] %c Dummy-Karte entfernt. Slot ist wieder leer.`,
            'color: #999;', 'color: #ccc;');
    }, 1200); // Länger als die Partikel-Animation
};

// Optional: Ein Shortcut, um 3x hintereinander zu feuern (für Stresstest)
window.testBurst = function () {
    let count = 0;
    const interval = setInterval(() => {
        debugFoundationEffect('♥', 'f-hearts');
        if (++count >= 2) clearInterval(interval);
    }, 200);
};

function createStaticSuitFrameOLDBUTGOLD(cardElement, suitSymbol) {
    const oldFrame = cardElement.querySelector('.card-glow-frame');
    if (oldFrame) oldFrame.remove();

    const frame = document.createElement('div');
    frame.className = 'card-glow-frame';

    const particleCount = 20; // 20-24 ist ideal für diesen Look
    const isRed = suitSymbol === '♥' || suitSymbol === '♦';
    const color = isRed ? '#e74c3c' : '#000000'; // Pik/Kreuz tiefschwarz

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'frame-particle';
        p.textContent = suitSymbol;
        p.style.color = color;

        // Varianz für einen lebendigen Rahmen
        const size = 0.8 + Math.random() * 0.5; // 0.8rem bis 1.3rem
        const opacity = 0.5 + Math.random() * 0.5;
        p.style.fontSize = `${size}rem`;
        p.style.opacity = opacity;

        const side = Math.floor(Math.random() * 4);
        let x, y;

        // OFFSET: -5px bis 0px sorgt dafür, dass sie 
        // halb auf der Karte und halb darüber liegen (wie beim Pik)
        const offset = (Math.random() * 5);

        switch (side) {
            case 0: // TOP
                x = Math.random() * 100;
                y = -offset;
                break;
            case 1: // RIGHT
                x = 100 - offset;
                y = Math.random() * 100;
                break;
            case 2: // BOTTOM
                x = Math.random() * 100;
                y = 100 - offset;
                break;
            case 3: // LEFT
                x = -offset;
                y = Math.random() * 100;
                break;
        }

        p.style.left = `${x}%`;
        p.style.top = `${y}%`;

        // Zentrierung des Symbols auf dem Punkt
        p.style.transform = `translate(-50%, -50%) rotate(${(Math.random() - 0.5) * 20}deg)`;

        frame.appendChild(p);
    }

    cardElement.appendChild(frame);
}

window.debugStaticFrame = function (suit = '♥') {
    // Suche die oberste Karte im Herz-Stapel
    const target = document.getElementById('f-hearts');
    const lastCard = target?.lastElementChild;

    if (!lastCard) {
        console.error("Lege erst eine Karte auf den Herz-Stapel!");
        return;
    }

    createStaticSuitFrame(lastCard, suit);
    console.log("Statischer Rahmen wurde erstellt.");
};

/**
 * Entfernt den Rahmen sanft mit einem Fade-out
 */
function removeSuitFrame(cardElement) {
    if (!cardElement) return;
    const frame = cardElement.querySelector('.card-glow-frame');
    if (!frame) return;

    // Sanftes Ausblenden vor dem Löschen
    frame.style.transition = 'opacity 0.5s ease-out';
    frame.style.opacity = '0';

    setTimeout(() => {
        frame.remove();
    }, 500);
}

/**
 * Erstellt den Orbit und löscht ihn automatisch nach einer Zeitspanne
 */
function triggerTemporaryOrbit(cardElement, suitSymbol, duration = 1000) {
    // 1. Erstellen
    createSuitFrame(cardElement, suitSymbol, true, 1.2);

    // 2. Nach X Millisekunden wieder entfernen
    setTimeout(() => {
        removeSuitFrame(cardElement);
    }, duration);
}

function createSuitFrame(cardElement, suitSymbol, animatePulse = true, animateRotate = true) {
    // Alten Rahmen entfernen
    const oldFrame = cardElement.querySelector('.card-glow-frame');
    if (oldFrame) oldFrame.remove();

    const frame = document.createElement('div');
    frame.className = 'card-glow-frame';

    // Farblogik für alle 4 Symbole
    const isRed = suitSymbol === '♥' || suitSymbol === '♦';
    const color = isRed ? '#e74c3c' : '#000000';

    const particleCount = 32;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'frame-particle';
        p.textContent = suitSymbol;
        p.style.color = color;

        // Individuelle Basis-Werte für Varianz
        const size = 0.8 + Math.random() * 0.5;
        const baseOpacity = 0.4 + Math.random() * 0.6;
        p.style.fontSize = `${size}rem`;
        p.style.setProperty('--base-op', baseOpacity);
        p.style.opacity = "0"; // Start für Einblend-Effekt

        // Positionierung (Knapp an der Kante)
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const offset = Math.random() * 4; // Max 4px Versatz

        switch (side) {
            case 0: x = Math.random() * 100; y = -offset; break; // TOP
            case 1: x = 100 - offset; y = Math.random() * 100; break; // RIGHT
            case 2: x = Math.random() * 100; y = 100 - offset; break; // BOTTOM
            case 3: x = -offset; y = Math.random() * 100; break; // LEFT
        }

        p.style.left = `${x}%`;
        p.style.top = `${y}%`;

        // Grund-Transformation
        const rotate = (Math.random() - 0.5) * 30;
        p.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;

        // --- ANIMATIONS-STEUERUNG ---
        let animations = [];
        if (animatePulse) {
            // Zufällige Dauer zwischen 2s und 4s für organisches Atmen
            const duration = 2 + Math.random() * 2;
            animations.push(`frame-pulse ${duration}s infinite ease-in-out`);
        }
        if (animateRotate) {
            // Sehr langsame Rotation/Bewegung
            const duration = 3 + Math.random() * 3;
            animations.push(`frame-rotate ${duration}s infinite linear`);
        }

        if (animations.length > 0) {
            p.style.animation = animations.join(', ');
        }

        frame.appendChild(p);

        // Sanftes Einblenden nach dem Hinzufügen
        requestAnimationFrame(() => {
            p.style.opacity = baseOpacity;
        });
    }

    cardElement.appendChild(frame);
}

// Test: Alle 4 Symbole mit Animation
window.testAllFrames = function () {
    const symbols = { 'f-hearts': '♥', 'f-diamonds': '♦', 'f-spades': '♠', 'f-clubs': '♣' };

    Object.keys(symbols).forEach(id => {
        const slot = document.getElementById(id);
        const card = slot?.lastElementChild;
        if (card) {
            // Parameter: card, symbol, pulse, rotate
            createSuitFrame(card, symbols[id], true, true);
        }
    });
};

// Einzel-Test mit Parametern
// debugSingle('♠', false, true); // Nur Rotation, kein Atmen
window.debugSingle = function (symbol, pulse, rotate) {
    const firstCard = document.querySelector('.foundation .card');
    if (firstCard) createSuitFrame(firstCard, symbol, pulse, rotate);
};