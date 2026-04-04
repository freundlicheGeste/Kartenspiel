/* =====================================================
   GAME HINTS
   Verantwortlich für: Tipp-Timer, Tipp-Berechnung,
   Tipp-UI (hintUI-Objekt).
   Bereinigt: findBestHintMoveOLD() und triggerHintOLD()
   entfernt, getHintDelay() entfernt (nie genutzt),
   HINT_SPRUECHE-Duplizierung aufgelöst.
   Abhängigkeiten: game.state.js, scoring.system.js
===================================================== */

/* =====================================================
   TIMER & STEUERUNG
===================================================== */

let hintTimerId      = null;
let lastHintReset    = 0;
let isFirstHintOfGame = true;

/**
 * Plant den nächsten automatischen Tipp.
 * Bricht ab wenn shouldAutoHintRun() false ist.
 */
function scheduleNextHint() {
    clearTimeout(hintTimerId);
    if (!shouldAutoHintRun()) return;

    const delay = kts.cfg.devHintSpeed ? 200 : (kts.cfg.hintDelay || 5000);

    if (kts.cfg.devHintSpeed) {
        hintUI.setDevReady();
    } else {
        hintUI.startProgressAnimation(delay);
    }

    hintTimerId = setTimeout(() => triggerHint(true), delay);
}

/**
 * Prüft ob der automatische Hint-Timer laufen darf.
 * @returns {boolean}
 */
function shouldAutoHintRun() {
    return kts.cfg.autoHint &&
           gameState.is(GameStates.RUNNING) &&
           !gameState.is(GameStates.PAUSIERT);
}

/* =====================================================
   TIPP-BERECHNUNG (UI-frei)
===================================================== */

/**
 * Findet den besten legalen Zug auf dem aktuellen Spielfeld.
 * Prüft Tableau-Spalten und Waste — mit Ping-Pong-Schutz
 * und Sinnlos-König-Filter.
 * @returns {{ card: HTMLElement, target: HTMLElement, priority: number }|null}
 */
function findBestHintMove() {
    const cols        = document.querySelectorAll('.column');
    const foundations = document.querySelectorAll('.foundation');
    const wastePile   = document.getElementById('waste-pile');

    let bestMove        = null;
    let highestPriority = -1;

    /**
     * Bewertet einen Zug und gibt eine Prioritätszahl zurück.
     * Höher = besser.
     */
    function evaluateMove(card, target, source) {
        const val            = card.dataset.value;
        const isToFoundation = target.classList.contains('foundation');

        // 1. Foundation-Ass (höchste Prio)
        if (isToFoundation && val === 'A') return 110;

        // 2. Verdeckte Karte darunter freilegen
        if (source.classList.contains('column') && !isToFoundation) {
            const cards = Array.from(source.children);
            const idx   = cards.indexOf(card);
            if (idx > 0 && cards[idx - 1].classList.contains('back')) return 105;
        }

        // 3. Foundation allgemein
        if (isToFoundation) return 100;

        // 4. König auf leere Spalte
        const isEmptyCol = target.classList.contains('column') && target.children.length === 0;
        if (val === 'K' && isEmptyCol) {
            if (source.classList.contains('column') &&
                Array.from(source.children).indexOf(card) > 0) return 95;
            if (source.id === 'waste-pile') return 85;
        }

        // 5. Waste ins Tableau
        if (source.id === 'waste-pile') return 80;

        // 6. Sonstige valide Züge
        return 50;
    }

    const sources = [...cols, wastePile];

    for (const source of sources) {
        const cards = Array.from(source.children);
        if (!cards.length) continue;

        // Oberste offene Karte (für Stapel-Züge)
        const topFaceUpCard = source.id === 'waste-pile'
            ? source.lastElementChild
            : cards.find(c => !c.classList.contains('back'));

        // Unterste Karte (nur für Foundation-Prüfung)
        const bottomCard = source.lastElementChild;

        const candidates = [];
        if (topFaceUpCard) candidates.push({ card: topFaceUpCard, onlyFoundation: false });
        if (bottomCard && bottomCard !== topFaceUpCard) {
            candidates.push({ card: bottomCard, onlyFoundation: true });
        }

        for (const { card, onlyFoundation } of candidates) {
            const allTargets = [...foundations, ...cols];

            for (const target of allTargets) {
                if (source === target) continue;
                if (onlyFoundation && !target.classList.contains('foundation')) continue;

                if (!validateMove(card, target)) continue;

                // Ping-Pong-Schutz
                if (lastUserMove?.cardId === card.dataset.cardId &&
                    target.id === lastUserMove.fromId) continue;

                // Sinnloser König-Zug (schon allein auf leerer Spalte)
                if (card.dataset.value === 'K' &&
                    target.classList.contains('column') &&
                    target.children.length === 0 &&
                    source.classList.contains('column') &&
                    Array.from(source.children).indexOf(card) === 0) continue;

                const priority = evaluateMove(card, target, source);
                if (priority > highestPriority) {
                    highestPriority = priority;
                    bestMove = { card, target, priority };
                }
            }
        }
    }

    return bestMove;
}

