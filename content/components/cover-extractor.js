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
      Zotero.debug('CoverExtractor: Extracting cover from item ' + item.id);
      
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
        Zotero.debug('CoverExtractor: Error extracting cover: ' + e);
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
      // We use the built-in ZIP functionality in Zotero 7
      try {
        // Convert ArrayBuffer to Uint8Array for JSZip
        const uint8Array = new Uint8Array(data);
        
        // Load JSZip (available in Zotero 7)
        const JSZip = Components.utils.import('resource://zotero/jszip.js').JSZip;
        
        // Load the ZIP
        const zip = new JSZip();
        await zip.loadAsync(uint8Array);
        
        return zip;
      } catch (e) {
        Zotero.debug('CoverExtractor: Error opening ZIP: ' + e);
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
        
        // Get the path to the OPF file
        const rootfileElement = doc.querySelector('rootfile');
        if (!rootfileElement) return null;
        
        return rootfileElement.getAttribute('full-path');
      } catch (e) {
        Zotero.debug('CoverExtractor: Error getting OPF path: ' + e);
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
        
        // Try multiple methods to find the cover
        
        // 1. First, try XPath queries to find cover
        for (const xpath of this.COVER_XPATHS) {
          const result = doc.evaluate(
            xpath, 
            doc, 
            null, 
            XPathResult.STRING_TYPE, 
            null
          );
          
          const coverHref = result.stringValue;
          if (coverHref) {
            // If this is just an ID, we need to find the href
            if (!coverHref.includes('.')) {
              const itemHref = doc.evaluate(
                `//item[@id="${coverHref}"]/@href`,
                doc,
                null,
                XPathResult.STRING_TYPE,
                null
              ).stringValue;
              
              if (itemHref) return itemHref;
            } else {
              return coverHref;
            }
          }
        }
        
        // 2. Look for image with 'cover' in the ID or properties
        const items = doc.querySelectorAll('item');
        for (const item of items) {
          const id = item.getAttribute('id') || '';
          const href = item.getAttribute('href');
          const properties = item.getAttribute('properties') || '';
          const mediaType = item.getAttribute('media-type') || '';
          
          if (href && 
              mediaType.startsWith('image/') && 
              (id.includes('cover') || properties.includes('cover'))) {
            return href;
          }
        }
        
        // 3. Last resort: find the first image in the spine
        const spine = doc.querySelector('spine');
        if (spine) {
          const firstItemref = spine.querySelector('itemref');
          if (firstItemref) {
            const idref = firstItemref.getAttribute('idref');
            if (idref) {
              const item = doc.querySelector(`item[id="${idref}"]`);
              if (item) {
                return item.getAttribute('href');
              }
            }
          }
        }
        
        return null;
      } catch (e) {
        Zotero.debug('CoverExtractor: Error getting cover path: ' + e);
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
          Zotero.debug('CoverExtractor: Cover file not found: ' + path);
          return null;
        }
        
        // Extract image as base64
        const base64 = await zip.files[path].async('base64');
        
        return base64;
      } catch (e) {
        Zotero.debug('CoverExtractor: Error extracting image: ' + e);
        return null;
      }
    }
  }