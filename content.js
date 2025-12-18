class LinkedInQuickNext {
  constructor() {
    this.nextButton = null;
    this.isInitialized = false;
    this.savedPosition = null;
    this.isDragging = false;
    this.updateTimeout = null;
    this.init();
  }

  init() {
    if (!this.isOnJobsPage()) return;

    this.loadSavedPosition().then(() => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createQuickNextButton());
      } else {
        // Small delay for LinkedIn's dynamic content
        setTimeout(() => this.createQuickNextButton(), 500);
      }
    });

    this.observePageChanges();
  }

  async loadSavedPosition() {
    try {
      const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage :
                     (typeof browser !== 'undefined' && browser.storage) ? browser.storage : null;

      if (storage?.local) {
        const result = await new Promise(resolve => {
          storage.local.get(['quickNextPosition'], resolve);
        });
        this.savedPosition = result.quickNextPosition || { bottom: '20px', right: '20px' };
      } else {
        this.savedPosition = { bottom: '20px', right: '20px' };
      }
    } catch {
      this.savedPosition = { bottom: '20px', right: '20px' };
    }
  }

  async savePosition(position) {
    try {
      const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage :
                     (typeof browser !== 'undefined' && browser.storage) ? browser.storage : null;

      if (storage?.local) {
        await new Promise(resolve => {
          storage.local.set({ quickNextPosition: position }, resolve);
        });
        this.savedPosition = position;
      }
    } catch { /* ignore */ }
  }

  applyPosition(element) {
    if (!this.savedPosition) return;

    if (this.savedPosition.left !== undefined) {
      element.style.left = this.savedPosition.left;
      element.style.top = this.savedPosition.top;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    } else {
      element.style.bottom = this.savedPosition.bottom || '20px';
      element.style.right = this.savedPosition.right || '20px';
      element.style.left = 'auto';
      element.style.top = 'auto';
    }
  }

  createQuickNextButton() {
    if (this.isInitialized || document.getElementById('linkedin-quick-next')) return;

    const container = document.createElement('div');
    container.id = 'linkedin-quick-next';

    const button = document.createElement('button');
    button.id = 'quick-next-btn';
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
    </svg>Next`;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.isDragging && button.dataset.canClick === 'true') {
        this.goToNextPage();
      }
    });

    container.appendChild(button);
    this.nextButton = container;
    this.applyPosition(container);
    this.makeDraggable(container);
    document.body.appendChild(container);
    this.isInitialized = true;
    this.updateButtonState();
  }

  makeDraggable(element) {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };

    const startDrag = (clientX, clientY) => {
      isDragging = true;
      this.isDragging = false;

      const rect = element.getBoundingClientRect();
      dragOffset = { x: clientX - rect.left, y: clientY - rect.top };
      startPos = { x: clientX, y: clientY };

      element.style.cursor = 'grabbing';
      element.style.transition = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    const onMouseMove = (e) => isDragging && updatePos(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      updatePos(e.touches[0].clientX, e.touches[0].clientY);
    };

    const updatePos = (clientX, clientY) => {
      if (Math.abs(clientX - startPos.x) > 5 || Math.abs(clientY - startPos.y) > 5) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        element.style.left = Math.max(0, Math.min(clientX - dragOffset.x, maxX)) + 'px';
        element.style.top = Math.max(0, Math.min(clientY - dragOffset.y, maxY)) + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
      }
    };

    const onEnd = () => {
      isDragging = false;
      element.style.cursor = 'grab';
      element.style.transition = 'all 0.2s ease';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);

      if (this.isDragging) {
        this.savePosition({ left: element.style.left, top: element.style.top });
      }
      setTimeout(() => this.isDragging = false, 10);
    };

    element.addEventListener('mousedown', (e) => e.button === 0 && startDrag(e.clientX, e.clientY));
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    element.style.cursor = 'grab';
  }

  goToNextPage() {
    const btn = this.nextButton?.querySelector('#quick-next-btn');
    if (btn?.dataset.processing === 'true') return;
    if (btn) btn.dataset.processing = 'true';

    const nextBtn = document.querySelector('.jobs-search-pagination__button--next:not([disabled])');

    if (nextBtn) {
      nextBtn.click();
      setTimeout(() => this.updateButtonState(), 500);
    } else {
      this.showMessage('No next page available');
    }

    if (btn) btn.dataset.processing = 'false';
  }

  updateButtonState() {
    const button = this.nextButton?.querySelector('#quick-next-btn');
    if (!button || button.dataset.processing === 'true') return;

    const hasNext = !!document.querySelector('.jobs-search-pagination__button--next:not([disabled])');
    button.classList.toggle('disabled', !hasNext);
    button.setAttribute('title', hasNext ? 'Go to next page' : 'No next page available');
    button.dataset.canClick = hasNext ? 'true' : 'false';
  }

  isOnJobsPage() {
    return location.href.includes('/jobs/');
  }

  showMessage(text) {
    const message = document.createElement('div');
    message.className = 'quick-next-message';
    message.textContent = text;
    message.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #333; color: white; padding: 10px 20px; border-radius: 4px;
      z-index: 10001; font-size: 14px;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  }

  observePageChanges() {
    let lastUrl = location.href;

    // Use a single debounced observer
    const observer = new MutationObserver(() => {
      // Check for URL change (SPA navigation)
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          if (this.isOnJobsPage()) {
            if (!this.isInitialized) this.createQuickNextButton();
            else this.updateButtonState();
          } else if (this.nextButton) {
            this.nextButton.remove();
            this.nextButton = null;
            this.isInitialized = false;
          }
        }, 500);
        return;
      }

      // Debounce button state updates
      if (this.isInitialized && this.nextButton) {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => this.updateButtonState(), 300);
      }
    });

    // Only observe body children changes, not deep subtree for better performance
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Initialize once
if (!window.linkedInQuickNextInstance) {
  window.linkedInQuickNextInstance = new LinkedInQuickNext();
}
