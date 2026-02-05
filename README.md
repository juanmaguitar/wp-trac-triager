# WP Trac Triager

A Chrome extension to enhance WordPress Trac ticket triage workflow with visual highlights, keyword explanations, and component maintainer information.

## Features

### 🎨 Comment Highlighting
- **Core Committers** - Blue border with lightning bolt badge
- **Component Maintainers** - Green border with wrench badge
- **Lead Testers** - Purple border with test tube badge
- **Ticket Reporter** - Orange border with document badge

### 📚 Keyword Sidebar
Floating sidebar showing explanations for all Trac keywords on the current ticket:
- Color-coded by category (Patch, Testing, Feedback, Design, Documentation, Review)
- Critical keywords marked with special badge
- Based on official WordPress Core Handbook

### 🔧 Component Maintainer Info
- Shows component maintainers near the Component field
- Links to maintainer WordPress.org profiles
- Indicates when maintainers have commented on the ticket

## Installation

### Option 1: Load Unpacked (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `wp-trac-triager` folder
6. The extension is now installed!

### Option 2: Chrome Web Store (Future)
*Coming soon*

## Usage

1. Visit any WordPress Trac ticket (e.g., https://core.trac.wordpress.org/ticket/8905)
2. The extension automatically:
   - Highlights comments from important contributors
   - Shows a keyword explanation sidebar (on the right)
   - Displays component maintainer information

## Configuration

Click the extension icon and select "Open Settings" to:
- Enable/disable individual features
- Add custom users to highlight lists
- Customize behavior

## Project Structure

```
wp-trac-triager/
├── manifest.json           # Chrome extension manifest (V3)
├── content/
│   ├── triage-helper.js   # Main content script
│   └── styles.css         # Extension styles
├── data/
│   ├── keyword-data.js    # Trac keyword definitions
│   └── maintainers-data.js # Component maintainer info
├── options/
│   ├── options.html       # Settings page
│   └── options.js         # Settings logic
├── popup/
│   ├── popup.html         # Extension popup
│   └── popup.js           # Popup logic
└── icons/
    ├── icon16.png         # Required: 16x16 icon
    ├── icon48.png         # Required: 48x48 icon
    └── icon128.png        # Required: 128x128 icon
```

## Icons Setup

**⚠️ REQUIRED: Add extension icons before loading**

Create three PNG icons and place them in the `icons/` folder:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

**Design suggestion:** Use the WordPress logo with a wrench/tool overlay, or a Trac ticket icon.

You can use tools like:
- [Figma](https://figma.com) for design
- [RealFaviconGenerator](https://realfavicongenerator.net/) for icon generation
- [Canva](https://canva.com) for quick mockups

## Data Updates

### Updating Component Maintainers

Edit `data/maintainers-data.js`:

1. Visit https://make.wordpress.org/core/components/
2. Update the `COMPONENT_MAINTAINERS` object
3. Add new maintainers to `MAINTAINER_PROFILES`
4. Add core committers to `CORE_COMMITTERS` array
5. Update `LEAD_TESTERS` array as needed

### Updating Keywords

Edit `data/keyword-data.js` based on https://make.wordpress.org/core/handbook/contribute/trac/keywords/

## Technical Details

- **Manifest Version:** V3
- **Permissions:** `storage` (for saving settings)
- **Host Permissions:**
  - `https://core.trac.wordpress.org/*`
  - `https://meta.trac.wordpress.org/*`
- **Content Script Injection:** Runs on `/ticket/*` pages only

## Browser Compatibility

- ✅ Chrome (tested)
- ✅ Edge (Chromium-based, should work)
- ❌ Firefox (requires Manifest V2 adaptation)
- ❌ Safari (requires different extension format)

## Future Enhancements (v2+)

- [ ] Quick triage action buttons
- [ ] Ticket health score indicator
- [ ] Template comments for common responses
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Export triage statistics
- [ ] Integration with make.wordpress.org profiles
- [ ] Highlight patch attachments vs other files

## Contributing

To contribute or update maintainer lists:

1. Fork the repository
2. Make your changes
3. Test thoroughly on real Trac tickets
4. Submit a pull request

## Resources

- [WordPress Trac Keywords Handbook](https://make.wordpress.org/core/handbook/contribute/trac/keywords/)
- [WordPress Components](https://make.wordpress.org/core/components/)
- [WordPress Core Handbook](https://make.wordpress.org/core/handbook/)

## License

MIT License - Feel free to use and modify for your WordPress contribution workflow.

## Credits

Built by Juan Manuel Garrido for the WordPress community.

Data sourced from:
- WordPress Core Contributors Handbook
- WordPress Testing Handbook
- make.wordpress.org/core
