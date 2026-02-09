# Extension Testing Checklist

## 1. Verify Extension is Loaded

1. Open Chrome and go to `chrome://extensions/`
2. Find "WP Trac Triager"
3. Ensure it's **enabled** (toggle should be blue/on)
4. Check for any error messages under the extension

## 2. Test on a Real Ticket

Visit: https://core.trac.wordpress.org/ticket/64003

### Expected Results:

**Comment Highlighting:**
- [ ] Comments from core contributors have colored left borders
- [ ] Core Committer comments = Green border
- [ ] Role badges appear next to usernames (e.g., "Core Committer")

**Keyword Sidebar:**
- [ ] Floating sidebar appears on the right side
- [ ] Shows "🔍 WP Trac Triager" header
- [ ] Can be dragged around the screen
- [ ] Can be collapsed/expanded with +/- button
- [ ] Shows recent comments section
- [ ] Shows component maintainers (if applicable)
- [ ] Shows keyword explanations (if ticket has keywords)

**Settings:**
- [ ] Click extension icon in toolbar
- [ ] "Open Settings" button works
- [ ] Settings page loads correctly
- [ ] Can toggle features on/off
- [ ] Can save settings

## 3. If Nothing Appears

Check the browser console for actual extension errors:

1. Right-click on the page → "Inspect"
2. Go to "Console" tab
3. Look for messages starting with **our code**
4. Filter by typing "wpt" in the console search

The Permissions-Policy errors you see are normal and from Trac itself.

## 4. Force Reload

If you don't see any highlighting or sidebar:

1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or go to `chrome://extensions/`
3. Click the refresh icon ↻ on the WP Trac Triager extension
4. Reload the Trac page

## Debug Mode (Optional)

If you need to verify the extension is running, we can add a debug flag.
