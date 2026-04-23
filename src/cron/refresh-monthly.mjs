import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function refreshMonthly() {
  console.log('[refresh-monthly] Running monthly article refresh');
  
  // In production with DB: refresh the oldest articles
  // For now: log and return
  const articlesDir = path.join(__dirname, '../../src/data/articles');
  
  try {
    const files = await fs.readdir(articlesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`[refresh-monthly] Found ${jsonFiles.length} articles to potentially refresh`);
    // TODO: When DB is connected, refresh oldest 5 articles
  } catch (err) {
    console.error('[refresh-monthly] Error:', err.message);
  }
}
