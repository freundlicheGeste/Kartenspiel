/* ==========================================================================
   PANEL CONTROLS (Bedienung)
   ========================================================================== */

// AUSWAHLMENÜ STEUERUNG
// Dropdown Ein-/Ausblenden
function toggleDropdown(element) {
    const parent = element.parentElement;
    const isOpen = parent.classList.contains('open');

    if (isOpen) {
        // Wenn es offen ist -> Schließen und Reset
        closeAllDropdowns();
    } else {
        // Wenn es zu ist -> erst alle anderen schließen/resetten, dann dieses öffnen
        closeAllDropdowns();
        parent.classList.add('open');
    }
}

// Dropdown-Schließen (Zentrale Funktion zum Schließen UND Resetten)
function closeAllDropdowns() {
    // Wir nehmen ALLE Dropdowns, nicht nur die mit .open, 
    // um sicherzugehen, dass der Scrollzustand IMMER bereinigt wird.
    document.querySelectorAll('.dropdown-container').forEach(container => {
        const optionsList = container.querySelector('.dropdown-options');

        // WICHTIG: Erst scrollen, solange es noch sichtbar sein könnte
        if (optionsList) {
            optionsList.scrollTop = 0;
        }

        // Dann erst die Klasse entfernen, die display: none auslöst
        container.classList.remove('open');
    });
}

// Dropdown-Auswahl (Header Box)
function selectBoxOption(element) {
    const container = element.closest('.dropdown-container');
    const value = element.getAttribute('data-value');
    const text = element.innerText;

    // Text im Header aktualisieren
    container.querySelector('.ui-content span').innerText = text;

    // Den Wert als data-attribute am Container speichern
    container.setAttribute('data-selected-value', value);

    // Alles schließen und Scroll-Positionen nullen
    closeAllDropdowns();

    // Im Settings Panel alle Werte setzen
    updateUIStates();

    if (IS_DEV_MODE) {
        console.log("Dropdown Auswahl: ", value);
    }
}

// Dropdown globaler Klick-Handler
window.addEventListener('click', function (event) {
    // Wenn der Klick NICHT auf ein Dropdown oder dessen Inhalt erfolgt
    if (!event.target.closest('.dropdown-container')) {
        closeAllDropdowns();
    }
});

/* ==========================================================================
   Panel Controls - Beispiel-Panel
   ========================================================================== */

