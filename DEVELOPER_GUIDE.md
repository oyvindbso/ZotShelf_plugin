# ZotShelf for Zotero 7: Complete Plugin Overview

## Introduction

ZotShelf is a modern plugin for Zotero 7 that transforms how users interact with their EPUB library. By presenting books as visual covers in a grid layout, users can browse their collection in a more intuitive and engaging way, similar to browsing physical bookshelves or digital bookstores.

## Key Features

- **Visual Grid Layout**: Browse EPUBs as book covers instead of list entries
- **Zotero 7 Integration**: Built specifically for Zotero 7's modern architecture
- **Collection Filtering**: Filter books by Zotero's existing collections
- **Cover Extraction**: Automatically extract and display EPUB cover images
- **Responsive Design**: Adapts to different window sizes and screen resolutions
- **Smart Caching**: Optimizes performance through intelligent cover caching
- **One-Click Reading**: Open books directly in Zotero's EPUB reader
- **Dark Mode Support**: Adapts to Zotero 7's light and dark themes

## Technical Components

The plugin consists of the following key components:

1. **Core Files**
   - `manifest.json`: WebExtension manifest with plugin metadata
   - `schema.json`: Schema for Zotero experiment APIs

2. **JavaScript Modules**
   - `zotshelf.js`: Core plugin functionality and Zotero 7 integration
   - `views/shelf-view.js`: Main view implementation
   - `components/grid.js`: Grid view implementation and responsive layout
   - `components/cover-extractor.js`: EPUB parsing and cover image extraction

3. **Styling**
   - `zotshelf.css`: Modern CSS styling with Zotero 7 theme integration

## Implementation Highlights

### Modern WebExtension Architecture

ZotShelf leverages Zotero 7's modern WebExtension architecture:

1. Uses standard HTML/CSS/JS instead of XUL
2. Implements the View system for UI integration
3. Uses Zotero experiment APIs for core functionality
4. Follows modern JavaScript module patterns
5. Utilizes promise-based async/await patterns

### Advanced Cover Extraction

The plugin uses a sophisticated approach to extract covers from EPUB files:

1. Opens the EPUB as a ZIP archive using JSZip
2. Parses the container.xml to locate the OPF file
3. Uses multiple strategies to find the cover image within the OPF:
   - Meta elements with name="cover"
   - Items with IDs containing "cover"
   - Items with properties containing "cover-image"
4. Extracts the image and encodes it as base64 for display
5. Caches the result to improve performance on subsequent loads

### Responsive Grid Layout

The grid layout adapts to the available space:

1. Automatically adjusts the number of columns based on container width
2. Uses CSS Grid for modern layout capabilities
3. Implements debouncing for smooth resize handling
4. Provides visual feedback through hover effects
5. Supports both light and dark themes

### Zotero 7 Integration

ZotShelf integrates seamlessly with Zotero 7:

1. Uses Zotero's notification system to stay in sync with library changes
2. Works with Zotero's collection structure for filtering
3. Opens EPUBs in Zotero's native reader when clicked
4. Follows Zotero 7's UI design patterns and styling
5. Adapts to Zotero's theme preferences

## Installation

### Requirements

- Zotero 7.0.0 or newer
- Any operating system that supports Zotero 7 (Windows, macOS, Linux)

### Installation Steps

1. Download the `zotshelf.xpi` file
2. In Zotero 7, go to Tools → Add-ons
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded XPI file
5. Restart Zotero when prompted

### Verification

After installation:
- Look for the "Shelf" button in Zotero 7's toolbar
- Click the button to open the shelf view
- Your EPUB items should appear as covers in a grid

## Usage Guide

1. **Opening the Shelf View**:
   - Click the "Shelf" button in the Zotero toolbar
   - Alternatively, use the View menu and select "Shelf View"

2. **Browsing Your Library**:
   - Scroll through the grid to view all EPUB covers
   - Hover over a cover for a subtle highlight effect

3. **Filtering by Collection**:
   - Use the dropdown menu in the toolbar to select a specific collection
   - The dropdown preserves Zotero's collection hierarchy for easy navigation
   - Select "All Collections" to view your entire library

4. **Opening a Book**:
   - Click on any cover to open the EPUB in Zotero's reader
   - The reader will open with the selected book loaded

5. **Refreshing the View**:
   - Click the "Refresh" button to update the shelf view
   - This is useful after adding new EPUBs or changing collections

6. **Returning to Standard View**:
   - Click the "Close" button in the shelf toolbar
   - This will return you to Zotero's standard item view

## Performance Considerations

ZotShelf is designed with performance in mind:

1. **Smart Caching**: Extracted covers are cached to prevent redundant processing
2. **Lazy Loading**: Covers are extracted only when needed
3. **Debounced Updates**: UI changes during resize are optimized
4. **Efficient DOM Operations**: Minimizes DOM manipulations for better performance
5. **Memory Management**: Proper cleanup when views are closed

## Comparison with Zotero 5.x Version

This version of ZotShelf offers significant advantages over the Zotero 5.x version:

1. **Modern Architecture**: Uses WebExtension architecture instead of XUL overlays
2. **Better UI Integration**: Seamlessly integrates with Zotero 7's modern UI
3. **Improved Performance**: Uses modern JavaScript patterns for better performance
4. **Theme Support**: Properly supports both light and dark themes
5. **Future-Proof**: Built on Zotero 7's stable API for long-term compatibility

## For Developers

Developers interested in extending or modifying ZotShelf should refer to the included `DEVELOPER_GUIDE.md` for detailed technical information about:

- WebExtension architecture for Zotero 7
- Component interactions and API usage
- Cover extraction algorithm details
- Caching mechanism implementation
- Performance optimization techniques
- Debugging and testing strategies

## Conclusion

ZotShelf for Zotero 7 enhances the Zotero experience for EPUB users by providing a visual way to browse and access their digital book collection. The plugin combines modern web technologies, sophisticated EPUB parsing, responsive design, and seamless Zotero integration to create an intuitive and user-friendly interface for managing digital books.

By transforming the traditional list view into a visual bookshelf, ZotShelf makes finding and selecting books more enjoyable and efficient, especially for users with large EPUB collections.

For installation instructions, see `INSTALLATION_GUIDE.md`.
For developer documentation, see `DEVELOPER_GUIDE.md`.
For general information and updates, refer to the GitHub repository README.