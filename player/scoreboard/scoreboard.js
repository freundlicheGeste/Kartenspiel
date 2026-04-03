const ICONS = {
    NAME: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M12.6 3H5v18h14V9.4L12.6 3zm1.4 11h-3v3H9v-3H6v-2h3V9h2v3h3v2zM13 9V4.5l5.5 5.5H13z"/></svg>`, // A-Z / Dokument
    SCORE: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M5 16h3v5H5v-5zm11-8h3v13h-3V8zm-5.5 4h3v9h-3v-9zM21 2H3v2h18V2z"/></svg>`, // Balkendiagramm / Punkte
    MOVES: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M19 13l-4 4h3v3h2v-3h3l-4-4zM5 11l4-4H6V4H4v3H1l4 4zm14-2V4h-2v3h-3l4 4 4-4h-3zM5 13l-4 4h3v3h2v-3h3l-4-4z"/></svg>`, // Spielzüge / Pfeile
    TIME: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`, // Uhr / Zeit
    PIN: `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M16 9V4l1 0V2H7v2l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>` // Pin / Reißzwecke
};

let safetyTimer = null; // Timer für das Einblenden des LÖSCHEN-Buttons

/* ==========================================================================
   SCOREBOARD AUDIO
   ========================================================================== */

// Sound-Objekt erstellen
const scoreboardSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
scoreboardSound.volume = 0.2;

// Sound abspielen
function playScoreboardSound() {
    scoreboardSound.currentTime = 0; // Zurückspulen (falls man schnell klickt)
    scoreboardSound.play().catch(err => console.log("Sound-Autoplay blockiert:", err));
}

/* ==========================================================================
   SCOREBOARD ANZEIGEN/AUSBLENDEN
   ========================================================================== */

// Erweitertes toggleScoreboard (mit Scroll-Reset)
function toggleScoreboard() {
    const overlay = document.getElementById('scoreboard-overlay');
    const isOpen = overlay.classList.contains('open');

    if (!isOpen) {
        overlay.classList.remove('safety-unlocked'); // Sicherstellen, dass es zu ist

        // Timer starten: Nach 2 Sekunden die Lösch-Buttons freigeben
        clearTimeout(safetyTimer);
        safetyTimer = setTimeout(() => {
            overlay.classList.add('safety-unlocked');
        }, 2000);

        // Scrollposition zum Anfang springen
        const wrapper = document.querySelector('.scoreboard-table-wrapper');
        if (wrapper) wrapper.scrollTop = 0;

        // Toggle-Zustand beim Öffnen setzen
        const pinToggle = document.getElementById('pin-deck-toggle');
        if (pinToggle) pinToggle.checked = !!kts.cfg.pinCurrentDeck;

        closeAllOverlays();
        if (!kts.cfg.audio.mute) {
            if (typeof playScoreboardSound === 'function') playScoreboardSound();
        }
        overlay.classList.add('open');
        updateScoreboardUI();
        pauseGame();
    } else {
        clearTimeout(safetyTimer);
        overlay.classList.remove('open');
        resumeGame();
    }
}

/* ==========================================================================
   SCOREBOARD INFORMATIONEN
   ========================================================================== */

function renderGlobalStats() {
    const stats = getGlobalStatsSummary();
    const el = document.getElementById("globalStats");

    el.innerHTML =
        `Gesamte Spiele <strong>${stats.playCount}</strong> | ` +
        `Gesamte Zeit <strong>${stats.playTime}</strong> | ` +
        `Gewinnrate: <strong>${stats.winRate}%</strong> | ` +
        `Ø Punkte: <strong>${stats.avgScore}</strong> | ` +
        `Ø Zeit: <strong>${stats.avgTime}</strong>`;
}

function getGlobalStatsSummary() {
    const decks = Object.values(kts.stats.decks);

    // Summiere die plays und wins über alle Decks hinweg
    const totalPlays = decks.reduce((sum, deck) => sum + (deck.plays || 0), 0);
    const totalWins = decks.reduce((sum, deck) => sum + (deck.wins || 0), 0);

    const winRate = totalPlays > 0 ? ((totalWins / totalPlays) * 100).toFixed(0) : 0;

    // Nutze kts.stats für die globalen Summen (Score/Zeit)
    const avgScore = totalWins > 0 ? Math.floor(kts.stats.totalScores / totalWins) : 0;
    const avgTime = totalWins > 0 ? Math.floor(kts.stats.totalTime / totalWins) : 0;

    return {
        playCount: totalPlays,
        playTime: formatTime(kts.stats.totalTime, { onlyMMSS: false }),
        winRate: winRate,
        avgScore: avgScore,
        avgTime: formatTime(avgTime)
    };
}

/*
| Sekunden | Ausgabe        |
| -------- | -------------- |
| 250      | `00:04:10`     |
| 3725     | `01:02:05`     |
| 359999   | `99:59:59`     |
| 360000   | `4d 04:00:00`  |
| 900000   | `10d 10:00:00` |
*/
function formatTime(totalSeconds, { onlyMMSS = true } = {}) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds));

    if (onlyMMSS) {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    // volle Zeit mit Tagen/Stunden
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    const ss = seconds.toString().padStart(2, "0");

    if (days > 0) {
        return `${days}d ${hh}:${mm}:${ss}`;
    }

    return `${hh}:${mm}:${ss}`;
}

/* ==========================================================================
   SCOREBOARD ANZEIGE
   ========================================================================== */

// Standard-Sortierung beim Öffnen
let currentSortMode = 'score';

function updateScoreboardUI(sortBy = currentSortMode) {
    currentSortMode = sortBy;
    const body = document.getElementById('main-scoreboard-body');
    const head = document.querySelector('#main-scoreboard thead');
    if (!body) return;

    // 1. Header mit fixen Klassen setzen
    head.innerHTML = `
        <tr>
            <th class="col-name">Deck / Info</th>
            <th class="col-champ">Titelträger</th>
            <th class="col-score">Punkte</th>
            <th class="col-moves">Züge</th>
            <th class="col-time">Zeit</th>
            <th class="col-action">Aktion</th>
        </tr>
    `;

    // 2. Tabs aktualisieren
    document.querySelectorAll('.sort-tab').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`sort-btn-${sortBy}`);
    if (activeBtn) activeBtn.classList.add('active');

    const titles = {
        'name': '📖 Deck-Archiv',
        'score': '👑 Punkte-König',
        'moves': '♟️ Meister-Stratege',
        'time': '⚡ Blitz-Spieler'
    };

    // 3. Konfiguration & Daten (SSOT)
    const pinCurrent = kts.cfg.pinCurrentDeck ?? true;
    const currentId = getDeckKey(currentDeckObjects);

    let entries = Object.entries(kts.stats.decks)
        .map(([id, deck]) => ({ id, ...deck }))
        .filter(deck => deck.wins > 0);

    // 4. Sortierung mit Pinning-Logik
    entries.sort((a, b) => {
        if (pinCurrent) {
            if (a.id === currentId) return -1;
            if (b.id === currentId) return 1;
        }
        if (sortBy === 'name') return a.label.localeCompare(b.label);
        if (sortBy === 'score') return b.bestScore - a.bestScore;
        if (sortBy === 'moves') return a.bestMoves - b.bestMoves;
        if (sortBy === 'time') return a.bestTime - b.bestTime;
        return 0;
    });

    // 5. Body Rendering
    body.innerHTML = entries.map(deck => {
        // Faulpelz König
        // NEU: Auto-Solve Info extrahieren
        const autoSolveCount = deck.autoSolveCount || 0;
        const autoSolveHtml = autoSolveCount > 0
            ? `&nbsp;&nbsp;<span class="auto-solve-badge" title="${autoSolveCount}x mit Auto-Solve beendet">🛋️ ${autoSolveCount}</span>`
            : '';

        const displayCriterion = sortBy === 'name' ? 'score' : sortBy;
        const bestEntry = getBestEntry(deck, displayCriterion);
        const championName = bestEntry ? bestEntry.player : (deck.player || "---");

        // Prüfen, ob wir gerade NICHT nach Name sortieren, um den Badge anzuzeigen
        const titleBadgeHtml = sortBy !== 'name'
            ? `<span class="title-badge">${titles[displayCriterion]}</span><br>`
            : '';

        // Durchschnittswerte berechnen
        const avgScore = deck.history?.length > 0 ? Math.floor(deck.history.reduce((a, b) => a + b.score, 0) / deck.history.length) : deck.bestScore;
        const avgMoves = deck.history?.length > 0 ? Math.floor(deck.history.reduce((a, b) => a + b.moves, 0) / deck.history.length) : deck.bestMoves;
        const winRate = Math.round((deck.wins / deck.plays) * 100);

        // UI-Zustand für das aktuelle Deck
        const isCurrent = (deck.id === currentId);
        const rowClass = isCurrent ? 'current-deck-row' : '';
        const badgeHtml = isCurrent ? `<div class="badge-wrapper"><span class="current-badge">Aktiv</span></div>` : `<div class="badge-wrapper"></div>`;

        // Icons als Konstanten (einmalig definieren)
        const ICON_EDIT = `<svg class="edit-icon" onclick="renameDeck('${deck.id}')" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
        const ICON_REPLAY = `<svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;
        const ICON_TRASH = `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

        return `
            <tr class="${rowClass}">
                <td class="col-name" onclick="renameDeck('${deck.id}')" data-title="Deck umbenennen" style="cursor: pointer; text-align: left;">
                    ${badgeHtml}
                    <!-- <strong style="color: #ffd700;">${deck.label}</strong> ${ICON_EDIT}<br> -->
                    <strong style="color: #ffd700;">${deck.label}</strong><br>
                    <span class="small-avg">
                        Wins: ${winRate}% (${deck.wins}/${deck.plays}) ${autoSolveHtml} </span>
                </td>
                <td class="col-champ">
            ${titleBadgeHtml}
            <strong class="player-name">${championName}</strong>
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
                            ${ICON_REPLAY}
                        </button>
                        <button class="delete-btn tt-left" onclick="resetDeckStats('${deck.id}')" data-title="Statistiken zurücksetzen">
                            ${ICON_TRASH}
                        </button>
                    </div>
                </td>
            </tr>
            </tr>
        `;
    }).join('');

    renderGlobalStats();
}