// Beispiel aller panelControls
function renderPanelControls(contentElement, addFooterButton) {

    contentElement.innerHTML = `
    <!-- SECTION FULL -->
                <h3 class="panel-section-title first-section">VOLLE BREITE</h3>
                <div class="section-container">
                    <!-- TEXT (FULL) -->
                    <div class="ui-container">
                        <div class="ui-header">SPIELREGELN</div>
                        <div class="ui-content textbox-content">
                            Setze deinen Einsatz und ziehe eine Karte. <strong>Goldene Karten</strong> zählen doppelt!
                            Erreiche Level 10, um den <em>Großmeister-Rang</em> freizuschalten.
                        </div>
                    </div>
                    <!-- TEXT (FULL) -->

                    <!-- AUSKLAPPTEXT (FULL) -->
                    <div class="ui-container" onclick="this.classList.toggle('open')">
                        <div class="accordion-group">
                            <div class="ui-header accordion-header" style="border-bottom: none;">SPIELANLEITUNG
                                (Klapptext)
                            </div>
                            <div class="arrow-gold">▼</div>
                        </div>
                        <div class="ui-content accordion-content">
                            Hier stehen die erweiterten Regeln. Diese Sektion spart Platz im Hauptmenü
                            und öffnet sich mit einer geschmeidigen Animation.
                        </div>
                    </div>
                    <!-- AUSKLAPPTEXT (FULL) -->

                    <!-- STATUS TABELLE (FULL) -->
                    <div class="ui-container">
                        <div class="ui-header">LEVEL PROGRESS</div>
                        <div class="status-row reverse">
                            <div class="status-cell status-value">+876</div>
                            <div class="ui-content">
                                <div class="progress-container">
                                    <div class="progress-fill" style="width: 75%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="ui-container">
                        <div class="ui-header">AKTIVE BONI</div>
                        <div class="status-row">
                            <div class="ui-content">Karte aufdecken</div>
                            <div class="status-cell status-value highlight-green">+2</div>
                        </div>
                    </div>
                    <!-- STATUS TABELLE (FULL) -->

                    <!-- TABELLE (FULL) -->
                    <div class="ui-container">
                        <div class="table-grid-header">
                            <div>DATUM</div>
                            <div>SPIEL</div>
                            <div>GEWINN</div>
                        </div>

                        <div class="table-grid-row">
                            <div>01.03.</div>
                            <div>Blackjack Pro</div>
                            <div class="highlight-green">+500 G</div>
                        </div>

                        <div class="table-grid-row">
                            <div>28.02.</div>
                            <div>Mega Slots</div>
                            <div class="highlight-gold">+1.200 G</div>
                        </div>

                        <div class="table-grid-row">
                            <div>27.02.</div>
                            <div>Poker Table</div>
                            <div class="highlight-red">-200 G</div>
                        </div>
                    </div>
                    <!-- TABELLE (FULL) -->
                    <!-- REWARDS -->
                    <h3 class="panel-section-title">ERFOLGE</h3>
                    <div class="section-container">
                        <div class="reward-list">

                            <div class="reward-plate unlocked">
                                <div class="reward-icon">🏆</div>
                                <div class="reward-content">
                                    <div class="reward-title">Großmeister</div>
                                    <div class="reward-desc">Erreiche Level 10 in einer Woche.</div>
                                    <div class="reward-status">FREIGESCHALTET</div>
                                </div>
                            </div>

                            <div class="reward-plate locked"
                                onclick="this.classList.add('shake-it'); setTimeout(()=>this.classList.remove('shake-it'),400)">
                                <div class="reward-icon">💎</div>
                                <div class="reward-content">
                                    <div class="reward-title">High Roller</div>
                                    <div class="reward-desc">Setze insgesamt 10.000 Gold ein.</div>
                                    <div class="reward-status">GESPERRT</div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <!-- REWARDS -->
                </div>
                <!-- SECTION FULL -->


                <!-- SECTION SMALL -->
                <h3 class="panel-section-title">HALBE BREITE</h3>
                <div class="section-container small">
                    <!-- AUSWAHLMENÜS -->
                    <div class="dropdown-container header-style" id="cardBackHeaderDropdown">
                        <div class="ui-container toggle-container" onclick="toggleDropdown(this)">
                            <div class="ui-header">KARTENHINTERGRUND</div>
                            <div class="ui-content toggle-content">
                                <span>BACK</span>
                                <div class="arrow-gold">
                                    <svg width="9" height="8" viewBox="0 0 12 8" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="dropdown-options">
                            <div class="option" data-value="defaultBack" onclick="selectBoxOption(this)">
                                <div class="card-preview preview-blue"></div>
                                <span>Default</span>
                            </div>
                            <div class="option" data-value="redBack" onclick="selectBoxOption(this)">
                                <div class="card-preview preview-red"></div>
                                <span>Rot</span>
                            </div>

                        </div>
                    </div>

                    <div class="dropdown-container header-style" id="cardFrontHeaderDropdown">
                        <div class="ui-container toggle-container" onclick="toggleDropdown(this)">
                            <div class="ui-header">KARTEN-LAYOUT</div>
                            <div class="ui-content toggle-content">
                                <span>FRONT</span>
                                <div class="arrow-gold">
                                    <svg width="9" height="8" viewBox="0 0 12 8" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="dropdown-options">
                            <div class="option" data-value="defaultFront" onclick="selectBoxOption(this)">
                                Standard
                            </div>
                            <div class="option" data-value="vintageFront" onclick="selectBoxOption(this)">
                                Vintage
                            </div>
                        </div>
                    </div>
                    <!-- AUSWAHLMENÜS -->
                    <!-- TABELLE -->
                    <div class="ui-container">
                        <div class="ui-header">Foundation</div>
                        <div class="ui-content highlight-green">+10</div>
                        <div class="ui-content striped highlight-red">-10</div>
                    </div>
                    <div class="ui-container">
                        <div class="ui-header">Wert 1</div>
                        <div class="ui-content">-2</div>
                        <div class="ui-content striped">5</div>
                    </div>
                    <!-- TABELLE -->
                    <!-- EINGABEFELDER -->
                    <div class="ui-container">
                        <div class="ui-header">SPIELERNAME</div>
                        <input type="text" class="ui-content" placeholder="Name eingeben..." value="Peter">
                    </div>
                    <div class="ui-container">
                        <div class="ui-header">SPIELERNAME</div>
                        <input type="text" class="ui-content" placeholder="Name eingeben..." value="">
                    </div>
                    <!-- EINGABEFELDER -->
                    <!-- CHECKBOX -->
                    <label class="ui-container toggle-container">
                        <div class="ui-header">AUDIO EFFEKTE</div>
                        <input type="checkbox" checked>
                        <div class="ui-content toggle-content">
                            <span class="toggle-label-text">Sound Aktiv</span>
                            <div class="toggle-switch-slider"></div>
                        </div>
                    </label>
                    <label class="ui-container toggle-container">
                        <div class="ui-header">VISUELLE EFFEKTE</div>
                        <input type="checkbox">
                        <div class="ui-content toggle-content">
                            <span class="toggle-label-text">Animationen</span>
                            <div class="toggle-switch-slider"></div>
                        </div>
                    </label>
                    <!-- CHECKBOX -->
                    <!-- RADIO BUTTONS -->
                    <label class="ui-container toggle-container">
                        <div class="ui-header">STRATEGIE 1</div>
                        <input type="radio" name="bet_strategy" value="low" checked>
                        <div class="ui-content toggle-content">
                            <span class="radio-label-text">Konservativ</span>
                            <div class="radio-indicator"></div>
                        </div>
                    </label>

                    <label class="ui-container toggle-container">
                        <div class="ui-header">STRATEGIE 2</div>
                        <input type="radio" name="bet_strategy" value="high">
                        <div class="ui-content toggle-content">
                            <span class="radio-label-text">High Roller</span>
                            <div class="radio-indicator"></div>
                        </div>
                    </label>
                    <!-- RADIO BUTTONS -->
                    <!-- BUTTONS -->
                    <button class="ui-container btn-container" onclick="console.log('Save clicked!')">
                        <div class="ui-header">SYSTEM</div>
                        <div class="ui-content btn-content">
                            <span class="btn-label-text">SPEICHERN</span>
                        </div>
                    </button>

                    <button class="ui-container btn-container" onclick="console.log('Cancel clicked!')">
                        <div class="ui-header">AKTION</div>
                        <div class="ui-content btn-content">
                            <span class="btn-label-text">ABBRECHEN</span>
                        </div>
                    </button>
                    <!-- BUTTONS -->
                </div>
                <!-- SECTION SMALL -->
    `;
}