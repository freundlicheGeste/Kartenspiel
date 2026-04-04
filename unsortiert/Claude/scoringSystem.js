/**
 * Eine Karte vom Spielfeld (Tableau) zum Grundstapel (Foundation) = +10 Punkte
 * Eine Karte vom Ziehstapel (Waste-Pile) zum Spielfeld (Tableau) = +5 Punkte
 * Eine Karte vom Ziehstapel (Waste-Pile) zum Grundstapel (Foundation) = +5 Punkte
 * Eine Karte vom Ziehstapel (Waste-Pile) zum Spielfeld (Tableau) zum Grundstapel (Foundation) = +5 & +10 = +15 Punkte
 * Eine Karte auf dem Spielfeld (Tableau) aufzudecken = +5 Punkte
 * Eine Karte vom Grundstapel (Foundation) zum Spielfeld (Tableau) = (Punkte, die diese Karte gegeben hat rückgängig)
 * ----------------------------------------
 * Mindestpunktzahl: 0 (Spiel startet mit erstem Zug des Spielers)
 * ----------------------------------------
 * Spiel mit Timer:
 * Zeitabzug alle 10 Sekunden: -2 Punkte
 * Zeitbonus: 700.000 / (Timer Zeit in Sekunden)
 */

/**
 * Enum für die Punktekategorien (IntelliSense Support)
 * @readonly
 * @enum {string}
 */
const PointType = Object.freeze({
    ACTION: 'ACTION',
    BONUS: 'BONUS',
    PENALTY: 'PENALTY'
});

/** @enum {string} */
const ACTION = Object.freeze({
    FLIP_CARD: 'FLIP_CARD',
    WASTE_TO_TABLEAU: 'WASTE_TO_TABLEAU',
    WASTE_TO_FOUNDATION: 'WASTE_TO_FOUNDATION',
    TABLEAU_TO_TABLEAU: 'TABLEAU_TO_TABLEAU',
    TABLEAU_TO_FOUNDATION: 'TABLEAU_TO_FOUNDATION'
});

