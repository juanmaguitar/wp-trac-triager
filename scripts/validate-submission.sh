#!/bin/bash

###############################################################################
# Chrome Web Store Submission Validator
# Validates extension is ready for submission
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

ERRORS=0
WARNINGS=0
CHECKS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Chrome Web Store Submission Validator                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Helper functions
check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    CHECKS=$((CHECKS + 1))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
    CHECKS=$((CHECKS + 1))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
    CHECKS=$((CHECKS + 1))
}

section_header() {
    echo ""
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────${NC}"
}

# Change to project directory
cd "$PROJECT_DIR"

###############################################################################
# Check 1: Required Files
###############################################################################
section_header "📁 Required Files"

if [ -f "manifest.json" ]; then
    check_pass "manifest.json exists"
else
    check_fail "manifest.json not found"
fi

# Check icons
for size in 16 48 128; do
    if [ -f "icons/icon${size}.png" ]; then
        check_pass "icons/icon${size}.png exists"

        # Verify dimensions
        if command -v sips &> /dev/null; then
            WIDTH=$(sips -g pixelWidth "icons/icon${size}.png" 2>/dev/null | tail -1 | awk '{print $2}')
            HEIGHT=$(sips -g pixelHeight "icons/icon${size}.png" 2>/dev/null | tail -1 | awk '{print $2}')

            if [ "$WIDTH" = "$size" ] && [ "$HEIGHT" = "$size" ]; then
                check_pass "icons/icon${size}.png has correct dimensions (${size}×${size})"
            else
                check_fail "icons/icon${size}.png has wrong dimensions (${WIDTH}×${HEIGHT}, expected ${size}×${size})"
            fi
        fi
    else
        check_fail "icons/icon${size}.png not found"
    fi
done

# Check content scripts
if [ -f "content/trac-sidebar.js" ]; then
    check_pass "Main content script exists"
else
    check_fail "content/trac-sidebar.js not found"
fi

# Check options page
if [ -f "options/options.html" ] && [ -f "options/options.js" ]; then
    check_pass "Options page exists"
else
    check_warn "Options page incomplete"
fi

# Check popup
if [ -f "popup/popup.html" ] && [ -f "popup/popup.js" ]; then
    check_pass "Popup exists"
else
    check_warn "Popup incomplete"
fi

###############################################################################
# Check 2: manifest.json Validation
###############################################################################
section_header "📋 manifest.json Validation"

