import { generateNewArticle } from './generate-article.mjs';

export async function runProductSpotlight() {
  console.log('[product-spotlight] Running product spotlight generation');
  const topics = [
    "The Best Books on Spiritual Emergency (A Practical Reading List)",
    "Grounding Tools That Actually Work During Kundalini Crisis",
    "Supplements for Nervous System Support During Spiritual Emergency",
    "The Best Journals for Processing Spiritual Awakening",
    "Sound Healing Tools for Kundalini Crisis: What Actually Helps"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  return generateNewArticle({ forceTopic: topic });
}
