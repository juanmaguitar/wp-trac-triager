# Debugging WP Trac Triager

## Quick Debug Checklist

### 1. Reload Extension After Code Changes
**CRITICAL:** After updating any files, you MUST:
1. Go to `chrome://extensions/`
2. Click the refresh icon (↻) on the "WP Trac Triager" card
3. Reload the Trac page (Cmd/Ctrl + R)

### 2. Test on the Right Page
The extension ONLY works on Trac ticket pages:
- ✅ https://core.trac.wordpress.org/ticket/8905 (will work)
- ❌ https://core.trac.wordpress.org/query (won't work - not a ticket)
- ❌ https://make.wordpress.org (won't work - not Trac)

### 3. Check Browser Console
1. Open the Trac ticket page
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to "Console" tab
4. Look for messages starting with `[WP Trac Triager]`

**Expected console output:**
```
[WP Trac Triager] Initializing...
[WP Trac Triager] Initialized successfully
```

**If you see errors:**
- Red error messages indicate JavaScript problems
- Copy the error and check line numbers in `content/triage-helper.js`

### 4. Verify Features Are Enabled
1. Click extension icon → "Open Settings"
2. Verify all three toggles are ON (blue):
   - ✅ Comment Highlighting
   - ✅ Keyword Sidebar
   - ✅ Maintainer Info Box
3. Click "Save Settings"

### 5. Check What Should Appear

On a ticket page like https://core.trac.wordpress.org/ticket/8905:

#### Keyword Sidebar (Right Side)
- **Location:** Fixed to right side of page
- **Only shows if:** Ticket has keywords
- **Appearance:** White box with blue header "Trac Keywords"
- **Content:** Lists all keywords with explanations

#### Comment Highlighting (In Comments)
- **Location:** Around comment boxes
- **Only shows if:** Comment is from Core Committer, Lead Tester, etc.
- **Appearance:** Colored left border (blue/gold/purple/green)
- **May show badge:** Only if Trac doesn't already show the role

#### Maintainer Info Box
- **Location:** Near "Component" field in ticket details
- **Only shows if:** Component has assigned maintainers
- **Appearance:** Green bordered box with maintainer names

### 6. Common Issues

#### "Nothing appears at all"
- **Cause:** Extension not reloaded after changes
- **Fix:** Go to `chrome://extensions/` → click refresh icon → reload page

#### "Sidebar doesn't appear"
- **Cause:** Ticket has no keywords
- **Fix:** Test on a different ticket with keywords
- **Check:** Look for collapsed sidebar (small button on right edge)

#### "Comments not highlighted"
- **Cause:** No Core Committers/Lead Testers commented yet
- **Fix:** Scroll through comments looking for colored borders
- **Note:** Regular contributors won't be highlighted

#### "Console shows 'KEYWORD_DATA is not defined'"
- **Cause:** Content script files loading in wrong order
- **Fix:** Check manifest.json - `keyword-data.js` must load before `triage-helper.js`

### 7. Manual Console Test

Open console (F12) and run:

```javascript
// Check if extension loaded
console.log('Extension loaded:', typeof KEYWORD_DATA !== 'undefined');

// Check if sidebar exists
console.log('Sidebar exists:', document.getElementById('wpt-keyword-sidebar') !== null);

// Check ticket keywords
console.log('Keywords found:', document.querySelector('#ticket td.keywords')?.textContent);

// Check highlighted comments
console.log('Highlighted comments:', document.querySelectorAll('.wpt-highlighted').length);
```

### 8. Force Sidebar to Appear (Test)

In console, run:

```javascript
// Force trigger sidebar creation
const keywords = ['needs-testing', 'has-patch'];
console.log('Testing with keywords:', keywords);
```

### 9. Check File Loading

In DevTools:
1. Go to "Sources" tab
2. Look for "Content Scripts" in left sidebar
3. Should see:
   - `keyword-data.js`
   - `maintainers-data.js`
   - `triage-helper.js`

If files are missing, check manifest.json.

### 10. Verify Permissions

In `chrome://extensions/`:
- Click "Details" on WP Trac Triager
- Scroll to "Permissions"
- Should show: "Read and change your data on core.trac.wordpress.org"

If not, reinstall extension.

---

## Step-by-Step Test Procedure

1. **Reload extension:** `chrome://extensions/` → click ↻
2. **Open test ticket:** https://core.trac.wordpress.org/ticket/8905
3. **Open console:** Press F12
4. **Look for:** `[WP Trac Triager] Initialized successfully`
5. **Check right side:** Keyword sidebar should be visible
6. **Scroll comments:** Look for colored borders on comments
7. **Check component:** Look for green maintainer info box

If ANY of these fail, check the corresponding section above.
