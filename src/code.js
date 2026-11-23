/**
 * Annotation Color Memory 1.0.7
 *
 * Symptom (1.0.3): restart always showed first-saved colors (e.g. underline
 * orange / highlight yellow) even after picking new colors.
 *
 * Root causes fixed here:
 * 1) Shutdown `_saveAllOpenReaders` wrote `tools[x].color` over fresher
 *    values saved on pick — tool color is often still the restored default
 *    when user picks color in the selection popup (popup does not call setTool).
 * 2) setTool hook only saved when `params.type` was present; some calls
 *    pass only `{ color }`. Now read the live tool AFTER orig() runs.
 * 3) Never re-apply restore during a session after the user has chosen
 *    a new color (snapshot compare).
 *
 * Policy:
 * - User pick (setTool / annotation save) ALWAYS wins and is written to prefs.
 * - Restore runs once per reader open when tools are ready.
 * - Shutdown only writes a tool color if it changed since this reader's
 *   restore snapshot (i.e. user actually switched the tool).
 * - Never lock pickers, never sync all tools to one color.
 */
Zotero.AnnotationColorMemory = {
  _handlers: [],
  _origSave: null,
  _patched: new WeakSet(),
  // reader -> { highlight, underline, note, image } colors at restore time
  _snapshots: new WeakMap(),
  _shutdownHooked: false,

  K_ENABLED: "extensions.zotero.annotColorMem.enabled",
  K_SAVE: "extensions.zotero.annotColorMem.saveLast",
  K_HIGHLIGHT: "extensions.zotero.annotColorMem.highlight",
  K_UNDERLINE: "extensions.zotero.annotColorMem.underline",
  K_NOTE: "extensions.zotero.annotColorMem.note",
  K_IMAGE: "extensions.zotero.annotColorMem.image",
  TOOLS: ["highlight", "underline", "note", "image"],

  init() {
    this._migrateLegacyPrefs();
    this._ensurePrefShell();
    this._patchSaveAnnotations();
    this._hookShutdownSave();

    const onToolbar = (event) => {
      try {
        this._onReader(event.reader);
      } catch (e) {
        Zotero.debug("[ColorMem] " + e);
      }
    };
    Zotero.Reader.registerEventListener(
      "renderToolbar",
      onToolbar,
      "annotcolormem@local"
    );
    this._handlers.push(["renderToolbar", onToolbar]);

    try {
      for (const r of Zotero.Reader._readers || []) this._onReader(r);
    } catch (e) {}
    Zotero.debug("[ColorMem] 1.0.4 started");
  },

  unregister() {
    for (const [type, handler] of this._handlers) {
      try {
        Zotero.Reader.unregisterEventListener(type, handler);
      } catch (e) {}
    }
    this._handlers = [];
    try {
      if (this._origSave && Zotero.Annotations) {
        Zotero.Annotations.saveFromJSON = this._origSave;
        this._origSave = null;
      }
    } catch (e) {}
  },

  /** Builds before 1.0.7 called Prefs.get/set without the `global` flag, so values
   *  landed under a doubled prefix (extensions.zotero.extensions.zotero.*).
   *  Copy those into the documented keys once, then drop the stray ones. */
  _migrateLegacyPrefs() {
    const base = "extensions.zotero.annotColorMem.";
    for (const name of ["enabled", "saveLast", "highlight", "underline", "note", "image"]) {
      const key = base + name;
      const legacy = "extensions.zotero." + key;
      try {
        const v = Zotero.Prefs.get(legacy, true);
        if (v === undefined || v === null) continue;
        Zotero.Prefs.set(key, v, true);
        try {
          if (typeof Zotero.Prefs.clear === "function") Zotero.Prefs.clear(legacy, true);
        } catch (e) {}
        Zotero.debug("[ColorMem] MIGRATE " + name);
      } catch (e) {}
    }
  },

  _ensurePrefShell() {
    for (const [k, v] of [
      [this.K_ENABLED, true],
      [this.K_SAVE, true],
    ]) {
      try {
        if (Zotero.Prefs.get(k, true) === undefined) Zotero.Prefs.set(k, v, true);
      } catch (e) {
        try {
          Zotero.Prefs.set(k, v, true);
        } catch (e2) {}
      }
    }
  },

  _on() {
    try {
      return (
        Zotero.Prefs.get(this.K_ENABLED, true) !== false &&
        Zotero.Prefs.get(this.K_SAVE, true) !== false
      );
    } catch (e) {
      return true;
    }
  },

  _key(type) {
    if (type === "highlight") return this.K_HIGHLIGHT;
    if (type === "underline") return this.K_UNDERLINE;
    if (type === "note") return this.K_NOTE;
    if (type === "image") return this.K_IMAGE;
    return null;
  },

  _internal(reader) {
    try {
      return reader?._internalReader || reader;
    } catch (e) {
      return reader;
    }
  },

  _toolsOf(reader) {
    const internal = this._internal(reader);
    return (internal && internal._tools) || reader?._tools || null;
  },

  /** Explicit user choice — always overwrite prefs. */
  _saveColor(type, color) {
    if (!this._on() || !type || !color) return;
    const key = this._key(type);
    if (!key) return;
    try {
      Zotero.Prefs.set(key, color, true);
      Zotero.debug("[ColorMem] SAVE " + type + " => " + color);
    } catch (e) {}
  },

  _readPrefColor(type) {
    const key = this._key(type);
    if (!key) return null;
    try {
      return Zotero.Prefs.get(key, true) || null;
    } catch (e) {
      return null;
    }
  },

  _onReader(reader) {
    if (!reader || !this._on()) return;
    this._patchSetTool(reader);
    this._restoreOnce(reader);
  },

  /**
   * Restore once when tools are ready. Record a snapshot of what we applied.
   * Do NOT restore again later (would clobber in-session picks).
   */
  _restoreOnce(reader) {
    const tools = this._toolsOf(reader);
    if (!tools || !tools.highlight) return;
    if (this._snapshots.has(reader)) return;

    const snap = {};
    for (const type of this.TOOLS) {
      const saved = this._readPrefColor(type);
      if (saved && tools[type]) {
        tools[type].color = saved;
        snap[type] = saved;
        Zotero.debug("[ColorMem] RESTORE " + type + " => " + saved);
      } else if (tools[type]) {
        snap[type] = tools[type].color;
      }
    }
    this._snapshots.set(reader, snap);
  },

  /**
   * Hook setTool on the internal reader object.
   * Bind orig first (avoid Proxy recursion). After orig(), read live tool
   * type/color so `{color: '...'}` without type still persists.
   */
  _patchSetTool(reader) {
    if (this._patched.has(reader)) return;
    const internal = this._internal(reader);
    if (!internal || typeof internal.setTool !== "function") return;
    if (internal.__acmPatched) return;

    const orig = internal.setTool.bind(internal);
    const self = this;

    internal.setTool = function (tool) {
      const result = orig(tool);
      try {
        // Prefer explicit type in args; else use the active tool after update
        let type = tool && tool.type;
        let color = tool && tool.color;
        if (!type || !color) {
          const st = internal._state && internal._state.tool;
          if (st) {
            type = type || st.type;
            color = color || st.color;
          }
        }
        // Also merge into tools map so later reads see the new color
        if (type && color && internal._tools && internal._tools[type]) {
          internal._tools[type].color = color;
        }
        if (type && color && self.TOOLS.includes(type)) {
          self._saveColor(type, color);
          // Update snapshot so shutdown does not think this is "unchanged"
          const snap = self._snapshots.get(reader) || {};
          snap[type] = color;
          self._snapshots.set(reader, snap);
        }
      } catch (e) {}
      return result;
    };
    internal.__acmPatched = true;
    this._patched.add(reader);
  },

  /**
   * Shutdown: only persist tool colors that CHANGED since restore snapshot.
   * Never overwrite a fresher explicit pick with a stale tool color.
   */
  _saveChangedSinceSnapshot() {
    if (!this._on()) return;
    try {
      for (const r of Zotero.Reader._readers || []) {
        const tools = this._toolsOf(r);
        if (!tools) continue;
        const snap = this._snapshots.get(r) || {};
        for (const type of this.TOOLS) {
          const now = tools[type] && tools[type].color;
          if (!now) continue;
          if (snap[type] && snap[type] !== now) {
            this._saveColor(type, now);
          }
        }
      }
    } catch (e) {}
  },

  _hookShutdownSave() {
    if (this._shutdownHooked) return;
    this._shutdownHooked = true;
    const self = this;
    try {
      if (typeof Zotero.addShutdownListener === "function") {
        Zotero.addShutdownListener(function () {
          try {
            self._saveChangedSinceSnapshot();
          } catch (e) {}
        });
      }
    } catch (e) {}
  },

  /**
   * Selection popup pick → annotation is created with a color (no setTool).
   * This MUST win and update prefs + tools[type].color + snapshot.
   */
  _patchSaveAnnotations() {
    if (!Zotero.Annotations || !Zotero.Annotations.saveFromJSON) return;
    if (this._origSave) return;

    this._origSave = Zotero.Annotations.saveFromJSON.bind(Zotero.Annotations);
    const self = this;

    Zotero.Annotations.saveFromJSON = function (attachment, json, options) {
      try {
        if (json && json.color && self.TOOLS.includes(json.type)) {
          self._saveColor(json.type, json.color);

          // Reflect into open readers' tools + snapshots so shutdown won't revert
          for (const r of Zotero.Reader._readers || []) {
            const internal = self._internal(r);
            const tools = self._toolsOf(r);
            if (tools && tools[json.type]) {
              tools[json.type].color = json.color;
            }
            if (internal && internal._tools && internal._tools[json.type]) {
              internal._tools[json.type].color = json.color;
            }
            const snap = self._snapshots.get(r) || {};
            snap[json.type] = json.color;
            self._snapshots.set(r, snap);
          }
        }
      } catch (e) {}
      return self._origSave(attachment, json, options);
    };
  },
};
