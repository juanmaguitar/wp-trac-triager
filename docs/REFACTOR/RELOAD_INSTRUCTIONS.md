# 🔄 How to Reload the Extension

After making changes, Chrome caches the old version. Follow these steps:

## Method 1: Quick Reload (Recommended)

1. Go to `chrome://extensions/`
2. Find **WP Trac Triager**
3. Click the **circular arrow icon** (↻) on the extension card
4. Go back to the Trac tab
5. **Hard refresh**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

## Method 2: Complete Reload

1. Go to `chrome://extensions/`
2. Toggle **OFF** the WP Trac Triager extension
3. Wait 2 seconds
4. Toggle **ON** again
5. Hard refresh the Trac page

## Method 3: Full Reinstall

If the above doesn't work:

1. Go to `chrome://extensions/`
2. Click **Remove** on WP Trac Triager
3. Click **Load unpacked** again
4. Select the project folder
5. Go to the Trac page (fresh load)

## Verify It's Working

After reloading, you should see on https://core.trac.wordpress.org/ticket/64003:

✅ Colored borders on some comments (green for Core Committers)
✅ Role badges next to usernames  
✅ Floating sidebar on the right with "🔍 WP Trac Triager"

## Still Not Working?

Check Chrome's console for **real errors** from our extension:

1. Open DevTools (F12)
2. Go to Console tab
3. Look for JavaScript errors (red text)
4. Share any errors you see (ignore the Permissions-Policy warnings)
