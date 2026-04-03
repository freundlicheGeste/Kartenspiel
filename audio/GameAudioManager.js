/**
 * Trennung:
 * STATE (Logik)
 * UI (Darstellung)
 */



/**
 * Setzt oder toggelt den Mute-Zustand.
 *
 * @param {boolean|null} [isMuted=null]
 * @returns {boolean} Neuer Mute-Status
 */
function setMuteState(isMuted = null) {
    if (isMuted === null) {
        kts.cfg.audio.mute = !kts.cfg.audio.mute;
    } else {
        kts.cfg.audio.mute = isMuted;
    }

    const muteState = kts.cfg.audio.mute;

    if (!muteState) {
        sounds.success();
    }

    return muteState;
}

/**
 * Aktualisiert die UI basierend auf dem Mute-Zustand.
 *
 * @param {boolean} isMuted
 */
function updateMuteUI(isMuted) {
    const muteCheck = document.getElementById('opt-audio-mute');
    if (muteCheck) {
        muteCheck.checked = isMuted;
    }

    const volSlider = document.getElementById('opt-audio-vol');
    if (volSlider) {
        volSlider.disabled = isMuted;
        volSlider.style.opacity = isMuted ? "0.3" : "1";
    }
}

/**
 * Kombinierte Komfort-Funktion (optional)
 */
function toggleMute(isMuted = null) {
    const state = setMuteState(isMuted);
    updateMuteUI(state);
}

/**
 * Steuert den Mute-Zustand der Audio-Einstellungen und synchronisiert die UI.
 *
 * Wenn kein Parameter übergeben wird, wird der aktuelle Mute-Status umgeschaltet (Toggle).
 * Wird ein Boolean übergeben, wird der Mute-Status explizit gesetzt.
 *
 * Zusätzlich werden folgende UI-Elemente aktualisiert:
 * - Checkbox (#opt-audio-mute)
 * - Lautstärke-Slider (#opt-audio-vol), inkl. deaktiviertem Zustand und visueller Darstellung
 *
 * Beim Entmuten wird ein Bestätigungssound abgespielt.
 *
 * @function toggleMute
 * @param {boolean|null} [isMuted=null] - Optionaler Zielzustand:
 *   - `true` → Audio wird stummgeschaltet
 *   - `false` → Audio wird aktiviert
 *   - `null` oder nicht gesetzt → aktueller Zustand wird umgeschaltet
 *
 * @returns {void}
 */
function toggleMute_BEIDES_IN_EINEM(isMuted = null) {
    // Wenn kein Wert übergeben wird → toggle
    if (isMuted === null) {
        kts.cfg.audio.mute = !kts.cfg.audio.mute;
    } else {
        kts.cfg.audio.mute = isMuted;
    }

    const muteState = kts.cfg.audio.mute;

    // Checkbox synchronisieren
    const muteCheck = document.getElementById('opt-audio-mute');
    if (muteCheck) {
        muteCheck.checked = muteState;
    }

    // Volume-Slider UI anpassen
    const volSlider = document.getElementById('opt-audio-vol');
    if (volSlider) {
        volSlider.disabled = muteState;
        volSlider.style.opacity = muteState ? "0.3" : "1";
    }

    // Sound nur abspielen, wenn unmuted
    if (!muteState) {
        sounds.success();
    }
}