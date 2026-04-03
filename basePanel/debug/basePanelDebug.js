document.addEventListener('keydown', function (event) {
    const key = event.key.toLowerCase();

    // L = Level Up
    if (key === 'l') triggerLevelUp();

    // P = Progress 100% / R = Progress 0%
    if (key === 'p' || key === 'r') {
        const val = (key === 'p') ? 100 : 0;
        console.log(`Debug: Setze alle Progressbars auf ${val}%`);
        document.querySelectorAll('.progress-fill').forEach(bar => {
            bar.style.width = val + '%';
        });
    }

    // T = Toggle & Radio Test
    if (key === 't') {
        // Toggles
        document.querySelectorAll('.toggle-group-header input').forEach(i => i.checked = !i.checked);
        // Radios
        const groups = {};
        document.querySelectorAll('input[type="radio"]').forEach(r => {
            if (!groups[r.name]) groups[r.name] = [];
            groups[r.name].push(r);
        });
        for (let g in groups) {
            const idx = groups[g].findIndex(r => r.checked);
            groups[g][(idx + 1) % groups[g].length].checked = true;
        }
        new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play();
    }

    // B = Button Test (Visuelles Feedback für ALLE Unity-Buttons)
    if (key === 'b') {
        console.log("Debug: Button Flash Test");
        document.querySelectorAll('.btn-group-header').forEach(btn => {
            btn.style.background = "rgba(255, 215, 0, 0.3)";
            setTimeout(() => btn.style.background = "", 150);
        });
        new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play();
    }

    // S = Shake Effect
    if (key === 's') {
        document.querySelectorAll('.reward-plate.locked').forEach(el => {
            el.classList.add('shake-it');
            setTimeout(() => el.classList.remove('shake-it'), 400);
        });
    }
});
