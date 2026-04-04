/* =====================================================
   TOUCH HANDLER
   Vollständige Touch-Unterstützung für Tablet & Mobile.

   Strategie:
   • touchstart / touchmove / touchend ersetzen Drag & Drop
   • Tap (< 10px Bewegung) → handleMoveLogic / flipCard
   • Drag (≥ 10px Bewegung) → Ghost-Karte folgt dem Finger,
     Drop auf column / foundation via elementFromPoint
   • draggable=true wird auf Touch-Geräten deaktiviert
     (verhindert iOS-Safari Ghost-Bug)

   Integration:
   • Wird von _attachCardEvents() in card.creation.js
     am Ende aufgerufen: attachTouchEvents(card)
   • stock-pile onclick bleibt unverändert (kein Drag nötig)

   Abhängigkeiten: card.utils.js, card.move.js,
                   card.animate.js, app.core.js
===================================================== */

/* =====================================================
   GERÄTEERKENNUNG
===================================================== */

/** true wenn das Gerät Touch unterstützt */
const IS_TOUCH_DEVICE = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);

/* =====================================================
   ZUSTAND
===================================================== */

let _td = {
    active: false,     // Läuft gerade ein Touch-Drag?
    card: null,      // Angefasste Karte
    stack: [],        // Kartenstapel (Karte + alles darunter)
    source: null,      // Ursprungs-Container
    ghost: null,      // Ghost-DOM-Element
    startX: 0,
    startY: 0,
    cardOffsetX: 0,         // Finger-Position relativ zur Karten-Ecke
    cardOffsetY: 0,
    moved: false,     // Schwellwert überschritten?
    lastTarget: null,      // Zuletzt hervorgehobenes Drop-Ziel
};

const DRAG_THRESHOLD = 10; // px bis Drag-Modus startet

/* =====================================================
   ÖFFENTLICHE API — wird von card.creation.js aufgerufen
===================================================== */

/**
 * Registriert Touch-Events an einer Karte.
 * Ersetzt auf Touch-Geräten das native Drag & Drop.
 * @param {HTMLElement} card
 */
function attachTouchEvents(card) {
    if (!IS_TOUCH_DEVICE) return;

    // Native Drag & Drop auf Touch deaktivieren (iOS-Safari Bug)
    card.draggable = false;

    card.addEventListener('touchstart', _onTouchStart, { passive: false });
}

/* =====================================================
   TOUCH-EVENTS
===================================================== */

function _onTouchStart(e) {
    // Nur einzelner Finger
    if (e.touches.length !== 1) return;
    if (gameState.is(GameStates.PAUSIERT)) return;

    const card = e.currentTarget;
    const touch = e.touches[0];

    _td.card = card;
    _td.startX = touch.clientX;
    _td.startY = touch.clientY;
    _td.moved = false;
    _td.active = false;

    // Offset: wo auf der Karte wurde angefasst?
    const rect = card.getBoundingClientRect();
    _td.cardOffsetX = touch.clientX - rect.left;
    _td.cardOffsetY = touch.clientY - rect.top;

    document.addEventListener('touchmove', _onTouchMove, { passive: false });
    document.addEventListener('touchend', _onTouchEnd, { once: true });
    document.addEventListener('touchcancel', _onTouchCancel, { once: true });
}

function _onTouchMove(e) {
    if (!_td.card) return;
    e.preventDefault(); // Scroll verhindern während Drag

    const touch = e.touches[0];
    const dx = touch.clientX - _td.startX;
    const dy = touch.clientY - _td.startY;

    // Schwellwert: erst ab 10px wird es ein Drag
    if (!_td.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!_td.moved) {
        // Drag initialisieren — nur für sichtbare (nicht verdeckte) Karten
        if (_td.card.classList.contains('back')) {
            // Verdeckte Karte: kein Drag, nur Tap erlaubt
            _cancelTouch();
            return;
        }

        // Foundation-Karten: kein Drag von Foundation weg per Touch
        // (gleiche Logik wie handleMoveLogic)
        // Wir erlauben es trotzdem — handleDrop prüft validateMove

        _td.moved = true;
        _td.active = true;
        _td.source = _td.card.parentElement;
        _td.stack = getCardStack(_td.card);

        _createGhost(touch.clientX, touch.clientY);

        // Originale Karten leicht ausblenden
        _td.stack.forEach(c => {
            c.style.opacity = '0.25';
            c.style.transition = 'opacity 0.15s';
        });
    }

    // Ghost dem Finger folgen lassen
    if (_td.ghost) {
        _td.ghost.style.left = (touch.clientX - _td.cardOffsetX) + 'px';
        _td.ghost.style.top = (touch.clientY - _td.cardOffsetY) + 'px';
    }

    // Drop-Ziel hervorheben
    _updateDropHighlight(touch.clientX, touch.clientY);
}

