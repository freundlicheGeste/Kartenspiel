const valMap = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

/* =====================================================
   GAME STATE
===================================================== */

let isAnimating = false;
let victoryTriggered = false;
let ignoreStalemate = false;
let shuffleCount = 0; // Zähler für die Rettungsversuche pro Spiel (Reset bei NewGame!)


/* =====================================================
   DECK / HISTORY
===================================================== */

let stock = [];
let currentInitialDeck = []; // Start-Mischung der aktuellen Runde
let currentDeckObjects = []; // Speichert die Objekte für den "Nochmal"-Neustart

let cardDistance = 22; // Abstand der Karten im Tableau-Column zueinander (vertikal)


/* =====================================================
   SCORE / MOVES / TIME
===================================================== */

let score = 0;
let moves = 0;
let finalDuration = 0;


/* =====================================================
   XP
===================================================== */

let sessionXP = 0; // Speichert die XP live für die Anzeige, addiert die tatsächlichen XP aber erst nachdem die Runde abgeschlossen wurde.

/* =====================================================
   LOCAL STORAGE
===================================================== */

let lastSavedCardDesign = "";


/**
 * Initialisiert den Speicher beim App-Start. 
 * Lädt vorhandene Daten aus dem LocalStorage oder setzt die App 
 * auf das `kts_template` zurück, falls keine Daten vorhanden oder korrupt sind.
 * @returns {void}
 */
function initStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    // Basis ist immer ein frischer Klon des Templates
    kts = JSON.parse(JSON.stringify(kts_template));

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);

            // Sicheres Zusammenführen (Deep Merge) der gespeicherten Daten mit dem Template
            if (parsed.sys) Object.assign(kts.sys, parsed.sys);
            if (parsed.cfg) Object.assign(kts.cfg, parsed.cfg);

            lastSavedCardDesign = kts.cfg.designBack + kts.cfg.designFront;

            // Spieler-Daten (Name, Level, XP) übernehmen
            if (parsed.game) {
                // 1. Zuerst die tiefen Objekte sicher mergen (Deep Merge)
                if (parsed.game.player) {
                    Object.assign(kts.game.player, parsed.game.player);
                }

                // 2. Dann die flachen Werte der obersten Ebene (winStreak, activeGameInProgress)
                // Wir nutzen Destructuring, um die Unterobjekte nicht wieder mit den alten Referenzen zu überschreiben
                const { player, points, ...flatGameStats } = parsed.game;
                Object.assign(kts.game, flatGameStats);
            }

            if (parsed.stats) {
                // 1. Alle Top-Level Werte von stats kopieren (totalGames, totalWins, etc.)
                // Wir filtern 'decks' heraus, um es später separat/sauber zu behandeln
                Object.keys(parsed.stats).forEach(key => {
                    if (key !== 'decks') {
                        kts.stats[key] = parsed.stats[key];
                    }
                });

                // 2. Die Decks separat übernehmen (wie du es schon hattest)
                if (parsed.stats.decks) {
                    kts.stats.decks = parsed.stats.decks;
                }
            }

            kts.cfg.isInitialStart = false; // War nicht der erste Start
            console.log("✅ App-Daten aus dem Speicher geladen. Version: " + kts.sys.version);

        } catch (e) {
            console.error("App-Daten korrupt. Starte mit leerem Template.");
        }
    } else {
        console.log("Erster App Start: Initialisiere Speicher.");
    }
    // Lokalen Speicher auf neue Werte überprüfen...
    migrateStorage();

    // Wenn neue 100% durchspielbare Decks verfügbar sind, diese dem loaklen Speicher hinzufügen
    initializeHardcodedDecks();

    checkReloadPenalty();

    // Aktualisiere die Status-Bar
    updateLevelUI();

    // Aktualisiere die Info Bars
    applyBarSettings();

    // Zeige die Tastenkombinationen in der Konsole an
    logShortcuts();

    // ✅ Refactored
    resetGame();

    document.body.classList.add('lock-scroll');
}

// Lokalen Speicher direkt beim Laden der Datei initialisieren
initStorage();

