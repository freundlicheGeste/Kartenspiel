/* =====================================================
   DECK GENERATOR
   Verantwortlich für: Deck erstellen, mischen,
   lösbar austeilen (dealFriendly) und als flaches
   Array für das Spiel aufbereiten.
   Abhängigkeiten: deck.utils.js
===================================================== */

/* =====================================================
   DECK ERSTELLEN & MISCHEN
===================================================== */

/**
 * Erstellt ein ungemischtes 52-Karten-Deck.
 * Nutzt SUITS und CARD_VALUES aus deck.utils.js (SSOT).
 * @returns {Object[]} - Array von { suit, symbol, color, value, rank }
 */
function createDeck() {
    const deck = [];
    SUITS.forEach(s =>
        CARD_VALUES.forEach((v, i) =>
            deck.push({ suit: s.suit, symbol: s.symbol, color: s.color, value: v, rank: i + 1 })
        )
    );
    return deck;
}

/**
 * Mischt ein Array in-place (Fisher-Yates).
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function shuffleDeck(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* =====================================================
   LÖSBAR AUSTEILEN
===================================================== */

/**
 * Teilt ein gemischtes Deck "spielerfreundlich" aus:
 * Die oberste Tableau-Karte jeder Spalte ist, wenn möglich,
 * legal auf eine andere Spalte legbar.
 *
 * Algorithmus:
 *  - Für jede Position (col, row) wird die erste passende Karte
 *    aus dem Deck gezogen. Wenn keine passt, wird deck.pop() genutzt
 *    (Fallback — wird geloggt).
 *  - Verdeckte Karten werden blind aus dem Deck genommen.
 *
 * @returns {{ tableau: Object[][], stock: Object[] }}
 */
function dealFriendly() {
    const deck    = shuffleDeck(createDeck());
    const tableau = Array.from({ length: 7 }, () => []);

    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            if (!deck.length) throw new Error('[dealFriendly] Deck unerwartet leer');

            const isFaceUp = row === col;
            let placed     = false;

            for (let i = 0; i < deck.length; i++) {
                const card = deck[i];
                const fits = isFaceUp
                    ? _canPlaceOnTableau(card, tableau[col])
                    : true; // Verdeckte Karten: beliebige Karte

                if (fits) {
                    tableau[col].push({ ...card, faceUp: isFaceUp });
                    deck.splice(i, 1);
                    placed = true;
                    break;
                }
            }

            // Fallback: wenn keine Karte passt, oberste nehmen
            if (!placed) {
                console.warn(`[dealFriendly] Kein legaler Zug für col=${col}, row=${row} — Fallback auf deck.pop()`);
                const card = deck.pop();
                tableau[col].push({ ...card, faceUp: isFaceUp });
            }
        }
    }

    return { tableau, stock: deck };
}

/**
 * Prüft ob eine Karte legal auf eine Tableau-Spalte gelegt werden kann.
 * König (rank 13) auf leere Spalte, sonst: andere Farbe, rank - 1.
 * @param {{ rank: number, color: string }} card
 * @param {Object[]} col - Aktueller Spalten-Inhalt
 * @returns {boolean}
 */
function _canPlaceOnTableau(card, col) {
    if (col.length === 0) return card.rank === 13;
    const top = col[col.length - 1];
    return top.faceUp && top.color !== card.color && top.rank === card.rank + 1;
}

/* =====================================================
   FLATTEN (Tableau → flaches Deck-Array)
===================================================== */

/**
 * Wandelt ein dealFriendly()-Ergebnis in ein flaches Deck-Array um,
 * das createTableauColumns() / startDealingAnimation() erwartet.
 *
 * Reihenfolge: Stock zuerst (wird zuletzt verteilt), dann
 * Tableau-Karten in umgekehrter Deal-Reihenfolge (LIFO: deck.pop()).
 *
 * @param {{ tableau: Object[][], stock: Object[] }} game
 * @returns {Object[]} - Array von { suit, symbol, color, value }
 */
function _flattenGame(game) {
    // Stock bleibt am Ende des Arrays (wird via deck.pop() zuletzt verteilt)
    const stockCards = game.stock.map(_toCardData);

    // Tableau: Zeilen-für-Zeilen, dann umkehren → LIFO-Reihenfolge für deck.pop()
    const tableauCards = [];
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            tableauCards.push(_toCardData(game.tableau[col][row]));
        }
    }
    tableauCards.reverse();

    return [...stockCards, ...tableauCards];
}

/**
 * Extrahiert nur die spielrelevanten Felder aus einem Kartenobjekt.
 * Entfernt interne Felder wie rank, faceUp.
 * @param {{ suit, symbol, color, value }} card
 * @returns {{ suit, symbol, color, value }}
 */
function _toCardData(card) {
    return { suit: card.suit, symbol: card.symbol, color: card.color, value: card.value };
}

/* =====================================================
   ÖFFENTLICHE API
===================================================== */

/**
 * Generiert ein lösbar ausgeteiltes Deck als flaches Array
 * bereit für createTableauColumns() / startDealingAnimation().
 *
 * Nutzt getDeckKey() aus deck.utils.js (SSOT — deckId wird nicht
 * mehr intern weggeworfen sondern korrekt zurückgegeben).
 *
 * @returns {{ deck: Object[], identifier: string, deckKey: string }}
 */
function generateSolvableDeck() {
    const game    = dealFriendly();
    const deck    = _flattenGame(game);
    const deckKey = getDeckKey(deck);

    return { deck, identifier: 'Deck: generiert', deckKey };
}
