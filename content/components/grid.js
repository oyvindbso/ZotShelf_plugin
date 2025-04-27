/**
 * GridManager - Handles the grid layout for ZotShelf
 * 
 * This module is responsible for rendering the grid of book covers
 * and handling responsive layout adjustments.
 */

export class GridManager {
    /**
     * Constructor
     * 
     * @param {Element} gridElement - The grid container element
     */
    constructor(gridElement) {
      this.gridElement = gridElement;
      this.items = [];
      this.onItemClick = null;
      
      // Debounce resize handling
      this.resizeTimer = null;
    }
    
    /**
     * Render the grid of book covers
     * 
     * @param {Array} items - Array of items with cover data
     * @param {Function} onItemClick - Callback function when an item is clicked
     */
    renderGrid(items, onItemClick) {
      if (!this.gridElement) {
        Zotero.debug('GridManager: No grid element available');
        return;
      }
      
      this.items = items;
      this.onItemClick = onItemClick;
      
      Zotero.debug('GridManager: Rendering grid with ' + items.length + ' items');
      
      // Clear existing content
      while (this.gridElement.firstChild) {
        this.gridElement.removeChild(this.gridElement.firstChild);
      }
      
      // Add each book to the grid
      for (let item of items) {
        const coverItem = this.createCoverItem(item);
        this.gridElement.appendChild(coverItem);
      }
      
      // Apply responsive grid adjustments
      this.adjustLayout();
    }
    
    /**
     * Create a single cover item element
     * 
     * @param {Object} item - Item data with title and cover information
     * @returns {HTMLElement} The created cover item element
     */
    createCoverItem(item) {
      // Create the main container for this book cover
      const coverItem = document.createElement('div');
      coverItem.className = 'book-cover-item';
      coverItem.setAttribute('data-item-id', item.id);
      
      // Create the cover image or placeholder
      if (item.coverData) {
        const coverImage = document.createElement('img');
        coverImage.className = 'book-cover-image';
        coverImage.src = 'data:image/jpeg;base64,' + item.coverData;
        coverImage.alt = item.title;
        coverImage.title = item.title;
        coverItem.appendChild(coverImage);
      } else {
        // Create a placeholder for items without covers
        const placeholder = document.createElement('div');
        placeholder.className = 'book-cover-placeholder';
        placeholder.textContent = 'No cover available';
        
        // Add the title to the placeholder
        const placeholderTitle = document.createElement('div');
        placeholderTitle.style.marginTop = '10px';
        placeholderTitle.style.fontWeight = 'bold';
        placeholderTitle.textContent = item.title;
        placeholder.appendChild(placeholderTitle);
        
        coverItem.appendChild(placeholder);
      }
      
      // Add the title below the cover
      const titleElement = document.createElement('div');
      titleElement.className = 'book-title';
      titleElement.textContent = item.title;
      titleElement.title = item.title; // For tooltip on hover
      coverItem.appendChild(titleElement);
      
      // Add click handler
      if (this.onItemClick) {
        coverItem.addEventListener('click', () => {
          this.onItemClick(item);
        });
      }
      
      return coverItem;
    }
    
    /**
     * Adjust the grid layout based on container width
     */
    adjustLayout() {
      if (!this.gridElement) return;
      
      // Clear any pending resize timer
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      
      // Debounce to avoid excessive calculations during resize
      this.resizeTimer = setTimeout(() => {
        const containerWidth = this.gridElement.parentElement.clientWidth;
        
        // Calculate optimal column width based on container size
        let columnCount;
        
        if (containerWidth < 500) {
          columnCount = 2;
        } else if (containerWidth < 800) {
          columnCount = 3;
        } else if (containerWidth < 1200) {
          columnCount = 5;
        } else {
          columnCount = Math.floor(containerWidth / 180); // Approximate width per item
        }
        
        // Update the grid template columns
        this.gridElement.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
        
        Zotero.debug('GridManager: Adjusted grid to ' + columnCount + ' columns');
      }, 100); // 100ms debounce
    }
  }