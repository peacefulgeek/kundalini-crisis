import express from 'express';
import fs from 'fs';
import path from 'path';

export const articlesRouter = express.Router();

// Use process.cwd() for reliable path resolution in both dev and production
function getArticlesDir(): string {
  return path.join(process.cwd(), 'src', 'data', 'articles');
}

// Load articles from JSON files (used when DATABASE_URL is not set)
function loadArticlesFromFiles(): any[] {
  const articlesDir = getArticlesDir();
  if (!fs.existsSync(articlesDir)) {
    console.warn('[articles] Articles dir not found:', articlesDir);
    return [];
  }
  
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
  const articles = files.map(f => {
    try {
      const content = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  // Sort by published_at descending
  articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  return articles;
}

async function getArticlesFromDb(limit: number, offset: number, category?: string) {
  try {
    const { getDb } = await import('../../src/lib/db.mjs');
    const db = await getDb();
    
    let query = 'SELECT id, slug, title, meta_description, category, tags, image_url, image_alt, reading_time, author, published_at, word_count FROM articles WHERE published = true';
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    const countResult = await db.query(
      'SELECT COUNT(*) FROM articles WHERE published = true' + (category ? ' AND category = $1' : ''),
      category ? [category] : []
    );
    
    return { articles: rows, total: parseInt(countResult.rows[0].count) };
  } catch {
    return null;
  }
}

articlesRouter.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;

    // Try DB first
    if (process.env.DATABASE_URL) {
      const dbResult = await getArticlesFromDb(limit, offset, category);
      if (dbResult) {
        return res.json(dbResult);
      }
    }

    // Fallback to JSON files
    let articles = loadArticlesFromFiles();
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    const total = articles.length;
    const paged = articles.slice(offset, offset + limit).map(a => ({
      id: a.slug,
      slug: a.slug,
      title: a.title,
      meta_description: a.meta_description,
      category: a.category,
      tags: a.tags,
      image_url: a.image_url,
      image_alt: a.image_alt,
      reading_time: a.reading_time,
      author: a.author,
      published_at: a.published_at,
      word_count: a.word_count
    }));
    
    res.json({ articles: paged, total });
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

articlesRouter.get('/:slug', async (req, res) => {
  try {
    // Try DB first
    if (process.env.DATABASE_URL) {
      try {
        const { getDb } = await import('../../src/lib/db.mjs');
        const db = await getDb();
        const { rows } = await db.query(
          'SELECT * FROM articles WHERE slug = $1 AND published = true',
          [req.params.slug]
        );
        if (rows.length > 0) return res.json(rows[0]);
      } catch { /* fall through to JSON */ }
    }

    // Fallback to JSON files
    const articlesDir = getArticlesDir();
    const filePath = path.join(articlesDir, `${req.params.slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const article = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(article);
  } catch (err) {
    console.error('[article route]', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});
