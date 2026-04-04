/* =====================================================
   TOUCH HANDLER
   Ersetzt Drag & Drop für Touch-Geräte (Tablet, Mobile).
   Nutzt Pointer Events API — funktioniert für Touch UND Maus.
   Abhängigkeiten: card.utils.js, card.move.js
===================================================== */

let _touchDragCard = null;  // Aktuell gezogene Karte
let _touchDragStack = [];    // Kartenstapel beim Ziehen
let _touchClone = null;  // Visuelles Ghost-Element
let _touchSourceParent = null; // Ursprungs-Container
let _touchStartX = 0;
let _touchStartY = 0;
let _touchOffsetX = 0;
let _touchOffsetY = 0;
let _touchMoved = false; // Unterscheidet Tap von Drag
const TOUCH_DRAG_THRESHOLD = 8; // px Bewegung bis Drag startet

/**
 * Registriert Touch/Pointer-Events an einer Karte.
 * Wird von _attachCardEvents() in card.creation.js aufgerufen.
 * @param {HTMLElement} card
 */
function attachTouchEvents(card) {
    card.addEventListener('pointerdown', _onPointerDown, { passive: false });
}

function _onPointerDown(e) {
    // Nur primärer Zeiger (Finger 1 oder linke Maustaste)
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (gameState.is(GameStates.PAUSIERT)) return;

    const card = e.currentTarget;
    if (card.classList.contains('back')) return; // Flip läuft via onclick

    _touchStartX = e.clientX;
    _touchStartY = e.clientY;
    _touchMoved = false;
    _touchDragCard = card;

    card.setPointerCapture(e.pointerId);
    card.addEventListener('pointermove', _onPointerMove, { passive: false });
    card.addEventListener('pointerup', _onPointerUp);
    card.addEventListener('pointercancel', _cancelDrag);
}

function _onPointerMove(e) {
    if (!_touchDragCard) return;
    e.preventDefault();

    const dx = e.clientX - _touchStartX;
    const dy = e.clientY - _touchStartY;

    // Drag erst starten wenn Schwellwert überschritten
    if (!_touchMoved && Math.hypot(dx, dy) < TOUCH_DRAG_THRESHOLD) return;

    if (!_touchMoved) {
        // Drag initialisieren
        _touchMoved = true;
        _touchSourceParent = _touchDragCard.parentElement;
        _touchDragStack = getCardStack(_touchDragCard);

        const rect = _touchDragCard.getBoundingClientRect();
        _touchOffsetX = _touchStartX - rect.left;
        _touchOffsetY = _touchStartY - rect.top;

        _createDragClone(_touchDragCard, _touchDragStack, rect);

        // Original-Karten während Drag leicht ausblenden
        _touchDragStack.forEach(c => c.style.opacity = '0.3');
    }

    if (_touchClone) {
        _touchClone.style.left = (e.clientX - _touchOffsetX) + 'px';
        _touchClone.style.top = (e.clientY - _touchOffsetY) + 'px';
    }

    // Drop-Ziel hervorheben
    _highlightDropTarget(e.clientX, e.clientY);
}

function _onPointerUp(e) {
    const card = _touchDragCard;
    _cleanup(card);

    if (!_touchMoved) {
        // War ein Tap → handleMoveLogic simulieren
        if (card && !card.classList.contains('back')) {
            const fakeEvent = { currentTarget: card, preventDefault: () => { } };
            queueAction(() => handleMoveLogic(fakeEvent));
        }
        return;
    }

    // Drop-Ziel ermitteln
    const target = _getDropTarget(e.clientX, e.clientY);

    if (target && card) {
        const sourceParent = _touchSourceParent;

        if (validateMove(card, target)) {
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
                executeMoveToTableau(_touchDragStack, target, sourceParent);
            }

            runAutoLogic();
        } else {
            // Ungültiger Drop → Karten zurückblenden
            _touchDragStack.forEach(c => c.style.opacity = '');
            shakeCard(card);
        }
    } else {
        // Kein Ziel → Karten zurückblenden
        _touchDragStack.forEach(c => c.style.opacity = '');
    }
}

function _cancelDrag(e) {
    _touchDragStack.forEach(c => c.style.opacity = '');
    _cleanup(_touchDragCard);
}

function _cleanup(card) {
    if (card) {
        card.removeEventListener('pointermove', _onPointerMove);
        card.removeEventListener('pointerup', _onPointerUp);
        card.removeEventListener('pointercancel', _cancelDrag);
    }

    _touchClone?.remove();
    _touchClone = null;
    _touchDragCard = null;
    _touchDragStack = [];
    _touchSourceParent = null;
    _touchMoved = false;

    // Drop-Highlights entfernen
    document.querySelectorAll('.touch-drop-highlight')
        .forEach(el => el.classList.remove('touch-drop-highlight'));
}

/**
 * Erstellt ein Ghost-Element das dem Finger folgt.
 */
function _createDragClone(card, stack, rect) {
    const clone = document.createElement('div');
    clone.className = 'touch-drag-clone';

    // Für jeden Karte im Stack ein Mini-Abbild
    stack.forEach((c, i) => {
        const mini = c.cloneNode(true);
        mini.style.position = 'absolute';
        mini.style.top = (i * cardDistance) + 'px';
        mini.style.left = '0';
        mini.style.pointerEvents = 'none';
        clone.appendChild(mini);
    });

    clone.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top:  ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height + (stack.length - 1) * cardDistance}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.85;
        transform: rotate(2deg) scale(1.03);
        transition: transform 0.1s;
    `;

    document.body.appendChild(clone);
    _touchClone = clone;
}

/**
 * Findet das Drop-Ziel unter den gegebenen Koordinaten.
 */
function _getDropTarget(x, y) {
    // Clone temporär verstecken damit elementFromPoint darunter schaut
    if (_touchClone) _touchClone.style.display = 'none';
    _touchDragStack.forEach(c => c.style.pointerEvents = 'none');

    const el = document.elementFromPoint(x, y);

    if (_touchClone) _touchClone.style.display = '';
    _touchDragStack.forEach(c => c.style.pointerEvents = '');

    if (!el) return null;

    // Nächstes column oder foundation Element finden
    return el.closest('.column, .foundation');
}

/**
 * Hebt das aktuelle Drop-Ziel visuell hervor.
 */
function _highlightDropTarget(x, y) {
    document.querySelectorAll('.touch-drop-highlight')
        .forEach(el => el.classList.remove('touch-drop-highlight'));

    const target = _getDropTarget(x, y);
    if (target && _touchDragCard && validateMove(_touchDragCard, target)) {
        target.classList.add('touch-drop-highlight');
    }
}