function renderSettings(contentElement, addFooterButton) {
    contentElement.innerHTML = `
        <h3 class="panel-section-title first-section">SPIEL-HILFEN</h3>
<div class="section-container small">
    <label class="ui-container toggle-container">
        <div class="ui-header">AUTO-ABLEGEN</div>
        <input type="checkbox" id="opt-autofoundation" checked>
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Zielstapel-Fokus</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container">
        <div class="ui-header">AUTO-FLIP</div>
        <input type="checkbox" id="opt-autoflip" checked>
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Karten drehen</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container">
        <div class="ui-header">AUTO-TIPPS</div>
        <input type="checkbox" id="opt-auto-hint" onchange="updateUIStates()" checked>
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Züge aufblinken</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container">
        <div class="ui-header">SMART-MOVE</div>
        <input type="checkbox" id="opt-smart-dblclick" checked>
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Doppelklick-Logik</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container">
        <div class="ui-header">ZEIT-ABZUG</div>
        <input type="checkbox" id="opt-timepenalty">
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">-2 Pkt / 10 Sek.</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>
</div>

<h3 class="panel-section-title">TIPPS</h3>
<div class="section-container small">
    <label class="ui-container toggle-container">
        <div class="ui-header">HINT-BULB ANZEIGEN</div>
        <input type="checkbox" id="opt-hint-bulb-visible" ${kts.cfg.showHintBulb ? 'checked' : ''}>
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Sichtbar</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container dev-only">
        <div class="ui-header">FAST-HINTS</div>
        <input type="checkbox" id="opt-hint-dev-speed" ${kts.cfg.devHintSpeed ? 'checked' : ''}
            onchange="updateUIStates()">
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Kein Timer</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>
</div>
<div class="section-container">
    <div class="setting-row"
        style="margin-top: 7px; justify-content: center; border: 1px solid rgba(255,215,0,0.4); border-radius: 8px;">
        <label>Tipp-Timer</label>
        <div style="display: flex; align-items: center; gap: 10px; margin-left: 12px;">
            <input type="range" id="opt-hint-delay" min="2000" max="30000" step="500" value="${kts.cfg.hintDelay}"
                class="kts-slider"
                oninput="document.getElementById('hint-val').innerText = (this.value/1000).toFixed(1) + 's'">
            <span id="hint-val" style="min-width: 40px;">${(kts.cfg.hintDelay / 1000).toFixed(1)}s</span>
        </div>
    </div>
</div>

<h3 class="panel-section-title">INFO BARS</h3>
<div class="section-container small">

    <label class="ui-container toggle-container">
        <div class="ui-header">INFO-BAR (LINKS)</div>
        <input type="checkbox" id="opt-bar-left-visible">
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Anzeigen</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <label class="ui-container toggle-container">
        <div class="ui-header">INFO-BAR (RECHTS)</div>
        <input type="checkbox" id="opt-bar-right-visible">
        <div class="ui-content toggle-content">
            <span class="toggle-label-text">Anzeigen</span>
            <div class="toggle-switch-slider"></div>
        </div>
    </label>

    <div class="dropdown-container header-style" id="select-bar-left-mode">
        <div class="ui-container toggle-container" onclick="toggleDropdown(this)">
            <div class="ui-header">BAR-MODUS</div>
            <div class="ui-content toggle-content">
                <span>AUTO</span>
                <div class="arrow-gold">
                    <svg width="9" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
        <div class="dropdown-options">
            <div class="option" data-value="auto" onclick="selectBoxOption(this)">
                Auto-Wechsel
            </div>
            <div class="option" data-value="player" onclick="selectBoxOption(this)">
                Spieler-Info
            </div>
            <div class="option" data-value="deck" onclick="selectBoxOption(this)">
                Deck-Info
            </div>
        </div>
    </div>

    <div class="dropdown-container header-style" id="select-bar-right-mode">
        <div class="ui-container toggle-container" onclick="toggleDropdown(this)">
            <div class="ui-header">BAR-MODUS</div>
            <div class="ui-content toggle-content">
                <span>PROGRESS</span>
                <div class="arrow-gold">
                    <svg width="9" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
        <div class="dropdown-options">
            <div class="option" data-value="progress" onclick="selectBoxOption(this)">
                XP-Bar
            </div>
            <div class="option" data-value="xp" onclick="selectBoxOption(this)">
                XP-Total
            </div>
        </div>
    </div>
</div>
<div class="section-container">
    <div class="setting-row"
        style="margin-top: 7px; justify-content: center; border: 1px solid rgba(255,215,0,0.4); border-radius: 8px;">
        <label>Auto-Wechsel Speed</label>
        <div style="display: flex; align-items: center; gap: 10px; margin-left: 12px;">
            <input type="range" id="opt-bar-interval" min="3000" max="30000" step="1000"
                value="${kts.cfg.barInterval || 15000}" class="kts-slider"
                oninput="document.getElementById('interval-val').innerText = (this.value/1000).toFixed(0) + 's'">
            <span id="interval-val" style="min-width: 40px;">${((kts.cfg.barInterval || 15000) /
            1000).toFixed(0)}s</span>
        </div>
    </div>
</div>

<h3 class="panel-section-title">DECK</h3>
<div class="section-container small">
    <div class="ui-container" id="container-specific-deck">
        <div class="ui-header">DECK-AUSWAHL</div>
        <select id="select-specific-deck" class="ui-content select-style">
        </select>
    </div>

    <div class="ui-container">
        <div class="ui-header">DECK-QUELLE</div>
        <select id="select-deck" class="ui-content select-style" onchange="updateUIStates()">
            <option value="deck-hardcoded">Lösbar</option>
            <option value="deck-generated">Zufall</option>
        </select>
    </div>


    <button class="ui-container btn-container danger-style" style="margin-top: 5px; height: 35px;"
        onclick="deleteSelectedDeck()">
        <div class="ui-content btn-content" style="font-size: 0.8em;">🗑️ DIESES DECK LÖSCHEN</div>
    </button>
</div>

<h3 class="panel-section-title">DESIGN</h3>
<div class="section-container small">
    <div class="ui-container">
        <div class="ui-header">KARTEN-RÜCKEN</div>
        <select id="select-back" onchange="applyDesign()" class="ui-content select-style">
            <optgroup label="Klassisch">
                <option value="design-standard">Blaue Streifen</option>
                <option value="design-red">Rote Streifen</option>
                <option value="design-green">Grüne Streifen</option>
                <option value="design-purple">Lila Streifen</option>
                <option value="design-orange">Orange Streifen</option>
                <option value="design-teal">Türkis Streifen</option>
            </optgroup>
            <optgroup label="Modern">
                <option value="design-dot">Punkte</option>
                <option value="design-stripes-fine">Feine Streifen</option>
                <option value="design-wave">Wellen</option>
                <option value="design-diagonal-lines">Transparente Linien</option>
            </optgroup>
        </select>
    </div>

    <div class="ui-container">
        <div class="ui-header">KARTEN-FRONT</div>
        <select id="select-front" onchange="applyDesign()" class="ui-content select-style">
            <option value="front-standard">Standard</option>
            <option value="front-classic">Vintage</option>
        </select>
    </div>
</div>

<h3 class="panel-section-title">SPIELER-PROFIL</h3>
<div class="section-container">
    <div class="ui-container">
        <div class="ui-header">SPIELERNAME</div>
        <input type="text" id="player-name-input" class="ui-content input-style" placeholder="DEIN NAME...">
    </div>
</div>

<h3 class="panel-section-title">AUDIO</h3>
<div class="section-container">
    <div class="setting-row">
        <label>Töne stummschalten</label>
        <input type="checkbox" id="opt-audio-mute" class="kts-checkbox" onchange="toggleMute(this.checked)">
    </div>

    <div class="setting-row">
        <label>Effekt-Lautstärke</label>
        <input type="range" id="opt-audio-vol" min="0" max="1" step="0.05" class="kts-slider"
            oninput="previewVolume(this.value)">
    </div>
</div>

<h3 class="panel-section-title">SYSTEM</h3>
<div class="section-container small">
    <button class="ui-container btn-container" onclick="exportStorageAsJSON()">
        <div class="ui-content btn-content">💾 EXPORT</div>
    </button>
    <button class="ui-container btn-container" onclick="importStorageFromJSON()">
        <div class="ui-content btn-content">📂 IMPORT</div>
    </button>
    <button class="ui-container btn-container" onclick="printCurrentDeckForCode()">
        <div class="ui-content btn-content">🃏 CODE</div>
    </button>
    <button class="ui-container btn-container danger-style" onclick="resetStatsOnly()">
        <div class="ui-content btn-content">⚠️ RESET</div>
    </button>
</div>
    `;

    addFooterButton("ZURÜCK", () => closePanel('base-panel-id'));
    addFooterButton("SPEICHERN", () => {
        saveSettings();
        closePanel('base-panel-id');
    });

    loadSettings();
}

