# Next Steps - WP Trac Triager Extension

## Immediate Actions (Required to Use)

### 1. Create Extension Icons ⚠️ REQUIRED

The extension **will not load** without icons. Choose one option:

#### Option A: Quick Online Generator (5 minutes)
1. Go to https://favicon.io/favicon-generator/
2. Settings:
   - Text: **T**
   - Shape: **Rounded**
   - Font Family: **Roboto**
   - Font Size: **110**
   - Background: **#0073aa** (WordPress blue)
   - Color: **#ffffff** (white)
3. Click "Download"
4. Extract ZIP and resize files:
   ```bash
   cd ~/PROJECTS/2026/wp-trac-triager/icons
   # Copy and rename from favicon.io download
   cp ~/Downloads/favicon_io/favicon-16x16.png icon16.png
   # Use an image editor or online tool to resize others
   ```

#### Option B: Simple Placeholder (2 minutes)
Create any three PNG files of the correct sizes as temporary icons:
- Download any small icon from https://iconmonstr.com/
- Resize to 16x16, 48x48, and 128x128
- Name them `icon16.png`, `icon48.png`, `icon128.png`
- Place in `icons/` folder

#### Option C: Design Custom Icons
- Use Figma, Sketch, or Photoshop
- Design with WordPress branding (#0073aa blue)
- Export at 16x16, 48x48, and 128x128
- Save to `icons/` folder

### 2. Install in Chrome

Once icons are created:

```bash
# Verify icons exist
ls -la ~/PROJECTS/2026/wp-trac-triager/icons/
# Should show: icon16.png, icon48.png, icon128.png
```

Then:
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select folder: `~/PROJECTS/2026/wp-trac-triager`
5. Extension loads successfully ✅

### 3. Test the Extension

Visit a Trac ticket to verify:
- https://core.trac.wordpress.org/ticket/8905 (good test ticket - has keywords and comments)

Expected results:
- ✅ Keyword sidebar appears on right side
- ✅ Comments have colored left borders
- ✅ Badges appear next to core committer/maintainer usernames
- ✅ Component maintainer box shows near Component field

### 4. Configure Settings (Optional)

Click extension icon → "Open Settings":
- Add any custom usernames you want to highlight
- Toggle features on/off
- Save settings

---

## Recommended Improvements (Optional)

### Short-term Enhancements

#### 1. Update Maintainer Data (15 minutes)
The maintainer list may be incomplete:

1. Visit https://make.wordpress.org/core/components/
2. Compare with `data/maintainers-data.js`
3. Update any missing maintainers
4. Reload extension in `chrome://extensions/`

#### 2. Add Your Custom Users (5 minutes)
Add usernames you frequently interact with:
- Open Settings page
- Add to "Additional Lead Testers" or "Additional Core Committers"
- Save

#### 3. Test on Multiple Tickets
Try different ticket types:
- Bug with `needs-testing`: https://core.trac.wordpress.org/query?status=!closed&keywords=~needs-testing
- Enhancement requests
- Tickets with many keywords
- Tickets with maintainer comments

### Medium-term Enhancements

#### 1. Add Quick Action Buttons (Future v2)
Location: `content/triage-helper.js`

Add floating action button with:
- "Remove needs-testing + Add needs-test-info"
- "Add dev-feedback"
- "Move to Future Release" comment template

#### 2. Ticket Health Score (Future v2)
Add visual indicator showing:
- 🟢 Ready to work (recent activity, clear next steps)
- 🟡 Needs attention (stale, unclear)
- 🔴 Problematic (merge conflicts, no consensus)

Based on criteria from your bug scrub notes.

#### 3. Keyboard Shortcuts
Add shortcuts for:
- `k` - Toggle keyword sidebar
- `m` - Jump to maintainer info
- `1-4` - Filter comments by user type

---

## Data Maintenance

### Weekly
- Check for new core committers (rare)
- Update lead testers list (changes quarterly)

### Per Release Cycle
- Update component maintainers
- Verify keyword definitions haven't changed
- Test on latest Trac updates

### How to Update

**Maintainers:**
```javascript
// Edit: data/maintainers-data.js
const COMPONENT_MAINTAINERS = {
  'Performance': ['flixos90', 'mukesh27', 'joemcgill', 'NEW_USER'],
  // ...
};
```

**Keywords:**
```javascript
// Edit: data/keyword-data.js
const KEYWORD_DATA = {
  'new-keyword': {
    category: 'patch',
    label: 'New Keyword',
    description: '...',
    usage: '...',
    color: '#4CAF50'
  }
};
```

---

## Troubleshooting Common Issues

### Extension Won't Load
- **Check:** All three icon files exist in `icons/` folder
- **Fix:** Create icons (see step 1 above)

### Features Not Working on Trac
- **Check:** You're on a `/ticket/[number]` page
- **Check:** Console for errors (F12 → Console)
- **Fix:** Reload extension + refresh page

### Sidebar Not Showing
- **Check:** Ticket has keywords
- **Check:** Window width > 768px
- **Fix:** Enable in settings

### Comments Not Highlighted
- **Check:** Users are in the default lists or your custom lists
- **Fix:** Add users to settings, or update `data/maintainers-data.js`

---

## File Structure Reference

```
wp-trac-triager/
├── manifest.json              # Extension config (DON'T EDIT unless you know what you're doing)
├── content/
│   ├── triage-helper.js      # Main logic (EDIT to add features)
│   └── styles.css            # Visual styles (EDIT to customize appearance)
├── data/
│   ├── keyword-data.js       # Keyword definitions (UPDATE regularly)
│   └── maintainers-data.js   # Maintainer lists (UPDATE per release)
├── options/
│   ├── options.html          # Settings UI (EDIT to add new settings)
│   └── options.js            # Settings logic (EDIT for new options)
├── popup/
│   ├── popup.html            # Extension popup UI
│   └── popup.js              # Popup logic
├── icons/                    # ⚠️ CREATE THESE FIRST
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── docs/
    ├── README.md             # Main documentation
    ├── INSTALLATION.md       # Installation guide
    ├── CHANGELOG.md          # Version history
    └── NEXT-STEPS.md         # This file
```

---

## Success Metrics

You'll know the extension is working when:

✅ Keyword sidebar shows explanations for all ticket keywords
✅ Comments from @audrasjb, @dd32, etc. have blue borders + badges
✅ Component maintainer box appears on tickets
✅ Settings page saves your preferences
✅ Extension icon shows "✓ Extension is active" on Trac pages

---

## Getting Help

**Console Errors:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages starting with `[WP Trac Triager]`

**Extension Not Injecting:**
1. Check `chrome://extensions/` - should show "Enabled"
2. Check page URL matches `/ticket/\d+` pattern
3. Reload extension with refresh button

**Data Issues:**
1. Validate JavaScript syntax in `data/` files
2. Check browser console for parse errors
3. Verify object structure matches examples

---

## Share Your Feedback

If you use this extension and find it helpful:
- Share with other WordPress contributors
- Suggest improvements
- Report bugs you encounter
- Contribute maintainer list updates

Happy triaging! 🎉
