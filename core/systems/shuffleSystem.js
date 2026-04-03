/*
Smart Shuffle: Indem wir die niedrigen Karten (Asse, 2en, 3en) gezielt in den Nachziehstapel schieben, stellst du sicher, dass der Spieler die Foundation-Ketten starten kann. Die hohen Karten (Könige) "parken" wir verdeckt im Tableau, da sie dort am wenigsten stören, bis man Platz für sie hat.

Hard Rescue: Das Entfernen der verdeckten Karten aus dem Tableau macht das Spiel mathematisch fast immer lösbar, da keine "Blocker" mehr existieren, an die man nicht herankommt. Die Strafe (XP-Reset) ist hart genug, um es zur letzten Option zu machen.

XP-Logik: Ich habe kts.game.player.xp = 0 genutzt. Je nachdem wie dein Level-System aufgebaut ist, musst du evtl. auch das player.level anpassen, aber "XP auf 0 im aktuellen Level" ist meistens die frustrierendste (und damit fairste) Strafe.
*/

function shuffleRescueOLD() {
    shuffleCount++;

    // 1. Alle verdeckten Karten im Tableau sammeln
    const hiddenCardElements = Array.from(document.querySelectorAll('.column .card.back'));
    let pool = [];

    hiddenCardElements.forEach(el => {
        pool.push({
            value: el.dataset.value,
            color: el.dataset.color,
            suit: el.dataset.suit,
            symbol: el.dataset.symbol
        });
    });

    // Stock-Karten zum Pool hinzufügen
    pool = [...pool, ...stock];

    if (shuffleCount === 1) {
        // --- VARIANTE A: Smart Shuffle ---
        // Wir sortieren Asse und niedrige Zahlen nach "hinten" im Array, 
        // damit sie im Stock oben liegen (da pop() von hinten nimmt)
        pool.sort((a, b) => {
            const valA = valMap[a.value];
            const valB = valMap[b.value];
            return valB - valA; // Niedrige Werte kommen ans Ende
        });

        // Die verdeckten Karten im Tableau bekommen jetzt eher hohe Werte (Könige/Damen)
        const currentBackDesign = document.getElementById('select-back').value;
        hiddenCardElements.forEach(hc => {
            const newCardData = pool.shift(); // Nimm hohe Karte vom Anfang des Arrays
            hc.dataset.value = newCardData.value;
            hc.dataset.color = newCardData.color;
            hc.dataset.suit = newCardData.suit;
            hc.dataset.symbol = newCardData.symbol;
            hc.className = `card ${newCardData.color} back ${currentBackDesign}`;
        });

        stock = pool; // Der Rest (mit den niedrigen Karten oben) wird der neue Stock

        updateScore(kts.game.points.SHUFFLE_RESCUE);
        triggerGameMsg("SMART SHUFFLE", kts.game.points.SHUFFLE_RESCUE);

    } else {
        // --- VARIANTE B: Die Brechstange (Mogeln) ---
        // Alle verdeckten Karten aus dem Tableau komplett entfernen und in den Stock werfen
        hiddenCardElements.forEach(el => el.remove());

        // Den gesamten Pool mischen und als Stock setzen
        pool.sort(() => Math.random() - 0.5);
        stock = pool;

        // Strafe: XP auf Level-Anfang zurücksetzen
        if (kts.game.player) {
            kts.game.player.xp = 0; // Setzt XP im aktuellen Level zurück
            saveToDisk(); // Sofort speichern
            if (typeof updateXPBar === "function") updateXPBar(); // UI aktualisieren
        }

        updateScore(-500); // Zusätzliche Punktstrafe
        triggerGameMsg("NOTFALL-REDUKTION: XP RESET", -500);
    }

    // UI Aufräumen
    const waste = document.getElementById('waste-pile');
    if (waste) waste.innerHTML = '';
    document.getElementById('stock-pile').classList.remove('empty');

    onPlayerMove();
    runAutoLogic();
    ignoreStalemate = false; // Nach einem Shuffle wieder prüfen dürfen
}

function debugShuffleTest() {
    console.group("🛠 DEBUG: Shuffle-Rescue Test");

    const hiddenCardElements = Array.from(document.querySelectorAll('.column .card.back'));
    let pool = [];

    // 1. Daten sichern, bevor wir die Elemente löschen!
    hiddenCardElements.forEach(el => {
        pool.push({
            value: el.dataset.value,
            color: el.dataset.color,
            suit: el.dataset.suit,
            symbol: el.dataset.symbol
        });
        el.remove(); // Jetzt kann das Element weg
    });

    // 2. Den alten Stock zum Pool hinzufügen
    pool = [...pool, ...stock];

    console.log(`Karten im Pool gesammelt: ${pool.length}`);

    // 3. Mischen und dem Stock zuweisen
    pool.sort(() => Math.random() - 0.5);
    stock = pool;

    // 4. UI Reset
    const waste = document.getElementById('waste-pile');
    if (waste) waste.innerHTML = '';

    const stockEl = document.getElementById('stock-pile');
    if (stockEl) {
        stockEl.classList.remove('empty');
        // Falls dein CSS 'empty' über :empty regelt, muss evtl. ein Platzhalter rein
    }

    triggerGameMsg("DEBUG: HARD RESET", -500);

    console.groupEnd();

    onPlayerMove();
    runAutoLogic();
    ignoreStalemate = false;
}

