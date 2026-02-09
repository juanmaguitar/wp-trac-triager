#!/bin/bash

###############################################################################
# Chrome Web Store Extension Packaging Script
# Creates a clean ZIP file ready for Chrome Web Store submission
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION=$(grep '"version"' "$EXTENSION_DIR/manifest.json" | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT_DIR="$EXTENSION_DIR/dist"
PACKAGE_NAME="wp-trac-triager-v${VERSION}.zip"
OUTPUT_PATH="$OUTPUT_DIR/$PACKAGE_NAME"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  WP Trac Triager - Chrome Web Store Packaging Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validation
echo -e "${YELLOW}➤ Validating extension files...${NC}"

if [ ! -f "$EXTENSION_DIR/manifest.json" ]; then
    echo -e "${RED}✗ Error: manifest.json not found!${NC}"
    exit 1
fi

# Check required icon files
MISSING_ICONS=()
for size in 16 48 128; do
    if [ ! -f "$EXTENSION_DIR/icons/icon${size}.png" ]; then
        MISSING_ICONS+=("icon${size}.png")
    fi
done

if [ ${#MISSING_ICONS[@]} -ne 0 ]; then
    echo -e "${RED}✗ Error: Missing required icon files:${NC}"
    for icon in "${MISSING_ICONS[@]}"; do
        echo -e "${RED}  - icons/$icon${NC}"
    done
    exit 1
fi

echo -e "${GREEN}✓ manifest.json found${NC}"
echo -e "${GREEN}✓ All required icons present${NC}"
echo -e "${GREEN}✓ Extension version: $VERSION${NC}"
echo ""

# Create dist directory
echo -e "${YELLOW}➤ Preparing output directory...${NC}"
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✓ Output directory ready: $OUTPUT_DIR${NC}"
echo ""

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}➤ Creating clean copy for packaging...${NC}"

# Copy files (excluding dev/docs files)
rsync -a \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='assets' \
    --exclude='scripts' \
    --exclude='docs' \
    --exclude='*.md' \
    --exclude='.DS_Store' \
    --exclude='.eslintrc*' \
    --exclude='.prettierrc*' \
    --exclude='package.json' \
    --exclude='package-lock.json' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='*.log' \
    "$EXTENSION_DIR/" "$TEMP_DIR/"

echo -e "${GREEN}✓ Clean copy created${NC}"
echo ""

# Display included files
echo -e "${BLUE}📦 Files included in package:${NC}"
cd "$TEMP_DIR"
find . -type f | sed 's|^\./||' | sort | while read file; do
    echo "   $file"
done
echo ""

# Create ZIP file
echo -e "${YELLOW}➤ Creating ZIP package...${NC}"
cd "$TEMP_DIR"
zip -r "$OUTPUT_PATH" . > /dev/null

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)

echo -e "${GREEN}✓ Package created successfully${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    PACKAGING COMPLETE                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Package Location:${NC} $OUTPUT_PATH"
echo -e "${GREEN}Package Size:${NC}     $FILE_SIZE"
echo -e "${GREEN}Version:${NC}          $VERSION"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Go to Chrome Web Store Developer Dashboard"
echo "     https://chrome.google.com/webstore/devconsole"
echo "  2. Click 'New Item' (if first submission)"
echo "  3. Upload: $PACKAGE_NAME"
echo "  4. Fill in store listing details"
echo "  5. Submit for review"
echo ""
echo -e "${BLUE}📋 Checklist before submission:${NC}"
echo "  [ ] Verify manifest.json version is correct"
echo "  [ ] Test extension in Chrome"
echo "  [ ] Prepare screenshots (1280×800 or 640×400)"
echo "  [ ] Review store listing content"
echo "  [ ] Check permission justifications"
echo ""
echo -e "${GREEN}Good luck with your submission! 🚀${NC}"
