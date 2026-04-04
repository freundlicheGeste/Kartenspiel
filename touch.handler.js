/* =====================================================
   TOUCH HANDLER  v3.0
   Vollständige Touch-Unterstützung für Tablet & Mobile.

   Fixes gegenüber v2:
   1. Stack + sourceParent werden VOR _resetTouchState() gesichert
   2. e.preventDefault() in touchstart entfernt 300ms Tap-Delay
      und verhindert Browser-Scroll statt Touch-Event
   3. canAct() statt nur PAUSIERT in _onTouchStart
   4. Stock-Pile erhält eigenen touchend-Handler

   Abhängigkeiten: card.utils.js, card.move.js,
                   card.animate.js, app.core.js
===================================================== */

const IS_TOUCH_DEVICE = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);

/* =====================================================
   STOCK-PILE TOUCH
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (!IS_TOUCH_DEVICE) return;

    const stockPile = document.getElementById('stock-pile');
    if (stockPile) {
        stockPile.addEventListener('touchend', (e) => {
            e.preventDefault();
            revealNextStockCard();
        }, { passive: false });
    }
});

/* =====================================================
   ZUSTAND
===================================================== */

let _td = {
    active:      false,
    card:        null,
    stack:       [],
    source:      null,
    ghost:       null,
    startX:      0,
    startY:      0,
    cardOffsetX: 0,
    cardOffsetY: 0,
    moved:       false,
    lastTarget:  null,
};

const DRAG_THRESHOLD = 10;

/* =====================================================
   ÖFFENTLICHE API
===================================================== */

function attachTouchEvents(card) {
    if (!IS_TOUCH_DEVICE) return;
    card.draggable = false;
    card.addEventListener('touchstart', _onTouchStart, { passive: false });
}

/* =====================================================
   TOUCH-EVENTS
===================================================== */

function _onTouchStart(e) {
    if (e.touches.length !== 1) return;

    // FIX: preventDefault entfernt 300ms Tap-Delay des Browsers.
    // Ohne dies interpretiert Firefox/Safari den ersten Touch als
    // potenziellen Scroll und verzögert oder schluckt den Event.
    e.preventDefault();

    // FIX: canAct() prüft auch isAnimating, nicht nur PAUSIERT
    if (!canAct()) return;

    const card  = e.currentTarget;
    const touch = e.touches[0];

    _td.card        = card;
    _td.startX      = touch.clientX;
    _td.startY      = touch.clientY;
    _td.moved       = false;
    _td.active      = false;

    const rect      = card.getBoundingClientRect();
    _td.cardOffsetX = touch.clientX - rect.left;
    _td.cardOffsetY = touch.clientY - rect.top;

    document.addEventListener('touchmove',   _onTouchMove,   { passive: false });
    document.addEventListener('touchend',    _onTouchEnd,    { once: true });
    document.addEventListener('touchcancel', _onTouchCancel, { once: true });
}

function _onTouchMove(e) {
    if (!_td.card) return;
    e.preventDefault();

    const touch = e.touches[0];
    const dx    = touch.clientX - _td.startX;
    const dy    = touch.clientY - _td.startY;

    if (!_td.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!_td.moved) {
        if (_td.card.classList.contains('back')) {
            _cancelTouch();
            return;
        }

        _td.moved  = true;
        _td.active = true;
        _td.source = _td.card.parentElement;
        _td.stack  = getCardStack(_td.card);

        _createGhost(touch.clientX, touch.clientY);

        _td.stack.forEach(c => {
            c.style.opacity    = '0.25';
            c.style.transition = 'opacity 0.15s';
        });
    }

    if (_td.ghost) {
        _td.ghost.style.left = (touch.clientX - _td.cardOffsetX) + 'px';
        _td.ghost.style.top  = (touch.clientY - _td.cardOffsetY) + 'px';
    }

    _updateDropHighlight(touch.clientX, touch.clientY);
}

