# Settings UI Guide - Validation Rules

**Version:** 1.3.0
**Created:** 2026-02-06

## Overview

Users can now **configure which validation rules are active** through the extension settings page!

## Accessing Settings

1. **Right-click** the extension icon in Chrome
2. Select **"Options"**
3. Scroll to **"⚠️ Keyword Validation Rules"** section

## Available Rules

### ✅ Rule 1: Self-Applied "needs-testing"
**Status:** Enabled by default
**Toggle ID:** `rule-self-applied-needs-testing`

Flags when patch authors add "needs-testing" to their own patches.

**Source:** 🎓 Team Training (2026-02-03)
- Training data showed 80% of self-applied "needs-testing" are inadequate

---

### ✅ Rule 2: Redundant Keywords
**Status:** Enabled by default
**Toggle ID:** `rule-redundant-keywords`

Detects redundant keyword pairs like "2nd-opinion" + "needs-review"

**Source:** 🎓 Team Training (2026-02-03)
- Keyword equivalencies documented in training

---

### ❌ Rule 3: Authority-Restricted Keywords
**Status:** DISABLED by default
**Toggle ID:** `rule-authority-restricted-keywords`

Warns when regular users add keywords typically added by core team.

**Source:** 💡 Best Practice (No official documentation)
- Based on observed patterns, not official policy
- **Disabled by default** because there's no official WordPress.org documentation supporting this

---

## How It Works

### 1. **User Changes Settings**
- User toggles rules on/off in Options page
- Clicks "💾 Save Settings"
- Settings saved to `chrome.storage.sync`

### 2. **Extension Reads Settings**
- When ticket page loads, extension reads user preferences
- Overrides default rule states with user preferences
- Only enabled rules are checked

### 3. **Validation Panel Updates**
- Only shows warnings for enabled rules
- Each warning displays its source
- Users see transparent, configurable validation

## Settings Storage

Settings are stored in `chrome.storage.sync`:

```javascript
{
  config: {
    validationRules: {
      'self-applied-needs-testing': true,
      'redundant-keywords': true,
      'authority-restricted-keywords': false
    }
  }
}
```

## UI Features

### Visual Indicators

Each rule shows:
- **Icon:** 🎓 (Training) or 💡 (Best Practice)
- **Title:** Rule name
- **Description:** What it checks
- **Source:** Where the rule comes from
- **Toggle:** On/Off switch

### Info Boxes

Two info boxes explain:
1. **About Validation Sources** - Explains trust levels
2. **Transparency Note** - Emphasizes source visibility

### Save Confirmation

After saving, users see:
> "Settings saved successfully! Reload Trac pages to see changes."

## Testing the Feature

### Test Steps:

1. **Go to Options page** (right-click extension → Options)
2. **Scroll to Validation Rules section**
3. **Disable "Authority-Restricted Keywords"** (should already be off)
4. **Disable "Self-Applied needs-testing"**
5. **Click "Save Settings"**
6. **Reload a Trac ticket page**
7. **Verify:** No validation warnings appear

8. **Re-enable rules** and save
9. **Reload ticket** with issues
10. **Verify:** Warnings appear again

### Edge Cases:

- ✅ First-time users get defaults (Rule 1 & 2 enabled, Rule 3 disabled)
- ✅ Settings persist across browser sessions
- ✅ Settings sync across devices (via chrome.storage.sync)
- ✅ Reset button restores all defaults

## Code Architecture

### Files Modified:

1. **options/options.html** - Added Validation Rules section
2. **options/options.js** - Added save/load for validation rules
3. **content/trac-sidebar.js** - Made `analyzeKeywordValidation()` respect user settings
4. **data/validation-rules.js** - Rule definitions with sources

### Key Functions:

**In options.js:**
- `loadSettings()` - Loads validation rule toggles
- `saveSettings()` - Saves validation rule preferences

**In trac-sidebar.js:**
- `analyzeKeywordValidation(callback)` - Now async, checks user preferences
- `isEnabled(ruleId)` - Helper to check if rule enabled

## User Benefits

### ✅ Transparency
- See exactly where each rule comes from
- Understand which are official vs best practice

### ✅ Control
- Enable/disable based on team preferences
- No forced validation

### ✅ Flexibility
- Different teams can use different rules
- Individual preferences respected

### ✅ Trust
- Rules without official docs are clearly marked
- Default to conservative (only training-backed rules)

## Future Enhancements

### Planned:
- Add rules based on official WordPress.org handbook
- Allow custom team-specific rules
- Import/export rule configurations
- Per-component rule customization

### Ideas:
- Rule severity customization
- Custom messages per rule
- Rule statistics (how often triggered)

---

**Last Updated:** 2026-02-06
**Next Steps:** Test the settings UI and gather user feedback!
