# Annotation Color Memory

Remember the last-used Zotero PDF annotation color for each tool (highlight, underline, note, image) across restarts.

Zotero does not persist annotation tool colors across tabs or restarts (team: “fixing that is planned”). This plugin restores them without locking the native color pickers.

## Features

- Per-tool memory (highlight / underline / note / image can be different colors)
- Restores last color when a PDF reader opens
- Updates immediately when you pick a color (toolbar or selection popup)
- Never blocks or rewrites the native color UI
- No network access; stores only Zotero preferences

## Requirements

- Zotero 7 or newer (tested up to Zotero 10.x plugin API range)

## Install (end user)

1. Download `annotation-color-memory-1.0.4.xpi` (Releases or the `dist/` folder).
2. In Zotero: **Tools → Plugins** (or Tools → Add-ons).
3. Drag the `.xpi` onto the Plugins window.
4. Restart Zotero.
5. Pick an annotation color once, then restart Zotero — the color should persist.

Uninstall: Plugins window → remove the plugin → restart.

## Preferences

Open Config Editor (Settings → Advanced → Config Editor) if needed:

| Key | Meaning |
|-----|---------|
| `extensions.zotero.annotColorMem.enabled` | Master switch (default `true`) |
| `extensions.zotero.annotColorMem.saveLast` | Follow last-used colors (default `true`) |
| `extensions.zotero.annotColorMem.highlight` | Last highlight color |
| `extensions.zotero.annotColorMem.underline` | Last underline color |
| `extensions.zotero.annotColorMem.note` | Last note-annotation color |
| `extensions.zotero.annotColorMem.image` | Last image-annotation color |

To freeze colors instead of following the last pick: set `saveLast` to `false` and set each color key yourself.

Do **not** pin color keys in `user.js` — that overwrites saved colors on every start.

## Development

Layout:

```
src/
  manifest.json    # Zotero extension manifest
  bootstrap.js     # startup / shutdown
  code.js          # logic
```

Build the `.xpi` (a zip of `src/`):

```bash
cd src
zip -r ../annotation-color-memory-1.0.4.xpi manifest.json bootstrap.js code.js
```

Or on Windows (PowerShell):

```powershell
Compress-Archive -Path src/* -DestinationPath dist/annotation-color-memory-1.0.4.xpi
```

Load temporarily while developing: Tools → Plugins → gear → “Install Plugin From File”.

## Privacy

- No telemetry, no remote requests, no file writes outside Zotero preferences.
- Does not read or upload library/PDF content.
- Preference keys use the `extensions.zotero.annotColorMem.*` namespace only.

## License

MIT — see [LICENSE](LICENSE).
