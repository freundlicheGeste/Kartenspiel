// Wenn man gewonnen hat UND einen neuen Highscore erreicht
function triggerCardRain() {
    const symbols = ['♠', '♥', '♦', '♣'];
    const colors = ['#000', '#e74c3c', '#e74c3c', '#000'];

    for (let i = 0; i < 50; i++) {
        const card = document.createElement('div');
        const randomIndex = Math.floor(Math.random() * 4);

        card.className = 'falling-card';
        card.innerHTML = `
            <div class="card-mini-top">${symbols[randomIndex]}</div>
            <div class="card-mini-center">${symbols[randomIndex]}</div>
        `;

        card.style.left = Math.random() * 100 + 'vw';
        card.style.color = colors[randomIndex];
        // Zufällige Größe und Geschwindigkeit für mehr Tiefe
        const size = Math.random() * 20 + 30;
        card.style.width = size + 'px';
        card.style.height = (size * 1.4) + 'px';
        card.style.animationDuration = (Math.random() * 2 + 3) + 's';
        card.style.animationDelay = (Math.random() * 2) + 's';

        document.body.appendChild(card);
        setTimeout(() => card.remove(), 6500);
    }
}