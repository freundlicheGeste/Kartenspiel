/**
 * Sammlung an 100% lösbaren Decks
 */
const hardcodedDecks = [
    // DibbiDabb = bereits im kts Template ["H-5", "S-4", "S-5", "D-9", "H-10", "C-2", "D-3", "C-4", "C-8", "D-2", "D-7", "D-Q", "H-7", "H-4", "C-5", "S-J", "H-9", "H-2", "D-8", "H-A", "D-K", "S-A", "C-7", "C-Q", "S-7", "D-5", "S-Q", "C-K", "D-6", "C-3", "D-J", "C-A", "S-9", "S-8", "C-6", "H-8", "S-3", "C-9", "H-6", "H-3", "C-J", "C-10", "S-K", "H-J", "S-10", "D-10", "S-6", "H-Q", "D-4", "S-2", "H-K", "D-A"],
    ["S-2", "H-2", "H-A", "H-8", "D-A", "H-J", "S-3", "C-3", "H-10", "H-9", "D-4", "D-8", "S-A", "H-3", "D-3", "H-7", "D-2", "D-5", "H-K", "C-A", "C-2", "H-5", "H-4", "H-6", "D-6", "H-Q", "D-7", "D-9", "D-J", "D-Q", "C-8", "D-10", "C-9", "C-J", "C-10", "D-K", "C-K", "C-5", "C-6", "C-Q", "S-5", "C-7", "C-4", "S-4", "S-6", "S-8", "S-7", "S-9", "S-J", "S-10", "S-Q", "S-K"],
    ["S-2", "C-2", "S-A", "H-2", "S-3", "C-A", "C-3", "D-J", "C-8", "D-2", "H-3", "D-3", "H-6", "D-4", "H-A", "D-A", "C-10", "C-J", "H-5", "D-Q", "D-10", "C-9", "H-9", "H-4", "C-K", "D-K", "H-Q", "H-8", "H-K", "S-5", "C-Q", "S-4", "C-7", "C-4", "C-5", "H-10", "H-J", "C-6", "D-5", "D-7", "H-7", "D-6", "D-9", "D-8", "S-6", "S-8", "S-Q", "S-J", "S-7", "S-9", "S-10", "S-K"],
    ["S-3", "S-A", "S-2", "C-3", "H-3", "H-2", "H-A", "D-A", "D-3", "C-A", "H-6", "C-2", "D-2", "H-K", "H-4", "H-5", "H-8", "D-4", "H-7", "H-9", "H-J", "H-Q", "D-5", "H-10", "D-8", "D-7", "D-6", "D-9", "C-10", "D-10", "C-J", "D-J", "C-7", "C-8", "C-9", "C-K", "S-4", "D-K", "C-Q", "C-4", "C-5", "S-5", "D-Q", "C-6", "S-10", "S-Q", "S-8", "S-9", "S-6", "S-K", "S-J", "S-7"],
    ["D-7", "H-10", "H-5", "H-A", "H-2", "H-8", "C-3", "H-Q", "H-J", "H-K", "D-5", "S-A", "H-3", "S-3", "S-2", "D-3", "D-A", "C-2", "H-7", "C-A", "H-6", "H-4", "D-9", "D-2", "D-6", "H-9", "D-4", "D-8", "D-K", "D-10", "D-J", "D-Q", "C-6", "C-5", "C-4", "C-7", "C-J", "C-8", "C-10", "C-9", "C-Q", "S-5", "S-4", "C-K", "S-Q", "S-8", "S-7", "S-9", "S-J", "S-6", "S-10", "S-K"],
    ["H-2", "C-2", "S-A", "S-2", "D-2", "D-3", "H-3", "C-3", "C-A", "D-A", "S-J", "H-A", "S-3", "S-9", "C-6", "S-6", "S-8", "C-8", "S-Q", "S-7", "H-5", "S-10", "S-K", "H-4", "C-10", "C-4", "H-6", "H-7", "D-10", "H-9", "D-J", "H-8", "H-10", "H-J", "D-Q", "D-4", "D-K", "C-J", "H-Q", "H-K", "D-8", "D-5", "D-7", "D-6", "C-9", "C-5", "D-9", "C-7", "S-5", "S-4", "C-K", "C-Q"],
    ["D-10", "D-4", "D-Q", "C-K", "S-4", "D-8", "S-Q", "D-K", "S-K", "S-J", "C-Q", "D-6", "S-10", "D-J", "S-5", "D-7", "S-7", "H-7", "D-9", "C-7", "D-5", "S-6", "C-10", "H-5", "H-6", "S-8", "H-4", "C-8", "H-8", "C-6", "C-5", "S-9", "C-4", "H-10", "C-9", "C-A", "H-9", "H-J", "H-K", "C-J", "H-Q", "S-3", "S-2", "H-2", "S-A", "C-3", "H-3", "C-2", "H-A", "D-3", "D-2", "D-A"],
    ["H-Q", "H-2", "H-3", "H-A", "H-4", "H-5", "H-J", "H-8", "H-10", "H-7", "H-6", "H-9", "D-2", "H-K", "D-A", "D-3", "D-J", "D-8", "D-10", "D-9", "D-4", "D-5", "D-6", "D-7", "C-A", "D-Q", "C-2", "D-K", "C-4", "C-5", "C-3", "C-6", "C-7", "C-8", "C-10", "C-9", "C-Q", "C-J", "C-K", "S-A", "S-5", "S-3", "S-4", "S-2", "S-8", "S-6", "S-7", "S-9", "S-J", "S-10", "S-Q", "S-K"],
    ["D-8", "S-2", "H-J", "S-5", "H-10", "C-2", "C-Q", "H-7", "C-9", "H-2", "S-7", "H-8", "D-Q", "D-K", "H-5", "D-6", "H-Q", "C-3", "C-7", "D-5", "H-K", "S-10", "C-A", "C-J", "C-K", "C-8", "D-J", "H-A", "S-A", "S-6", "C-4", "C-6", "S-9", "C-5", "D-4", "C-10", "S-8", "S-J", "S-3", "H-3", "D-3", "S-K", "D-10", "S-4", "D-2", "S-Q", "D-9", "H-6", "H-4", "D-7", "H-9", "D-A"],
    ["C-4", "D-8", "D-3", "C-3", "S-8", "H-J", "C-9", "H-A", "S-Q", "H-5", "C-5", "D-10", "D-5", "H-6", "C-8", "S-2", "D-7", "H-3", "D-9", "H-Q", "S-5", "S-6", "C-7", "S-7", "S-4", "H-9", "H-7", "D-K", "D-2", "D-4", "C-6", "S-3", "H-K", "D-Q", "C-J", "C-Q", "S-10", "H-2", "C-10", "C-K", "S-K", "C-2", "C-A", "S-9", "D-J", "S-J", "H-10", "D-6", "H-8", "S-A", "H-4", "D-A"],
    ["S-9", "D-7", "S-Q", "H-6", "D-Q", "S-4", "C-A", "C-5", "S-3", "D-3", "C-7", "D-9", "C-J", "C-8", "C-3", "D-K", "C-10", "H-J", "H-7", "D-J", "H-10", "D-2", "D-5", "H-9", "C-4", "C-2", "S-A", "D-10", "H-K", "H-2", "D-A", "S-J", "D-8", "D-6", "S-8", "H-8", "C-Q", "S-5", "S-10", "S-2", "C-9", "S-7", "D-4", "S-K", "C-6", "S-6", "H-3", "C-K", "H-4", "H-5", "H-Q", "H-A"],
    ["D-2", "S-2", "S-10", "H-9", "S-J", "H-A", "H-Q", "S-8", "H-7", "D-9", "C-7", "D-10", "H-J", "D-A", "H-5", "D-5", "D-6", "C-10", "C-Q", "H-8", "D-J", "C-J", "S-5", "H-4", "S-Q", "D-3", "S-4", "C-6", "S-6", "H-6", "S-7", "C-5", "C-3", "H-10", "D-4", "S-K", "S-9", "D-Q", "C-4", "C-9", "D-7", "D-8", "C-A", "S-3", "H-K", "H-3", "H-2", "C-8", "C-K", "D-K", "C-2", "S-A"],
    ["D-7", "D-4", "C-7", "S-4", "C-K", "H-7", "D-10", "C-8", "D-K", "S-7", "S-8", "S-6", "D-J", "C-10", "D-5", "D-3", "H-8", "C-2", "H-5", "C-J", "D-6", "H-A", "S-A", "H-J", "D-A", "S-10", "H-9", "S-5", "S-3", "S-9", "D-9", "S-K", "C-6", "H-10", "H-K", "C-3", "C-9", "D-2", "H-3", "H-2", "C-5", "H-4", "D-8", "S-Q", "H-6", "C-Q", "C-4", "D-Q", "S-J", "S-2", "H-Q", "C-A"],
    ["D-J", "C-7", "D-7", "D-A", "D-9", "D-3", "H-2", "H-10", "D-4", "H-3", "H-8", "C-4", "H-9", "H-Q", "S-4", "H-K", "C-A", "S-K", "D-6", "C-5", "S-3", "H-7", "D-10", "S-J", "H-6", "C-J", "C-2", "H-5", "S-2", "C-3", "H-4", "D-Q", "C-10", "H-A", "C-K", "D-8", "S-6", "S-5", "H-J", "D-5", "S-9", "C-9", "S-8", "C-Q", "C-6", "S-Q", "C-8", "S-10", "S-7", "D-K", "D-2", "S-A"],
    ["D-K", "S-8", "H-5", "S-5", "H-Q", "H-3", "S-10", "D-5", "H-A", "D-A", "C-4", "C-2", "S-2", "S-Q", "C-3", "D-6", "C-6", "C-J", "C-Q", "D-7", "D-10", "S-6", "S-A", "C-8", "D-2", "D-8", "C-5", "S-7", "S-4", "H-10", "H-7", "D-9", "H-4", "C-9", "C-K", "D-Q", "D-4", "H-K", "S-K", "H-9", "D-3", "H-2", "H-6", "S-J", "H-J", "D-J", "C-7", "S-9", "H-8", "C-10", "S-3", "C-A"],
    ["H-3", "H-J", "H-6", "H-4", "D-7", "C-K", "C-5", "C-A", "S-9", "H-K", "H-8", "C-Q", "D-6", "S-J", "H-7", "C-3", "S-2", "S-Q", "C-J", "D-10", "D-K", "S-K", "D-4", "C-6", "D-J", "C-9", "S-3", "S-4", "C-2", "H-9", "C-7", "S-7", "D-9", "H-5", "D-8", "S-5", "C-10", "D-A", "D-5", "D-3", "C-8", "C-4", "H-2", "D-Q", "D-2", "S-10", "S-A", "S-6", "S-8", "H-10", "H-Q", "H-A"],
    ["S-10", "S-7", "H-3", "D-Q", "H-8", "D-7", "D-3", "H-2", "S-5", "D-2", "H-10", "D-4", "H-K", "H-4", "H-Q", "D-J", "D-K", "C-J", "H-9", "C-A", "C-8", "C-2", "H-6", "H-A", "H-5", "D-6", "C-3", "S-3", "S-Q", "D-10", "S-8", "C-9", "S-K", "S-6", "S-J", "C-10", "C-4", "S-2", "D-5", "C-7", "D-9", "S-4", "D-A", "C-Q", "H-J", "H-7", "C-K", "C-6", "S-9", "C-5", "D-8", "S-A"],
    ["H-8", "D-6", "D-10", "D-K", "S-8", "C-9", "H-Q", "S-J", "C-4", "C-3", "D-J", "S-7", "H-J", "S-2", "H-9", "S-K", "S-10", "C-Q", "D-2", "C-5", "H-5", "H-10", "S-Q", "C-10", "D-8", "H-A", "D-7", "D-3", "C-J", "D-Q", "C-8", "C-2", "C-6", "C-7", "D-A", "H-2", "S-6", "H-K", "D-4", "H-6", "C-K", "H-3", "S-A", "S-4", "S-5", "H-7", "S-3", "H-4", "D-9", "S-9", "D-5", "C-A"],
    ["H-5", "H-7", "S-3", "D-7", "C-K", "D-9", "C-9", "D-4", "H-2", "H-A", "C-3", "D-K", "D-2", "D-J", "D-8", "D-5", "S-6", "C-2", "C-8", "H-Q", "D-3", "S-J", "C-4", "H-K", "D-6", "C-5", "S-9", "H-8", "S-5", "H-9", "S-K", "C-A", "D-10", "C-10", "S-2", "C-7", "S-4", "H-J", "H-10", "H-6", "S-8", "S-10", "S-Q", "D-Q", "C-6", "S-A", "C-J", "C-Q", "H-4", "H-3", "S-7", "D-A"],
    ["H-K", "C-J", "C-8", "H-10", "C-4", "S-10", "H-4", "D-3", "C-6", "H-9", "S-5", "H-8", "C-3", "H-3", "D-5", "H-2", "S-Q", "S-4", "S-7", "D-8", "H-A", "H-7", "D-7", "H-Q", "S-6", "C-Q", "D-J", "S-A", "C-10", "D-10", "D-2", "H-J", "C-K", "D-9", "S-J", "S-8", "S-3", "C-A", "S-K", "D-Q", "S-2", "C-2", "D-4", "H-5", "C-9", "D-6", "H-6", "D-K", "C-7", "C-5", "S-9", "D-A"],
    ["S-K", "C-Q", "C-10", "C-2", "D-Q", "H-3", "D-10", "H-J", "H-8", "H-7", "H-2", "S-Q", "D-3", "H-9", "S-8", "S-J", "D-2", "D-5", "H-A", "C-6", "S-5", "S-4", "H-6", "D-A", "C-5", "S-10", "H-K", "D-8", "C-3", "C-K", "H-10", "D-4", "S-6", "C-8", "C-9", "D-9", "D-K", "C-A", "C-J", "S-2", "S-3", "H-4", "C-7", "D-6", "D-7", "C-4", "S-9", "H-5", "H-Q", "D-J", "S-7", "S-A"],
    ["D-J", "C-Q", "S-A", "C-9", "S-10", "H-Q", "H-J", "H-9", "C-3", "C-6", "S-9", "S-8", "D-9", "S-Q", "D-K", "H-3", "C-2", "D-8", "D-A", "D-4", "S-7", "H-8", "D-3", "H-5", "H-6", "D-10", "C-5", "D-7", "S-4", "D-5", "H-2", "S-5", "C-7", "H-7", "D-2", "S-2", "C-4", "S-K", "H-K", "C-8", "H-4", "D-Q", "C-10", "S-J", "D-6", "S-3", "C-A", "H-10", "S-6", "C-J", "C-K", "H-A"],
    ["S-Q", "S-2", "D-5", "D-8", "C-3", "H-A", "S-4", "H-2", "H-10", "D-6", "H-K", "H-6", "H-4", "S-10", "C-10", "H-7", "S-5", "H-J", "C-9", "D-A", "D-9", "D-3", "S-K", "H-3", "H-Q", "D-2", "C-A", "C-J", "H-5", "H-9", "C-5", "C-8", "D-4", "C-K", "D-J", "D-Q", "S-8", "C-7", "S-6", "D-K", "D-7", "C-Q", "S-3", "S-9", "D-10", "S-J", "C-6", "C-2", "H-8", "C-4", "S-7", "S-A"],
    ["H-3", "C-7", "C-5", "C-4", "D-5", "D-J", "H-Q", "S-2", "D-3", "S-A", "D-A", "D-8", "H-9", "S-5", "S-Q", "H-10", "H-8", "C-6", "H-K", "C-Q", "D-4", "D-9", "S-K", "S-6", "C-3", "C-8", "D-Q", "H-7", "H-5", "D-K", "C-J", "C-A", "D-10", "C-2", "H-4", "D-6", "S-10", "C-9", "C-K", "D-2", "C-10", "S-3", "S-7", "S-9", "H-2", "S-8", "S-J", "H-6", "D-7", "H-J", "S-4", "H-A"],
    ["C-3", "C-2", "C-8", "D-3", "S-K", "H-K", "S-7", "H-5", "C-7", "C-Q", "C-4", "D-A", "D-K", "S-6", "H-9", "S-10", "C-9", "C-J", "D-8", "H-10", "C-K", "H-A", "S-2", "S-8", "D-6", "C-5", "H-6", "D-7", "H-7", "S-5", "C-10", "D-4", "S-Q", "H-J", "D-9", "D-10", "D-2", "D-Q", "C-6", "S-4", "H-4", "S-3", "H-3", "S-9", "S-J", "H-8", "S-A", "H-2", "H-Q", "D-5", "D-J", "C-A"],
    ["S-3", "S-4", "D-J", "C-10", "H-J", "S-10", "H-6", "C-8", "S-A", "H-K", "S-Q", "S-5", "H-5", "D-8", "C-5", "H-7", "C-4", "H-9", "D-6", "C-7", "H-3", "C-K", "D-4", "S-7", "S-K", "D-A", "C-2", "S-J", "H-8", "C-6", "D-7", "D-2", "H-Q", "D-K", "D-Q", "H-2", "H-10", "C-J", "H-4", "C-Q", "C-3", "D-5", "D-10", "S-2", "D-9", "C-9", "D-3", "S-6", "S-8", "C-A", "S-9", "H-A"],
    ["H-J", "C-3", "H-6", "C-6", "D-9", "H-9", "S-8", "D-Q", "S-A", "S-J", "D-4", "S-5", "S-K", "H-4", "C-J", "C-4", "C-Q", "D-3", "S-3", "D-6", "H-2", "C-7", "C-K", "D-2", "H-3", "C-2", "H-A", "D-7", "D-K", "H-Q", "S-9", "H-5", "C-10", "H-K", "D-8", "C-8", "S-10", "S-4", "H-7", "S-6", "S-7", "D-A", "S-2", "S-Q", "D-J", "H-10", "D-5", "C-5", "D-10", "C-9", "H-8", "C-A"],
    ["H-8", "D-Q", "S-10", "C-5", "D-7", "H-10", "C-6", "C-Q", "H-9", "C-2", "C-10", "C-7", "D-6", "H-K", "H-Q", "D-A", "H-3", "S-8", "D-3", "D-5", "S-2", "H-7", "C-J", "D-J", "D-9", "H-4", "D-2", "C-4", "S-J", "S-6", "H-2", "C-A", "C-9", "H-A", "H-5", "S-9", "C-8", "C-K", "D-4", "D-K", "S-7", "D-8", "S-3", "S-4", "H-J", "H-6", "S-K", "D-10", "S-5", "C-3", "S-Q", "S-A"],
    ["C-6", "H-9", "D-Q", "C-8", "C-2", "D-8", "D-2", "H-3", "C-9", "S-3", "C-7", "D-K", "H-7", "H-J", "D-5", "C-5", "D-4", "H-2", "H-A", "D-3", "S-8", "S-J", "C-A", "S-9", "H-10", "S-4", "D-9", "H-K", "D-7", "H-8", "C-4", "H-Q", "S-10", "S-6", "C-3", "D-A", "D-6", "C-J", "H-6", "S-5", "H-5", "H-4", "D-10", "S-7", "C-K", "S-Q", "S-K", "C-Q", "S-2", "C-10", "D-J", "S-A"],
    ["D-2", "D-9", "C-K", "H-8", "C-4", "C-6", "C-5", "H-2", "H-5", "C-10", "D-3", "H-10", "D-10", "S-4", "H-6", "S-2", "C-2", "D-8", "D-6", "H-K", "C-J", "C-9", "H-4", "H-J", "D-A", "D-7", "C-Q", "D-4", "S-3", "D-J", "S-6", "S-5", "S-7", "C-3", "D-5", "D-Q", "D-K", "C-7", "S-J", "H-7", "S-10", "H-9", "S-Q", "H-Q", "S-9", "S-8", "S-A", "S-K", "C-8", "H-A", "H-3", "C-A"],
    ["H-7", "H-3", "S-Q", "C-10", "S-J", "H-10", "D-8", "S-6", "C-A", "D-A", "S-10", "D-5", "C-7", "H-9", "H-8", "S-9", "D-2", "C-2", "H-A", "C-9", "C-8", "D-Q", "H-J", "D-10", "D-3", "D-K", "D-4", "S-3", "D-9", "S-7", "C-K", "H-Q", "S-5", "S-2", "S-K", "H-2", "D-J", "D-6", "S-4", "C-J", "D-7", "H-4", "S-8", "H-5", "C-6", "H-6", "C-3", "C-5", "C-Q", "C-4", "H-K", "S-A"],
    ["H-5", "D-10", "S-4", "D-5", "S-8", "D-3", "C-K", "D-J", "C-5", "H-3", "S-7", "C-6", "D-K", "H-4", "D-9", "S-10", "S-A", "S-K", "H-7", "H-9", "D-Q", "C-9", "H-Q", "C-10", "D-4", "D-2", "S-3", "H-10", "H-K", "S-Q", "S-2", "S-J", "S-6", "C-Q", "C-8", "C-7", "H-J", "H-A", "C-J", "H-2", "C-4", "H-8", "D-A", "D-6", "D-8", "H-6", "C-3", "S-9", "C-2", "S-5", "D-7", "C-A"],
    ["D-Q", "S-9", "H-9", "H-Q", "C-6", "C-5", "S-3", "D-9", "C-A", "S-A", "H-2", "H-8", "C-Q", "C-10", "H-J", "H-7", "S-5", "C-K", "S-7", "S-Q", "C-2", "D-3", "D-10", "D-7", "H-A", "C-J", "H-4", "C-7", "D-8", "S-2", "H-5", "S-10", "D-K", "C-4", "S-J", "S-6", "H-3", "H-10", "C-8", "S-8", "S-K", "D-2", "D-5", "S-4", "H-6", "D-J", "C-9", "C-3", "H-K", "D-6", "D-4", "D-A"],
    ["H-2", "S-8", "H-4", "D-7", "S-K", "D-4", "C-7", "S-Q", "H-3", "D-Q", "H-K", "H-J", "D-5", "S-6", "H-7", "S-9", "C-3", "C-5", "S-10", "C-6", "C-A", "S-4", "D-A", "S-J", "S-5", "H-10", "D-9", "C-2", "S-2", "S-3", "D-J", "H-A", "C-J", "D-K", "S-7", "H-6", "C-K", "H-8", "H-5", "D-2", "D-10", "C-9", "D-6", "C-10", "C-8", "D-3", "C-Q", "H-Q", "C-4", "D-8", "H-9", "S-A"],
    ["S-A", "D-Q", "C-J", "C-Q", "S-9", "D-10", "S-5", "S-8", "C-4", "S-6", "H-6", "D-K", "S-K", "D-5", "C-K", "H-8", "H-7", "H-2", "H-J", "H-Q", "C-2", "H-10", "H-9", "S-10", "H-A", "C-9", "D-4", "H-3", "H-5", "S-7", "C-10", "D-8", "D-J", "D-A", "D-3", "D-7", "D-2", "C-3", "C-5", "C-8", "C-6", "D-6", "S-Q", "S-4", "S-J", "H-4", "D-9", "S-3", "S-2", "H-K", "C-7", "C-A"],
    ["H-10", "C-10", "H-Q", "H-A", "C-6", "C-4", "H-4", "S-8", "H-K", "C-5", "S-Q", "D-8", "S-6", "D-6", "S-2", "S-4", "H-3", "H-6", "D-A", "D-J", "S-A", "D-Q", "D-7", "C-7", "S-K", "D-3", "C-8", "C-2", "S-7", "D-2", "C-3", "H-J", "C-J", "H-7", "H-2", "S-3", "D-4", "D-K", "S-9", "H-5", "D-5", "C-9", "H-8", "C-K", "H-9", "D-9", "S-J", "C-Q", "S-5", "S-10", "D-10", "C-A"],
    ["H-7", "H-6", "D-K", "C-4", "H-J", "D-7", "C-5", "S-J", "S-K", "D-Q", "S-7", "H-4", "D-10", "H-8", "D-9", "H-5", "D-4", "C-J", "D-5", "C-3", "C-K", "C-10", "H-Q", "S-5", "D-6", "S-4", "S-A", "S-Q", "H-3", "S-8", "C-8", "H-9", "H-2", "S-6", "D-A", "D-8", "C-6", "H-10", "C-9", "D-3", "D-J", "S-2", "H-K", "C-Q", "S-9", "C-A", "D-2", "S-3", "S-10", "C-2", "C-7", "H-A"],
    ["C-7", "S-6", "D-5", "S-A", "C-Q", "D-6", "C-A", "D-7", "H-2", "D-8", "D-10", "D-2", "C-K", "D-4", "C-4", "C-J", "D-J", "C-8", "H-4", "D-9", "H-3", "S-3", "S-J", "S-9", "C-6", "D-3", "H-10", "C-10", "S-4", "S-2", "H-5", "H-9", "S-K", "H-Q", "D-K", "S-7", "S-Q", "D-A", "H-7", "S-10", "S-8", "D-Q", "H-K", "C-5", "C-3", "S-5", "C-9", "H-J", "H-8", "H-6", "C-2", "H-A"],
    ["H-2", "S-10", "S-A", "S-Q", "S-9", "C-4", "H-6", "S-8", "C-5", "D-3", "H-4", "S-J", "D-K", "H-10", "C-6", "D-8", "C-2", "H-9", "D-5", "D-A", "S-3", "C-7", "D-2", "C-J", "D-Q", "D-7", "H-A", "S-5", "H-7", "C-Q", "H-J", "D-6", "S-4", "H-K", "H-Q", "D-4", "C-3", "H-8", "S-K", "S-6", "C-K", "C-9", "S-2", "C-8", "D-J", "D-10", "C-10", "H-3", "H-5", "D-9", "S-7", "C-A"],
    ["H-K", "D-4", "C-6", "S-3", "D-3", "S-2", "S-J", "D-7", "D-5", "D-9", "C-K", "C-8", "C-5", "H-Q", "S-Q", "C-10", "D-A", "H-10", "D-10", "S-10", "C-4", "C-3", "S-K", "D-J", "H-7", "H-J", "H-A", "H-4", "S-7", "D-8", "C-7", "H-6", "C-9", "H-8", "S-4", "S-9", "D-K", "S-A", "S-8", "D-Q", "H-9", "D-6", "S-6", "D-2", "H-2", "C-Q", "H-5", "H-3", "C-J", "C-2", "S-5", "C-A"],
    ["H-A", "S-J", "H-4", "D-9", "H-J", "C-6", "D-8", "C-Q", "H-5", "H-2", "D-6", "D-3", "C-7", "S-4", "C-9", "S-5", "H-3", "H-10", "S-3", "H-K", "S-6", "C-2", "D-Q", "S-8", "S-10", "C-4", "S-Q", "H-9", "D-7", "H-Q", "S-A", "D-5", "C-10", "D-4", "S-9", "C-3", "S-7", "D-K", "S-K", "D-2", "S-2", "C-5", "H-7", "D-J", "C-J", "D-10", "D-A", "H-8", "H-6", "C-K", "C-8", "C-A"],
    ["C-4", "H-4", "H-10", "C-J", "H-8", "S-Q", "C-Q", "D-4", "H-5", "D-A", "D-6", "H-Q", "H-7", "H-J", "C-K", "H-6", "H-3", "S-10", "S-6", "C-9", "C-2", "D-10", "D-3", "D-5", "C-6", "D-Q", "S-5", "S-A", "D-K", "S-4", "S-J", "S-9", "S-K", "H-9", "S-8", "D-J", "D-9", "C-7", "D-2", "C-3", "S-2", "C-8", "H-2", "C-10", "S-3", "D-8", "C-5", "H-K", "D-7", "S-7", "C-A", "H-A"],
    ["C-9", "H-6", "D-9", "S-3", "D-J", "C-6", "C-4", "H-8", "D-4", "H-A", "H-3", "S-K", "D-10", "H-J", "S-6", "C-Q", "C-5", "C-7", "H-7", "H-K", "H-9", "D-7", "S-8", "S-A", "C-2", "H-4", "S-2", "H-10", "C-8", "D-6", "S-J", "D-3", "C-J", "S-4", "D-Q", "C-K", "D-K", "C-A", "D-5", "D-2", "S-10", "H-5", "H-2", "S-7", "S-5", "C-3", "H-Q", "S-Q", "S-9", "D-8", "C-10", "D-A"],
    ["S-A", "S-5", "H-8", "C-6", "D-2", "H-3", "S-8", "D-J", "H-5", "D-4", "H-2", "H-Q", "S-J", "C-5", "H-7", "C-10", "D-7", "S-9", "D-9", "D-K", "S-Q", "H-10", "C-2", "C-8", "C-J", "S-10", "S-3", "S-7", "S-4", "H-A", "S-2", "C-Q", "S-6", "H-J", "D-Q", "D-10", "H-6", "D-A", "H-4", "C-4", "C-9", "D-8", "D-5", "D-6", "H-9", "H-K", "S-K", "C-K", "C-7", "D-3", "C-3", "C-A"],
    ["C-5", "H-2", "H-K", "C-A", "S-5", "S-7", "D-A", "H-9", "S-J", "S-K", "C-4", "H-5", "D-K", "S-Q", "C-2", "S-A", "C-K", "D-5", "D-4", "D-8", "C-9", "H-J", "S-9", "C-Q", "D-7", "H-10", "S-4", "S-8", "C-6", "D-3", "D-6", "D-10", "D-2", "H-4", "H-7", "C-7", "D-J", "S-10", "H-3", "S-2", "H-Q", "D-Q", "C-8", "D-9", "C-10", "S-6", "C-J", "C-3", "S-3", "H-8", "H-6", "H-A"],
    ["D-K", "S-2", "D-Q", "C-3", "S-J", "H-8", "D-J", "S-8", "D-10", "H-6", "H-10", "C-A", "C-K", "D-8", "H-J", "C-4", "H-5", "C-8", "S-4", "C-Q", "S-5", "C-J", "H-A", "C-2", "D-6", "H-3", "S-10", "S-A", "S-K", "S-9", "D-3", "D-4", "H-K", "S-6", "C-6", "H-4", "C-5", "S-Q", "H-7", "C-9", "D-5", "S-7", "D-7", "S-3", "H-9", "H-2", "D-9", "C-7", "C-10", "H-Q", "D-2", "D-A"],
    ["S-8", "H-8", "C-5", "D-10", "H-9", "S-10", "D-3", "D-A", "D-7", "H-Q", "C-4", "S-3", "H-J", "C-A", "C-10", "D-J", "H-7", "S-Q", "H-4", "S-K", "H-5", "C-6", "H-10", "C-2", "D-Q", "D-K", "C-9", "S-4", "H-3", "C-7", "S-5", "D-5", "C-Q", "S-9", "D-8", "D-9", "C-8", "H-6", "S-A", "H-2", "C-K", "C-J", "S-J", "S-7", "S-6", "H-K", "D-4", "D-2", "D-6", "S-2", "C-3", "H-A"],
    ["C-J", "H-8", "C-7", "D-A", "S-8", "C-9", "H-4", "H-9", "S-K", "D-6", "D-Q", "S-J", "S-4", "C-4", "C-6", "H-J", "H-A", "H-5", "S-3", "C-5", "S-10", "D-3", "D-2", "C-10", "C-3", "H-3", "S-5", "D-K", "D-8", "D-7", "D-5", "C-A", "H-6", "S-2", "S-Q", "H-K", "D-4", "D-10", "D-9", "C-2", "H-7", "S-6", "S-9", "C-K", "H-2", "C-Q", "C-8", "S-7", "H-10", "D-J", "H-Q", "S-A"],
    ["H-Q", "H-K", "S-8", "S-3", "S-10", "H-4", "H-5", "C-4", "C-6", "D-2", "C-Q", "D-8", "C-9", "D-10", "D-3", "C-3", "C-5", "C-J", "D-4", "D-J", "H-2", "S-6", "C-A", "C-8", "C-7", "H-10", "S-5", "S-9", "H-8", "D-6", "D-K", "H-9", "D-A", "S-J", "C-2", "D-5", "H-7", "D-Q", "S-K", "H-3", "S-7", "D-7", "S-2", "H-A", "S-4", "C-K", "H-J", "C-10", "S-Q", "H-6", "D-9", "S-A"],
    ["D-K", "S-K", "D-7", "H-J", "D-2", "D-8", "C-A", "H-A", "C-8", "D-J", "H-9", "H-4", "D-10", "D-Q", "S-6", "C-5", "C-J", "C-3", "C-9", "C-2", "S-2", "S-A", "H-5", "S-8", "S-Q", "H-K", "H-10", "S-9", "D-4", "D-9", "S-7", "D-3", "S-4", "S-10", "C-4", "S-J", "C-10", "H-3", "D-6", "D-5", "C-6", "H-7", "C-7", "H-6", "C-Q", "S-3", "H-2", "H-Q", "S-5", "H-8", "C-K", "D-A"],
    ["S-7", "H-6", "S-10", "D-7", "C-9", "H-10", "S-6", "D-5", "H-A", "S-A", "H-J", "C-7", "S-8", "D-2", "D-4", "D-8", "S-2", "C-J", "H-2", "H-7", "S-5", "D-3", "C-10", "H-Q", "C-K", "S-3", "H-5", "D-10", "S-9", "D-6", "D-J", "D-A", "S-4", "C-2", "S-Q", "H-3", "H-4", "S-J", "C-Q", "D-K", "D-Q", "C-3", "C-8", "S-K", "C-6", "C-5", "H-9", "D-9", "H-8", "H-K", "C-4", "C-A"],
    ["S-K", "D-2", "H-K", "C-10", "C-6", "H-9", "D-8", "S-J", "H-10", "S-3", "C-9", "C-Q", "H-2", "S-6", "D-9", "C-8", "S-2", "D-10", "D-3", "D-Q", "H-3", "S-7", "H-4", "S-9", "D-6", "C-4", "D-5", "H-J", "S-8", "S-4", "D-7", "C-5", "H-8", "H-A", "C-7", "D-J", "H-Q", "D-4", "C-K", "C-J", "H-7", "S-10", "C-A", "C-2", "S-Q", "C-3", "D-A", "D-K", "S-5", "H-6", "H-5", "S-A"],
    ["S-7", "D-Q", "C-K", "C-2", "D-7", "H-Q", "C-6", "D-10", "S-A", "H-7", "S-Q", "D-J", "D-A", "H-4", "D-6", "H-10", "H-A", "H-5", "S-3", "H-8", "C-J", "S-8", "D-2", "C-7", "D-5", "H-K", "S-10", "C-5", "D-9", "S-2", "S-K", "D-8", "C-3", "H-2", "S-5", "C-10", "C-4", "H-3", "S-6", "H-J", "H-9", "C-9", "S-9", "S-4", "C-8", "C-Q", "D-K", "H-6", "D-3", "S-J", "D-4", "C-A"],
    ["C-5", "C-4", "D-7", "S-9", "S-J", "D-2", "D-J", "C-3", "S-8", "S-5", "C-Q", "D-A", "C-2", "D-10", "D-6", "H-3", "H-Q", "H-6", "D-5", "C-A", "S-2", "H-10", "C-9", "D-4", "C-6", "C-K", "S-3", "H-K", "H-5", "C-10", "S-6", "D-Q", "H-J", "D-8", "C-8", "D-9", "H-4", "S-7", "S-4", "S-10", "S-K", "H-9", "C-J", "S-Q", "S-A", "D-K", "H-2", "H-8", "C-7", "H-7", "D-3", "H-A"],
    ["S-5", "H-K", "C-8", "C-7", "D-4", "H-2", "H-8", "S-7", "S-2", "S-A", "C-5", "C-Q", "D-8", "H-5", "S-J", "H-J", "C-K", "D-Q", "S-Q", "S-4", "H-Q", "C-2", "C-3", "S-K", "C-J", "D-3", "D-A", "H-7", "H-A", "H-6", "D-9", "S-3", "D-J", "C-4", "D-7", "S-6", "H-9", "C-6", "D-K", "D-6", "D-10", "C-9", "S-8", "D-5", "S-10", "C-10", "D-2", "H-10", "H-3", "S-9", "H-4", "C-A"],
    ["D-5", "C-2", "D-2", "H-7", "D-4", "D-3", "H-8", "D-10", "C-10", "S-4", "H-Q", "H-10", "D-8", "H-5", "H-K", "H-2", "S-7", "C-4", "S-8", "C-3", "H-J", "S-10", "D-6", "S-K", "H-4", "S-5", "D-Q", "D-9", "C-6", "C-9", "C-J", "D-A", "S-3", "C-8", "D-K", "H-9", "C-K", "S-6", "S-A", "D-J", "C-Q", "C-A", "H-3", "C-5", "S-J", "S-Q", "S-9", "C-7", "H-6", "D-7", "S-2", "H-A"],
    ["H-6", "S-J", "S-3", "D-2", "H-10", "S-Q", "D-J", "S-K", "C-2", "D-4", "S-7", "H-8", "S-6", "D-5", "C-7", "H-K", "H-4", "D-Q", "H-7", "C-A", "C-J", "D-6", "D-8", "H-3", "H-9", "C-4", "C-6", "S-10", "D-7", "D-10", "C-Q", "S-A", "D-K", "C-3", "C-K", "S-9", "C-5", "S-2", "C-8", "C-10", "H-5", "C-9", "H-A", "D-9", "S-5", "S-8", "H-J", "H-Q", "D-3", "S-4", "H-2", "D-A"],
    ["H-K", "H-8", "D-2", "S-K", "H-9", "D-3", "S-10", "S-Q", "C-7", "C-6", "C-3", "H-7", "C-8", "H-A", "D-6", "H-2", "D-4", "S-5", "H-6", "C-A", "S-6", "D-5", "D-Q", "S-7", "S-A", "D-9", "C-2", "D-K", "C-5", "H-Q", "S-4", "D-7", "H-J", "C-9", "S-J", "D-J", "H-3", "H-5", "H-4", "S-3", "C-J", "D-8", "S-9", "C-Q", "S-2", "D-10", "C-10", "H-10", "C-4", "S-8", "C-K", "D-A"],
    ["S-2", "S-Q", "C-7", "H-A", "D-K", "C-4", "H-7", "H-J", "H-4", "D-3", "D-A", "H-Q", "S-8", "H-5", "C-J", "D-10", "H-2", "H-8", "H-3", "S-4", "C-10", "D-5", "C-3", "D-Q", "H-6", "D-8", "C-K", "D-4", "S-10", "H-K", "D-7", "S-7", "C-Q", "S-A", "S-J", "C-6", "S-9", "C-2", "D-9", "C-A", "C-5", "S-6", "D-J", "D-6", "C-8", "H-9", "D-2", "S-5", "H-10", "S-3", "C-9", "S-K"],
    ["D-8", "S-7", "C-10", "S-6", "S-2", "H-7", "S-A", "D-3", "D-10", "C-K", "S-J", "H-2", "C-A", "D-2", "D-Q", "C-Q", "H-3", "H-K", "H-5", "D-6", "H-4", "D-7", "H-10", "D-J", "S-5", "S-10", "C-9", "C-J", "H-J", "C-2", "H-6", "D-5", "H-8", "S-9", "S-Q", "S-8", "C-5", "H-A", "D-9", "C-8", "C-7", "H-9", "S-3", "H-Q", "D-4", "C-4", "S-4", "D-A", "C-3", "D-K", "C-6", "S-K"],
    ["S-9", "D-A", "C-4", "H-9", "C-K", "H-8", "C-6", "D-3", "C-9", "C-3", "H-A", "S-10", "D-9", "D-7", "C-8", "H-K", "H-Q", "S-Q", "S-5", "H-5", "H-6", "S-K", "C-5", "C-A", "S-A", "C-Q", "H-3", "C-7", "H-10", "S-7", "D-10", "S-2", "H-J", "D-2", "S-8", "C-2", "S-4", "S-3", "D-5", "D-J", "S-J", "C-10", "C-J", "D-6", "D-8", "H-4", "H-2", "H-7", "D-Q", "D-4", "S-6", "D-K"],
    ["S-5", "C-5", "D-3", "S-7", "C-9", "H-10", "S-J", "S-3", "H-Q", "C-A", "S-Q", "D-8", "H-9", "H-J", "C-8", "S-4", "D-4", "S-2", "D-7", "D-J", "H-5", "H-K", "C-6", "C-3", "H-A", "S-A", "H-2", "S-6", "H-3", "C-2", "D-A", "D-5", "C-J", "H-4", "S-9", "H-8", "C-4", "D-2", "D-K", "D-6", "D-9", "D-Q", "C-K", "C-Q", "H-6", "S-8", "S-10", "C-7", "C-10", "H-7", "D-10", "S-K"],

];