function checkReloadPenalty() {
    // Falls beim Laden der Seite das Flag noch auf true steht, 
    // wurde der Tab geschlossen/neu geladen, während ein Spiel lief.
    if (kts.game.activeGameInProgress) {
        //console.warn("⚠️ Spiel-Unterbrechung (Reload/Tab-Close) erkannt.");

        // Strafe: Streak zurücksetzen
        if (kts.game.winStreak > 0) {
            console.log("%c Win-Streak durch Abbruch verloren!", "color: #ff4d4d; font-weight: bold;");
            kts.game.winStreak = 0;
        }

        // Flag zurücksetzen, damit der Zustand für das nächste Mal sauber ist
        kts.game.activeGameInProgress = false;

        // Sofort speichern, damit der "bestrafte" Zustand fixiert ist
        saveToDisk();
    }
}

const COIN_SVG_CODE = `
    <svg viewBox="0 0 500 500">
        <circle cx="250" cy="250" r="230" fill="#d4af37" stroke="#9a7b1a" stroke-width="20"/>
        <circle cx="250" cy="250" r="180" fill="#f1c40f"/>
        <path d="M250 120 L310 210 L410 210 L330 290 L360 390 L250 330 L140 390 L170 290 L90 210 L190 210 Z" fill="#d4af37"/>
    </svg>`;

function updateScoreOLD(points) {
    if (points === 0) return;

    score += points;
    if (score < 0) score = 0;

    // IDs der beiden Displays
    const displays = ['score-display', 'coin-display'];
    const colorClass = points > 0 ? 'score-gain' : 'score-loss';

    displays.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = score;
            // Farb-Effekt triggern
            el.classList.add(colorClass);
            setTimeout(() => el.classList.remove(colorClass), 600);
        }
    });

    // Partikel-Effekt starten
    spawnCoinParticles(points > 0);

    if (typeof updateLevelUI === "function") updateLevelUI(points);
}

/**
 * Aktualisiert Punktestand und Anzeige.
 * Wenn ohne Punkte aufgerufen wird nur die UI aktualisiert
 * @param {*} points 
 */
function updateScore(points) {
    // 1. Berechnung (nur wenn points nicht 0)
    if (points !== 0) {
        score += points;
        if (score < 0) score = 0;

        // Partikel & Level-Up nur bei echten Punkteänderungen
        spawnCoinParticles(points > 0);
        if (typeof updateLevelUI === "function") updateLevelUI(points);
    }

    // 2. Anzeige (IMMER, auch bei points === 0)
    const displays = ['score-display', 'coin-display'];
    displays.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = score;

            // Visueller Effekt NUR bei echten Änderungen
            if (points !== 0) {
                const colorClass = points > 0 ? 'score-gain' : 'score-loss';
                el.classList.add(colorClass);
                setTimeout(() => el.classList.remove(colorClass), 600);
            }
        }
    });
}

function spawnCoinParticles(isGain) {
    // 1. Wir holen uns das Element der Hauptmünze (die im Container links steht)
    const mainCoin = document.querySelector('.main-coin-svg');
    if (!mainCoin) return;

    // 2. Wir fragen die exakte Position der Hauptmünze auf dem Bildschirm ab
    const rect = mainCoin.getBoundingClientRect();

    const numParticles = 6;
    const pSize = 22; // Die Breite/Höhe des Partikel-Divs aus deinem CSS

    for (let i = 0; i < numParticles; i++) {
        const p = document.createElement('div');
        p.className = 'coin-particle';

        // Dein SVG-Code ohne Ränder
        p.innerHTML = `
            <svg viewBox="0 0 500 500" style="width:100%; height:100%; overflow:visible; shape-rendering:geometricPrecision;">
                <circle cx="250" cy="250" r="245" fill="#d4af37" stroke="none" />
                <circle cx="250" cy="250" r="190" fill="#f1c40f" stroke="none" />
                <path d="M250 120 L310 210 L410 210 L330 290 L360 390 L250 330 L140 390 L170 290 L90 210 L190 210 Z" 
                      fill="#d4af37" stroke="none" />
            </svg>`;

        /* DIE BERECHNUNG:
           rect.left + rect.width / 2  => Horizontale Mitte der Hauptmünze
           rect.top + rect.height / 2   => Vertikale Mitte der Hauptmünze
           Dann ziehen wir jeweils pSize / 2 ab, damit das ZENTRUM des Partikels 
           auf dem ZENTRUM der Münze liegt.
        */
        const startX = (rect.left + rect.width / 2) - (pSize / 2);
        const startY = (rect.top + rect.height / 2) - (pSize / 2);

        p.style.left = startX + 'px';
        p.style.top = startY + 'px';

        // Zufällige Flugbahn-Werte
        const xDiff = (Math.random() - 0.5) * 110;
        const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);

        p.style.setProperty('--x-diff', `${xDiff}px`);
        p.style.setProperty('--rot', `${rotation}deg`);

        const animName = isGain ? 'coin-fly-up' : 'coin-fly-down';
        p.style.animation = `${animName} 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.05}s forwards`;

        document.body.appendChild(p);

        // Cleanup
        setTimeout(() => p.remove(), 1000);
    }
}

