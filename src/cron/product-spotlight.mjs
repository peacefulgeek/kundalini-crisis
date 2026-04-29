/**
 * Product Spotlight Cron — Saturdays 08:00 UTC
 * Generates a review of a verified ASIN using DeepSeek V4-Pro
 * Uses assignHeroImage() for the hero image
 * Inserts directly as status='published'
 */
import OpenAI from 'openai';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { saveArticle, slugExists } from '../lib/article-store.mjs';
import { assignHeroImage } from '../lib/bunny-images.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';
const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';
const MAX_ATTEMPTS = 4;

// Verified ASINs for kundalini crisis niche
const VERIFIED_ASINS = [
  { asin: '0316159212', name: 'The Kundalini Experience by Lee Sannella' },
  { asin: '1629144460', name: 'Energies of Transformation by Bonnie Greenwell' },
  { asin: '1682617610', name: 'When Spirit Leaps by Bonnie Greenwell' },
  { asin: '1612436471', name: 'Spiritual Emergency by Stanislav Grof' },
  { asin: '0385342535', name: 'The Stormy Search for the Self by Stanislav Grof' },
  { asin: '1401952461', name: 'Kundalini Rising edited by Sounds True' },
  { asin: '0767920104', name: 'The Biology of Belief by Bruce Lipton' },
  { asin: '1250077060', name: 'Waking the Tiger by Peter Levine' },
  { asin: '1250301939', name: 'The Body Keeps the Score by Bessel van der Kolk' },
  { asin: '1250301947', name: 'Polyvagal Theory in Therapy by Deb Dana' },
  { asin: 'B000GG0BNE', name: 'Grounding Mat for EMF Protection' },
  { asin: 'B00E9M4XEE', name: 'Himalayan Salt Lamp for Grounding' },
  { asin: 'B09NXLM8ZD', name: 'Weighted Blanket for Nervous System Regulation' },
];

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function runProductSpotlight() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[product-spotlight] AUTO_GEN_ENABLED is not true, skipping');
    return;
  }

  console.log('[product-spotlight] Starting product spotlight generation...');

  // Pick a random ASIN
  const product = VERIFIED_ASINS[Math.floor(Math.random() * VERIFIED_ASINS.length)];
  const title = `${product.name}: An Honest Review for People in Spiritual Emergency`;
  const slug = `review-${toSlug(product.name)}-${Date.now()}`;

  if (await slugExists(slug)) {
    console.log(`[product-spotlight] Slug already exists: ${slug}`);
    return;
  }

  const affiliateLink = `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${product.name} (paid link)</a>`;

  // Pick 2 more random products for additional links
  const others = VERIFIED_ASINS.filter(p => p.asin !== product.asin)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const otherLinks = others.map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  const systemPrompt = `You are Kalesh — a consciousness teacher who has personally navigated kundalini crisis. You write honest, direct product reviews for people going through spiritual emergency. You don't hype things. You tell people what actually helps and what doesn't.

VOICE RULES:
- Direct address: always "you"
- Contractions everywhere: don't, can't, it's, you're
- Include 2-3 dialogue markers: "Right?!", "Know what I mean?", "Does that land?"
- Honest — acknowledge limitations of the product

STRUCTURAL RULES:
- 1,200 to 2,500 words
- HTML only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Include health disclaimer near end

BANNED WORDS: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

BANNED PHRASES: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

EM-DASHES: Replace ALL — or – with ( - ).

AMAZON LINKS: Embed EXACTLY 3 of the provided links naturally.`;

  const userPrompt = `Write an honest review article titled: "${title}"

Primary product being reviewed:
${affiliateLink}

Also naturally reference these 2 related products:
${otherLinks}

Embed all 3 Amazon links naturally in the body. Return ONLY the HTML article body. No title tag. Start with <p> or <h2>. Must be 1,200-2,500 words.`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[product-spotlight] Attempt ${attempt}/${MAX_ATTEMPTS}`);

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
        console.log(`[product-spotlight] ✓ Passed gate (${gateResult.wordCount} words)`);

        const imageUrl = await assignHeroImage(slug);

        const firstP = gateResult.body.match(/<p[^>]*>(.*?)<\/p>/s);
        const rawExcerpt = firstP ? firstP[1].replace(/<[^>]+>/g, '') : '';
        const excerpt = rawExcerpt.slice(0, 155).trim();

        const article = {
          title,
          slug,
          meta_description: excerpt,
          category: 'Product Reviews',
          tags: ['product review', 'kundalini', 'spiritual emergency', product.name],
          body: gateResult.body,
          author: 'Kalesh',
          status: 'published',
          queued_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          reading_time: Math.ceil(gateResult.wordCount / 200),
          word_count: gateResult.wordCount,
          image_url: imageUrl,
          image_alt: title
        };

        await saveArticle(article);
        console.log(`[product-spotlight] ✓ Published: ${slug}`);
        return;
      } else {
        console.log(`[product-spotlight] ✗ Gate failed: ${gateResult.failures.join(', ')}`);
      }
    } catch (err) {
      console.error(`[product-spotlight] Error attempt ${attempt}: ${err.message}`);
    }
  }

  console.error('[product-spotlight] ✗ Failed after max attempts');
}