function loadSettings() {
    const ids = {
        'opt-autofoundation': 'autoFoundation',
        'opt-autoflip': 'autoFlip',
        'opt-auto-hint': 'autoHint',
        'opt-smart-dblclick': 'smartDblClick',
        'opt-timepenalty': 'timePenalty'
    };

    // Checkboxen sicher laden
    for (let id in ids) {
        let el = document.getElementById(id);
        if (el) {
            el.checked = kts.cfg[ids[id]];
        }
    }

    // Select-Felder sicher laden
    const selects = ['select-back', 'select-front', 'select-deck'];
    selects.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            // Mapping für kts.cfg Namen falls sie abweichen
            let configKey = id === 'select-back' ? 'designBack' :
                id === 'select-front' ? 'designFront' : 'deckSource';
            el.value = kts.cfg[configKey] || '';
        }
    });

    lastSavedSettings = (kts.cfg.designBack || '') + (kts.cfg.designFront || '');

    // Spielername
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
        nameInput.value = kts.game.player.name || '';
    }

    // Audio-Einstellungen
    document.getElementById('opt-audio-mute').checked = kts.cfg.audio.mute;
    document.getElementById('opt-audio-vol').value = kts.cfg.audio.volEffects;

    // --- DECK QUELLEN & SPEZIFISCHE DECKS ---
    const deckSourceSelect = document.getElementById('select-deck');
    if (deckSourceSelect) {
        deckSourceSelect.value = kts.cfg.deckSource || 'deck-hardcoded';
    }

    const specificDeckSelect = document.getElementById('select-specific-deck');
    if (specificDeckSelect) {
        specificDeckSelect.innerHTML = ''; // Leeren

        // Standard-Option
        const defaultOpt = document.createElement('option');
        defaultOpt.value = "none";
        defaultOpt.innerText = "Letztes / Standard";
        specificDeckSelect.appendChild(defaultOpt);

        // Alle Decks aus den Stats laden
        if (kts.stats.decks) {
            Object.keys(kts.stats.decks).forEach(deckId => {
                const deckData = kts.stats.decks[deckId];
                const opt = document.createElement('option');
                opt.value = deckId;
                // Zeige Label (z.B. "Dibbi Dabbi") oder Fallback auf ID-Ausschnitt
                opt.innerText = deckData.label || deckId.substring(0, 15) + "...";
                specificDeckSelect.appendChild(opt);
            });
        }

        // Gespeichertes Deck auswählen
        specificDeckSelect.value = kts.cfg.pinnedDeckId || "none";
    }

    //--- INFO BARS ---//
    // 1. Sichtbarkeit
    document.getElementById('opt-bar-left-visible').checked = kts.cfg.barLeftVisible ?? true;
    document.getElementById('opt-bar-right-visible').checked = kts.cfg.barRightVisible ?? true;

    // 2. Anzeige-Modus (linke Bar)
    const leftMode = kts.cfg.barLeftMode || 'auto';
    const leftDropdown = document.getElementById('select-bar-left-mode');
    if (leftDropdown) {
        leftDropdown.setAttribute('data-selected-value', leftMode);
        // Text im Header anpassen (Mapping von Value zu Label)
        const labels = { 'auto': 'Auto-Wechsel', 'player': 'Spieler-Info', 'deck': 'Deck-Info' };
        leftDropdown.querySelector('.ui-content span').innerText = labels[leftMode];
    }

    // 3. Anzeige-Modus (rechte Bar)
    const rightMode = kts.cfg.barRightMode || 'progress';
    const rightDropdown = document.getElementById('select-bar-right-mode');
    if (rightDropdown) {
        rightDropdown.setAttribute('data-selected-value', rightMode);
        const labels = { 'progress': 'XP-Bar', 'xp': 'XP-Total' };
        rightDropdown.querySelector('.ui-content span').innerText = labels[rightMode];
    }

    // 4. Anzeigenwechsel Wartezeit
    const intervalSlider = document.getElementById('opt-bar-interval');
    if (intervalSlider) {
        intervalSlider.value = kts.cfg.barInterval;
        document.getElementById('interval-val').innerText = (kts.cfg.barInterval / 1000).toFixed(0) + 's';
    }

    //--- TIPPS ---//
    // 1. Hint-Bulb anzeigen
    const bulbCheck = document.getElementById('opt-hint-bulb-visible');
    if (bulbCheck) bulbCheck.checked = kts.cfg.showHintBulb;

    // 2. Hint-Timer deaktivieren
    const timerDeactivate = document.getElementById('opt-hint-dev-speed')
    if (timerDeactivate) timerDeactivate.checked = kts.cfg.devHintSpeed;

    // 3. Hint-Delay Dauer
    const hintSlider = document.getElementById('opt-hint-delay');
    if (hintSlider) {
        hintSlider.value = kts.cfg.hintDelay;
        document.getElementById('hint-val').innerText = (kts.cfg.hintDelay / 1000).toFixed(1) + 's';
    }

    // Am Ende: Abhängigkeiten prüfen
    updateUIStates();
}

