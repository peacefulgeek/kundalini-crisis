import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  try {
    const baseUrl = 'https://kundalinicrisis.com';
    const now = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/articles', priority: '0.9', changefreq: 'daily' },
      { url: '/assessment', priority: '0.8', changefreq: 'monthly' },
      { url: '/quiz', priority: '0.8', changefreq: 'monthly' },
      { url: '/tools', priority: '0.7', changefreq: 'monthly' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' },
    ];

    let articlePages: { slug: string; published_at: string }[] = [];

    // Try DB first
    if (process.env.DATABASE_URL) {
      try {
        const { getDb } = await import('../../src/lib/db.mjs');
        const db = await getDb();
        const { rows } = await db.query(
          `SELECT slug, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
        );
        articlePages = rows;
      } catch { /* fall through */ }
    }

    // Fallback to JSON files
    if (articlePages.length === 0) {
      const articlesDir = path.join(process.cwd(), 'src', 'data', 'articles');
      if (fs.existsSync(articlesDir)) {
        const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
        articlePages = files.map(f => {
          try {
            const content = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
            const data = JSON.parse(content);
            // CRITICAL: Only published articles in sitemap
            if (data.status === 'queued') return null;
            return { slug: data.slug, published_at: data.published_at };
          } catch {
            return null;
          }
        }).filter(Boolean) as any[];
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${articlePages.map(a => `  <url>
    <loc>${baseUrl}/articles/${a.slug}</loc>
    <lastmod>${a.published_at ? a.published_at.split('T')[0] : now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap]', err);
    res.status(500).send('Sitemap generation failed');
  }
});