function _onTouchEnd(e) {
    document.removeEventListener('touchmove',   _onTouchMove);
    document.removeEventListener('touchcancel', _onTouchCancel);

    const card  = _td.card;
    const moved = _td.moved;

    if (!card) { _resetTouchState(); return; }

    if (!moved) {
        // TAP
        _resetTouchState();
        if (!canAct()) return;

        if (card.classList.contains('back')) {
            if (card.parentElement?.classList.contains('column') &&
                card === card.parentElement.lastElementChild) {
                flipCard(card);
            }
            return;
        }

        _executeTapMove(card);

    } else {
        // DRAG-DROP
        const touch  = e.changedTouches[0];
        const target = _getDropTarget(touch.clientX, touch.clientY);

        _clearDropHighlight();
        _removeGhost();

        // FIX: Referenzen sichern BEVOR _resetTouchState() alles nullt
        const sourceParent = _td.source;
        const stack        = [..._td.stack];

        _td.stack.forEach(c => {
            c.style.opacity    = '';
            c.style.transition = '';
        });

        _resetTouchState();

        if (target && validateMove(card, target)) {
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
                executeMoveToTableau(stack, target, sourceParent);
            }

            runAutoLogic();
        } else {
            shakeCard(card);
        }
    }
}

function _onTouchCancel() {
    document.removeEventListener('touchmove', _onTouchMove);
    _cancelTouch();
}

/* =====================================================
   TAP-BEWEGUNGSLOGIK
===================================================== */

function _executeTapMove(card) {
    if (!canAct()) return;
    if (!card || card.classList.contains('back')) return;

    if (card.parentElement?.classList.contains('foundation')) {
        shakeCard(card);
        return;
    }

    const fTarget = document.getElementById('f-' + card.dataset.suit);
    if (fTarget && validateMove(card, fTarget)) {
        const sourceParent = card.parentElement;
        onPlayerMove(card, sourceParent);
        executeMoveToFoundation(card, fTarget, sourceParent);
        return;
    }

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

    shakeCard(card);
}

/* =====================================================
   GHOST-ELEMENT
===================================================== */

function _createGhost(x, y) {
    const card  = _td.card;
    const stack = _td.stack;
    const rect  = card.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'touch-ghost';
    ghost.style.cssText = [
        'position:fixed',
        'left:' + rect.left + 'px',
        'top:' + rect.top + 'px',
        'width:' + rect.width + 'px',
        'pointer-events:none',
        'z-index:9999',
        'transform:rotate(1.5deg) scale(1.04)',
        'transform-origin:top center',
        'filter:drop-shadow(0 10px 20px rgba(0,0,0,0.45))'
    ].join(';');

    stack.forEach((c, i) => {
        const clone = c.cloneNode(true);
        const topOff = i === 0 ? 0 : -(rect.height - cardDistance);
        const botOff = i < stack.length - 1 ? -(rect.height - cardDistance) : 0;
        clone.style.cssText = [
            'position:relative',
            'top:' + topOff + 'px',
            'margin-bottom:' + botOff + 'px',
            'display:block',
            'width:100%'
        ].join(';');
        ghost.appendChild(clone);
    });

    document.body.appendChild(ghost);
    _td.ghost = ghost;
}

function _removeGhost() {
    if (_td.ghost) {
        _td.ghost.remove();
        _td.ghost = null;
    }
}

/* =====================================================
   DROP-ZIEL
===================================================== */

function _getDropTarget(x, y) {
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
    if (_td.lastTarget) {
        _td.lastTarget.classList.remove('touch-drop-valid', 'touch-drop-invalid');
    }
    if (!target) { _td.lastTarget = null; return; }
    const isValid = _td.card && validateMove(_td.card, target);
    target.classList.add(isValid ? 'touch-drop-valid' : 'touch-drop-invalid');
    _td.lastTarget = target;
}

function _clearDropHighlight() {
    if (_td.lastTarget) {
        _td.lastTarget.classList.remove('touch-drop-valid', 'touch-drop-invalid');
        _td.lastTarget = null;
    }
}

/* =====================================================
   HILFSFUNKTIONEN
===================================================== */

function _cancelTouch() {
    _td.stack.forEach(c => {
        c.style.opacity    = '';
        c.style.transition = '';
    });
    _clearDropHighlight();
    _removeGhost();
    _resetTouchState();
}

function _resetTouchState() {
    document.removeEventListener('touchmove',   _onTouchMove);
    document.removeEventListener('touchend',    _onTouchEnd);
    document.removeEventListener('touchcancel', _onTouchCancel);

    _td.active      = false;
    _td.card        = null;
    _td.stack       = [];
    _td.source      = null;
    _td.ghost       = null;
    _td.moved       = false;
    _td.lastTarget  = null;
}
