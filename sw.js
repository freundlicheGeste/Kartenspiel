const CACHE_NAME = 'kts_v0.9.9'; // Nummer bei JEDEM Update ändern zum pushen!

const assets = [
  // Root & Manifest
  "./",
  "./index.html",
  "./manifest.json",
  "./script.js",
  "./ui/logo.svg",

  // CSS - Core & Systems
  "./ui/appWrapper.css",
  "./ui/root.css",
  "./core/systems/autoSolve/autoSolve.css",
  "./core/systems/hints/gameHints.css",
  "./core/systems/history/gameUndoRedo.css",
  "./core/systems/messages/gameMessages.css",

  // CSS - Engine & Animations
  "./engine/cards/cardDesign.css",
  "./engine/cards/dealCards.css",
  "./ui/animations/cards/cardAnimations.css",
  "./ui/animations/highscore.css",
  "./styles/animations/cardNoActionAnimation.css",
  "./styles/animations/pulseEffect.css",

  // CSS - UI Components & Screens
  "./player/scoreboard/scoreboard.css",
  "./ui/components/buttonBar/buttonBar.css",
  "./ui/components/infoBars/infoBars.css",
  "./ui/components/infoTicker/info-ticker.css",
  "./ui/components/statusBar/statusBar.css",
  "./ui/screens/startScreen/startScreen.css",
  "./ui/replacements/title.css",
  "./ui/style.css",

  // CSS - BasePanel & Dialogs
  "./basePanel/basePanel.css",
  "./basePanel/controls/panelControls.css",
  "./basePanel/dialogs/winDialog.css",
  "./basePanel/dialogs/infoDialog.css",
  "./basePanel/dialogs/inputDialog.css",
  "./basePanel/panels/changelogPanel.css",
  "./basePanel/panels/infoPanel.css",
  "./styles/design/cardDesign.css",
  "./styles/panels/rewardPanel.css",
  "./styles/xpSystem/boniMessages.css",
  "./styles/xpSystem/levelUp.css",
  "./styles/stapelIndex.css",

  // JS - Utils & Cards
  "./deck.utils.js",
  "./card.utils.js",
  "./card.creation.js",
  "./card.animate.js",
  "./card.stock.js",
  "./card.move.js",
  "./card.deal.js",

  // JS - Deck & Game State
  "./deck.generator.js",
  "./deck.manager.js",
  "./game.state.js",
  "./game.reset.js",
  "./game.running.js",
  "./game.pause.js",
  "./game.over.js",
  "./game.quit.js",
  "./game.init.js",

  // JS - Audio
  "./audio/GameAudioManager.js",
  "./audio/gameSounds.js",

  // JS - Core Systems
  "./core/data/hardcodedDecks.js",
  "./core/data/localStorage.js",
  "./core/systems/autoSolve/autoSolve.js",
  "./core/systems/hints/gameHints.js",
  "./core/systems/history/gameUndoRedo.js",
  "./core/systems/messages/gameMessages.js",
  "./core/systems/gameRegistration.js",
  "./core/systems/scoringSystem.js",
  "./core/systems/shuffleSystem.js",

  // JS - Engine & Input
  "./engine/input/keyboardShortcuts.js",

  // JS - Player & UI
  "./player/scoreboard/scoreboard.js",
  "./player/experienceLevel.js",
  "./player/levelTitles.js",
  "./player/rewards.js",
  "./ui/animations/highscore.js",
  "./ui/animations/victory.js",
  "./ui/animations/cards/cardAnimations.js",
  "./ui/components/buttonBar/buttonBar.js",
  "./ui/components/infoBars/infoBars.js",
  "./ui/components/infoTicker/info-ticker.js",
  "./ui/components/statusBar/statusBar.js",

  // JS - Developer Tools
  "./developer/debugFunctions.js",
  "./developer/devLogs.js",
  "./developer/devMode.js",
  "./developer/loggingSystem.js",
  "./developer/recordGame.js",

  // JS - Unsortiert & App Base
  "./unsortiert/code/appBase/cheating.js",
  "./unsortiert/code/appBase/localStorage.js",
  "./unsortiert/code/toggleBanner.js",
  "./unsortiert/dialogs/dialogManager.js",
  "./unsortiert/dialogs/gameQuitDialog.js",

  // JS - Panels & Dialogs
  "./basePanel/basePanel.js",
  "./basePanel/controls/panelControls.js",
  "./basePanel/panels/changelogPanel.js",
  "./basePanel/panels/infoPanel.js",
  "./basePanel/panels/settingsPanel.js",
  "./basePanel/dialogs/gameInactiveDialog.js",
  "./basePanel/dialogs/gameOverDialog.js",
  "./basePanel/dialogs/gameQuitDialog.js",
  "./basePanel/dialogs/gameRestartDialog.js",
  "./basePanel/dialogs/winDialog.js",
  "./basePanel/dialogs/confirmDialog.js",
  "./basePanel/dialogs/infoDialog.js",
  "./basePanel/dialogs/inputDialog.js"
];


// Install Event
self.addEventListener('install', e => {
  self.skipWaiting(); // Erzwingt Aktivierung des neuen Service Workers
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Activate Event - löscht alte Caches automatisch
self.addEventListener('activate', e => {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Event - Stale-While-Revalidate
self.addEventListener('fetch', e => {
  // Verhindert Probleme mit Browser-Erweiterungen (chrome-extension://)
  if (!(e.request.url.indexOf('http') === 0)) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cachedResponse => {
      const networkFetch = fetch(e.request).then(networkResponse => {
        // Nur gültige Antworten cachen (status 200)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          // Hintergrund-Update des Caches
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Netzwerkfehler (offline) - wir geben die Cache-Antwort zurück, falls vorhanden
        return cachedResponse;
      });
      // Gib Cache zurück, falls vorhanden, sonst warte aufs Netzwerk
      return cachedResponse || networkFetch;
    })
  );
});