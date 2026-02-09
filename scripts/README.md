# Chrome Web Store Packaging Scripts

This directory contains scripts to prepare your extension for Chrome Web Store submission.

## 📋 Scripts Overview

### 1. `convert-screenshots.sh`
Converts your screenshots to Chrome Web Store requirements (1280×800, 16:10 aspect ratio).

**Usage:**
```bash
./scripts/convert-screenshots.sh
```

**Features:**
- ✅ Validates input files
- ✅ Two conversion methods:
  - **Center Crop** (recommended) - Crops to 16:10, no borders
  - **Letterbox** - Adds borders to preserve full content
- ✅ Creates `assets/chrome-web-store/` directory
- ✅ Names files sequentially: `screenshot-1.png`, `screenshot-2.png`, etc.
- ✅ Verifies output dimensions

**Before/After:**
```
Input:  assets/snapshot-1.png (1363×1343)
Output: assets/chrome-web-store/screenshot-1.png (1280×800) ✓
```

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
- ✅ Web accessible resources

**What it excludes:**
- ❌ .git directory
- ❌ node_modules
- ❌ Documentation files (*.md)
- ❌ Assets folder (screenshots)
- ❌ Scripts folder
- ❌ Docs folder
- ❌ Dev config files (.eslintrc, .prettierrc, etc.)
- ❌ Package files (package.json, package-lock.json)

**Output:**
```
dist/wp-trac-triager-v1.5.0.zip
```

---

### 3. `validate-submission.sh`
Validates that your extension is ready for submission.

**Usage:**
```bash
./scripts/validate-submission.sh
```

**Checks:**
- ✅ Required files exist
- ✅ manifest.json is valid JSON
- ✅ All icons are present and correct size
- ✅ Screenshots meet requirements
- ✅ No console.log statements in code
- ✅ No TODO comments in production code

---

## 🚀 Complete Submission Workflow

Follow these steps in order:

### Step 1: Convert Screenshots
```bash
cd /Users/juanmanuelgarrido/PROJECTS/2026/wp-trac-triager
./scripts/convert-screenshots.sh
```

Choose conversion method (1 for crop, 2 for letterbox) and review output in `assets/chrome-web-store/`.

### Step 2: Validate Extension
```bash
./scripts/validate-submission.sh
```

Fix any issues reported by the validator.

### Step 3: Package Extension
```bash
./scripts/package-extension.sh
```

This creates `dist/wp-trac-triager-v1.5.0.zip`.

### Step 4: Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (if first submission)
3. Click "New Item"
4. Upload `dist/wp-trac-triager-v1.5.0.zip`
5. Fill in store listing:
   - Upload converted screenshots from `assets/chrome-web-store/`
   - Copy/paste prepared store listing content
   - Justify permissions
   - Submit for review

---

## 📸 Screenshot Requirements

Chrome Web Store requires:
- **Dimensions:** 1280×800 or 640×400 pixels
- **Aspect Ratio:** 16:10
- **Format:** PNG (24-bit, no alpha) or JPEG
- **Count:** Minimum 1, maximum 5
- **Size:** Each file under 2MB

**Recommended Screenshots:**
1. Full ticket view with sidebar
2. Keyword Change History timeline
3. Role badges and GitHub integration
4. Settings/customization page
5. Milestone History timeline

---

## 🔧 Troubleshooting

### Issue: "sips: command not found"
**Solution:** This script requires macOS. For Linux, install ImageMagick:
```bash
sudo apt-get install imagemagick
# Then modify script to use 'convert' instead of 'sips'
```

### Issue: "Permission denied"
**Solution:** Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Issue: Screenshots look cropped/distorted
**Solution:** Try the other conversion method:
- If using crop, try letterbox
- Or manually create screenshots at 1280×800

### Issue: Package too large
**Solution:** The packaging script already excludes unnecessary files. If still too large:
- Optimize icon PNG files with `pngquant` or similar
- Check for large data files that could be minified

---

## 📦 Manual Packaging (Alternative)

If you prefer manual control:

```bash
cd /Users/juanmanuelgarrido/PROJECTS/2026/wp-trac-triager

# Create temporary directory
mkdir -p tmp-package

# Copy only necessary files
cp manifest.json tmp-package/
cp -r icons/ tmp-package/icons/
cp -r content/ tmp-package/content/
cp -r data/ tmp-package/data/
cp -r options/ tmp-package/options/
cp -r popup/ tmp-package/popup/

# Create ZIP
cd tmp-package
zip -r ../dist/wp-trac-triager-manual.zip .
cd ..

# Clean up
rm -rf tmp-package
```

---

## 📚 Additional Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)

---

## ✅ Pre-Submission Checklist

Before running scripts:
- [ ] Updated version in manifest.json
- [ ] Tested extension thoroughly
- [ ] Removed all console.log statements
- [ ] Removed all debug code
- [ ] Updated CHANGELOG.md
- [ ] Created GitHub release (optional)

After running scripts:
- [ ] Screenshots converted to 1280×800
- [ ] Package ZIP created successfully
- [ ] All validation checks pass
- [ ] Store listing content ready
- [ ] Permission justifications prepared

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Open an issue on GitHub
4. Contact Chrome Web Store support

Good luck with your submission! 🚀
