var EXPORTED_SYMBOLS = ["shelfAPI"];

var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

var shelfAPI = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    // Set up the view script URIs
    const viewURIs = {
      shelfView: context.extension.getURL("content/views/shelf-view.js"),
      coverExtractor: context.extension.getURL("content/components/cover-extractor.js"),
      grid: context.extension.getURL("content/components/grid.js")
    };

    return {
      shelf: {
        async init() {
          try {
            Services.console.logStringMessage("ZotShelf API: Initializing...");
            
            // Load our main script - note the changed URL format
            const scriptURL = context.extension.getURL("content/zotshelf.js");
            Services.console.logStringMessage("ZotShelf API: Loading script from " + scriptURL);
            
            Services.scriptloader.loadSubScript(
              scriptURL,
              { 
                Zotero, 
                ZotShelf: {}, 
                viewURIs,
                extension: context.extension 
              }
            );
            
            // Call the initialization function
            Services.console.logStringMessage("ZotShelf API: Calling init function");
            await ZotShelf.init(context.extension);
            
            return true;
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in init: " + e);
            return false;
          }
        },
        
        async getEpubItems(collectionID) {
          try {
            return await ZotShelf.getEpubItems(collectionID);
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in getEpubItems: " + e);
            return [];
          }
        },
        
        async openEpubItem(itemID) {
          try {
            return await ZotShelf.openEpubItem(itemID);
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in openEpubItem: " + e);
            return false;
          }
        },
        
        getCachedCover(itemID) {
          try {
            return ZotShelf.getCachedCover(itemID);
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in getCachedCover: " + e);
            return null;
          }
        },
        
        cacheCover(itemID, coverData) {
          try {
            return ZotShelf.cacheCover(itemID, coverData);
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in cacheCover: " + e);
            return false;
          }
        },
        
        setCollection(collectionID) {
          try {
            return ZotShelf.setCollection(collectionID);
          } catch (e) {
            Services.console.logStringMessage("ZotShelf API: Error in setCollection: " + e);
            return false;
          }
        }
      }
    };
  }
};
