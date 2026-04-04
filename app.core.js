/* =====================================================
   APP CORE
   Verantwortlich für: Globale Spielvariablen (SSOT),
   validateMove(), runAutoLogic(), applyDesign(),
   enableInteraction(), executeWinSequence().

   SSOT-Regeln:
   • updateScore()  → app_ui.js          (UI-Schicht)
   • score          → scoring_system.js  (Logik-Schicht)
   • sessionStats   → victory_calculator.js
   • VictoryCalculator → victory_calculator.js

   Abhängigkeiten: app_storage.js, game_state.js,
                   scoring_system.js, deck_utils.js,
                   victory_calculator.js
===================================================== */

/* =====================================================
   GLOBALE SPIELVARIABLEN (SSOT)
   Alle let-Variablen, die von mehreren Dateien
   gelesen oder geschrieben werden, leben hier.
===================================================== */

/**
 * Kartenrang-Map für validateMove().
 * SSOT — nicht in anderen Dateien neu definieren.
 */
const valMap = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13,
};

let isAnimating      = false;
let victoryTriggered = false;
let ignoreStalemate  = false;
let shuffleCount     = 0;

let stock              = [];
let currentInitialDeck = [];
let currentDeckObjects = [];

let cardDistance = 22; // px — vertikaler Abstand der Karten im Tableau

let moves        = 0;
let finalDuration = 0;

/**
 * pausedDuration: Gesamte akkumulierte Pausenzeit in ms.
 * Wird von game_pause.js geschrieben, game_running.js gelesen.
 * Deklaration hier als SSOT für alle globalen Zeitvariablen.
 */
let pausedDuration = 0;

/**
 * history: Legacy-Bezeichner — Undo-Stack liegt in game_undo.js.
 * Wird in _resetGameState() auf [] gesetzt; die eigentliche
 * Undo-Logik nutzt undoStack / redoStack.
 */
let history = [];

let _lastSavedCardDesign = '';

/* =====================================================
   ZUG-VALIDIERUNG
===================================================== */

/**
 * Prüft ob eine Karte legal auf ein Ziel-Element gelegt werden kann.
 * Unterstützt DOM-Elemente (dataset) und Plain-Objects (properties).
 *
 * @param {HTMLElement|Object} card
 * @param {HTMLElement}        target
 * @returns {boolean}
 */
function validateMove(card, target) {
    if (!card || !target) return false;

    const cardVal   = card.dataset ? card.dataset.value : card.value;
    const cardSuit  = card.dataset ? card.dataset.suit  : card.suit;
    const cardColor = card.dataset ? card.dataset.color : card.color;
    const v = valMap[cardVal];

    // Foundation-Logik
    if (target.classList.contains('foundation')) {
        // Nur einzelne Karten auf die Foundation (kein Stapel)
        if (card.nextElementSibling !== null) return false;

        const targetSuit = target.dataset.suit;
        const lastCard   = target.lastElementChild;

        if (!lastCard) return cardVal === 'A' && cardSuit === targetSuit;

        const lastVal = valMap[lastCard.dataset.value];
        return cardSuit === targetSuit && v === lastVal + 1;
    }

    // Tableau-Logik
    if (target.classList.contains('column')) {
        const lastCard = target.lastElementChild;

        if (!lastCard) return cardVal === 'K'; // Nur Könige auf leere Spalten

        return !lastCard.classList.contains('back') &&
               cardColor !== lastCard.dataset.color &&
               v === valMap[lastCard.dataset.value] - 1;
    }

    return false;
}

/* =====================================================
   AUTOMATIK-LOGIK
===================================================== */

/**
 * Haupt-Loop: Auto-Flip, Auto-Foundation, Stillstand-Erkennung.
 * Wird nach jedem Spielerzug und nach Animationen aufgerufen.
 */
function runAutoLogic() {
    if (!gameState.is(GameStates.RUNNING)) return;

    // 1. Gewonnen ohne Auto-Solve?
    if (document.querySelectorAll('.foundation .card').length === 52) {
        if (!wasAutoSolved) removeAutoSolveButton();
        executeWinSequence();
        return;
    }

    // 2. Auto-Solve-Button Sichtbarkeit aktualisieren
    updateAutoSolveUI();

    let actionTaken = false;

    // 3. Auto-Flip
    if (kts.cfg.autoFlip) {
        document.querySelectorAll('.column').forEach(col => {
            const last = col.lastElementChild;
            if (last?.classList.contains('back')) {
                _isAutoMove = true;          // Auto-Zug: kein Combo
                onPlayerMove();
                flipCard(last);
                _isAutoMove = false;
                actionTaken = true;
                setTimeout(runAutoLogic, 100);
            }
        });
    }

    // 4. Auto-Foundation
    if (kts.cfg.autoFoundation && !actionTaken) {
        const playableCards = Array.from(document.querySelectorAll(
            '.column .card:last-child:not(.back), #waste-pile .card:last-child:not(.back)'
        ));

        for (const card of playableCards) {
            if (card.dataset.tempIgnoreAuto === 'true') continue;
            const target = document.getElementById(`f-${card.dataset.suit}`);

            if (validateMove(card, target)) {
                const sourceParent = card.parentElement;
                _isAutoMove = true;          // Auto-Zug: kein Combo
                onPlayerMove(card, sourceParent);
                executeMoveToFoundation(card, target, sourceParent);
                _isAutoMove = false;
                actionTaken = true;
                break;
            }
        }
    }

    // 5. Stillstand-Prüfung
    if (actionTaken) {
        if (!isAnimating) setTimeout(runAutoLogic, 500);
    } else {
        if (!canMakeAnyMove() && !ignoreStalemate) {
            setTimeout(() => {
                if (gameState.is(GameStates.RUNNING) && !canMakeAnyMove()) {
                    pauseGame();
                    triggerStalemateDialog();
                }
            }, 1000);
        }
    }
}

