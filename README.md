# WP Trac Triager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore) [![Version](https://img.shields.io/badge/version-1.5.0-green.svg)](CHANGELOG.md)

A Chrome extension that enhances the WordPress Trac ticket triage workflow with smart timelines, universal role badges, keyword change history, and a fully customizable sidebar. Perfect for WordPress contributors who want to streamline their triage process and make informed decisions based on complete context.

## ✨ Features (v1.5.0)

### 🕐 Smart Timelines & History
- **Keyword Change Timeline** - Complete visual history of all keyword additions/removals with color-coded changes (🟢 added, 🔴 removed, 🟠 mixed)
- **Milestone History Timeline** - Track all milestone changes with punt detection (warns if punted 2+ times)
- **Interactive Tooltips** - Hover over any keyword to see its description and usage guidelines
- Direct click-through links to the exact comments where changes occurred

### 👥 Universal Role Recognition
- **Role Badges for Everyone** - Every commenter gets a badge (Project Lead, Core Committer, Individual Contributor, etc.)
- **GitHub Integration** - Automatically detects and badges comments synced from GitHub PRs with "🔗 GitHub PR"
- **Authority Legend** - Collapsible section showing role distribution with comment count statistics
- Color-coded by authority level for instant context

### ⚙️ Fully Customizable Sidebar
- **Drag & Drop Reordering** - Arrange sidebar sections in your preferred order via Settings page
- **Show/Hide Toggles** - Hide sections you don't use to declutter your workflow
- **Persistent Preferences** - Settings sync across all your devices via Chrome
- **Locked Critical Info** - Quick Info section always stays visible at the top

### 📚 Rich Information Sections
1. **Quick Info** - Ticket summary, reporter, milestone, priority, component
2. **WordPress Release Schedule** - Next milestone dates with countdown timer
3. **Recent Comments** - Last 3 comments with role context
4. **Milestone History** - Visual timeline of all milestone changes
5. **Keyword Change History** - Complete timeline of keyword additions/removals
6. **Component Maintainers** - Contact info with links to profiles
7. **TRAC Keywords** - Explanations for all keywords based on WordPress Core Handbook

### 🎨 Visual Enhancements
- Color-coded role badges throughout ticket comments
- Vertical timelines with connecting lines and status dots
- Inline keyword badges with + (addition) or - (removal) indicators
- Collapsible sections with persistent state
- Smooth slide-out sidebar animations

## Screenshots

<table>
  <tr>
    <td align="center">
      <a href="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-1.png" target="_blank">
        <img src="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-1.png" alt="Snapshot" width="33%"/>
      </a><br/>
      <b>Snapshot</b>
    </td>
    <td align="center">
      <a href="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-2.png" target="_blank">
        <img src="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-2.png" alt="Keyword Sidebar" width="33%"/>
      </a><br/>
      <b>Keyword Sidebar</b>
    </td>
    <td align="center">
      <a href="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-3.png" target="_blank">
        <img src="https://raw.githubusercontent.com/juanma-wp/wp-trac-triager/main/assets/snapshot-3.png" alt="Component Maintainers" width="33%"/>
      </a><br/>
      <b>Maintainers Highlight</b>
    </td>
  </tr>
</table>

## Installation

### From Chrome Web Store (Recommended)

*Coming soon - Extension pending review*

Once published, you can install directly from the [Chrome Web Store](https://chrome.google.com/webstore).

### Manual Installation (Development)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/juanmaguitar/wp-trac-triager.git
   cd wp-trac-triager
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" toggle in the top right

4. Click "Load unpacked" button

5. Select the `wp-trac-triager` folder

6. The extension is now installed and ready to use!

### For Edge Users

This extension is compatible with Microsoft Edge (Chromium-based):
1. Follow the same steps above
2. Navigate to `edge://extensions/` instead

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

## Roadmap

See [CHANGELOG.md](CHANGELOG.md) for version history and upcoming features.

### Planned for v2.0

- Quick triage action buttons
- Keyboard shortcuts for common actions
- Dark mode support
- Ticket health score indicator
- Template comments for common responses

### Under Consideration

- Export triage statistics
- Integration with make.wordpress.org profiles
- Highlight patch attachments vs other files
- Firefox and Safari support

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/juanmaguitar/wp-trac-triager.git
cd wp-trac-triager

# Install dev dependencies (optional, for linting)
npm install

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select this directory
```

### Code Quality

```bash
# Lint JavaScript
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Project Structure

```
wp-trac-triager/
├── manifest.json           # Extension manifest (MV3)
├── content/
│   ├── test-simple.js     # Main content script
│   ├── page-inject.js     # Page context script
│   ├── styles.css         # Extension styles
│   └── modules/           # Modular code (for future builds)
├── data/
│   ├── keyword-data.js    # TRAC keyword definitions
│   └── maintainers-data.js # Component maintainers
├── options/
│   ├── options.html       # Settings page
│   └── options.js         # Settings logic
├── popup/
│   ├── popup.html         # Extension popup
│   └── popup.js           # Popup logic
└── icons/                 # Extension icons
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Resources

- [WordPress Trac Keywords Handbook](https://make.wordpress.org/core/handbook/contribute/trac/keywords/)
- [WordPress Components](https://make.wordpress.org/core/components/)
- [WordPress Core Handbook](https://make.wordpress.org/core/handbook/)

## Support

- **Issues**: [GitHub Issues](https://github.com/juanmaguitar/wp-trac-triager/issues)

## License

[MIT License](LICENSE) - Free to use, modify, and distribute.

## Credits

Built with ❤️ by [Juan Manuel Garrido](https://github.com/juanmaguitar) for the WordPress community.

### Data Sources

- [WordPress Core Contributors Handbook](https://make.wordpress.org/core/handbook/)
- [WordPress Trac Keywords Guide](https://make.wordpress.org/core/handbook/contribute/trac/keywords/)
- [WordPress Components](https://make.wordpress.org/core/components/)

### Acknowledgments

Thanks to all WordPress core contributors and maintainers who make Trac triage possible.

---

**Made for WordPress Contributors** 🌟

If this extension helps your workflow, please star the repo and share it with fellow contributors!