/**
 * Animiert ein Element von seinem aktuellen Wert zu einem Zielwert
 * @param {string} id - Die ID des Elements
 * @param {number} start - Startwert
 * @param {number} end - Zielwert
 * @param {number} duration - Dauer in ms
 */
function animateValue(id, newValue) {
    const displayEl = document.getElementById(id);
    if (!displayEl || displayEl.innerText == newValue) return;

    const wrapper = displayEl.parentElement;
    const oldText = displayEl.innerText;

    // 1. Das alte Element als "Exit" markieren
    displayEl.classList.remove('roll-up');
    displayEl.classList.add('old-value-exit');

    // Nach der Animation das alte Element löschen
    const oldNode = displayEl;
    setTimeout(() => oldNode.remove(), 400);

    // 2. Ein neues Element für die neue Zahl erstellen
    const newNode = document.createElement('span');
    newNode.id = id;
    newNode.className = 'streak-value roll-up';
    newNode.innerText = newValue;

    wrapper.appendChild(newNode);
}

function applyDesign() {
    const backDesign = kts.cfg.designBack;
    const frontDesign = kts.cfg.designFront

    // Alle Karten auf dem Feld sofort aktualisieren
    document.querySelectorAll('.card').forEach(card => {
        // Rückseite nur ändern wenn Karte verdeckt
        if (card.classList.contains('back')) {
            card.className = `card ${card.dataset.color} back ${backDesign}`;
        } else {
            card.className = `card ${card.dataset.color} ${frontDesign}`;
        }
    });

    // Stock-Pile Rückseite synchronisieren
    const stockPile = document.getElementById('stock-pile');
    if (stockPile) {
        stockPile.className = `slot ${backDesign}`;
        if (stock.length === 0) stockPile.classList.add('empty');
    }

    // Nur speichern, wenn sich die Werte geändert haben
    const currentSettings = backDesign + frontDesign;

    if (currentSettings !== lastSavedCardDesign) {
        kts.cfg.designBack = backDesign;
        kts.cfg.designFront = frontDesign;
        saveToDisk();
        lastSavedCardDesign = currentSettings;

        if (IS_DEV_MODE) {
            console.log("Einstellungen automatisch gespeichert.");
        }
    }
}

/**
 * Haupt-Logikschleife für Automatismen
 */