function saveSettings() {
    // Vorherige Werte merken, um Änderung festzustellen
    const oldSource = kts.cfg.deckSource;
    const oldPinned = kts.cfg.pinnedDeckId;

    // Neue Werte aus der UI holen
    const selectDeck = document.getElementById('select-deck');
    const selectSpecific = document.getElementById('select-specific-deck');

    if (selectDeck) kts.cfg.deckSource = selectDeck.value;
    if (selectSpecific) kts.cfg.pinnedDeckId = selectSpecific.value;

    // 1. Sicherheits-Check: Prüfen, ob wir überhaupt im Einstellungs-Menü sind
    const mainCheck = document.getElementById('opt-autofoundation');
    if (!mainCheck) {
        console.warn("Speichern abgebrochen: Einstellungs-Elemente nicht gefunden.");
        return;
    }

    // 2. Checkboxen verarbeiten (Mapping ID -> Config-Key)
    const checkboxes = {
        'opt-autofoundation': 'autoFoundation',
        'opt-autoflip': 'autoFlip',
        'opt-auto-hint': 'autoHint',
        'opt-smart-dblclick': 'smartDblClick',
        'opt-timepenalty': 'timePenalty'
    };

    for (let [id, configKey] of Object.entries(checkboxes)) {
        const el = document.getElementById(id);
        if (el) {
            kts.cfg[configKey] = el.checked;
        }
    }

    // 4. Spielername
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
        const newName = nameInput.value.trim() || 'Unbekannt';
        const oldName = kts.game.player.name;

        // Nur loggen, wenn der Name anders ist
        if (newName !== oldName) {
            console.log(`👤 Spieler-Name geändert zu: ${newName}`);
            kts.game.player.name = newName;
        }
    }

    // 5. Audio-Einstellungen
    const muteEl = document.getElementById('opt-audio-mute');
    const volEl = document.getElementById('opt-audio-vol');

    if (muteEl) kts.cfg.audio.mute = muteEl.checked;
    if (volEl) kts.cfg.audio.volEffects = parseFloat(volEl.value);

    //--- DECK DESIGN ---//
    // 3. Select-Felder verarbeiten
    const selectBack = document.getElementById('select-back');
    const selectFront = document.getElementById('select-front');

    if (selectBack) kts.cfg.designBack = selectBack.value;
    if (selectFront) kts.cfg.designFront = selectFront.value;

    //--- INFO BARS ---//
    // 1. Sichtbarkeit
    kts.cfg.barLeftVisible = document.getElementById('opt-bar-left-visible').checked;
    kts.cfg.barRightVisible = document.getElementById('opt-bar-right-visible').checked;

    // 2. Anzeige-Modus (linke Bar)
    const leftModeDropdown = document.getElementById('select-bar-left-mode');
    if (leftModeDropdown) kts.cfg.barLeftMode = leftModeDropdown.getAttribute('data-selected-value') || 'auto';

    // 3. Anzeige-Modus (rechte Bar)
    const rightModeDropdown = document.getElementById('select-bar-right-mode');
    if (rightModeDropdown) kts.cfg.barRightMode = rightModeDropdown.getAttribute('data-selected-value') || 'progress';

    // 4. Anzeigenwechsel Wartezeit
    const intervalSlider = document.getElementById('opt-bar-interval');
    if (intervalSlider) kts.cfg.barInterval = parseInt(intervalSlider.value);


    //--- TIPPS ---//
    // 1. Hint-Bulb anzeigen
    const bulbCheck = document.getElementById('opt-hint-bulb-visible');
    if (bulbCheck) kts.cfg.showHintBulb = bulbCheck.checked;

    // 2. Hint-Delay Dauer
    const timerDeactivate = document.getElementById('opt-hint-dev-speed')
    if (timerDeactivate) kts.cfg.devHintSpeed = timerDeactivate.checked;

    // 3. Hint-Delay Dauer
    const hintSlider = document.getElementById('opt-hint-delay');
    if (hintSlider) kts.cfg.hintDelay = parseInt(hintSlider.value);

    // UI sofort aktualisieren
    applyBarSettings();
    updateUIStates();

    // 7. Daten dauerhaft speichern (LocalStorage / File)
    saveToDisk();

    if (IS_DEV_MODE) {
        console.log("Einstellungen im localStorage gespeichert.");
    }

    // 8. NEU: Prüfen, ob ein Neustart erforderlich ist
    const sourceChanged = (oldSource !== kts.cfg.deckSource);
    const pinnedChanged = (oldPinned !== kts.cfg.pinnedDeckId);

    if (sourceChanged || pinnedChanged) {
        devLog("Deck-Konfiguration geändert. Starte neues Spiel...");

        // Timeout, damit das Panel Zeit hat zu schließen, bevor die Animation startet
        setTimeout(() => {
            // Neues Spiel mit gewählter Deck-Art starten (Zufall oder Hardcoded)
            newGame();
        }, 300);
    }
}

