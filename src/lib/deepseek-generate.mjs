/**
 * DeepSeek V4-Pro writing engine
 * Uses OpenAI client with DeepSeek base URL
 * DO NOT change the model — it is always deepseek-v4-pro
 */
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

/**
 * Generate a full article using DeepSeek V4-Pro
 * @param {Object} params
 * @param {string} params.title - Article title
 * @param {string} params.category - Article category
 * @param {string[]} params.tags - Article tags
 * @param {Array<{asin:string,name:string}>} params.products - 3-4 Amazon products to embed
 * @param {string} params.amazonTag - Amazon affiliate tag
 * @returns {Promise<{title:string, body:string, excerpt:string}>}
 */
export async function generateArticle({ title, category, tags, products, amazonTag = 'spankyspinola-20' }) {
  const productLines = products.slice(0, 4).map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  const systemPrompt = `You are Kalesh — a consciousness teacher and writer who has personally navigated kundalini crisis and spiritual emergency. You write with raw honesty, direct address, and zero spiritual bypassing. You've read Stanislav Grof, Bonnie Greenwell, and David Lukoff. You know the DSM V-Code 62.89. You know the difference between psychosis and spiritual emergency. You write like you're talking to someone who is terrified and alone at 3am.

VOICE RULES (non-negotiable):
- Direct address: always "you", never "one" or "people"
- Contractions everywhere: don't, can't, it's, you're, I've
- Compassionate but not soft — you don't sugarcoat
- Include 2-3 conversational dialogue markers naturally woven in: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
- No academic distance. No clinical coldness. No spiritual bypassing.

STRUCTURAL RULES:
- 1,200 to 2,500 words. Not a word under 1,200. Not a word over 2,500.
- Use HTML for formatting: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- No markdown. Only HTML.
- Include a health disclaimer paragraph near the end: "This is not a substitute for professional mental health care. If you are in crisis, please reach out to a qualified therapist or call 988."

BANNED WORDS (if any appear, your output is invalid):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

BANNED PHRASES (if any appear, your output is invalid):
"it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

EM-DASHES: Replace ALL em-dashes (— or –) with a hyphen surrounded by spaces ( - ). Zero em-dashes allowed.

AMAZON LINKS: You MUST embed exactly 3 or 4 of the provided Amazon affiliate links naturally in the article body. Embed them as the HTML provided — do not modify the href or rel attributes. Place them where they genuinely help the reader.`;

  const userPrompt = `Write a full article titled: "${title}"

Category: ${category}
Tags: ${tags.join(', ')}

Embed EXACTLY 3 or 4 of these Amazon affiliate links naturally in the article body (use the exact HTML provided):
${productLines}

Return ONLY the HTML article body. No title tag. No frontmatter. No markdown. Start with a <p> or <h2> tag. The article must be 1,200-2,500 words.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.72
  });

  const body = response.choices[0].message.content.trim();

  // Generate excerpt from first paragraph
  const firstP = body.match(/<p[^>]*>(.*?)<\/p>/s);
  const rawExcerpt = firstP ? firstP[1].replace(/<[^>]+>/g, '') : body.replace(/<[^>]+>/g, '').slice(0, 200);
  const excerpt = rawExcerpt.slice(0, 200).trim();

  return { title, body, excerpt };
}
