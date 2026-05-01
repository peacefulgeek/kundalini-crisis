/**
 * Bulk Seed Stubs — Quickly queues 500 articles.
 * The cron will regenerate them properly using DeepSeek V4-Pro on DigitalOcean.
 */
import { saveArticle, slugExists } from '../src/lib/article-store.mjs';
import fs from 'fs/promises';
import path from 'path';

// Load the TOPICS array from the original script
const content = await fs.readFile('scripts/bulk-seed.mjs', 'utf8');
const topicsMatch = content.match(/const TOPICS = \[([\s\S]*?)\];/);
const TOPICS = eval('[' + topicsMatch[1] + ']');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function run() {
  console.log(`[bulk-seed-stubs] Queuing ${TOPICS.length} articles for cron to process later...`);
  
  let queued = 0;
  let skipped = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    const slug = slugify(t.title);

    if (await slugExists(slug)) {
      skipped++;
      continue;
    }

    const article = {
      title: t.title,
      slug,
      meta_description: t.title + ' - A comprehensive guide to navigating this aspect of spiritual emergency.',
      category: 'Spiritual Emergency',
      tags: t.tags,
      body: '<p>This article is currently queued for generation by the DeepSeek V4-Pro writing engine.</p>',
      author: 'Kalesh',
      status: 'queued',
      queued_at: new Date(Date.now() - i * 1000).toISOString(), // Stagger queue times
      published_at: null,
      reading_time: 1,
      word_count: 15,
      image_url: null,
      image_alt: t.title
    };

    await saveArticle(article);
    queued++;
    if (queued % 50 === 0) console.log(`  Queued ${queued}...`);
  }

  console.log(`[bulk-seed-stubs] COMPLETE. Queued: ${queued}, Skipped: ${skipped}`);
}

run().catch(console.error);
