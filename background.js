var shelfAPI = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    const {Services} = ChromeUtils.import("resource://gre/modules/Services.jsm");

    // Set up the view script URIs
    const viewURIs = {
      shelfView: context.extension.getURL("content/views/shelf-view.js"),
      coverExtractor: context.extension.getURL("content/components/cover-extractor.js"),
      grid: context.extension.getURL("content/components/grid.js")
    };

    return {
      shelf: {
        async init() {
          // Load our main script
          Services.scriptloader.loadSubScript(
            context.extension.getURL("content/zotshelf.js"),
            { Zotero, ZotShelf: {}, viewURIs }
          );
          
          // Call the initialization function
          await ZotShelf.init();
        },
        
        async getEpubItems(collectionID) {
          return await ZotShelf.getEpubItems(collectionID);
        },
        
        async openEpubItem(itemID) {
          return await ZotShelf.openEpubItem(itemID);
        },
        
        getCachedCover(itemID) {
          return ZotShelf.getCachedCover(itemID);
        },
        
        cacheCover(itemID, coverData) {
          return ZotShelf.cacheCover(itemID, coverData);
        },
        
        setCollection(collectionID) {
          return ZotShelf.setCollection(collectionID);
        }
      }
    };
  }
};