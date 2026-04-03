let isRecordingActive = false;
let activeRecording = [];

// 1. AUFZEICHNEN (nicht im Demo-Mode, nur wenn DEV Modus aktiv)
function recordStep(actionType, card = null, source = null, target = null) {
    if (!isRecordingActive) return;
    if (!IS_DEV_MODE || gameState.is(GameStates.DEMO)) return;

    const step = {
        a: actionType,
        t: Date.now()
    };

    if (card && card.dataset) {
        step.c = card.dataset.cardId;
    }

    if (source) {
        step.f = source.id || source.dataset?.colIndex || "unbekannt";
    }

    if (target) {
        step.to = target.id || target.dataset?.colIndex || "unbekannt";
    }

    activeRecording.push(step);

    // --- DEBUG AUSGABE ---
    console.groupCollapsed(`🎯 recordStep: ${actionType}`);
    console.log("Action Type:", actionType);
    console.log("Timestamp:", step.t);

    if (step.c) console.log("Card ID:", step.c);
    if (step.f) console.log("From:", step.f);
    if (step.to) console.log("To:", step.to);

    console.log("Full Step Object:", step);
    console.log("Active Recording Length:", activeRecording.length);
    console.groupEnd();
}

// 2. SPEICHERN
function finalizeSolution() {
    const deckKey = kts.game.currentDeckKey;

    if (!deckKey || activeRecording.length === 0) {
        console.warn("Abbruch: Kein Deck-Key oder keine Züge aufgezeichnet.");
        return;
    }

    // Wir arbeiten direkt auf dem globalen kts-Objekt
    if (kts.stats.decks[deckKey]) {
        const deck = kts.stats.decks[deckKey];

        // Speichern, wenn effizienter oder neu
        if (!deck.solution || activeRecording.length <= deck.solution.length) {
            deck.solution = [...activeRecording];

            // Im localStorage sichern
            saveToDisk();
            console.log(`%c 🏆 Lösung für "${kts.game.currentDeckName}" gesichert!`, "color: #4caf50; font-weight: bold;");
        }
    } else {
        console.error("Deck-Key nicht in Stats gefunden. Key:", deckKey);
    }
}

// 3. EXPORTIEREN
function exportCurrentSolution() {
    const deckId = kts.game.currentDeckName;

    if (!activeRecording.length) return console.error("Nichts zum Exportieren da!");

    const data = {
        deckId: deckId,
        date: new Date().toISOString(),
        steps: activeRecording
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Dateiname nutzt das Label, falls vorhanden, sonst die ID gekürzt
    const label = kts.game.currentDeckLabel || "deck";
    a.download = `solution_${label.replace(/\s+/g, '_')}.json`;

    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

function stopDemo() {
    if (gameState.is(GameStates.DEMO)) {
        gameState.set(gameState.getPrevious() || GameStates.GESTARTET);
        console.log("%c🛑 Demo wurde vom Benutzer abgebrochen.", "color: red; font-weight: bold;");
        showGameMsg("DEMO GESTOPPT"); // Falls du diese Funktion für UI-Messages hast
    }
}

async function playDemo() {
    // 1. Demo-Status aktivieren
    gameState.set(GameStates.DEMO);

    const deckKey = kts.game.currentDeckKey;
    const deckData = kts.stats.decks[deckKey];

    if (!deckData || !deckData.solution) {
        return console.error("Keine Lösung für dieses Deck vorhanden.");
    }

    console.log(`%c🎬 Demo startet für: ${deckData.label}`, "color: #ff9800;");
    //document.getElementById('btn-stop-demo').style.display = 'block';

    for (const [index, step] of deckData.solution.entries()) {

        // 2. ABBRUCH-CHECK: Wenn isDemoRunning false ist, Schleife verlassen
        if (!gameState.is(GameStates.DEMO)) break;

        await new Promise(resolve => setTimeout(resolve, 750));

        // Nochmaliger Check nach dem Timeout (falls während des Wartens geklickt wurde)
        if (!gameState.is(GameStates.DEMO)) break;

        switch (step.a) {
            case 'S': revealNextStockCard(); break;
            case 'R': resetStockFromWaste(); break;
            case 'F':
                const fCard = document.querySelector(`[data-card-id="${step.c}"]`);
                if (fCard) flipCard(fCard);
                break;
            case 'M':
                const mCard = document.querySelector(`[data-card-id="${step.c}"]`);
                const target = document.getElementById(step.to) || document.querySelector(`[data-col-index="${step.to}"]`);
                if (mCard && target) {
                    if (target.classList.contains('foundation')) {
                        executeMoveToFoundation(mCard, target);
                    } else {
                        const stack = getCardStack(mCard);
                        executeMoveToTableau(stack, target);
                    }
                }
                break;
        }
    }

    // 3. Status zurücksetzen
    gameState.set(gameState.getPrevious() || GameStates.GESTARTET);
    console.log("🎬 Demo-Prozess beendet.");
    //document.getElementById('btn-stop-demo').style.display = 'none';
}