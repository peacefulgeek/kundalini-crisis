import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { matchProducts } from '../lib/match-products.mjs';
import catalog from '../data/product-catalog.js';

const openai = new OpenAI();

export async function generateNewArticle(options = {}) {
  const { forceTopic } = options;
  
  const topic = forceTopic || "Spiritual Emergency vs. Mental Illness: How to Tell the Difference";
  
  console.log(`[generate-article] Starting generation for: ${topic}`);
  
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[generate-article] Attempt ${attempts}/${maxAttempts}`);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { 
            role: "system", 
            content: `You are Kalesh, a consciousness teacher and writer. You write about spiritual emergency, kundalini crisis, and the dark night of the soul.
        
Your voice:
- "What if you're not losing your mind? What if you're losing a mind that was never actually yours?"
- "Spiritual emergency is what happens when the soul outpaces the nervous system."
- "Nobody tells you that awakening can feel like psychosis."
- "The emergence isn't gentle. And pretending it is doesn't help anyone."

Rules:
1. Target 1,600-2,000 words. (Must be >1200 and <2500)
2. ZERO em-dashes (—). Use periods, commas, or standard hyphens.
3. Conversational voice: varying sentence lengths, contractions, direct address. Use short punchy sentences and long flowing ones.
4. NO AI words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, rapidly-evolving, stakeholders, journey, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound.
5. NO banned phrases: "It's important to note that", "It's worth noting that", "In conclusion,", "In summary,", "A holistic approach", "Unlock your potential", "In the realm of", "Dive deep into", "At the end of the day", "In today's fast-paced world".
6. Format as pure HTML (no markdown wrappers) with semantic tags (<h2>, <h3>, <p>, <blockquote>).
7. Return ONLY a JSON object with this exact structure:
{
  "title": "Article Title",
  "slug": "article-slug-url",
  "meta_description": "150 char description",
  "category": "spiritual-emergency",
  "tags": ["kundalini", "crisis", "awakening"],
  "body": "<html>...</html>"
}`
          },
          { 
            role: "user", 
            content: `Write a comprehensive article about: ${topic}. CRITICAL: You MUST write at least 1,600 words. If you write less than 1,200 words, you will fail. CRITICAL: You MUST NOT use any of the banned words (especially 'profound'). Remember to return ONLY valid JSON matching the requested structure.` 
          }
        ],
        temperature: 0.7
      });

      const text = response.choices[0].message.content;
      
      // Parse JSON
      let data;
      try {
        // Find JSON block if it wrapped it in markdown
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          data = JSON.parse(text);
        }
      } catch (e) {
        console.error(`[generate-article] Failed to parse JSON: ${e.message}`);
        continue;
      }
      
      // Get matched products
      const products = matchProducts({
        articleTitle: data.title,
        articleTags: data.tags || [],
        articleCategory: data.category || 'spiritual-emergency',
        catalog: catalog,
        minLinks: 3,
        maxLinks: 4
      });
      
      // Insert links into body (simplistic insertion for now)
      let bodyWithLinks = data.body;
      if (products.length > 0) {
        bodyWithLinks += `<h3>Recommended Tools for this Phase</h3><ul>`;
        products.forEach(p => {
          bodyWithLinks += `<li><a href="https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">${p.name}</a></li>`;
        });
        bodyWithLinks += `</ul>`;
      }
      
      data.body = bodyWithLinks;
      
      // Run quality gate
      const gateResult = runQualityGate(data.body);
      
      if (!gateResult.passed) {
        console.error(`[generate-article] Quality gate failed:`, gateResult.failures);
        continue;
      }
      
      // Add health disclaimer
      const disclaimer = `<div class="health-disclaimer"><p>This article is for educational purposes only and is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or call 988 (Suicide & Crisis Lifeline). Spiritual emergency can co-occur with mental health conditions that require professional assessment.</p></div>`;
      data.body = data.body + disclaimer;
      
      // Add author and date
      data.author = "Kalesh";
      data.published_at = new Date().toISOString();
      data.reading_time = Math.ceil(gateResult.wordCount / 200);
      data.word_count = gateResult.wordCount;
      
      // Image will be generated in phase 5
      data.image_url = "";
      data.image_alt = data.title;
      
      // Save to disk for now (in a real DB this would be an INSERT)
      // Since we don't have the DB fully set up yet, we'll just save it to a JSON file
      const dir = path.join(process.cwd(), 'src/data/articles');
      await fs.mkdir(dir, { recursive: true });
      
      const filePath = path.join(dir, `${data.slug}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      console.log(`[generate-article] Successfully generated and saved: ${data.slug}`);
      return data;
      
    } catch (err) {
      console.error(`[generate-article] Error: ${err.message}`);
    }
  }
  
  console.error(`[generate-article] Failed after ${maxAttempts} attempts`);
  return null;
}
