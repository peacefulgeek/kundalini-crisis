/**
 * Generate a single article and save it.
 * Called with: node generate-single-article.mjs "TITLE|||SLUG|||tag1,tag2,tag3"
 *
 * Requirements:
 * - 1800-2200 words (hard minimum 1800)
 * - Passes Paul Voice Gate v2
 * - Status: queued (never published by this script)
 * - Hero image assigned from Bunny CDN library
 * - Amazon affiliate links: exactly 3-4
 */
import { runQualityGate, countWords } from '../src/lib/article-quality-gate.mjs';
import { saveArticle, slugExists, loadArticle } from '../src/lib/article-store.mjs';
import { matchProducts } from '../src/lib/match-products.mjs';
import { assignHeroImage } from '../src/lib/bunny-images.mjs';
import { default as CATALOG } from '../src/data/product-catalog.js';
import OpenAI from 'openai';

const input = process.argv[2] || '';
const [title, slug, tagsStr] = input.split('|||');
const tags = (tagsStr || '').split(',').map(t => t.trim()).filter(Boolean);

if (!title || !slug) {
  console.error('Usage: node generate-single-article.mjs "TITLE|||SLUG|||tag1,tag2"');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gemini-2.5-flash';
const AMAZON_TAG = 'spankyspinola-20';
const MAX_ATTEMPTS = 5;

const SYSTEM_PROMPT = `You are Kalesh - a consciousness teacher who survived kundalini crisis. You write like you're talking to someone terrified and alone at 3am. Raw, direct, no bullshit. You've been through it yourself.

VOICE RULES (non-negotiable):
- Always use "you" directly. Never "one" or "people" as a substitute for "you".
- Use contractions constantly: don't, can't, it's, you're, I've, they're, won't, I'm, that's, here's, what's
- Be compassionate but blunt - no sugarcoating, no toxic positivity
- Include at least 3 of these naturally in the text: "Right?", "Know what I mean?", "Does that land?", "Look,", "Here's the thing:", "So yeah,", "honestly,", "truth is,", "But here's", "you know"
- Write like a real person talking, not a textbook or blog post
- Mix short punchy sentences with longer explanatory ones (vary sentence length dramatically)
- Use "I" to share personal perspective: "I've seen this...", "I'll tell you what..."

STRUCTURE (HTML only - no markdown):
- Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags only
- NO markdown at all - no #, **, *, -, etc.
- Write 1800 to 2000 words of actual content (this is a hard requirement - do NOT exceed 2000 words)
- Include 4-6 sections with <h2> headings
- Include at least 2 subsections with <h3> headings
- End with: <p><em>This is not a substitute for professional mental health care. If you're in crisis, please reach out to a qualified therapist or call 988.</em></p>

CRITICAL - DO NOT USE THESE WORDS AT ALL (article fails gate if they appear):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, game-changer, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore, essentially, fundamentally, inherently, arguably, crucially, importantly, revolutionary, unparalleled, unprecedented, remarkable, extraordinary, exceptional, streamline, optimize, facilitate, amplify, catalyze, propel, spearhead, orchestrate, traverse, moreover, additionally, consequently, subsequently, thereby, thusly, wherein, whereby, notably, intrinsically, substantively

DO NOT USE: framework, profound, fundamentally, essentially, holistic, transformative, nuanced, multifaceted, furthermore, moreover, additionally, consequently, subsequently, thereby, navigate, leverage, empower, unlock, beacon, foster, elevate, resonate, harness, intricate, plethora, myriad, paradigm, synergy, tapestry, landscape, stakeholders, ecosystem, comprehensive, robust, seamlessly, pivotal, embark, underscore, paramount, bespoke, curate, curated, groundbreaking, innovative, cutting-edge, game-changer, revolutionary, unparalleled, unprecedented, remarkable, extraordinary, exceptional, streamline, optimize, facilitate, amplify, catalyze, propel, spearhead, orchestrate, traverse, thusly, wherein, whereby, notably, intrinsically, substantively, arguably, crucially, importantly, inherently, utilize, delve

CRITICAL - DO NOT USE THESE PHRASES:
"it's important to note", "it's worth noting", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep", "at the end of the day", "plays a crucial role", "dive into", "delve into", "when it comes to", "a testament to", "first and foremost", "last but not least", "it's worth mentioning", "it's crucial to", "it is essential to", "to summarize,", "in today's fast-paced world", "in today's digital age", "in today's modern world", "in this digital age", "navigate the complexities", "speaks volumes", "plays a vital role", "plays a significant role", "plays a pivotal role", "a wide array of", "a wide range of", "a plethora of", "a myriad of", "has emerged as", "continues to evolve", "has revolutionized", "cannot be overstated", "it goes without saying", "needless to say"

REPLACE ALL em-dashes (— or –) with space-hyphen-space ( - )

AMAZON LINKS: You MUST include ALL provided Amazon links in the article body. Embed them naturally in context. Use the exact HTML provided. Do not skip any.

WORD COUNT: You MUST write at least 1800 words. Count carefully. If you're not sure you've hit 1800, keep writing. This is the most important requirement.`;

async function run() {
  // Check if already has real content (1800+ words)
  if (await slugExists(slug)) {
    const art = await loadArticle(slug);
    if (art && art.word_count >= 1800) {
      console.log(`SKIP:${slug}:already-has-content:${art.word_count}`);
      process.exit(0);
    }
  }

  const products = matchProducts({
    articleTitle: title,
    articleTags: tags,
    articleCategory: 'Spiritual Emergency',
    catalog: CATALOG,
    minLinks: 3,
    maxLinks: 4
  });

  const productLines = products.map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  let passedGate = false;
  let finalBody = '';
  let finalExcerpt = '';
  let lastFailures = [];
  let lastWordCount = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const wordTarget = attempt <= 2 ? '1800 to 2000' : '1850 to 2000';
      const resp = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Write a full article titled: "${title}"
Tags: ${tags.join(', ')}

Embed ALL of these Amazon affiliate links naturally in the article body (use exact HTML):
${productLines}

CRITICAL: Write exactly ${wordTarget} words. Count as you write. This is a hard requirement.
Write the full article now. HTML only. No markdown. Start directly with the first <p> or <h2> tag.`
          }
        ],
        max_tokens: 6000,
        temperature: attempt <= 2 ? 0.7 : 0.8
      });

      const raw = resp.choices[0].message.content.trim();
      let body = raw.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

      // Pre-gate sanitizer: auto-replace commonly slipped banned words with acceptable synonyms
      // This mirrors the em-dash auto-replacement in the gate
      const WORD_REPLACEMENTS = [
        [/\bprofound\b/gi, 'deep'],
        [/\bprofoundly\b/gi, 'deeply'],
        [/\bframework\b/gi, 'approach'],
        [/\bfundamentally\b/gi, 'at its core'],
        [/\bessentially\b/gi, 'basically'],
        [/\bholistic\b/gi, 'whole-person'],
        [/\btransformative\b/gi, 'life-changing'],
        [/\bnuanced\b/gi, 'complex'],
        [/\bmultifaceted\b/gi, 'complex'],
        [/\bfurthermore\b/gi, 'and'],
        [/\bmoreover\b/gi, 'also'],
        [/\badditionally\b/gi, 'also'],
        [/\bconsequently\b/gi, 'so'],
        [/\bsubsequently\b/gi, 'then'],
        [/\bthereby\b/gi, 'so'],
        [/\bnotably\b/gi, 'worth noting'],
        [/\binherently\b/gi, 'by nature'],
        [/\bintrinsically\b/gi, 'by nature'],
        [/\bsubstantively\b/gi, 'meaningfully'],
        [/\barguably\b/gi, 'probably'],
        [/\bcrucially\b/gi, 'critically'],
        [/\bimportantly\b/gi, 'critically'],
        [/\bparamount\b/gi, 'critical'],
        [/\bpivotal\b/gi, 'key'],
        [/\brobust\b/gi, 'strong'],
        [/\bseamlessly\b/gi, 'smoothly'],
        [/\bcomprehensive\b/gi, 'thorough'],
        [/\bgroundbreaking\b/gi, 'new'],
        [/\binnovative\b/gi, 'new'],
        [/\bunprecedented\b/gi, 'new'],
        [/\bunparalleled\b/gi, 'unique'],
        [/\bremarkable\b/gi, 'notable'],
        [/\bextraordinary\b/gi, 'unusual'],
        [/\bexceptional\b/gi, 'unusual'],
        [/\btraverse\b/gi, 'move through'],
        [/\bthusly\b/gi, 'so'],
        [/\bwherein\b/gi, 'where'],
        [/\bwhereby\b/gi, 'where'],
        [/\bdelve\b/gi, 'dig'],
        [/\butilize\b/gi, 'use'],
        [/\bleverage\b/gi, 'use'],
        [/\bempowers?\b/gi, 'helps'],
        [/\bunlock\b/gi, 'open up'],
        [/\bbeacon\b/gi, 'guide'],
        [/\bfoster\b/gi, 'build'],
        [/\belevate\b/gi, 'improve'],
        [/\bresonate\b/gi, 'connect'],
        [/\bharness\b/gi, 'use'],
        [/\bparadigm\b/gi, 'model'],
        [/\bsynergy\b/gi, 'combination'],
        [/\btapestry\b/gi, 'mix'],
        [/\blandscape\b/gi, 'world'],
        [/\becosystem\b/gi, 'world'],
        [/\bstakeholders\b/gi, 'people involved'],
        [/\bnavigate\b/gi, 'deal with'],
        [/\bamplify\b/gi, 'increase'],
        [/\bcatalyze\b/gi, 'trigger'],
        [/\bpropel\b/gi, 'push'],
        [/\bspearhead\b/gi, 'lead'],
        [/\borchestr\w+\b/gi, 'manage'],
        [/\boptimize\b/gi, 'improve'],
        [/\bstreamline\b/gi, 'simplify'],
        [/\bfacilitate\b/gi, 'help'],
        [/\bplethora\b/gi, 'many'],
        [/\bmyriad\b/gi, 'many'],
        [/\bintricate\b/gi, 'complex'],
        [/\bbespoke\b/gi, 'custom'],
        [/\bcurated?\b/gi, 'selected'],
        [/\bembark\b/gi, 'start'],
        [/\bunderscore\b/gi, 'highlight'],
        [/\bprofound insight/gi, 'deep insight'],
      ];
      for (const [pattern, replacement] of WORD_REPLACEMENTS) {
        body = body.replace(pattern, replacement);
      }

      const wc = countWords(body);
      lastWordCount = wc;

      // Hard minimum: 1800 words before even running gate
      if (wc < 1800) {
        lastFailures = [`word-count-too-low:${wc}(need-1800)`];
        continue;
      }
      if (wc > 2500) {
        // Too long - gate will catch it but let's note it
        console.warn(`[gen] Attempt ${attempt}: ${wc} words (too high, gate will flag)`);
      }

      const gateResult = runQualityGate(body);

      if (gateResult.passed) {
        passedGate = true;
        finalBody = gateResult.body;
        const match = body.match(/<p[^>]*>(.*?)<\/p>/s);
        finalExcerpt = match
          ? match[1].replace(/<[^>]+>/g, '').slice(0, 155).trim()
          : title.slice(0, 155);
        lastWordCount = gateResult.wordCount;
        break;
      } else {
        lastFailures = gateResult.failures;
      }
    } catch (err) {
      lastFailures = [`error:${err.message}`];
    }
  }

  if (passedGate) {
    // Assign hero image from Bunny CDN library
    let imageUrl = '';
    try {
      imageUrl = await assignHeroImage(slug);
    } catch (err) {
      console.warn(`[image] assignHeroImage failed for ${slug}: ${err.message}`);
      // Fallback: pick a library image directly
      const num = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
      imageUrl = `https://kundalini-crisis.b-cdn.net/library/lib-${num}.webp`;
    }

    const article = {
      title,
      slug,
      meta_description: finalExcerpt,
      category: 'Spiritual Emergency',
      tags,
      body: finalBody,
      author: 'Kalesh',
      status: 'queued',
      queued_at: new Date().toISOString(),
      published_at: null,
      reading_time: Math.ceil(lastWordCount / 200),
      word_count: lastWordCount,
      image_url: imageUrl,
      image_alt: title
    };

    await saveArticle(article);
    console.log(`OK:${slug}:${lastWordCount}`);
  } else {
    console.log(`FAIL:${slug}:${lastFailures.join('|')}`);
  }
}

run().catch(err => {
  console.log(`ERROR:${slug}:${err.message}`);
  process.exit(1);
});
