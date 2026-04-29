/**
 * Monthly Refresh Cron — 1st of month 03:00 UTC
 * Refreshes the oldest 3 published articles to keep them current
 * Uses DeepSeek V4-Pro to rewrite the body with updated info
 */
import OpenAI from 'openai';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { loadArticles, saveArticle } from '../lib/article-store.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';
const MAX_ATTEMPTS = 3;

export async function runMonthlyRefresh() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-monthly] AUTO_GEN_ENABLED is not true, skipping');
    return;
  }

  console.log('[refresh-monthly] Starting monthly refresh...');

  try {
    // Get oldest 3 published articles
    const articles = await loadArticles('published');
    articles.sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
    const toRefresh = articles.slice(0, 3);

    if (toRefresh.length === 0) {
      console.log('[refresh-monthly] No articles to refresh');
      return;
    }

    for (const article of toRefresh) {
      console.log(`[refresh-monthly] Refreshing: ${article.slug}`);

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
              {
                role: 'system',
                content: `You are Kalesh — a consciousness teacher. Rewrite this article to be more current, more direct, and more useful. Keep the same title and all Amazon affiliate links exactly as they are. Same voice rules: direct address ("you"), contractions everywhere, 2-3 dialogue markers (Right?!, Know what I mean?, Does that land?). 1,200-2,500 words. HTML only. No em-dashes (use " - " instead). No banned words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.`
              },
              {
                role: 'user',
                content: `Refresh this article titled "${article.title}". Keep all Amazon affiliate links exactly as they are. Return ONLY the updated HTML body.\n\nOriginal body:\n${article.body}`
              }
            ],
            temperature: 0.72
          });

          const rawBody = response.choices[0].message.content.trim();
          const gateResult = runQualityGate(rawBody);

          if (gateResult.passed) {
            article.body = gateResult.body;
            article.word_count = gateResult.wordCount;
            article.reading_time = Math.ceil(gateResult.wordCount / 200);
            // Update published_at to signal freshness to Google
            article.published_at = new Date().toISOString();

            await saveArticle(article);
            console.log(`[refresh-monthly] ✓ Refreshed: ${article.slug}`);
            break;
          } else {
            console.log(`[refresh-monthly] ✗ Gate failed attempt ${attempt}: ${gateResult.failures.join(', ')}`);
          }
        } catch (err) {
          console.error(`[refresh-monthly] Error attempt ${attempt}: ${err.message}`);
        }
      }
    }

    console.log('[refresh-monthly] Monthly refresh complete');
  } catch (err) {
    console.error('[refresh-monthly] Fatal error:', err);
  }
}

// Legacy export alias
export { runMonthlyRefresh as refreshMonthly };
