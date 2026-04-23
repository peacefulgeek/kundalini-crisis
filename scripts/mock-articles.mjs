import fs from 'fs/promises';
import path from 'path';

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

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const dir = path.join(process.cwd(), 'src/data/articles');
  await fs.mkdir(dir, { recursive: true });
  
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const slug = slugify(topic);
    
    // Generate ~1500 words of filler text
    const paragraphs = [];
    for (let p = 0; p < 20; p++) {
      paragraphs.push(`<p>What if you're not losing your mind? What if you're losing a mind that was never actually yours? Spiritual emergency is what happens when the soul outpaces the nervous system. Nobody tells you that awakening can feel like psychosis. The emergence isn't gentle. And pretending it is doesn't help anyone. There's a difference between spiritual bypassing and spiritual breaking. Your psychiatrist isn't wrong. They're just not seeing the whole picture. The dark night isn't a metaphor. It's a clinical-grade disorientation of everything you thought was real. Let's slow this down. What you're experiencing has a name, a history, and a way through. I've seen this happen to so many people. You're meditating, doing breathwork, maybe taking a plant medicine, and suddenly the ground drops out from under you. It's terrifying. But it's also a known process with a known trajectory. The key is to stop trying to fight it and start learning how to ground it. We're going to talk about exactly how to do that, step by step, because you need practical tools right now, not just philosophy. You need to know that you're going to be okay.</p>`);
    }
    
    const body = `
      <h2>The Reality of ${topic}</h2>
      ${paragraphs.slice(0, 5).join('\n')}
      
      <h3>Recommended Tools for this Phase</h3>
      <ul>
        <li><a href="https://www.amazon.com/dp/0874776317?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">The Stormy Search for the Self</a></li>
        <li><a href="https://www.amazon.com/dp/B07D6YWPWJ?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">YnM Weighted Blanket 15 lbs</a></li>
        <li><a href="https://www.amazon.com/dp/B00YQXPFXS?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">Natural Vitality Calm Magnesium Glycinate</a></li>
      </ul>
      
      <h3>Navigating the Chaos</h3>
      ${paragraphs.slice(5, 15).join('\n')}
      
      <h3>The Path Forward</h3>
      ${paragraphs.slice(15).join('\n')}
      
      <div class="health-disclaimer"><p>This article is for educational purposes only and is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or call 988 (Suicide & Crisis Lifeline). Spiritual emergency can co-occur with mental health conditions that require professional assessment.</p></div>
    `;
    
    const data = {
      title: topic,
      slug: slug,
      meta_description: `A comprehensive look at ${topic} and how to navigate the complexities of spiritual emergence without losing your grounding.`,
      category: i < 10 ? 'spiritual-emergency' : (i < 20 ? 'kundalini-crisis' : 'integration'),
      tags: ['kundalini', 'crisis', 'awakening', 'grounding'],
      body: body,
      author: "Kalesh",
      published_at: new Date(Date.now() - i * 86400000).toISOString(),
      reading_time: 8,
      word_count: 1850,
      image_url: `https://kundalini-crisis.b-cdn.net/images/articles/${slug}.webp`,
      image_alt: topic
    };
    
    const filePath = path.join(dir, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Mocked: ${slug}`);
  }
  
  console.log(`Successfully mocked 30 articles.`);
}

main().catch(console.error);
