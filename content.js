class LinkedInQuickNext {
    constructor() {
      this.nextButton = null;
      this.isInitialized = false;
      this.init();
    }
  
    init() {
      // Add debugging
      console.log('LinkedIn Quick Next: Initializing on', window.location.href);
      
      // Wait for page to load completely
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createQuickNextButton());
      } else {
        setTimeout(() => this.createQuickNextButton(), 1000); // Add delay for dynamic content
      }
  
      // Handle dynamic content changes (LinkedIn uses SPA routing)
      this.observePageChanges();
    }
  
    createQuickNextButton() {
      // Only create if we're on a jobs search page and haven't created it yet
      if (!this.isOnJobsPage() || this.isInitialized) return;
  
      // Create the floating next button
      this.nextButton = document.createElement('div');
      this.nextButton.id = 'linkedin-quick-next';
      this.nextButton.innerHTML = `
        <button id="quick-next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
          Next
        </button>
      `;
  
      // Add click handler
      const button = this.nextButton.querySelector('#quick-next-btn');
      button.addEventListener('click', () => this.goToNextPage());
  
      // Add to page
      document.body.appendChild(this.nextButton);
      this.isInitialized = true;
  
      // Update button state
      this.updateButtonState();
    }
  
    goToNextPage() {
      console.log('LinkedIn Quick Next: Attempting to go to next page');
      
      // Prevent the button from being disabled during the click
      const ourButton = document.querySelector('#quick-next-btn');
      if (ourButton) {
        ourButton.style.pointerEvents = 'none'; // Temporarily disable to prevent double clicks
        setTimeout(() => {
          if (ourButton) {
            ourButton.style.pointerEvents = 'auto';
          }
        }, 2000);
      }
      
      // Target the specific LinkedIn next button class
      const nextButtonSelectors = [
        '.jobs-search-pagination__button--next',
        'button.jobs-search-pagination__button--next',
        '.artdeco-button.jobs-search-pagination__button--next',
        
        // More specific combinations with the class you found
        '.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.jobs-search-pagination__button--next',
        '.jobs-search-pagination__button.jobs-search-pagination__button--next',
        
        // Fallback selectors
        'button[aria-label="Next"]',
        'button[aria-label="Next page"]'
      ];
  
      let nextButton = null;
      let foundSelector = '';
      
      // Try each selector
      for (const selector of nextButtonSelectors) {
        try {
          nextButton = document.querySelector(selector);
          if (nextButton && !nextButton.disabled && !nextButton.hasAttribute('disabled')) {
            foundSelector = selector;
            console.log('LinkedIn Quick Next: Found next button with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('LinkedIn Quick Next: Error with selector:', selector, e);
          continue;
        }
      }
  
      if (nextButton) {
        console.log('LinkedIn Quick Next: Next button found, attempting to click');
        console.log('Button element:', nextButton);
        
        try {
          // Don't focus to avoid page jumps
          // nextButton.focus();
          
          // Create and dispatch a click event that mimics user interaction
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            button: 0,
            buttons: 1,
            clientX: nextButton.getBoundingClientRect().left + nextButton.offsetWidth / 2,
            clientY: nextButton.getBoundingClientRect().top + nextButton.offsetHeight / 2
          });
          
          // Dispatch the event first, then call click() as backup
          const dispatched = nextButton.dispatchEvent(clickEvent);
          console.log('LinkedIn Quick Next: Event dispatched:', dispatched);
          
          // Also try direct click
          nextButton.click();
          
          console.log('LinkedIn Quick Next: Click attempted');
        //   this.showMessage('Going to next page...');
          
          // Update button state after a longer delay to allow LinkedIn to process
          setTimeout(() => {
            if (this.nextButton) {
              this.updateButtonState();
            }
          }, 3000);
          
        } catch (error) {
          console.error('LinkedIn Quick Next: Error clicking next button:', error);
          this.showMessage('Error clicking next button');
          
          // Re-enable our button if there was an error
          if (ourButton) {
            ourButton.style.pointerEvents = 'auto';
          }
        }
      } else {
        console.log('LinkedIn Quick Next: No next button found');
        this.showMessage('No next page available');
        
        // Re-enable our button
        if (ourButton) {
          ourButton.style.pointerEvents = 'auto';
        }
        
        // Debug: Show all pagination-related buttons
        const allPaginationButtons = document.querySelectorAll('[class*="pagination"], button[aria-label*="Next"], button[aria-label*="next"]');
        console.log('LinkedIn Quick Next: All pagination buttons found:', 
          Array.from(allPaginationButtons).map(btn => ({
            element: btn,
            classes: btn.className,
            text: btn.textContent?.trim(),
            ariaLabel: btn.getAttribute('aria-label'),
            disabled: btn.disabled
          }))
        );
      }
    }
  
    updateButtonState() {
      if (!this.nextButton) return;
  
      const button = this.nextButton.querySelector('#quick-next-btn');
      
      // Check if next page is available
      const hasNext = this.hasNextPage();
      
      if (hasNext) {
        button.disabled = false;
        button.classList.remove('disabled');
      } else {
        button.disabled = true;
        button.classList.add('disabled');
      }
    }
  
    hasNextPage() {
      console.log('LinkedIn Quick Next: Checking if next page is available');
      
      // Check for the specific LinkedIn next button class you provided
      const nextButtonSelectors = [
        '.jobs-search-pagination__button--next:not([disabled])',
        'button.jobs-search-pagination__button--next:not([disabled])',
        '.artdeco-button.jobs-search-pagination__button--next:not([disabled])'
      ];
  
      for (const selector of nextButtonSelectors) {
        try {
          const nextBtn = document.querySelector(selector);
          if (nextBtn && !nextBtn.disabled && !nextBtn.hasAttribute('disabled')) {
            console.log('LinkedIn Quick Next: Next page available via selector:', selector);
            return true;
          }
        } catch (e) {
          continue;
        }
      }
  
      console.log('LinkedIn Quick Next: No next page available');
      return false;
    }
  
    isOnJobsPage() {
      const result = window.location.href.includes('/jobs/') || 
             window.location.pathname.startsWith('/jobs/');
      console.log('LinkedIn Quick Next: Is jobs page check:', result, window.location.href);
      return result;
    }
  
    showMessage(text) {
      // Create temporary message
      const message = document.createElement('div');
      message.className = 'quick-next-message';
      message.textContent = text;
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 10001;
        font-size: 14px;
      `;
  
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
    }
  
    observePageChanges() {
      // Watch for URL changes (SPA navigation) but don't reinitialize on every change
      let lastUrl = location.href;
      let urlChangeTimeout = null;
      
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          console.log('LinkedIn Quick Next: URL changed to:', url);
          
          // Clear any pending timeout
          if (urlChangeTimeout) {
            clearTimeout(urlChangeTimeout);
          }
          
          // Only reinitialize after URL has been stable for a bit (avoid rapid changes)
          urlChangeTimeout = setTimeout(() => {
            if (this.isOnJobsPage()) {
              // Don't remove existing button, just update its state
              if (this.isInitialized && this.nextButton) {
                console.log('LinkedIn Quick Next: Updating existing button state after navigation');
                this.updateButtonState();
              } else {
                // Only create if button doesn't exist
                console.log('LinkedIn Quick Next: Creating button after navigation');
                this.createQuickNextButton();
              }
            } else if (!this.isOnJobsPage() && this.nextButton) {
              // Only remove if we're not on a jobs page
              console.log('LinkedIn Quick Next: Removing button - not on jobs page');
              this.nextButton.remove();
              this.nextButton = null;
              this.isInitialized = false;
            }
          }, 1000); // Wait 1 second for page to stabilize
        }
        
        // Update button state when page content changes (but don't recreate)
        if (this.isInitialized && this.isOnJobsPage() && this.nextButton) {
          // Debounce the update to avoid too frequent calls
          clearTimeout(this.updateTimeout);
          this.updateTimeout = setTimeout(() => {
            this.updateButtonState();
          }, 500);
        }
      }).observe(document, { subtree: true, childList: true });
    }
  }
  
  // Initialize the extension
  new LinkedInQuickNext();