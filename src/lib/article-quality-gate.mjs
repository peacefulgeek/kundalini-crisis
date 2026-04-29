/**
 * Paul Voice Gate v2 — Quality gate for all generated articles
 * Non-negotiable. Every article must pass before storage.
 * Up to 4 regeneration attempts before discarding.
 * Source of truth: ADDENDUMSCOPENOCLAUDE.md Section 6
 */
import { countAmazonLinks, extractAsinsFromText } from './amazon-verify.mjs';

// Exact banned words from addendum Section 6.1
const BANNED_WORDS = [
  'utilize','delve','tapestry','landscape','paradigm','synergy','leverage',
  'unlock','empower','pivotal','embark','underscore','paramount','seamlessly',
  'robust','beacon','foster','elevate','curate','curated','bespoke','resonate',
  'harness','intricate','plethora','myriad','groundbreaking','innovative',
  'cutting-edge','state-of-the-art','game-changer','ever-evolving',
  'rapidly-evolving','stakeholders','navigate','ecosystem','framework',
  'comprehensive','transformative','holistic','nuanced','multifaceted',
  'profound','furthermore',
  // Additional voice quality words
  'revolutionary','unparalleled','unprecedented','remarkable','extraordinary',
  'exceptional','streamline','optimize','facilitate','amplify','catalyze',
  'propel','spearhead','orchestrate','traverse','moreover','additionally',
  'consequently','subsequently','thereby','thusly','wherein','whereby',
  'arguably','notably','crucially','importantly','essentially',
  'fundamentally','inherently','intrinsically','substantively'
];

// Exact banned phrases from addendum Section 6.2
const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role",
  // Additional
  "it's worth mentioning",
  "it's crucial to",
  "it is essential to",
  "to summarize,",
  "unlock your potential",
  "unlock the power",
  "in the world of",
  "dive into",
  "delve into",
  "in today's digital age",
  "in today's modern world",
  "in this digital age",
  "when it comes to",
  "navigate the complexities",
  "a testament to",
  "speaks volumes",
  "plays a vital role",
  "plays a significant role",
  "plays a pivotal role",
  "a wide array of",
  "a wide range of",
  "a plethora of",
  "a myriad of",
  "has emerged as",
  "continues to evolve",
  "has revolutionized",
  "cannot be overstated",
  "it goes without saying",
  "needless to say",
  "last but not least",
  "first and foremost"
];

const EM_DASH_RE = /[\u2014\u2013]/g;

export function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

export function hasEmDash(text) {
  return EM_DASH_RE.test(text);
}

export function replaceEmDashes(text) {
  return text.replace(EM_DASH_RE, ' - ');
}

export function findFlaggedWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase();
  const found = [];
  for (const w of BANNED_WORDS) {
    const pat = w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\b${pat}\\b`, 'i').test(stripped)) found.push(w);
  }
  return found;
}

export function findFlaggedPhrases(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/\s+/g, ' ');
  return BANNED_PHRASES.filter(p => stripped.includes(p.toLowerCase()));
}

export function voiceSignals(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ');
  const lower = stripped.toLowerCase();
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;
  const directAddress = (lower.match(/\byou('re|r|rself|)?\b/g) || []).length;
  const firstPerson = (lower.match(/\b(i|i'm|i've|i'd|i'll|my|me|mine)\b/g) || []).length;
  const sentences = stripped.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (lengths.length || 1);
  const stdDev = Math.sqrt(variance);
  const shortSentences = lengths.filter(l => l <= 6).length;
  const longSentences = lengths.filter(l => l >= 25).length;
  // Paul voice dialogue markers from addendum Section 6.7
  const dialogueMarkers = [
    /Right\?!/i, /Know what I mean\?/i, /Does that land\?/i,
    /How does that make you feel\?/i,
    /\bhere's the thing\b/i, /\blook,\s/i, /\bhonestly,?\s/i,
    /\btruth is\b/i, /\bi'll tell you\b/i, /\bthink about it\b/i,
    /\bthat said\b/i, /\bbut here's\b/i, /\bso yeah\b/i,
    /\byou know\b/i, /\bkind of\b/i, /\bsort of\b/i
  ];
  const markerCount = dialogueMarkers.filter(r => r.test(stripped)).length;
  return {
    contractions,
    directAddress,
    firstPerson,
    sentenceCount: sentences.length,
    avgSentenceLength: +avg.toFixed(1),
    sentenceStdDev: +stdDev.toFixed(1),
    shortSentences,
    longSentences,
    conversationalMarkers: markerCount
  };
}

/**
 * Run the full Paul Voice Gate on an article body.
 * Auto-replaces em-dashes before checking (per addendum Section 6.3).
 * @param {string} rawBody - HTML article body
 * @returns {{ passed: boolean, body: string, failures: string[], warnings: string[], wordCount: number, amazonLinks: number }}
 */
export function runQualityGate(rawBody) {
  const failures = [];
  const warnings = [];

  // Step 1: Auto-replace em-dashes (addendum Section 6.3)
  let body = replaceEmDashes(rawBody);

  // Step 2: Verify no em-dashes survive
  if (EM_DASH_RE.test(body)) {
    failures.push('em-dash-survived-replacement');
  }

  // Step 3: Banned words (addendum Section 6.1)
  const bw = findFlaggedWords(body);
  if (bw.length > 0) failures.push(`ai-flagged-words:${bw.join(',')}`);

  // Step 4: Banned phrases (addendum Section 6.2)
  const bp = findFlaggedPhrases(body);
  if (bp.length > 0) failures.push(`ai-flagged-phrases:${bp.join('|')}`);

  // Step 5: Word count (addendum Section 6.4)
  const words = countWords(body);
  if (words < 1200) failures.push(`word-count-too-low:${words}`);
  if (words > 2500) failures.push(`word-count-too-high:${words}`);

  // Step 6: Amazon affiliate links — exactly 3 or 4 (addendum Section 6.5)
  const amzCount = countAmazonLinks(body);
  if (amzCount < 3 || amzCount > 4) {
    failures.push(`amazon-links:${amzCount}(must-be-3-or-4)`);
  }

  // Step 7: Voice quality checks
  const voice = voiceSignals(body);
  const per1k = (n) => (n / (words || 1)) * 1000;

  if (per1k(voice.contractions) < 4) {
    failures.push(`contractions-too-few:${voice.contractions}(${per1k(voice.contractions).toFixed(1)}/1k)`);
  }
  if (voice.directAddress === 0 && voice.firstPerson === 0) {
    failures.push('no-direct-address-or-first-person');
  }
  if (voice.sentenceStdDev < 4) {
    failures.push(`sentence-variance-too-low:${voice.sentenceStdDev}`);
  }
  if (voice.shortSentences < 2) {
    failures.push(`too-few-short-sentences:${voice.shortSentences}`);
  }
  // Dialogue markers: addendum requires 2-3 (warning only, not hard fail)
  if (voice.conversationalMarkers < 2) {
    warnings.push(`dialogue-markers-low:${voice.conversationalMarkers}(need-2-3)`);
  }

  return {
    passed: failures.length === 0,
    body,
    failures,
    warnings,
    wordCount: words,
    amazonLinks: amzCount,
    asins: extractAsinsFromText(body),
    voice
  };
}
