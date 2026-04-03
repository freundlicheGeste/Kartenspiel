/* =====================================================
   DECK UTILS
   Geteilte Konstanten und reine Hilfsfunktionen.
   SSOT für: Suit-Definitionen, Kartenwerte, Suit-Letter-Map.
   Keine Seiteneffekte. Wird von deck.generator.js und
   deck.manager.js genutzt — und löst die implizite globale
   Abhängigkeit auf suits[] aus deckGenerator.js ab.
===================================================== */

/* ---- Konstanten (SSOT) ---------------------------- */

const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUITS = [
    { suit: 'hearts',   symbol: '♥', color: 'red'   },
    { suit: 'diamonds', symbol: '♦', color: 'red'   },
    { suit: 'clubs',    symbol: '♣', color: 'black' },
    { suit: 'spades',   symbol: '♠', color: 'black' },
];

/**
 * Bidirektionale Suit-Letter-Map (SSOT).
 * Ersetzt die lokaldefinierten Maps in deckGenerator und deckManager.
 */
const SUIT_TO_LETTER = {
    hearts:   'H',
    diamonds: 'D',
    clubs:    'C',
    spades:   'S',
};

const LETTER_TO_SUIT = {
    H: 'hearts',
    D: 'diamonds',
    C: 'clubs',
    S: 'spades',
};

/* ---- Hilfsfunktionen ------------------------------ */

/**
 * Gibt das vollständige Suit-Objekt für einen Suit-Namen zurück.
 * Wirft einen Fehler wenn der Suit unbekannt ist.
 * @param {string} suitName - z.B. 'hearts'
 * @returns {{ suit, symbol, color }}
 */
function getSuitObj(suitName) {
    const obj = SUITS.find(s => s.suit === suitName);
    if (!obj) console.warn(`[getSuitObj] Unbekannter Suit: "${suitName}"`);
    return obj;
}

/**
 * Gibt das vollständige Suit-Objekt für einen Suit-Letter zurück.
 * @param {string} letter - 'H' | 'D' | 'C' | 'S'
 * @returns {{ suit, symbol, color }}
 */
function getSuitObjByLetter(letter) {
    return getSuitObj(LETTER_TO_SUIT[letter]);
}

/**
 * Erstellt einen einheitlichen Karten-Identifier-String.
 * SSOT – ersetzt die manuelle `${suitLetter}-${value}` Logik
 * in deckGenerator, deckManager und card.utils.
 * @param {{ suit: string, value: string }} card
 * @returns {string} z.B. 'H-A', 'S-10'
 */
function cardToId(card) {
    const letter = SUIT_TO_LETTER[card.suit] || 'X';
    return `${letter}-${card.value}`;
}

/**
 * Parst einen Karten-Identifier zurück in ein vollständiges Kartenobjekt.
 * @param {string} cardId - z.B. 'H-A'
 * @returns {{ suit, symbol, color, value }}
 */
function cardIdToObj(cardId) {
    const [letter, value] = cardId.split('-');
    const suitObj = getSuitObjByLetter(letter);
    if (!suitObj) return null;
    return { suit: suitObj.suit, symbol: suitObj.symbol, color: suitObj.color, value };
}

/**
 * Erstellt einen Deck-Identifier-String aus einem Array von Kartenobjekten oder ID-Strings.
 * SSOT – ersetzt getDeckKey() in deckManager und deckId-Aufbau in deckGenerator.
 * @param {Array<{suit,value}|string>} deck
 * @returns {string}
 */
function getDeckKey(deck) {
    if (!deck || !Array.isArray(deck)) return 'unknown';
    return deck.map(c => (typeof c === 'string' ? c : cardToId(c))).join('|');
}