function runAutoLogic() {
    // Zentraler Guard-Clause: Wenn nicht RUNNING, sofort raus.
    if (!gameState.is(GameStates.RUNNING) || isUndoPausingAuto) return;

    // 1. Falls Spiel ohne Auto-Solve gelöst, WinSequence triggern
    if (document.querySelectorAll('.foundation .card').length === 52) {
        if (!wasAutoSolved) {
            // Wenn Auto-Solve Button nicht genutzt wurde, entfernen
            removeAutoSolveButton();
        }
        executeWinSequence();
        return;
    }

    // 2. Button-Sichtbarkeit prüfen (SSOT)
    updateAutoSolveUI();

    // 3. Automatismen (Flip & Foundation)
    let actionTaken = false;

    if (kts.cfg.autoFlip) {
        document.querySelectorAll('.column').forEach(col => {
            const last = col.lastElementChild;
            if (last && last.classList.contains('back')) {
                onPlayerMove(); // 1. State sichern & Zug zählen
                flipCard(last); // 2. Karte umdrehen (triggert processCombo)
                actionTaken = true;

                setTimeout(runAutoLogic, 100);
            }
        });
    }

    if (kts.cfg.autoFoundation && !actionTaken) {
        // Geänderter Selektor: Schließt Karten mit der Klasse .back aus
        const playableCards = Array.from(document.querySelectorAll('.column .card:last-child:not(.back), #waste-pile .card:last-child:not(.back)'));

        for (let card of playableCards) {
            if (card.dataset.tempIgnoreAuto === "true") continue;
            const target = document.getElementById(`f-${card.dataset.suit}`);

            if (validateMove(card, target)) {
                const sourceParent = card.parentElement;
                onPlayerMove(card, sourceParent); // 1. State sichern & Zug zählen
                executeMoveToFoundation(card, target, sourceParent); // 2. Verschieben (triggert applyMoveScore & processCombo)
                actionTaken = true;
                break;
            }
        }
    }

    // Nächster Schritt oder Stillstand-Prüfung
    if (actionTaken) {
        if (!isAnimating) setTimeout(runAutoLogic, 500);
    } else {
        // Stillstand-Prüfung
        if (!canMakeAnyMove() && !ignoreStalemate) {
            // Im Timeout müssen wir erneut prüfen, falls sich der State geändert hat!
            setTimeout(() => {
                if (gameState.is(GameStates.RUNNING) && !canMakeAnyMove()) {
                    pauseGame();
                    triggerStalemateDialog();
                }
            }, 1000);
        }
    }
}

function executeWinSequenceNAN_FEHLER() {
    // Bricht ab, wenn der Sieg schon ausgelöst wurde
    if (victoryTriggered) return;
    victoryTriggered = true;

    // scoringSystem.js Zusammenfassung der Combos + Combo Punkte
    showWinScreen();

    // Falls der Timer noch läuft (manuelles Spiel), stoppen
    if (gameTimerId) {
        clearInterval(gameTimerId);
        gameTimerId = null;
    }

    // Wenn finalDuration noch nicht durch AutoSolve gesetzt wurde (manuelles Ende)
    if (finalDuration === 0) {
        finalDuration = getElapsedSeconds();
    }

    // v0.9.9 FIX - LOG:
    console.log(`%c 🕒 ZEIT-CHECK: Bonus-Berechnung mit ${finalDuration} Sekunden (${formatTime(finalDuration)}). Pausen wurden abgezogen.`, "color: #00ff00; font-weight: bold;");

    gameState.set(GameStates.BEENDET);
    // XP-System mit Basis-Punkten füttern (UI Werte übernehmen und speichern)
    commitSessionXP();

    // --- SSOT BONI BERECHNUNG ---
    const speedBonus = VictoryCalculator.getSpeedBonus(finalDuration);

    const puristBonus = VictoryCalculator.getPuristBonus({
        autoFoundation: kts.cfg.autoFoundation,
        autoFlip: kts.cfg.autoFlip,
        autoHint: kts.cfg.autoHint
    });

    const timeBonus = VictoryCalculator.getTimeBonus(finalDuration);

    // Kombi Bonus:
    const flipBonus = sessionStats.flipComboPoints;
    const foundationBonus = sessionStats.foundationComboPoints;

    // WICHTIG: Da das Spiel gerade gewonnen wurde, ist der REALE Streak für 
    // diese Abrechnung kts.game.winStreak + 1
    const currentWinStreak = kts.game.winStreak + 1;

    // Streak Bonus berechnen:
    // Sieg 1: 0 Punkte
    // Sieg 2: (2-1) * 50 = 50 Punkte
    // Sieg 3: (3-1) * 50 = 100 Punkte
    const streakBonus = currentWinStreak > 1 ? (currentWinStreak - 1) * 50 : 0;

    // Basis-Punkte
    const baseScore = score;
    // Bonus-Punkte
    const bonusTotal = speedBonus + puristBonus + timeBonus + flipBonus + foundationBonus + streakBonus;

    // Gesamt-Punkte
    score += bonusTotal;

    // --- Statistik & Highscore Handling ---
    // Bisherige Stats auslesen (bevor registerGameEnd sie überschreibt)
    const lastStats = JSON.parse(JSON.stringify(getDeckStats(currentDeckObjects) || { bestScore: 0, lastPlayed: null }));
    // Ruft die Statistik-Funktion aus deckManager.js auf und speichert die neuen Stats.
    registerGameEnd(currentDeckObjects, score, moves, finalDuration, wasAutoSolved);
    // Prüfen, ob es ein neuer Rekord erreicht wurde
    const isNewRecord = score > lastStats.bestScore;

    if (IS_DEV_MODE) {
        console.log(`Score ${baseScore} + Speed ${speedBonus} + Purist ${puristBonus} + Zeit ${timeBonus} = ${score}`);
    }

    // UI & Animation (Gewinn-Animation starten)
    isAnimating = true;
    startVictoryCascade();

    if (!kts.cfg.audio.mute && typeof playVictorySound === 'function') {
        playVictorySound();
    }

    // Resultat für das Win-Panel
    const gameResult = {
        baseScore,
        score,
        moves,
        time: finalDuration,
        winStreak: currentWinStreak,
        timeBonus,
        speedBonus,
        puristBonus,
        lastPlayed: lastStats.lastPlayed,
        bestScore: Math.max(lastStats.bestScore, score),
        isNewRecord: isNewRecord,
        // Combo-Stats aus sessionStats mitschicken!
        flipComboCount: sessionStats.flipComboCount,
        foundationComboCount: sessionStats.foundationComboCount,
        flipBonus: sessionStats.flipComboPoints,
        foundationBonus: sessionStats.foundationComboPoints,
        streakBonus: streakBonus,
        wasAutoSolved: wasAutoSolved
    };

    setTimeout(() => {
        openPanel('win', gameResult);
    }, 2000);
}

