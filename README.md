# ZotShelf for Zotero 7

ZotShelf is a Zotero 7 plugin that displays EPUB book covers in a visual grid layout, similar to a bookshelf. Browse your EPUB collection visually, filter by collections, and open books directly with a click.

## Features

- **Visual Grid Layout**: Browse your EPUB books as a collection of covers rather than text entries
- **Collection Integration**: Filter by existing Zotero collections
- **Cover Extraction**: Automatically extracts cover images from EPUB files
- **Caching System**: Optimized performance through smart caching
- **Responsive Design**: Adjusts grid layout based on available space
- **Direct Reading**: Click on a cover to open the EPUB in Zotero's reader
- **Seamless Integration**: Uses Zotero's native authentication and styling
- **Modern Architecture**: Built specifically for Zotero 7 using WebExtension framework

## Requirements

- **Zotero 7.0.0 or later**
- Any operating system that supports Zotero 7 (Windows, macOS, Linux)

## Installation

### From Release (Recommended)

1. Download the latest release (.xpi file) from the [releases page](https://github.com/yourusername/zotshelf/releases)
2. Open Zotero 7
3. Go to Tools → Add-ons
4. Click the gear icon and select "Install Add-on From File..."
5. Select the downloaded .xpi file
6. Restart Zotero when prompted

### Developer Installation

1. Clone this repository
2. Create a zip file of all the files (not the containing folder)
3. Rename the zip file to `zotshelf.xpi`
4. Follow steps 2-6 from the release installation

## Usage

### Opening ZotShelf

After installation, you can access ZotShelf in two ways:

1. Click on the "Shelf" button in the Zotero toolbar
2. Use the View menu and select "Shelf View"

### Browsing Your EPUB Library

- The shelf view displays all EPUB items in your library as book covers in a grid
- If an EPUB doesn't have a cover image, a placeholder will be shown with the title

### Filtering by Collection

- Use the collection dropdown in the top-right corner of the shelf view to filter EPUBs by collection
- The dropdown preserves Zotero's collection hierarchy for easy navigation

### Opening an EPUB

- Simply click on any cover to open the EPUB in Zotero's built-in reader

### Refreshing the View

- Click the "Refresh" button to reload your EPUB library and update the view
- This is useful if you've added new EPUBs or modified your collections

### Returning to Standard View

- Click the "Close" button to return to Zotero's standard view

## How It Works

### Cover Extraction

ZotShelf extracts covers from EPUBs using the following process:

1. Opens the EPUB file as a ZIP archive using JSZip
2. Locates the OPF file by parsing the container.xml
3. Parses the OPF file to find the cover image using multiple strategies:
   - Looking for meta elements with a "cover" name
   - Searching for items with IDs containing "cover"
   - Checking for properties containing "cover-image"
4. Extracts and encodes the image as base64 for display
5. Caches the result to avoid repeated extraction

### Caching System

To optimize performance, ZotShelf implements a caching system:

1. Extracted covers are stored in Zotero's preferences system
2. Each cache entry includes a timestamp
3. Entries expire after 7 days by default
4. The cache is loaded on startup and saved after modifications

## Troubleshooting

### No Covers Showing

Some EPUBs might not contain cover images or use non-standard methods for storing them. The plugin will display placeholders in these cases.

### Plugin Not Appearing

Make sure you've restarted Zotero after installation. Also confirm that you're running Zotero 7.0.0 or later.

### Slow Performance with Large Libraries

The plugin caches cover images, but initial extraction can be slow for very large libraries. Try filtering by collection if you have many EPUBs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgements

- Inspired by the Android app "ZotShelf"
- Built for Zotero 7 using modern WebExtension architecture