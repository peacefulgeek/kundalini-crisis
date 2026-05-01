import OpenAI from 'openai';
import fs from 'fs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gemini-2.5-flash';

async function run() {
  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert for a site about Kundalini Crisis and Spiritual Emergency.'
      },
      {
        role: 'user',
        content: `Generate exactly 124 unique, highly specific article titles about Kundalini Awakening, Spiritual Emergency, Dark Night of the Soul, Somatic Experiencing, Nervous System Regulation, Integration, and Mystical Experiences.

Format the output as a clean JSON array of objects, each with "title", "slug" (kebab-case), and "tags" (array of 3 strings).
Make absolutely sure the JSON is valid and complete. Do not cut off the output.`
      }
    ],
    temperature: 0.9,
    max_tokens: 8000
  });

  const raw = resp.choices[0].message.content.trim();
  const jsonStr = raw.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
  
  let newTopics = [];
  try {
    newTopics = JSON.parse(jsonStr);
  } catch (err) {
    console.error('JSON Parse failed, trying to fix trailing comma/brackets...');
    try {
      const fixed = jsonStr.replace(/,\s*$/, '') + ']';
      newTopics = JSON.parse(fixed);
    } catch (err2) {
      console.error('Still failed:', err2.message);
      fs.writeFileSync('/tmp/failed-json.txt', jsonStr);
      process.exit(1);
    }
  }
  
  const existingInputs = JSON.parse(fs.readFileSync('/tmp/final-map-inputs.json', 'utf8'));
  
  for (const t of newTopics) {
    existingInputs.push(`${t.title}|||${t.slug}|||${t.tags.join(',')}`);
  }
  
  // Truncate to exactly 500 total if we overshot
  const totalNeeded = 500 - 34; // 34 existing valid articles
  if (existingInputs.length > totalNeeded) {
    existingInputs.length = totalNeeded;
  }
  
  fs.writeFileSync('/tmp/final-map-inputs-500.json', JSON.stringify(existingInputs, null, 2));
  console.log(`Generated new topics. Total inputs for map: ${existingInputs.length}`);
}

run().catch(console.error);
