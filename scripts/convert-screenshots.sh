#!/bin/bash

###############################################################################
# Screenshot Conversion Script for Chrome Web Store
# Converts screenshots to Chrome Web Store requirements (1280×800, 16:10)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
INPUT_DIR="$PROJECT_DIR/assets"
OUTPUT_DIR="$PROJECT_DIR/assets/chrome-web-store"
TARGET_WIDTH=1280
TARGET_HEIGHT=800

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Screenshot Converter for Chrome Web Store             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if sips is available (macOS)
if ! command -v sips &> /dev/null; then
    echo -e "${RED}✗ Error: 'sips' command not found${NC}"
    echo "This script requires macOS built-in 'sips' tool"
    echo ""
    echo "Alternative: Install ImageMagick"
    echo "  brew install imagemagick"
    echo "  Then use 'convert' command instead"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✓ Output directory: $OUTPUT_DIR${NC}"
echo ""

# Check for input files
INPUT_FILES=("$INPUT_DIR"/*.png)
if [ ! -e "${INPUT_FILES[0]}" ]; then
    echo -e "${RED}✗ Error: No PNG files found in $INPUT_DIR${NC}"
    exit 1
fi

# Conversion method selection
echo -e "${YELLOW}Select conversion method:${NC}"
echo "  1. Center Crop (recommended - no borders, may lose edges)"
echo "  2. Letterbox (adds borders to preserve full content)"
echo ""
read -p "Enter choice (1 or 2): " CHOICE

case $CHOICE in
    1)
        METHOD="crop"
        echo -e "${GREEN}✓ Using center crop method${NC}"
        ;;
    2)
        METHOD="letterbox"
        echo -e "${GREEN}✓ Using letterbox method${NC}"
        ;;
    *)
        echo -e "${RED}✗ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}➤ Processing screenshots...${NC}"
echo ""

COUNTER=1
for input_file in "$INPUT_DIR"/*.png; do
    if [ ! -f "$input_file" ]; then
        continue
    fi

    filename=$(basename "$input_file")
    base="${filename%.*}"
    output_file="$OUTPUT_DIR/screenshot-${COUNTER}.png"

    echo -e "${BLUE}Processing: $filename${NC}"

    # Get original dimensions
    ORIG_WIDTH=$(sips -g pixelWidth "$input_file" | tail -1 | awk '{print $2}')
    ORIG_HEIGHT=$(sips -g pixelHeight "$input_file" | tail -1 | awk '{print $2}')

    echo "  Original: ${ORIG_WIDTH}×${ORIG_HEIGHT}"

    if [ "$METHOD" = "crop" ]; then
        # Method 1: Center crop to 16:10, then resize to 1280×800

        # Calculate crop dimensions to maintain 16:10 aspect ratio
        ORIG_RATIO=$(echo "scale=4; $ORIG_WIDTH / $ORIG_HEIGHT" | bc)
        TARGET_RATIO=1.6  # 16:10 = 1.6

        if (( $(echo "$ORIG_RATIO > $TARGET_RATIO" | bc -l) )); then
            # Image is wider than 16:10, crop width
            CROP_HEIGHT=$ORIG_HEIGHT
            CROP_WIDTH=$(echo "scale=0; $ORIG_HEIGHT * 1.6 / 1" | bc)
        else
            # Image is taller than 16:10, crop height
            CROP_WIDTH=$ORIG_WIDTH
            CROP_HEIGHT=$(echo "scale=0; $ORIG_WIDTH / 1.6" | bc)
        fi

        # Create temporary cropped file
        TEMP_FILE=$(mktemp).png
        sips -c $CROP_HEIGHT $CROP_WIDTH "$input_file" --out "$TEMP_FILE" > /dev/null 2>&1

        # Resize to target dimensions
        sips -z $TARGET_HEIGHT $TARGET_WIDTH "$TEMP_FILE" --out "$output_file" > /dev/null 2>&1

        # Clean up temp file
        rm "$TEMP_FILE"

        echo -e "  ${GREEN}✓ Cropped to ${CROP_WIDTH}×${CROP_HEIGHT}, resized to ${TARGET_WIDTH}×${TARGET_HEIGHT}${NC}"

    else
        # Method 2: Add letterbox to reach 16:10 ratio

        # Calculate letterbox dimensions
        ORIG_RATIO=$(echo "scale=4; $ORIG_WIDTH / $ORIG_HEIGHT" | bc)
        TARGET_RATIO=1.6

        if (( $(echo "$ORIG_RATIO > $TARGET_RATIO" | bc -l) )); then
            # Image is wider, add top/bottom bars
            NEW_WIDTH=$ORIG_WIDTH
            NEW_HEIGHT=$(echo "scale=0; $ORIG_WIDTH / 1.6" | bc)
        else
            # Image is taller, add left/right bars
            NEW_HEIGHT=$ORIG_HEIGHT
            NEW_WIDTH=$(echo "scale=0; $ORIG_HEIGHT * 1.6" | bc)
        fi

        # Create temp file with letterbox
        TEMP_FILE=$(mktemp).png
        sips -p $NEW_HEIGHT $NEW_WIDTH "$input_file" --out "$TEMP_FILE" > /dev/null 2>&1

        # Resize to target
        sips -z $TARGET_HEIGHT $TARGET_WIDTH "$TEMP_FILE" --out "$output_file" > /dev/null 2>&1

        # Clean up
        rm "$TEMP_FILE"

        echo -e "  ${GREEN}✓ Letterboxed to ${NEW_WIDTH}×${NEW_HEIGHT}, resized to ${TARGET_WIDTH}×${TARGET_HEIGHT}${NC}"
    fi

    echo "  Output: screenshot-${COUNTER}.png"
    echo ""

    COUNTER=$((COUNTER + 1))
done

# Final verification
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Conversion complete!${NC}"
echo ""
echo -e "${BLUE}Converted screenshots:${NC}"
ls -lh "$OUTPUT_DIR"/*.png | awk '{printf "  %s (%s)\n", $9, $5}'
echo ""

echo -e "${YELLOW}Verifying dimensions...${NC}"
for file in "$OUTPUT_DIR"/*.png; do
    filename=$(basename "$file")
    WIDTH=$(sips -g pixelWidth "$file" | tail -1 | awk '{print $2}')
    HEIGHT=$(sips -g pixelHeight "$file" | tail -1 | awk '{print $2}')

    if [ "$WIDTH" -eq "$TARGET_WIDTH" ] && [ "$HEIGHT" -eq "$TARGET_HEIGHT" ]; then
        echo -e "  ${GREEN}✓${NC} $filename: ${WIDTH}×${HEIGHT}"
    else
        echo -e "  ${RED}✗${NC} $filename: ${WIDTH}×${HEIGHT} (INCORRECT)"
    fi
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  SCREENSHOTS READY                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Location:${NC} $OUTPUT_DIR"
echo -e "${GREEN}Format:${NC}   PNG 24-bit, ${TARGET_WIDTH}×${TARGET_HEIGHT}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review converted screenshots"
echo "  2. Rename to descriptive names (optional)"
echo "  3. Upload to Chrome Web Store Developer Dashboard"
echo "  4. Add captions for each screenshot"
echo ""
echo -e "${BLUE}Recommended captions:${NC}"
echo "  • Screenshot 1: 'Complete triage context at a glance'"
echo "  • Screenshot 2: 'Track keyword evolution with complete history'"
echo "  • Screenshot 3: 'Instant role recognition for all contributors'"
echo ""
