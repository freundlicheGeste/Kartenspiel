/* =====================================================
   SCORING SYSTEM
   Verantwortlich für: Punkte-Enums, POINTS_CONFIG,
   applyMoveScore(), processCombo(), getScoreValue().

   SSOT-Regeln:
   • updateScore()      → app_ui.js   (UI-Schicht)
   • logMoveSteps()     → devLogs.js  (Dev-Schicht)
   • logExtraPoints()   → devLogs.js  (Dev-Schicht)
   • resetSessionStats()→ hier als Wrapper, ruft
                          resetSessionStatsData() aus
                          victory_calculator.js auf
   • sessionStats       → victory_calculator.js

   Abhängigkeiten: game_state.js, game_messages.js,
                   victory_calculator.js, devLogs.js
===================================================== */

/* =====================================================
   ENUMS (SSOT)
===================================================== */

/** @enum {string} */
const PointType = Object.freeze({
    ACTION: 'ACTION',
    BONUS: 'BONUS',
    PENALTY: 'PENALTY',
});

/** @enum {string} */
const ACTION = Object.freeze({
    FLIP_CARD: 'FLIP_CARD',
    WASTE_TO_TABLEAU: 'WASTE_TO_TABLEAU',
    WASTE_TO_FOUNDATION: 'WASTE_TO_FOUNDATION',
    TABLEAU_TO_TABLEAU: 'TABLEAU_TO_TABLEAU',
    TABLEAU_TO_FOUNDATION: 'TABLEAU_TO_FOUNDATION',
});

/** @enum {string} */
const BONUS = Object.freeze({
    FLIP_COMBO: 'FLIP_COMBO',
    FOUNDATION_COMBO: 'FOUNDATION_COMBO',
    SPEED_BONUS: 'SPEED_BONUS',
    PURIST_BONUS: 'PURIST_BONUS',
    STREAK_START: 'STREAK_START',
});

/** @enum {string} */
const PENALTY = Object.freeze({
    STOCK_RESET: 'STOCK_RESET',
    TIME_PENALTY: 'TIME_PENALTY',
    UNDO_PENALTY: 'UNDO_PENALTY',
    HINT_PENALTY: 'HINT_PENALTY',
    FROM_FOUNDATION: 'FROM_FOUNDATION',
    SHUFFLE_RESCUE: 'SHUFFLE_RESCUE',
});

/* =====================================================
   POINTS CONFIG (SSOT)
===================================================== */

const POINTS_CONFIG = Object.freeze({
    [PointType.ACTION]: {
        [ACTION.FLIP_CARD]: { value: 5, label: 'Karte aufgedeckt' },
        [ACTION.WASTE_TO_TABLEAU]: { value: 5, label: 'Waste → Tableau' },
        [ACTION.WASTE_TO_FOUNDATION]: { value: 10, label: 'Waste → Foundation' },
        [ACTION.TABLEAU_TO_TABLEAU]: { value: 5, label: 'Tableau → Tableau' },
        [ACTION.TABLEAU_TO_FOUNDATION]: { value: 15, label: 'Tableau → Foundation' },
    },
    [PointType.BONUS]: {
        [BONUS.FLIP_COMBO]: { value: 2, label: 'Combo: Blitz-Flip' },
        [BONUS.FOUNDATION_COMBO]: { value: 4, label: 'Combo: Karten-Rausch' },
        [BONUS.STREAK_START]: { value: 50, label: 'Serien-Bonus' },
        [BONUS.SPEED_BONUS]: { value: 10, label: 'Geschwindigkeits-Bonus' },
        [BONUS.PURIST_BONUS]: { value: 10, label: 'Puristen-Bonus' },
    },
    [PointType.PENALTY]: {
        [PENALTY.UNDO_PENALTY]: { value: -2, label: 'Korrektur-Abzug' },
        [PENALTY.STOCK_RESET]: { value: -2, label: 'Stapel-Gebühr' },
        [PENALTY.TIME_PENALTY]: { value: -2, label: 'Zeit-Abzug' },
        [PENALTY.HINT_PENALTY]: { value: -10, label: 'Tipp-Kosten' },
        [PENALTY.FROM_FOUNDATION]: { value: -15, label: 'Foundation-Rückzug' },
        [PENALTY.SHUFFLE_RESCUE]: { value: -50, label: 'Misch-Strafe' },
    },
});

