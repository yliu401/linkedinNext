// Popup script for LinkedIn Jobs Quick Next Extension

document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const toggleButton = document.getElementById('toggleButton');
    const nextButton = document.getElementById('nextButton');
    const refreshButton = document.getElementById('refreshButton');
    
    // Check current tab
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
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
        browser.tabs.executeScript({
            code: 'document.getElementById("linkedin-quick-next") !== null'
        }, function(result) {
            if (result && result[0]) {
                toggleButton.textContent = 'Hide Quick Next Button';
            } else {
                toggleButton.textContent = 'Show Quick Next Button';
            }
        });
    }
    
    // Toggle button visibility
    toggleButton.addEventListener('click', function() {
        browser.tabs.executeScript({
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
                        // Inject the content script manually
                        'inject';
                    }
                }
            `
        }, function(result) {
            if (result && result[0] === 'hidden') {
                toggleButton.textContent = 'Show Quick Next Button';
            } else if (result && result[0] === 'shown') {
                toggleButton.textContent = 'Hide Quick Next Button';
            } else {
                // Inject content script manually
                browser.tabs.executeScript({file: 'content.js'});
                setTimeout(() => {
                    toggleButton.textContent = 'Hide Quick Next Button';
                }, 500);
            }
        });
    });
    
    // Go to next page directly
    nextButton.addEventListener('click', function() {
        browser.tabs.executeScript({
            code: `
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
                
                found ? 'success:' + usedSelector : 'not_found';
            `
        }, function(result) {
            if (result && result[0] && result[0].startsWith('success:')) {
                const selector = result[0].replace('success:', '');
                statusDiv.textContent = '✓ Clicked Next button';
                statusDiv.className = 'status active';
                setTimeout(() => window.close(), 1000);
            } else {
                statusDiv.textContent = '✗ No next page available';
                statusDiv.className = 'status inactive';
            }
        });
    });
    
    // Refresh extension
    refreshButton.addEventListener('click', function() {
        browser.tabs.executeScript({file: 'content.js'});
        setTimeout(() => {
            statusDiv.textContent = '✓ Extension refreshed';
            statusDiv.className = 'status active';
        }, 500);
    });
});