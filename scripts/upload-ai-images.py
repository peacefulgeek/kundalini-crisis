#!/usr/bin/env python3
"""
Read generated image results, convert to WebP, upload to Bunny CDN.
"""

import json
import base64
import os
import requests
from pathlib import Path
from io import BytesIO
from PIL import Image

# Config
BUNNY_STORAGE_ZONE = "kundalini-crisis"
BUNNY_HOSTNAME = "ny.storage.bunnycdn.com"
BUNNY_PASSWORD = "17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6"
BUNNY_CDN_URL = "https://kundalini-crisis.b-cdn.net"

# Load results
results_file = Path("/home/ubuntu/generate_article_images.json")
with open(results_file) as f:
    data = json.load(f)

results = data["results"]
print(f"Processing {len(results)} images...")

# Map from slug to image path
slug_to_path = {}
for r in results:
    slug = r["input"]
    image_path = r["output"].get("image_path")
    if image_path and r["output"].get("success"):
        slug_to_path[slug] = image_path

print(f"Found {len(slug_to_path)} successful images")

# Also check the image_path directory for files
image_dir = Path("/home/ubuntu/image_path")
if image_dir.exists():
    # Map files by decoding the base64 slug in filename
    for f in image_dir.iterdir():
        if f.suffix == '.png':
            # Try to decode the slug from filename
            parts = f.stem.split('_')
            if len(parts) >= 4:
                try:
                    encoded = parts[-1]
                    decoded = base64.b64decode(encoded + '==').decode('utf-8')
                    slug = Path(decoded).name
                    if slug not in slug_to_path:
                        slug_to_path[slug] = str(f)
                except:
                    pass

print(f"Total images to process: {len(slug_to_path)}")

def convert_to_webp(image_path: str, max_size: int = 180 * 1024) -> bytes:
    """Convert image to WebP at 1200x675"""
    img = Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    # Resize to 1200x675 (16:9)
    img = img.resize((1200, 675), Image.LANCZOS)
    
    for quality in [85, 75, 65, 55, 45]:
        buffer = BytesIO()
        img.save(buffer, format='WEBP', quality=quality, method=6)
        data = buffer.getvalue()
        if len(data) <= max_size:
            return data
    
    buffer = BytesIO()
    img.save(buffer, format='WEBP', quality=40, method=6)
    return buffer.getvalue()

def upload_to_bunny(slug: str, webp_data: bytes) -> bool:
    """Upload WebP image to Bunny CDN"""
    url = f"https://{BUNNY_HOSTNAME}/{BUNNY_STORAGE_ZONE}/images/articles/{slug}.webp"
    headers = {
        "AccessKey": BUNNY_PASSWORD,
        "Content-Type": "image/webp",
    }
    try:
        response = requests.put(url, data=webp_data, headers=headers, timeout=30)
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"  [ERROR] Upload failed for {slug}: {e}")
        return False

success = 0
failed = []

for i, (slug, image_path) in enumerate(slug_to_path.items()):
    print(f"\n[{i+1}/{len(slug_to_path)}] {slug}")
    
    if not Path(image_path).exists():
        print(f"  [SKIP] File not found: {image_path}")
        failed.append(slug)
        continue
    
    try:
        print(f"  Converting to WebP...")
        webp_data = convert_to_webp(image_path)
        print(f"  Size: {len(webp_data)/1024:.1f}KB")
        
        print(f"  Uploading to Bunny CDN...")
        if upload_to_bunny(slug, webp_data):
            print(f"  ✓ Uploaded: {BUNNY_CDN_URL}/images/articles/{slug}.webp")
            success += 1
        else:
            print(f"  ✗ Upload failed")
            failed.append(slug)
    except Exception as e:
        print(f"  [ERROR] {e}")
        failed.append(slug)

print(f"\n{'='*60}")
print(f"Complete: {success}/{len(slug_to_path)} images uploaded")
if failed:
    print(f"Failed ({len(failed)}): {failed}")
