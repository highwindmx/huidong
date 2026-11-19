/**
 * LinkSelectorController "singleton"
 * Detects <modifier> + LEFT mouse button drag and reports a selection rectangle.
 * Provides 4 events: start, update, end, abort.
 * Independent from the gesture controllers (which use other mouse buttons).
 */

// public API
export default {
  enable: enable,
  disable: disable,
  cancel: cancel,
  addEventListener: addEventListener,
  hasEventListener: hasEventListener,
  removeEventListener: removeEventListener,

  get modifier () { return modifier; },
  set modifier (value) { modifier = (value === "altKey" || value === "shiftKey") ? value : "ctrlKey"; },

  get distanceThreshold () { return distanceThreshold; },
  set distanceThreshold (value) { distanceThreshold = Number(value) || 6; }
};

function addEventListener (event, callback) {
  if (event in events) events[event].add(callback);
}
function hasEventListener (event, callback) {
  return (event in events) && events[event].has(callback);
}
function removeEventListener (event, callback) {
  if (event in events) events[event].delete(callback);
}

/** Register the pointerdown detector. */
function enable () {
  targetElement.addEventListener('pointerdown', handlePointerdown, true);
}

/** Remove listeners and reset state. */
function disable () {
  targetElement.removeEventListener('pointerdown', handlePointerdown, true);
  reset();
}

/** Abort an in-progress selection without emitting end. */
function cancel () {
  if (state !== PASSIVE) {
    events['abort'].forEach(cb => cb());
    reset();
  }
}

// private state
const LEFT_MOUSE_BUTTON = 1;
const PASSIVE = 0, PENDING = 1, ACTIVE = 2;

let state = PASSIVE;
let modifier = "ctrlKey";
let distanceThreshold = 6;
let startPoint = { x: 0, y: 0 };
let targetElement = window;

const events = {
  start: new Set(),
  update: new Set(),
  end: new Set(),
  abort: new Set()
};

let suppressTimeout = null;

function initialize (event) {
  startPoint = { x: event.clientX, y: event.clientY };
  state = PENDING;

  targetElement.addEventListener('pointermove', handlePointermove, true);
  targetElement.addEventListener('pointerup', handlePointerup, true);
  targetElement.addEventListener('dragstart', preventDefault, true);
  targetElement.addEventListener('contextmenu', preventDefault, true);
  targetElement.addEventListener('selectstart', preventDefault, true);

  // keep receiving pointer events even if the cursor leaves the element/frame
  try {
    (event.originalTarget ?? event.composedPath?.()[0] ?? event.target)
      ?.setPointerCapture?.(event.pointerId);
  } catch (e) { /* capture is best-effort */ }

  // start immediately so the box is visible from the first pixel
  state = ACTIVE;
  const rect = { x1: startPoint.x, y1: startPoint.y, x2: startPoint.x, y2: startPoint.y };
  events['start'].forEach(cb => cb(event, rect));
}

function makeRect (x, y) {
  return { x1: startPoint.x, y1: startPoint.y, x2: x, y2: y };
}

function handlePointerdown (event) {
  if (event.isTrusted && event.button === 0 && event[modifier] === true) {
    event.preventDefault();
    initialize(event);
  }
}

function handlePointermove (event) {
  if (!event.isTrusted || state !== ACTIVE) return;
  event.preventDefault();
  if (window.getSelection) window.getSelection().removeAllRanges();
  const rect = makeRect(event.clientX, event.clientY);
  events['update'].forEach(cb => cb(event, rect));
}

function handlePointerup (event) {
  if (!event.isTrusted) return;
  if (state === ACTIVE) {
    event.preventDefault();
    const rect = makeRect(event.clientX, event.clientY);
    events['end'].forEach(cb => cb(event, rect));
  }
  reset(true);
}

function handleVisibilitychange () {
  if (state !== PASSIVE) {
    events['abort'].forEach(cb => cb());
    reset();
  }
}

function preventDefault (event) {
  if (event.isTrusted) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function reset (suppressClick = false) {
  targetElement.removeEventListener('pointermove', handlePointermove, true);
  targetElement.removeEventListener('pointerup', handlePointerup, true);
  targetElement.removeEventListener('dragstart', preventDefault, true);
  targetElement.removeEventListener('contextmenu', preventDefault, true);
  targetElement.removeEventListener('selectstart', preventDefault, true);

  if (suppressClick) {
    // the click/auxclick following pointerup must not trigger the link
    targetElement.addEventListener('click', preventDefault, true);
    targetElement.addEventListener('auxclick', preventDefault, true);
    if (suppressTimeout !== null) clearTimeout(suppressTimeout);
    suppressTimeout = window.setTimeout(() => {
      targetElement.removeEventListener('click', preventDefault, true);
      targetElement.removeEventListener('auxclick', preventDefault, true);
      suppressTimeout = null;
    }, 300);
  }

  state = PASSIVE;
}

targetElement.addEventListener('visibilitychange', handleVisibilitychange, true);