/** @enum {string} */
const BONUS = Object.freeze({
    FLIP_COMBO: 'FLIP_COMBO',
    FOUNDATION_COMBO: 'FOUNDATION_COMBO',
    SPEED_BONUS: 'SPEED_BONUS',
    PURIST_BONUS: 'PURIST_BONUS',
    STREAK_START: 'STREAK_START'
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

const POINTS_CONFIG = Object.freeze({
    [PointType.ACTION]: {
        [ACTION.FLIP_CARD]: 5,
        [ACTION.WASTE_TO_TABLEAU]: 5,
        [ACTION.WASTE_TO_FOUNDATION]: 10,
        [ACTION.TABLEAU_TO_TABLEAU]: 5,
        [ACTION.TABLEAU_TO_FOUNDATION]: 15,
    },
    [PointType.BONUS]: {
        [BONUS.FLIP_COMBO]: { value: 2, label: "Combo: Blitz-Flip" }, // Karten umgedreht in 3 Sekunden
        [BONUS.FOUNDATION_COMBO]: { value: 4, label: "Combo: Karten-Rausch" }, // Karten auf Foundation gelegt in 3 Sekunden
        [BONUS.STREAK_START]: { value: 50, label: "Serien-Bonus" }, // Für jede weitere Spielrunde +50 Punkte zu den Startpunkten
        [BONUS.SPEED_BONUS]: { value: 10, label: "Geschwindigkeits-Bonus" },        // Zeit-Modus, Spiel in unter 2:25 (145) geschafft
        [BONUS.PURIST_BONUS]: { value: 10, label: "Puristen-Bonus" },       // Spiel ohne Automatik-Hilfen geschafft (Auto-Foundation, Auto-Flip, Auto-Hints)
    },
    [PointType.PENALTY]: {
        [PENALTY.UNDO_PENALTY]: { value: -2, label: "Korrektur-Abzug" }, // Zug rückgängig (ab 3x -5)
        [PENALTY.STOCK_RESET]: { value: -2, label: "Stapel-Gebühr" }, // Waste Karten zurück auf Stock (ab 3x, je -2) 
        [PENALTY.TIME_PENALTY]: -2,       // Zeit-Modus, alle 10 Sekunden
        [PENALTY.HINT_PENALTY]: { value: -10, label: "Tipp-Kosten" }, // Hinweis geben (ab 3x -12)
        [PENALTY.FROM_FOUNDATION]: -15,   // vom Grundstapel zurück ins Spielfeld (berechnen lassen, wie viel Punkte die Karte gegeben hat 10 oder 15)
        [PENALTY.SHUFFLE_RESCUE]: -50,    // verdeckte Karten neu mischen
    }
});

/**
 * Ermittelt den numerischen Punktwert für eine Aktion aus der Config.
 * @param {PointType} type - Die Kategorie (ACTION, BONUS, PENALTY)
 * @param {string} key - Der spezifische Schlüssel
 * @param {HTMLElement} [card] - Optional für dynamische Abzüge (Foundation)
 * @returns {number}
 */
function getScoreValue(type, key, card = null) {
    // 1. Speziallogik: Zurückholen aus der Foundation (dynamischer Wert)
    if (key === PENALTY.FROM_FOUNDATION && card?.dataset.pointsGiven) {
        // Wir ziehen genau das ab, was die Karte gegeben hat (als negativer Wert)
        return -parseInt(card.dataset.pointsGiven);
    }

    const item = POINTS_CONFIG[type]?.[key];

    // 2. Fallunterscheidung: Ist es ein Objekt {value, label} oder eine einfache Zahl?
    if (item && typeof item === 'object') {
        return item.value ?? 0;
    }

    return item ?? 0;
}

/**
 * Berechnet Punkte basierend auf Start- und Zielort einer Karte
 */
function applyMoveScore(card, sourceParent, target) {
    if (gameState.is(GameStates.DEMO)) return;
    if (!card || !target || !sourceParent) return;

    const isFromFoundation = sourceParent.classList.contains('foundation');
    const isToFoundation = target.classList.contains('foundation');
    const isFromTableau = sourceParent.classList.contains('column');
    const isToTableau = target.classList.contains('column');
    const isFromWaste = sourceParent.id === 'waste-pile';

    let points = 0;
    let moveLabel = ""; // Hilfsvariable für das Logging

    // 1. ZIEL: FOUNDATION
    if (isToFoundation) {
        if (isFromTableau) {
            points = getScoreValue(PointType.ACTION, ACTION.TABLEAU_TO_FOUNDATION);
            moveLabel = "TABLEAU_TO_FOUNDATION";
        }
        else if (isFromWaste) {
            points = getScoreValue(PointType.ACTION, ACTION.WASTE_TO_FOUNDATION);
            moveLabel = "WASTE_TO_FOUNDATION";
        }
        // WICHTIG: Punkte an der Karte speichern für eventuellen Rückzug
        card.dataset.pointsGiven = points;
    }
    // 2. QUELLE: FOUNDATION (Strafe)
    else if (isFromFoundation) {
        points = getScoreValue(PointType.PENALTY, PENALTY.FROM_FOUNDATION, card);
        moveLabel = "FROM_FOUNDATION_PENALTY";
        delete card.dataset.pointsGiven;

        triggerGameMsg(PENALTY.FROM_FOUNDATION, points);
        logExtraPoints(`FROM_FOUNDATION [${points}]`);
    }
    // 3. ZIEL: TABLEAU
    /*else if (isFromWaste && target.classList.contains('column')) {
        points = getScoreValue(PointType.ACTION, ACTION.WASTE_TO_TABLEAU);
        moveLabel = "WASTE_TO_TABLEAU";
    }*/
    else if (isToTableau) {
        if (isFromWaste) {
            points = getScoreValue(PointType.ACTION, ACTION.WASTE_TO_TABLEAU);
            moveLabel = "WASTE_TO_TABLEAU";
        } else if (isFromTableau && sourceParent !== target) {
            // Diesen Fall brauchst du für Drag & Drop Punkte!
            points = getScoreValue(PointType.ACTION, ACTION.TABLEAU_TO_TABLEAU);
            moveLabel = "TABLEAU_TO_TABLEAU";
        }
    }

    if (points !== 0) {
        updateScore(points);

        // Nutze das passende Logging-System
        if (moveLabel === "FROM_FOUNDATION_PENALTY") {
            logExtraPoints(`${moveLabel} [${points}]`);
        } else {
            logMoveSteps(`${moveLabel} [${points}]`);
        }
    }
}

/**
 * Universeller Combo-Handler
 */
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

function applyUndoPenalty() {
    if (gameState.is(GameStates.DEMO)) return;

    undoCount++;
    // Erst ab dem 4. Mal kostet es Punkte
    if (undoCount > 3) {
        const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.UNDO_PENALTY);
        updateScore(penaltyPoints);
        triggerGameMsg(PENALTY.UNDO_PENALTY, penaltyPoints);
        logExtraPoints(`UNDO_PENALTY: ${penaltyPoints}`);
    } else {
        // Stilles Logging für die ersten 3 Male
        logExtraPoints(`UNDO_FREEBIE [${3 - undoCount} left]`);
    }
}

/**
 * Logik für komplexe Boni am Spielende
 */
const VictoryCalculator = {
    /**
     * Berechnet den Speed-Bonus (unter 2:25 Min)
     */
    getSpeedBonus: (duration) => {
        const cfg = POINTS_CONFIG[PointType.BONUS][BONUS.SPEED_BONUS];
        return (duration > 0 && duration < 145) ? cfg.value : 0;
    },

    /**
     * Berechnet den Puristen-Bonus (Keine Hilfen aktiv)
     */
    getPuristBonus: (settings) => {
        const cfg = POINTS_CONFIG[PointType.BONUS][BONUS.PURIST_BONUS];
        const isPurist = !settings.autoFoundation && !settings.autoFlip && !settings.autoHint;
        return isPurist ? cfg.value : 0;
    },

    /**
     * Berechnet den dynamischen Zeit-Bonus
     */
    getTimeBonus: (duration) => {
        return duration > 0 ? Math.floor(700000 / duration) : 0;
    }
};

const sessionStats = {
    flipComboCount: 0,
    flipComboPoints: 0,
    foundationComboCount: 0,
    foundationComboPoints: 0,
    // Hilfsvariablen für das Tracking
    lastFlipTime: 0,
    flipWindowCount: 0,
    lastFoundationTime: 0,
    foundationWindowCount: 0
};

function resetSessionStats() {
    sessionStats.flipComboCount = 0;
    sessionStats.flipComboPoints = 0;
    sessionStats.foundationComboCount = 0;
    sessionStats.foundationComboPoints = 0;
    sessionStats.lastFlipTime = 0;
    sessionStats.flipWindowCount = 0;
    sessionStats.lastFoundationTime = 0;
    sessionStats.foundationWindowCount = 0;
}

function showWinScreen() {
    console.log(`--- Dein Ergebnis ---`);
    console.log(`Flip Kombos: ${sessionStats.flipComboCount} (Punkte: ${sessionStats.flipComboPoints})`);
    console.log(`Foundation Kombos: ${sessionStats.foundationComboCount} (Punkte: ${sessionStats.foundationComboPoints})`);
    //console.log(`Gesamtpunkte: ${currentScore}`);

    console.log(`Win-Streak Bonus: ${kts.game.winStreak * 50} Punkte.`)
}



















const scoreManager = {
    score: 0,
    combo: 0,
    multiplier: 1,
    history: [],

    add(type, key, meta = {}) {
        const base = POINTS[type]?.[key] ?? 0;

        // Combo erhöhen bei positiven Aktionen
        if (base > 0) {
            this.combo++;
        } else {
            this.combo = 0;
        }

        // Multiplikator berechnen
        this.multiplier = 1 + Math.floor(this.combo / 5) * 0.5;

        const total = Math.round(base * this.multiplier);

        this.score += total;

        const entry = {
            type,
            key,
            base,
            multiplier: this.multiplier,
            total,
            combo: this.combo,
            time: Date.now(),
            ...meta
        };

        this.history.push(entry);

        this.debug(entry);
        this.emit(entry);

        return total;
    },

    reset() {
        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.history = [];
    },

    getScore() {
        return this.score;
    },

    // Events (UI, Animation etc.)
    listeners: [],
    onScore(cb) {
        this.listeners.push(cb);
    },
    emit(entry) {
        this.listeners.forEach(cb => cb(entry, this.score));
    },

    debug(entry) {
        if (!IS_DEV_MODE) return;

        const sign = entry.total >= 0 ? "+" : "";
        console.log(
            `%c${sign}${entry.total} [${entry.key}] (x${entry.multiplier.toFixed(1)} | Combo: ${entry.combo})`,
            `color: ${entry.total >= 0 ? "#2ecc71" : "#e74c3c"}; font-weight: bold;`
        );
    }
};
/*
// Karte aufdecken
scoreManager.add("actions", "FLIP_CARD");

// Karte auf Foundation
scoreManager.add("actions", "TO_FOUNDATION");

// Undo
scoreManager.add("penalty", "UNDO");

// Hint
scoreManager.add("penalty", "HINT");
*/

const streakManager = {
    current: 0,
    best: 0,

    load() {
        const data = JSON.parse(localStorage.getItem("kts_streak")) || {};
        this.current = data.current || 0;
        this.best = data.best || 0;
    },

    save() {
        localStorage.setItem("kts_streak", JSON.stringify({
            current: this.current,
            best: this.best
        }));
    },

    win() {
        this.current++;
        this.best = Math.max(this.best, this.current);

        this.save();
        this.applyRewards();

        showStreakMsg(`🔥 Siegesserie: ${this.current}`);
    },

    lose() {
        this.current = 0;
        this.save();

        showStreakMsg("💀 Serie verloren");
    },

    applyRewards() {
        // Startbonus
        const bonus = 50 + (this.current * 10);
        scoreManager.add("bonus", "STREAK_GAME_START", { streak: this.current });

        abilityManager.addCharges("UNDO", Math.min(3, this.current));

        if (this.current >= 3) {
            abilityManager.unlock("XRAY");
        }
    }
};

const abilityManager = {
    abilities: {
        UNDO: { charges: 0, max: 3 },
        XRAY: { unlocked: false, charges: 0, max: 3 }
    },

    unlock(name) {
        if (!this.abilities[name]) return;
        this.abilities[name].unlocked = true;

        showStreakMsg(`🔓 Fähigkeit freigeschaltet: ${name}`);
    },

    addCharges(name, amount) {
        const a = this.abilities[name];
        if (!a) return;

        a.charges = Math.min(a.max, a.charges + amount);
    },

    use(name) {
        const a = this.abilities[name];
        if (!a || (!a.unlocked && name !== "UNDO")) return false;

        if (a.charges <= 0) return false;

        a.charges--;
        return true;
    }
};

function useXRay() {
    if (!abilityManager.use("XRAY")) return;

    showStreakMsg("👁️ X-Ray aktiviert!");

    const hiddenCards = document.querySelectorAll(".card.hidden");

    hiddenCards.forEach(card => {
        card.classList.add("temp-reveal");
    });

    setTimeout(() => {
        hiddenCards.forEach(card => {
            card.classList.remove("temp-reveal");
        });
    }, 2000);
}

const eventManager = {
    lastMoves: [],
    maxTrack: 10,

    track(move) {
        this.lastMoves.push(move);
        if (this.lastMoves.length > this.maxTrack) {
            this.lastMoves.shift();
        }

        this.check();
    },

    check() {
        this.checkFoundationChain();
        this.checkUncoverStreak();
    },

    checkFoundationChain() {
        const last3 = this.lastMoves.slice(-3);

        if (last3.every(m => m === "TO_FOUNDATION")) {
            scoreManager.add("bonus", "STACK_RUSH");
            showStreakMsg("⚡ Stapel-Rausch!");
        }
    },

    checkUncoverStreak() {
        const last2 = this.lastMoves.slice(-2);

        if (last2.every(m => m === "FLIP_CARD")) {
            scoreManager.add("bonus", "EXPLORER_LUCK");
            showStreakMsg("🔍 Entdecker-Glück!");
        }
    }
};

/*
// Karte aufgedeckt
eventManager.track("FLIP_CARD");

// Karte auf Foundation
eventManager.track("TO_FOUNDATION");
*/

// 👑 4 Könige unter 2 Minuten
function checkKings(time, kingsRevealed) {
    if (kingsRevealed === 4 && time < 120) {
        scoreManager.add("bonus", "KING_EMPTY_SPOT");
        showStreakMsg("👑 Königsmaster!");
    }
}

// 🅰️ Ass Rush
function checkAces(time, acesPlaced) {
    if (acesPlaced === 4 && time < 30) {
        scoreManager.add("bonus", "STACK_RUSH");
        showStreakMsg("🚀 Ass-Rakete!");
    }
}

// 🔁 Stock Abuse Penalty
let reshuffleCount = 0;

function onReshuffle() {
    reshuffleCount++;

    if (reshuffleCount > 5) {
        scoreManager.add("penalty", "SHUFFLE");
        showStreakMsg("♻️ Zu oft gemischt!");
    }
}

// 🎯 7. Startbonus nächste Runde
function applyNextRunBonus(lastGameTime) {
    if (lastGameTime < 180) {
        scoreManager.score += 100;
        showStreakMsg("🐦 Early Bird Bonus +100!");
    }
}

/*
Du hast jetzt:

🔥 Meta-Progression
Siegesserien
Unlocks
Startboni
⚡ Gameplay-Dynamik
Chains
Combo Events
Skill Rewards
🎮 Fähigkeiten
X-Ray
Free Undo
*/