/**
 * ZotShelf Bootstrap - Entry point for Zotero 7 plugin
 */

// Import necessary modules
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// Plugin lifecycle functions required by Zotero 7
function startup(data, reason) {
  Services.console.logStringMessage("ZotShelf: Bootstrap startup called");
  
  // The actual initialization will be handled by the WebExtension API
  // This bootstrap is mainly for compatibility
}

function shutdown(data, reason) {
  Services.console.logStringMessage("ZotShelf: Bootstrap shutdown called");
  
  // Cleanup will be handled by the WebExtension
  if (reason === APP_SHUTDOWN) {
    return;
  }
  
  // Unregister any global resources if needed
  try {
    // Remove CSS if registered globally
    const sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                  .getService(Components.interfaces.nsIStyleSheetService);
    
    // Note: CSS cleanup will be handled by the main script
  } catch (e) {
    Services.console.logStringMessage("ZotShelf: Error during shutdown: " + e);
  }
}

function install(data, reason) {
  Services.console.logStringMessage("ZotShelf: Bootstrap install called");
}

function uninstall(data, reason) {
  Services.console.logStringMessage("ZotShelf: Bootstrap uninstall called");
}