function _onTouchEnd(e) {
    document.removeEventListener('touchmove', _onTouchMove);
    document.removeEventListener('touchcancel', _onTouchCancel);

    const card = _td.card;
    if (!card) { _resetTouchState(); return; }

    if (!_td.moved) {
        // ── TAP ──────────────────────────────────────────
        _resetTouchState();

        if (!canAct()) return;

        if (card.classList.contains('back')) {
            // Verdeckte Karte umdrehen
            if (card.parentElement?.classList.contains('column') &&
                card === card.parentElement.lastElementChild) {
                flipCard(card);
            }
            return;
        }

        // Sichtbare Karte: Zug-Logik auslösen
        // handleMoveLogic erwartet e.currentTarget — wir simulieren das
        _executeTapMove(card);

    } else {
        // ── DRAG-DROP ─────────────────────────────────────
        const touch = e.changedTouches[0];
        const target = _getDropTarget(touch.clientX, touch.clientY);

        _clearDropHighlight();
        _removeGhost();

        // Karten-Opazität zurücksetzen
        _td.stack.forEach(c => {
            c.style.opacity = '';
            c.style.transition = '';
        });

        if (target && validateMove(card, target)) {
            const sourceParent = _td.source;

            // Foundation-Schutz (gleiche Logik wie handleDrop)
            if (sourceParent?.classList.contains('foundation')) {
                card.dataset.tempIgnoreAuto = 'true';
                card.classList.add('protected');
                setTimeout(() => {
                    delete card.dataset.tempIgnoreAuto;
                    card.classList.remove('protected');
                }, 2500);
            }

            onPlayerMove(card, sourceParent);

            if (target.classList.contains('foundation')) {
                executeMoveToFoundation(card, target, sourceParent);
            } else {
                executeMoveToTableau(_td.stack, target, sourceParent);
            }

            runAutoLogic();
        } else {
            // Ungültiger Drop → visuelles Feedback
            shakeCard(card);
        }

        _resetTouchState();
    }
}

function _onTouchCancel() {
    document.removeEventListener('touchmove', _onTouchMove);
    _cancelTouch();
}

/* =====================================================
   TAP-BEWEGUNGSLOGIK
   Entspricht handleMoveLogic, aber ohne e.currentTarget
===================================================== */

function _executeTapMove(card) {
    if (!canAct()) return;
    if (card.classList.contains('back')) return;

    // Karte aus Foundation: Shake (kein Tap-Move von Foundation)
    if (card.parentElement?.classList.contains('foundation')) {
        shakeCard(card);
        return;
    }

    // Priorität 1: Foundation
    const fTarget = document.getElementById(`f-${card.dataset.suit}`);
    if (fTarget && validateMove(card, fTarget)) {
        const sourceParent = card.parentElement;
        onPlayerMove(card, sourceParent);
        executeMoveToFoundation(card, fTarget, sourceParent);
        return;
    }

    // Priorität 2: Tableau – erste legale Spalte
    const columns = document.querySelectorAll('.column');
    for (const col of columns) {
        if (card.parentElement === col) continue;
        if (validateMove(card, col)) {
            const sourceParent = card.parentElement;
            onPlayerMove(card, sourceParent);
            executeMoveToTableau(getCardStack(card), col, sourceParent);
            return;
        }
    }

    // Kein legaler Zug
    shakeCard(card);
}

/* =====================================================
   GHOST-ELEMENT
===================================================== */

function _createGhost(x, y) {
    const card = _td.card;
    const stack = _td.stack;
    const rect = card.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'touch-ghost';
    ghost.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top:  ${rect.top}px;
        width: ${rect.width}px;
        pointer-events: none;
        z-index: 9999;
        transform: rotate(1.5deg) scale(1.04);
        transform-origin: top center;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.45));
    `;

    // Für jede Karte im Stack ein Abbild anlegen
    stack.forEach((c, i) => {
        const clone = c.cloneNode(true);
        clone.style.cssText = `
            position: relative;
            top: ${i === 0 ? 0 : -(rect.height - cardDistance)}px;
            margin-bottom: ${i < stack.length - 1 ? -(rect.height - cardDistance) : 0}px;
            display: block;
            width: 100%;
        `;
        ghost.appendChild(clone);
    });

    document.body.appendChild(ghost);
    _td.ghost = ghost;
}

function _removeGhost() {
    _td.ghost?.remove();
    _td.ghost = null;
}

/* =====================================================
   DROP-ZIEL ERKENNUNG & HIGHLIGHTING
===================================================== */

function _getDropTarget(x, y) {
    // Ghost und Original-Karten kurz ausblenden
    if (_td.ghost) _td.ghost.style.visibility = 'hidden';
    _td.stack.forEach(c => c.style.visibility = 'hidden');

    const el = document.elementFromPoint(x, y);

    if (_td.ghost) _td.ghost.style.visibility = '';
    _td.stack.forEach(c => c.style.visibility = '');

    if (!el) return null;
    return el.closest('.column, .foundation');
}

function _updateDropHighlight(x, y) {
    const target = _getDropTarget(x, y);

    // Altes Highlight entfernen
    _td.lastTarget?.classList.remove('touch-drop-valid', 'touch-drop-invalid');

    if (!target) {
        _td.lastTarget = null;
        return;
    }

    const isValid = _td.card && validateMove(_td.card, target);
    target.classList.add(isValid ? 'touch-drop-valid' : 'touch-drop-invalid');
    _td.lastTarget = target;
}

function _clearDropHighlight() {
    _td.lastTarget?.classList.remove('touch-drop-valid', 'touch-drop-invalid');
    _td.lastTarget = null;
}

/* =====================================================
   HILFSFUNKTIONEN
===================================================== */

function _cancelTouch() {
    _td.stack.forEach(c => {
        c.style.opacity = '';
        c.style.transition = '';
    });
    _clearDropHighlight();
    _removeGhost();
    _resetTouchState();
}

function _resetTouchState() {
    document.removeEventListener('touchmove', _onTouchMove);
    document.removeEventListener('touchend', _onTouchEnd);
    document.removeEventListener('touchcancel', _onTouchCancel);

    _td.active = false;
    _td.card = null;
    _td.stack = [];
    _td.source = null;
    _td.ghost = null;
    _td.moved = false;
    _td.lastTarget = null;
}