function shuffleRescue() {
    shuffleCount++;
    const waste = document.getElementById('waste-pile');
    const columns = document.querySelectorAll('.column');
    const currentBackDesign = document.getElementById('select-back')?.value || 'default';
    let pool = [];

    if (shuffleCount === 1) {
        // --- VARIANTE A: SMART SHUFFLE ---
        // 1. Daten sammeln
        const allHidden = Array.from(document.querySelectorAll('.column .card.back'));
        allHidden.forEach(el => {
            pool.push({ value: el.dataset.value, color: el.dataset.color, name: el.dataset.suit, symbol: el.dataset.symbol });
        });
        pool = [...pool, ...stock];

        // 2. Sortieren: Hohe Werte nach vorne (für Tableau), niedrige nach hinten (für Stock)
        pool.sort((a, b) => valMap[b.value] - valMap[a.value]);

        // 3. Spalten bereinigen und neu befüllen
        columns.forEach(col => {
            const hiddenInCol = Array.from(col.querySelectorAll('.card.back'));
            const visibleInCol = Array.from(col.querySelectorAll('.card:not(.back)'));

            // Verdeckte Karten mit neuen (hohen) Werten überschreiben
            hiddenInCol.forEach(hc => {
                const newData = pool.shift(); // Nimm hohe Karte
                hc.dataset.value = newData.value;
                hc.dataset.color = newData.color;
                hc.dataset.suit = newData.suit;
                hc.dataset.symbol = newData.symbol;
                hc.className = `card ${newData.color} back ${currentBackDesign}`;
            });

            // Offene Tableau-Karten nachrücken
            const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
            visible.forEach((card, index) => {
                card.style.top = (index * cardDistance) + "px";
                col.appendChild(card);
            });
        });

        stock = pool; // Rest (niedrige Karten) in den Stock
        updateScore(kts.game.points.SHUFFLE_RESCUE || -100);
        triggerGameMsg("SMART SHUFFLE", kts.game.points.SHUFFLE_RESCUE || -100);

    } else {
        // --- VARIANTE B: HARD RESCUE (Brechstange) ---
        columns.forEach(col => {
            const hiddenInCol = Array.from(col.querySelectorAll('.card.back'));
            hiddenInCol.forEach(el => {
                pool.push({ value: el.dataset.value, color: el.dataset.color, name: el.dataset.suit, symbol: el.dataset.symbol });
                el.remove();
            });
            // Offene Tableau-Karten nachrücken (mit Animation)
            // Für jede Spalte beim Nachrücken:
            const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
            visible.forEach((card, index) => {
                // 1. Transition für das Gleiten aktivieren
                card.style.transition = 'top 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';

                // 2. Neue Position setzen
                card.style.top = (index * cardDistance) + "px";

                // 3. Nach der Animation Transition wieder entfernen (wichtig für Drag & Drop!)
                setTimeout(() => {
                    card.style.transition = '';
                }, 500);

                col.appendChild(card);
            });
        });

        pool = [...pool, ...stock];
        pool.sort(() => Math.random() - 0.5);
        stock = pool;

        // !!! STRAFE NOCH KORRIGIEREN !!!
        /*
        kts.game.player.XP = 0;
        saveToDisk();
        if (typeof updateLevelUI === 'function') updateLevelUI(0);
        */
        triggerGameMsg("NOTFALL-REDUKTION: XP RESET", -500);
    }

    // Common Cleanup
    if (waste) waste.innerHTML = '';
    document.getElementById('stock-pile')?.classList.remove('empty');
    ignoreStalemate = false;
    onPlayerMove();
    runAutoLogic();
}

