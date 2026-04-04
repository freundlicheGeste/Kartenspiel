/* =====================================================
   SCOREBOARD
   Verantwortlich für: Scoreboard öffnen/schließen,
   Tabellen-Rendering, Deck umbenennen/löschen,
   Globale Stats-Anzeige, Zeitformatierung.
   Abhängigkeiten: deck.utils.js, game.pause.js
===================================================== */

/* =====================================================
   ICONS (SSOT)
===================================================== */

const SCOREBOARD_ICONS = Object.freeze({
    REPLAY: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
    TRASH:  `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
});

/* =====================================================
   AUDIO
===================================================== */

const _scoreboardSound  = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
_scoreboardSound.volume = 0.2;

function _playScoreboardSound() {
    _scoreboardSound.currentTime = 0;
    _scoreboardSound.play().catch(err => console.log('[Scoreboard] Sound blockiert:', err));
}

/* =====================================================
   TOGGLE
===================================================== */

let _safetyTimer = null;

/**
 * Öffnet oder schließt das Scoreboard.
 * Pausiert das Spiel beim Öffnen, setzt es beim Schließen fort.
 * Safety-Timer: Lösch-Buttons werden erst nach 2s freigegeben.
 */
function toggleScoreboard() {
    const overlay = document.getElementById('scoreboard-overlay');
    const isOpen  = overlay.classList.contains('open');

    if (!isOpen) {
        overlay.classList.remove('safety-unlocked');

        clearTimeout(_safetyTimer);
        _safetyTimer = setTimeout(() => overlay.classList.add('safety-unlocked'), 2000);

        // Scrollposition zurücksetzen
        document.querySelector('.scoreboard-table-wrapper')?.scrollTo(0, 0);

        // Pin-Toggle synchronisieren
        const pinToggle = document.getElementById('pin-deck-toggle');
        if (pinToggle) pinToggle.checked = !!kts.cfg.pinCurrentDeck;

        closeAllOverlays?.();
        if (!kts.cfg.audio.mute) _playScoreboardSound();

        overlay.classList.add('open');
        updateScoreboardUI();
        pauseGame();

    } else {
        clearTimeout(_safetyTimer);
        overlay.classList.remove('open');
        resumeGame();
    }
}

/* =====================================================
   GLOBALE STATS
===================================================== */

/**
 * Berechnet Gewinnrate, Durchschnittswerte und Gesamtspielzeit.
 * @returns {{ playCount, playTime, winRate, avgScore, avgTime }}
 */
function getGlobalStatsSummary() {
    const decks      = Object.values(kts.stats.decks);
    const totalPlays = decks.reduce((sum, d) => sum + (d.plays || 0), 0);
    const totalWins  = decks.reduce((sum, d) => sum + (d.wins  || 0), 0);

    return {
        playCount: totalPlays,
        playTime:  formatTime(kts.stats.totalTime, { onlyMMSS: false }),
        winRate:   totalPlays > 0 ? ((totalWins / totalPlays) * 100).toFixed(0) : 0,
        avgScore:  totalWins  > 0 ? Math.floor(kts.stats.totalScores / totalWins) : 0,
        avgTime:   formatTime(totalWins > 0 ? Math.floor(kts.stats.totalTime / totalWins) : 0),
    };
}

/**
 * Rendert die globale Statistik-Zeile über der Tabelle.
 */
function renderGlobalStats() {
    const stats = getGlobalStatsSummary();
    const el    = document.getElementById('globalStats');
    if (!el) return;

    el.innerHTML =
        `Gesamte Spiele <strong>${stats.playCount}</strong> | ` +
        `Gesamte Zeit <strong>${stats.playTime}</strong> | ` +
        `Gewinnrate: <strong>${stats.winRate}%</strong> | ` +
        `Ø Punkte: <strong>${stats.avgScore}</strong> | ` +
        `Ø Zeit: <strong>${stats.avgTime}</strong>`;
}

/* =====================================================
   TABELLE RENDERN
===================================================== */

let currentSortMode = 'score';

/**
 * Aktualisiert die Scoreboard-Tabelle vollständig.
 * @param {'score'|'name'|'moves'|'time'} [sortBy]
 */
function updateScoreboardUI(sortBy = currentSortMode) {
    currentSortMode = sortBy;

    const body = document.getElementById('main-scoreboard-body');
    const head = document.querySelector('#main-scoreboard thead');
    if (!body) return;

    head.innerHTML = `
        <tr>
            <th class="col-name">Deck / Info</th>
            <th class="col-champ">Titelträger</th>
            <th class="col-score">Punkte</th>
            <th class="col-moves">Züge</th>
            <th class="col-time">Zeit</th>
            <th class="col-action">Aktion</th>
        </tr>`;

    // Sort-Tab-Highlight
    document.querySelectorAll('.sort-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`sort-btn-${sortBy}`)?.classList.add('active');

    const titles = {
        name:  '📖 Deck-Archiv',
        score: '👑 Punkte-König',
        moves: '♟️ Meister-Stratege',
        time:  '⚡ Blitz-Spieler',
    };

    const pinCurrent = kts.cfg.pinCurrentDeck ?? true;
    const currentId  = getDeckKey(currentDeckObjects);

    const entries = Object.entries(kts.stats.decks)
        .map(([id, deck]) => ({ id, ...deck }))
        .filter(deck => deck.wins > 0)
        .sort((a, b) => {
            if (pinCurrent) {
                if (a.id === currentId) return -1;
                if (b.id === currentId) return  1;
            }
            if (sortBy === 'name')  return a.label.localeCompare(b.label);
            if (sortBy === 'score') return b.bestScore - a.bestScore;
            if (sortBy === 'moves') return a.bestMoves - b.bestMoves;
            if (sortBy === 'time')  return a.bestTime  - b.bestTime;
            return 0;
        });

    body.innerHTML = entries.map(deck => {
        const displayCriterion = sortBy === 'name' ? 'score' : sortBy;
        const bestEntry        = getBestEntry(deck, displayCriterion);
        const championName     = bestEntry?.player || deck.player || '---';
        const autoSolveCount   = deck.autoSolveCount || 0;

        const avgScore = deck.history?.length > 0
            ? Math.floor(deck.history.reduce((a, b) => a + b.score, 0) / deck.history.length)
            : deck.bestScore;
        const avgMoves = deck.history?.length > 0
            ? Math.floor(deck.history.reduce((a, b) => a + b.moves, 0) / deck.history.length)
            : deck.bestMoves;
        const winRate  = Math.round((deck.wins / deck.plays) * 100);

        const isCurrent    = deck.id === currentId;
        const rowClass     = isCurrent ? 'current-deck-row' : '';
        const badgeHtml    = isCurrent ? '<div class="badge-wrapper"><span class="current-badge">Aktiv</span></div>' : '<div class="badge-wrapper"></div>';
        const titleBadge   = sortBy !== 'name' ? `<span class="title-badge">${titles[displayCriterion]}</span><br>` : '';
        const autoSolveBadge = autoSolveCount > 0
            ? `&nbsp;&nbsp;<span class="auto-solve-badge" title="${autoSolveCount}x mit Auto-Solve beendet">🛋️ ${autoSolveCount}</span>`
            : '';

        return `
            <tr class="${rowClass}">
                <td class="col-name" onclick="renameDeck('${deck.id}')" style="cursor:pointer;text-align:left;">
                    ${badgeHtml}
                    <strong style="color:#ffd700;">${deck.label}</strong><br>
                    <span class="small-avg">Wins: ${winRate}% (${deck.wins}/${deck.plays})${autoSolveBadge}</span>
                </td>
                <td class="col-champ">
                    ${titleBadge}<strong class="player-name">${championName}</strong>
                </td>
                <td class="col-score">
                    <span class="${sortBy === 'score' ? 'highlight-val' : ''}">${deck.bestScore}</span>
                    <span class="small-avg">Ø ${avgScore}</span>
                </td>
                <td class="col-moves">
                    <span class="${sortBy === 'moves' ? 'highlight-val' : ''}">${deck.bestMoves}</span>
                    <span class="small-avg">Ø ${avgMoves}</span>
                </td>
                <td class="col-time">
                    <span class="${sortBy === 'time' ? 'highlight-val' : ''}">${formatTime(deck.bestTime)}</span>
                </td>
                <td class="col-action">
                    <div class="action-cell-layout">
                        <button class="replay-btn tt-left" onclick="replayGame('${deck.id}')" data-title="Dieses Deck erneut spielen">
                            ${SCOREBOARD_ICONS.REPLAY}
                        </button>
                        <button class="delete-btn tt-left" onclick="resetDeckStats('${deck.id}')" data-title="Statistiken zurücksetzen">
                            ${SCOREBOARD_ICONS.TRASH}
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');

    renderGlobalStats();
}

/**
 * Findet den besten History-Eintrag eines Decks für ein Kriterium.
 * @param {Object}                    deck
 * @param {'score'|'moves'|'time'}    criterion
 * @returns {Object|null}
 */
function getBestEntry(deck, criterion) {
    if (!deck?.history?.length) return null;
    return [...deck.history].sort((a, b) => {
        if (criterion === 'score') return b.score - a.score;
        if (criterion === 'moves') return a.moves - b.moves;
        if (criterion === 'time')  return a.time  - b.time;
    })[0];
}

/* =====================================================
   DECK-AKTIONEN
===================================================== */

/**
 * Schaltet das Pinning des aktuellen Decks um.
 * @param {boolean} isPinned
 */
function togglePinning(isPinned) {
    kts.cfg.pinCurrentDeck = isPinned;
    saveToDisk();
    updateScoreboardUI();
}

/**
 * Öffnet ein Eingabefeld zum Umbenennen eines Decks.
 * @param {string} deckId
 */
function renameDeck(deckId) {
    const deck = kts.stats.decks[deckId];
    if (!deck) return;

    openPanel('input', {
        title:        'Deck umbenennen',
        placeholder:  'Name eingeben...',
        initialValue: deck.label,
        onConfirm: newName => {
            if (newName === deck.label) return;
            devInfo?.(`${deck.label} umbenannt zu <strong>"${newName}"</strong>`);
            deck.label = newName;
            saveToDisk();
            updateScoreboardUI();
        },
    });
}

/**
 * Öffnet einen Bestätigungs-Dialog zum Zurücksetzen der Deck-Statistiken.
 * Zieht die Werte auch aus den globalen Stats ab.
 * @param {string} deckId
 */
function resetDeckStats(deckId) {
    const deck = kts.stats.decks[deckId];
    if (!deck) return;

    openPanel('confirm', {
        title:   'Statistik - Reset',
        message: `Statistiken & History für <strong>"${deck.label}"</strong><br>wirklich zurücksetzen?<br>
                  <small style="opacity:0.6;font-size:0.7em">(<strong>Punkte</strong>, <strong>Züge</strong>, <strong>Zeit</strong> und <strong>Siege</strong> werden aus der Gesamtstatistik abgezogen.)</small>`,
        buttons: [
            {
                text:      'JA, RESET',
                className: 'btn-danger',
                callback:  () => {
                    // Globale Stats korrigieren
                    const historyScoreSum = deck.history?.reduce((s, h) => s + (h.score || 0), 0) || 0;
                    const historyTimeSum  = deck.history?.reduce((s, h) => s + (h.time  || 0), 0) || 0;

                    kts.stats.totalWins   = Math.max(0, (kts.stats.totalWins   || 0) - (deck.wins  || 0));
                    kts.stats.totalGames  = Math.max(0, (kts.stats.totalGames  || 0) - (deck.plays || 0));
                    kts.stats.totalScores = Math.max(0, (kts.stats.totalScores || 0) - historyScoreSum);
                    kts.stats.totalTime   = Math.max(0, (kts.stats.totalTime   || 0) - historyTimeSum);

                    // Deck zurücksetzen (label + isHardcoded bleiben)
                    deck.bestScore = 0;
                    deck.bestMoves = null;
                    deck.bestTime  = null;
                    deck.plays     = 0;
                    deck.wins      = 0;
                    deck.player    = '';
                    deck.history   = [];

                    saveToDisk();
                    updateScoreboardUI();
                    devInfo?.(`Statistiken für <strong>"${deck.label}"</strong> zurückgesetzt`);
                },
            },
            { text: 'ABBRECHEN', className: '' },
        ],
    });
}

/* =====================================================
   ZEITFORMATIERUNG (SSOT)
===================================================== */

/**
 * Formatiert Sekunden in MM:SS oder HH:MM:SS (mit optionalem Tages-Prefix).
 *
 * | Sekunden | Ausgabe        |
 * | -------- | -------------- |
 * | 250      | `00:04:10`     |
 * | 3725     | `01:02:05`     |
 * | 360000   | `4d 04:00:00`  |
 *
 * @param {number}  totalSeconds
 * @param {{ onlyMMSS?: boolean }} [opts]
 * @returns {string}
 */
function formatTime(totalSeconds, { onlyMMSS = true } = {}) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds));

    if (onlyMMSS) {
        const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const ss = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    }

    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}
