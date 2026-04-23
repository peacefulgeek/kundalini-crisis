#!/bin/bash
# Upload images to Bunny CDN for kundalini-crisis storage zone
# Storage zone: kundalini-crisis
# Hostname: ny.storage.bunnycdn.com
# Password: 17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6

BUNNY_STORAGE="ny.storage.bunnycdn.com"
BUNNY_ZONE="kundalini-crisis"
BUNNY_KEY="17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6"
CDN_HOST="kundalini-crisis.b-cdn.net"

upload_to_bunny() {
  local local_file="$1"
  local remote_path="$2"
  
  echo "Uploading $local_file -> $remote_path"
  
  local response=$(curl --http1.1 -s -w "%{http_code}" -X PUT \
    "https://${BUNNY_STORAGE}/${BUNNY_ZONE}/${remote_path}" \
    -H "AccessKey: ${BUNNY_KEY}" \
    -H "Content-Type: image/webp" \
    --data-binary "@${local_file}")
  
  local http_code="${response: -3}"
  
  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo "  ✓ Uploaded: https://${CDN_HOST}/${remote_path}"
    return 0
  else
    echo "  ✗ Failed (HTTP $http_code): $response"
    return 1
  fi
}

# Upload all images in the images directory
for img in /tmp/kundalini-images/*.webp; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    upload_to_bunny "$img" "images/articles/$filename"
  fi
done

echo "Upload complete."