/* =====================================================
   TIPP UI
===================================================== */

const hintUI = {
    container:       document.getElementById('hint-cooldown-container'),
    ring:            document.getElementById('hint-progress-ring'),
    tickerContainer: document.getElementById('info-ticker'),
    banner:          document.getElementById('ticker-text'),
    bannerTimer:     null,

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
                ? 'Foundation'
                : `Stapel ${parseInt(move.target.id.replace('col-', '')) + 1}`;

            this.showBanner(
                `Tipp: ${move.card.dataset.symbol} ${move.card.dataset.value} auf ${targetName}.`
            );
        }
    },

    showBanner(text, duration = 6000) {
        if (!this.banner || !this.tickerContainer) return;

        clearTimeout(this.bannerTimer);
        this.banner.innerText = text;
        this.tickerContainer.classList.remove('ticker-hidden');

        this.bannerTimer = setTimeout(() => {
            this.tickerContainer.classList.add('ticker-hidden');
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
        if (this.container) this.container.style.display = visible ? 'flex' : 'none';
    },

    setDevReady() {
        if (!this.container) return;
        this.container.classList.remove('is-charging');
        this.container.classList.add('is-ready');
        this.container.style.setProperty('--fill-duration', '0s');
    },
};

/* =====================================================
   ORCHESTRATOR
===================================================== */

let lastUserMove = { cardId: null, fromId: null };
let currentDisplayedHint = null;
hintUI.lastLoggedSameHint = false;

/**
 * Sprüche wenn kein Tipp gefunden wird.
 * SSOT — war vorher in triggerHint und triggerHintOLD dupliziert.
 */
const HINT_SPRUECHE = [
    'Momentan kein Tipp auf Lager – Hilfsstapel?',
    'Sackgasse! Der Hilfsstapel ist dein bester Freund.',
    'Tja, hier hilft nur noch Karten aufdecken.',
    'Ich mache gerade Pause.',
    'Ich weiß auch nicht weiter.',
    'Da fällt mir beim besten Willen nichts ein.',
    'Äh, mal sehen. Die oder doch die. Ne, kein Plan!',
    'Wenn ich meine Augen zusammen pfetze, sehe ich...nichts!',
    'Lass Papa mal ran! Ich würde ganz einfach...hm...weiß auch nicht',
    'In dieser ausweglosen Situation fragst du MICH. Ich muss weg!',
    'Was, wie bitte?!',
    'Hallo, ich helfe Ihnen gerne...leider kann ich Ihnen nicht helfen.',
    'Mal sehen, was wir da machen können. Nichts!',
    'Immer mit der Ruhe! Moment, mal sehen, MITTAGSPAUSE!',
    'Ja, hm, was war noch gleich',
    'Kombiniere, kombiniere...nichts zu machen.',
    'Immer ich. Warte ich schau mal. Hier ist nichts!',
    'Da weiß ich auch nicht weiter',
    'Hinweis momentan nicht verfügbar. Versuchen sie es später nochmal.',
    'Gib mir mal einen Tipp. Ich bin ratlos.',
];

/**
 * Löst einen Tipp aus (manuell oder automatisch).
 * @param {boolean} [isAuto=false]
 */
function triggerHint(isAuto = false) {
    // 1. Guard
    if (isAnimating || gameState.is(GameStates.PAUSIERT) || !gameState.is(GameStates.RUNNING)) {
        if (isAuto) scheduleNextHint();
        return;
    }

    const move = findBestHintMove();

    // 2. Kein Zug gefunden
    if (!move) {
        hintUI.clearHighlights();
        currentDisplayedHint = null;

        if (!isAuto) {
            hintUI.showBanner(HINT_SPRUECHE[Math.floor(Math.random() * HINT_SPRUECHE.length)]);
        }

        if (isAuto) scheduleNextHint();
        return;
    }

    // 3. Gleicher Zug wie vorher (Anti-Flicker)
    if (currentDisplayedHint?.card === move.card &&
        currentDisplayedHint?.target === move.target) {

        hintUI.clearHighlights();
        hintUI.showHint(move, isAuto);

        if (!hintUI.lastLoggedSameHint) {
            devLog?.('HINT RESULT (wiederholt):', move);
            hintUI.lastLoggedSameHint = true;
        }

        if (isAuto) scheduleNextHint();
        return;
    }

    hintUI.lastLoggedSameHint = false;

    // 4. Neuer Zug
    currentDisplayedHint = move;
    hintUI.clearHighlights();
    hintUI.showHint(move, isAuto);
    devLog?.('HINT RESULT:', move);

    // 5. Kosten (nur manuell)
    if (!kts.cfg.devHintSpeed && !isAuto) {
        if (isFirstHintOfGame) {
            isFirstHintOfGame = false;
            triggerGameMsg({ label: 'Erster Tipp gratis!' }, 0);
        } else {
            const penaltyPoints = getScoreValue(PointType.PENALTY, PENALTY.HINT_PENALTY);
            updateScore(penaltyPoints);
            triggerGameMsg(PENALTY.HINT_PENALTY, penaltyPoints);
            logExtraPoints(`HINT_PENALTY: ${penaltyPoints}`);
        }
    }

    // 6. Auto-Hint weiterplanen
    if (isAuto && !kts.cfg.devHintSpeed) scheduleNextHint();
}

/* =====================================================
   PAUSE / RESUME
===================================================== */

/**
 * Stoppt Timer und UI-Animation des Hint-Systems.
 */
function pauseHintSystem() {
    const wasActive = !!hintTimerId;
    clearTimeout(hintTimerId);
    hintTimerId = null;
    hintUI.resetCooldown();
    hintUI.clearHighlights();
    if (IS_DEV_MODE && wasActive) console.log('⏸️ Hint System pausiert');
}

/**
 * Setzt den Hint-Timer fort wenn Bedingungen erfüllt sind.
 */
function resumeHintSystem() {
    if (!shouldAutoHintRun()) return;
    scheduleNextHint();
    if (IS_DEV_MODE) console.log('▶️ Hint System fortgesetzt');
}

/* =====================================================
   HILFS-FUNKTIONEN
===================================================== */

/**
 * Entfernt alle Hint-Highlight-Klassen vom Spielfeld.
 */
function clearHints() {
    const classes = ['hint-highlight', 'hint-source-highlight', 'hint-target-highlight'];
    document.querySelectorAll('.card, .column, .foundation, .slot')
        .forEach(el => el.classList.remove(...classes));

    if (window.hintTimeout) clearTimeout(window.hintTimeout);
}

// Dev-Hover: Karteninfo in der Konsole (nur in DEV_MODE)
document.addEventListener('mouseenter', e => {
    if (!IS_DEV_MODE) return;
    const card = e.target.closest('.card');
    if (!card) return;
    // console.log(`${card.dataset.value}${card.dataset.symbol} | Index: ${Array.from(card.parentElement.children).indexOf(card)}`);
}, true);
