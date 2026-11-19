/**
 * LinkSelectionView "singleton"
 * Draws a translucent selection rectangle and highlights all <a href> elements
 * whose bounding box intersects it. Collects their URLs for bulk opening.
 */

export default {
  initialize: initialize,
  update: update,
  terminate: terminate,
  getSelectedLinks: getSelectedLinks,
  get count () { return selected.size; }
};

const Overlay = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
      Overlay.popover = "manual";
      Overlay.style = `
        all: initial !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
      `;

const Box = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
      Box.style = `
        all: initial !important;
        position: absolute !important;
        box-sizing: border-box !important;
        border: 2px solid #7b5cff !important;
        background: rgba(123, 92, 255, 0.18) !important;
        border-radius: 3px !important;
        pointer-events: none !important;
      `;

// highlight style injected once
const Style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
      Style.textContent = `
        .__huidong-link-hl {
          outline: 2px solid #ff4081 !important;
          outline-offset: 1px !important;
          background-color: rgba(255, 64, 129, 0.16) !important;
        }
      `;

const selected = new Map(); // element -> original className

function initialize (x, y) {
  if (!document.body && document.documentElement.namespaceURI !== "http://www.w3.org/1999/xhtml") return;
  selected.clear();
  Box.style.left = x + "px";
  Box.style.top = y + "px";
  Box.style.width = "0px";
  Box.style.height = "0px";
  Overlay.appendChild(Style);
  Overlay.appendChild(Box);
  (document.body ?? document.documentElement).appendChild(Overlay);
  Overlay.showPopover();
}

function normalize (rect) {
  return {
    left: Math.min(rect.x1, rect.x2),
    top: Math.min(rect.y1, rect.y2),
    right: Math.max(rect.x1, rect.x2),
    bottom: Math.max(rect.y1, rect.y2)
  };
}

function intersects (a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function update (rect) {
  if (!Overlay.isConnected) return;
  const r = normalize(rect);
  Box.style.left = r.left + "px";
  Box.style.top = r.top + "px";
  Box.style.width = (r.right - r.left) + "px";
  Box.style.height = (r.bottom - r.top) + "px";

  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    const b = link.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) continue;
    const hit = intersects(r, b);
    if (hit && !selected.has(link)) {
      selected.set(link, link.getAttribute("class"));
      link.classList.add("__huidong-link-hl");
    }
    else if (!hit && selected.has(link)) {
      restore(link);
    }
  }
}

function restore (link) {
  const original = selected.get(link);
  link.classList.remove("__huidong-link-hl");
  if (original === null) link.removeAttribute("class");
  else if (original !== undefined) link.setAttribute("class", original);
  selected.delete(link);
}

function getSelectedLinks () {
  const urls = [];
  const seen = new Set();
  for (const link of selected.keys()) {
    let href;
    try { href = link.href; } catch (e) { continue; }
    if (!href || seen.has(href)) continue;
    seen.add(href);
    urls.push(href);
  }
  return urls;
}

function terminate () {
  for (const link of Array.from(selected.keys())) restore(link);
  selected.clear();
  try { Overlay.hidePopover(); } catch (e) { /* ignore */ }
  Overlay.remove();
  Box.remove();
  Style.remove();
}
