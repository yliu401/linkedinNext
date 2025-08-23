# LinkedIn Jobs Quick Next

So you removed promoted spam jobs that LinkedIn posts and now your job board is a mess. Every next page you visit, your next button is at a new position. You're tired of moving your mouse and want to make the unbearable job search less tiring? Look no further as this extension adds a floating, draggable "Next" button to LinkedIn job search pages for quick and convenient navigation between search result pages.

![Extension Demo](https://img.shields.io/badge/Status-Working-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0-blue) ![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox-orange)

## 🚀 Features

### ⚡ Quick Navigation
- **Floating Next Button**: Instantly navigate to the next page without scrolling to find LinkedIn's pagination
- **Smart Detection**: Automatically detects when next page is available/unavailable
- **Instant Response**: Zero delays - button responds immediately to clicks

### 🎯 Draggable Interface
- **Drag & Drop**: Move the button anywhere on your screen for optimal positioning
- **Always Draggable**: Can be repositioned even when disabled (no next page available)
- **Smart Click Detection**: Distinguishes between clicks and drags - won't navigate while dragging
- **Touch Support**: Works on both desktop (mouse) and mobile (touch) devices

### 🎨 Visual Feedback
- **Active State**: Blue button when next page is available
- **Disabled State**: Gray button when on the last page (still draggable)
- **Hover Effects**: Smooth animations and visual feedback
- **Cursor Changes**: Shows grab/grabbing cursors during dragging

### 🔧 Smart Behavior
- **Auto-Detection**: Only appears on LinkedIn job search pages
- **SPA Navigation**: Handles LinkedIn's single-page app navigation
- **Viewport Bounds**: Button stays within screen boundaries when dragged
- **Memory**: Remembers your preferred button position

## 📦 Installation

### Method 1: Developer Mode (Recommended)
1. **Download or Clone** this repository
2. **Open Chrome Extensions**: Go to `chrome://extensions/`
3. **Enable Developer Mode**: Toggle the switch in the top right
4. **Load Extension**: Click "Load unpacked" and select the extension folder
5. **Visit LinkedIn**: Go to LinkedIn job search and start using!


## 🎮 How to Use

### Basic Navigation
1. **Visit LinkedIn Jobs**: Navigate to any LinkedIn job search page
2. **See the Button**: A floating "Next" button appears in the bottom right
3. **Click to Navigate**: Click the button to go to the next page of results

### Dragging the Button
1. **Click and Hold**: Press and hold the mouse button (or touch and hold)
2. **Drag**: Move your mouse/finger to reposition the button
3. **Release**: Let go to place the button in its new position

### Button States
- **🔵 Blue Button**: Next page available - click to navigate
- **⚫ Gray Button**: No next page available - still draggable for repositioning

## 📁 Project Structure

```
linkedin-jobs-quick-next/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Main extension logic
├── styles.css            # Button styling
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## ⚙️ Technical Details

### Permissions Required
- `activeTab`: Access to current LinkedIn tab
- `scripting`: Inject scripts for functionality
- Host permissions for `*.linkedin.com`

### Browser Compatibility
- ✅ Chrome (Manifest V2/V3)
- ✅ Firefox (with browser API)
- ✅ Edge (Chromium-based)

### Key Technologies
- **Vanilla JavaScript**: No external dependencies
- **CSS3**: Modern styling with animations
- **Chrome Extension APIs**: Cross-browser compatible
- **Event Handling**: Mouse and touch event management

---

**Happy job hunting! 🎯**

