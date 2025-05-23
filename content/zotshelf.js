/**
 * ZotShelf - A Zotero 7 plugin for displaying EPUB book covers in a grid view
 * 
 * This file contains the main functionality of the ZotShelf plugin.
 */

// Ensure we're in the right context
if (typeof Zotero === 'undefined') {
  console.error('ZotShelf: Zotero not available');
}

// Initialize ZotShelf in the global window context
(function() {
  'use strict';
  
  console.log("ZotShelf: Main script loading...");
  
  // Get the extension context from the global variable set by background.js
  const extension = window.ZotShelfExtension;
  if (!extension) {
    console.error('ZotShelf: Extension context not available');
    return;
  }

  window.ZotShelf = {
    // Plugin constants
    EPUB_MIME_TYPE: 'application/epub+zip',
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    
    // Private properties
    _initialized: false,
    _cachedCovers: {},
    _currentCollection: null,
    _shelfPanel: null,
    _extension: extension,
    
    /**
     * Initialize the ZotShelf plugin
     */
    init: async function() {
      console.log("ZotShelf: init() called");
      
      if (this._initialized) {
        console.log("ZotShelf: Already initialized");
        return;
      }
      
      try {
        console.log('ZotShelf: Starting initialization...');
        
        // Wait a bit for Zotero to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Register style sheet
        await this.registerStyleSheet();
        
        // Register the shelf view
        await this.registerShelfView();
        
        // Add toolbar button
        await this.registerToolbarButton();
        
        // Set up hooks and observers
        this.setupEventListeners();
        
        // Load cached covers from persistent storage
        await this.loadCachedCovers();
        
        this._initialized = true;
        console.log('ZotShelf: Initialization complete');
        
      } catch (e) {
        console.error('ZotShelf: Error initializing:', e);
      }
    },
    
    /**
     * Register CSS stylesheet
     */
    registerStyleSheet: async function() {
      try {
        const cssURL = this._extension.getURL('content/zotshelf.css');
        console.log("ZotShelf: Loading CSS from", cssURL);
        
        const sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
        const uri = Services.io.newURI(cssURL);
        
        if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
          sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
          console.log("ZotShelf: CSS stylesheet registered");
        }
      } catch (e) {
        console.error("ZotShelf: Error registering stylesheet:", e);
      }
    },
    
    /**
     * Register the main shelf view
     */
    registerShelfView: async function() {
      try {
        if (!Zotero.ViewManager) {
          console.log('ZotShelf: ViewManager not available');
          return;
        }
        
        const self = this;
        
        Zotero.ViewManager.registerView({
          id: 'zotshelf-view',
          name: 'Shelf View',
          hint: 'EPUB Bookshelf',
          component: async function(target) {
            try {
              console.log("ZotShelf: Creating shelf view component");
              
              // Dynamically import the ShelfView module
              const viewURL = self._extension.getURL('content/views/shelf-view.js');
              const module = await import(viewURL);
              const ShelfView = module.ShelfView;
              
              const view = new ShelfView(target);
              view.collection = self._currentCollection;
              await view.init();
              self._shelfPanel = view;
              return view;
            } catch (e) {
              console.error("ZotShelf: Error creating view:", e);
              return null;
            }
          }
        });
        
        console.log("ZotShelf: Shelf view registered");
      } catch (e) {
        console.error("ZotShelf: Error registering view:", e);
      }
    },
    
    /**
     * Register toolbar button
     */
    registerToolbarButton: async function() {
      try {
        // For Zotero 7, we need to add to the existing toolbar
        const doc = window.document;
        const toolbar = doc.getElementById('zotero-toolbar');
        
        if (toolbar) {
          // Create the button element
          const button = doc.createElement('toolbarbutton');
          button.id = 'zotshelf-toolbar-button';
          button.setAttribute('label', 'Shelf View');
          button.setAttribute('tooltiptext', 'View EPUBs in a shelf view');
          button.setAttribute('class', 'zotero-tb-button');
          
          // Add click handler
          button.addEventListener('click', () => this.toggleShelfView());
          
          // Add the button to the toolbar
          toolbar.appendChild(button);
          
          console.log("ZotShelf: Toolbar button added");
        } else {
          console.log("ZotShelf: Toolbar not found");
        }
      } catch (e) {
        console.error("ZotShelf: Error registering toolbar button:", e);
      }
    },
    
    /**
     * Set up the necessary event listeners
     */
    setupEventListeners: function() {
      try {
        // Listen for item changes to update the shelf when necessary
        if (Zotero.Notifier) {
          Zotero.Notifier.registerObserver(this, ['item'], 'zotshelf');
          console.log("ZotShelf: Event listeners set up");
        }
        
        // Listen for window resize
        window.addEventListener('resize', () => {
          if (this._shelfPanel && this._shelfPanel.isActive()) {
            this._shelfPanel.adjustGridLayout();
          }
        });
      } catch (e) {
        console.error("ZotShelf: Error setting up event listeners:", e);
      }
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
          console.log('ZotShelf: Loaded cached covers for', Object.keys(this._cachedCovers).length, 'items');
        }
      } catch (e) {
        console.error('ZotShelf: Error loading cached covers:', e);
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
        console.log('ZotShelf: Saved cached covers');
      } catch (e) {
        console.error('ZotShelf: Error saving cached covers:', e);
      }
    },
    
    /**
     * Toggle the ZotShelf view
     */
    toggleShelfView: function() {
      try {
        if (this._shelfPanel && this._shelfPanel.isActive()) {
          Zotero.ViewManager.close('zotshelf-view');
        } else {
          Zotero.ViewManager.open('zotshelf-view');
        }
      } catch (e) {
        console.error('ZotShelf: Error toggling shelf view:', e);
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
      return true;
    },
    
    /**
     * Get all EPUB items from the library, optionally filtered by collection
     */
    getEpubItems: async function(collectionID) {
      try {
        let s = new Zotero.Search();
        
        if (collectionID) {
          s.addCondition('collectionID', 'is', collectionID);
        }
        
        s.addCondition('contentType', 'is', this.EPUB_MIME_TYPE);
        
        let itemIDs = await s.search();
        let items = await Zotero.Items.getAsync(itemIDs);
        
        console.log('ZotShelf: Found', items.length, 'EPUB items');
        return items;
      } catch (e) {
        console.error('ZotShelf: Error getting EPUB items:', e);
        return [];
      }
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
        
        // Save to persistent storage
        this.saveCachedCovers();
        return true;
      }
      return false;
    },
    
    /**
     * Open an EPUB item in Zotero's reader
     */
    openEpubItem: async function(itemID) {
      console.log('ZotShelf: Opening EPUB item', itemID);
      
      try {
        let item = Zotero.Items.get(itemID);
        if (item) {
          if (Zotero.Reader && Zotero.Reader.open) {
            await Zotero.Reader.open(item.id);
            return true;
          } else {
            console.error('ZotShelf: Reader not available');
            return false;
          }
        }
        return false;
      } catch (e) {
        console.error('ZotShelf: Error opening EPUB:', e);
        return false;
      }
    }
  };
  
  // Auto-initialize when the script loads
  if (Zotero && Zotero.initialized) {
    window.ZotShelf.init();
  } else {
    // Wait for Zotero to be ready
    const initWhenReady = () => {
      if (Zotero && Zotero.initialized) {
        window.ZotShelf.init();
      } else {
        setTimeout(initWhenReady, 100);
      }
    };
    initWhenReady();
  }
  
  console.log("ZotShelf: Main script loaded and initialization started");
  
})();