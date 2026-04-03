/* =====================================================
   CARD DEAL
   Verantwortlich für: Tableau aufbauen, Stock befüllen,
   Deal-Animation beim Spielstart.
   Abhängigkeiten: card.utils.js, card.creation.js
===================================================== */

/* =====================================================
   KLASSISCH (ohne Animation)
===================================================== */

/**
 * Baut das Tableau sofort auf (kein Deal-Delay).
 * Genutzt z.B. bei Undo-Reset oder wenn Animationen deaktiviert sind.
 * @param {Object[]} deck - Vollständiges gemischtes Deck (mind. 28 Karten)
 */
function createTableauColumns(deck) {
    if (!deck || deck.length < 28) {
        console.error('[createTableauColumns] Deck zu klein oder nicht vorhanden!', deck);
        return;
    }

    const board = document.getElementById('game-board');
    board.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const col = _createColumnEl(i);
        board.appendChild(col);

        for (let j = 0; j <= i; j++) {
            col.appendChild(createCardElement(deck.pop(), j < i, j));
        }
    }

    _initStockPile(deck);
}

/* =====================================================
   ANIMIERT (Spielstart)
===================================================== */

/**
 * Teilt Karten mit Deal-Animation aus (cascadiertes setTimeout).
 * Nach den 28 Tableau-Karten wird handleStockDealing() aufgerufen.
 * @param {Object[]} deck
 */
function startDealingAnimation(deck) {
    isAnimating = true;

    const board = document.getElementById('game-board');
    board.innerHTML = '';

    _initStockPile(); // Stock-Pile leeren/vorbereiten

    // Design-String einmal lesen (SSOT für diesen Deal-Durchgang)
    const currentBack = kts.cfg.designBack;

    for (let i = 0; i < 7; i++) {
        const col = _createColumnEl(i);
        board.appendChild(col);

        for (let j = 0; j <= i; j++) {
            const totalIndex = (i * (i + 1) / 2) + j;
            const delay      = totalIndex * 60;

            setTimeout(() => {
                const cardData = deck.pop();
                const isBack   = j < i;
                const cardEl   = createCardElement(cardData, isBack, j);

                // Rückseiten-Design explizit erzwingen (SSOT: applyCardBack)
                if (isBack) applyCardBack(cardEl, cardData);

                cardEl.classList.add('dealing-animation');
                col.appendChild(cardEl);

                totalIndex === 27 ? playFinalDealSound() : playDealSound();
                setTimeout(() => cardEl.classList.remove('dealing-animation'), 450);

                if (totalIndex === 27) {
                    handleStockDealing(deck, currentBack);
                }
            }, delay);
        }
    }
}

/* =====================================================
   STOCK-BEFÜLLUNG (nach Deal)
===================================================== */

/**
 * Befüllt den Stock-Pile mit den restlichen Deck-Karten nach dem Deal.
 * Animiert das Einlegen mit einem Delay pro Karte.
 * @param {Object[]} remainingDeck
 * @param {string}   backDesign
 */
function handleStockDealing(remainingDeck, backDesign) {
    const stockPile = document.getElementById('stock-pile');
    stockPile.innerHTML = '';

    const fragment = document.createDocumentFragment();

    remainingDeck.forEach((cardData, sIndex) => {
        const cardEl = createCardElement(cardData, true);
        // Explizites Design (SSOT: applyCardBack würde auch gehen,
        // aber hier brauchen wir zusätzlich die stock-dealing-animation Klasse)
        cardEl.className        = `card back ${backDesign} stock-dealing-animation`;
        cardEl.style.animationDelay = `${sIndex * 30}ms`;

        cardEl.addEventListener('animationstart', () => playDealSound(), { once: true });
        fragment.appendChild(cardEl);
    });

    stockPile.appendChild(fragment);

    // Cleanup nach Ende aller Animationen
    const totalDuration = (remainingDeck.length * 30) + 350;
    setTimeout(() => {
        // stock-Array befüllen (SSOT: cardElToData würde hier auch gehen,
        // aber remainingDeck ist noch vorhanden und sauberer)
        stock = [...remainingDeck];
        stockPile.classList.remove('is-dealing');

        stockPile.querySelectorAll('.stock-dealing-animation').forEach(card => {
            card.classList.remove('stock-dealing-animation');
            card.style.animationDelay = '';
            card.style.transform      = '';
        });

        updateStackVisuals('stock-pile');
        isAnimating = false;
        gameState.is(GameStates.RUNNING);
    }, totalDuration);
}

/* =====================================================
   INTERNE HILFSFUNKTIONEN
===================================================== */

/**
 * Erstellt einen leeren Spalten-Container mit Drop-Handler.
 * @param {number} index - Spalten-Index (0–6)
 * @returns {HTMLElement}
 */
function _createColumnEl(index) {
    const col       = document.createElement('div');
    col.className   = 'column';
    col.id          = `col-${index}`;
    col.ondragover  = e => e.preventDefault();
    col.ondrop      = handleDrop;
    return col;
}

/**
 * Leert und initialisiert den Stock-Pile-Container.
 * @param {Object[]} [deck] - Wenn übergeben, wird stock[] sofort befüllt (für createTableauColumns)
 */
function _initStockPile(deck = null) {
    const stockPile = document.getElementById('stock-pile');
    if (!stockPile) return;

    stockPile.classList.remove('empty');
    stockPile.innerHTML = '';

    if (deck) {
        stock = [...deck];
    }
}
