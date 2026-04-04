/**
 * Trennung:
 * STATE (Timer- & Steuer-Logik)
 * CALC (Tipp Berechnung (Welcher Zug ist sinnvoll))
 * UI (Darstellung)
 */



/* ==========================================================================
   Timer- & Steuer-Logik
   ========================================================================== */
let hintTimerId;
let lastHintReset = 0;
let isFirstHintOfGame = true; // Tracking für den Gratis-Tipp

function scheduleNextHint() {
    clearTimeout(hintTimerId);

    if (!shouldAutoHintRun()) return;

    // Wir nutzen IMMER ein Mindest-Delay, um Rekursion zu verhindern
    const delay = kts.cfg.devHintSpeed ? 200 : (kts.cfg.hintDelay || 5000);

    if (kts.cfg.devHintSpeed) {
        hintUI.setDevReady();
    } else {
        hintUI.startProgressAnimation(delay);
    }

    hintTimerId = setTimeout(() => {
        triggerHint(true);
    }, delay);
}

function shouldAutoHintRun() {
    return kts.cfg.autoHint && gameState.is(GameStates.RUNNING) && !gameState.is(GameStates.PAUSIERT);
}

function getHintDelay() {
    return kts.cfg.devHintSpeed ? 100 : kts.cfg.hintDelay;
}

/* ==========================================================================
   Tipp-Logik (UI frei)
   ========================================================================== */

function findBestHintMove() {
    const cols = document.querySelectorAll('.column');
    const foundations = document.querySelectorAll('.foundation');
    const wastePile = document.getElementById('waste-pile');

    let bestMove = null;
    let highestPriority = -1;
    let possibleMoves = [];

    function evaluateMove(card, target, source) {
        const cardVal = card.dataset.value;
        const isToFoundation = target.classList.contains('foundation');

        // 1. Foundation Asse (Höchste Prio)
        if (isToFoundation && cardVal === 'A') return 110;

        // 2. Tableau Karte freilegen (Verdeckte Karte darunter)
        if (source.classList.contains('column') && !isToFoundation) {
            const cards = Array.from(source.children);
            const idx = cards.indexOf(card);
            if (idx > 0 && cards[idx - 1].classList.contains('back')) return 105;
        }

        // 3. Foundation allgemein (Wichtiger als bloßes Hin- und Herschieben)
        if (isToFoundation) return 100;

        // 4. König auf leere Spalte
        const isTargetEmptyColumn = target.classList.contains('column') && target.children.length === 0;
        if (cardVal === 'K' && isTargetEmptyColumn) {
            if (source.classList.contains('column') && Array.from(source.children).indexOf(card) > 0) return 95;
            if (source.id === 'waste-pile') return 85;
        }

        // 5. Waste ins Tableau
        if (source.id === 'waste-pile') return 80;

        // 6. Restliche Standard-Züge
        return 50;
    }

    const sources = [...cols, wastePile];

    for (let source of sources) {
        const cards = Array.from(source.children);
        if (!cards.length) continue;

        // --- ZWEI PRÜF-STRATEGIEN PRO QUELLE ---

        // A) Die oberste offene Karte (für Züge innerhalb des Tableaus / Stapel verschieben)
        const topFaceUpCard = source.id === 'waste-pile'
            ? source.lastElementChild
            : cards.find(c => !c.classList.contains('back'));

        // B) Die unterste Karte (NUR für die Foundation relevant)
        const bottomCard = source.lastElementChild;

        // Liste der Karten, die wir von dieser Quelle aus prüfen
        const candidates = [];
        if (topFaceUpCard) candidates.push({ card: topFaceUpCard, onlyTableau: false });
        if (bottomCard && bottomCard !== topFaceUpCard) candidates.push({ card: bottomCard, onlyFoundation: true });

        for (let { card, onlyFoundation, onlyTableau } of candidates) {
            const allTargets = [...foundations, ...cols];

            for (let target of allTargets) {
                if (source === target) continue;

                // Filter: Foundation-Kandidaten nicht aufs Tableau prüfen und umgekehrt
                if (onlyFoundation && !target.classList.contains('foundation')) continue;
                if (onlyTableau && target.classList.contains('foundation')) continue;

                // --- VALIDIERUNG ---
                if (validateMove(card, target)) {

                    // Ping-Pong & Sinnlos-Check (König auf leer)
                    if (lastUserMove && card.dataset.cardId === lastUserMove.cardId && target.id === lastUserMove.fromId) continue;
                    if (card.dataset.value === 'K' && target.classList.contains('column') && target.children.length === 0) {
                        if (source.classList.contains('column') && Array.from(source.children).indexOf(card) === 0) continue;
                    }

                    const priority = evaluateMove(card, target, source);

                    possibleMoves.push({
                        card: `${card.dataset.value}${card.dataset.symbol}`,
                        from: source.id || source.dataset.colIndex,
                        to: target.id || target.className,
                        prio: priority
                    });

                    if (priority > highestPriority) {
                        highestPriority = priority;
                        bestMove = { card: card, target: target, priority: priority };
                    }
                }
            }
        }
    }
    return bestMove;
}

