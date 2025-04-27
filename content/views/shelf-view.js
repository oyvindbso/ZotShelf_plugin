/**
 * ShelfView - Main view component for ZotShelf
 * 
 * This module is responsible for rendering the shelf view UI
 * and handling its interactions.
 */

// Import dependencies
import { CoverExtractor } from '../components/cover-extractor.js';
import { GridManager } from '../components/grid.js';

export class ShelfView {
  /**
   * Constructor
   * 
   * @param {Element} container - The container element where the view will be rendered
   */
  constructor(container) {
    this.container = container;
    this.collection = null;
    this.isLoading = false;
    this.gridManager = null;
    this._active = false;
    this._itemsWithCovers = [];
    this._domInitialized = false;
  }
  
  /**
   * Initialize the view
   */
  async init() {
    if (!this._domInitialized) {
      this._initializeDOM();
      this._domInitialized = true;
    }
    
    this._active = true;
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Populate collections dropdown
    this._populateCollectionSelector();
    
    // Refresh the shelf
    await this.refreshShelf();
  }
  
  /**
   * Initialize the DOM structure
   */
  _initializeDOM() {
    // Create main container
    const viewContainer = document.createElement('div');
    viewContainer.className = 'zotshelf-container';
    
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'zotshelf-toolbar';
    
    // Add title
    const title = document.createElement('div');
    title.className = 'zotshelf-title';
    title.textContent = 'ZotShelf: Your EPUB Library';
    toolbar.appendChild(title);
    
    // Add spacer
    const spacer = document.createElement('div');
    spacer.className = 'zotshelf-spacer';
    toolbar.appendChild(spacer);
    
    // Add collection selector
    const collectionSelector = document.createElement('select');
    collectionSelector.className = 'zotshelf-collection-selector';
    collectionSelector.id = 'zotshelf-collection-selector';
    toolbar.appendChild(collectionSelector);
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'zotshelf-button';
    refreshButton.textContent = 'Refresh';
    refreshButton.title = 'Refresh the shelf view';
    refreshButton.id = 'zotshelf-refresh-button';
    toolbar.appendChild(refreshButton);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'zotshelf-button';
    closeButton.textContent = 'Close';
    closeButton.title = 'Close the shelf view';
    closeButton.id = 'zotshelf-close-button';
    toolbar.appendChild(closeButton);
    
    viewContainer.appendChild(toolbar);
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'zotshelf-grid-container';
    gridContainer.id = 'zotshelf-grid-container';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'zotshelf-grid';
    grid.id = 'zotshelf-grid';
    gridContainer.appendChild(grid);
    
    viewContainer.appendChild(gridContainer);
    
    // Create status container (for loading indicators)
    const statusContainer = document.createElement('div');
    statusContainer.className = 'zotshelf-status-container';
    statusContainer.id = 'zotshelf-status-container';
    statusContainer.style.display = 'none';
    
    // Add loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'zotshelf-loading-progress';
    statusContainer.appendChild(loadingSpinner);
    
    // Add status message
    const statusMessage = document.createElement('div');
    statusMessage.className = 'zotshelf-status-message';
    statusMessage.id = 'zotshelf-status-message';
    statusMessage.textContent = 'Loading your EPUB library...';
    statusContainer.appendChild(statusMessage);
    
    viewContainer.appendChild(statusContainer);
    
    // Append the entire view to the container
    this.container.appendChild(viewContainer);
    
    // Initialize grid manager
    this.gridManager = new GridManager(document.getElementById('zotshelf-grid'));
  }
  
  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Collection selector
    const collectionSelector = document.getElementById('zotshelf-collection-selector');
    if (collectionSelector) {
      collectionSelector.addEventListener('change', (e) => {
        const collectionID = e.target.value;
        ZotShelf.setCollection(collectionID);
      });
    }
    