function validateMove(card, target) {
    if (!card || !target) return false;

    // Daten-Extraktion (Dataset für DOM, Properties für Plain Objects)
    const cardVal = card.dataset ? card.dataset.value : card.value;
    const cardSuit = card.dataset ? card.dataset.suit : card.suit;
    const cardColor = card.dataset ? card.dataset.color : card.color;
    const v = valMap[cardVal];

    // Foundation-Logik (Oben rechts)
    if (target.classList.contains('foundation')) {
        // Stapel dürfen nicht auf die Foundation (nur Einzelkarten)
        const isStack = card.nextElementSibling !== null;
        if (isStack) return false;

        const targetSuit = target.dataset.suit;
        const lastCard = target.lastElementChild;

        if (!lastCard) {
            return cardVal === 'A' && cardSuit === targetSuit;
        }
        const lastVal = valMap[lastCard.dataset.value];
        return cardSuit === targetSuit && v === lastVal + 1;
    }

    // Tableau-Logik (Spalten)
    if (target.classList.contains('column')) {
        const lastCard = target.lastElementChild;

        if (!lastCard) {
            return cardVal === 'K'; // Nur Könige auf leere Felder
        }

        // Nicht auf verdeckte Karten legen & Alternierende Farben + Absteigend
        return !lastCard.classList.contains('back') &&
            cardColor !== lastCard.dataset.color &&
            v === valMap[lastCard.dataset.value] - 1;
    }

    return false;
}

/**
 * Prüft die Synchronität zwischen Logik (Arrays) und UI (DOM)
 */
function checkSync() {
    console.group("🃏 Solitaire Sync-Check");

    const syncData = [
        {
            name: "Stock",
            arrayCount: typeof stock !== 'undefined' ? stock.length : 'N/A',
            domCount: document.getElementById('stock-pile')?.children.length || 0
        },
        {
            name: "Waste",
            arrayCount: typeof waste !== 'undefined' ? waste.length : 'N/A',
            domCount: document.getElementById('waste-pile')?.children.length || 0
        }
    ];

    // Falls du globale Tableau/Foundation-Arrays hast, füge sie hier hinzu
    if (typeof tableau !== 'undefined') {
        tableau.forEach((col, i) => {
            syncData.push({
                name: `Tableau Spalte ${i + 1}`,
                arrayCount: col.length,
                domCount: document.querySelectorAll('.column')[i]?.children.length || 0
            });
        });
    }

    console.table(syncData);

    // Visuelle Warnung bei Diskrepanz
    const errors = syncData.filter(d => d.arrayCount !== 'N/A' && d.arrayCount !== d.domCount);

    if (errors.length > 0) {
        console.error("❌ SYNC-FEHLER GEFUNDEN:", errors);
        triggerGameMsg("SYNC ERROR!", -1); // Falls du deine In-Game Message nutzen willst
    } else {
        console.log("✅ Alles synchron!");
    }

    console.groupEnd();
}

