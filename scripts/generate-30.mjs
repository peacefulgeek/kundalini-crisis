import { generateNewArticle } from '../src/cron/generate-article.mjs';

const TOPICS = [
  "Spiritual Emergency vs. Mental Illness: How to Tell the Difference",
  "What Is a Kundalini Crisis? (And Why Nobody Warned You)",
  "The Dark Night of the Soul Is Not a Metaphor — It's a Process",
  "When Meditation Breaks You: Adverse Effects Nobody Talks About",
  "Depersonalization After Spiritual Practice: You're Not Crazy",
  "Stanislav Grof's Framework for Non-Ordinary States of Consciousness",
  "How to Find a Therapist Who Understands Spiritual Emergency",
  "The Somatic Experience of Spiritual Awakening (Tremors, Heat, Involuntary Movement)",
  "Why Your Friends and Family Think You're Losing It",
  "Emergency Grounding Practices When Awakening Gets Too Intense",
  "The Difference Between Ego Death and Depression",
  "Psychedelics and Spiritual Emergency: When the Trip Doesn't End",
  "Kundalini Syndrome: Symptoms, Duration, and What Actually Helps",
  "Why Western Psychiatry Pathologizes Spiritual Experience",
  "The Relationship Between Trauma and Spontaneous Awakening",
  "How to Support Someone in Spiritual Crisis",
  "TCM and Spiritual Emergency: Liver Fire, Heart Shen Disturbance, and Kidney Depletion",
  "The Nervous System During Awakening: Polyvagal Theory Meets Kundalini",
  "When to Go to the Emergency Room (And When Not To)",
  "Integration After Spiritual Emergency: The Long Road Back",
  "The History of Spiritual Emergency: From Shamanic Initiation to DSM Diagnosis",
  "Sleep Disruption During Spiritual Emergency (And How to Survive It)",
  "Supplements and Herbs for Nervous System Stabilization During Crisis",
  "The Difference Between Spiritual Emergency and Spiritual Bypassing",
  "Breathwork-Induced Crisis: When Holotropic Goes Wrong",
  "How to Journal Your Way Through Spiritual Emergency",
  "The Role of Community (And Why Isolation Makes Everything Worse)",
  "Post-Awakening Depression: When the Fireworks End and You're Still Here",
  "Ayahuasca Aftershock: Integration When the Ceremony Goes Deep",
  "The Other Side: What Life Looks Like After Spiritual Emergency"
];

async function main() {
  console.log(`[generate-30] Starting generation of ${TOPICS.length} articles...`);
  
  // We'll generate them sequentially to avoid rate limits, but it might take a while
  // For the initial build, we can just generate a few to verify, then generate the rest
  
  let successCount = 0;
  
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`[${i+1}/${TOPICS.length}] Generating: ${topic}`);
    
    try {
      // Overriding the prompt slightly to force the topic
      const result = await generateNewArticle({ forceTopic: topic });
      if (result) {
        console.log(`  ✓ Success: ${result.slug} (${result.word_count} words)`);
        successCount++;
      } else {
        console.log(`  ✗ Failed to generate or save`);
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
    
    // Wait 2 seconds between generations
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`[generate-30] Finished. Successfully generated ${successCount}/${TOPICS.length} articles.`);
}

main().catch(console.error);
