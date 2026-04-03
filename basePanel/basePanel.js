let currentPanelType = null; // Speichert, welches Panel gerade offen ist

/**
 * Schaltet das Panel in einen spezifischen Modus
 * @param {string} type - 'settings', 'info', 'changelog', 'rewards', 'restart', 'record'
 * @param {object} data - Optional: Daten für den Record-Screen
 */
function openPanel(type, data = {}) {
    const panel = document.getElementById('base-panel-id');
    if (!panel) return;

    // Scrollposition zum Anfang springen
    const wrapper = document.querySelector('.base-panel-content');
    if (wrapper) wrapper.scrollTop = 0;

    // Beim öffnen, immer Spiel pausieren
    pauseGame();

    // Reset: Dialog-Modus standardmäßig entfernen
    panel.classList.remove('dialog-mode');

    // Wir entfernen 'active', damit der Browser das Panel wieder auf -80px setzt
    panel.classList.remove('active');

    // WICHTIG: Reflow erzwingen, damit der Browser merkt, dass 'active' weg ist
    void panel.offsetWidth;

    // Alles zurücksetzen, bevor wir neu konfigurieren
    panel.classList.remove('no-overlay');
    panel.classList.remove('record-glow-active');

    const titleElement = document.querySelector('.header-title');
    const subtitleElement = document.querySelector('.header-subtitle');
    const cardElement = document.querySelector('.header-card');
    const contentElement = document.querySelector('.base-panel-content');
    const footerElement = document.querySelector('.base-panel-footer');

    if (type === 'record') {
        panel.classList.add('no-overlay'); // Transparenter Hintergrund
        panel.classList.add('record-glow-active'); // 
    }

    if (type === 'win') {
        panel.classList.add('no-overlay');
    }

    // 1. Titel & Icons definieren
    const config = {
        settings: { title: "EINSTELLUNGEN", icon: "⚙️", subtitle: " <br> " },
        gameInfo: { title: "INFORMATION", icon: "i", subtitle: `Version: <strong>${kts.sys.version}</strong><br><small>Released: ${kts.sys.date}</small>` },
        changelog: { title: "CHANGELOG", icon: "📜", subtitle: " <br> " },
        rewards: { title: "BELOHNUNGEN", icon: "🏆", subtitle: " <br> " },
        record: { title: "NEUER REKORD", icon: "🔥", subtitle: " <br> " },
        controls: { title: "PANEL CONTROLS", icon: "🛠️", subtitle: "<strong>Design-Vorschau</strong><br><small>UI Controls</small>" }
    };

    const current = config[type] || config.gameInfo;

    // 2. Header-Texte & Icon setzen
    titleElement.textContent = current.title;
    subtitleElement.innerHTML = current.subtitle; // .innerHTML nutzen, falls <br> im Subtitle ist
    cardElement.textContent = current.icon;

    // 3. Inhalt leeren
    contentElement.innerHTML = '';
    footerElement.innerHTML = '';

    // Hilfsfunktion für Buttons
    function addFooterButton(text, callback, extraClass = '') {
        const btn = document.createElement('button');
        btn.className = 'footer-btn ' + extraClass; // Fügt z.B. 'btn-danger' hinzu
        btn.innerHTML = text;
        btn.onclick = callback;
        footerElement.appendChild(btn);
    }

    // 4. Modus-spezifischer Inhalt & Footer-Buttons
    switch (type) {
        case 'record':
            contentElement.innerHTML = `
                <div class="record-total-glow">GESAMT: ${data.gesamt || 0}</div>
                <div class="record-details-small">Zeit: ${data.zeit || '--:--'}</div>
            `;
            addFooterButton("NOCHMAL", () => location.reload());
            addFooterButton("ZURÜCK ZUM SPIEL", () => smartClose('base-panel-id'));
            break;

        case 'restart':
            panel.classList.add('dialog-mode'); // Hier den Modus aktivieren
            if (gameState.is(GameStates.RUNNING)) {
                renderRestartConfirm(contentElement, addFooterButton);
            } else {
                renderGameNotActive(contentElement, addFooterButton);
            }
            break;
        case 'quit':
            panel.classList.add('dialog-mode');
            if (gameState.is(GameStates.RUNNING)) {
                renderQuitConfirm(contentElement, addFooterButton);
            } else {
                renderGameNotActive(contentElement, addFooterButton);
            }
            break;

        case 'rewards':
            // Zugriff auf deine Datenstruktur (kts_template.game.player)
            //const player = kts.game.player;
            const unlocked = [2, 3];

            let rewardsHTML = '<div class="reward-list">';

            LEVEL_REWARDS.forEach(reward => {
                const isUnlocked = unlocked.includes(reward.level);
                const statusClass = isUnlocked ? 'unlocked' : 'locked';
                const statusText = isUnlocked ? 'FREIGESCHALTET' : `AB LEVEL ${reward.level}`;
                const icon = isUnlocked ? '🏆' : '🔒';

                rewardsHTML += `
            <div class="reward-plate ${statusClass}" ${!isUnlocked ? 'onclick="this.classList.add(\'shake-it\'); setTimeout(()=>this.classList.remove(\'shake-it\'),400)"' : ''}>
                <div class="reward-icon">${icon}</div>
                <div class="reward-content">
                    <div class="reward-title">${reward.title}</div>
                    <div class="reward-desc">${reward.msg}</div>
                    <div class="reward-status">${statusText}</div>
                </div>
            </div>
        `;
            });

            rewardsHTML += '</div>';

            contentElement.innerHTML = rewardsHTML;

            // Footer Button
            addFooterButton("ZURÜCK", () => smartClose('base-panel-id'));
            break;

        case 'stalemate':
            // Dialog-Modus aktivieren (macht das Panel kompakt und blendet Header aus)
            panel.classList.add('dialog-mode');

            renderStalemate(contentElement, addFooterButton);
            break;

        case 'win':
            panel.classList.add('dialog-mode');

            // Goldener Puls-Effekt bei Rekord
            if (data.isNewRecord) {
                panel.classList.add('record-glow-active');
                // Optionaler Kartenregen-Effekt
                if (typeof triggerCardRain === 'function') triggerCardRain();
            } else {
                panel.classList.remove('record-glow-active');
            }

            renderWin(contentElement, addFooterButton, data);
            break;

        case 'changelog':
            renderChangelog(contentElement, addFooterButton);
            break;

        case 'gameInfo':
            renderInfo(contentElement, addFooterButton);
            break;

        case 'controls':
            renderPanelControls(contentElement, addFooterButton);
            break;

        case 'settings':
            renderSettings(contentElement, addFooterButton);
            break;
        // ALLGEMEINE DIALOGE
        case 'info':
            panel.classList.add('dialog-mode');
            renderInfoDialog(contentElement, addFooterButton, data);
            break;
        case 'input':
            panel.classList.add('dialog-mode');
            renderInputDialog(contentElement, addFooterButton, data);
            break;
        case 'confirm':
            panel.classList.add('dialog-mode');
            renderConfirmDialog(contentElement, addFooterButton, data);
            break;
    }

    // Panel sichtbar machen
    panel.classList.add('active');
}

function togglePanel(type, data = {}) {
    const panel = document.getElementById('base-panel-id');
    const isActive = panel.classList.contains('active');

    if (isActive && currentPanelType === type) {
        closePanel('base-panel-id');
    } else {
        openPanel(type, data);
        currentPanelType = type; // Merken, was wir geöffnet haben
    }
}

function closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // Klasse entfernen, die für Sichtbarkeit sorgt
    panel.classList.remove('active');

    currentPanelType = null; // Reset

    // Pausieren von openPanel() aufheben
    resumeGame();

    // Kleiner Delay, damit die CSS-Transition Zeit hat, bevor das Panel "weg" ist
    setTimeout(() => {
        if (!panel.classList.contains('active')) {
            panel.classList.remove('no-overlay', 'record-glow-active');
        }
    }, 500);
}

// zu viele Fehler, Falschklicks
/*
// Schließen beim Klick auf das Overlay
document.getElementById('base-panel-id').addEventListener('mousedown', function (e) {
    // 'this' ist das base-panel (das Overlay)
    // Wenn e.target === this, wurde direkt auf den Hintergrund geklickt, 
    // nicht auf den Container oder dessen Inhalt.
    if (e.target === this) {
        closePanel('base-panel-id');
    }
});
*/