    // Refresh button
    const refreshButton = document.getElementById('zotshelf-refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.refreshShelf();
      });
    }
    
    // Close button
    const closeButton = document.getElementById('zotshelf-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }
  }
  
  /**
   * Close the view
   */
  close() {
    this._active = false;
    Zotero.ViewManager.close('zotshelf-view');
  }
  
  /**
   * Check if the view is active
   */
  isActive() {
    return this._active;
  }
  
  /**
   * Refresh the shelf view, reloading EPUBs and covers
   */
  async refreshShelf() {
    if (this.isLoading) return;
    
    Zotero.debug('ZotShelf: Refreshing shelf');
    this.isLoading = true;
    
    // Show loading indicator
    const gridContainer = document.getElementById('zotshelf-grid-container');
    const statusContainer = document.getElementById('zotshelf-status-container');
    
    if (gridContainer && statusContainer) {
      gridContainer.style.display = 'none';
      statusContainer.style.display = 'flex';
    }
    
    try {
      // Get EPUB items from the library
      const items = await ZotShelf.getEpubItems(this.collection);
      
      // Load covers for items
      const itemsWithCovers = await this._loadCoversForItems(items);
      this._itemsWithCovers = itemsWithCovers;
      
      // Hide loading indicator
      if (gridContainer && statusContainer) {
        statusContainer.style.display = 'none';
      }
      
      // Check if we have any items
      if (itemsWithCovers.length === 0) {
        this._showNoItemsMessage();
      } else {
        // Show grid container
        if (gridContainer) {
          gridContainer.style.display = 'block';
        }
        
        // Render the grid
        this.gridManager.renderGrid(
          itemsWithCovers,
          (item) => ZotShelf.openEpubItem(item.id)
        );
        
        // Adjust grid layout
        this.adjustGridLayout();
      }
      
      // Save updated cache
      await ZotShelf.saveCachedCovers();
      
    } catch (error) {
      Zotero.debug('ZotShelf: Error refreshing shelf: ' + error);
      
      // Update status message with error
      const statusMessage = document.getElementById('zotshelf-status-message');
      if (statusMessage) {
        statusMessage.textContent = 'Error loading EPUBs: ' + error;
      }
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Show a message when no items are found
   */
  _showNoItemsMessage() {
    const gridContainer = document.getElementById('zotshelf-grid-container');
    
    if (gridContainer) {
      // Clear grid and show no items message
      gridContainer.innerHTML = '';
      
      const noItemsContainer = document.createElement('div');
      noItemsContainer.className = 'zotshelf-no-items';
      
      const noItemsIcon = document.createElement('div');
      noItemsIcon.className = 'zotshelf-no-items-icon';
      noItemsIcon.textContent = '📚';
      noItemsContainer.appendChild(noItemsIcon);
      
      const noItemsMessage = document.createElement('div');
      noItemsMessage.textContent = 'No EPUB items found in this collection.';
      noItemsContainer.appendChild(noItemsMessage);
      
      const noItemsTip = document.createElement('div');
      noItemsTip.textContent = 'Try selecting a different collection or adding some EPUBs to your library.';
      noItemsContainer.appendChild(noItemsTip);
      
      gridContainer.appendChild(noItemsContainer);
      gridContainer.style.display = 'block';
    }
  }
  
  /**
   * Adjust the grid layout based on container width
   */
  adjustGridLayout() {
    if (this.gridManager) {
      this.gridManager.adjustLayout();
    }
  }
  
  /**
   * Load covers for a list of EPUB items
   */
  async _loadCoversForItems(items) {
    let itemsWithCovers = [];
    
    for (let item of items) {
      let coverData = null;
      
      // Check if we have a valid cache entry
      coverData = ZotShelf.getCachedCover(item.id);
      
      if (coverData) {
        Zotero.debug('ZotShelf: Using cached cover for item ' + item.id);
      } else {
        // Extract cover from the EPUB
        try {
          coverData = await CoverExtractor.extractCover(item);
          
          // Cache the cover data
          if (coverData) {
            ZotShelf.cacheCover(item.id, coverData);
          }
        } catch (e) {
          Zotero.debug('ZotShelf: Error extracting cover: ' + e);
        }
      }
      
      itemsWithCovers.push({
        id: item.id,
        title: item.getField('title'),
        coverData: coverData
      });