let previewDebounce;
function previewVolume(val) {
    // 1. Wert temporär in der Config setzen (noch nicht speichern)
    kts.cfg.audio.volEffects = parseFloat(val);

    // 2. Debounce: Damit nicht bei jedem Millimeter Schieben 100 Sounds kommen
    clearTimeout(previewDebounce);
    previewDebounce = setTimeout(() => {
        playStartSound(); // Kurzer Test-Klick
    }, 50);
}

/**
 * Steuert die Deaktivierung von Slidern basierend auf anderen Einstellungen
 */
function updateUIStatesOLD() {
    // 1. Bar-Interval Slider (nur aktiv wenn 'auto' Modus)
    const leftMode = document.getElementById('select-bar-left-mode')?.getAttribute('data-selected-value');
    const intervalSlider = document.getElementById('opt-bar-interval');
    if (intervalSlider) {
        const isAuto = (leftMode === 'auto');
        intervalSlider.disabled = !isAuto;
        // Optisches Feedback: Ganze Reihe ausgrauen
        intervalSlider.closest('.setting-row').style.opacity = isAuto ? "1" : "0.4";
        intervalSlider.closest('.setting-row').style.pointerEvents = isAuto ? "auto" : "none";
    }

    // 2. Hint-Timer Slider (deaktiviert wenn Dev-Speed an ist)
    const isDevSpeed = document.getElementById('opt-hint-dev-speed')?.checked;
    const hintSlider = document.getElementById('opt-hint-delay');
    if (hintSlider) {
        const canAdjust = !isDevSpeed;
        hintSlider.disabled = !canAdjust;
        hintSlider.closest('.setting-row').style.opacity = canAdjust ? "1" : "0.4";
        hintSlider.closest('.setting-row').style.pointerEvents = canAdjust ? "auto" : "none";
    }
}

