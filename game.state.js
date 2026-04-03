/* =====================================================
   GAME STATE MANAGER
   SSOT für: Spielzustände, State-Übergänge, Listener.
   Das veraltete gameLog()-System wurde entfernt —
   Logging läuft ausschließlich über gameState.set().
   Abhängigkeiten: keine
===================================================== */

/* =====================================================
   ENUM
   Nur echte Zustände — Events sind keine Zustände.
   Aktive Zustände: IDLE, GESTARTET, RUNNING, PAUSIERT,
                    GAME_OVER, BEENDET, DEMO, RECORDING
   Archiviert (nicht aktiv genutzt, aber reserviert):
   NEUGESTARTET, REPLAY, FORTGESETZT, INITIALISIERT,
   LEVEL_WECHSEL, SPEICHERN, LADEN
===================================================== */
const GameStates = Object.freeze({
    // --- Aktiv genutzte Zustände ---
    IDLE:        'IDLE',
    GESTARTET:   'GESTARTET',
    RUNNING:     'RUNNING',
    PAUSIERT:    'PAUSIERT',
    GAME_OVER:   'GAME_OVER',
    BEENDET:     'BEENDET',
    DEMO:        'DEMO',
    RECORDING:   'RECORDING',

    // --- Reserviert / zukünftig ---
    INITIALISIERT: 'INITIALISIERT',
    FORTGESETZT:   'FORTGESETZT',
    NEUGESTARTET:  'NEUGESTARTET',
    REPLAY:        'REPLAY',
    LEVEL_WECHSEL: 'LEVEL_WECHSEL',
    SPEICHERN:     'SPEICHERN',
    LADEN:         'LADEN',
});

/* =====================================================
   CONSOLE-STYLES (SSOT)
===================================================== */
const _gameStateStyles = {
    IDLE:          'color: #95a5a6; font-weight: bold;',
    GESTARTET:     'color: #27ae60; font-weight: bold;',
    RUNNING:       'color: #3498db; font-weight: bold;',
    PAUSIERT:      'color: #f39c12; font-weight: bold;',
    GAME_OVER:     'color: #e67e22; font-weight: bold;',
    BEENDET:       'color: #c0392b; font-weight: bold;',
    DEMO:          'color: #9b59b6; font-weight: bold;',
    RECORDING:     'color: #e74c3c; font-weight: bold;',
    INITIALISIERT: 'color: #8e44ad; font-weight: bold;',
    FORTGESETZT:   'color: #2ecc71; font-weight: bold;',
    NEUGESTARTET:  'color: #16a085; font-weight: bold;',
    REPLAY:        'color: #2980b9; font-weight: bold;',
    LEVEL_WECHSEL: 'color: #d35400; font-weight: bold;',
    SPEICHERN:     'color: #1abc9c; font-weight: bold;',
    LADEN:         'color: #3498db; font-weight: bold;',
};

/* =====================================================
   STATE MANAGER
===================================================== */
const gameState = {
    current:   GameStates.IDLE,
    previous:  null,
    logs:      [],
    listeners: [],

    /**
     * Setzt einen neuen Spielzustand.
     * Validiert gegen GameStates-Enum, loggt in die Konsole
     * und benachrichtigt alle registrierten Listener.
     * @param {string} state  - Einer der GameStates-Werte
     * @param {string} [msg]  - Optionale Nachricht für den Log
     */
    set(state, msg = '') {
        if (!Object.values(GameStates).includes(state)) {
            console.warn('[gameState.set] Ungültiger State:', state);
            return;
        }

        this.previous = this.current;
        this.current  = state;

        const logMsg = `🎮 [Spiel-Status: ${state}]${msg ? ' ' + msg : ''}`;
        const style  = _gameStateStyles[state] || 'color: white;';

        console.log(`%c${logMsg}`, style);
        this.logs.push(logMsg);

        this.listeners.forEach(cb => cb(state, logMsg));
    },

    /**
     * Prüft ob der aktuelle State dem übergebenen entspricht.
     * @param {string} state
     * @returns {boolean}
     */
    is(state) {
        return this.current === state;
    },

    /**
     * Prüft ob der vorherige State dem übergebenen entspricht.
     * @param {string} state
     * @returns {boolean}
     */
    was(state) {
        return this.previous === state;
    },

    /**
     * Gibt den vorherigen State zurück.
     * @returns {string|null}
     */
    getPrevious() {
        return this.previous;
    },

    /**
     * Registriert einen Listener der bei jedem State-Wechsel aufgerufen wird.
     * @param {function(state: string, log: string): void} callback
     */
    onChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    },
};
