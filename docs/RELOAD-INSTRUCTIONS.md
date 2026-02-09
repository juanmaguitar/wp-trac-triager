# Reload Extension After Changes

## Quick Steps

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Reload the Extension**
   - Find "WP Trac Triager" in the list
   - Click the circular reload icon 🔄
   - **IMPORTANT**: This reloads the extension files

4. **Reload the Trac Page**
   - Go back to your open Trac ticket (e.g., https://core.trac.wordpress.org/ticket/8905)
   - Do a **hard refresh**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

5. **Open Console and Check**
   ```javascript
   console.clear();
   console.log('=== WP Trac Triager Debug ===\n');
   console.log('1. Keywords:', document.querySelector('#ticket td.keywords')?.textContent || 'NONE');
   console.log('2. Sidebar exists:', document.getElementById('wpt-keyword-sidebar') !== null);
   console.log('3. Comments found:', document.querySelectorAll('.change, #ticket').length);
   console.log('4. Highlighted comments:', document.querySelectorAll('.wpt-highlighted').length);
   ```

## What Should Happen

After the fix, you should see:
- ✅ Sidebar appears if keywords exist
- ✅ Comments are highlighted with colored borders
- ✅ Component maintainer info appears
- ✅ No console errors about undefined data

## What Was Fixed

**Problem**: Data files (`KEYWORD_DATA`, `COMPONENT_MAINTAINERS`) weren't accessible due to Chrome MV3 content script isolation.

**Solution**: Removed `window.` assignments. Content scripts share variables through execution order in `manifest.json`:
```json
"js": [
  "data/keyword-data.js",      // Declares variables
  "data/maintainers-data.js",  // Declares more variables
  "content/triage-helper.js"   // Uses all variables
]
```

All scripts run in the same isolated scope and share variables declared with `var`.
