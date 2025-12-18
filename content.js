class LinkedInQuickNext {
    constructor() {
      this.nextButton = null;
      this.isInitialized = false;
      this.template = null;
      this.isDragging = false;
      this.savedPosition = null;
      this.init();
    }
  
    init() {
      // Add debugging
      console.log('LinkedIn Quick Next: Initializing on', window.location.href);
      
      // Set the template directly
      this.template = this.getButtonTemplate();
      
      // Load saved position first
      this.loadSavedPosition().then(() => {
        // Wait for page to load completely
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.createQuickNextButton());
        } else {
          setTimeout(() => this.createQuickNextButton(), 1000); // Add delay for dynamic content
        }
      });
  
      // Handle dynamic content changes (LinkedIn uses SPA routing)
      this.observePageChanges();
    }

    async loadSavedPosition() {
      try {
        // Try chrome.storage first, fallback to browser.storage
        const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage : 
                       (typeof browser !== 'undefined' && browser.storage) ? browser.storage : null;
        
        if (storage && storage.local) {
          const result = await new Promise((resolve) => {
            storage.local.get(['quickNextPosition'], (result) => {
              resolve(result);
            });
          });
          
          if (result.quickNextPosition) {
            this.savedPosition = result.quickNextPosition;
            console.log('LinkedIn Quick Next: Loaded saved position:', this.savedPosition);
          } else {
            console.log('LinkedIn Quick Next: No saved position found, using default');
            this.savedPosition = { bottom: '20px', right: '20px' };
          }
        } else {
          console.log('LinkedIn Quick Next: Storage API not available, using default position');
          this.savedPosition = { bottom: '20px', right: '20px' };
        }
      } catch (error) {
        console.error('LinkedIn Quick Next: Error loading saved position:', error);
        this.savedPosition = { bottom: '20px', right: '20px' };
      }
    }

    async savePosition(position) {
      try {
        // Try chrome.storage first, fallback to browser.storage
        const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage : 
                       (typeof browser !== 'undefined' && browser.storage) ? browser.storage : null;
        
        if (storage && storage.local) {
          await new Promise((resolve) => {
            storage.local.set({ quickNextPosition: position }, () => {
              console.log('LinkedIn Quick Next: Position saved:', position);
              resolve();
            });
          });
          this.savedPosition = position;
        } else {
          console.log('LinkedIn Quick Next: Storage API not available, cannot save position');
        }
      } catch (error) {
        console.error('LinkedIn Quick Next: Error saving position:', error);
      }
    }

    applyPosition(element) {
      if (!this.savedPosition) return;
      
      // Apply the saved position
      if (this.savedPosition.left !== undefined && this.savedPosition.top !== undefined) {
        // Position was set using left/top (dragged position)
        element.style.left = this.savedPosition.left;
        element.style.top = this.savedPosition.top;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
      } else {
        // Use default bottom/right positioning
        element.style.bottom = this.savedPosition.bottom || '20px';
        element.style.right = this.savedPosition.right || '20px';
        element.style.left = 'auto';
        element.style.top = 'auto';
      }
      
      console.log('LinkedIn Quick Next: Applied position:', this.savedPosition);
    }
  
    getButtonTemplate() {
      return `
        <div id="linkedin-quick-next">
          <button id="quick-next-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
            Next
          </button>
        </div>
      `;
    }
  
    createQuickNextButton() {
      // Only create if we're on a jobs search page and haven't created it yet
      if (!this.isOnJobsPage() || this.isInitialized) return;

      // Check if button already exists in DOM (from previous injection)
      const existingButton = document.getElementById('linkedin-quick-next');
      if (existingButton) {
        console.log('LinkedIn Quick Next: Button already exists, skipping creation');
        this.nextButton = existingButton;
        this.isInitialized = true;
        return;
      }
  
      // Create container and parse template
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.template.trim();
      this.nextButton = tempDiv.firstChild;

      // Apply saved position before adding to DOM
      this.applyPosition(this.nextButton);
  
      // Add click handler
      const button = this.nextButton.querySelector('#quick-next-btn');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Only trigger next page if we're not dragging AND button can be clicked
        if (!this.isDragging && button.dataset.canClick === 'true') {
          this.goToNextPage();
        }
      });
  
      // Make the button draggable
      this.makeDraggable(this.nextButton);
  
      // Add to page
      document.body.appendChild(this.nextButton);
      this.isInitialized = true;
  
      // Update button state
      this.updateButtonState();
    }
  
    makeDraggable(element) {
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      let startPos = { x: 0, y: 0 };
      
      // Mouse events
      element.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left mouse button
        this.startDrag(e, e.clientX, e.clientY);
      });
  
      // Touch events
      element.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        this.startDrag(e, touch.clientX, touch.clientY);
      }, { passive: false });
  
      // Shared drag start logic
      this.startDrag = (e, clientX, clientY) => {
        isDragging = true;
        this.isDragging = false; // Will be set to true if actual dragging occurs
        
        const rect = element.getBoundingClientRect();
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;
        
        startPos.x = clientX;
        startPos.y = clientY;
        
        element.style.cursor = 'grabbing';
        element.style.transition = 'none';
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
      };
  
      const handleMouseMove = (e) => {
        if (!isDragging) return;
        this.updatePosition(e.clientX, e.clientY);
      };
  
      const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.updatePosition(touch.clientX, touch.clientY);
      };
  
      this.updatePosition = (clientX, clientY) => {
        // Check if we've moved enough to consider this a drag
        const deltaX = Math.abs(clientX - startPos.x);
        const deltaY = Math.abs(clientY - startPos.y);
        
        if (deltaX > 5 || deltaY > 5) {
          this.isDragging = true;
        }
        
        if (this.isDragging) {
          const newX = clientX - dragOffset.x;
          const newY = clientY - dragOffset.y;
          
          // Keep button within viewport bounds
          const maxX = window.innerWidth - element.offsetWidth;
          const maxY = window.innerHeight - element.offsetHeight;
          
          const clampedX = Math.max(0, Math.min(newX, maxX));
          const clampedY = Math.max(0, Math.min(newY, maxY));
          
          element.style.left = clampedX + 'px';
          element.style.top = clampedY + 'px';
          element.style.right = 'auto';
          element.style.bottom = 'auto';
        }
      };
  
      const handleMouseUp = () => {
        this.endDrag();
      };
  
      const handleTouchEnd = () => {
        this.endDrag();
      };
  
      this.endDrag = () => {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.transition = 'all 0.2s ease';
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        
        // Save position if it was actually dragged
        if (this.isDragging) {
          const rect = element.getBoundingClientRect();
          const position = {
            left: element.style.left,
            top: element.style.top
          };
          this.savePosition(position);
        }
        
        // Reset isDragging after a short delay to allow click handler to check it
        setTimeout(() => {
          this.isDragging = false;
        }, 10);
      };
  
      // Set initial cursor
      element.style.cursor = 'grab';
    }
  
    goToNextPage() {
      console.log('LinkedIn Quick Next: Attempting to go to next page');
      
      // Check if button is already processing to prevent double clicks
      const ourButton = document.querySelector('#quick-next-btn');
      if (ourButton && ourButton.dataset.processing === 'true') {
        return;
      }
      
      // Mark as processing
      if (ourButton) {
        ourButton.dataset.processing = 'true';
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
          
          // Update button state immediately
          setTimeout(() => {
            if (this.nextButton) {
              this.updateButtonState();
            }
          }, 500);
          
        } catch (error) {
          console.error('LinkedIn Quick Next: Error clicking next button:', error);
          this.showMessage('Error clicking next button');
        } finally {
          // Always reset processing state
          if (ourButton) {
            ourButton.dataset.processing = 'false';
          }
        }
      } else {
        console.log('LinkedIn Quick Next: No next button found');
        this.showMessage('No next page available');
        
        // Reset processing state
        if (ourButton) {
          ourButton.dataset.processing = 'false';
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
      
      // Skip update if button is currently processing
      if (button.dataset.processing === 'true') {
        return;
      }
      
      // Check if next page is available
      const hasNext = this.hasNextPage();
      
      if (hasNext) {
        button.disabled = false;
        button.classList.remove('disabled');
        button.setAttribute('title', 'Go to next page');
        button.dataset.canClick = 'true';
      } else {
        // Don't actually disable the button - just mark it as non-clickable
        button.disabled = false; // Keep it enabled so it can receive events
        button.classList.add('disabled');
        button.setAttribute('title', 'No next page available (still draggable)');
        button.dataset.canClick = 'false';
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
      // Create temporary message using DOM methods instead of innerHTML
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
          }, 200); // Reduced from 500ms to 200ms
        }
      }).observe(document, { subtree: true, childList: true });
    }
  }
  
  // Global function to force create/recreate the button immediately
  window.createLinkedInQuickNextButton = function() {
    console.log('createLinkedInQuickNextButton called');

    // Remove existing button if any
    const existing = document.getElementById('linkedin-quick-next');
    if (existing) {
      console.log('Removing existing button');
      existing.remove();
    }

    // If we have an existing instance, reset it and create button
    if (window.linkedInQuickNextInstance) {
      const inst = window.linkedInQuickNextInstance;
      inst.isInitialized = false;
      inst.nextButton = null;
      inst.loadSavedPosition().then(() => {
        console.log('Position loaded, creating button');
        inst.createQuickNextButton();
      });
    } else {
      // Create new instance (it will auto-create button via init)
      window.linkedInQuickNextInstance = new LinkedInQuickNext();
    }
  };

  // Initialize the extension only on first load
  if (!window.linkedInQuickNextInstance) {
    console.log('First load - creating LinkedInQuickNext instance');
    window.linkedInQuickNextInstance = new LinkedInQuickNext();
  } else {
    console.log('Instance already exists');
  }