# Check if valid JSON
if jq empty manifest.json 2>/dev/null; then
    check_pass "manifest.json is valid JSON"

    # Extract fields
    VERSION=$(jq -r '.version' manifest.json)
    NAME=$(jq -r '.name' manifest.json)
    DESCRIPTION=$(jq -r '.description' manifest.json)

    check_pass "Version: $VERSION"
    check_pass "Name: $NAME"

    if [ ${#DESCRIPTION} -le 132 ]; then
        check_pass "Description length: ${#DESCRIPTION}/132 characters"
    else
        check_warn "Description too long: ${#DESCRIPTION}/132 characters (will be truncated in store)"
    fi

    # Check required fields
    if jq -e '.manifest_version' manifest.json > /dev/null 2>&1; then
        MANIFEST_VERSION=$(jq -r '.manifest_version' manifest.json)
        if [ "$MANIFEST_VERSION" = "3" ]; then
            check_pass "Manifest version 3 (required)"
        else
            check_fail "Manifest version $MANIFEST_VERSION (should be 3)"
        fi
    else
        check_fail "Missing manifest_version"
    fi

else
    check_fail "manifest.json is NOT valid JSON"
fi

###############################################################################
# Check 3: Screenshots
###############################################################################
section_header "📸 Screenshots"

SCREENSHOT_DIR="assets/chrome-web-store"
if [ -d "$SCREENSHOT_DIR" ]; then
    SCREENSHOT_COUNT=$(find "$SCREENSHOT_DIR" -name "*.png" -o -name "*.jpg" | wc -l | xargs)

    if [ "$SCREENSHOT_COUNT" -ge 1 ]; then
        check_pass "Found $SCREENSHOT_COUNT screenshot(s) in $SCREENSHOT_DIR"

        # Validate dimensions
        if command -v sips &> /dev/null; then
            for screenshot in "$SCREENSHOT_DIR"/*.png "$SCREENSHOT_DIR"/*.jpg; do
                [ -e "$screenshot" ] || continue

                WIDTH=$(sips -g pixelWidth "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')
                HEIGHT=$(sips -g pixelHeight "$screenshot" 2>/dev/null | tail -1 | awk '{print $2}')

                if [ "$WIDTH" = "1280" ] && [ "$HEIGHT" = "800" ]; then
                    check_pass "$(basename "$screenshot"): ${WIDTH}×${HEIGHT} ✓"
                elif [ "$WIDTH" = "640" ] && [ "$HEIGHT" = "400" ]; then
                    check_pass "$(basename "$screenshot"): ${WIDTH}×${HEIGHT} ✓"
                else
                    check_fail "$(basename "$screenshot"): ${WIDTH}×${HEIGHT} (should be 1280×800 or 640×400)"
                fi
            done
        fi
    else
        check_fail "No screenshots found in $SCREENSHOT_DIR"
        check_warn "Create screenshots at 1280×800 or 640×400 and place in $SCREENSHOT_DIR"
    fi
else
    check_warn "$SCREENSHOT_DIR directory not found"
    check_warn "Create $SCREENSHOT_DIR and add screenshots (1280×800 or 640×400)"
fi

###############################################################################
# Check 4: Code Quality
###############################################################################
section_header "🔍 Code Quality Checks"

# Check for console.log statements
CONSOLE_LOGS=$(grep -r "console\.log" content/ data/ options/ popup/ 2>/dev/null | wc -l | xargs)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    check_pass "No console.log statements found"
else
    check_warn "Found $CONSOLE_LOGS console.log statement(s) - consider removing for production"
fi

# Check for TODO comments
TODOS=$(grep -r "TODO\|FIXME" content/ data/ options/ popup/ 2>/dev/null | wc -l | xargs)
if [ "$TODOS" -eq 0 ]; then
    check_pass "No TODO/FIXME comments found"
else
    check_warn "Found $TODOS TODO/FIXME comment(s)"
fi

# Check file sizes
LARGE_FILES=$(find . -type f -size +1M ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./assets/*" 2>/dev/null)
if [ -z "$LARGE_FILES" ]; then
    check_pass "No unusually large files in extension"
else
    check_warn "Large files detected (>1MB):"
    echo "$LARGE_FILES" | while read file; do
        SIZE=$(du -h "$file" | cut -f1)
        echo "    $file ($SIZE)"
    done
fi

###############################################################################
# Check 5: Package Readiness
###############################################################################
section_header "📦 Package Readiness"

if [ -d "dist" ]; then
    LATEST_ZIP=$(ls -t dist/*.zip 2>/dev/null | head -1)
    if [ -n "$LATEST_ZIP" ]; then
        ZIP_SIZE=$(du -h "$LATEST_ZIP" | cut -f1)
        check_pass "Package exists: $(basename "$LATEST_ZIP") ($ZIP_SIZE)"

        # Check ZIP size (Chrome Web Store has 100MB limit)
        ZIP_SIZE_BYTES=$(stat -f%z "$LATEST_ZIP" 2>/dev/null || stat -c%s "$LATEST_ZIP" 2>/dev/null)
        MAX_SIZE=$((100 * 1024 * 1024))  # 100MB

        if [ "$ZIP_SIZE_BYTES" -lt "$MAX_SIZE" ]; then
            check_pass "Package size OK ($ZIP_SIZE, limit is 100MB)"
        else
            check_fail "Package too large ($ZIP_SIZE, limit is 100MB)"
        fi
    else
        check_warn "No package found in dist/"
        check_warn "Run ./scripts/package-extension.sh to create it"
    fi
else
    check_warn "dist/ directory not found"
    check_warn "Run ./scripts/package-extension.sh to create package"
fi

###############################################################################
# Check 6: Store Listing Requirements
###############################################################################
section_header "📝 Store Listing Checklist"

echo -e "${YELLOW}Review these items manually:${NC}"
echo ""
echo "  [ ] Store listing description prepared (max 16,000 chars)"
echo "  [ ] Single purpose statement written (max 1,000 chars)"
echo "  [ ] Permission justifications ready"
echo "  [ ] Remote code usage disclosed (if applicable)"
echo "  [ ] Privacy policy URL (if collecting user data)"
echo "  [ ] Screenshots have descriptive captions"
echo "  [ ] Extension tested in Chrome"
echo "  [ ] \$5 developer fee paid (one-time)"
echo ""

###############################################################################
# Summary
###############################################################################
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ ALL CHECKS PASSED${NC}"
    echo -e "${GREEN}Your extension is ready for submission!${NC}"
    EXIT_CODE=0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠ PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}$WARNINGS warning(s) found. Review above.${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}${BOLD}✗ VALIDATION FAILED${NC}"
    echo -e "${RED}$ERRORS error(s) must be fixed before submission${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  Total checks: $CHECKS"
echo -e "  ${GREEN}Passed: $((CHECKS - ERRORS - WARNINGS))${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "  ${RED}Errors: $ERRORS${NC}"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Next steps:${NC}"
    echo "  1. Review warnings (if any)"
    echo "  2. Run ./scripts/package-extension.sh (if not done)"
    echo "  3. Submit to Chrome Web Store"
    echo "  4. Monitor review status"
else
    echo -e "${RED}Fix errors above, then run this script again.${NC}"
fi

echo ""
exit $EXIT_CODE