/* =====================================================
   SCORE-VARIABLE (SSOT)
   Einzige Stelle wo `score` deklariert wird.
===================================================== */

let score = 0;

/* =====================================================
   SCORE-ABFRAGE (SSOT)
===================================================== */

/**
 * Gibt den numerischen Punktwert für eine Aktion zurück.
 * Sonderfall FROM_FOUNDATION: liest gespeicherten Kartenwert.
 *
 * @param {string}           type  - PointType-Enum
 * @param {string}           key   - ACTION / BONUS / PENALTY Key
 * @param {HTMLElement|null} [card]
 * @returns {number}
 */
function getScoreValue(type, key, card = null) {
    if (key === PENALTY.FROM_FOUNDATION && card?.dataset?.pointsGiven) {
        return -parseInt(card.dataset.pointsGiven);
    }

    const item = POINTS_CONFIG[type]?.[key];
    if (!item) return 0;
    return typeof item === 'object' ? (item.value ?? 0) : item;
}

/* =====================================================
   MOVE-SCORING
===================================================== */

/**
 * Berechnet und vergibt Punkte für einen abgeschlossenen Zug.
 * Speichert vergebene Punkte am Karten-Element (für FROM_FOUNDATION).
 *
 * @param {HTMLElement} card
 * @param {HTMLElement} sourceParent
 * @param {HTMLElement} target
 */
function applyMoveScore(card, sourceParent, target) {
    if (gameState.is(GameStates.DEMO)) return;
    if (!card || !target || !sourceParent) return;

    const isFromFoundation = sourceParent.classList.contains('foundation');
    const isToFoundation = target.classList.contains('foundation');
    const isFromTableau = sourceParent.classList.contains('column');
    const isFromWaste = sourceParent.id === 'waste-pile';
    const isToTableau = target.classList.contains('column');

    let points = 0;
    let moveLabel = '';

    if (isToFoundation) {
        if (isFromTableau) {
            points = getScoreValue(PointType.ACTION, ACTION.TABLEAU_TO_FOUNDATION);
            moveLabel = 'TABLEAU_TO_FOUNDATION';
        } else if (isFromWaste) {
            points = getScoreValue(PointType.ACTION, ACTION.WASTE_TO_FOUNDATION);
            moveLabel = 'WASTE_TO_FOUNDATION';
        }
        card.dataset.pointsGiven = points;

    } else if (isFromFoundation) {
        points = getScoreValue(PointType.PENALTY, PENALTY.FROM_FOUNDATION, card);
        moveLabel = 'FROM_FOUNDATION_PENALTY';
        delete card.dataset.pointsGiven;
        triggerGameMsg(PENALTY.FROM_FOUNDATION, points);
        logExtraPoints(`FROM_FOUNDATION [${points}]`);

    } else if (isToTableau) {
        if (isFromWaste) {
            points = getScoreValue(PointType.ACTION, ACTION.WASTE_TO_TABLEAU);
            moveLabel = 'WASTE_TO_TABLEAU';
        } else if (isFromTableau) {
            points = getScoreValue(PointType.ACTION, ACTION.TABLEAU_TO_TABLEAU);
            moveLabel = 'TABLEAU_TO_TABLEAU';
        }
    }

    if (points !== 0) {
        updateScore(points);
        logMoveSteps(`${moveLabel} [${points}]`);
    }
}

/* =====================================================
   COMBO-SYSTEM
===================================================== */

let _lastComboTime = 0;
let _comboCount = 0;
const COMBO_WINDOW = 3000; // ms

/**
 * Globales Flag: true wenn der aktuelle Zug von der
 * Auto-Logik (autoFlip / autoFoundation) ausgelöst wurde.
 * SSOT — wird von runAutoLogic() in app_core.js gesetzt
 * und von processCombo() gelesen.
 * @type {boolean}
 */
let _isAutoMove = false;

