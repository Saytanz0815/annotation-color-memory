<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.png">
    <img src=".github/assets/logo.png" width="120" alt="Annotation Color Memory">
  </picture>
</p>

<p align="center">
  <b>Zotero annotation colors that survive restarts</b><br>
  Highlight · Underline · Note · Image — each keeps its last color
</p>

<p align="center">
  <a href="https://github.com/Saytanz0815/annotation-color-memory/releases/latest"><img src="https://img.shields.io/github/v/release/Saytanz0815/annotation-color-memory?style=flat-square&label=release" alt="release"></a>
  <img src="https://img.shields.io/badge/Zotero-7%2B-CC2936?style=flat-square&logo=zotero&logoColor=white" alt="Zotero 7+">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"></a>
  <a href="README.md">中文</a>
</p>

---

## Why

Zotero does not persist annotation tool colors: switch tabs or restart, and the highlighter is back to the default yellow.

This plugin stores the last color used per tool in Zotero preferences and restores it the next time you open a PDF. Native pickers are never locked, and there are no network requests.

## Install

1. Download the latest `.xpi` from [Releases](https://github.com/Saytanz0815/annotation-color-memory/releases/latest)
2. In Zotero, open Tools → Plugins and drag the `.xpi` into the window
3. Restart Zotero, pick an annotation color, restart again to confirm it persists

Upgrading from **1.0.5–1.0.7**: remove the old version in the Plugins window first — those builds used a temporary plugin id, otherwise both entries will coexist. 1.0.4 and earlier can be upgraded in place.

## Features

- Per-tool memory: highlight / underline / note / image can each keep a different color
- The last color is restored when a PDF opens
- Picks take effect immediately, from the toolbar or the selection popup
- Zotero's native UI is never blocked or rewritten

## Preferences

| Key | Meaning |
|-----|---------|
| `extensions.zotero.annotColorMem.enabled` | Master switch, default `true` |
| `extensions.zotero.annotColorMem.saveLast` | Follow the last-used color, default `true` |
| `extensions.zotero.annotColorMem.highlight` | Highlight color |
| `extensions.zotero.annotColorMem.underline` | Underline color |
| `extensions.zotero.annotColorMem.note` | Note-annotation color |
| `extensions.zotero.annotColorMem.image` | Image-annotation color |

To pin colors instead of following later picks: set `saveLast` to `false`, then write the color keys yourself.

## FAQ

**Colors still reset after a restart?** Check that `enabled` and `saveLast` are `true`, pick a color once, then quit Zotero completely and reopen it.

**Why not put colors in `user.js`?** `user.js` overwrites preferences on every start, which fights this plugin's "remember last" behavior. Use the Config Editor.

## Development

```
src/
  manifest.json    # manifest
  bootstrap.js     # startup / shutdown
  code.js          # logic
```

Build (a zip of `src/` is the `.xpi`):

```bash
cd src && zip -r ../annotation-color-memory.xpi manifest.json bootstrap.js code.js
```

Load temporarily while developing: Tools → Plugins → gear → “Install Plugin From File”.

## Privacy

- No telemetry, no network requests; writes only `extensions.zotero.annotColorMem.*`
- Does not read or upload library or PDF content

## License

- Software: [MIT](LICENSE)
- Brand assets: the logos under `.github/assets/` are not MIT-licensed. Use is limited to identifying this project; do not modify or repurpose them. See “Brand assets” in [LICENSE](LICENSE)
- *Zotero* is a trademark of Corporation for Digital Scholarship. This is a third-party plugin, named only to indicate compatibility