// Sucht den absolut besten Eintrag aus der History
function getBestEntry(deck, criterion) {
    if (!deck || !deck.history || deck.history.length === 0) return null;

    // Wichtig: Array kopieren, damit wir die echte History nicht durcheinander bringen
    const historyCopy = [...deck.history];

    return historyCopy.sort((a, b) => {
        if (criterion === 'score') return b.score - a.score; // Höchster Score gewinnt
        if (criterion === 'moves') return a.moves - b.moves; // Wenigste Züge gewinnen
        if (criterion === 'time') return a.time - b.time;    // Kürzeste Zeit gewinnt
    })[0];
}

// Pinning-Logik
function togglePinning(isPinned) {
    kts.cfg.pinCurrentDeck = isPinned;
    saveToDisk(); // Speichert die Einstellung
    updateScoreboardUI(); // Scoreboard mit neuer Sortierung neu zeichnen
}

function renameDeck(deckId) {
    const deck = kts.stats.decks[deckId];
    if (!deck) return;

    openPanel('input', {
        title: "Deck umbenennen",
        placeholder: "Name eingeben...",
        initialValue: deck.label,
        onConfirm: (newName) => {
            if (newName !== deck.label) {
                devInfo(`${deck.label} umbenannt zu <strong>"${newName}"</strong>`);
                deck.label = newName;
                saveToDisk();
                updateScoreboardUI();
            }
        }
    });
}

