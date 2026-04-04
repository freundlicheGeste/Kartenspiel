/* =====================================================
   INPUT TRACKING
   Verantwortlich für: Mausposition tracken (lastMousePos).
   Wird von game_undo.js für die Undo/Redo-Kartenanimation
   genutzt (Karten fliegen von der aktuellen Mausposition).
   Abhängigkeiten: keine
===================================================== */

/**
 * Zuletzt bekannte Mausposition.
 * SSOT — wird von glideCardIntoPlace() in game_undo.js gelesen.
 * @type {{ x: number, y: number }}
 */
let lastMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener('mousemove', e => {
    lastMousePos.x = e.clientX;
    lastMousePos.y = e.clientY;
}, { passive: true });
