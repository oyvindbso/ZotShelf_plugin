var EXPORTED_SYMBOLS = ["shelfAPI"];

var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

var shelfAPI = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    // Global ZotShelf object will be initialized when the main script loads
    if (typeof ZotShelf === 'undefined') {
      // Initialize a placeholder that will be replaced by the main script
      this.ZotShelf = {
        _initialized: false,
        _pendingCalls: []
      };
    }

    return {
      shelf: {
        async init() {
          try {
            Services.console.logStringMessage("ZotShelf API: init() called");
            
            // Wait for Zotero to be ready
            if (!Zotero || !Zotero.initialized) {
              Services.console.logStringMessage("ZotShelf API: Waiting for Zotero to initialize...");
              await new Promise(resolve => {
                const checkZotero = () => {
                  if (Zotero && Zotero.initialized) {
                    resolve();
                  } else {
                    setTimeout(checkZotero, 100);
                  }
                };
                checkZotero();
              });
            }

            // Load the main ZotShelf script into Zotero's context
            const scriptURL = context.extension.getURL("content/zotshelf.js");
            Services.console.logStringMessage("ZotShelf API: Loading main script from " + scriptURL);
            
            // Create a script element and inject it
            const doc = Zotero.getMainWindow().document;
            const script = doc.createElement('script');
            script.type = 'module';
            script.src = scriptURL;
            
            // Add extension context to global scope for the script
            Zotero.getMainWindow().ZotShelfExtension = context.extension;
            
            return new Promise((resolve, reject) => {
              script.onload = () => {
                Services.console.logStringMessage("ZotShelf API: Main script loaded successfully");
                resolve(true);
              };
              
              script.onerror = (error) => {
                Services.console.logStringMessage("ZotShelf API: Error loading main script: " + error);
                reject(error);
              };
              
              doc.head.appendChild(script);
            });
            
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in init: " + e);
            throw e;
          }
        },
        
        async getEpubItems(collectionID) {
          try {
            // Ensure ZotShelf is available in the main window
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow.ZotShelf && mainWindow.ZotShelf.getEpubItems) {
              return await mainWindow.ZotShelf.getEpubItems(collectionID);
            }
            Services.console.logStringMessage("ZotShelf API: ZotShelf not available in main window");
            return [];
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in getEpubItems: " + e);
            return [];
          }
        },
        
        async openEpubItem(itemID) {
          try {
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow.ZotShelf && mainWindow.ZotShelf.openEpubItem) {
              return await mainWindow.ZotShelf.openEpubItem(itemID);
            }
            return false;
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in openEpubItem: " + e);
            return false;
          }
        },
        
        getCachedCover(itemID) {
          try {
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow.ZotShelf && mainWindow.ZotShelf.getCachedCover) {
              return mainWindow.ZotShelf.getCachedCover(itemID);
            }
            return null;
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in getCachedCover: " + e);
            return null;
          }
        },
        
        cacheCover(itemID, coverData) {
          try {
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow.ZotShelf && mainWindow.ZotShelf.cacheCover) {
              return mainWindow.ZotShelf.cacheCover(itemID, coverData);
            }
            return false;
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in cacheCover: " + e);
            return false;
          }
        },
        
        setCollection(collectionID) {
          try {
            const mainWindow = Zotero.getMainWindow();
            if (mainWindow.ZotShelf && mainWindow.ZotShelf.setCollection) {
              return mainWindow.ZotShelf.setCollection(collectionID);
            }
            return false;
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in setCollection: " + e);
            return false;
          }
        }
      }
    };
  }
};