import Anthropic from '@anthropic-ai/sdk';
import { buildAmazonUrl } from './amazon-verify.mjs';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PRODUCT_CATALOG = (await import('../data/product-catalog.js')).default;

const KALESH_VOICE = `
You are Kalesh, a consciousness teacher and writer who specializes in spiritual emergency, kundalini crisis, and awakening gone sideways. Your voice is direct, warm, and unflinching. You don't sugarcoat. You've been through it yourself.

Key Kalesh phrases to use naturally:
- "What if you're not losing your mind? What if you're losing a mind that was never actually yours?"
- "Spiritual emergency is what happens when the soul outpaces the nervous system."
- "Nobody tells you that awakening can feel like psychosis."
- "The emergence isn't gentle. And pretending it is doesn't help anyone."
- "Let's slow this down. What you're experiencing has a name, a history, and a way through."

Writing style:
- Contractions throughout (you're, don't, it's, that's, I've, I'll)
- Vary sentence length aggressively. Short punches. Then longer sentences that give context and texture. Three words. Then a full paragraph.
- Direct address ("you") throughout
- At least 2 conversational openers: "Here's the thing," "Honestly," "Look," "Truth is," "But here's what's interesting," "That said"
- Concrete specifics over abstractions. A name. A number. A moment.
- Opinions, not hedges
- First person ("I") used naturally
`;

const HARD_RULES = `
HARD RULES - NEVER VIOLATE:
- 1,600 to 2,000 words (strict; under 1,200 or over 2,500 = regenerate)
- Zero em-dashes (—). Use commas, periods, colons, or parentheses instead.
- NEVER use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover, additionally, consequently, subsequently, thereby, streamline, optimize, facilitate, amplify, catalyze, navigate (metaphorical), landscape (metaphorical), realm, domain, sphere
- NEVER use these phrases: "it's important to note," "in conclusion," "in summary," "in the realm of," "dive deep into," "at the end of the day," "in today's fast-paced world," "plays a crucial role," "a testament to," "when it comes to," "cannot be overstated," "first and foremost," "last but not least"
- 3 to 4 Amazon product links embedded naturally in prose, each followed by "(paid link)" in plain text
- No em-dashes. No em-dashes. No em-dashes.
- End with a Sanskrit mantra (1 line, italicized in HTML: <em>mantra here</em>)
`;

const HEALTH_DISCLAIMER = `<div class="health-disclaimer">
  <p><strong>Important:</strong> This article is for educational purposes only and is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or call 988 (Suicide &amp; Crisis Lifeline). Spiritual emergency can co-occur with mental health conditions that require professional assessment.</p>
</div>`;

