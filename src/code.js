/**
 * Annotation Color Memory 1.0.4
 *
 * Remember last-used Zotero PDF annotation colors across restarts.
 * Per-tool memory: highlight / underline / note / image.
 * Never locks native color pickers or forces all tools to one color.
 *
 * Storage: Zotero preferences only (no network, no files outside prefs).
 *   extensions.zotero.annotColorMem.enabled
 *   extensions.zotero.annotColorMem.saveLast
 *   extensions.zotero.annotColorMem.highlight
 *   extensions.zotero.annotColorMem.underline
 *   extensions.zotero.annotColorMem.note
 *   extensions.zotero.annotColorMem.image
 *
 * Policy:
 * - User pick (setTool / annotation save) always wins and is written to prefs.
 * - Restore once per reader open when tools are ready.
 * - Shutdown only writes a tool color if it changed since restore snapshot.
 */
Zotero.AnnotationColorMemory = {
  _handlers: [],
  _origSave: null,
  _patched: new WeakSet(),
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
      "annotation-color-memory@zotero-plugin"
    );
    this._handlers.push(["renderToolbar", onToolbar]);

    try {
      for (const r of Zotero.Reader._readers || []) this._onReader(r);
    } catch (e) {}
    Zotero.debug("[ColorMem] started");
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

  _ensurePrefShell() {
    for (const [k, v] of [
      [this.K_ENABLED, true],
      [this.K_SAVE, true],
    ]) {
      try {
        if (Zotero.Prefs.get(k) === undefined) Zotero.Prefs.set(k, v);
      } catch (e) {
        try {
          Zotero.Prefs.set(k, v);
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

  _saveColor(type, color) {
    if (!this._on() || !type || !color) return;
    const key = this._key(type);
    if (!key) return;
    try {
      Zotero.Prefs.set(key, color);
      Zotero.debug("[ColorMem] SAVE " + type);
    } catch (e) {}
  },

  _readPrefColor(type) {
    const key = this._key(type);
    if (!key) return null;
    try {
      return Zotero.Prefs.get(key) || null;
    } catch (e) {
      return null;
    }
  },

  _onReader(reader) {
    if (!reader || !this._on()) return;
    this._patchSetTool(reader);
    this._restoreOnce(reader);
  },

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
        Zotero.debug("[ColorMem] RESTORE " + type);
      } else if (tools[type]) {
        snap[type] = tools[type].color;
      }
    }
    this._snapshots.set(reader, snap);
  },

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
        let type = tool && tool.type;
        let color = tool && tool.color;
        if (!type || !color) {
          const st = internal._state && internal._state.tool;
          if (st) {
            type = type || st.type;
            color = color || st.color;
          }
        }
        if (type && color && internal._tools && internal._tools[type]) {
          internal._tools[type].color = color;
        }
        if (type && color && self.TOOLS.includes(type)) {
          self._saveColor(type, color);
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

  _patchSaveAnnotations() {
    if (!Zotero.Annotations || !Zotero.Annotations.saveFromJSON) return;
    if (this._origSave) return;

    this._origSave = Zotero.Annotations.saveFromJSON.bind(Zotero.Annotations);
    const self = this;

    Zotero.Annotations.saveFromJSON = function (attachment, json, options) {
      try {
        if (json && json.color && self.TOOLS.includes(json.type)) {
          self._saveColor(json.type, json.color);

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
