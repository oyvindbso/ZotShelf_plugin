function startup(data, reason) {
    // Import required modules
    Components.utils.import("resource://gre/modules/Services.jsm");
    
    // Log startup
    Services.console.logStringMessage("ZotShelf: Plugin starting up!");
    
    // Wait for Zotero to be fully loaded before initializing our plugin
    if (typeof Zotero === 'undefined') {
        Services.obs.addObserver(function observer(subject, topic, data) {
            Services.obs.removeObserver(observer, topic);
            initializePlugin();
        }, "zotero-loaded", false);
    } else {
        initializePlugin();
    }
}

function initializePlugin() {
    Services.console.logStringMessage("ZotShelf: Initializing plugin...");
    
    // Try a direct approach for Zotero 7
    try {
        // Create a direct require function for the add-on
        let id = "zotshelf@example.com";
        let baseURI = "chrome://zotshelf/content/";
        
        Services.console.logStringMessage("ZotShelf: Attempting to load from: " + baseURI + "zotshelf.js");
        
        // Get script loader
        let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                     .getService(Components.interfaces.mozIJSSubScriptLoader);
        
        // Load directly
        loader.loadSubScript(baseURI + "zotshelf.js");
        
        Services.console.logStringMessage("ZotShelf: Successfully loaded main script");
    } catch (e) {
        Services.console.logStringMessage("ZotShelf: Error loading main script: " + e);
        
        // Try an alternative approach
        try {
            Services.console.logStringMessage("ZotShelf: Trying alternative loading method...");
            
            // Create a temporary event to communicate with the background page
            let appStartupComplete = false;
            let startupObserver = {
                observe: function(subject, topic, data) {
                    if (topic == "zotero-ready") {
                        appStartupComplete = true;
                        Services.console.logStringMessage("ZotShelf: Zotero is ready");
                        
                        // Add a simple button to test
                        try {
                            if (typeof Zotero != 'undefined' && 
                                typeof Zotero.Toolbar != 'undefined' && 
                                typeof Zotero.Toolbar.registerButton == 'function') {
                                
                                Zotero.Toolbar.registerButton({
                                    id: 'zotshelf-button',
                                    label: 'ZotShelf',
                                    tooltiptext: 'View EPUBs in a shelf view',
                                    onAction: function() {
                                        alert('ZotShelf button clicked!');
                                    }
                                });
                                
                                Services.console.logStringMessage("ZotShelf: Successfully registered button directly");
                            } else {
                                Services.console.logStringMessage("ZotShelf: Zotero.Toolbar is not available");
                            }
                        } catch (e) {
                            Services.console.logStringMessage("ZotShelf: Error registering button: " + e);
                        }
                    }
                }
            };
            
            Services.obs.addObserver(startupObserver, "zotero-ready", false);
            
        } catch (e2) {
            Services.console.logStringMessage("ZotShelf: Error in alternative method: " + e2);
        }
    }
}

function shutdown(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin shutting down");
}

function install(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin installed");
}

function uninstall(data, reason) {
    Services.console.logStringMessage("ZotShelf: Plugin uninstalled");
}