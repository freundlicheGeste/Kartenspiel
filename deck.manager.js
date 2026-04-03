/* =====================================================
   DECK MANAGER
   Verantwortlich für: Hardcoded-Decks laden, Deck-Stats
   abfragen, Deck-Auswahl koordinieren.
   Abhängigkeiten: deck.utils.js
===================================================== */

/* =====================================================
   STATS
===================================================== */

/**
 * Gibt die gespeicherten Statistiken für ein Deck zurück.
 * Nutzt getDeckKey() aus deck.utils.js (SSOT).
 * @param {Object[]|string[]} deck
 * @returns {Object|undefined} - Stats-Objekt oder undefined wenn nie gespielt
 */
function getDeckStats(deck) {
    return kts.stats.decks[getDeckKey(deck)];
}

/* =====================================================
   HARDCODED DECKS
===================================================== */

/**
 * Wählt ein zufälliges hardcoded Deck aus und wandelt
 * die Karten-ID-Strings ('H-A', 'S-10' …) in vollständige
 * Kartenobjekte um.
 *
 * Nutzt cardIdToObj() und getDeckKey() aus deck.utils.js (SSOT) —
 * ersetzt die lokale suitMap und die manuelle split('-')-Logik.
 *
 * @returns {{ deck: Object[], identifier: string, deckKey: string }}
 */
function generateHardcodedDeck() {
    const randomIndex = Math.floor(Math.random() * hardcodedDecks.length);
    const rawDeck     = hardcodedDecks[randomIndex];

    const deck = rawDeck.map(cardId => {
        const obj = cardIdToObj(cardId);
        if (!obj) console.warn(`[generateHardcodedDeck] Unbekannte Karten-ID: "${cardId}"`);
        return obj;
    }).filter(Boolean); // Defekte Einträge ausfiltern statt crash

    const deckKey = getDeckKey(rawDeck); // rawDeck (Strings) direkt nutzbar dank getDeckKey SSOT

    return { deck, identifier: `Hardcoded #${randomIndex + 1}`, deckKey };
}
