/**
 * One-time migration: add status/queued_at fields to existing articles
 * All existing articles get status='published' (they're already live)
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, '../src/data/articles');

async function migrate() {
  const files = await fs.readdir(ARTICLES_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`Migrating ${jsonFiles.length} articles...`);
  let updated = 0;
  
  for (const file of jsonFiles) {
    const filePath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(filePath, 'utf8');
    const article = JSON.parse(raw);
    
    let changed = false;
    
    // Add status if missing
    if (!article.status) {
      article.status = 'published';
      changed = true;
    }
    
    // Add queued_at if missing (use published_at as fallback)
    if (!article.queued_at) {
      article.queued_at = article.published_at || new Date().toISOString();
      changed = true;
    }
    
    if (changed) {
      await fs.writeFile(filePath, JSON.stringify(article, null, 2));
      updated++;
    }
  }
  
  console.log(`Done. Updated ${updated}/${jsonFiles.length} articles.`);
}

migrate().catch(console.error);
