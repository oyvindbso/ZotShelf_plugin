/**
 * CoverExtractor - Handles extraction of cover images from EPUB files
 * 
 * This module provides functionality to extract cover images from EPUB files
 * using modern web APIs appropriate for Zotero 7.
 */

export class CoverExtractor {
    // EPUB parsing constants
    static CONTAINER_PATH = 'META-INF/container.xml';
    static COVER_XPATHS = [
      '//meta[@name="cover"]/@content',
      '//item[@id="cover"]/@href',
      '//item[@id="cover-image"]/@href',
      '//item[contains(@properties, "cover-image")]/@href',
      '//item[contains(@id, "cover")]/@href'
    ];
    
    /**
     * Extract the cover image from an EPUB item
     * 
     * @param {Zotero.Item} item - The EPUB item to extract from
     * @returns {Promise<string|null>} - Base64 encoded cover image or null if not found
     */
    static async extractCover(item) {
      console.log('CoverExtractor: Extracting cover from item', item.id);
      
      try {
        // Get the attachment file
        const attachment = await this.getEpubAttachment(item);
        if (!attachment) {
          throw new Error('No EPUB attachment found');
        }
        
        // Get the file path
        const filePath = await attachment.getFilePathAsync();
        if (!filePath) {
          throw new Error('Could not get file path for EPUB');
        }
        
        // Open the EPUB file as a ZIP archive using JSZip
        const epubData = await Zotero.File.getBinaryContentsAsync(filePath);
        const zipData = await this.openZip(epubData);
        
        // Find the OPF file path
        const opfPath = await this.getOpfPath(zipData);
        if (!opfPath) {
          throw new Error('Could not find OPF file in EPUB');
        }
        
        // Extract cover image path from OPF file
        const coverPath = await this.getCoverPathFromOpf(zipData, opfPath);
        if (!coverPath) {
          throw new Error('No cover image found in OPF');
        }
        
        // Resolve the full path to the cover image
        const fullCoverPath = this.resolvePath(opfPath, coverPath);
        
        // Extract and encode the cover image
        const coverData = await this.extractAndEncodeImage(zipData, fullCoverPath);
        
        return coverData;
      } catch (e) {
        console.error('CoverExtractor: Error extracting cover:', e);
        return null;
      }
    }
    
    /**
     * Get the EPUB attachment for an item
     * 
     * @param {Zotero.Item} item - The item to get attachment for
     * @returns {Promise<Zotero.Item|null>} - The EPUB attachment or null
     */
    static async getEpubAttachment(item) {
      // If the item itself is the EPUB attachment
      if (item.isAttachment() && 
          item.attachmentContentType === 'application/epub+zip') {
        return item;
      }
      
      // Otherwise, look for child attachments
      const attachmentIDs = await item.getAttachments();
      for (const attachmentID of attachmentIDs) {
        const attachment = await Zotero.Items.getAsync(attachmentID);
        if (attachment && 
            attachment.attachmentContentType === 'application/epub+zip') {
          return attachment;
        }
      }
      
      return null;
    }
    
    /**
     * Open a ZIP file using JSZip
     * 
     * @param {ArrayBuffer} data - Binary data of the ZIP file
     * @returns {Promise<Object>} - JSZip object
     */
    static async openZip(data) {
      try {
        // Convert ArrayBuffer to Uint8Array for JSZip
        const uint8Array = new Uint8Array(data);
        
        // Load JSZip from the extension
        const extension = window.ZotShelfExtension;
        const jszipURL = extension.getURL("lib/jszip.min.js");
        
        // Import JSZip
        const JSZipModule = await import(jszipURL);
        const JSZip = JSZipModule.default || JSZipModule;
        
        // Create new JSZip instance
        const zip = new JSZip();
        await zip.loadAsync(uint8Array);
        
        return zip;
      } catch (e) {
        console.error('CoverExtractor: Error opening ZIP:', e);
        throw e;
      }
    }
    
