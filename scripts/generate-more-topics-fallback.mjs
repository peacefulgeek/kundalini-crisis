import fs from 'fs';

const existingInputs = JSON.parse(fs.readFileSync('/tmp/final-map-inputs.json', 'utf8'));
const totalNeeded = 500 - 34; // 34 existing valid articles
const toGenerate = totalNeeded - existingInputs.length;

if (toGenerate > 0) {
  console.log(`Need ${toGenerate} more topics via fallback generator.`);
  
  const baseTopics = [
    "The Dark Night of the Soul and ",
    "Somatic Experiencing for ",
    "Nervous System Regulation After ",
    "Kundalini Awakening vs ",
    "Integration Practices for ",
    "How to Survive ",
    "The Hidden Meaning of ",
    "Why Your Body Reacts to ",
    "Spiritual Emergency and ",
    "Grounding Techniques During "
  ];
  
  const subjects = [
    "Existential Dread", "Spiritual Bypassing", "Ego Dissolution", "Energy Surges",
    "Sleep Paralysis", "Chronic Fatigue", "Sensory Overload", "Emotional Numbness",
    "Psychic Phenomena", "Synchronicities", "Past Life Memories", "Kundalini Syndrome",
    "Vagus Nerve Dysregulation", "Heart Chakra Activation", "Third Eye Opening",
    "Crown Chakra Pressure", "Root Chakra Grounding", "Sacral Chakra Fears",
    "Solar Plexus Emotions", "Throat Chakra Visions"
  ];
  
  let added = 0;
  outer: for (const base of baseTopics) {
    for (const sub of subjects) {
      if (added >= toGenerate) break outer;
      const title = base + sub;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      existingInputs.push(`${title}|||${slug}|||spiritual emergency,kundalini,integration`);
      added++;
    }
  }
}

if (existingInputs.length > totalNeeded) {
  existingInputs.length = totalNeeded;
}

fs.writeFileSync('/tmp/final-map-inputs-500.json', JSON.stringify(existingInputs, null, 2));
console.log(`Generated topics via fallback. Total inputs for map: ${existingInputs.length}`);