/**
 * Initialisiert vordefinierte Decks im Speicher und synchronisiert sie mit den Stats.
 * Nutzt die neuen DECK UTILS (SSOT) für Konvertierung und Validierung.
 */
function initializeHardcodedDecks() {
    // 1. Dubletten im Quell-Array prüfen (falls die Hilfsfunktion noch existiert)
    if (typeof checkAndValidateDecks === 'function') {
        checkAndValidateDecks();
    }

    let createdCount = 0;

    // hardcodedDecks ist das Array mit Strings wie ["S-A", "H-10", ...]
    hardcodedDecks.forEach((rawDeck, index) => {
        try {
            // Konvertierung des String-Formats ("S-2") in das neue Objekt-Format
            // Nutzt cardIdToObj aus den DECK UTILS
            const deckData = rawDeck.map(cardStr => {
                const cardObj = cardIdToObj(cardStr);

                if (!cardObj) {
                    throw new Error(`Ungültiges Karten-Format oder Symbol: ${cardStr}`);
                }

                // Optionale Validierung gegen deine neuen Standards
                validateCardData(cardObj, `Hardcoded Deck #${index + 1}`);

                return cardObj;
            });

            // Eindeutigen Key für das Deck erzeugen (SSOT via getDeckKey)
            const key = getDeckKey(deckData);

            // Nur anlegen, wenn das Deck noch nicht in den Statistiken existiert
            if (!kts.stats.decks[key]) {
                kts.stats.decks[key] = {
                    label: `Hardcoded Deck #${index + 1}`,
                    isHardcoded: true,
                    bestScore: 0,
                    bestMoves: Infinity,
                    bestTime: Infinity,
                    plays: 0,
                    wins: 0,
                    autoSolveCount: 0,
                    lastPlayed: null,
                    player: "Spieler 1",
                    history: []
                };

                console.log(
                    `%c✔ Hardcoded Deck #${index + 1} registriert`,
                    "color: #2ecc71;"
                );

                createdCount++;
            }
        } catch (e) {
            console.error(`Fehler in Hardcoded Deck #${index + 1}:`, e.message);
        }
    });

    // Logging über devLog (falls vorhanden) oder Standard-Console
    const logMsg = `Fertig: ${createdCount} neue Hardcoded Decks registriert`;
    if (typeof devLog === 'function') {
        devLog(`%c${logMsg}`, "color: #f1c40f; font-weight: bold;");
    } else {
        console.log(logMsg);
    }

    // Persistenz
    if (typeof saveToDisk === 'function') {
        saveToDisk();
    }
}