/**
 * Berechnet den besten möglichen Zug.
 * @returns {{card: HTMLElement, target: HTMLElement, priority: number} | null}
 */
function findBestHintMoveOLD() {
    const cols = document.querySelectorAll('.column');
    const foundations = document.querySelectorAll('.foundation');
    const wastePile = document.getElementById('waste-pile');

    let bestMove = null;
    let highestPriority = -1;
    let possibleMoves = []; // Liste für das Debugging

    function evaluateMove(card, target, source) {
        const cardVal = card.dataset.value;

        // 1. Foundation Asse (110)
        if (target.classList.contains('foundation') && cardVal === 'A') return 110;

        // 2. Tableau Karte freilegen (95)
        if (source.classList.contains('column')) {
            const cards = Array.from(source.children);
            const idx = cards.indexOf(card);
            if (idx > 0 && cards[idx - 1].classList.contains('back')) return 95;
        }

        // 3. Foundation allgemein (90)
        if (target.classList.contains('foundation')) return 90;

        // 4. König auf leere Spalte
        const isTargetEmptyColumn = target.classList.contains('column') && target.children.length === 0;
        if (cardVal === 'K' && isTargetEmptyColumn) {
            // A: Kommt er aus dem Waste? (85) -> Wichtig, aber zweitrangig hinter "Karte freilegen"
            if (source.id === 'waste-pile') return 85;

            // B: Kommt er vom Tableau? (96) -> höher als normale "Karte freilegen"
            if (source.classList.contains('column')) {
                // Wenn er weiter oben liegt und verdeckte Karten freigibt
                return 96;
            }
        }

        // 5. Waste ins Tableau (80)
        if (source.id === 'waste-pile') return 80;

        // 6. restliche valide Züge
        return 50;
    }

    const sources = [...cols, wastePile];

    for (let source of sources) {
        const cards = Array.from(source.children);
        if (!cards.length) continue;

        // Finde die tiefste offene Karte (um ganze Stapel zu prüfen)
        const cardToMove = source.id === 'waste-pile'
            ? source.lastElementChild
            : cards.find(c => !c.classList.contains('back'));

        if (!cardToMove) continue;

        // Prüfe alle Ziele
        const allTargets = [...foundations, ...cols];
        for (let target of allTargets) {
            if (source === target) continue;

            // --- SINNLOS-CHECK FÜR KÖNIGE ---
            const isTargetEmptyColumn = target.classList.contains('column') && target.children.length === 0;
            if (cardToMove.dataset.value === 'K' && isTargetEmptyColumn) {

                // Wenn die Quelle eine Spalte ist...
                if (source.classList.contains('column')) {
                    const cardsInSource = Array.from(source.children).filter(el => el.classList.contains('card'));

                    // ...und der König dort schon an Index 0 liegt
                    if (cardsInSource.indexOf(cardToMove) === 0) {
                        continue; // Diesen Ziel-Stapel komplett ignorieren
                    }
                }
            }

            // --- PING-PONG SCHUTZ ---
            // Wenn das Ziel (target) genau dort ist, wo die Karte herkam, ignorieren.
            if (lastUserMove && // Sicherstellen, dass lastUserMove existiert, bevor cardId geprüft wird (greift also erst nach erstem Zug)
                cardToMove.dataset.cardId === lastUserMove.cardId &&
                (target.id === lastUserMove.fromId)) {
                continue;
            }

            if (validateMove(cardToMove, target)) {
                const priority = evaluateMove(cardToMove, target, source);

                // Debug-Info in Liste sammeln
                possibleMoves.push({
                    card: `${cardToMove.dataset.value}${cardToMove.dataset.symbol}`,
                    from: source.id || source.dataset.colIndex || source.className,
                    to: target.id || target.dataset.colIndex || target.className,
                    prio: priority
                });

                if (priority > highestPriority) {
                    highestPriority = priority;
                    bestMove = { card: cardToMove, target: target, priority: priority };
                }
            }
        }
    }

    // --- DEBUG AUSGABE ---
    if (IS_DEV_MODE && possibleMoves.length > 0) {
        console.groupCollapsed(`🧠 Hint Engine (${possibleMoves.length} Züge geprüft)`);

        console.groupCollapsed("📋 Alle möglichen Züge");
        console.table(possibleMoves.sort((a, b) => b.prio - a.prio));
        console.groupEnd();

        if (bestMove) {
            console.groupCollapsed("🏆 Bester Zug");

            console.log("🃏 Karte:", `${bestMove.card.dataset.value}${bestMove.card.dataset.symbol}`);
            console.log("📍 Ziel:", bestMove.target.id || bestMove.target.dataset?.colIndex || bestMove.target.className);
            console.log("⭐ Priorität:", bestMove.priority);

            console.log("🔍 Full Object:", bestMove);
            console.groupEnd();
        } else {
            console.log("⚠️ Kein gültiger Zug gefunden");
        }

        console.groupEnd();
    }

    return bestMove;
}

