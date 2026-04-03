// Zeigt die mittlere Info Bar mit Dummy Werten an
function toggleDebugStats() {
    const bar = document.getElementById('deck-best-stats');
    if (!bar) return;
    const isHidden = bar.classList.contains('hidden');
    if (isHidden) {
        document.getElementById('best-moves-val').innerText = "42";
        document.getElementById('best-score-val').innerText = "1337";
        document.getElementById('best-time-val').innerText = "01:23";
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}