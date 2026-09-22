<p align="center">
  <img src="logo.png" width="120" alt="Annotation Color Memory">
</p>

# Annotation Color Memory

<p align="center">
  <b>Zotero annotation colors that survive restarts</b><br>
  Highlight · Underline · Note · Image — each keeps its last color
</p>

<p align="center">
  <b>English</b> · <a href="README.md">中文</a>
</p>

<p align="center">
  <a href="https://github.com/Saytanz0815/annotation-color-memory/releases"><img src="https://img.shields.io/github/v/release/Saytanz0815/annotation-color-memory?style=flat-square&label=release" alt="release"></a>
  <img src="https://img.shields.io/badge/Zotero-7%2B-CC2936?style=flat-square&logo=zotero&logoColor=white" alt="Zotero 7+">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"></a>
  <a href="https://github.com/Saytanz0815/annotation-color-memory/stargazers"><img src="https://img.shields.io/github/stars/Saytanz0815/annotation-color-memory?style=flat-square&label=stars" alt="stars"></a>
</p>

---

## Why

Zotero does not persist annotation tool colors across tabs or restarts (team: “fixing that is planned”).

This plugin restores the last-used color **without locking the native color pickers**. No network, no telemetry — only Zotero preferences.

## Features

- **Per-tool memory** — highlight / underline / note / image can use different colors
- **Restore on PDF open** — the reader starts with your last palette
- **Instant updates** — toolbar and selection popup both count
- **Native UI untouched** — never blocks or rewrites the color picker
- **Local only** — no network; data stays in Zotero preferences

## Requirements

- Zotero 7 or newer (tested up to the Zotero 10.x plugin API range)

## Install

1. Download [`annotation-color-memory-1.0.4.xpi`](https://github.com/Saytanz0815/annotation-color-memory/releases/latest) (Releases or `dist/`)
2. Zotero → **Tools → Plugins** (or Tools → Add-ons)
3. Drag the `.xpi` onto the Plugins window, then restart Zotero
4. Pick an annotation color once, restart again — the color should persist

Uninstall: remove the plugin in the Plugins window, then restart Zotero.

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

To freeze colors instead of following the last pick: set `saveLast` to `false`, then set each color key yourself.

## FAQ

**Colors still reset after install?**  
Pick a color once, restart Zotero, and check again. If it still fails, confirm `extensions.zotero.annotColorMem.enabled` is `true` and Zotero ≥ 7.

**Can I pin one color and ignore later picks?**  
Yes. Set `saveLast` to `false`, then write the `highlight` / `underline` / `note` / `image` keys yourself.

**Why not put colors in `user.js`?**  
`user.js` overwrites saved colors on every start and fights this plugin’s “remember last” behavior. Use Config Editor only.

## Development

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

Windows (PowerShell):

```powershell
Compress-Archive -Path src/* -DestinationPath dist/annotation-color-memory-1.0.4.xpi
```

Load temporarily while developing: Tools → Plugins → gear → “Install Plugin From File”.

## Privacy

- No telemetry, no remote requests, no file writes outside Zotero preferences
- Does not read or upload library/PDF content
- Preference keys use the `extensions.zotero.annotColorMem.*` namespace only

## License

MIT — see [LICENSE](LICENSE).