/* ==========================================================================
   Tipp-Logik (UI)
   ========================================================================== */

const hintUI = {
    container: document.getElementById('hint-cooldown-container'),
    ring: document.getElementById('hint-progress-ring'),
    // NEU: Referenz auf den gesamten Ticker-Container
    tickerContainer: document.getElementById('info-ticker'),
    // Referenz auf den Text-Span
    banner: document.getElementById('ticker-text'),
    bannerTimer: null,

    resetCooldown() {
        this.container?.classList.remove('is-ready', 'is-charging');
    },

    startProgressAnimation(delay) {
        if (!this.container || !this.ring) return;

        this.container.classList.remove('is-charging', 'is-ready');

        void this.container.offsetWidth;
        void this.ring.offsetWidth;

        const seconds = delay / 1000;

        this.container.style.setProperty('--fill-duration', `${seconds}s`);
        this.ring.style.animationDuration = `${seconds}s`;

        this.container.classList.add('is-charging');
    },

    showHint(move, isAuto) {
        if (!move) return;

        move.card.classList.add('hint-source-highlight');
        move.target.classList.add('hint-target-highlight');

        this.container?.classList.add('is-ready');

        if (!isAuto) {
            const targetName = move.target.classList.contains('foundation')
                ? "Foundation"
                : `Stapel ${parseInt(move.target.id.replace('col-', '')) + 1}`;

            const bannerText =
                `Tipp: ${move.card.dataset.symbol} ${move.card.dataset.value} auf ${targetName}.`;

            //this.banner.innerText =
            //`Tipp: ${move.card.dataset.symbol} ${move.card.dataset.value} auf ${targetName}.`;

            this.showBanner(bannerText)
        }
    },

    showBanner(text, duration = 6000) {
        // Sicherstellen, dass beide Elemente existieren
        if (!this.banner || !this.tickerContainer) return;

        clearTimeout(this.bannerTimer); // Alten Timer stoppen

        // 1. Text setzen und sichtbar machen
        this.banner.innerText = text;
        this.tickerContainer.classList.remove('ticker-hidden');

        this.bannerTimer = setTimeout(() => {
            // 2. Container ausfaden lassen
            this.tickerContainer.classList.add('ticker-hidden');

            // 3. Text erst nach der CSS-Transition (0.4s) leeren
            setTimeout(() => {
                if (this.tickerContainer.classList.contains('ticker-hidden')) {
                    this.banner.innerText = '';
                }
            }, 400);

        }, duration);
    },

    clearHighlights() {
        document.querySelectorAll('.hint-source-highlight, .hint-target-highlight')
            .forEach(el => el.classList.remove('hint-source-highlight', 'hint-target-highlight'));
    },

    setVisibility(visible) {
        if (this.container) {
            this.container.style.display = visible ? 'flex' : 'none';
        }
    },
    //NEU:
    setDevReady() {
        if (!this.container) return;
        this.container.classList.remove('is-charging');
        this.container.classList.add('is-ready');
        this.container.style.setProperty('--fill-duration', '0s');
    }
};