/**
 * Gibt das aktuelle Deck im gewünschten Format für das 'hardcodedDecks'-Array aus.
 */
async function printCurrentDeckForCode() {
    if (!currentInitialDeck || currentInitialDeck.length === 0) {
        console.warn("Kein aktives Deck gefunden.");
        return;
    }

    const formatted = currentInitialDeck.map(cardStr => {
        const parts = cardStr.split('-');
        const shortSuit = parts[0].charAt(0).toUpperCase();
        return `"${shortSuit}-${parts[1]}"`;
    });

    const codeSnippet = `[${formatted.join(", ")}],`;

    try {
        await navigator.clipboard.writeText(codeSnippet);
        console.group("--- 🃏 NEW HARDCODED DECK SNIPPET ---");
        console.log("Der folgende Code wurde in die Zwischenablage kopiert:");
        console.log(codeSnippet);
        console.groupEnd();

        showCustomInfo("Deck-Code wurde in die Zwischenablage kopiert!");
    } catch (err) {
        console.error("Fehler beim Kopieren:", err);
        // Fallback, falls Clipboard-API fehlschlägt (z.B. kein HTTPS)
        showCustomInfo("Code in Konsole (F12) ausgegeben (Kopieren fehlgeschlagen).");
    }
}

function checkDuplicateHardcodedDecks() { // nicht mehr benötigt, erweiterte function: checkAndValidateDecks()
    const seen = new Set();
    const duplicates = [];

    hardcodedDecks.forEach((deck, index) => {
        const deckString = deck.join(',');
        if (seen.has(deckString)) {
            duplicates.push(index + 1); // +1 für menschliche Zählweise
        } else {
            seen.add(deckString);
        }
    });

    if (duplicates.length > 0) {
        console.warn(`⚠️ Achtung: Doppelte Decks gefunden an Position: ${duplicates.join(', ')}`);
    } else {
        console.log("✅ Keine Dubletten in hardcodedDecks gefunden.");
    }
}

