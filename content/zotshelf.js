// Simplified ZotShelf to just verify loading works
window.addEventListener('load', function() {
    if (typeof Services !== 'undefined') {
        Services.console.logStringMessage("ZotShelf: Minimal version loaded successfully!");
    }
    
    // Wait for Zotero to be ready
    setTimeout(function() {
        if (typeof Zotero !== 'undefined' && typeof Zotero.Toolbar !== 'undefined') {
            try {
                // Just add a button to verify things work
                Zotero.Toolbar.registerButton({
                    id: 'zotshelf-button',
                    label: 'ZotShelf Test',
                    tooltiptext: 'Test button for ZotShelf',
                    onAction: function() {
                        alert('ZotShelf test button clicked!');
                    }
                });
                
                if (typeof Services !== 'undefined') {
                    Services.console.logStringMessage("ZotShelf: Test button registered successfully!");
                }
            } catch (e) {
                if (typeof Services !== 'undefined') {
                    Services.console.logStringMessage("ZotShelf: Error registering test button: " + e);
                }
            }
        } else {
            if (typeof Services !== 'undefined') {
                Services.console.logStringMessage("ZotShelf: Zotero object not available");
            }
        }
    }, 2000);
}, false);