var bootstrap = {
    startup: function(data, reason) {
      // Load the main script when Zotero is ready
      Components.utils.import("resource://gre/modules/Services.jsm");
      
      // Wait for Zotero to be fully loaded
      Services.obs.addObserver(function observer(subject, topic, data) {
        Services.obs.removeObserver(observer, topic);
        
        // Load the main script
        let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Components.interfaces.mozIJSSubScriptLoader);
        
        // Load our main script
        loader.loadSubScript("chrome://zotshelf/content/zotshelf.js");
      }, "zotero-loaded", false);
    },
    
    shutdown: function(data, reason) {
      // Call the shutdown function if it exists
      if (typeof onShutdown === 'function') {
        onShutdown();
      }
    },
    
    install: function(data, reason) {},
    uninstall: function(data, reason) {}
  };
  
  // Export the bootstrap methods
  function startup(data, reason) { bootstrap.startup(data, reason); }
  function shutdown(data, reason) { bootstrap.shutdown(data, reason); }
  function install(data, reason) { bootstrap.install(data, reason); }
  function uninstall(data, reason) { bootstrap.uninstall(data, reason); }