/* =====================================================
   DESIGN
===================================================== */

/**
 * Wendet das aktuelle Kartendesign auf alle sichtbaren
 * Karten an und speichert bei Änderung (SSOT via applyCardBack/Front).
 */
function applyDesign() {
    const backDesign  = kts.cfg.designBack;
    const frontDesign = kts.cfg.designFront;

    document.querySelectorAll('.card').forEach(card => {
        if (card.classList.contains('back')) {
            card.className = `card ${card.dataset.color} back ${backDesign}`;
        } else {
            card.className = `card ${card.dataset.color} ${frontDesign}`;
        }
    });

    const stockPile = document.getElementById('stock-pile');
    if (stockPile) {
        stockPile.className = `slot ${backDesign}`;
        if (stock.length === 0) stockPile.classList.add('empty');
    }

    const currentSettings = backDesign + frontDesign;
    if (currentSettings !== _lastSavedCardDesign) {
        kts.cfg.designBack  = backDesign;
        kts.cfg.designFront = frontDesign;
        saveToDisk();
        _lastSavedCardDesign = currentSettings;
        if (IS_DEV_MODE) console.log('[applyDesign] Einstellungen gespeichert.');
    }
}

/* =====================================================
   INTERAKTION
===================================================== */

/**
 * Entsperrt das Spielfeld nach dem Deal.
 * Wird am Ende von initGameFlow() aufgerufen.
 */
function enableInteraction() {
    const board = document.getElementById('game-board');
    if (board) {
        board.classList.remove('game-paused');
        board.style.pointerEvents = 'auto';
    }
}

/* =====================================================
   SIEG-SEQUENZ
===================================================== */

/**
 * Startet die Sieg-Animation, berechnet Boni, öffnet Win-Panel.
 * Wird von runAutoLogic() und startAutoSolve() aufgerufen.
 *
 * Nutzt:
 *  • VictoryCalculator  (victory_calculator.js)
 *  • sessionStats       (victory_calculator.js)
 *  • score              (scoring_system.js)
 */
function executeWinSequence() {
    if (victoryTriggered) return;
    victoryTriggered = true;

    clearInterval(gameTimerId);
    gameTimerId = null;

    if (finalDuration === 0) finalDuration = getElapsedSeconds();

    gameState.set(GameStates.BEENDET);
    commitSessionXP();

    // ---- Boni berechnen ----
    console.group('%c🏆 FINALE PUNKTE-BERECHNUNG', 'color: #f1c40f; font-weight: bold;');

    const _safe = (label, val) => {
        const invalid = isNaN(val) || val === undefined;
        console.log(
            `${label.padEnd(20)}: %c${val}`,
            invalid ? 'color: #ff4757; font-weight: bold;' : 'color: #2ed573;'
        );
        return invalid ? 0 : val;
    };

    const speedBonus      = _safe('Speed Bonus',   VictoryCalculator.getSpeedBonus(finalDuration));
    const puristBonus     = _safe('Purist Bonus',  VictoryCalculator.getPuristBonus({
        autoFoundation: kts.cfg.autoFoundation,
        autoFlip:       kts.cfg.autoFlip,
        autoHint:       kts.cfg.autoHint,
    }));
    const timeBonus       = _safe('Time Bonus',    VictoryCalculator.getTimeBonus(finalDuration));
    const flipBonus       = _safe('Flip Combo',    sessionStats.flipComboPoints);
    const foundationBonus = _safe('Found. Combo',  sessionStats.foundationComboPoints);
    const currentStreak   = (kts.game.winStreak || 0) + 1;
    const streakBonus     = _safe('Streak Bonus',  currentStreak > 1 ? (currentStreak - 1) * 50 : 0);
    const baseScore       = _safe('Basis Score',   score);

    const finalScore = baseScore + speedBonus + puristBonus + timeBonus +
                       flipBonus + foundationBonus + streakBonus;

    console.log('─────────────────────────────────────');
    console.log(`%cGESAMT: ${finalScore}`, 'font-weight: bold; font-size: 14px;');
    console.groupEnd();

    score = finalScore;

    // Stats vor dem Registrieren sichern (für isNewRecord-Check)
    const lastStats = JSON.parse(JSON.stringify(
        getDeckStats(currentDeckObjects) || { bestScore: 0, lastPlayed: null }
    ));
    registerGameEnd(currentDeckObjects, score, moves, finalDuration, wasAutoSolved);
    const isNewRecord = score > (lastStats.bestScore || 0);

    isAnimating = true;
    startVictoryCascade();

    if (!kts.cfg.audio.mute && typeof playVictorySound === 'function') playVictorySound();

    setTimeout(() => {
        openPanel('win', {
            baseScore,
            score:                finalScore,
            moves,
            time:                 finalDuration,
            winStreak:            currentStreak,
            timeBonus,
            speedBonus,
            puristBonus,
            lastPlayed:           lastStats.lastPlayed,
            bestScore:            Math.max(lastStats.bestScore || 0, finalScore),
            isNewRecord,
            flipComboCount:       sessionStats.flipComboCount,
            foundationComboCount: sessionStats.foundationComboCount,
            flipBonus,
            foundationBonus,
            streakBonus,
            wasAutoSolved,
        });
    }, 2000);
}
