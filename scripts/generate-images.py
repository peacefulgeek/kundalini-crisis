#!/usr/bin/env python3
"""
Generate article images and upload to Bunny CDN for kundalini-crisis.
Uses Pillow to create dark-themed images with text, then uploads as WebP.
"""

import os
import io
import json
import glob
import requests
from PIL import Image, ImageDraw, ImageFont
import math

BUNNY_STORAGE = "ny.storage.bunnycdn.com"
BUNNY_ZONE = "kundalini-crisis"
BUNNY_KEY = "17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6"
CDN_HOST = "kundalini-crisis.b-cdn.net"

# Color palette
BG_DARK = (13, 17, 23)
BG_SECONDARY = (22, 27, 34)
ACCENT = (232, 168, 56)
VIOLET = (107, 63, 160)
TEXT_PRIMARY = (232, 224, 212)
TEXT_MUTED = (100, 110, 120)

def create_article_image(title, category, width=1200, height=675):
    """Create a dark-themed article hero image."""
    img = Image.new('RGB', (width, height), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Background gradient effect using rectangles
    for i in range(height):
        alpha = i / height
        r = int(BG_DARK[0] + (BG_SECONDARY[0] - BG_DARK[0]) * alpha * 0.3)
        g = int(BG_DARK[1] + (BG_SECONDARY[1] - BG_DARK[1]) * alpha * 0.3)
        b = int(BG_DARK[2] + (BG_SECONDARY[2] - BG_DARK[2]) * alpha * 0.3)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    # Add radial glow effect (violet)
    for radius in range(300, 0, -10):
        alpha = int(30 * (1 - radius/300))
        r = int(VIOLET[0] * alpha / 255)
        g = int(VIOLET[1] * alpha / 255)
        b = int(VIOLET[2] * alpha / 255)
        x_center = width // 4
        y_center = height // 2
        draw.ellipse(
            [x_center - radius, y_center - radius, x_center + radius, y_center + radius],
            outline=(r, g, b)
        )
    
    # Add amber glow (top right)
    for radius in range(200, 0, -10):
        alpha = int(20 * (1 - radius/200))
        r = int(ACCENT[0] * alpha / 255)
        g = int(ACCENT[1] * alpha / 255)
        b = int(ACCENT[2] * alpha / 255)
        x_center = width * 3 // 4
        y_center = height // 3
        draw.ellipse(
            [x_center - radius, y_center - radius, x_center + radius, y_center + radius],
            outline=(r, g, b)
        )
    
    # Draw decorative symbol
    symbol_x = 80
    symbol_y = 80
    draw.text((symbol_x, symbol_y), "✦", fill=ACCENT)
    
    # Draw category badge
    category_text = category.replace('-', ' ').upper()
    draw.rectangle([60, 120, 60 + len(category_text) * 8 + 20, 145], fill=(30, 40, 50))
    draw.text((70, 124), category_text, fill=ACCENT)
    
    # Draw title (word-wrapped)
    words = title.split()
    lines = []
    current_line = []
    max_chars = 40
    
    for word in words:
        if len(' '.join(current_line + [word])) <= max_chars:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    
    # Draw title lines
    y_start = height // 2 - len(lines) * 30
    for i, line in enumerate(lines[:4]):
        y = y_start + i * 60
        # Shadow
        draw.text((62, y + 2), line, fill=(0, 0, 0))
        # Main text
        draw.text((60, y), line, fill=TEXT_PRIMARY)
    
    # Draw bottom accent line
    draw.rectangle([60, height - 80, 60 + 100, height - 77], fill=ACCENT)
    
    # Draw site name
    draw.text((60, height - 65), "The Emergence", fill=TEXT_MUTED)
    draw.text((60, height - 45), "kundalinicrisis.com", fill=TEXT_MUTED)
    
    # Add some stars/particles
    import random
    random.seed(hash(title) % 1000)
    for _ in range(50):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.choice([1, 1, 1, 2])
        brightness = random.randint(100, 200)
        draw.ellipse([x, y, x+size, y+size], fill=(brightness, brightness, brightness))
    
    return img


def upload_to_bunny(image_bytes, remote_path):
    """Upload image bytes to Bunny CDN."""
    url = f"https://{BUNNY_STORAGE}/{BUNNY_ZONE}/{remote_path}"
    headers = {
        "AccessKey": BUNNY_KEY,
        "Content-Type": "image/webp"
    }
    
    response = requests.put(url, data=image_bytes, headers=headers)
    
    if response.status_code in [200, 201]:
        cdn_url = f"https://{CDN_HOST}/{remote_path}"
        return cdn_url
    else:
        print(f"  Upload failed: HTTP {response.status_code} - {response.text[:200]}")
        return None


def image_to_webp_bytes(img, quality=82):
    """Convert PIL image to WebP bytes."""
    buffer = io.BytesIO()
    img.save(buffer, format='WEBP', quality=quality, method=6)
    buffer.seek(0)
    return buffer.read()


def main():
    articles_dir = os.path.join(os.getcwd(), 'src/data/articles')
    article_files = glob.glob(os.path.join(articles_dir, '*.json'))
    
    print(f"Found {len(article_files)} articles")
    
    results = {}
    
    for article_file in sorted(article_files):
        with open(article_file) as f:
            article = json.load(f)
        
        slug = article['slug']
        title = article['title']
        category = article.get('category', 'spiritual-emergency')
        
        print(f"\nProcessing: {slug}")
        
        # Generate image
        img = create_article_image(title, category)
        
        # Convert to WebP
        webp_bytes = image_to_webp_bytes(img, quality=82)
        size_kb = len(webp_bytes) / 1024
        print(f"  Image size: {size_kb:.1f}KB")
        
        # Upload to Bunny CDN
        remote_path = f"images/articles/{slug}.webp"
        cdn_url = upload_to_bunny(webp_bytes, remote_path)
        
        if cdn_url:
            print(f"  ✓ Uploaded: {cdn_url}")
            results[slug] = cdn_url
            
            # Update article JSON with image URL
            article['image_url'] = cdn_url
            with open(article_file, 'w') as f:
                json.dump(article, f, indent=2)
        else:
            print(f"  ✗ Upload failed for {slug}")
    
    # Also create a placeholder image
    placeholder = Image.new('RGB', (1200, 675), BG_DARK)
    draw = ImageDraw.Draw(placeholder)
    draw.text((600, 337), "✦", fill=ACCENT)
    placeholder_bytes = image_to_webp_bytes(placeholder)
    upload_to_bunny(placeholder_bytes, "images/articles/placeholder.webp")
    
    # Also create author image placeholder
    author_img = Image.new('RGB', (400, 500), BG_SECONDARY)
    draw = ImageDraw.Draw(author_img)
    for i in range(400):
        alpha = i / 400
        r = int(BG_SECONDARY[0] + (VIOLET[0] - BG_SECONDARY[0]) * alpha * 0.2)
        g = int(BG_SECONDARY[1] + (VIOLET[1] - BG_SECONDARY[1]) * alpha * 0.2)
        b = int(BG_SECONDARY[2] + (VIOLET[2] - BG_SECONDARY[2]) * alpha * 0.2)
        draw.line([(0, i), (400, i)], fill=(r, g, b))
    draw.text((160, 200), "✦", fill=ACCENT)
    draw.text((140, 260), "Kalesh", fill=TEXT_PRIMARY)
    author_bytes = image_to_webp_bytes(author_img)
    upload_to_bunny(author_bytes, "images/kalesh-author.webp")
    
    print(f"\n\nDone! Uploaded {len(results)} article images + placeholder + author image.")
    print(f"CDN base: https://{CDN_HOST}/images/articles/")


if __name__ == '__main__':
    main()
