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
        // For WebExtensions in Zotero 7, we need to use the addon URI directly
        let uri = "chrome://zotshelf/content/zotshelf.js";
        
        // Try direct loading with less dependencies
        Services.console.logStringMessage("ZotShelf: Trying to load from: " + uri);
        
        // Try to load our main plugin file
        let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
                    
        // Load the main script
        loader.loadSubScript(uri);
        
        Services.console.logStringMessage("ZotShelf: Main script loaded successfully");
    } catch (e) {
        Services.console.logStringMessage("ZotShelf: Error loading main script: " + e.name + ": " + e.message);
        
        // Try an alternate approach for Zotero 7
        try {
            Services.console.logStringMessage("ZotShelf: Trying alternate loading approach...");
            
            // Get the add-on ID from the bootstrap data
            let addonID = "zotshelf@example.com";
            
            // Get the resource URL for the add-on
            let resourceURI = Services.io.newURI(`resource://${addonID.replace('@', '-at-')}/`);
            
            // Load the main script from the resource URI
            let scriptURI = resourceURI.resolve("content/zotshelf.js");
            Services.console.logStringMessage("ZotShelf: Trying to load from: " + scriptURI);
            
            loader.loadSubScript(scriptURI);
            Services.console.logStringMessage("ZotShelf: Main script loaded successfully via alternate approach");
        } catch (err) {
            Services.console.logStringMessage("ZotShelf: Error in alternate loading approach: " + err.name + ": " + err.message);
        }
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