/* ==========================================================================
   Orchestrator (verbindet alles)
   ========================================================================== */

let lastUserMove = { cardId: null, fromId: null };
//let currentDisplayedHint = null;

let currentDisplayedHint = null;  // der aktuell angezeigte Tipp
hintUI.lastLoggedSameHint = false; // Hilfsflag für wiederholte Logs

function triggerHint(isAuto = false) {
    // --- 1. Basis-Checks ---
    if (isAnimating || gameState.is(GameStates.PAUSIERT) || !gameState.is(GameStates.RUNNING)) {
        if (isAuto) scheduleNextHint();
        return;
    }

    const move = findBestHintMove();

    // --- 2. Kein Move gefunden ---
    if (!move) {
        hintUI.clearHighlights();
        currentDisplayedHint = null;

        if (!isAuto) {
            const sprueche = [
                "Momentan kein Tipp auf Lager – Hilfsstapel?",
                "Sackgasse! Der Hilfsstapel ist dein bester Freund.",
                "Tja, hier hilft nur noch Karten aufdecken.",
                "Ich mache gerade Pause.",
                "Ich weiß auch nicht weiter.",
                "Da fällt mir beim besten Willen nichts ein.",
                "Äh, mal sehen. Die oder doch die. Ne, kein Plan!",
                "Wenn ich meine Augen zusammen pfetze, sehe ich...nichts!",
                "Lass Papa mal ran! Ich würde ganz einfach...hm...weiß auch nicht",
                "In dieser ausweglosen Situation fragst du MICH. Ich muss weg!",
                "Was, wie bitte?!",
                "Hallo, ich helfe Ihnen gerne...leider kann ich Ihnen nicht helfen.",
                "Mal sehen, was wir da machen können. Nichts!",
                "Immer mit der Ruhe! Moment, mal sehen, MITTAGSPAUSE!",
                "Ja, hm, was war noch gleich",
                "Kombiniere, kombiniere...nichts zu machen.",
                "Immer ich. Warte ich schau mal. Hier ist nichts!",
                "Da weiß ich auch nicht weiter",
                "Hinweis momentan nicht verfügbar. Versuchen sie es später nochmal.",
                "Gib mir mal einen Tipp. Ich bin ratlos."

            ];
            const randomMsg = sprueche[Math.floor(Math.random() * sprueche.length)];
            hintUI.showBanner(randomMsg);
        }

        if (isAuto) scheduleNextHint();
        return;
    }

    // --- 3. Anti-Flicker: gleicher Move wie vorher ---
    if (currentDisplayedHint &&
        currentDisplayedHint.card === move.card &&
        currentDisplayedHint.target === move.target) {

        // Highlight trotzdem setzen, damit man die Karte sieht
        hintUI.clearHighlights();
        hintUI.showHint(move, isAuto);

        // Einmaliger Log
        if (!hintUI.lastLoggedSameHint) {
            devLog("HINT RESULT (wiederholt, gleiche Karte):", move);
            hintUI.lastLoggedSameHint = true;
        }

        if (isAuto) scheduleNextHint();
        return;
    } else {
        // Neuer Move -> Log-Flag reset
        hintUI.lastLoggedSameHint = false;
    }

    // --- 4. Neuer Move ---
    currentDisplayedHint = move;

    hintUI.clearHighlights();
    hintUI.showHint(move, isAuto);

    devLog("HINT RESULT:", move);

    // --- 5. Kosten-Logik für manuelle Tipps ---
    if (!kts.cfg.devHintSpeed && !isAuto) {
        if (isFirstHintOfGame) {
            isFirstHintOfGame = false;
            triggerGameMsg({ label: "Erster Tipp gratis!" }, 0);
        } else {
            const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.HINT_PENALTY);
            updateScore(penaltyPoints);
            triggerGameMsg(PENALTY.HINT_PENALTY, penaltyPoints);
            logExtraPoints(`HINT_PENALTY: ${penaltyPoints}`);
        }
    }

    // --- 6. Auto-Hint Timer ---
    if (isAuto && !kts.cfg.devHintSpeed) {
        scheduleNextHint();
    }
}

