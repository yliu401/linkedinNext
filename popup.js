// Popup script for LinkedIn Jobs Quick Next Extension

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    // Check current button visibility state
    function updateToggleButtonText() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) return;
            browserAPI.tabs.executeScript(tabs[0].id, {
                code: `(function() {
                    var btn = document.getElementById('linkedin-quick-next');
                    if (!btn) return 'missing';
                    return btn.style.display === 'none' ? 'hidden' : 'visible';
                })();`
            }, function(result) {
                if (browserAPI.runtime.lastError) {
                    toggleButton.textContent = 'Show Button';
                    return;
                }
                if (result && result[0] === 'hidden') {
                    toggleButton.textContent = 'Show Button';
                } else if (result && result[0] === 'visible') {
                    toggleButton.textContent = 'Hide Button';
                } else {
                    toggleButton.textContent = 'Show Button';
                }
            });
        });
    }

    updateToggleButtonText();

    // Toggle button visibility
    toggleButton.addEventListener('click', function() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) return;
            const tabId = tabs[0].id;

            browserAPI.tabs.executeScript(tabId, {
                code: `(function() {
                    var btn = document.getElementById('linkedin-quick-next');
                    if (btn) {
                        if (btn.style.display === 'none') {
                            btn.style.display = '';
                            return 'shown';
                        } else {
                            btn.style.display = 'none';
                            return 'hidden';
                        }
                    }
                    return 'missing';
                })();`
            }, function(result) {
                if (result && result[0] === 'shown') {
                    toggleButton.textContent = 'Hide Button';
                } else if (result && result[0] === 'hidden') {
                    toggleButton.textContent = 'Show Button';
                } else {
                    // Button doesn't exist, try to inject content script
                    browserAPI.tabs.executeScript(tabId, {
                        file: 'content.js'
                    }, function() {
                        toggleButton.textContent = 'Hide Button';
                    });
                }
            });
        });
    });
});
