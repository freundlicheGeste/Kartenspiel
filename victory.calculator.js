/* =====================================================
   VICTORY CALCULATOR
   Verantwortlich für: Siegbonus-Berechnungen (Speed,
   Time, Purist), Session-Stats (Combo-Zähler).
   SSOT — alle Sieg-Boni werden ausschließlich hier
   berechnet. executeWinSequence() in app_core.js
   liest nur noch aus diesem Modul.
   Abhängigkeiten: keine
===================================================== */

/* =====================================================
   SESSION STATS  (Combo-Tracking pro Spiel)
   Wird von resetSessionStats() (scoring_system.js)
   und processCombo() gemeinsam genutzt.
===================================================== */

/**
 * Akkumulierte Combo-Statistiken der laufenden Spielsitzung.
 * SSOT — wird von processCombo() beschrieben und von
 * executeWinSequence() gelesen.
 */
const sessionStats = {
    flipComboCount: 0,
    flipComboPoints: 0,
    foundationComboCount: 0,
    foundationComboPoints: 0,
};

/**
 * Setzt sessionStats auf Null — wird von resetSessionStats()
 * in scoring_system.js aufgerufen.
 */
function resetSessionStatsData() {
    sessionStats.flipComboCount = 0;
    sessionStats.flipComboPoints = 0;
    sessionStats.foundationComboCount = 0;
    sessionStats.foundationComboPoints = 0;
}

/* =====================================================
   VICTORY CALCULATOR
===================================================== */

/**
 * Berechnet alle Sieg-Boni.
 * Statisches Objekt — keine Instanz nötig.
 */
const VictoryCalculator = Object.freeze({

    /**
     * Speed-Bonus: je schneller, desto mehr Punkte.
     * Unter 60s: 500, unter 120s: 300, unter 300s: 150, sonst 0.
     * @param {number} seconds
     * @returns {number}
     */
    getSpeedBonus(seconds) {
        if (seconds <= 0 || isNaN(seconds)) return 0;
        if (seconds < 60) return 300;
        if (seconds < 120) return 150;
        if (seconds < 145) return 100;
        return 0;
    },

    /**
     * Time-Bonus: lineare Abnahme von 200 auf 0 über 10 Minuten.
     * @param {number} seconds
     * @returns {number}
     */
    getTimeBonus(seconds) {
        if (seconds <= 0 || isNaN(seconds)) return 0;
        /*const maxTime = 600; // 10 Minuten
        return Math.max(0, Math.floor(200 * (1 - seconds / maxTime)));*/
        return seconds > 0 ? Math.floor(400000 / seconds) : 0;
    },

    /**
     * Purist-Bonus: Punkte wenn keine Auto-Hilfen genutzt wurden.
     * @param {{ autoFoundation: boolean, autoFlip: boolean, autoHint: boolean }} cfg
     * @returns {number}
     */
    getPuristBonus({ autoFoundation, autoFlip, autoHint }) {
        const allDisabled = !autoFoundation && !autoFlip && !autoHint;
        return allDisabled ? getScoreValue(PointType.BONUS, BONUS.PURIST_BONUS) : 0;
    },
});
