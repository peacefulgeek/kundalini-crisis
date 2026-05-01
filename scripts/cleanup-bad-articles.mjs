/**
 * One-shot cleanup: finds all articles with bad image_url (non-string or missing b-cdn.net)
 * or word_count < 1800, deletes them, and regenerates them.
 */
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '../src/data/articles');

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));

const toFix = [];

for (const file of files) {
  const filePath = path.join(ARTICLES_DIR, file);
  try {
    const article = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const img = article.image_url;
    const wc = article.word_count || 0;
    const badImage = !img || typeof img !== 'string' || !img.includes('b-cdn.net');
    const badWc = wc < 1800;
    if (badImage || badWc) {
      toFix.push({ file, slug: article.slug, title: article.title, tags: article.tags || [], wc, badImage, badWc });
    }
  } catch (e) {
    console.error(`Error reading ${file}: ${e.message}`);
  }
}

console.log(`Found ${toFix.length} articles to fix`);

if (toFix.length === 0) {
  console.log('All articles are clean!');
  process.exit(0);
}

// Delete all bad articles first
for (const { file, slug, wc, badImage, badWc } of toFix) {
  const filePath = path.join(ARTICLES_DIR, file);
  fs.unlinkSync(filePath);
  console.log(`Deleted: ${slug} (wc:${wc} badImage:${badImage} badWc:${badWc})`);
}

// Regenerate all in parallel batches of 4
const BATCH_SIZE = 4;
for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
  const batch = toFix.slice(i, i + BATCH_SIZE);
  console.log(`\nBatch ${Math.floor(i/BATCH_SIZE)+1}: regenerating ${batch.map(a => a.slug).join(', ')}`);
  
  await Promise.all(batch.map(({ title, slug, tags }) => {
    return new Promise((resolve) => {
      const input = `${title}|||${slug}|||${tags.join(',')}`;
      const child = spawn('node', ['scripts/generate-single-article.mjs', input], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
      let out = '';
      child.stdout.on('data', d => { out += d; process.stdout.write(d); });
      child.stderr.on('data', d => process.stderr.write(d));
      child.on('close', (code) => {
        if (code !== 0) console.error(`FAILED: ${slug} (exit ${code})`);
        resolve();
      });
    });
  }));
}

// Final verification
console.log('\n=== FINAL VERIFICATION ===');
const allFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
let stillBad = 0;
for (const file of allFiles) {
  const article = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8'));
  const img = article.image_url;
  const wc = article.word_count || 0;
  if (!img || typeof img !== 'string' || !img.includes('b-cdn.net') || wc < 1800) {
    console.log(`STILL BAD: ${file} wc:${wc} img:${img}`);
    stillBad++;
  }
}
console.log(`Total: ${allFiles.length} | Still bad: ${stillBad}`);
console.log(stillBad === 0 ? '=== ALL CLEAN ===' : '=== STILL HAS ISSUES ===');