function triggerHintOLD(isAuto = false) {
    // --- 1. Basis-Checks (Pause/Animation) ---
    if (isAnimating || gameState.is(GameStates.PAUSIERT) || !gameState.is(GameStates.RUNNING)) {
        if (isAuto) scheduleNextHint();
        return;
    }

    const move = findBestHintMove();
    console.log("HINT RESULT:", move);

    // --- 2. NO MOVE FOUND (RECURSION PROTECTION) ---
    if (!move) {
        hintUI.clearHighlights();
        currentDisplayedHint = null;

        // Feedback an den User (nur wenn manuell geklickt)
        if (!isAuto) {
            const sprueche = [
                "Momentan kein Tipp auf Lager – Hilfsstapel?",
                "Sackgasse! Der Hilfsstapel ist dein bester Freund.",
                "Tja, hier hilft nur noch Karten aufdecken.",
                "Ich mache gerade Pause.",
                "Ich weiß auch nicht weiter.",
                "Da fällt mir beim besten Willen nichts ein.",
                "Äh, mal sehen. Die oder doch die. Ne, kein Plan!",
                "Wenn ich meine Augen zusammen pfetze, sehe ich...nichts!",
                "Lass Papa mal ran! Ich würde ganz einfach...hm...weiß auch nicht",
                "In dieser ausweglosen Situation fragst du MICH. Ich muss weg!",
                "Was, wie bitte?!",
                "Hallo, ich helfe Ihnen gerne...leider kann ich Ihnen nicht helfen.",
                "Mal sehen, was wir da machen können. Nichts!",
                "Immer mit der Ruhe! Moment, mal sehen, MITTAGSPAUSE!",
                "Ja, hm, was war noch gleich",
                "Kombiniere, kombiniere...nichts zu machen.",
                "Immer ich. Warte ich schau mal. Hier ist nichts!",
                "Da weiß ich auch nicht weiter",
                "Hinweis momentan nicht verfügbar. Versuchen sie es später nochmal.",
                "Gib mir mal einen Tipp. Ich bin ratlos."

            ];
            const randomMsg = sprueche[Math.floor(Math.random() * sprueche.length)];

            // Nutze dein vorhandenes Banner oder eine GameMsg
            if (hintUI.banner) {
                hintUI.banner.classList.remove('hidden');
                hintUI.banner.innerText = randomMsg;
            }
            // Falls du ein Popup/Toast System hast:
            // triggerGameMsg("HINT_EMPTY", 0); 
        }

        if (isAuto) {
            //scheduleNextHint();
        }
        return;
    }

    // --- 3. ANTI-FLICKER CHECK ---
    // Wenn der neue Tipp derselbe ist wie der alte, einfach abbrechen.
    if (currentDisplayedHint && move &&
        currentDisplayedHint.card === move.card &&
        currentDisplayedHint.target === move.target) {

        // WICHTIG: Auch hier den nächsten Check planen, aber mit Pause!
        if (isAuto) {
            scheduleNextHint();
        }
        return;
    }

    // --- AB HIER: GÜLTIGER NEUER TIPP GEFUNDEN ---

    // 4. KOSTEN-LOGIK (Nur bei manuellem Klick & wenn nicht Dev-Mode)
    if (!kts.cfg.devHintSpeed) {
        if (isFirstHintOfGame) { // Erster Tipp: Gratis!
            // Egal ob Auto oder Manuell: Der erste gefundene Tipp verbraucht den Joker
            isFirstHintOfGame = false;

            // Nur beim manuellen Klick zeigen wir die "Gratis"-Nachricht
            if (!isAuto) {
                triggerGameMsg({ label: "Erster Tipp gratis!" }, 0);
            }
        } else {
            // Ab dem zweiten Tipp: Nur abziehen, wenn der User den Button gedrückt hat
            if (!isAuto) {
                const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.HINT_PENALTY);
                updateScore(penaltyPoints);
                triggerGameMsg(PENALTY.HINT_PENALTY, penaltyPoints);
                logExtraPoints(`HINT_PENALTY: ${penaltyPoints}`);
            }
        }
    }

    // Ab hier haben wir einen neuen, anderen Move gefunden
    currentDisplayedHint = move;

    hintUI.clearHighlights();
    hintUI.showHint(move, isAuto);

    // --- 5. DARSTELLUNG ---
    if (isAuto && !kts.cfg.devHintSpeed) {
        scheduleNextHint();
    }
}

