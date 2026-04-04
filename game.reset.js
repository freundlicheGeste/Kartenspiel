/* =====================================================
   GAME RESET
   Verantwortlich für: vollständiger State- und UI-Reset
   vor jedem neuen Spiel.
   Abhängigkeiten: game_state.js, deck_utils.js,
                   game_undo.js, scoring_system.js,
                   victory_calculator.js, game_autosolve.js,
                   game_hints.js, game_xp.js, app_ui.js
===================================================== */

/* =====================================================
   STATE RESET
===================================================== */

/**
 * Setzt alle Spielvariablen auf Ausgangswerte zurück.
 * Wird ausschließlich von resetGame() aufgerufen.
 */
function _resetGameState() {
    gameState.set(GameStates.IDLE);

    // Kern-Flags (app_core.js)
    ignoreStalemate  = false;
    shuffleCount     = 0;
    isAnimating      = false;
    victoryTriggered = false;
    finalDuration    = 0;
    moves            = 0;
    history          = [];     // Legacy-Array (app_core.js)
    pausedDuration   = 0;      // app_core.js (Alias für totalPausedTime)

    // Timer-Variablen (game_running.js)
    if (typeof gameTimerId      !== 'undefined') clearInterval(gameTimerId);
    if (typeof totalPausedTime  !== 'undefined') totalPausedTime  = 0;
    if (typeof gameStartTime    !== 'undefined') gameStartTime    = null;
    if (typeof pauseStartedAt   !== 'undefined') pauseStartedAt   = null;
    if (typeof lastPenaltySecond !== 'undefined') lastPenaltySecond = null;

    // Score (scoring_system.js)
    score = 0;

    // Undo/Redo (game_undo.js)
    if (typeof undoStack !== 'undefined') undoStack = [];
    if (typeof redoStack !== 'undefined') redoStack = [];
    if (typeof undoCount !== 'undefined') undoCount = 0;

    // Recording (recordGame.js)
    if (typeof activeRecording  !== 'undefined') activeRecording  = [];
    if (typeof isRecordingActive !== 'undefined') isRecordingActive = false;

    // Stock (card_stock.js)
    if (typeof stockResetCount !== 'undefined') stockResetCount = 0;

    // Auto-Solve (game_autosolve.js)
    if (typeof wasAutoSolved !== 'undefined') wasAutoSolved = false;

    // XP (game_xp.js)
    if (typeof sessionXP !== 'undefined') sessionXP = 0;

    // Hint-System (game_hints.js)
    if (typeof lastUserMove        !== 'undefined') lastUserMove       = { cardId: null, fromId: null };
    if (typeof isFirstHintOfGame   !== 'undefined') isFirstHintOfGame  = true;
    if (typeof currentDisplayedHint !== 'undefined') currentDisplayedHint = null;
    if (typeof hintTimerId         !== 'undefined') {
        clearTimeout(hintTimerId);
        hintTimerId = null;
    }

    // Combo/Session-Stats (scoring_system.js + victory_calculator.js)
    resetSessionStats();

    // Undo-UI aktualisieren
    updateUndoUI?.();
}

/* =====================================================
   UI RESET
===================================================== */

/**
 * Setzt alle sichtbaren UI-Elemente auf Ausgangszustand.
 * Wird ausschließlich von resetGame() aufgerufen.
 */
function _resetGameUI() {
    // Overlays einblenden
    document.getElementById('start-overlay')?.classList.remove('hidden');
    document.getElementById('start-screen-overlay')?.classList.remove('hidden');

    // Button Bar deaktivieren bis Spiel läuft
    ['button-restart', 'button-undo', 'button-hint', 'button-shuffle'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });

    // Status- & Info-Bars ausblenden
    document.getElementById('status-bar')?.style.setProperty('display', 'none');
    document.getElementById('info-bars')?.style.setProperty('display', 'none');

    // Linke Bar zurücksetzen
    refreshLeftBar?.('player');

    // Spielstapel leeren
    const stockPile = document.getElementById('stock-pile');
    if (stockPile) { stockPile.className = 'slot'; stockPile.innerHTML = ''; }

    const wastePile = document.getElementById('waste-pile');
    if (wastePile) { wastePile.className = 'slot'; wastePile.innerHTML = ''; }

    // Foundations zurücksetzen (SSOT: SUITS aus deck_utils.js)
    document.querySelectorAll('.foundation').forEach(el => {
        el.className = 'foundation slot';
        const suitData = SUITS.find(s => s.suit === el.dataset.suit);
        el.innerHTML = suitData ? suitData.symbol : '';
    });

    // Spielfeld leeren
    const board = document.getElementById('game-board');
    if (board) {
        board.innerHTML = '';
        board.classList.remove('game-paused');
        board.style.pointerEvents = 'auto';
    }

    // Hint UI zurücksetzen
    hintUI?.resetCooldown();
    hintUI?.setVisibility(false);

    // Auto-Solve-Button entfernen
    removeAutoSolveButton?.();

    // Laufende Animationen aufräumen
    document.querySelectorAll('.falling-card, .victory-card').forEach(el => el.remove());
    document.querySelectorAll('.hint-highlight, .hint-source-highlight, .hint-target-highlight')
        .forEach(el => el.classList.remove(
            'hint-highlight', 'hint-source-highlight', 'hint-target-highlight'
        ));

    // Anzeige-Werte auf 0 setzen
    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.innerText = '00:00';

    const movesEl = document.getElementById('moves-count');
    if (movesEl) movesEl.innerText = '0';

    const scoreEl = document.getElementById('score-display');
    if (scoreEl) scoreEl.innerText = '0';

    const coinEl = document.getElementById('coin-display');
    if (coinEl) coinEl.innerText = '0';

    // Level/XP aktualisieren
    updateLevelUI?.();
    // updateScore(0) nur aufrufen wenn die Funktion schon überschrieben ist
    if (typeof updateScore === 'function') updateScore(0);
}

/* =====================================================
   ÖFFENTLICHE API
===================================================== */

/**
 * Vollständiger Reset: State + UI.
 * try/catch stellt sicher, dass ein Fehler im State-Reset
 * den UI-Reset nicht blockiert.
 */
function resetGame() {
    try {
        _resetGameState();
    } catch (err) {
        console.warn('[resetGame] _resetGameState() fehlgeschlagen:', err);
    }

    try {
        _resetGameUI();
    } catch (err) {
        console.warn('[resetGame] _resetGameUI() fehlgeschlagen:', err);
    }

    devInfo?.('States & UI zurückgesetzt');
}
