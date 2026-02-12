# Chrome Web Store Publishing Scripts

This directory contains scripts to prepare your extension for Chrome Web Store submission.

## 📋 Available Scripts

### 1. `validate-submission.sh`
Validates that your extension is ready for Chrome Web Store submission.

**Usage:**
```bash
./scripts/validate-submission.sh
```

**What it checks:**
- ✅ Required files exist (manifest.json, icons, content scripts)
- ✅ manifest.json is valid JSON with correct structure
- ✅ All icons are present and have correct dimensions (16×16, 48×48, 128×128)
- ✅ Screenshots meet Chrome Web Store requirements (1280×800 or 640×400)
- ✅ Code quality (no console.log, no TODO comments)
- ✅ Package size is under 100MB limit
- ✅ Displays manual checklist for store listing requirements

**Exit codes:**
- `0` - All checks passed (or passed with warnings)
- `1` - Validation failed, errors must be fixed

---

### 2. `package-extension.sh`
Creates a clean ZIP file ready for Chrome Web Store submission.

**Usage:**
```bash
./scripts/package-extension.sh
```

**What it includes:**
- ✅ manifest.json
- ✅ All icons (icons/)
- ✅ Content scripts (content/)
- ✅ Data files (data/)
- ✅ Options page (options/)
- ✅ Popup (popup/)

**What it excludes:**
- ❌ Development files (.git, node_modules, .eslintrc, etc.)
- ❌ Documentation files (*.md)
- ❌ Assets folder (screenshots, source files)
- ❌ Scripts folder
- ❌ Package files (package.json, package-lock.json)

**Output:**
```
dist/wp-trac-triager-v{VERSION}.zip
```

The version is automatically extracted from manifest.json.

---

## 🚀 Publishing Workflow

Follow these steps to publish your extension:

### Step 1: Validate Extension
```bash
./scripts/validate-submission.sh
```

Review and fix any errors or warnings reported by the validator.

### Step 2: Create Package
```bash
./scripts/package-extension.sh
```

This creates `dist/wp-trac-triager-v{VERSION}.zip`.

### Step 3: Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (first submission only)
3. Click "New Item" or select existing extension to update
4. Upload the ZIP file from `dist/`
5. Fill in store listing (if first submission):
   - Add screenshots from `assets/chrome-web-store/`
   - Write description and justifications
6. Submit for review

---

## 📸 Screenshot Requirements

Chrome Web Store requires:
- **Dimensions:** 1280×800 or 640×400 pixels
- **Aspect Ratio:** 16:10
- **Format:** PNG or JPEG
- **Count:** 1-5 screenshots
- **Size:** Each file under 2MB

Screenshots are stored in `assets/chrome-web-store/`.

---

## 🔧 Troubleshooting

### Issue: "Permission denied"
**Solution:** Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Issue: Validation fails with icon dimension errors
**Solution:** Ensure icons are exactly:
- icon16.png → 16×16 pixels
- icon48.png → 48×48 pixels
- icon128.png → 128×128 pixels

### Issue: Package too large (>100MB)
**Solution:**
- Check for large files: `find . -type f -size +1M`
- Optimize PNG icons: `pngquant icons/*.png`
- Ensure assets/ folder is excluded (automatic)

### Issue: Screenshots wrong dimensions
**Solution:** Use an image editor to resize to exactly 1280×800 or create new screenshots at the correct size.

---

## ✅ Pre-Submission Checklist

**Before running scripts:**
- [ ] Update version in manifest.json
- [ ] Test extension thoroughly in Chrome
- [ ] Remove all console.log statements
- [ ] Remove all debug/development code
- [ ] Update CHANGELOG.md
- [ ] Commit changes to git

**After running scripts:**
- [ ] Review validation report
- [ ] Verify package contents (optional: `unzip -l dist/*.zip`)
- [ ] Prepare store listing content
- [ ] Have permission justifications ready

---

## 📚 Additional Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
