// Popup script for LinkedIn Jobs Quick Next Extension

document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const toggleButton = document.getElementById('toggleButton');
    const nextButton = document.getElementById('nextButton');
    const refreshButton = document.getElementById('refreshButton');
    
    // Check current tab - try both chrome and browser APIs for compatibility
    const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
    
    browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        const isLinkedInJobs = tab.url.includes('linkedin.com/jobs');
        
        if (isLinkedInJobs) {
            statusDiv.className = 'status active';
            statusDiv.textContent = '✓ Active on LinkedIn Jobs';
            enableButtons();
        } else {
            statusDiv.className = 'status inactive';
            statusDiv.textContent = '✗ Not on LinkedIn Jobs page';
        }
    });
    
    function enableButtons() {
        toggleButton.disabled = false;
        nextButton.disabled = false;
        
        // Check if button is already visible
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (browserAPI.scripting) {
                // Manifest V3
                browserAPI.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => document.getElementById("linkedin-quick-next") !== null
                }, function(result) {
                    if (result && result[0] && result[0].result) {
                        toggleButton.textContent = 'Hide Quick Next Button';
                    } else {
                        toggleButton.textContent = 'Show Quick Next Button';
                    }
                });
            } else {
                // Manifest V2 fallback
                browserAPI.tabs.executeScript({
                    code: 'document.getElementById("linkedin-quick-next") !== null'
                }, function(result) {
                    if (result && result[0]) {
                        toggleButton.textContent = 'Hide Quick Next Button';
                    } else {
                        toggleButton.textContent = 'Show Quick Next Button';
                    }
                });
            }
        });
    }
    
    // Toggle button visibility
    toggleButton.addEventListener('click', function() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (browserAPI.scripting) {
                // Manifest V3
                browserAPI.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: toggleQuickNextButton
                }, function(result) {
                    handleToggleResult(result);
                });
            } else {
                // Manifest V2 fallback
                browserAPI.tabs.executeScript({
                    code: `
                        const existingButton = document.getElementById('linkedin-quick-next');
                        if (existingButton) {
                            existingButton.remove();
                            'hidden';
                        } else {
                            if (typeof LinkedInQuickNext !== 'undefined') {
                                new LinkedInQuickNext();
                                'shown';
                            } else {
                                'inject';
                            }
                        }
                    `
                }, function(result) {
                    handleToggleResult([{result: result[0]}]);
                });
            }
        });
        
        function handleToggleResult(result) {
            if (result && result[0]) {
                const action = result[0].result;
                if (action === 'hidden') {
                    toggleButton.textContent = 'Show Quick Next Button';
                } else if (action === 'shown') {
                    toggleButton.textContent = 'Hide Quick Next Button';
                } else if (action === 'inject') {
                    // Inject content script manually
                    if (browserAPI.scripting) {
                        browserAPI.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            files: ['content.js']
                        });
                    } else {
                        browserAPI.tabs.executeScript({file: 'content.js'});
                    }
                    setTimeout(() => {
                        toggleButton.textContent = 'Hide Quick Next Button';
                    }, 500);
                }
            }
        }
    });
    
    // Go to next page directly
    nextButton.addEventListener('click', function() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (browserAPI.scripting) {
                // Manifest V3
                browserAPI.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: clickNextPage
                }, function(result) {
                    handleNextResult(result);
                });
            } else {
                // Manifest V2 fallback
                browserAPI.tabs.executeScript({
                    code: `
                        console.log('Popup: Attempting to go to next page');
                        
                        const nextSelectors = [
                            '.jobs-search-pagination__button--next',
                            'button.jobs-search-pagination__button--next',
                            '.artdeco-button.jobs-search-pagination__button--next',
                            '.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.jobs-search-pagination__button--next'
                        ];
                        
                        let found = false;
                        let usedSelector = '';
                        
                        for (const selector of nextSelectors) {
                            try {
                                const btn = document.querySelector(selector);
                                if (btn && !btn.disabled && !btn.hasAttribute('disabled')) {
                                    btn.focus();
                                    const clickEvent = new MouseEvent('click', {
                                        view: window,
                                        bubbles: true,
                                        cancelable: true,
                                        button: 0
                                    });
                                    btn.dispatchEvent(clickEvent);
                                    btn.click();
                                    found = true;
                                    usedSelector = selector;
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        found ? 'success:' + usedSelector : 'not_found';
                    `
                }, function(result) {
                    handleNextResult([{result: result[0]}]);
                });
            }
        });
        
        function handleNextResult(result) {
            if (result && result[0] && result[0].result) {
                const resultText = result[0].result;
                if (resultText.startsWith('success:')) {
                    statusDiv.textContent = '✓ Clicked Next button';
                    statusDiv.className = 'status active';
                    setTimeout(() => window.close(), 1000);
                } else {
                    statusDiv.textContent = '✗ No next page available';
                    statusDiv.className = 'status inactive';
                }
            }
        }
    });
    
    // Refresh extension
    refreshButton.addEventListener('click', function() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (browserAPI.scripting) {
                // Manifest V3
                browserAPI.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                });
            } else {
                // Manifest V2 fallback
                browserAPI.tabs.executeScript({file: 'content.js'});
            }
            
            setTimeout(() => {
                statusDiv.textContent = '✓ Extension refreshed';
                statusDiv.className = 'status active';
            }, 500);
        });
    });
});

// Function to be injected for toggling the quick next button
function toggleQuickNextButton() {
    const existingButton = document.getElementById('linkedin-quick-next');
    if (existingButton) {
        existingButton.remove();
        return 'hidden';
    } else {
        if (typeof LinkedInQuickNext !== 'undefined') {
            new LinkedInQuickNext();
            return 'shown';
        } else {
            return 'inject';
        }
    }
}

// Function to be injected for clicking next page
function clickNextPage() {
    console.log('Popup: Attempting to go to next page');
    
    // Target the specific LinkedIn next button class
    const nextSelectors = [
        '.jobs-search-pagination__button--next',
        'button.jobs-search-pagination__button--next',
        '.artdeco-button.jobs-search-pagination__button--next',
        '.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.jobs-search-pagination__button--next'
    ];
    
    let found = false;
    let usedSelector = '';
    
    for (const selector of nextSelectors) {
        try {
            const btn = document.querySelector(selector);
            if (btn && !btn.disabled && !btn.hasAttribute('disabled')) {
                console.log('Popup: Found next button with selector:', selector);
                
                // Focus and click the button
                btn.focus();
                
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    button: 0
                });
                
                btn.dispatchEvent(clickEvent);
                btn.click();
                
                console.log('Popup: Clicked next button');
                found = true;
                usedSelector = selector;
                break;
            }
        } catch (e) {
            console.log('Popup: Error with selector:', selector, e);
            continue;
        }
    }
    
    if (!found) {
        console.log('Popup: No next button found - logging all pagination buttons for debugging');
        const allPaginationButtons = document.querySelectorAll('[class*="pagination"], button[aria-label*="Next"], button[aria-label*="next"]');
        console.log('All pagination buttons:', Array.from(allPaginationButtons).map(b => ({
            element: b,
            classes: b.className,
            text: b.textContent?.trim(),
            ariaLabel: b.getAttribute('aria-label'),
            disabled: b.disabled
        })));
    }
    
    return found ? 'success:' + usedSelector : 'not_found';
}