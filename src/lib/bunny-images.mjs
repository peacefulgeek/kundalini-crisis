/**
 * Bunny CDN Image Library
 * Per addendum Section 4: credentials hardcoded, no env vars.
 * 40 pre-generated WebP images at /library/lib-01.webp through lib-40.webp
 * assignHeroImage() picks one randomly and copies it to /images/{slug}.webp
 */

const BUNNY_STORAGE_ZONE = 'kundalini-crisis';
const BUNNY_API_KEY = '17cc449c-3cfb-4518-99b409b7dc19-6d59-44e6';
const BUNNY_PULL_ZONE = 'https://kundalini-crisis.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

const LIBRARY_SIZE = 40;

/**
 * Assign a hero image to an article by copying a random library image
 * to /images/{slug}.webp on Bunny CDN.
 * @param {string} slug - Article slug (used as filename)
 * @returns {Promise<string>} - Full CDN URL of the assigned image
 */
export async function assignHeroImage(slug) {
  const num = String(Math.floor(Math.random() * LIBRARY_SIZE) + 1).padStart(2, '0');
  const sourceFile = `lib-${num}.webp`;
  const destFile = `${slug}.webp`;

  try {
    // Download from library
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error(`Download failed: ${downloadRes.status} ${sourceUrl}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    // Upload to /images/{slug}.webp
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp'
      },
      body: imageBuffer
    });

    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status} ${uploadUrl}`);

    const finalUrl = `${BUNNY_PULL_ZONE}/images/${destFile}`;
    console.log(`[bunny-images] Assigned ${sourceFile} → ${destFile}`);
    return finalUrl;
  } catch (err) {
    // Fallback: link directly to the library image
    console.warn(`[bunny-images] Copy failed for ${slug}: ${err.message} — using library fallback`);
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}

/**
 * Upload a single image buffer to Bunny CDN
 * @param {string} path - Storage path (e.g., 'library/lib-01.webp')
 * @param {Buffer|ArrayBuffer} buffer - Image data
 * @returns {Promise<string>} - Full CDN URL
 */
export async function uploadToBunny(path, buffer) {
  const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${path}`;
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'image/webp'
    },
    body: buffer
  });
  if (!res.ok) throw new Error(`Bunny upload failed: ${res.status} ${path}`);
  return `${BUNNY_PULL_ZONE}/${path}`;
}

export { BUNNY_PULL_ZONE, BUNNY_STORAGE_ZONE };
