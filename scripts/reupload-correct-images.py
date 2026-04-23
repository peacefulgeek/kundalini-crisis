#!/usr/bin/env python3
"""
Re-upload the correct AI-generated images to Bunny CDN.
Uses the exact file paths from generate_article_images.json.
"""

import json
import requests
from pathlib import Path
from io import BytesIO
from PIL import Image

BUNNY_STORAGE_ZONE = "kundalini-crisis"
BUNNY_HOSTNAME = "ny.storage.bunnycdn.com"
BUNNY_PASSWORD = "17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6"
BUNNY_CDN_URL = "https://kundalini-crisis.b-cdn.net"

# Load results
with open("/home/ubuntu/generate_article_images.json") as f:
    data = json.load(f)

results = data["results"]

def convert_to_webp(image_path: str, max_size: int = 180 * 1024) -> bytes:
    """Convert image to WebP at 1200x675"""
    img = Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
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
    url = f"https://{BUNNY_HOSTNAME}/{BUNNY_STORAGE_ZONE}/images/articles/{slug}.webp"
    headers = {"AccessKey": BUNNY_PASSWORD, "Content-Type": "image/webp"}
    try:
        response = requests.put(url, data=webp_data, headers=headers, timeout=30)
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"  [ERROR] Upload failed: {e}")
        return False

success = 0
failed = []

for i, r in enumerate(results):
    slug = r["input"]
    image_path = r["output"].get("image_path", "")
    
    print(f"\n[{i+1}/{len(results)}] {slug}")
    
    if not image_path or not Path(image_path).exists():
        print(f"  [SKIP] File not found: {image_path}")
        failed.append(slug)
        continue
    
    try:
        print(f"  Converting {Path(image_path).name[:40]}...")
        webp_data = convert_to_webp(image_path)
        print(f"  Size: {len(webp_data)/1024:.1f}KB")
        
        if upload_to_bunny(slug, webp_data):
            print(f"  ✓ Uploaded")
            success += 1
        else:
            print(f"  ✗ Upload failed")
            failed.append(slug)
    except Exception as e:
        print(f"  [ERROR] {e}")
        failed.append(slug)

print(f"\n{'='*60}")
print(f"Complete: {success}/{len(results)} images uploaded")
if failed:
    print(f"Failed ({len(failed)}): {failed}")