function shuffleRescueANIMATED() {
    if (isAnimating) return;
    isAnimating = true;

    shuffleCount++;
    const waste = document.getElementById('waste-pile');
    const columns = document.querySelectorAll('.column');
    const currentBackDesign = kts.cfg.designBack || 'default';
    let pool = [];

    // Sound-Effekt falls vorhanden
    if (typeof sounds !== 'undefined' && sounds.shuffle) sounds.shuffle();

    if (shuffleCount === 1) {
        // --- VARIANTE A: SMART SHUFFLE (Hohe Karten ins Tableau) ---
        const allHidden = Array.from(document.querySelectorAll('.column .card.back'));
        allHidden.forEach(el => {
            pool.push({
                value: el.dataset.value,
                color: el.dataset.color,
                suit: el.dataset.suit,
                symbol: el.dataset.symbol
            });
            // Kleiner visueller "Flash" Effekt für die Karten, die getauscht werden
            el.style.filter = "brightness(1.5)";
            setTimeout(() => el.style.filter = "", 300);
        });

        // Alle verfügbaren Karten (Hidden + Stock) in einen Topf
        pool = [...pool, ...stock];

        // Sortieren: Hohe Werte (K, Q, J...) nach vorne
        pool.sort((a, b) => valMap[b.value] - valMap[a.value]);

        columns.forEach(col => {
            const hiddenInCol = Array.from(col.querySelectorAll('.card.back'));

            hiddenInCol.forEach(hc => {
                if (pool.length > 0) {
                    const newData = pool.shift(); // Nimm die höchste verfügbare Karte
                    hc.dataset.value = newData.value;
                    hc.dataset.color = newData.color;
                    hc.dataset.suit = newData.suit;
                    hc.dataset.symbol = newData.symbol;
                    // Klasse aktualisieren (Design beibehalten)
                    hc.className = `card ${newData.color} back ${currentBackDesign}`;
                }
            });

            // Offene Karten in der Spalte nach oben gleiten lassen (falls Lücken entstanden)
            /*const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
            visible.forEach((card, index) => {
                card.style.transition = 'top 0.4s ease-out';
                card.style.top = (index * cardDistance) + "px";
                setTimeout(() => card.style.transition = '', 450);
            });*/
        });

        stock = pool; // Der Rest (niedrige Karten) geht in den Stock
        updateScore(kts.game.points.SHUFFLE_RESCUE || -50);
        triggerGameMsg("SMART SHUFFLE", kts.game.points.SHUFFLE_RESCUE || -50);

    } else {
        // --- VARIANTE B: HARD RESCUE (Komplett-Mischung der verdeckten Karten) ---
        columns.forEach(col => {
            const hiddenInCol = Array.from(col.querySelectorAll('.card.back'));
            hiddenInCol.forEach(el => {
                pool.push({
                    value: el.dataset.value,
                    color: el.dataset.color,
                    suit: el.dataset.suit,
                    symbol: el.dataset.symbol
                });
                el.remove(); // Wir löschen sie kurz aus dem DOM für den "Sog"-Effekt
            });

            // Sichtbare Karten rücken animiert nach oben auf index 0
            const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
            visible.forEach((card, index) => {
                card.style.transition = 'top 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
                card.style.top = (index * cardDistance) + "px";
                setTimeout(() => card.style.transition = '', 500);
            });
        });

        pool = [...pool, ...stock];
        // Echter Zufall
        pool.sort(() => Math.random() - 0.5);
        stock = pool;

        updateScore(-200); // Höhere Strafe für Hard Rescue
        triggerGameMsg("HARD RESCUE", -200);
    }

    // --- Gemeinsames Cleanup ---
    if (waste) waste.innerHTML = '';

    const stockPile = document.getElementById('stock-pile');
    if (stockPile) {
        stockPile.classList.remove('empty');
        // Stock-Pile DOM muss nicht neu aufgebaut werden, da revealNextStockCard() 
        // die Daten aus dem 'stock' Array nimmt. Wir leeren ihn nur visuell:
        updateStackVisuals('stock-pile');
    }

    ignoreStalemate = false;
    isAnimating = false; // Flag wieder frei
    onPlayerMove();

    // Prüfen, ob durch das Shuffeln neue (Auto-)Züge entstanden sind
    setTimeout(runAutoLogic, 600);
}

/*
In deiner ursprünglichen createCardEl Funktion (Zeile 306) setzt du 
card.style.top = (index * 30) + "px". 
Da diese Eigenschaft inline im HTML-Element steht, überschreibt sie 
alle automatischen Layout-Regeln. Durch das manuelle Neusetzen von 
style.top in der Schleife rücken die Karten nun auch visuell an die 
richtige Stelle.
*/
function debugShuffleTest() {
    console.group("🛠 DEBUG: Shuffle-Rescue Test");
    const columns = document.querySelectorAll('.column');
    let pool = [];

    columns.forEach(col => {
        // 1. Verdeckte Karten finden, Daten sichern und löschen
        const hidden = Array.from(col.querySelectorAll('.card.back'));
        hidden.forEach(el => {
            pool.push({
                value: el.dataset.value,
                color: el.dataset.color,
                suit: el.dataset.suit,
                symbol: el.dataset.symbol
            });
            el.remove();
        });

        // 2. Offene Karten nach oben rücken lassen (DOM-Reorder)
        const visible = Array.from(col.querySelectorAll('.card:not(.back)'));
        visible.forEach((card, index) => {
            card.style.top = (index * cardDistance) + "px";
            col.appendChild(card);
        });
    });

    // 3. Pool mit Stock vereinen und mischen
    pool = [...pool, ...stock];
    console.log(`Karten im Pool gesammelt: ${pool.length}`);
    pool.sort(() => Math.random() - 0.5);
    stock = pool;

    // 4. UI Reset
    const waste = document.getElementById('waste-pile');
    if (waste) waste.innerHTML = '';
    document.getElementById('stock-pile')?.classList.remove('empty');

    triggerGameMsg("DEBUG: HARD RESET", -500);
    console.groupEnd();

    ignoreStalemate = false;
    onPlayerMove();
    runAutoLogic();
}