/**
 * Prüft ob mehrere gleichartige Spieler-Züge in schneller
 * Folge einen Combo-Bonus auslösen.
 * Auto-Moves (autoFlip / autoFoundation) werden ignoriert —
 * Combos sind eine Spieler-Leistung, keine Auto-Leistung.
 *
 * @param {'FLIP'|'FOUNDATION'} type
 */
function processComboNEWEST(type) {
    if (gameState.is(GameStates.DEMO)) return;
    if (_isAutoMove) return; // Auto-Züge zählen nicht als Combo

    const now = Date.now();
    const delta = now - _lastComboTime;

    if (delta < COMBO_WINDOW) {
        _comboCount++;
    } else {
        _comboCount = 1;
    }

    _lastComboTime = now;

    if (_comboCount >= 3) {
        const bonusKey = type === 'FLIP' ? BONUS.FLIP_COMBO : BONUS.FOUNDATION_COMBO;
        const bonus = getScoreValue(PointType.BONUS, bonusKey);
        updateScore(bonus);
        triggerGameMsg(bonusKey, bonus);
        logExtraPoints(`COMBO [${bonusKey}: ${bonus}]`);

        // sessionStats aktualisieren (SSOT: victory_calculator.js)
        if (type === 'FLIP') {
            sessionStats.flipComboCount++;
            sessionStats.flipComboPoints += bonus;
        } else {
            sessionStats.foundationComboCount++;
            sessionStats.foundationComboPoints += bonus;
        }

        _comboCount = 0;
    }
}

function processCombo(type) {
    if (gameState.is(GameStates.DEMO)) return;

    const now = Date.now();
    const isFlip = type === 'FLIP';
    const timeKey = isFlip ? 'lastFlipTime' : 'lastFoundationTime';
    const countKey = isFlip ? 'flipWindowCount' : 'foundationWindowCount';

    // Zeitfenster prüfen (3000ms)
    if (now - sessionStats[timeKey] < 3000) {
        sessionStats[countKey]++;
    } else {
        sessionStats[countKey] = 1; // Reset auf 1, da dies die erste Aktion der neuen Kette ist
    }
    sessionStats[timeKey] = now;

    // Schwellenwerte prüfen
    const threshold = isFlip ? 2 : 3;
    const bonusKey = isFlip ? BONUS.FLIP_COMBO : BONUS.FOUNDATION_COMBO;
    const points = getScoreValue(PointType.BONUS, bonusKey);

    if (sessionStats[countKey] >= threshold) {

        // Stats für den Endbildschirm speichern
        if (isFlip) {
            sessionStats.flipComboCount++;
        } else {
            sessionStats.foundationComboCount++;
        }

        // --- PURISTEN-CHECK ---
        // Punkte und Log NUR, wenn die entsprechende Automatik AUS ist
        const isAutoActive = isFlip ? kts.cfg.autoFlip : kts.cfg.autoFoundation;
        const comboLabel = isFlip ? "FLIP_COMBO" : "FOUNDATION_COMBO";
        const comboType = isFlip ? "Auto-Flip" : "Auto-Ablegen";

        if (!isAutoActive) {
            // Punkte NUR sammeln, wenn NICHT im Auto-Modus
            if (isFlip) {
                sessionStats.flipComboPoints += points;
                devLog(`Flip: ${sessionStats.flipComboPoints}`);
            } else {
                sessionStats.foundationComboPoints += points;
                devLog(`Found: ${sessionStats.foundationComboPoints}`);
            }

            // Visuelles Feedback für den Spieler
            triggerGameMsg(bonusKey);
            // Punkte im Spiele-Log eintragen
            logExtraPoints(`${comboLabel} [${points}]`);
        } else {
            // Optional: Ein stilles Log für dich zum Debuggen
            devLog(`${comboLabel} erkannt, aber 0 Punkte wegen aktivem ${comboType}.`);
            devLog(`Flip: ${sessionStats.flipComboPoints} & Found: ${sessionStats.foundationComboPoints}`);
        }
    }
}

/**
 * Setzt Combo-State und Session-Stats zurück.
 * SSOT-Wrapper — ruft resetSessionStatsData() aus
 * victory_calculator.js auf.
 */
function resetSessionStats() {
    _lastComboTime = 0;
    _comboCount = 0;
    _isAutoMove = false;
    resetSessionStatsData(); // victory_calculator.js
}
