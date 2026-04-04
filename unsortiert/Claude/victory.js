
function startVictoryCascade() {
    const foundations = Array.from(document.querySelectorAll('.foundation'));

    // Wir iterieren durch alle 13 Karten-Positionen
    for (let i = 1; i <= 13; i++) {
        foundations.forEach((f, fIdx) => {
            // Wir holen die Karten von oben (König) nach unten (Ass)
            // Foundation Slots haben oft ein Symbol als ersten Child, daher i
            const cards = Array.from(f.querySelectorAll('.card'));
            const card = cards[cards.length - i];

            if (card) {
                setTimeout(() => {
                    // WICHTIG: Karte aus dem Foundation-Slot lösen und an Body hängen
                    const rect = card.getBoundingClientRect();
                    card.style.left = rect.left + "px";
                    card.style.top = rect.top + "px";
                    document.body.appendChild(card);

                    animateBouncingCard(card);
                }, i * 250 + fIdx * 60);
            }
        });
    }
}

function animateBouncingCard(card) {
    card.classList.add('victory-card');

    let x = parseFloat(card.style.left);
    let y = parseFloat(card.style.top);

    // Start-Vektoren: vx (horizontal) muss stark genug sein
    let vx = (Math.random() * 10) - 5;
    let vy = Math.random() * -10 - 5;
    const gravity = 0.7;
    const bounce = -0.7;

    // Wir setzen ein Sicherheits-Zeitlimit: Nach 10 Sekunden wird die Karte gelöscht,
    // egal wo sie sich befindet.
    const deathTimer = setTimeout(() => {
        card.remove();
    }, 10000);

    function step() {
        // Falls ein neues Spiel gestartet wurde: Sofort weg damit
        if (gameState.is(GameStates.RUNNING)) {
            clearTimeout(deathTimer);
            card.remove();
            return;
        }

        x += vx;
        y += vy;
        vy += gravity;

        // Boden-Kollision
        if (y + 130 > window.innerHeight) {
            y = window.innerHeight - 130;
            vy *= bounce;

            // WICHTIG: Wenn die Energie fast weg ist, geben wir ihr 
            // einen kleinen Schubs zur Seite, damit sie aus dem Bild rollt
            if (Math.abs(vy) < 1) {
                vx = vx > 0 ? 5 : -5;
            }
        }

        card.style.left = x + "px";
        card.style.top = y + "px";

        // Prüfen, ob die Karte noch im sichtbaren Bereich ist
        const isOutOfScreen = (x + 200 < 0 || x > window.innerWidth + 200 || y > window.innerHeight + 500);

        if (!isOutOfScreen) {
            requestAnimationFrame(step);
        } else {
            clearTimeout(deathTimer);
            card.remove();
        }
    }
    requestAnimationFrame(step);
}