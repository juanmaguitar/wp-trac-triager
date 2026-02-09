# Installation Guide

## Prerequisites

Before installing the extension, you need to create icon files.

### Step 1: Create Icons

The extension requires three icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick Method - Use Online Tool:**

1. Go to https://favicon.io/favicon-generator/
2. Configure:
   - Text: "T" (for Triage)
   - Background: Rounded, Blue (#0073aa)
   - Font: Bold
3. Generate and download
4. Extract the ZIP and copy:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → resize to 48x48 → `icon48.png`
   - `android-chrome-192x192.png` → resize to 128x128 → `icon128.png`
5. Place all three files in the `icons/` folder

**Alternative - Download Temporary Icons:**

For testing purposes, you can use any three PNG files of the correct sizes. Just make sure they're named correctly.

## Step 2: Install in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `wp-trac-triager` folder
   - Click "Select Folder" (or "Open" on Mac)

4. **Verify Installation**
   - You should see "WP Trac Triager" in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - Status should show "Enabled"

## Step 3: Test the Extension

1. Visit a WordPress Trac ticket:
   - Example: https://core.trac.wordpress.org/ticket/8905

2. You should see:
   - **Keyword Sidebar** on the right side showing keyword explanations
   - **Highlighted Comments** with colored borders for important contributors
   - **Maintainer Info Box** near the component field (if component has maintainers)

3. Click the extension icon in the toolbar:
   - Status should show "✓ Extension is active on this page"
   - Click "Open Settings" to configure preferences

## Step 4: Configure Settings (Optional)

1. Right-click the extension icon → "Options"
   - Or click extension icon → "Open Settings"

2. Available settings:
   - **Enable/disable features** (comment highlighting, keyword sidebar, maintainer info)
   - **Add custom users** to highlight lists
   - **Reset to defaults** if needed

## Troubleshooting

### Extension won't load
- **Check icons:** Make sure all three icon files exist in `icons/` folder
- **Check manifest:** Verify `manifest.json` has no syntax errors
- **Check console:** Look for errors in Chrome DevTools console

### Features not showing up
1. **Refresh the Trac page** after installing
2. **Check you're on a ticket page** (URL should be `/ticket/[number]`)
3. **Open extension settings** and verify features are enabled
4. **Check browser console** (F12 → Console tab) for JavaScript errors

### Keyword sidebar not appearing
- Ticket must have keywords assigned
- Check if sidebar is collapsed (look for small collapsed button on right edge)
- Verify "Show Keyword Sidebar" is enabled in settings

### Comments not highlighted
- Verify "Comment Highlighting" is enabled in settings
- Only comments from recognized users are highlighted (core committers, maintainers, testers)
- Check `data/maintainers-data.js` for the list of recognized users

### Maintainer info not showing
- Component must have assigned maintainers
- Not all components have designated maintainers listed
- Check `data/maintainers-data.js` for component coverage

## Updating the Extension

When you make changes to the code:

1. Go to `chrome://extensions/`
2. Click the refresh icon (↻) on the WP Trac Triager card
3. Reload any open Trac pages

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "WP Trac Triager"
3. Click "Remove"
4. Confirm removal

Your settings will be deleted automatically.

## Next Steps

- Visit some Trac tickets to see the extension in action
- Configure your preferred settings
- Update maintainer lists in `data/maintainers-data.js` as needed
- Add custom users to highlight in the settings page

## Support

For issues or questions:
- Check the console for error messages (F12 → Console)
- Review the code in `content/triage-helper.js`
- Verify data files in `data/` folder are valid JavaScript

## Development Tips

- Changes to content scripts require extension reload + page refresh
- Changes to popup/options only require extension reload
- Use Chrome DevTools to debug (Inspect → Sources → Content Scripts)
- Check `chrome.storage` with: `chrome.storage.sync.get(null, console.log)`
