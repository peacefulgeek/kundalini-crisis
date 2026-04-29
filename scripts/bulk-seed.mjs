/**
 * Bulk Seed Script — DeepSeek V4-Pro
 * Generates 500 articles and inserts them with status='queued'
 */
import { generateArticle } from '../src/lib/deepseek-generate.mjs';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { saveArticle, slugExists } from '../src/lib/article-store.mjs';
import { matchProducts } from '../src/lib/match-products.mjs';
import fs from 'fs/promises';
import path from 'path';

// Generate 500 unique topics programmatically for the seed
function generateTopics() {
  const topics = [];
  const symptoms = ['Tremors', 'Heat', 'Insomnia', 'Depersonalization', 'Energy Surges', 'Heart Palpitations', 'Visions', 'Auditory Hallucinations', 'Spontaneous Movements', 'Loss of Appetite'];
  const triggers = ['Meditation', 'Breathwork', 'Ayahuasca', 'Psilocybin', 'Trauma', 'Yoga', 'Grief', 'Near-Death Experience', 'Childbirth', 'Fasting'];
  const aspects = ['Nervous System', 'Relationships', 'Career', 'Identity', 'Ego Death', 'Grounding', 'Integration', 'Therapy', 'Psychiatry', 'Somatic Experiencing'];
  
  // Mix and match to get 500
  for (let i = 0; i < 500; i++) {
    const sym = symptoms[i % symptoms.length];
    const trig = triggers[Math.floor(i / symptoms.length) % triggers.length];
    const asp = aspects[Math.floor(i / (symptoms.length * triggers.length)) % aspects.length];
    
    topics.push({
      title: \`Navigating \${sym} After \${trig}: A Guide to \${asp}\`,
      slug: \`navigating-\${sym.toLowerCase().replace(/ /g, '-')}-after-\${trig.toLowerCase().replace(/ /g, '-')}-guide-to-\${asp.toLowerCase().replace(/ /g, '-')}-\${i}\`,
      category: 'Spiritual Emergency',
      tags: [sym, trig, asp]
    });
  }
  return topics;
}

const MAX_ATTEMPTS = 4;

async function run() {
  console.log('[bulk-seed] Starting 500-article seed generation via DeepSeek V4-Pro');
  
  // Load ASIN catalog
  const cachePath = path.resolve('src/data/verified-asins.json');
  const cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
  const catalog = Object.entries(cache.asins).map(([asin, e]) => ({
    asin, name: e.title, category: e.category || '', tags: e.tags || []
  }));

  const topics = generateTopics();
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    
    if (await slugExists(t.slug)) {
      console.log(\`[\${i+1}/500] SKIP: \${t.slug} already exists\`);
      skipped++;
      continue;
    }

    console.log(\`\\n[\${i+1}/500] GENERATING: \${t.title}\`);
    
    const products = matchProducts({
      articleTitle: t.title,
      articleTags: t.tags,
      articleCategory: t.category,
      catalog,
      minLinks: 3,
      maxLinks: 4
    });

    let passedGate = false;
    let finalBody = '';
    let finalExcerpt = '';
    let gateResult = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(\`  Attempt \${attempt}/\${MAX_ATTEMPTS}...\`);
        const result = await generateArticle({
          title: t.title,
          category: t.category,
          tags: t.tags,
          products
        });
        
        gateResult = runQualityGate(result.body);
        
        if (gateResult.passed) {
          passedGate = true;
          finalBody = gateResult.body; // use the body with auto-replaced em-dashes
          finalExcerpt = result.excerpt;
          console.log(\`  ✓ Passed Quality Gate (\${gateResult.wordCount} words, \${gateResult.amazonLinks} links)\`);
          break;
        } else {
          console.log(\`  ✗ Failed Gate: \${gateResult.failures.join(', ')}\`);
        }
      } catch (err) {
        console.log(\`  ✗ Error: \${err.message}\`);
      }
    }

    if (passedGate) {
      // Save as QUEUED
      const article = {
        title: t.title,
        slug: t.slug,
        meta_description: finalExcerpt.slice(0, 155),
        category: t.category,
        tags: t.tags,
        body: finalBody,
        author: 'Kalesh',
        status: 'queued',
        queued_at: new Date().toISOString(),
        published_at: null, // Will be set by cron when published
        reading_time: Math.ceil(gateResult.wordCount / 200),
        word_count: gateResult.wordCount,
        image_url: null, // Will be assigned by cron when published
        image_alt: t.title
      };
      
      await saveArticle(article);
      console.log(\`  ✓ Saved to queue: \${t.slug}\`);
      success++;
    } else {
      console.log(\`  ✗ ABANDONED after \${MAX_ATTEMPTS} attempts\`);
      failed++;
    }
    
    // Rate limit pause
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(\`\\n[bulk-seed] COMPLETE\`);
  console.log(\`Success: \${success} | Failed: \${failed} | Skipped: \${skipped}\`);
}

run().catch(console.error);
