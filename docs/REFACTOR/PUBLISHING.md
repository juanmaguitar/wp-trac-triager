# Publishing Guide

This document outlines the steps to publish WP Trac Triager to the Chrome Web Store.

## Prerequisites

Before publishing, ensure:

- [ ] All features are working correctly
- [ ] No console errors or warnings
- [ ] Extension tested on multiple Trac tickets
- [ ] README includes screenshots
- [ ] Version number updated in `manifest.json`
- [ ] CHANGELOG.md is up to date
- [ ] Icons are properly sized and high quality

## Pre-Publication Checklist

### 1. Code Quality

```bash
# Run linting
npm run lint

# Format code
npm run format

# Review all changes
git status
git diff
```

### 2. Testing

Test the extension thoroughly:
- [ ] Load extension in Chrome
- [ ] Test on https://core.trac.wordpress.org/ticket/8905
- [ ] Test on https://meta.trac.wordpress.org/ticket/1
- [ ] Verify comment highlighting works
- [ ] Verify sidebar displays correctly
- [ ] Test sidebar dragging and collapsing
- [ ] Test settings page (save/load/reset)
- [ ] Test with custom users in settings
- [ ] Check responsive behavior (resize window)
- [ ] Verify no browser console errors

### 3. Assets Preparation

#### Screenshots (Required)

Create high-quality screenshots (1280x800 or 640x400):

1. **Main View** - Show a Trac ticket with highlighted comments
2. **Sidebar** - Show the keyword sidebar with explanations
3. **Maintainer Info** - Show component maintainer section
4. **Settings** - Show the settings page

Save screenshots in a `store-assets/` directory (not tracked in git).

#### Promotional Images (Optional but Recommended)

- **Small tile**: 440x280px
- **Large tile**: 920x680px
- **Marquee**: 1400x560px

### 4. Create Extension Package

```bash
# Create a clean directory
mkdir -p release
cp -r . release/wp-trac-triager

# Remove development files
cd release/wp-trac-triager
rm -rf .git .gitignore node_modules package*.json .eslintrc.json .prettierrc
rm -rf content/modules content/styles-backup.css
rm -rf docs/ store-assets/
rm PUBLISHING.md CONTRIBUTING.md

# Create ZIP file
cd ..
zip -r wp-trac-triager-v1.0.0.zip wp-trac-triager/

# Clean up
cd ../
rm -rf release/wp-trac-triager
```

## Chrome Web Store Submission

### 1. Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account
3. Pay one-time $5 developer fee (if first time)

### 2. Create New Item

1. Click "New Item"
2. Upload `wp-trac-triager-v1.0.0.zip`
3. Fill in store listing:

#### Store Listing Details

**Name:**
```
WP Trac Triager
```

**Summary:** (max 132 characters)
```
Enhance WordPress Trac with visual highlights, keyword explanations, and maintainer info for efficient ticket triage.
```

**Description:**
```
WP Trac Triager streamlines your WordPress contribution workflow by adding visual enhancements and helpful context to WordPress Trac tickets.

🎨 KEY FEATURES

Comment Highlighting
• Visual highlights for core committers, maintainers, and testers
• Color-coded by role (Project Lead, Lead Developer, Core Committer, etc.)
• Instantly identify important contributors

Keyword Sidebar
• Floating sidebar with explanations for all TRAC keywords
• Understand ticket status at a glance (needs-patch, needs-testing, etc.)
• Based on official WordPress Core Handbook
• Shows when keywords were added and by whom

Component Maintainers
• See who maintains each component
• Quick links to maintainer profiles
• Track when maintainers last commented

Recent Activity
• View the 3 most recent comments
• See contributor roles inline
• Quick navigation to any comment

⚙️ CUSTOMIZABLE

• Toggle features on/off in settings
• Add custom users to highlight lists
• Draggable sidebar with saved position
• Remembers collapsed state

🎯 PERFECT FOR

• WordPress core contributors
• Ticket triagers
• Bug shepherds
• Anyone participating in WordPress Trac

📊 TECHNICAL DETAILS

• Manifest V3 compliant
• Works on core.trac.wordpress.org and meta.trac.wordpress.org
• Minimal permissions required
• Privacy-focused (no data collection)
• Open source (MIT License)

💚 CONTRIBUTING

This extension is open source! Visit our GitHub repository to contribute, report issues, or suggest features.

Data sourced from:
• WordPress Core Contributors Handbook
• WordPress Testing Handbook
• make.wordpress.org/core
```

**Category:**
- Productivity

**Language:**
- English (United States)

#### Graphics

Upload all prepared screenshots and promotional images.

#### Privacy

**Single Purpose:**
```
Enhance WordPress Trac ticket pages with visual highlights and helpful context for contributors.
```

**Permission Justifications:**

- **storage**: Save user settings and sidebar position
- **Host permissions (trac.wordpress.org)**: Read ticket data to highlight contributors and display keyword information

**Privacy Policy:**

Create a simple privacy policy page and host it (GitHub Pages works):

```markdown
# Privacy Policy for WP Trac Triager

Last Updated: February 5, 2026

## Data Collection

WP Trac Triager does NOT collect, store, or transmit any personal data or browsing information.

## Local Storage

The extension stores the following data locally on your device:
- User preference settings (feature toggles, custom user lists)
- Sidebar position and collapsed state

This data never leaves your device.

## Permissions

- **storage**: Used to save your settings locally and sync across devices via Chrome Sync
- **trac.wordpress.org**: Required to read and enhance WordPress Trac ticket pages

## Changes to Privacy Policy

We will update this privacy policy if needed. Check this page for updates.

## Contact

For questions, open an issue on our GitHub repository.
```

Add privacy policy URL.

### 3. Distribution

**Visibility:**
- Public

**Geographic Distribution:**
- All regions

**Pricing:**
- Free

### 4. Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait for Chrome Web Store review (typically 1-3 days)

## Post-Publication

Once published:

1. Update README.md with Chrome Web Store link
2. Create a GitHub release:
   ```bash
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```
3. Add Chrome Web Store badge to README
4. Announce on:
   - make.wordpress.org/core
   - Personal blog
   - Social media

## Updates

For future updates:

1. Update version in `manifest.json`
2. Update CHANGELOG.md
3. Create new ZIP package
4. Upload to Chrome Web Store
5. Publish update (instant for existing users)

## Support

After publication, monitor:
- Chrome Web Store reviews
- GitHub issues
- User feedback

Respond promptly to issues and maintain the extension regularly.

## Resources

- [Chrome Web Store Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)
