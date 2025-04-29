/**
 * ZotShelf - A Zotero 7 plugin for displaying EPUB book covers in a grid view
 * 
 * This file contains the main functionality of the ZotShelf plugin.
 */
/**
 * ZotShelf - A Zotero 7 plugin for displaying EPUB book covers in a grid view
 * 
 * This file contains the main functionality of the ZotShelf plugin.
 */

// Log that the script is being loaded
if (typeof Services !== 'undefined') {
  Services.console.logStringMessage("ZotShelf: zotshelf.js is being loaded");
}

var ZotShelf = {
    // Plugin constants
    EPUB_MIME_TYPE: 'application/epub+zip',
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    
    // Private properties
    _initialized: false,
    _cachedCovers: {},
    _currentCollection: null,
    _shelfPanel: null,
    
    /**
     * Initialize the ZotShelf plugin when Zotero is ready
     */
    init: async function() {
      if (typeof Services !== 'undefined') {
        Services.console.logStringMessage("ZotShelf: init() called");
      }
      
      if (this._initialized) return;
      
      if (typeof Zotero === 'undefined') {
        if (typeof Services !== 'undefined') {
          Services.console.logStringMessage("ZotShelf: Zotero object is undefined!");
        }
        return;
      }
      
      Zotero.debug('ZotShelf: Initializing');
      
      try {
        // Wait for Zotero to be fully loaded before initializing
        await Zotero.Promise.delay(1000);
        
        // Register style sheet
        this.registerStyleSheet();
        
        // Register the shelf view
        this.registerShelfView();
        
        // Add toolbar button
        this.registerToolbarButton();
        
        // Set up hooks and observers
        this.setupEventListeners();
        
        // Load cached covers from persistent storage
        await this.loadCachedCovers();
        
        this._initialized = true;
        Zotero.debug('ZotShelf: Initialization complete');
      } catch (e) {
        Zotero.logError('ZotShelf: Error initializing: ' + e);
        if (typeof Services !== 'undefined') {
          Services.console.logStringMessage("ZotShelf: Error in init(): " + e);
        }
      }
    },
    
    
    /**
     * Register CSS stylesheet
     */
    registerStyleSheet: function() {
      const css = 'chrome://zotshelf/content/zotshelf.css';
      const sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                    .getService(Components.interfaces.nsIStyleSheetService);
      const uri = Services.io.newURI(css, null, null);
      
      if(!sss.sheetRegistered(uri, sss.USER_SHEET)) {
        sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
      }
    },
    
    /**
     * Register the main shelf view
     */
    registerShelfView: function() {
      if (!Zotero.ViewHelpers) {
        Zotero.debug('ZotShelf: ViewHelpers not available');
        return;
      }
      
      Zotero.ViewHelpers.registerView({
        id: 'zotshelf-view',
        name: 'Shelf View',
        types: ['library', 'collection', 'search', 'trash'],
        load: (target) => {
          // Load the shelf view module dynamically
          const module = import(chrome.runtime.getURL('content/views/shelf-view.js'));
          return module.then(m => {
            const view = new m.ShelfView(target);
            view.collection = this._currentCollection;
            view.init();
            this._shelfPanel = view;
            return view;
          });
        }
      });
    },
    
    /**
     * Register toolbar button
     */
    registerToolbarButton: function() {
      // Create a toolbar button
      Zotero.Toolbar.registerButton({
        id: 'zotshelf-button',
        label: 'Shelf View',
        tooltiptext: 'View EPUBs in a shelf view',
        icon: 'chrome://zotshelf/content/assets/icon-16.png',
        onAction: () => this.toggleShelfView()
      });
    },
    
    /**
     * Set up the necessary event listeners
     */
    setupEventListeners: function() {
      // Listen for item changes to update the shelf when necessary
      let notifier = Zotero.Notifier;
      
      notifier.registerObserver(this, ['item'], 'zotshelf');
      
      // Listen for window resize
      window.addEventListener('resize', () => {
        if (this._shelfPanel && this._shelfPanel.isActive()) {
          this._shelfPanel.adjustGridLayout();
        }
      });
    },
    
    /**
     * Notifier callback
     */
    notify: function(event, type, ids, extraData) {
      if (type === 'item' && 
          (event === 'add' || event === 'modify' || event === 'delete')) {
        // Refresh the shelf view if it's open
        if (this._shelfPanel && this._shelfPanel.isActive()) {
          this._shelfPanel.refreshShelf();
        }
      }
    },
    
    /**
     * Load cached covers from Zotero's storage
     */
    loadCachedCovers: async function() {
      try {
        // Get the cache from Zotero preferences
        let cachedCoversString = Zotero.Prefs.get('zotshelf.cachedCovers');
        if (cachedCoversString) {
          let cachedData = JSON.parse(cachedCoversString);
          
          // Filter out expired cache entries
          let now = new Date().getTime();
          Object.keys(cachedData).forEach(key => {
            if (now - cachedData[key].timestamp > this.CACHE_EXPIRY) {
              delete cachedData[key];
            }
          });
          
          this._cachedCovers = cachedData;
          Zotero.debug('ZotShelf: Loaded cached covers for ' + Object.keys(this._cachedCovers).length + ' items');
        }
      } catch (e) {
        Zotero.debug('ZotShelf: Error loading cached covers: ' + e);
        this._cachedCovers = {};
      }
    },
    
    /**
     * Save cached covers to Zotero's storage
     */
    saveCachedCovers: async function() {
      try {
        let cachedCoversString = JSON.stringify(this._cachedCovers);
        Zotero.Prefs.set('zotshelf.cachedCovers', cachedCoversString);
        Zotero.debug('ZotShelf: Saved cached covers');
      } catch (e) {
        Zotero.debug('ZotShelf: Error saving cached covers: ' + e);
      }
    },
    
    /**
     * Toggle the ZotShelf view
     */
    toggleShelfView: function() {
      if (this._shelfPanel) {
        if (this._shelfPanel.isActive()) {
          Zotero.ViewManager.close('zotshelf-view');
        } else {
          Zotero.ViewManager.open('zotshelf-view');
        }
      } else {
        Zotero.ViewManager.open('zotshelf-view');
      }
    },
    
    /**
     * Set the current collection filter
     */
    setCollection: function(collectionID) {
      this._currentCollection = collectionID === 'all' ? null : collectionID;
      if (this._shelfPanel) {
        this._shelfPanel.collection = this._currentCollection;
        this._shelfPanel.refreshShelf();
      }
    },
    
    /**
     * Get all EPUB items from the library, optionally filtered by collection
     */
    getEpubItems: async function(collectionID) {
      let s = new Zotero.Search();
      
      if (collectionID) {
        s.addCondition('collectionID', 'is', collectionID);
      }
      
      s.addCondition('contentType', 'is', this.EPUB_MIME_TYPE);
      
      let itemIDs = await s.search();
      let items = await Zotero.Items.getAsync(itemIDs);
      
      Zotero.debug('ZotShelf: Found ' + items.length + ' EPUB items');
      return items;
    },
    
    /**
     * Get cached cover data for an item if available
     */
    getCachedCover: function(itemID) {
      if (this._cachedCovers[itemID] && 
          new Date().getTime() - this._cachedCovers[itemID].timestamp < this.CACHE_EXPIRY) {
        return this._cachedCovers[itemID].data;
      }
      return null;
    },
    
    /**
     * Cache cover data for an item
     */
    cacheCover: function(itemID, coverData) {
      if (coverData) {
        this._cachedCovers[itemID] = {
          data: coverData,
          timestamp: new Date().getTime()
        };
      }
    },
    
    /**
     * Open an EPUB item in Zotero's reader
     */
    openEpubItem: function(itemID) {
      Zotero.debug('ZotShelf: Opening EPUB item ' + itemID);
      
      try {
        let item = Zotero.Items.get(itemID);
        if (item) {
          Zotero.Reader.open(item.id);
        }
      } catch (e) {
        Zotero.debug('ZotShelf: Error opening EPUB: ' + e);
        alert('Error opening EPUB: ' + e);
      }
    }
  };
  
  // Initialize the plugin when Zotero is ready
  window.addEventListener('load', function() {
    ZotShelf.init();
  }, false);
  
  // Manage plugin lifecycle
  function onShutdown() {
    Zotero.Notifier.unregisterObserver(ZotShelf, 'zotshelf');
    
    // Unregister stylesheets
    const css = 'chrome://zotshelf/content/zotshelf.css';
    const sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                  .getService(Components.interfaces.nsIStyleSheetService);
    const uri = Services.io.newURI(css, null, null);
    
    if(sss.sheetRegistered(uri, sss.USER_SHEET)) {
      sss.unregisterSheet(uri, sss.USER_SHEET);
    }
    
    // Unregister view
    if (Zotero.ViewHelpers) {
      Zotero.ViewHelpers.unregisterView('zotshelf-view');
    }
  }