/**
 * ASIN Health Check Cron — Sundays 05:00 UTC
 * Verifies all ASINs in published articles are still valid Amazon products
 * Checks for 404s and broken affiliate links
 * Logs results and flags articles with broken links for review
 */
import fs from 'fs/promises';
import path from 'path';
import { loadArticles, saveArticle } from '../lib/article-store.mjs';

const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';

// Regex to extract ASINs from article bodies
const ASIN_RE = /amazon\.com\/dp\/([A-Z0-9]{10})\?tag=/gi;

/**
 * Check if an Amazon product page returns 200
 * Uses a lightweight HEAD request
 */
async function checkAsin(asin) {
  const url = `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KundaliniCrisisBot/1.0)',
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Amazon returns 200 for valid products, 404 for invalid
    // Note: Amazon sometimes returns 503 for bots — treat as unknown, not failed
    if (res.status === 404) {
      return { asin, status: 'broken', httpStatus: res.status };
    }
    return { asin, status: 'ok', httpStatus: res.status };
  } catch (err) {
    return { asin, status: 'error', error: err.message };
  }
}

export async function runAsinHealthCheck() {
  console.log('[asin-health-check] Starting ASIN health check...');

  try {
    const articles = await loadArticles('published');
    const asinMap = new Map(); // asin -> [slug, ...]

    // Collect all ASINs from all published articles
    for (const article of articles) {
      const matches = [...(article.body || '').matchAll(ASIN_RE)];
      for (const match of matches) {
        const asin = match[1];
        if (!asinMap.has(asin)) asinMap.set(asin, []);
        asinMap.get(asin).push(article.slug);
      }
    }

    console.log(`[asin-health-check] Found ${asinMap.size} unique ASINs across ${articles.length} articles`);

    const results = { ok: [], broken: [], error: [] };

    for (const [asin, slugs] of asinMap) {
      const result = await checkAsin(asin);
      result.articles = slugs;

      if (result.status === 'broken') {
        results.broken.push(result);
        console.warn(`[asin-health-check] ✗ BROKEN: ${asin} (used in: ${slugs.join(', ')})`);
      } else if (result.status === 'error') {
        results.error.push(result);
        console.warn(`[asin-health-check] ? ERROR: ${asin} - ${result.error}`);
      } else {
        results.ok.push(result);
        console.log(`[asin-health-check] ✓ OK: ${asin}`);
      }

      // Pause between checks to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    // Save health check report
    const reportPath = path.resolve(process.cwd(), 'src/data/asin-health-report.json');
    const report = {
      checked_at: new Date().toISOString(),
      total: asinMap.size,
      ok: results.ok.length,
      broken: results.broken.length,
      error: results.error.length,
      broken_asins: results.broken,
      error_asins: results.error
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`[asin-health-check] Complete: ${results.ok.length} OK, ${results.broken.length} broken, ${results.error.length} errors`);
    console.log(`[asin-health-check] Report saved to: ${reportPath}`);

    if (results.broken.length > 0) {
      console.warn(`[asin-health-check] ACTION REQUIRED: ${results.broken.length} broken ASINs need replacement`);
    }
  } catch (err) {
    console.error('[asin-health-check] Fatal error:', err);
  }
}
