const CACHE_NAME = 'kts_v1.0.0'; // Nummer bei JEDEM Update ändern!

const assets = [
    // Root & Manifest
    './',
    './index.html',
    './manifest.json',
    './ui/logo.svg',

    // CSS - Core
    './ui/appWrapper.css',
    './ui/root.css',
    './ui/style.css',

    // CSS - Systems
    './ui/animations/highscore.css',
    './styles/animations/cardNoActionAnimation.css',
    './styles/animations/pulseEffect.css',
    './styles/design/cardDesign.css',
    './styles/panels/rewardPanel.css',
    './styles/xpSystem/boniMessages.css',
    './styles/xpSystem/levelUp.css',
    './styles/stapelIndex.css',

    // CSS - Engine
    './engine/cards/cardDesign.css',
    './engine/cards/dealCards.css',
    './ui/animations/cards/cardAnimations.css',

    // CSS - UI Components
    './player/scoreboard/scoreboard.css',
    './ui/components/buttonBar/buttonBar.css',
    './ui/components/infoBars/infoBars.css',
    './ui/components/infoTicker/info-ticker.css',
    './ui/components/statusBar/statusBar.css',
    './ui/screens/startScreen/startScreen.css',
    './ui/replacements/title.css',

    // CSS - BasePanel
    './basePanel/basePanel.css',
    './basePanel/controls/panelControls.css',
    './basePanel/dialogs/winDialog.css',
    './basePanel/dialogs/infoDialog.css',
    './basePanel/dialogs/inputDialog.css',
    './basePanel/panels/changelogPanel.css',
    './basePanel/panels/infoPanel.css',

    // JS - Basis (keine Abhängigkeiten)
    './deck.utils.js',
    './card.utils.js',

    // JS - App-Schicht
    './app.storage.js',
    './app.core.js',
    './app.ui.js',

    // JS - Karten
    './card.creation.js',
    './card.animate.js',
    './card.stock.js',
    './card.move.js',
    './card.deal.js',

    // JS - Deck
    './deck.generator.js',
    './deck.manager.js',

    // JS - Game State
    './game.state.js',
    './game.reset.js',
    './game.running.js',
    './game.pause.js',
    './game.over.js',
    './game.quit.js',
    './game.init.js',

    // JS - Scoring & Messaging
    './scoring.system.js',
    './game.messages.js',
    './game.hints.js',
    './game.undo.js',
    './game.autosolve.js',
    './game.registration.js',
    './game.scoreboard.js',
    './game.xp.js',

    // JS - UI & Animationen
    './ui.animations.js',

    // JS - Audio
    './audio/GameAudioManager.js',
    './audio/gameSounds.js',

    // JS - Daten
    './core/data/hardcodedDecks.js',

    // JS - Engine & Input
    './engine/input/keyboardShortcuts.js',

    // JS - Player
    './player/levelTitles.js',
    './player/rewards.js',

    // JS - UI-Komponenten
    './ui/components/buttonBar/buttonBar.js',
    './ui/components/infoBars/infoBars.js',
    './ui/components/infoTicker/info-ticker.js',
    './ui/components/statusBar/statusBar.js',

    // JS - Developer Tools
    './developer/debugFunctions.js',
    './developer/devLogs.js',
    './developer/devMode.js',
    './developer/loggingSystem.js',
    './developer/recordGame.js',

    // JS - Unsortiert & App Base
    './unsortiert/code/appBase/cheating.js',
    './unsortiert/code/toggleBanner.js',
    './unsortiert/dialogs/dialogManager.js',
    './unsortiert/dialogs/gameQuitDialog.js',

    // JS - BasePanel & Dialogs
    './basePanel/basePanel.js',
    './basePanel/controls/panelControls.js',
    './basePanel/panels/changelogPanel.js',
    './basePanel/panels/infoPanel.js',
    './basePanel/panels/settingsPanel.js',
    './basePanel/dialogs/gameInactiveDialog.js',
    './basePanel/dialogs/gameOverDialog.js',
    './basePanel/dialogs/gameQuitDialog.js',
    './basePanel/dialogs/gameRestartDialog.js',
    './basePanel/dialogs/winDialog.js',
    './basePanel/dialogs/confirmDialog.js',
    './basePanel/dialogs/infoDialog.js',
    './basePanel/dialogs/inputDialog.js',
];

// Install: Cache befüllen, sofort aktivieren
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
    );
});

// Activate: Alte Caches löschen
self.addEventListener('activate', e => {
    self.clients.claim();
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
});

// Fetch: Stale-While-Revalidate
self.addEventListener('fetch', e => {
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then(cached => {
            const network = fetch(e.request).then(response => {
                if (response?.status === 200) {
                    caches.open(CACHE_NAME).then(cache =>
                        cache.put(e.request, response.clone())
                    );
                }
                return response;
            }).catch(() => cached);

            return cached || network;
        })
    );
});