function updateUIStates() {
    // --- 1. Abhängigkeit: AUTO-HINTS (Master-Switch für Tipps) ---
    const autoHintActive = document.getElementById('opt-auto-hint')?.checked;

    // Wir greifen uns die Elemente der Tipps-Sektion
    //const bulbCheckbox = document.getElementById('opt-hint-bulb-visible');
    const devSpeedCheck = document.getElementById('opt-hint-dev-speed');
    const hintSlider = document.getElementById('opt-hint-delay');
    /*
    if (bulbCheckbox) {
        const bulbContainer = bulbCheckbox.closest('.ui-container');

        if (!autoHintActive) {
            bulbCheckbox.checked = false; // Bulb-Anzeige erzwingen auf false
            bulbContainer.style.opacity = "0.4";
            bulbContainer.style.pointerEvents = "none";
            kts.cfg.showHintBulb = false;
        } else {
            // Wert aus der Config wiederherstellen, wenn wieder aktiviert wird
            bulbCheckbox.checked = kts.cfg.showHintBulb;
            bulbContainer.style.opacity = "1";
            bulbContainer.style.pointerEvents = "auto";
        }
    }*/

    // Dev-Speed Toggle und Slider-Sektion ebenfalls ausgrauen, wenn Auto-Hint aus ist
    if (devSpeedCheck) {
        const devContainer = devSpeedCheck.closest('.ui-container');
        devContainer.style.opacity = autoHintActive ? "1" : "0.4";
        devContainer.style.pointerEvents = autoHintActive ? "auto" : "none";
    }

    // --- 2. Hint-Timer Slider (Abhängig von Auto-Hint UND Dev-Speed) ---
    if (hintSlider) {
        const isDevSpeed = devSpeedCheck?.checked;
        // Slider nur aktiv, wenn Tipps an SIND und Dev-Speed AUS ist
        const canAdjust = autoHintActive && !isDevSpeed;

        hintSlider.disabled = !canAdjust;
        const sliderRow = hintSlider.closest('.setting-row');
        sliderRow.style.opacity = canAdjust ? "1" : "0.4";
        sliderRow.style.pointerEvents = canAdjust ? "auto" : "none";
    }

    // --- 3. Bar-Interval Slider (nur aktiv wenn 'auto' Modus) ---
    const leftMode = document.getElementById('select-bar-left-mode')?.getAttribute('data-selected-value');
    const intervalSlider = document.getElementById('opt-bar-interval');
    if (intervalSlider) {
        const isAuto = (leftMode === 'auto');
        intervalSlider.disabled = !isAuto;
        const barRow = intervalSlider.closest('.setting-row');
        barRow.style.opacity = isAuto ? "1" : "0.4";
        barRow.style.pointerEvents = isAuto ? "auto" : "none";
    }
    // TIPP Bulb Sichtbarkeit ändern
    hintUI.setVisibility(kts.cfg.showHintBulb);

    const deckSource = document.getElementById('select-deck')?.value;
    const specificContainer = document.getElementById('container-specific-deck');

    if (specificContainer) {
        // Nur bei "Lösbar" anzeigen, da Zufallsdecks keine feste ID zum Vorwählen haben
        const isHardcoded = (deckSource === 'deck-hardcoded');
        specificContainer.style.opacity = isHardcoded ? "1" : "0.4";
        specificContainer.style.pointerEvents = isHardcoded ? "auto" : "none";
    }

    const oldPinned = kts.cfg.pinnedDeckId;
    const selectSpecific = document.getElementById('select-specific-deck');
    const newPinned = selectSpecific ? selectSpecific.value : "none";

    saveToDisk();
}

function deleteSelectedDeck() {
    const select = document.getElementById('select-specific-deck');
    const deckId = select.value;

    // "none" (Standard) darf nicht gelöscht werden
    if (!deckId || deckId === "none") {
        alert("Bitte wähle zuerst ein gespeichertes Deck aus.");
        return;
    }

    const deckLabel = kts.stats.decks[deckId]?.label || "dieses Deck";

    // Sicherheitsabfrage
    if (confirm(`Möchtest du das Deck "${deckLabel}" wirklich unwiderruflich löschen?`)) {

        // 1. Aus dem Speicher-Objekt entfernen
        delete kts.stats.decks[deckId];

        // 2. Falls das gelöschte Deck gerade als "gepinnt" markiert war, zurücksetzen
        if (kts.cfg.pinnedDeckId === deckId) {
            kts.cfg.pinnedDeckId = "none";
        }

        // 3. Dauerhaft speichern
        saveToDisk();

        // 4. UI aktualisieren (Dropdown neu füllen)
        loadSettings();

        console.log(`%c🗑️ Deck gelöscht: ${deckLabel}`, "color: #ff4d4d;");
        showGameMsg("DECK GELÖSCHT");
    }
}