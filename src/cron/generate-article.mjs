/**
 * Article Publisher Cron — DeepSeek V4-Pro
 *
 * Phase 1 (published < 60): 5x/day every day (07:00, 10:00, 13:00, 16:00, 19:00 UTC)
 * Phase 2 (published >= 60): 1x/weekday Mon-Fri (08:00 UTC)
 *
 * Logic:
 * 1. Check queue — if articles queued, publish oldest one
 * 2. If queue empty, generate a new article via DeepSeek V4-Pro
 * 3. Assign hero image via assignHeroImage()
 * 4. Set status='published', published_at=now
 */
import OpenAI from 'openai';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { saveArticle, publishNextQueued, countArticles, slugExists } from '../lib/article-store.mjs';
import { assignHeroImage } from '../lib/bunny-images.mjs';
import { matchProducts } from '../lib/match-products.mjs';
import fs from 'fs/promises';
import path from 'path';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';
const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';
const MAX_ATTEMPTS = 4;

// On-demand topic pool for when queue is empty
const TOPIC_POOL = [
  { title: "What Happens to Your Body When Kundalini Rises: The Physical Reality Nobody Talks About", category: "Kundalini Rising", tags: ["physical symptoms", "kundalini", "body"] },
  { title: "Grounding After Spiritual Emergency: 7 Practices That Actually Work", category: "Grounding", tags: ["grounding", "spiritual emergency", "practices"] },
  { title: "The Difference Between Spiritual Emergency and Psychosis: A Clinical Perspective", category: "Spiritual Emergency", tags: ["psychosis", "spiritual emergency", "mental health"] },
  { title: "Why Your Therapist Doesn't Understand What You're Going Through", category: "Therapy", tags: ["therapy", "spiritual emergency", "mental health"] },
  { title: "Kundalini and the Nervous System: What Polyvagal Theory Tells Us", category: "Nervous System", tags: ["polyvagal", "nervous system", "kundalini"] },
  { title: "The Dark Night of the Soul: How Long Does It Last?", category: "Dark Night", tags: ["dark night", "duration", "spiritual crisis"] },
  { title: "Somatic Symptoms of Spiritual Awakening: When Your Body Speaks", category: "Somatic", tags: ["somatic", "body", "awakening symptoms"] },
  { title: "Integration After Spiritual Emergency: The Work Nobody Tells You About", category: "Integration", tags: ["integration", "spiritual emergency", "recovery"] },
  { title: "Trauma and Spontaneous Awakening: The Connection You Need to Understand", category: "Trauma", tags: ["trauma", "awakening", "connection"] },
  { title: "How to Talk to Your Doctor About Spiritual Emergency Without Getting Hospitalized", category: "Medical", tags: ["doctor", "hospitalization", "spiritual emergency"] },
  { title: "Ayahuasca Aftershock: When the Ceremony Doesn't End", category: "Plant Medicine", tags: ["ayahuasca", "integration", "plant medicine"] },
  { title: "Sleep Disorders During Kundalini Crisis: What's Actually Happening", category: "Sleep", tags: ["sleep", "insomnia", "kundalini"] },
  { title: "The Role of Diet in Spiritual Emergency Recovery", category: "Nutrition", tags: ["diet", "nutrition", "recovery"] },
  { title: "Kundalini Crisis in Relationships: How to Navigate the Chaos", category: "Relationships", tags: ["relationships", "kundalini", "chaos"] },
  { title: "When Meditation Makes Things Worse: Adverse Effects Nobody Warns You About", category: "Meditation", tags: ["meditation", "adverse effects", "spiritual emergency"] },
  { title: "Post-Awakening Depression: Why the Fireworks End and What Comes Next", category: "Depression", tags: ["depression", "post-awakening", "integration"] },
  { title: "Kundalini and Chronic Pain: The Somatic Connection", category: "Pain", tags: ["chronic pain", "somatic", "kundalini"] },
  { title: "Why Spiritual Communities Sometimes Make Spiritual Emergency Worse", category: "Community", tags: ["community", "spiritual bypassing", "support"] },
  { title: "The Neuroscience of Spiritual Emergency: What Brain Research Shows", category: "Neuroscience", tags: ["neuroscience", "brain", "spiritual emergency"] },
  { title: "Kundalini Syndrome: Symptoms, Duration, and What Actually Helps", category: "Kundalini Syndrome", tags: ["kundalini syndrome", "symptoms", "duration"] },
  { title: "Breathwork-Induced Crisis: When Holotropic Goes Wrong", category: "Breathwork", tags: ["breathwork", "holotropic", "crisis"] },
  { title: "Depersonalization After Spiritual Practice: You're Not Crazy", category: "Depersonalization", tags: ["depersonalization", "spiritual practice", "mental health"] },
  { title: "The Emergency Room and Spiritual Crisis: What to Say and What Not to Say", category: "Emergency", tags: ["emergency room", "crisis", "medical"] },
  { title: "How to Journal Your Way Through Spiritual Emergency", category: "Journaling", tags: ["journaling", "spiritual emergency", "processing"] },
  { title: "The Relationship Between Ego Death and Depression", category: "Ego Death", tags: ["ego death", "depression", "integration"] },
];

