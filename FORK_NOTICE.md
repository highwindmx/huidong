# 挥动 (Huidong) — Fork Notice

This add-on is a fork of **Gesturefy** by Robbendebiene
(https://github.com/Robbendebiene/Gesturefy), distributed under the
GNU General Public License v3.0 (see LICENSE).

## What changed

- Added a browser-action popup menu with two actions: temporarily
  disable/enable all mouse gestures, and open the settings page.
- When disabled, the mouse gesture, rocker, and wheel controllers
  detach their event listeners (truly off, not just suppressing
  commands), the gesture trail is cancelled, and the state is stored
  in `browser.storage.local` so it persists across tabs and reloads.
- The toolbar icon shows a red "OFF" badge while disabled.
- Added Snap Links style link selection: hold Ctrl/Alt/Shift and left-drag
  to draw a rectangle; all links intersecting it are highlighted and can
  be opened in background tabs, foreground tabs, a new window, or copied
  to the clipboard (configurable in the popup menu).
- Renamed to "挥动" with a new add-on ID to distinguish it from the
  original listing.

## Licence

GPL-3.0. Copyright (c) Robbendebiene and contributors. Modifications
copyright (c) ksmao. This fork is provided as-is, without warranty.