/**
 * Pausiert das automatische Tipp-System und stoppt die UI-Animationen.
 */
function pauseHintSystem() {
    const wasActive = !!hintTimerId; // vorherigen Zustand merken

    // Stoppt den aktuellen Timer für den nächsten Tipp
    if (hintTimerId) {
        clearTimeout(hintTimerId);
        hintTimerId = null;
    }

    // UI-Animation stoppen und Highlights entfernen
    hintUI.resetCooldown();
    hintUI.clearHighlights();

    if (IS_DEV_MODE && wasActive) console.log("⏸️ Hint System pausiert");
}

/**
 * Setzt das Tipp-System fort, sofern die Bedingungen (Game Running etc.) erfüllt sind.
 */
function resumeHintSystem() {
    if (!shouldAutoHintRun()) return;

    // Startet den Zyklus neu
    scheduleNextHint();

    if (IS_DEV_MODE) console.log("▶️ Hint System fortgesetzt");
}

// Debug-Hover: Zeigt Index und Status in der Konsole
document.addEventListener('mouseenter', (e) => {
    if (IS_DEV_MODE) {
        const card = e.target.closest('.card');
        if (!card) return;

        const parent = card.parentElement;
        const allChildren = Array.from(parent.children);
        const idx = allChildren.indexOf(card);
        const isBack = card.classList.contains('back');

        //console.log(`Karte: ${card.dataset.value}${card.dataset.symbol} | Index: ${idx} | Parent: ${parent.id || parent.className} | Hidden: ${isBack}`);
    }
}, true);

function clearHints() {
    // Radikaler Rundumschlag gegen alle Highlight-Klassen
    const highlightClasses = ['hint-highlight', 'hint-source-highlight', 'hint-target-highlight'];
    document.querySelectorAll('.card, .column, .foundation, .slot').forEach(el => {
        el.classList.remove(...highlightClasses);
    });

    // Falls du ein Timer-basiertes Hint-System hast:
    if (window.hintTimeout) {
        clearTimeout(window.hintTimeout);
    }
}