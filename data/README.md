# Keyword Data Documentation

This directory contains the keyword definitions used throughout the WP Trac Triager extension.

## Files

### `keywords.json` - Source of Truth ⭐
**This is the file you should edit when updating keyword definitions.**

- Human-readable JSON format
- Easy to edit for contributors via Pull Requests
- Includes JSON schema for validation
- Documented with metadata (source, lastUpdated)

### `keyword-data.js` - Runtime Data
**Auto-generated from keywords.json** (or manually synced)

- JavaScript format required by Chrome extension content scripts
- Loaded automatically when the extension runs
- Should be kept in sync with keywords.json

## How to Update Keyword Definitions

### Method 1: Edit JSON (Recommended for Contributors)

1. Edit `data/keywords.json` with your changes
2. Update the `lastUpdated` field to current date
3. Manually copy the structure to `keyword-data.js` (see instructions below)
4. Test your changes by loading the extension
5. Submit a Pull Request with both files

### Method 2: Use Build Script (Coming Soon)

```bash
# Future feature - automated build
npm run build:keywords
```

## JSON Structure

### Keyword Definition

Each keyword in `keywords.json` follows this structure:

```json
{
  "keyword-name": {
    "category": "patch|testing|feedback|design|docs|review|screenshots|status",
    "label": "Display Name",
    "description": "What this keyword means",
    "usage": "When to apply this keyword",
    "color": "#HEX_COLOR",
    "critical": true|false,
    "aliases": ["optional-array-of-aliases"]
  }
}
```

### Required Fields
- `category`: Keyword category (must match a category in the `categories` section)
- `label`: Human-readable display name
- `description`: Brief explanation of what the keyword means
- `usage`: Guidance on when to apply this keyword
- `color`: Hex color code for visual styling

### Optional Fields
- `critical`: Boolean indicating if this is a high-priority keyword
- `aliases`: Array of alternative keyword names

## Categories

Categories group related keywords together. Each category has:

```json
{
  "category-id": {
    "icon": "emoji",
    "name": "Display Name",
    "description": "What this category covers"
  }
}
```

### Available Categories
- **patch** 🔧 - Patch-Related
- **testing** 🧪 - Testing
- **feedback** 💬 - Feedback
- **design** 🎨 - Design
- **docs** 📝 - Documentation
- **review** 👁️ - Review
- **screenshots** 📸 - Screenshots
- **status** 📊 - Status

## Syncing JSON to JavaScript

Until we have an automated build script, follow these steps to sync:

1. Open `keywords.json` and copy the entire `keywords` object
2. Open `keyword-data.js`
3. Replace the `KEYWORD_DEFINITIONS` object with your copied data
4. Ensure the structure remains valid JavaScript (proper quotes, trailing commas)
5. Update the `Last Updated` comment at the top

## Testing Your Changes

After updating keyword definitions:

1. Open Chrome and go to `chrome://extensions/`
2. Click "Reload" on the WP Trac Triager extension
3. Visit any WordPress Trac ticket
4. Check that:
   - Keywords display with correct tooltips
   - Keyword Change History shows updated descriptions
   - No console errors appear

## Contributing

When submitting Pull Requests to update keywords:

1. **Always edit `keywords.json` first**
2. **Always include both `keywords.json` and `keyword-data.js` in your PR**
3. Update the `lastUpdated` field in `keywords.json`
4. Update the `Last Updated` comment in `keyword-data.js`
5. Add a clear description of what you changed and why
6. Reference the official WordPress documentation if applicable

### Example PR Description

```markdown
## Update keyword definitions

**Changes:**
- Updated description for `needs-testing` to clarify community verification
- Added new keyword `needs-accessibility-review`
- Fixed typo in `dev-feedback` usage guidance

**Reference:**
- https://make.wordpress.org/core/handbook/contribute/trac/keywords/

**Testing:**
- [x] Tooltips display correctly
- [x] No console errors
- [x] Both JSON and JS files are in sync
```

## Reference Documentation

- [Official WordPress Trac Keywords](https://make.wordpress.org/core/handbook/contribute/trac/keywords/)
- [WordPress Core Handbook](https://make.wordpress.org/core/handbook/)

## Questions?

If you have questions about keyword definitions or how to update them:
- Check the official WordPress Core Handbook
- Open an issue in this repository
- Ask in #core channel on WordPress Slack
