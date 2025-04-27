# ZotShelf Installation Guide for Zotero 7

This guide will walk you through the process of installing the ZotShelf plugin for Zotero 7 and getting started with using it.

## System Requirements

- **Zotero**: Version 7.0.0 or newer
- **Operating System**: Any OS that supports Zotero 7 (Windows, macOS, Linux)

## Installation Steps

### Method 1: Direct Installation (Recommended)

1. **Download the plugin**:
   - Download the latest `zotshelf.xpi` file from the [releases page](https://github.com/yourusername/zotshelf/releases)

2. **Install in Zotero**:
   - Open Zotero 7
   - Go to the Tools menu and select "Add-ons"
   - In the Add-ons Manager, click the gear icon in the top-right corner
   - Select "Install Add-on From File..."
   - Navigate to and select the downloaded `zotshelf.xpi` file
   - Click "Open" to install

3. **Restart Zotero**:
   - When prompted, click "Restart Now" to complete the installation
   - If not prompted, manually restart Zotero

### Method 2: Manual Installation for Developers

If you're a developer or want to install from source:

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/zotshelf.git
   ```

2. **Create the XPI file**:
   - Zip all the files in the repository (not the containing folder)
   - Rename the zip file to `zotshelf.xpi`

3. **Install in Zotero**:
   - Follow steps 2-3 from Method 1

## Verifying Installation

To verify that ZotShelf has been installed correctly:

1. Open Zotero 7
2. Look for a new "Shelf" button in the Zotero toolbar
3. Open the Add-ons Manager (Tools → Add-ons) and confirm that ZotShelf appears in the list of installed extensions

## Getting Started

### Opening the Shelf View

1. Click on the "Shelf" button in the Zotero toolbar, or
2. Use the View menu and select "Shelf View"

### Viewing Your EPUB Library

- The shelf view will display all EPUB items in your library as covers
- If an EPUB doesn't have a cover image, a placeholder will be shown with the title

### Filtering by Collection

- Use the collection dropdown in the top-right corner of the shelf view to filter EPUBs by collection
- The dropdown shows all your Zotero collections in a hierarchical structure

### Opening an EPUB

- Simply click on any cover to open the EPUB in Zotero's built-in reader

### Returning to the Standard View

- Click the "Close" button in the top-right corner to return to Zotero's standard view

## Troubleshooting

### Plugin Not Appearing

If the plugin doesn't appear after installation:

1. Make sure you've restarted Zotero completely
2. Verify that you're running Zotero 7.0.0 or later (Help → About Zotero)
3. Check the Add-ons Manager to see if the plugin is listed but disabled
4. If listed but disabled, enable it and restart Zotero

### No Covers Showing

If you don't see any covers:

1. Make sure you have EPUB items in your library
2. Some EPUBs may not contain cover images or use non-standard methods for storing them
3. The plugin will display placeholders for EPUBs without covers
4. Try refreshing the view by clicking the "Refresh" button

### Performance Issues

If you experience slow performance:

1. The first time you open the shelf view, the plugin needs to extract covers which may take time
2. Subsequent loads will be faster due to caching
3. If performance remains an issue, try reducing the number of EPUBs in your library or filter by collection
4. Check that you have enough free memory on your system

### Error Messages

If you see error messages:

1. **"Error loading EPUBs"**: This could be due to permission issues or corrupted EPUB files
2. **"Error extracting cover"**: Some EPUBs may have non-standard cover formats or no covers at all
3. **"Error opening EPUB"**: Make sure Zotero's built-in reader is working correctly

### Plugin Conflicts

If you experience unexpected behavior:

1. Try disabling other Zotero plugins temporarily to check for conflicts
2. Make sure you're using the version of ZotShelf designed for Zotero 7, not Zotero 5
3. Check for plugin updates that might resolve compatibility issues

## Updating the Plugin

To update ZotShelf to a newer version:

1. Download the latest version from the releases page
2. Go to Tools → Add-ons in Zotero
3. Click the gear icon and select "Install Add-on From File..."
4. Select the new .xpi file
5. Restart Zotero when prompted

## Uninstalling

To uninstall ZotShelf:

1. Open Zotero
2. Go to Tools → Add-ons
3. Find ZotShelf in the list of extensions
4. Click the "Remove" button
5. Restart Zotero when prompted

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub repository](https://github.com/yourusername/zotshelf) for known issues
2. Look through existing issues to see if your problem has been reported
3. Submit a new issue on GitHub with detailed information about your problem
4. Include your Zotero version, operating system, and steps to reproduce the issue