/**
 * Article Store — JSON-file-based queue system
 * 
 * Each article JSON file has:
 *   status: 'queued' | 'published'
 *   queued_at: ISO timestamp
 *   published_at: ISO timestamp (null if queued)
 * 
 * CRITICAL: Only 'published' articles are served to the frontend.
 * Queued articles NEVER leak to the public API, sitemap, or frontend.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(process.cwd(), 'src/data/articles');

/**
 * Load all articles, optionally filtered by status
 * @param {'published'|'queued'|'all'} status
 * @returns {Promise<Array>}
 */
export async function loadArticles(status = 'published') {
  try {
    const files = await fs.readdir(ARTICLES_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const articles = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const raw = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf8');
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
    );
    
    const valid = articles.filter(Boolean);
    
    if (status === 'all') return valid;
    if (status === 'queued') return valid.filter(a => a.status === 'queued');
    // Default: published only
    return valid.filter(a => !a.status || a.status === 'published');
  } catch {
    return [];
  }
}

/**
 * Load a single article by slug (only if published)
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function loadArticle(slug) {
  try {
    const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const article = JSON.parse(raw);
    // Never serve queued articles
    if (article.status === 'queued') return null;
    return article;
  } catch {
    return null;
  }
}

/**
 * Save an article to disk
 * @param {Object} article - Full article object
 */
export async function saveArticle(article) {
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  const filePath = path.join(ARTICLES_DIR, `${article.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(article, null, 2));
}

/**
 * Publish the oldest queued article (by queued_at)
 * Sets status='published' and published_at=now
 * @returns {Promise<Object|null>} The published article, or null if queue empty
 */
export async function publishNextQueued() {
  const queued = await loadArticles('queued');
  if (queued.length === 0) return null;
  
  // Sort by queued_at ascending — publish oldest first
  queued.sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
  const article = queued[0];
  
  article.status = 'published';
  article.published_at = new Date().toISOString();
  
  await saveArticle(article);
  console.log(`[article-store] Published: ${article.slug}`);
  return article;
}

/**
 * Count articles by status
 * @returns {Promise<{published: number, queued: number, total: number}>}
 */
export async function countArticles() {
  const all = await loadArticles('all');
  const published = all.filter(a => !a.status || a.status === 'published').length;
  const queued = all.filter(a => a.status === 'queued').length;
  return { published, queued, total: all.length };
}

/**
 * Check if a slug already exists (any status)
 * @param {string} slug
 * @returns {Promise<boolean>}
 */
export async function slugExists(slug) {
  try {
    await fs.access(path.join(ARTICLES_DIR, `${slug}.json`));
    return true;
  } catch {
    return false;
  }
}
