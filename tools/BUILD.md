# Build instructions

Source code is in `source/`. This is a fork of Gesturefy 3.2.19 (GPL-3.0) with a toolbar action menu and a thorough temporary-disable switch.

## Bundled file

Only `core/bundle/content.bundle.js` is generated. It is built from `core/content.mjs` with rollup 4. All other `.mjs` files are loaded directly as ES modules and need no build step.

Create `rollup.config.mjs` in the `source/` directory:

```js
const resolveId = (importee) => importee[0] === "/" ? process.cwd() + importee : null;

export default {
  input: "core/content.mjs",
  output: { file: "core/bundle/content.bundle.js", format: "cjs" },
  plugins: [{ resolveId }],
};
```

Then from the `source/` directory run:

```bash
npx rollup -c
```

The resulting `core/bundle/content.bundle.js` is byte-identical to the one shipped in the add-on.

## Modified source files

- `core/content.mjs` — added `gfTempDisabled` state/disable branch and link-selection (snap links) wiring
- `core/background.mjs` — badge sync + `openSelectedLinks` bulk-open handler
- `manifest.json` — `default_popup`, `clipboardWrite` permission, name "挥动", id `ksmao.work@outlook.com`, version 1.1
- `popup.html`, `popup.js` — action menu + snap-links config (toggle / modifier / open mode)
- `core/controllers/link-selector-controller.mjs` — NEW: modifier + left-drag selection state machine
- `core/views/link-selection-view/link-selection-view.mjs` — NEW: selection rectangle + link highlight + URL collection

The two new modules are imported by `core/content.mjs` and therefore bundled into `content.bundle.js` by rollup. The icon generator is `make_icon.py` (PIL, Microsoft YaHei Bold, 8x supersampling).

## License

Fork of Gesturefy by Robbendebiene, licensed GPL-3.0. Modifications by the submitter.
