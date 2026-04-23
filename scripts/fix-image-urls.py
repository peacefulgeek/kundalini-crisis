#!/usr/bin/env python3
"""
Fix image URL mismatches in article JSON files and verify all images are accessible.
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
ARTICLES_DIR = Path("/home/ubuntu/kundalini-crisis/src/data/articles")

# Fix: post-awakening-depression was uploaded with wrong slug
# Need to re-upload with the correct slug
def copy_bunny_image(src_slug: str, dst_slug: str):
    """Download from src and re-upload as dst"""
    src_url = f"{BUNNY_CDN_URL}/images/articles/{src_slug}.webp"
    response = requests.get(src_url, timeout=30)
    if response.status_code == 200:
        upload_url = f"https://{BUNNY_HOSTNAME}/{BUNNY_STORAGE_ZONE}/images/articles/{dst_slug}.webp"
        headers = {"AccessKey": BUNNY_PASSWORD, "Content-Type": "image/webp"}
        r = requests.put(upload_url, data=response.content, headers=headers, timeout=30)
        return r.status_code in (200, 201)
    return False

# Fix the post-awakening-depression slug
print("Fixing post-awakening-depression slug...")
correct_slug = "post-awakening-depression-when-the-fireworks-end-and-youre-still-here"
wrong_slug = "post-awakening-depression"

# Check if correct slug already exists
check = requests.head(f"{BUNNY_CDN_URL}/images/articles/{correct_slug}.webp", timeout=10)
if check.status_code != 200:
    if copy_bunny_image(wrong_slug, correct_slug):
        print(f"  ✓ Fixed: {correct_slug}")
    else:
        print(f"  ✗ Failed to fix: {correct_slug}")
else:
    print(f"  ✓ Already correct: {correct_slug}")

# Now verify all article image URLs
print("\nVerifying all article image URLs...")
articles = list(ARTICLES_DIR.glob("*.json"))
broken = []
ok = []

for article_path in sorted(articles):
    with open(article_path) as f:
        article = json.load(f)
    
    slug = article.get("slug", article_path.stem)
    image_url = article.get("image_url", "")
    
    if not image_url:
        print(f"  [MISSING URL] {slug}")
        broken.append(slug)
        continue
    
    response = requests.head(image_url, timeout=10)
    if response.status_code == 200:
        print(f"  ✓ {slug}")
        ok.append(slug)
    else:
        print(f"  ✗ {slug} -> {response.status_code} ({image_url})")
        broken.append(slug)

print(f"\n{'='*60}")
print(f"OK: {len(ok)}/30")
print(f"Broken: {len(broken)}/30")
if broken:
    print(f"Broken slugs: {broken}")
