function updateStatusBanner(customMsg = null) {
    const banner = document.getElementById('info-ticker');
    const text = document.getElementById('ticker-text');
    if (!banner) return;

    banner.classList.remove('banner-replay', 'banner-highscore');

    if (customMsg) {
        text.innerText = customMsg;
        banner.classList.add('banner-highscore');
    } else if (isReplayMode) {
        text.innerHTML = "REPLAY MODUS – Klick für Tipp";
        banner.classList.add('banner-replay');
    } else {
        const title = levelTitles[Math.min(kts.game.player.level - 1, 19)];
        text.innerText = `Level ${kts.game.player.level}: ${title}`;
    }
}