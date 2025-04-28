function startup(data, reason) {
    // Import required modules
    Components.utils.import("resource://gre/modules/Services.jsm");
    
    // Log startup
    Services.console.logStringMessage("ZotShelf: Plugin starting up!");
    
    // Wait for Zotero to be fully loaded before initializing our plugin
    if (typeof Zotero === 'undefined') {
        Services.obs.addObserver(function observer(subject, topic, data) {
            Services.obs.removeObserver(observer, topic);
            initializeZotShelf();
        }, "zotero-loaded", false);
    } else {
        initializeZotShelf();
    }
}

function initializeZotShelf() {
    Services.console.logStringMessage("ZotShelf: Initializing plugin...");
    
    try {
        // Try to load our main plugin file
        let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
                    
        // Load the main script - this will execute ZotShelf.init()
        loader.loadSubScript("chrome://zotshelf/content/zotshelf.js");
        
        Services.console.logStringMessage("ZotShelf: Main script loaded successfully");
    } catch (e) {
        Services.console.logStringMessage("ZotShelf: Error loading main script: " + e);
    }
}

function shutdown(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin shutting down");
    
    // Try to run the onShutdown function if it exists
    if (typeof onShutdown === 'function') {
        try {
            onShutdown();
        } catch (e) {
            Services.console.logStringMessage("ZotShelf: Error during shutdown: " + e);
        }
    }
}

function install(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin installed");
}

function uninstall(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin uninstalled");
}