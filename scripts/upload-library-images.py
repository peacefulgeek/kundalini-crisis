#!/usr/bin/env python3
"""
Upload 40 library images to Bunny CDN at /library/lib-01.webp through lib-40.webp
Uses the existing AI-generated images from /home/ubuntu/image_path/ as source
"""
import os
import json
import requests
from pathlib import Path
from PIL import Image
import io

BUNNY_STORAGE_ZONE = 'kundalini-crisis'
BUNNY_API_KEY = '17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6'
BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com'
BUNNY_PULL_ZONE = 'https://kundalini-crisis.b-cdn.net'

IMAGE_DIR = Path('/home/ubuntu/image_path')
TARGET_SIZE = (1200, 675)
MAX_KB = 180

def convert_to_webp(src_path):
    """Convert image to WebP at 1200x675, under 180KB"""
    img = Image.open(src_path).convert('RGB')
    img = img.resize(TARGET_SIZE, Image.LANCZOS)
    
    # Try quality levels until under MAX_KB
    for quality in [85, 75, 65, 55, 45]:
        buf = io.BytesIO()
        img.save(buf, format='WEBP', quality=quality, method=6)
        size_kb = buf.tell() / 1024
        if size_kb <= MAX_KB:
            buf.seek(0)
            return buf.read(), size_kb
    
    # Last resort
    buf = io.BytesIO()
    img.save(buf, format='WEBP', quality=35, method=6)
    buf.seek(0)
    return buf.read(), buf.tell() / 1024

def upload_to_bunny(path, data):
    url = f'https://{BUNNY_HOSTNAME}/{BUNNY_STORAGE_ZONE}/{path}'
    resp = requests.put(url, data=data, headers={
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp'
    }, timeout=30)
    return resp.status_code

def main():
    # Get all source images
    sources = sorted(IMAGE_DIR.glob('*.png')) + sorted(IMAGE_DIR.glob('*.jpg')) + sorted(IMAGE_DIR.glob('*.webp'))
    
    if not sources:
        print("ERROR: No source images found in /home/ubuntu/image_path/")
        return
    
    print(f"Found {len(sources)} source images")
    
    # We need 40 library images — cycle through sources if needed
    uploaded = 0
    failed = 0
    
    for i in range(1, 41):
        src = sources[(i - 1) % len(sources)]
        dest_path = f'library/lib-{str(i).padStart(2, "0") if False else str(i).zfill(2)}.webp'
        
        print(f'[{i}/40] {src.name} → {dest_path}', end=' ')
        
        try:
            data, size_kb = convert_to_webp(src)
            status = upload_to_bunny(dest_path, data)
            
            if status in (200, 201):
                print(f'✓ {size_kb:.1f}KB')
                uploaded += 1
            else:
                print(f'✗ HTTP {status}')
                failed += 1
        except Exception as e:
            print(f'✗ ERROR: {e}')
            failed += 1
    
    print(f'\n{"="*50}')
    print(f'Uploaded: {uploaded}/40')
    print(f'Failed: {failed}/40')
    
    if uploaded > 0:
        print(f'\nLibrary available at:')
        print(f'  {BUNNY_PULL_ZONE}/library/lib-01.webp')
        print(f'  ...through...')
        print(f'  {BUNNY_PULL_ZONE}/library/lib-40.webp')

if __name__ == '__main__':
    main()