export async function generateArticle({ topic, openerType, conclusionType, products }) {
  const selectedProducts = products || selectProductsForTopic(topic);
  const productList = selectedProducts.map(p => 
    `- ${p.name} (ASIN: ${p.asin}) - Category: ${p.category}`
  ).join('\n');

  const openerInstruction = getOpenerInstruction(openerType);
  const conclusionInstruction = getConclusionInstruction(conclusionType);

  const prompt = `${KALESH_VOICE}

Write a complete article for kundalinicrisis.com on this topic: "${topic}"

${openerInstruction}

${conclusionInstruction}

STRUCTURE:
- H1 title (compelling, SEO-optimized, not clickbait)
- Opening paragraph (no H2 before this)
- 3-5 H2 sections with H3 subsections as needed
- FAQ section with 3-5 questions (varied count)
- Conclusion
- End with a Sanskrit mantra (1 line, italicized)

AMAZON PRODUCTS TO EMBED (use 3-4 of these, embed naturally in prose):
${productList}

Amazon link format: <a href="https://www.amazon.com/dp/ASIN?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">Product Name</a> (paid link)

Include this health disclaimer at the TOP of the article, right after the H1:
${HEALTH_DISCLAIMER}

RESEARCHERS TO CITE (70% niche, 30% spiritual):
Niche: Stanislav Grof, Christina Grof, David Lukoff, Emma Bragdon, Bonnie Greenwell, Lee Sannella, Roberto Assagioli, John Weir Perry, Willoughby Britton, Sean Blackwell
Spiritual (max 30%): Krishnamurti, Alan Watts, Sadhguru, Tara Brach

BACKLINKS (23% chance - include if appropriate):
Natural link to <a href="https://kalesh.love" target="_blank" rel="noopener">Kalesh's main site</a>

OUTPUT FORMAT: Return ONLY the HTML article body (no <html>, <head>, or <body> tags). Start with <h1>.

${HARD_RULES}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const body = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Generate metadata
  const slug = topicToSlug(topic);
  const metaPrompt = `Given this article topic: "${topic}", provide a JSON object with:
- metaDescription (150-160 chars, compelling)
- ogTitle (50-60 chars)
- ogDescription (150-160 chars)
- category (one of: kundalini-crisis, spiritual-emergency, dark-night, meditation-effects, integration, grounding, mental-health, community)
- tags (array of 5-8 relevant tags)
- imageAlt (descriptive alt text for hero image)
- readingTime (estimated minutes, integer)
- ctaPrimary (short call to action, max 60 chars)

Return ONLY valid JSON, no markdown.`;

  const metaMessage = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: metaPrompt }]
  });

  let meta = {};
  try {
    const metaText = metaMessage.content[0].type === 'text' ? metaMessage.content[0].text : '{}';
    meta = JSON.parse(metaText.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) {
    console.warn('[generate] Failed to parse meta JSON:', e.message);
    meta = {
      metaDescription: `${topic} - guidance from Kalesh on spiritual emergency and awakening.`,
      ogTitle: topic.substring(0, 60),
      ogDescription: `Understanding ${topic.toLowerCase()} with Kalesh.`,
      category: 'spiritual-emergency',
      tags: ['spiritual-emergency', 'kundalini', 'awakening'],
      imageAlt: `${topic} - spiritual emergency guidance`,
      readingTime: 8,
      ctaPrimary: 'Read the full guide'
    };
  }

  return {
    slug,
    title: topic,
    body,
    ...meta,
    author: 'Kalesh',
    asinsUsed: selectedProducts.map(p => p.asin),
    openerType,
    conclusionType
  };
}

function topicToSlug(topic) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function selectProductsForTopic(topic) {
  const topicLower = topic.toLowerCase();
  const catalog = PRODUCT_CATALOG;
  
  // Score products by relevance
  const scored = catalog.map(p => {
    let score = 0;
    const tags = p.tags || [];
    const name = (p.name || '').toLowerCase();
    const topicWords = topicLower.split(/\W+/).filter(w => w.length > 3);
    
    for (const w of topicWords) {
      if (name.includes(w)) score += 3;
      if (tags.some(t => t.includes(w))) score += 2;
    }
    
    // Always include some books
    if (p.category === 'books') score += 1;
    
    return { product: p, score };
  }).sort((a, b) => b.score - a.score);
  
  return scored.slice(0, 4).map(s => s.product);
}

function getOpenerInstruction(type) {
  switch (type) {
    case 'gut-punch':
      return 'OPENER TYPE: Gut-punch statement. Start with a blunt, visceral statement that immediately names the reader\'s experience. No setup. No context. Just the raw truth.';
    case 'provocative-question':
      return 'OPENER TYPE: Provocative question. Open with a question that challenges assumptions or names something the reader has been afraid to ask.';
    case 'micro-story':
      return 'OPENER TYPE: Micro-story. Open with a 2-3 sentence scene or moment that grounds the reader in a specific, relatable experience. No names needed.';
    case 'counterintuitive-claim':
      return 'OPENER TYPE: Counterintuitive claim. Open with a statement that contradicts conventional wisdom about spiritual awakening or mental health.';
    default:
      return 'OPENER TYPE: Choose the most powerful opener for this topic.';
  }
}

function getConclusionInstruction(type) {
  switch (type) {
    case 'call-to-action':
      return 'CONCLUSION TYPE: Call to action. End with a specific, actionable step the reader can take today.';
    case 'reflection':
      return 'CONCLUSION TYPE: Reflection. End with a quiet, contemplative paragraph that honors the difficulty of the reader\'s experience.';
    case 'question':
      return 'CONCLUSION TYPE: Question. End with a single question that invites the reader to sit with their experience differently.';
    case 'challenge':
      return 'CONCLUSION TYPE: Challenge. End with a direct challenge to the reader to do something uncomfortable but necessary.';
    case 'benediction':
      return 'CONCLUSION TYPE: Benediction. End with a blessing or acknowledgment of the reader\'s courage and the difficulty of the path.';
    default:
      return 'CONCLUSION TYPE: Choose the most appropriate conclusion for this topic.';
  }
}
