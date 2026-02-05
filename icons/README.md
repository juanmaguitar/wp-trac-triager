# Extension Icons

This folder should contain three PNG icon files:

- `icon16.png` - 16x16 pixels (browser toolbar)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Quick Icon Creation

### Option 1: Use an existing icon
Find a wrench/tool/triage icon and resize it to the required dimensions.

### Option 2: Create with online tools
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Generate all sizes from one image
- [Favicon.io](https://favicon.io/) - Quick favicon/icon generator
- [Canva](https://canva.com) - Design custom icons

### Option 3: Use emoji as placeholder
You can use this simple bash command to create basic placeholder icons using ImageMagick:

```bash
# Red background with white wrench emoji (requires ImageMagick)
convert -size 128x128 xc:#0073aa -gravity center -pointsize 80 -fill white -annotate +0+0 "🔧" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

Or use this Python script:

```python
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # Create image with WordPress blue background
    img = Image.new('RGB', (size, size), color='#0073aa')
    draw = ImageDraw.Draw(img)

    # Add white circle in center
    margin = size // 6
    draw.ellipse([margin, margin, size-margin, size-margin], fill='white')

    # Add text
    font_size = size // 2
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
    except:
        font = ImageFont.load_default()

    text = "T"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    position = ((size - text_width) // 2, (size - text_height) // 2 - size//12)
    draw.text(position, text, fill='#0073aa', font=font)

    img.save(filename)
    print(f"Created {filename}")

create_icon(128, 'icon128.png')
create_icon(48, 'icon48.png')
create_icon(16, 'icon16.png')
```

## Design Guidelines

- Use WordPress brand colors (#0073aa blue, or #00a0d2 light blue)
- Keep it simple and recognizable at 16x16
- Consider using:
  - Wrench/tool icon (representing "triage")
  - Ticket/document icon
  - WordPress logo with overlay
  - Checklist icon

## Current Status

⚠️ **Icons not yet created** - The extension will not load without these files.

Generate placeholder icons before loading the extension for the first time.