// Optional: Lege die Funktion auf eine Taste (z.B. 'D' für Debug)
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.altKey) {
        checkSync();
        logGameState();
    }
});

/**
 * Hilfsfunktion, um sicherzustellen, dass die UI bereit für den ersten Zug ist
 */
function enableInteraction() {
    const board = document.getElementById('game-board');
    if (board) {
        board.classList.remove('game-paused'); // Entfernt die Sperre aus pauseGame
        board.style.pointerEvents = 'auto';    // Sicherstellen, dass Klicks durchgehen
    }

    // Sicherstellen, dass der Body keine Sperrklassen mehr hat
    //document.body.classList.remove('lock-scroll');
}

function copyToClipboard(data) {
    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(text).then(() => {
        console.log("📋 Deck in die Zwischenablage kopiert!");
    }).catch(err => {
        console.error("❌ Clipboard fehlgeschlagen:", err);
    });
}

/**
 * | Context  | Ursache              |
| -------- | -------------------- |
| SNAPSHOT | DOM war schon kaputt |
| RENDER   | State war kaputt     |
| CREATE   | Übergabe falsch      |

 * @param {*} card 
 * @param {*} context 
 * @returns 
 */
function validateCardData(card, context = 'unknown') {
    if (!card) {
        console.error(`❌ [${context}] Card is NULL`);
        return false;
    }

    const invalid =
        !card.value ||
        !card.suit ||
        card.suit === 'undefined' ||
        !card.color ||
        !card.symbol;

    if (invalid) {
        console.error(`🚨 INVALID CARD DETECTED [${context}]`, {
            card
        });
        //debugger; // 🔥 pausiert exakt beim Fehler
        return false;
    }

    return true;
}

function animateScoreRowsBasic() {
    const rows = document.querySelectorAll('.score-list .row');
    const total = document.querySelector('.score-list .total');

    rows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('show');

            // optional: kleiner Sound pro Zeile
            //playCardTick();

        }, index * 120); // Timing hier anpassen (100–160 ideal)
    });

    // TOTAL kommt am Ende
    if (total) {
        setTimeout(() => {
            total.classList.add('show');
            //playCardFinish();
        }, rows.length * 120 + 100);
    }
}

function animateValue(element, start, end, duration = 300) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = end.toLocaleString();
        }
    }

    requestAnimationFrame(step);
}

function animateScoreRows() {
    const rows = document.querySelectorAll('.score-list .row');
    const total = document.querySelector('.score-list .total');

    let runningTotal = 0;

    rows.forEach((row, index) => {
        const valueEl = row.querySelector('.value');
        const finalValue = parseInt(valueEl.dataset.value);

        setTimeout(() => {
            row.classList.add('show');

            // Count-Up pro Zeile
            //animateValue(valueEl, 0, finalValue, 500);

            // TOTAL vorbereiten
            runningTotal += finalValue;

            //playCardTick();

        }, index * 140);
    });

    // TOTAL zählt am Ende hoch
    if (total) {
        const totalValueEl = total.querySelector('.value');
        const finalTotal = parseInt(totalValueEl.dataset.value);

        setTimeout(() => {
            total.classList.add('show');
            animateValue(totalValueEl, 0, finalTotal, 900);
            //playCardFinish();
        }, rows.length * 140 + 150);
    }
}

function updateStockEmpty() {
    const stockPile = document.getElementById('stock-pile');
    const wastePile = document.getElementById('waste-pile');

    // Stock leer prüfen
    const isStockEmpty = stockPile.children.length === 0;

    // Waste hat Karten prüfen
    const wasteHasCards = wastePile.children.length > 0;

    if (isStockEmpty && wasteHasCards) {
        stockPile.classList.add('empty');          // Symbol anzeigen
        stockPile.style.cursor = 'pointer';        // Hand-Cursor
    } else if (!isStockEmpty) {
        stockPile.style.cursor = 'pointer';        // Hand-Cursor
    } else {
        stockPile.classList.remove('empty');       // Symbol ausblenden
        stockPile.style.cursor = 'default';        // Standard-Cursor
    }
}