    /**
     * Get the path to the OPF file from the container.xml
     * 
     * @param {Object} zip - JSZip object
     * @returns {Promise<string|null>} - Path to the OPF file or null
     */
    static async getOpfPath(zip) {
      try {
        if (!zip.files[this.CONTAINER_PATH]) {
          return null;
        }
        
        // Extract container.xml
        const containerXml = await zip.files[this.CONTAINER_PATH].async('text');
        
        // Parse XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(containerXml, 'application/xml');
        
        // Check for parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          console.error('CoverExtractor: XML parsing error:', parserError.textContent);
          return null;
        }
        
        // Get the path to the OPF file
        const rootfileElement = doc.querySelector('rootfile');
        if (!rootfileElement) return null;
        
        return rootfileElement.getAttribute('full-path');
      } catch (e) {
        console.error('CoverExtractor: Error getting OPF path:', e);
        return null;
      }
    }
    
    /**
     * Get the cover image path from the OPF file
     * 
     * @param {Object} zip - JSZip object
     * @param {string} opfPath - Path to the OPF file
     * @returns {Promise<string|null>} - Path to the cover image or null
     */
    static async getCoverPathFromOpf(zip, opfPath) {
      try {
        if (!zip.files[opfPath]) {
          return null;
        }
        
        // Extract OPF file
        const opfXml = await zip.files[opfPath].async('text');
        
        // Parse XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(opfXml, 'application/xml');
        
        // Check for parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          console.error('CoverExtractor: OPF XML parsing error:', parserError.textContent);
          return null;
        }
        
        // Try multiple methods to find the cover
        
        // 1. Look for meta element with name="cover"
        const coverMeta = doc.querySelector('meta[name="cover"]');
        if (coverMeta) {
          const coverId = coverMeta.getAttribute('content');
          if (coverId) {
            const coverItem = doc.querySelector(`item[id="${coverId}"]`);
            if (coverItem) {
              return coverItem.getAttribute('href');
            }
          }
        }
        
        // 2. Look for items with cover-related properties
        const coverItems = doc.querySelectorAll('item[properties*="cover-image"], item[id*="cover"]');
        for (const item of coverItems) {
          const href = item.getAttribute('href');
          const mediaType = item.getAttribute('media-type') || '';
          
          if (href && mediaType.startsWith('image/')) {
            return href;
          }
        }
        
        // 3. Look for any image items in manifest
        const imageItems = doc.querySelectorAll('item[media-type^="image/"]');
        for (const item of imageItems) {
          const id = item.getAttribute('id') || '';
          const href = item.getAttribute('href');
          
          // Prioritize items with 'cover' in the name
          if (href && id.toLowerCase().includes('cover')) {
            return href;
          }
        }
        
        // 4. Fallback: return first image found
        if (imageItems.length > 0) {
          return imageItems[0].getAttribute('href');
        }
        
        return null;
      } catch (e) {
        console.error('CoverExtractor: Error getting cover path:', e);
        return null;
      }
    }
    
    /**
     * Resolve a relative path against a base path
     * 
     * @param {string} basePath - The base path
     * @param {string} relativePath - The relative path
     * @returns {string} - The resolved path
     */
    static resolvePath(basePath, relativePath) {
      // If the relative path is already absolute, return it
      if (relativePath.startsWith('/')) {
        return relativePath.substring(1); // Remove leading slash
      }
      
      // Get the directory of the base path
      const baseDir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
      
      // Join and normalize the paths
      let fullPath = baseDir + relativePath;
      
      // Normalize the path (handle ../ and ./)
      const parts = fullPath.split('/');
      const normalized = [];
      
      for (const part of parts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
          normalized.pop();
        } else {
          normalized.push(part);
        }
      }
      
      return normalized.join('/');
    }
    
    /**
     * Extract and encode an image from the ZIP
     * 
     * @param {Object} zip - JSZip object
     * @param {string} path - Path to the image in the ZIP
     * @returns {Promise<string|null>} - Base64 encoded image or null
     */
    static async extractAndEncodeImage(zip, path) {
      try {
        if (!zip.files[path]) {
          console.log('CoverExtractor: Cover file not found:', path);
          return null;
        }
        
        // Extract image as base64
        const base64 = await zip.files[path].async('base64');
        
        return base64;
      } catch (e) {
        console.error('CoverExtractor: Error extracting image:', e);
        return null;
      }
    }
  }