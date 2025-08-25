#!/usr/bin/env python3
"""
Professional Icon Generator for ChatGPT Prompt Optimizer Extension

This script creates clean, professional icons for Chrome Web Store submission.
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_professional_icon(size, output_path):
    """Create a professional icon with the specified size"""
    # Create a new image with a clean background
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions
    padding = size // 8
    icon_size = size - (padding * 2)
    
    # Create a subtle gradient background (blue to purple)
    for y in range(size):
        ratio = y / size
        r = int(59 + (103 - 59) * ratio)   # 59 to 103
        g = int(130 + (58 - 130) * ratio)  # 130 to 58
        b = int(246 + (183 - 246) * ratio) # 246 to 183
        
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    # Draw a clean chat bubble icon
    bubble_padding = size // 6
    bubble_width = icon_size - (bubble_padding * 2)
    bubble_height = int(bubble_width * 0.7)
    
    # Main bubble
    bubble_x = padding + bubble_padding
    bubble_y = padding + bubble_padding
    bubble_right = bubble_x + bubble_width
    bubble_bottom = bubble_y + bubble_height
    
    # Draw rounded rectangle for bubble
    radius = max(size // 20, 2)
    draw.rounded_rectangle(
        [bubble_x, bubble_y, bubble_right, bubble_bottom],
        radius=radius,
        fill=(255, 255, 255, 230),
        outline=(255, 255, 255, 255),
        width=max(size // 64, 1)
    )
    
    # Draw tail of bubble
    tail_width = size // 12
    tail_height = size // 12
    tail_x = bubble_x + (bubble_width // 4)
    tail_y = bubble_bottom
    
    tail_points = [
        (tail_x, tail_y),
        (tail_x + tail_width, tail_y),
        (tail_x + (tail_width // 2), tail_y + tail_height)
    ]
    draw.polygon(tail_points, fill=(255, 255, 255, 230), outline=(255, 255, 255, 255))
    
    # Draw optimization indicator (arrow pointing up)
    arrow_size = size // 16
    arrow_x = bubble_right - (arrow_size * 2)
    arrow_y = bubble_y + arrow_size
    
    # Draw upward arrow
    arrow_points = [
        (arrow_x, arrow_y + arrow_size),
        (arrow_x + arrow_size, arrow_y),
        (arrow_x + arrow_size * 2, arrow_y + arrow_size)
    ]
    draw.polygon(arrow_points, fill=(34, 197, 94, 255))  # Green color
    
    # Add subtle text "AI" in small size
    try:
        font_size = max(size // 8, 8)
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text = "AI"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    text_x = bubble_x + (bubble_width - text_width) // 2
    text_y = bubble_y + (bubble_height - text_height) // 2
    
    # Draw text with subtle shadow
    draw.text((text_x + 1, text_y + 1), text, font=font, fill=(0, 0, 0, 80))
    draw.text((text_x, text_y), text, font=font, fill=(0, 0, 0, 200))
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created {output_path} ({size}x{size})")

def main():
    """Generate all required icon sizes"""
    # Create extension directory if it doesn't exist
    extension_dir = "extension"
    if not os.path.exists(extension_dir):
        os.makedirs(extension_dir)
    
    # Generate icons for different sizes
    icon_sizes = [16, 48, 128]
    
    for size in icon_sizes:
        output_path = os.path.join(extension_dir, f"icon{size}.png")
        create_professional_icon(size, output_path)
    
    print("\nAll icons created successfully!")
    print("Icons saved in the 'extension' folder")
    print("Ready for Chrome Web Store submission!")

if __name__ == "__main__":
    main()
