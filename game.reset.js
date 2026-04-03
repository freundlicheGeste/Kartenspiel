/* =====================================================
   GAME RESET
   Verantwortlich für: vollständiger State- und UI-Reset
   vor jedem neuen Spiel.
   IIFE-Wrapper entfernt — resetGame() wird direkt als
   globale Funktion definiert (konsistent mit den anderen
   game.*.js Dateien, keine falsche Isolation).
   Abhängigkeiten: game.state.js, deck.utils.js
===================================================== */

/* =====================================================
   STATE RESET
===================================================== */

/**
 * Setzt alle Spielvariablen auf Ausgangswerte zurück.
 * Wird von resetGame() aufgerufen — nicht direkt nutzen.
 */
function _resetGameState() {
    gameState.set(GameStates.IDLE);

    ignoreStalemate = false;
    shuffleCount = 0;
    isAnimating = false;
    victoryTriggered = false;
    history = [];
    pausedDuration = 0;
    sessionXP = 0;
    moves = 0;
    score = 0;
    activeRecording = [];
    stockResetCount = 0;
    undoCount = 0;
    undoStack = [];
    redoStack = [];
    finalDuration = 0;
    wasAutoSolved = false;

    // Hint-System
    lastUserMove = { cardId: null, fromId: null };
    isFirstHintOfGame = true;

    if (typeof gameTimerId !== 'undefined') clearInterval(gameTimerId);

    updateUndoUI();
    resetSessionStats();
}

/* =====================================================
   UI RESET
===================================================== */

/**
 * Setzt alle sichtbaren UI-Elemente auf den Ausgangszustand zurück.
 * Wird von resetGame() aufgerufen — nicht direkt nutzen.
 */
function _resetGameUI() {
    // --- Overlays ---
    document.getElementById('start-overlay')?.classList.remove('hidden');
    document.getElementById('start-screen-overlay')?.classList.remove('hidden');

    // --- Button Bar (deaktivieren bis Spiel läuft) ---
    ['button-restart', 'button-undo', 'button-hint', 'button-shuffle'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = true;
    });

    // --- Status- & Info-Bars ausblenden ---
    document.getElementById('status-bar')?.style.setProperty('display', 'none');
    document.getElementById('info-bars')?.style.setProperty('display', 'none');

    // Linke Bar auf Player-Ansicht zurücksetzen
    refreshLeftBar?.('player');

    // --- Spielstapel leeren ---
    const stockPile = document.getElementById('stock-pile');
    if (stockPile) { stockPile.className = 'slot'; stockPile.innerHTML = ''; }

    const wastePile = document.getElementById('waste-pile');
    if (wastePile) { wastePile.className = 'slot'; wastePile.innerHTML = ''; }

    // Foundations: Klassen und Suit-Symbole zurücksetzen
    // Nutzt SUITS aus deck.utils.js (SSOT — ersetzt lokale suits-Referenz)
    document.querySelectorAll('.foundation').forEach(el => {
        el.className = 'foundation slot';
        const suitData = SUITS.find(s => s.suit === el.dataset.suit);
        el.innerHTML = suitData ? suitData.symbol : '';
    });

    // Spielfeld leeren und Sperren aufheben
    const board = document.getElementById('game-board');
    if (board) {
        board.innerHTML = '';
        board.classList.remove('game-paused');
        board.style.pointerEvents = 'auto';
    }

    // --- Hint UI ---
    hintUI?.resetCooldown();
    hintUI?.setVisibility(false);

    // Auto-Solve entfernen
    removeAutoSolveButton?.();

    // --- Animationen entfernen ---
    document.querySelectorAll('.falling-card, .victory-card')
        .forEach(el => el.remove());

    document.querySelectorAll('.hint-highlight, .hint-source-highlight, .hint-target-highlight')
        .forEach(el => el.classList.remove(
            'hint-highlight', 'hint-source-highlight', 'hint-target-highlight'
        ));

    // --- Anzeige-Werte zurücksetzen ---
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.innerText = '00:00';

    const movesDisplay = document.getElementById('moves-count');
    if (movesDisplay) movesDisplay.innerText = '0';

    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.innerText = '0';

    // Level/XP UI
    updateLevelUI?.();
    updateScore?.(0);
}

/* =====================================================
   ÖFFENTLICHE API
===================================================== */

/**
 * Vollständiger Reset: State + UI.
 * Beide Schritte sind in try/catch gewrappt damit ein
 * Fehler im State-Reset nicht den UI-Reset blockiert.
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
