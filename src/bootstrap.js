/**
 * Annotation Color Memory — bootstrap (Zotero 7+)
 */
function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  await Zotero.initializationPromise;
  if (!rootURI) {
    rootURI = resourceURI.spec;
  }
  Services.scriptloader.loadSubScript(rootURI + "code.js");
  Zotero.AnnotationColorMemory.init();
}

function onMainWindowLoad({ window }, reason) {}
function onMainWindowUnload({ window }, reason) {}

function shutdown({ id, version, resourceURI, rootURI }, reason) {
  try {
    Zotero.AnnotationColorMemory?.unregister();
    delete Zotero.AnnotationColorMemory;
  } catch (e) {}
}

function uninstall(data, reason) {}
