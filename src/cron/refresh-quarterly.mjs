/**
 * Quarterly Refresh Cron — 1st of Jan/Apr/Jul/Oct 04:00 UTC
 * Deep refresh of the oldest 10 published articles
 * Full rewrite via DeepSeek V4-Pro with updated research and voice
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

export async function runQuarterlyRefresh() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-quarterly] AUTO_GEN_ENABLED is not true, skipping');
    return;
  }

  console.log('[refresh-quarterly] Starting quarterly deep refresh...');

  try {
    // Get oldest 10 published articles for quarterly deep refresh
    const articles = await loadArticles('published');
    articles.sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
    const toRefresh = articles.slice(0, 10);

    if (toRefresh.length === 0) {
      console.log('[refresh-quarterly] No articles to refresh');
      return;
    }

    console.log(`[refresh-quarterly] Refreshing ${toRefresh.length} articles...`);

    for (const article of toRefresh) {
      console.log(`[refresh-quarterly] Deep refreshing: ${article.slug}`);

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
              {
                role: 'system',
                content: `You are Kalesh — a consciousness teacher. Do a full deep rewrite of this article. Make it significantly better: more specific, more honest, more useful to someone in the middle of a spiritual emergency. Keep all Amazon affiliate links exactly as they are. Voice: direct address ("you"), contractions everywhere, 2-3 dialogue markers (Right?!, Know what I mean?, Does that land?). 1,200-2,500 words. HTML only. No em-dashes. No banned words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore.`
              },
              {
                role: 'user',
                content: `Do a full deep rewrite of this article titled "${article.title}". Keep all Amazon affiliate links exactly as they are. Return ONLY the updated HTML body.\n\nOriginal body:\n${article.body}`
              }
            ],
            temperature: 0.75
          });

          const rawBody = response.choices[0].message.content.trim();
          const gateResult = runQualityGate(rawBody);

          if (gateResult.passed) {
            article.body = gateResult.body;
            article.word_count = gateResult.wordCount;
            article.reading_time = Math.ceil(gateResult.wordCount / 200);
            article.published_at = new Date().toISOString();

            await saveArticle(article);
            console.log(`[refresh-quarterly] ✓ Deep refreshed: ${article.slug}`);
            break;
          } else {
            console.log(`[refresh-quarterly] ✗ Gate failed attempt ${attempt}: ${gateResult.failures.join(', ')}`);
          }
        } catch (err) {
          console.error(`[refresh-quarterly] Error attempt ${attempt}: ${err.message}`);
        }
      }

      // Small pause between articles to avoid rate limiting
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log('[refresh-quarterly] Quarterly deep refresh complete');
  } catch (err) {
    console.error('[refresh-quarterly] Fatal error:', err);
  }
}

// Legacy export alias
export { runQuarterlyRefresh as refreshQuarterly };