/* -------------------- Partikel-Funktion -------------------- */
function createDustParticles(slot, card, count = 25) {
    const cardRect = card.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    // Karte relativ zum Slot
    const offsetX = cardRect.left - slotRect.left;
    const offsetY = cardRect.top - slotRect.top;

    // Kartengröße
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;

    // Symbol + Farbe
    const suitSymbol = card.dataset.suit === 'hearts' ? '♥' :
        card.dataset.suit === 'diamonds' ? '♦' :
            card.dataset.suit === 'spades' ? '♠' : '♣';
    const suitColor = (suitSymbol === '♥' || suitSymbol === '♦') ? 'red' : 'black';

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.textContent = suitSymbol;
        particle.style.color = suitColor;

        // Zufälliger Winkel
        const angle = Math.random() * 2 * Math.PI;

        // Abstand von 2 bis 25px vom Kartenrand
        const radius = 2 + Math.random() * 23;

        // Startposition **außerhalb der Karte**
        const startX = offsetX + cardWidth / 2 + Math.cos(angle) * radius;
        const startY = offsetY + cardHeight / 2 + Math.sin(angle) * radius;

        // Endposition: leicht weiter weg
        const endX = startX + Math.cos(angle) * (5 + Math.random() * 10);
        const endY = startY + Math.sin(angle) * (5 + Math.random() * 10);

        particle.style.setProperty('--start-x', `${startX}px`);
        particle.style.setProperty('--start-y', `${startY}px`);
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--end-y', `${endY}px`);

        // Startposition: setzen auf Slot-Koordinaten
        particle.style.left = `0px`;
        particle.style.top = `0px`;
        particle.style.transform = `translate(${startX}px, ${startY}px)`;

        slot.appendChild(particle);

        particle.addEventListener('animationend', () => particle.remove());
    }
}

function debugFoundationParticles(slot, card, count = 20) {
    // Entferne vorherige Partikel
    slot.querySelectorAll('.debug-particle').forEach(p => p.remove());

    const slotWidth = slot.offsetWidth;
    const slotHeight = slot.offsetHeight;

    const cardRect = card.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    // Karte relativ zum Slot
    const cardLeft = card.offsetLeft + card.offsetWidth / 2;
    const cardTop = card.offsetTop + card.offsetHeight / 2;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.className = 'debug-particle';
        particle.textContent = '♦'; // Debug: Symbol sichtbar

        // Zufälliger Winkel
        const angle = Math.random() * 2 * Math.PI;

        // Radius soll außerhalb der Karte liegen
        const radius = Math.max(card.offsetWidth, card.offsetHeight) / 2 + 5 + Math.random() * 20;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        particle.style.left = `${cardLeft + x}px`;
        particle.style.top = `${cardTop + y}px`;

        particle.style.position = 'absolute';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.fontSize = '20px';
        particle.style.color = 'red';
        particle.style.background = 'rgba(255,255,255,0.1)';
        particle.style.padding = '2px';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000'; // über Karte

        slot.appendChild(particle);
    }
}



function startEffect() {
    const firstSlot = document.querySelector('.foundation'); // oder '#f-hearts' etc.
    const card = firstSlot.querySelector('.card'); // falls schon eine Karte drin ist

    // Debug-Partikel dauerhaft anzeigen
    setInterval(() => {
        debugFoundationParticles(firstSlot, card, 30);

    }, 2000); // alle 2 Sekunden neu zeichnen
}
/*
const tickerMessages = [
    "Willkommen im System",
    "Updates werden im Hintergrund geladen",
    "Sicherheitsprotokolle aktiv",
    "Verbindung stabil: 124ms Latenz"
];

let currentIndex = 0;
const tickerElement = document.getElementById('ticker-text');

function rotateTickerText() {
    // 1. Text ausfaden
    tickerElement.classList.replace('fade-in', 'fade-out');

    // 2. Warten bis Ausfaden fertig (500ms), dann Text ändern
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % tickerMessages.length;
        tickerElement.textContent = tickerMessages[currentIndex];

        // 3. Text wieder einfaden
        tickerElement.classList.replace('fade-out', 'fade-in');
    }, 500);
}

// Alle 4 Sekunden wechseln
setInterval(rotateTickerText, 4000);

// Initialen Text setzen
tickerElement.textContent = tickerMessages[0];
*/

