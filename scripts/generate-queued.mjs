/**
 * Generate real article content for all queued stubs.
 * Uses gemini-2.5-flash. On DigitalOcean, cron will use DeepSeek V4-Pro.
 * Overwrites stub body with real content if it passes the gate.
 */
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { saveArticle, loadArticle } from '../src/lib/article-store.mjs';
import { matchProducts } from '../src/lib/match-products.mjs';
import { assignHeroImage } from '../src/lib/bunny-images.mjs';
import { default as CATALOG } from '../src/data/product-catalog.js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = 'gemini-2.5-flash';
const AMAZON_TAG = 'spankyspinola-20';
const MAX_ATTEMPTS = 5;

const SYSTEM_PROMPT = `You are Kalesh - a consciousness teacher who survived kundalini crisis. You write like you're talking to someone terrified and alone at 3am. Raw, direct, no bullshit.

VOICE RULES:
- Always use "you" directly. Never "one" or "people".
- Use contractions constantly: don't, can't, it's, you're, I've, they're, won't
- Be compassionate but blunt - no sugarcoating
- Include at least 2 of these naturally: "Right?", "Know what I mean?", "Does that land?", "Look,", "Here's the thing:", "So yeah,"
- Write like a real person, not a textbook

STRUCTURE:
- 1,300 to 2,000 words of actual content
- HTML only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- No markdown at all
- Include near the end: <p><em>This is not a substitute for professional mental health care. If you're in crisis, please reach out to a qualified therapist or call 988.</em></p>

CRITICAL - DO NOT USE THESE WORDS (your output fails if they appear):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, game-changer, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore, essentially, fundamentally, inherently, arguably, crucially, importantly, revolutionary, unparalleled, unprecedented, remarkable, extraordinary, exceptional, streamline, optimize, facilitate, amplify, catalyze, propel, spearhead, orchestrate, traverse, moreover, additionally, consequently, subsequently, thereby

CRITICAL - DO NOT USE THESE PHRASES:
"it's important to note", "it's worth noting", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep", "at the end of the day", "plays a crucial role", "dive into", "delve into", "when it comes to", "a testament to", "first and foremost", "last but not least"

REPLACE ALL em-dashes (— or –) with space-hyphen-space ( - )

AMAZON LINKS: You MUST include ALL provided Amazon links in the body. Use the exact HTML. Do not skip any.`;

async function generateBody(title, tags, products) {
  const productLines = products.map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  const userPrompt = `Write a full article titled: "${title}"
Tags: ${tags.join(', ')}

Embed ALL of these Amazon affiliate links naturally in the article body (use exact HTML):
${productLines}

Write the full article now. HTML only. No markdown. 1,300-2,000 words.`;

  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 4000,
    temperature: 0.7
  });

  return resp.choices[0].message.content.trim();
}

async function run() {
  // Find all queued stubs (body is short placeholder)
  const dir = path.resolve('src/data/articles');
  const files = await fs.readdir(dir);
  
  const stubs = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    const article = JSON.parse(raw);
    if (article.status === 'queued' && article.word_count < 100) {
      stubs.push(article);
    }
  }

  console.log(`[generate-queued] Found ${stubs.length} stubs to generate`);
  
  let success = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < stubs.length; i++) {
    const article = stubs[i];
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const rate = success > 0 ? elapsed / success : 0;
    const eta = rate > 0 ? Math.floor(rate * (stubs.length - i)) : '?';
    
    process.stdout.write(`\r[${i+1}/${stubs.length}] ${success} done, ETA ~${eta}s: ${article.title.slice(0, 50)}...`);

    const products = matchProducts({
      articleTitle: article.title,
      articleTags: article.tags,
      articleCategory: article.category,
      catalog: CATALOG,
      minLinks: 3,
      maxLinks: 4
    });

    let passedGate = false;
    let finalBody = '';
    let finalExcerpt = '';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const raw = await generateBody(article.title, article.tags, products);
        
        // Strip markdown code fences if present
        const body = raw.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
        
        const gateResult = runQualityGate(body);
        
        if (gateResult.passed) {
          passedGate = true;
          finalBody = gateResult.body;
          // Extract first paragraph as excerpt
          const match = body.match(/<p[^>]*>(.*?)<\/p>/s);
          finalExcerpt = match ? match[1].replace(/<[^>]+>/g, '').slice(0, 155) : article.title;
          break;
        }
      } catch (err) {
        // continue
      }
    }

    if (passedGate) {
      const heroImage = assignHeroImage(article.slug, article.tags);
      const updated = {
        ...article,
        body: finalBody,
        meta_description: finalExcerpt,
        reading_time: Math.ceil(finalBody.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200),
        word_count: finalBody.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w).length,
        image_url: heroImage,
        image_alt: article.title
      };
      await saveArticle(updated);
      success++;
    } else {
      failed++;
    }

    // Rate limit pause
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n[generate-queued] COMPLETE`);
  console.log(`Success: ${success} | Failed: ${failed}`);
  console.log(`Total queued articles with real content: ${success}`);
}

run().catch(console.error);