function resetDeckStats(deckId) {
    const deck = kts.stats.decks[deckId];
    if (!deck) return;

    openPanel('confirm', {
        title: "Statistik - Reset",
        message: `Statistiken & History für <strong>"${deck.label}"</strong><br> wirklich zurücksetzen?<br>
        <small style="opacity:0.6; font-size:0.7em">
        (<strong>Punkte</strong>, <strong>Züge</strong>, <strong>Zeit</strong> und <strong>Siege</strong> werden aus der Gesamtstatistik abgezogen.)
        </small>`,
        buttons: [
            {
                text: "JA, RESET",
                className: "btn-danger",
                callback: () => {
                    // --- Hier deine Logik ---
                    kts.stats.totalWins = Math.max(0, (kts.stats.totalWins || 0) - (deck.wins || 0));
                    kts.stats.totalGames = Math.max(0, (kts.stats.totalGames || 0) - (deck.plays || 0));

                    const historyScoreSum = deck.history?.reduce((sum, h) => sum + (h.score || 0), 0) || 0;
                    const historyTimeSum = deck.history?.reduce((sum, h) => sum + (h.time || 0), 0) || 0;

                    kts.stats.totalScores = Math.max(0, (kts.stats.totalScores || 0) - historyScoreSum);
                    kts.stats.totalTime = Math.max(0, (kts.stats.totalTime || 0) - historyTimeSum);

                    deck.bestScore = 0;
                    deck.bestMoves = null;
                    deck.bestTime = null;
                    deck.plays = 0;
                    deck.wins = 0;
                    deck.player = "";
                    deck.history = [];
                    // d.label und d.isHardcoded bleiben bestehen!

                    saveToDisk();
                    updateScoreboardUI();

                    devInfo(`Statistiken für <strong>"${deck.label}"</strong> zurück gesetzt`);
                }
            },
            { text: "ABBRECHEN", className: "" } // callback leer = nur schließen
        ]
    });
}