function executeWinSequence() {
    if (victoryTriggered) return;
    victoryTriggered = true;

    if (gameTimerId) {
        clearInterval(gameTimerId);
        gameTimerId = null;
    }

    if (finalDuration === 0) {
        finalDuration = getElapsedSeconds();
    }

    gameState.set(GameStates.BEENDET);
    commitSessionXP();

    // --- DEBUG BERECHNUNG START ---
    console.group("%c🏆 FINALE PUNKTE-BERECHNUNG", "color: #f1c40f; font-weight: bold; font-size: 12px;");

    const speedBonus = VictoryCalculator.getSpeedBonus(finalDuration) || 0;
    const puristBonus = VictoryCalculator.getPuristBonus({
        autoFoundation: kts.cfg.autoFoundation,
        autoFlip: kts.cfg.autoFlip,
        autoHint: kts.cfg.autoHint
    }) || 0;
    const timeBonus = VictoryCalculator.getTimeBonus(finalDuration) || 0;
    const flipBonus = sessionStats.flipComboPoints || 0;
    const foundationBonus = sessionStats.foundationComboPoints || 0;
    const currentWinStreak = (kts.game.winStreak || 0) + 1;
    const streakBonus = currentWinStreak > 1 ? (currentWinStreak - 1) * 50 : 0;
    const baseScore = score || 0;

    // Funktion zum sicheren Prüfen der Werte im Log
    const debugVal = (label, val) => {
        const isInvalid = isNaN(val) || val === undefined;
        console.log(
            `${label.padEnd(20)}: %c${val}`,
            isInvalid ? "color: #ff4757; font-weight: bold;" : "color: #2ed573;"
        );
        return isInvalid ? 0 : val; // Fallback auf 0 für die Berechnung, falls kaputt
    };

    const sBonus = debugVal("Speed Bonus", speedBonus);
    const pBonus = debugVal("Purist Bonus", puristBonus);
    const tBonus = debugVal("Time Bonus", timeBonus);
    const fBonus = debugVal("Flip Combo", flipBonus);
    const foBonus = debugVal("Found. Combo", foundationBonus);
    const strBonus = debugVal("Streak Bonus", streakBonus);
    const bScore = debugVal("Basis Score", baseScore);

    const bonusTotal = sBonus + pBonus + tBonus + fBonus + foBonus + strBonus;
    const finalScore = bScore + bonusTotal;

    console.log("-----------------------------------------");
    console.log(`%cGESAMT-ERGEBNIS: ${finalScore}`, "font-weight: bold; font-size: 14px;");
    console.groupEnd();
    // --- DEBUG BERECHNUNG ENDE ---

    score = finalScore;

    const lastStats = JSON.parse(JSON.stringify(getDeckStats(currentDeckObjects) || { bestScore: 0, lastPlayed: null }));
    registerGameEnd(currentDeckObjects, score, moves, finalDuration, wasAutoSolved);
    const isNewRecord = score > (lastStats.bestScore || 0);

    isAnimating = true;
    startVictoryCascade();

    if (!kts.cfg.audio.mute && typeof playVictorySound === 'function') {
        playVictorySound();
    }

    const gameResult = {
        baseScore: bScore,
        score: finalScore,
        moves,
        time: finalDuration,
        winStreak: currentWinStreak,
        timeBonus: tBonus,
        speedBonus: sBonus,
        puristBonus: pBonus,
        lastPlayed: lastStats.lastPlayed,
        bestScore: Math.max(lastStats.bestScore || 0, finalScore),
        isNewRecord: isNewRecord,
        flipComboCount: sessionStats.flipComboCount,
        foundationComboCount: sessionStats.foundationComboCount,
        flipBonus: fBonus,
        foundationBonus: foBonus,
        streakBonus: strBonus,
        wasAutoSolved: wasAutoSolved
    };

    setTimeout(() => {
        openPanel('win', gameResult);
    }, 2000);
}