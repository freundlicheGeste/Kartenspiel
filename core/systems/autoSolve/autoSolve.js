let wasAutoSolved = false;

// Sound für Auto-Solve (Glitzern/Sammeln)
const magicCollectSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3');
magicCollectSound.volume = 0.15;

/**
 * Spielt den magischen Sammel-Sound ab
 */
function playMagicCollectSound() {
    if (kts.cfg.audio.mute) return;
    magicCollectSound.currentTime = 0;
    magicCollectSound.play().catch(e => console.warn("Audio-Play Fehler:", e));
}

/**
 * Prüft ob das Spiel automatisch gelöst werden kann.
 */
function isAutoSolvePossible() {
    const hasBackCards = document.querySelector('.column .card.back') !== null;
    const isStockEmpty = stock.length === 0;
    const isWasteEmpty = document.getElementById('waste-pile').children.length === 0;

    // Nur wenn keine verdeckten Karten mehr da sind und der Vorrat leer ist
    return !hasBackCards && isStockEmpty && isWasteEmpty;
}

/**
 * UI-Update für den Auto-Solve Button
 */
function updateAutoSolveUI() {
    const btn = document.getElementById('auto-finish-btn');
    if (!btn) return;

    const isAvailable = isAutoSolvePossible();

    // Nur triggern, wenn sich der Zustand ändert (verhindert Animations-Reset)
    if (isAvailable && btn.classList.contains('hidden')) {
        btn.classList.remove('hidden');
        // Optional: Kleiner Info-Toast beim ersten Erscheinen
        triggerGameMsg("Sieg in Sicht! Auto-Sammeln verfügbar.");
    } else if (!isAvailable && !btn.classList.contains('hidden')) {
        btn.classList.add('hidden');
    }
}

function removeAutoSolveButton() {
    const btn = document.getElementById('auto-finish-btn');

    if (btn) {
        btn.classList.add('hidden');
        btn.classList.remove('processing');
        btn.style.pointerEvents = 'auto'; // Klicks wieder erlauben
        btn.style.transform = ""; // Scale-Effekt zurücksetzen
    }
}

/**
 * Event-Listener oder direkt im onclick aufgerufen
 */
async function handleAutoSolveClick() {
    const btn = document.getElementById('auto-finish-btn');
    if (!btn || btn.classList.contains('processing')) return;

    // 1. Visuelles Feedback: Button als "aktiv" markieren
    btn.classList.add('processing');
    btn.style.pointerEvents = 'none'; // Mehrfachklicks verhindern

    // 2. Sound abspielen (falls vorhanden)
    if (!kts.cfg.audio.mute) {
        // Ein glitzernder/positiver Sound
        playMagicCollectSound();
    }

    // 3. Ganz kurze Pause für den Klick-Effekt
    btn.style.transform = "scale(0.9)";

    setTimeout(() => {
        startAutoSolve();
    }, 150);
}

// Wird durch den Auto-Finish Button ausgelöst
async function startAutoSolve() {
    wasAutoSolved = true; // Markieren: Der Spieler hat sammeln lassen
    const btn = document.getElementById('auto-finish-btn');
    if (btn) btn.classList.add('hidden');

    // Zeit einfrieren und Spielzeit löschen
    finalDuration = getElapsedSeconds();
    clearInterval(gameTimerId);

    triggerGameMsg("Auto-Finish...");

    let movedInLoop;
    do {
        movedInLoop = false;
        // Wir suchen immer nur die obersten spielbaren Karten
        const cards = Array.from(document.querySelectorAll('.column .card:last-child, #waste-pile .card:last-child'));

        for (let card of cards) {
            const target = document.getElementById(`f-${card.dataset.suit}`);
            const sourceParent = card.parentElement; // Herkunft merken!

            if (validateMove(card, target)) {
                onPlayerMove();

                // 1. Im DOM verschieben
                target.appendChild(card);
                // 2. Animation & Punkte
                executeTurboMove(card, sourceParent, target);

                await new Promise(r => setTimeout(r, 80)); // 80ms ist ein schöner "Flow"
                movedInLoop = true;
                break;
            }
        }
    } while (movedInLoop);

    // RESET nach Abschluss oder Abbruch
    if (btn) {
        btn.classList.remove('processing');
        btn.style.pointerEvents = 'auto'; // Klicks wieder erlauben
        btn.style.transform = ""; // Scale-Effekt zurücksetzen
    }

    // Fail-Safe
    if (document.querySelectorAll('.foundation .card').length < 52) {
        triggerGameMsg("Blockiert! Manuelle Hilfe nötig.");
        gameState.set(GameStates.RUNNING);
        startGameTimer();
    }
}

function executeTurboMove(card, sourceParent, target) {
    card.style.transition = "transform 0.1s ease-in";
    card.classList.add('moving');

    // PUNKTE-LOGIK (SSOT)
    // Wir bestimmen den Point-Key basierend auf der Herkunft
    const isFromTableau = sourceParent.classList.contains('column');
    const pointKey = isFromTableau ? ACTION.TABLEAU_TO_FOUNDATION : ACTION.WASTE_TO_FOUNDATION;

    const points = getScoreValue(PointType.ACTION, pointKey);
    updateScore(points);

    // Optischer Effekt
    card.style.transform = 'scale(1.1)';

    setTimeout(() => {
        card.classList.remove('moving');
        card.style.transform = 'none';
        card.style.top = "0px";
        card.style.left = "0px";

        if (document.querySelectorAll('.foundation .card').length === 52) {
            executeWinSequence();
        }
    }, 100);
}