async function loadCatalog() {
  try {
    const cachePath = path.resolve(process.cwd(), 'src/data/verified-asins.json');
    const cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    return Object.entries(cache.asins).map(([asin, e]) => ({
      asin, name: e.title, category: e.category || '', tags: e.tags || []
    }));
  } catch {
    return [];
  }
}

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function generateNewArticle(catalog) {
  // Find a topic not already in the store
  let topic = null;
  for (const t of TOPIC_POOL) {
    const slug = toSlug(t.title);
    if (!(await slugExists(slug))) {
      topic = { ...t, slug };
      break;
    }
  }

  // All pool topics exist — generate a timestamped variant
  if (!topic) {
    const base = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
    const ts = Date.now();
    topic = {
      ...base,
      title: `${base.title}: A Deeper Look`,
      slug: `${toSlug(base.title)}-${ts}`
    };
  }

  const products = matchProducts({
    articleTitle: topic.title,
    articleTags: topic.tags,
    articleCategory: topic.category,
    catalog,
    minLinks: 3,
    maxLinks: 4
  });

  const productLines = products.slice(0, 4).map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  const systemPrompt = `You are Kalesh — a consciousness teacher who has personally navigated kundalini crisis and spiritual emergency. You write with raw honesty, direct address, and zero spiritual bypassing. You've read Stanislav Grof, Bonnie Greenwell, and David Lukoff. You know the DSM V-Code 62.89.

VOICE RULES:
- Direct address: always "you", never "one" or "people"
- Contractions everywhere: don't, can't, it's, you're, I've
- Include 2-3 of these dialogue markers naturally: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
- No academic distance. No clinical coldness. No spiritual bypassing.

STRUCTURAL RULES:
- 1,200 to 2,500 words. Not a word under 1,200. Not a word over 2,500.
- Use HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- No markdown. Only HTML.
- Include a health disclaimer paragraph near the end: "This is not a substitute for professional mental health care. If you are in crisis, please reach out to a qualified therapist or call 988."

BANNED WORDS: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

BANNED PHRASES: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

EM-DASHES: Replace ALL — or – with a hyphen surrounded by spaces ( - ). Zero em-dashes allowed.

AMAZON LINKS: Embed EXACTLY 3 or 4 of the provided links naturally in the article body.`;

  const userPrompt = `Write a full article titled: "${topic.title}"

Category: ${topic.category}
Tags: ${topic.tags.join(', ')}

Embed EXACTLY 3 or 4 of these Amazon affiliate links naturally in the body (use exact HTML):
${productLines}

Return ONLY the HTML article body. No title tag. No frontmatter. No markdown. Start with <p> or <h2>. Must be 1,200-2,500 words.`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[generate-article] Attempt ${attempt}/${MAX_ATTEMPTS}: ${topic.title}`);

      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.72
      });

      const rawBody = response.choices[0].message.content.trim();
      const gateResult = runQualityGate(rawBody);

      if (gateResult.passed) {
        console.log(`[generate-article] ✓ Passed gate (${gateResult.wordCount} words, ${gateResult.amazonLinks} links)`);

        const firstP = gateResult.body.match(/<p[^>]*>(.*?)<\/p>/s);
        const rawExcerpt = firstP ? firstP[1].replace(/<[^>]+>/g, '') : gateResult.body.replace(/<[^>]+>/g, '').slice(0, 200);
        const excerpt = rawExcerpt.slice(0, 155).trim();

        return { topic, body: gateResult.body, excerpt, wordCount: gateResult.wordCount };
      } else {
        console.log(`[generate-article] ✗ Gate failed: ${gateResult.failures.join(', ')}`);
      }
    } catch (err) {
      console.error(`[generate-article] Error attempt ${attempt}: ${err.message}`);
    }
  }

  return null;
}

export async function runArticlePublisher() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] AUTO_GEN_ENABLED is not true, skipping');
    return;
  }

  console.log('[generate-article] Starting article publisher...');

  try {
    const counts = await countArticles();
    console.log(`[generate-article] Status: ${counts.queued} queued, ${counts.published} published`);

    // Step 1: Publish from queue if available
    if (counts.queued > 0) {
      const article = await publishNextQueued();
      if (article) {
        // Assign hero image from library
        const imageUrl = await assignHeroImage(article.slug);
        article.image_url = imageUrl;
        await saveArticle(article);
        console.log(`[generate-article] ✓ Published from queue: ${article.slug}`);
        console.log(`[generate-article] ✓ Image: ${imageUrl}`);
        return;
      }
    }

    // Step 2: Queue empty — generate new article directly
    console.log('[generate-article] Queue empty — generating new article...');
    const catalog = await loadCatalog();
    const result = await generateNewArticle(catalog);

    if (!result) {
      console.error('[generate-article] ✗ Failed to generate article after max attempts');
      return;
    }

    // Assign hero image
    const imageUrl = await assignHeroImage(result.topic.slug);

    const article = {
      title: result.topic.title,
      slug: result.topic.slug,
      meta_description: result.excerpt,
      category: result.topic.category,
      tags: result.topic.tags,
      body: result.body,
      author: 'Kalesh',
      status: 'published',
      queued_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      reading_time: Math.ceil(result.wordCount / 200),
      word_count: result.wordCount,
      image_url: imageUrl,
      image_alt: result.topic.title
    };

    await saveArticle(article);
    console.log(`[generate-article] ✓ Published new article: ${article.slug}`);
    console.log(`[generate-article] ✓ Image: ${imageUrl}`);
  } catch (err) {
    console.error('[generate-article] Fatal error:', err);
  }
}

// Legacy export for backward compatibility
export { runArticlePublisher as generateNewArticle };
