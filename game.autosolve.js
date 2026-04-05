/* =====================================================
   AUTO SOLVE
   Verantwortlich für: automatisches Einsammeln aller
   verbleibenden Karten wenn das Spiel gewonnen ist.
   Abhängigkeiten: game.state.js, scoring.system.js,
                   game.running.js
===================================================== */

let wasAutoSolved = false;

/* =====================================================
   AUDIO
===================================================== */

const _magicCollectSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3');
_magicCollectSound.volume = 0.15;

function _playMagicCollectSound() {
    if (kts.cfg.audio.mute) return;
    _magicCollectSound.currentTime = 0;
    _magicCollectSound.play().catch(e => console.warn('[AutoSolve] Audio-Play Fehler:', e));
}

/* =====================================================
   VERFÜGBARKEIT
===================================================== */

/**
 * Prüft ob alle Karten offen und Stock/Waste leer sind.
 * Nur dann ist Auto-Solve sinnvoll möglich.
 * @returns {boolean}
 */
function isAutoSolvePossible() {
    return (
        document.querySelector('.column .card.back') === null &&
        stock.length === 0 &&
        document.getElementById('waste-pile').children.length === 0
    );
}

/* =====================================================
   UI
===================================================== */

/**
 * Zeigt oder versteckt den Auto-Solve-Button je nach Spielzustand.
 * Triggert nur wenn sich der Zustand ändert (verhindert Animations-Reset).
 */
function updateAutoSolveUI() {
    const btn = document.getElementById('auto-finish-btn');
    if (!btn) return;

    const isAvailable = isAutoSolvePossible();

    if (isAvailable && btn.classList.contains('hidden')) {
        btn.classList.remove('hidden');
        triggerGameMsg('Sieg in Sicht! Auto-Sammeln verfügbar.');
    } else if (!isAvailable && !btn.classList.contains('hidden')) {
        btn.classList.add('hidden');
    }
}

/**
 * Setzt den Auto-Solve-Button vollständig zurück.
 * Wird von game.reset.js aufgerufen.
 */
function removeAutoSolveButton() {
    const btn = document.getElementById('auto-finish-btn');
    if (!btn) return;
    btn.classList.add('hidden');
    btn.classList.remove('processing');
    btn.style.pointerEvents = 'auto';
    btn.style.transform = '';
}

/* =====================================================
   KLICK-HANDLER
===================================================== */

/**
 * Wird durch den Auto-Finish-Button ausgelöst.
 * Verhindert Mehrfachklicks via 'processing'-Klasse.
 */
async function handleAutoSolveClick() {
    const btn = document.getElementById('auto-finish-btn');
    if (!btn || btn.classList.contains('processing')) return;

    btn.classList.add('processing');
    btn.style.pointerEvents = 'none';
    btn.style.transform = 'scale(0.9)';

    _playMagicCollectSound();

    setTimeout(() => startAutoSolve(), 150);
}

/* =====================================================
   AUTO-SOLVE LOOP
===================================================== */

/**
 * Sammelt alle verbleibenden Karten automatisch ein.
 * Läuft als async do-while-Loop mit 80ms Delay pro Karte.
 */
async function startAutoSolve() {
    const btn = document.getElementById('auto-finish-btn');
    if (btn) btn.classList.add('hidden');

    // Zeit einfrieren
    finalDuration = getElapsedSeconds();
    clearInterval(gameTimerId);

    triggerGameMsg('Auto-Finish...');

    let movedInLoop;
    do {
        movedInLoop = false;

        const cards = Array.from(document.querySelectorAll(
            '.column .card:last-child, #waste-pile .card:last-child'
        ));

        for (const card of cards) {
            const target = document.getElementById(`f-${card.dataset.suit}`);
            const sourceParent = card.parentElement;

            if (validateMove(card, target)) {
                onPlayerMove();
                target.appendChild(card);
                _executeTurboMove(card, sourceParent, target);

                await new Promise(r => setTimeout(r, 80));
                movedInLoop = true;
                break;
            }
        }
    } while (movedInLoop);

    // Cleanup
    if (btn) {
        btn.classList.remove('processing');
        btn.style.pointerEvents = 'auto';
        btn.style.transform = '';
    }

    // Fail-Safe: Wenn nicht alle 52 Karten in der Foundation gelandet sind
    if (document.querySelectorAll('.foundation .card').length < 52) {
        triggerGameMsg('Blockiert! Manuelle Hilfe nötig.');
        gameState.set(GameStates.RUNNING);
        _startGameTimer?.();
    } else {
        wasAutoSolved = true;
    }
}

/* =====================================================
   TURBO MOVE (schnelle Foundation-Animation)
===================================================== */

/**
 * Setzt eine Karte mit schneller Animation in die Foundation
 * und vergibt Punkte. Prüft ob das Spiel gewonnen ist.
 * @param {HTMLElement} card
 * @param {HTMLElement} sourceParent
 * @param {HTMLElement} target
 */
function _executeTurboMove(card, sourceParent, target) {
    card.style.transition = 'transform 0.1s ease-in';
    card.classList.add('moving');

    const isFromTableau = sourceParent.classList.contains('column');
    const pointKey = isFromTableau
        ? ACTION.TABLEAU_TO_FOUNDATION
        : ACTION.WASTE_TO_FOUNDATION;

    const points = getScoreValue(PointType.ACTION, pointKey);
    updateScore(points);

    card.style.transform = 'scale(1.1)';

    setTimeout(() => {
        card.classList.remove('moving');
        card.style.transform = 'none';
        card.style.top = '0px';
        card.style.left = '0px';

        if (document.querySelectorAll('.foundation .card').length === 52) {
            executeWinSequence?.();
        }
    }, 100);
}