function checkAndValidateDecks() {
    const seen = new Set();
    const duplicates = [];
    const invalidSize = [];

    hardcodedDecks.forEach((deck, index) => {
        // Check auf Kartenanzahl
        if (deck.length !== 52) {
            invalidSize.push({ pos: index + 1, count: deck.length });
        }

        // Check auf Dubletten
        const deckString = deck.join(',');
        if (seen.has(deckString)) {
            duplicates.push(index + 1);
        } else {
            seen.add(deckString);
        }
    });

    if (duplicates.length > 0) {
        console.warn(`⚠️ Dubletten gefunden an Position: ${duplicates.join(', ')}`);
    }

    if (invalidSize.length > 0) {
        invalidSize.forEach(err => {
            console.error(`❌ Deck #${err.pos} ist ungültig: Hat ${err.count} statt 52 Karten!`);
        });
    }

    if (duplicates.length === 0 && invalidSize.length === 0) {
        console.log(`✅ Alle ${hardcodedDecks.length} Decks sind valide und einzigartig.`);
    }
}

function showCustomInfo(message) {
    // Entferne altes Overlay, falls vorhanden
    const old = document.getElementById('custom-info-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-info-overlay';
    overlay.innerHTML = `
        <div class="info-box">
            <p style="margin-bottom: 20px;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="btn-confirm-info" class="btn" style="background: #555;">Schließen</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-confirm-info').onclick = () => {
        overlay.remove();
    };
}