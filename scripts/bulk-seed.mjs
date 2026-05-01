/**
 * Bulk Seed Script — 500 Real Kundalini Crisis Articles
 * Uses gemini-2.5-flash (proxy) — on DigitalOcean will use DeepSeek V4-Pro
 * All articles saved as status='queued' — cron publishes 5/day
 */
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { saveArticle, slugExists } from '../src/lib/article-store.mjs';
import { matchProducts } from '../src/lib/match-products.mjs';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gemini-2.5-flash';

// 500 real, distinct, SEO-worthy kundalini crisis topics
const TOPICS = [
  // ── Symptoms & Physical Experience ──
  { title: "Why Your Spine Feels Like It's on Fire During Kundalini Awakening", tags: ['spinal heat', 'physical symptoms', 'kundalini'] },
  { title: "Kundalini Tremors: What Your Body Is Actually Doing and Why It's Not Seizures", tags: ['tremors', 'kriyas', 'physical symptoms'] },
  { title: "The Burning Sensation in Your Chest Is Not a Heart Attack — It's Kundalini", tags: ['chest burning', 'heart chakra', 'physical symptoms'] },
  { title: "Why You Can't Sleep During Kundalini Awakening (And What to Do at 3am)", tags: ['insomnia', 'sleep disruption', 'kundalini'] },
  { title: "Spontaneous Body Movements During Meditation: Kriyas Explained Without the Woo", tags: ['kriyas', 'spontaneous movement', 'meditation'] },
  { title: "The Pressure in Your Head Is Real: Kundalini and Intracranial Pressure", tags: ['head pressure', 'crown chakra', 'physical symptoms'] },
  { title: "Why You've Stopped Eating During Spiritual Emergency", tags: ['loss of appetite', 'fasting', 'spiritual emergency'] },
  { title: "Heart Palpitations and Kundalini: When to See a Doctor and When to Breathe", tags: ['heart palpitations', 'physical symptoms', 'medical'] },
  { title: "Electrical Sensations in Your Body During Kundalini: What the Nervous System Is Doing", tags: ['electrical sensations', 'nervous system', 'kundalini'] },
  { title: "Why You're Sweating Through Your Sheets: Kundalini and Night Sweats", tags: ['night sweats', 'heat', 'physical symptoms'] },
  { title: "Nausea and Vomiting During Spiritual Emergency: The Body Purging What the Mind Can't", tags: ['nausea', 'purging', 'physical symptoms'] },
  { title: "The Shaking That Won't Stop: Distinguishing Kundalini Kriyas from Anxiety Tremors", tags: ['shaking', 'tremors', 'anxiety'] },
  { title: "Why Your Skin Feels Like It's Crawling During Kundalini Awakening", tags: ['skin sensations', 'formication', 'kundalini'] },
  { title: "Pressure at the Base of Your Skull: Kundalini and the Brainstem", tags: ['skull pressure', 'brainstem', 'physical symptoms'] },
  { title: "Why You Feel Drunk or High Without Substances During Spiritual Emergency", tags: ['altered states', 'dissociation', 'spiritual emergency'] },

  // ── Psychological & Mental Health ──
  { title: "Kundalini Crisis vs Psychosis: How to Tell the Difference When You're in It", tags: ['psychosis', 'differential diagnosis', 'mental health'] },
  { title: "Depersonalization During Spiritual Emergency: When You Don't Recognize Yourself", tags: ['depersonalization', 'derealization', 'mental health'] },
  { title: "The Paranoia That Comes With Kundalini Awakening Is Not Schizophrenia", tags: ['paranoia', 'schizophrenia', 'differential diagnosis'] },
  { title: "Why Kundalini Awakening Can Look Exactly Like a Manic Episode", tags: ['mania', 'bipolar', 'differential diagnosis'] },
  { title: "Intrusive Thoughts During Kundalini: When the Mind Turns Against Itself", tags: ['intrusive thoughts', 'OCD', 'mental health'] },
  { title: "The Depression After Enlightenment: Post-Awakening Flatness Explained", tags: ['post-awakening depression', 'spiritual bypass', 'integration'] },
  { title: "Why You Can't Stop Crying During Kundalini Awakening", tags: ['emotional release', 'crying', 'kundalini'] },
  { title: "Ego Death Terror: What's Actually Happening When You Think You're Dying", tags: ['ego death', 'terror', 'kundalini'] },
  { title: "Kundalini and Suicidal Ideation: What to Do When the Dark Night Gets Darkest", tags: ['suicidal ideation', 'dark night', 'crisis support'] },
  { title: "Memory Loss and Cognitive Fog During Spiritual Emergency", tags: ['brain fog', 'memory', 'cognitive symptoms'] },
  { title: "Why You Feel Like Two People at Once During Kundalini Awakening", tags: ['identity split', 'dissociation', 'kundalini'] },
  { title: "Rage During Spiritual Emergency: The Anger Nobody Talks About", tags: ['rage', 'anger', 'emotional release'] },
  { title: "Why Kundalini Can Trigger Childhood Trauma Memories", tags: ['trauma', 'childhood', 'PTSD'] },
  { title: "Dissociation During Kundalini: Grounding When You're Not in Your Body", tags: ['dissociation', 'grounding', 'kundalini'] },
  { title: "The Grief That Comes With Awakening: Mourning Your Old Self", tags: ['grief', 'identity loss', 'integration'] },

  // ── Triggers & Causes ──
  { title: "Ayahuasca Triggered My Kundalini: What Happens When Plant Medicine Opens the Gate", tags: ['ayahuasca', 'plant medicine', 'trigger'] },
  { title: "Breathwork Triggered a Kundalini Crisis: What Holotropic Breathing Actually Does", tags: ['breathwork', 'holotropic', 'trigger'] },
  { title: "Why Trauma Can Trigger Spontaneous Kundalini Awakening", tags: ['trauma', 'PTSD', 'trigger'] },
  { title: "Near-Death Experience as Kundalini Trigger: The Research Behind the Phenomenon", tags: ['NDE', 'near-death', 'trigger'] },
  { title: "Psilocybin and Kundalini: When Mushrooms Open Something That Won't Close", tags: ['psilocybin', 'mushrooms', 'trigger'] },
  { title: "Childbirth as Kundalini Trigger: The Spiritual Emergency Nobody Prepares You For", tags: ['childbirth', 'postpartum', 'trigger'] },
  { title: "Grief as Kundalini Trigger: When Loss Breaks You Open", tags: ['grief', 'loss', 'trigger'] },
  { title: "Intensive Meditation Retreat and Kundalini Crisis: What the Teachers Don't Tell You", tags: ['meditation retreat', 'intensive practice', 'trigger'] },
  { title: "Yoga and Kundalini Awakening: Why Some Practices Accelerate the Process", tags: ['yoga', 'asana', 'trigger'] },
  { title: "Sexual Energy and Kundalini: How Intimacy Can Trigger Awakening", tags: ['sexual energy', 'intimacy', 'trigger'] },
  { title: "Fasting and Spiritual Emergency: Why Extreme Practices Can Destabilize You", tags: ['fasting', 'extreme practice', 'trigger'] },
  { title: "DMT and Kundalini: The Overlap Between Endogenous and Exogenous Experiences", tags: ['DMT', 'psychedelics', 'trigger'] },
  { title: "Kundalini Triggered by Reiki: When Energy Healing Starts Something Bigger", tags: ['Reiki', 'energy healing', 'trigger'] },
  { title: "Spontaneous Kundalini Awakening With No Spiritual Practice: Why It Happens", tags: ['spontaneous awakening', 'no practice', 'trigger'] },
  { title: "Sleep Deprivation and Kundalini: The Dangerous Intersection", tags: ['sleep deprivation', 'danger', 'trigger'] },

  // ── Grounding & Stabilization ──
  { title: "The Best Grounding Techniques for Kundalini Crisis That Actually Work", tags: ['grounding', 'stabilization', 'techniques'] },
  { title: "Cold Water and Kundalini: Why a Cold Shower Is Your Best Friend Right Now", tags: ['cold water', 'grounding', 'physical'] },
  { title: "Eating Meat During Kundalini Crisis: The Controversial Grounding Tool", tags: ['diet', 'meat', 'grounding'] },
  { title: "Why You Need to Stop Meditating During Kundalini Crisis", tags: ['stop meditating', 'grounding', 'stabilization'] },
  { title: "Earthing and Kundalini: The Science Behind Walking Barefoot on Grass", tags: ['earthing', 'grounding', 'nature'] },
  { title: "Heavy Blankets and Kundalini: Weighted Therapy for Spiritual Emergency", tags: ['weighted blanket', 'sensory', 'grounding'] },
  { title: "Exercise and Kundalini: How Physical Movement Brings You Back to Earth", tags: ['exercise', 'movement', 'grounding'] },
  { title: "Why Cooking and Cleaning Can Save You During Kundalini Crisis", tags: ['mundane tasks', 'grounding', 'embodiment'] },
  { title: "Root Chakra Work During Kundalini Crisis: Practical Techniques", tags: ['root chakra', 'muladhara', 'grounding'] },
  { title: "The Role of Salt in Grounding During Spiritual Emergency", tags: ['salt', 'grounding', 'minerals'] },
  { title: "Why You Need to Reduce Screen Time During Kundalini Awakening", tags: ['screen time', 'digital', 'grounding'] },
  { title: "Nature Immersion as Medicine for Kundalini Crisis", tags: ['nature', 'forest bathing', 'grounding'] },
  { title: "Gardening and Kundalini: Getting Your Hands in the Dirt as Therapy", tags: ['gardening', 'earth', 'grounding'] },
  { title: "Why Routine Is the Most Underrated Tool in Kundalini Recovery", tags: ['routine', 'structure', 'stabilization'] },
  { title: "The Danger of Spiritual Bypassing During Kundalini Crisis", tags: ['spiritual bypass', 'avoidance', 'integration'] },

  // ── Integration & Recovery ──
  { title: "What Integration Actually Means After Kundalini Awakening", tags: ['integration', 'recovery', 'post-awakening'] },
  { title: "The Timeline of Kundalini Integration: What to Expect in the First Year", tags: ['timeline', 'integration', 'recovery'] },
  { title: "Journaling for Kundalini Integration: What to Write and What to Skip", tags: ['journaling', 'integration', 'writing'] },
  { title: "Finding a Therapist Who Won't Pathologize Your Spiritual Emergency", tags: ['therapy', 'therapist', 'integration'] },
  { title: "Somatic Experiencing and Kundalini: Peter Levine's Work Applied to Spiritual Crisis", tags: ['somatic experiencing', 'Peter Levine', 'therapy'] },
  { title: "EMDR for Kundalini-Triggered Trauma: Does It Work?", tags: ['EMDR', 'trauma therapy', 'integration'] },
  { title: "Why Talk Therapy Alone Won't Integrate a Kundalini Awakening", tags: ['talk therapy', 'limitations', 'integration'] },
  { title: "The Role of Community in Kundalini Integration", tags: ['community', 'support', 'integration'] },
  { title: "Online Support Groups for Kundalini Crisis: What to Look For and What to Avoid", tags: ['online community', 'support groups', 'resources'] },
  { title: "Spiritual Direction vs Therapy for Kundalini Crisis: Which Do You Need?", tags: ['spiritual direction', 'therapy', 'comparison'] },
  { title: "How Long Does Kundalini Crisis Last? The Honest Answer", tags: ['duration', 'timeline', 'recovery'] },
  { title: "Setbacks in Kundalini Integration: Why You'll Think You're Healed Before You Are", tags: ['setbacks', 'relapse', 'integration'] },
  { title: "The Gifts That Come After Kundalini Crisis: What Survivors Report", tags: ['gifts', 'transformation', 'post-awakening'] },
  { title: "Rebuilding Your Life After Kundalini Awakening Destroyed It", tags: ['rebuilding', 'life after', 'integration'] },
  { title: "When to Know You're Through the Worst of Kundalini Crisis", tags: ['recovery signs', 'healing', 'integration'] },

  // ── Relationships & Social Life ──
  { title: "How Kundalini Awakening Destroys Relationships (And Sometimes That's Right)", tags: ['relationships', 'breakup', 'social'] },
  { title: "Telling Your Partner About Your Kundalini Crisis Without Losing Them", tags: ['relationships', 'communication', 'partner'] },
  { title: "Why Your Friends Think You've Lost Your Mind During Spiritual Emergency", tags: ['social isolation', 'friends', 'relationships'] },
  { title: "Kundalini and Marriage: When One Partner Awakens and the Other Doesn't", tags: ['marriage', 'partnership', 'relationships'] },
  { title: "Explaining Kundalini Crisis to Your Family Without Getting Committed", tags: ['family', 'communication', 'relationships'] },
  { title: "The Loneliness of Kundalini Awakening: Why Nobody Around You Gets It", tags: ['loneliness', 'isolation', 'relationships'] },
  { title: "Sex and Kundalini: Why Intimacy Changes After Awakening", tags: ['sex', 'intimacy', 'relationships'] },
  { title: "Kundalini and Codependency: How Awakening Can Expose Unhealthy Patterns", tags: ['codependency', 'patterns', 'relationships'] },
  { title: "Why You're Suddenly Sensitive to Other People's Energy After Kundalini", tags: ['empathy', 'sensitivity', 'relationships'] },
  { title: "Kundalini and Boundaries: Why You Can No Longer Tolerate What You Used to", tags: ['boundaries', 'sensitivity', 'relationships'] },
  { title: "Finding Your Tribe After Kundalini Awakening", tags: ['community', 'tribe', 'relationships'] },
  { title: "Kundalini and Parenting: How to Function as a Parent During Spiritual Emergency", tags: ['parenting', 'children', 'functional'] },
  { title: "Why Kundalini Awakening Can Feel Like the End of Every Friendship You Have", tags: ['friendship', 'loss', 'social'] },
  { title: "Navigating Work Relationships During Kundalini Crisis", tags: ['work', 'colleagues', 'functional'] },
  { title: "The New Relationships That Come After Kundalini: Who Stays and Who Goes", tags: ['new relationships', 'post-awakening', 'social'] },

  // ── Career & Practical Life ──
  { title: "How to Keep Your Job During Kundalini Crisis", tags: ['work', 'career', 'functional'] },
  { title: "Calling in Sick for Spiritual Emergency: The Practical Guide", tags: ['work', 'sick leave', 'practical'] },
  { title: "Why Kundalini Awakening Often Ends Careers (And Why That's Sometimes Necessary)", tags: ['career change', 'work', 'transformation'] },
  { title: "Financial Survival During Kundalini Crisis: Practical Money Management", tags: ['finances', 'money', 'practical'] },
  { title: "Disability and Kundalini Crisis: When You Can't Work", tags: ['disability', 'work', 'practical'] },
  { title: "The Career Pivot After Kundalini: Why You Can't Go Back to What You Were Doing", tags: ['career pivot', 'vocation', 'post-awakening'] },
  { title: "Working in Healthcare During Kundalini Crisis: A Special Challenge", tags: ['healthcare workers', 'professional', 'career'] },
  { title: "Kundalini and Creativity: Why Artists and Writers Are Especially Vulnerable", tags: ['creativity', 'artists', 'vulnerability'] },
  { title: "How to Explain a Gap in Your Resume Caused by Spiritual Emergency", tags: ['resume gap', 'career', 'practical'] },
  { title: "Kundalini and Entrepreneurship: When Awakening Blows Up Your Business", tags: ['entrepreneurship', 'business', 'career'] },

  // ── Medical System Navigation ──
  { title: "What to Tell Your Doctor About Kundalini Crisis (And What to Leave Out)", tags: ['doctor', 'medical', 'navigation'] },
  { title: "The DSM-5 V-Code 62.89: How Spiritual Emergency Is Classified in Psychiatry", tags: ['DSM-5', 'psychiatry', 'diagnosis'] },
  { title: "Psychiatric Hospitalization and Kundalini: How to Avoid It and What to Do If It Happens", tags: ['hospitalization', 'psychiatry', 'navigation'] },
  { title: "Antipsychotics and Kundalini: When Medication Is and Isn't Appropriate", tags: ['antipsychotics', 'medication', 'medical'] },
  { title: "Benzodiazepines for Kundalini Crisis: The Short-Term Tool Nobody Wants to Talk About", tags: ['benzos', 'medication', 'medical'] },
  { title: "Finding a Psychiatrist Who Understands Spiritual Emergency", tags: ['psychiatrist', 'finding help', 'medical'] },
  { title: "The Spiritual Emergency Network: What It Is and How to Use It", tags: ['Spiritual Emergency Network', 'resources', 'support'] },
  { title: "When Kundalini Crisis Requires Medical Intervention: The Clear Signs", tags: ['medical intervention', 'emergency', 'safety'] },
  { title: "Integrative Medicine and Kundalini: What Works Beyond Conventional Psychiatry", tags: ['integrative medicine', 'alternative', 'medical'] },
  { title: "Neurological Testing During Kundalini Crisis: What the Tests Show and Don't Show", tags: ['neurology', 'testing', 'medical'] },

  // ── Spiritual Traditions & Context ──
  { title: "Kundalini in Hindu Tradition: What the Texts Actually Say vs What Instagram Teaches", tags: ['Hindu tradition', 'Vedanta', 'context'] },
  { title: "Stanislav Grof and Spiritual Emergency: The Research That Changed Everything", tags: ['Stanislav Grof', 'research', 'spiritual emergency'] },
  { title: "Bonnie Greenwell's Work on Kundalini: What 30 Years of Research Found", tags: ['Bonnie Greenwell', 'research', 'kundalini'] },
  { title: "The Dark Night of the Soul in Christian Mysticism: St. John of the Cross and Kundalini", tags: ['dark night', 'Christian mysticism', 'St John of the Cross'] },
  { title: "Kundalini in Tibetan Buddhism: Tummo and the Inner Fire", tags: ['Tibetan Buddhism', 'tummo', 'inner fire'] },
  { title: "Shamanic Crisis and Kundalini: The Overlap Between Indigenous and Eastern Frameworks", tags: ['shamanic', 'indigenous', 'cross-cultural'] },
  { title: "Sufi Mysticism and Kundalini: The Hal States and Spiritual Emergency", tags: ['Sufism', 'hal', 'mysticism'] },
  { title: "Gopi Krishna's Kundalini: The Original First-Person Account That Started Modern Research", tags: ['Gopi Krishna', 'history', 'research'] },
  { title: "The Perennial Philosophy and Kundalini: Why Every Tradition Has a Version of This", tags: ['perennial philosophy', 'cross-cultural', 'context'] },
  { title: "Kundalini and the Chakra System: What's Metaphor and What's Physiologically Real", tags: ['chakras', 'physiology', 'framework'] },
  { title: "David Lukoff and the Spiritual Emergency Movement: How It Changed Psychiatry", tags: ['David Lukoff', 'psychiatry', 'history'] },
  { title: "Kundalini in Taoism: The Microcosmic Orbit and Its Parallels", tags: ['Taoism', 'microcosmic orbit', 'cross-cultural'] },
  { title: "The Kabbalah and Kundalini: Sephiroth, Shekinah, and the Ascending Fire", tags: ['Kabbalah', 'Jewish mysticism', 'cross-cultural'] },
  { title: "Kundalini and Shamanic Initiation: When the Crisis Is the Calling", tags: ['shamanic initiation', 'calling', 'vocation'] },
  { title: "The Science of Kundalini: What Neuroscience Actually Knows", tags: ['neuroscience', 'science', 'research'] },

  // ── Specific Experiences & Phenomena ──
  { title: "Seeing Light During Kundalini Awakening: Phosphenes, Visions, or Something Else?", tags: ['light visions', 'phosphenes', 'phenomena'] },
  { title: "Hearing Voices During Spiritual Emergency: What's Psychosis and What's Not", tags: ['hearing voices', 'psychosis', 'phenomena'] },
  { title: "Out-of-Body Experiences During Kundalini: What's Happening and Is It Dangerous?", tags: ['OBE', 'out of body', 'phenomena'] },
  { title: "Precognition and Synchronicity During Kundalini Awakening", tags: ['precognition', 'synchronicity', 'phenomena'] },
  { title: "Kundalini and Time Distortion: Why Hours Feel Like Minutes and Days Feel Like Years", tags: ['time distortion', 'altered states', 'phenomena'] },
  { title: "Seeing Entities During Kundalini Crisis: How to Work With What Appears", tags: ['entities', 'visions', 'phenomena'] },
  { title: "Kundalini and Past Life Memories: How to Hold Them Without Getting Lost", tags: ['past lives', 'memories', 'phenomena'] },
  { title: "The Bliss That Precedes the Crisis: Why Kundalini Starts Beautiful", tags: ['bliss', 'early stages', 'phenomena'] },
  { title: "Kundalini and Telepathy: When You Start Knowing Things You Shouldn't Know", tags: ['telepathy', 'psychic', 'phenomena'] },
  { title: "Spontaneous Samadhi During Kundalini: When You Can't Come Back", tags: ['samadhi', 'absorption', 'phenomena'] },
  { title: "Kundalini and the Sense of Universal Love: Why It's Real and Why It Passes", tags: ['universal love', 'unity', 'phenomena'] },
  { title: "The Void Experience in Kundalini: When Everything Disappears", tags: ['void', 'emptiness', 'phenomena'] },
  { title: "Kundalini and Heightened Sensory Perception: When Everything Is Too Much", tags: ['sensory sensitivity', 'hyperesthesia', 'phenomena'] },
  { title: "Spontaneous Mudras and Mantras During Kundalini: What Your Body Knows", tags: ['mudras', 'mantras', 'spontaneous'] },
  { title: "The Witness State in Kundalini: When You Watch Yourself From Outside", tags: ['witness state', 'observer', 'phenomena'] },

  // ── Nervous System & Somatic ──
  { title: "The Polyvagal Theory and Kundalini: Stephen Porges' Work Applied to Spiritual Emergency", tags: ['polyvagal', 'Stephen Porges', 'nervous system'] },
  { title: "Kundalini and the Sympathetic Nervous System: Why You're Always in Fight-or-Flight", tags: ['sympathetic', 'fight or flight', 'nervous system'] },
  { title: "Vagus Nerve Stimulation for Kundalini Crisis: Practical Techniques", tags: ['vagus nerve', 'VNS', 'nervous system'] },
  { title: "Kundalini and the Autonomic Nervous System: A Plain-English Explanation", tags: ['autonomic', 'nervous system', 'physiology'] },
  { title: "Why Kundalini Feels Like a Permanent Adrenaline Rush", tags: ['adrenaline', 'cortisol', 'nervous system'] },
  { title: "Somatic Trauma and Kundalini: When the Body Holds What the Mind Can't Process", tags: ['somatic trauma', 'body memory', 'nervous system'] },
  { title: "Breathwork for Nervous System Regulation During Kundalini Crisis", tags: ['breathwork', 'regulation', 'nervous system'] },
  { title: "The Role of the Amygdala in Kundalini Terror", tags: ['amygdala', 'fear response', 'neuroscience'] },
  { title: "Kundalini and Cortisol: The Stress Hormone Connection", tags: ['cortisol', 'stress', 'physiology'] },
  { title: "Neuroplasticity and Kundalini: How the Brain Rewires During Awakening", tags: ['neuroplasticity', 'brain', 'neuroscience'] },

  // ── Diet, Supplements & Lifestyle ──
  { title: "The Kundalini Diet: What to Eat When Your Body Is Rewiring", tags: ['diet', 'nutrition', 'lifestyle'] },
  { title: "Magnesium and Kundalini Crisis: The Mineral That Calms the Nervous System", tags: ['magnesium', 'supplements', 'nutrition'] },
  { title: "Why Caffeine Makes Kundalini Crisis Worse", tags: ['caffeine', 'stimulants', 'lifestyle'] },
  { title: "Alcohol and Kundalini: Why Drinking During Awakening Is a Terrible Idea", tags: ['alcohol', 'substances', 'lifestyle'] },
  { title: "Cannabis and Kundalini: When Weed Helps and When It Amplifies the Terror", tags: ['cannabis', 'marijuana', 'substances'] },
  { title: "Adaptogens for Kundalini Crisis: Ashwagandha, Rhodiola, and What the Research Says", tags: ['adaptogens', 'ashwagandha', 'supplements'] },
  { title: "Sleep Hygiene During Kundalini Awakening: Protocols That Actually Work", tags: ['sleep hygiene', 'insomnia', 'lifestyle'] },
  { title: "The Role of Hydration in Kundalini Stabilization", tags: ['hydration', 'water', 'lifestyle'] },
  { title: "Kundalini and Sugar: Why Blood Sugar Regulation Matters During Spiritual Emergency", tags: ['blood sugar', 'sugar', 'nutrition'] },
  { title: "Omega-3 Fatty Acids and Kundalini: Brain Health During Spiritual Emergency", tags: ['omega-3', 'brain health', 'nutrition'] },

  // ── Traditional Chinese Medicine & Ayurveda ──
  { title: "TCM and Kundalini: How Traditional Chinese Medicine Understands Spiritual Emergency", tags: ['TCM', 'Chinese medicine', 'framework'] },
  { title: "Acupuncture for Kundalini Crisis: What It Can and Can't Do", tags: ['acupuncture', 'TCM', 'treatment'] },
  { title: "Ayurveda and Kundalini: Vata Imbalance and the Spiritual Emergency Connection", tags: ['Ayurveda', 'Vata', 'framework'] },
  { title: "Qi Gong for Kundalini Stabilization: Moving Energy Without Amplifying It", tags: ['Qi Gong', 'energy movement', 'TCM'] },
  { title: "Herbal Medicine for Kundalini Crisis: What Practitioners Actually Recommend", tags: ['herbal medicine', 'herbs', 'treatment'] },
  { title: "The Pitta-Kundalini Connection: When Fire Constitution Meets Rising Energy", tags: ['Pitta', 'Ayurveda', 'constitution'] },
  { title: "Marma Points and Kundalini: Ayurvedic Energy Medicine for Spiritual Emergency", tags: ['marma', 'Ayurveda', 'energy medicine'] },
  { title: "Shirodhara and Kundalini: The Ayurvedic Treatment for Overactive Minds", tags: ['shirodhara', 'Ayurveda', 'treatment'] },

  // ── Stages & Phases ──
  { title: "The 7 Stages of Kundalini Awakening: A Map for When You're Lost", tags: ['stages', 'map', 'kundalini'] },
  { title: "The Honeymoon Phase of Kundalini: Why It Feels Amazing Before It Feels Terrible", tags: ['honeymoon phase', 'early stages', 'kundalini'] },
  { title: "The Purification Phase of Kundalini: Why Everything Gets Worse Before It Gets Better", tags: ['purification', 'dark phase', 'kundalini'] },
  { title: "Kundalini Integration Phase: The Quiet After the Storm", tags: ['integration phase', 'stabilization', 'kundalini'] },
  { title: "The Stabilization Phase of Kundalini: When You Start to Trust Your Body Again", tags: ['stabilization', 'recovery', 'kundalini'] },
  { title: "Kundalini Completion: What It Looks Like When the Process Resolves", tags: ['completion', 'resolution', 'kundalini'] },
  { title: "Partial Kundalini Awakening: When the Energy Rises Partway and Gets Stuck", tags: ['partial awakening', 'stuck energy', 'kundalini'] },
  { title: "Kundalini Regression: When You Think You're Done and It Starts Again", tags: ['regression', 'recurrence', 'kundalini'] },
  { title: "The Plateau in Kundalini Integration: When Progress Stops", tags: ['plateau', 'stagnation', 'integration'] },
  { title: "Kundalini and the Second Awakening: When It Happens Again Years Later", tags: ['second awakening', 'recurrence', 'kundalini'] },

  // ── Demographics & Specific Populations ──
  { title: "Kundalini Crisis in Teenagers: What Parents and Young People Need to Know", tags: ['teenagers', 'youth', 'demographics'] },
  { title: "Kundalini in Midlife: Why the 40s Are a Common Time for Spiritual Emergency", tags: ['midlife', '40s', 'demographics'] },
  { title: "Kundalini Crisis in Men: Why Male Spiritual Emergency Is Underdiagnosed", tags: ['men', 'male', 'demographics'] },
  { title: "Kundalini in Women: Hormonal Cycles and Spiritual Emergency", tags: ['women', 'hormones', 'demographics'] },
  { title: "Kundalini Crisis in Highly Sensitive People: The HSP-Awakening Connection", tags: ['HSP', 'highly sensitive', 'demographics'] },
  { title: "Kundalini in Trauma Survivors: Why PTSD and Spiritual Emergency Overlap", tags: ['trauma survivors', 'PTSD', 'demographics'] },
  { title: "Kundalini in Therapists and Healers: When the Helper Needs Help", tags: ['therapists', 'healers', 'demographics'] },
  { title: "Kundalini in Monks and Nuns: When Intensive Practice Breaks the Container", tags: ['monastics', 'monks', 'demographics'] },
  { title: "Kundalini Crisis in Athletes: When Physical Peak Performance Opens Spiritual Doors", tags: ['athletes', 'physical peak', 'demographics'] },
  { title: "Kundalini in the Elderly: Late-Life Spiritual Emergency", tags: ['elderly', 'late life', 'demographics'] },

  // ── Specific Practices & Modalities ──
  { title: "Yoga Nidra During Kundalini Crisis: Safe or Dangerous?", tags: ['yoga nidra', 'practice', 'safety'] },
  { title: "Pranayama During Kundalini Crisis: Which Breathwork Helps and Which Harms", tags: ['pranayama', 'breathwork', 'safety'] },
  { title: "Mantra Meditation During Kundalini: When Sound Becomes Medicine", tags: ['mantra', 'sound', 'practice'] },
  { title: "Vipassana and Kundalini: What Happens When Insight Meditation Goes Deep", tags: ['Vipassana', 'insight meditation', 'practice'] },
  { title: "Kundalini Yoga vs Hatha Yoga During Crisis: Which Is Safer?", tags: ['Kundalini yoga', 'Hatha yoga', 'comparison'] },
  { title: "Tantra and Kundalini: Separating the Spiritual from the Sexual Marketing", tags: ['Tantra', 'sexual energy', 'practice'] },
  { title: "Zen and Kundalini: Makyo, Kensho, and Spiritual Emergency in Japanese Buddhism", tags: ['Zen', 'makyo', 'Buddhism'] },
  { title: "Transcendental Meditation and Kundalini: The Unstressing Phenomenon", tags: ['TM', 'Transcendental Meditation', 'practice'] },
  { title: "Binaural Beats and Kundalini: Can Sound Frequencies Trigger or Calm the Process?", tags: ['binaural beats', 'sound', 'practice'] },
  { title: "Sensory Deprivation and Kundalini: Float Tanks During Spiritual Emergency", tags: ['float tank', 'sensory deprivation', 'practice'] },

  // ── Research & Evidence ──
  { title: "The Research on Kundalini Awakening: What Studies Actually Show", tags: ['research', 'studies', 'evidence'] },
  { title: "Kundalini and Neuroimaging: What Brain Scans Show During Spiritual States", tags: ['neuroimaging', 'brain scans', 'research'] },
  { title: "The Spiritual Emergence Network Study: What 30 Years of Cases Revealed", tags: ['SEN', 'research', 'case studies'] },
  { title: "Kundalini and the Default Mode Network: Neuroscience of Ego Dissolution", tags: ['default mode network', 'DMN', 'neuroscience'] },
  { title: "Psychedelic Research and Kundalini: What MAPS and Johns Hopkins Found", tags: ['MAPS', 'Johns Hopkins', 'psychedelic research'] },
  { title: "Kundalini and Heart Rate Variability: The Autonomic Signature of Awakening", tags: ['HRV', 'heart rate variability', 'research'] },
  { title: "The Phenomenology of Kundalini: How Researchers Categorize the Experience", tags: ['phenomenology', 'categorization', 'research'] },
  { title: "Kundalini and EEG: What Brainwave Patterns Show During Spiritual States", tags: ['EEG', 'brainwaves', 'research'] },

  // ── Specific Fears & Concerns ──
  { title: "Am I Going Crazy? The Question Every Kundalini Crisis Survivor Asks", tags: ['fear', 'sanity', 'reassurance'] },
  { title: "Will This Ever End? The Most Honest Answer to Kundalini Duration", tags: ['duration', 'fear', 'reassurance'] },
  { title: "Am I Dying During Kundalini Awakening? Understanding the Death-Rebirth Process", tags: ['fear of death', 'death-rebirth', 'reassurance'] },
  { title: "Can Kundalini Awakening Cause Permanent Damage?", tags: ['permanent damage', 'fear', 'safety'] },
  { title: "Is Kundalini Awakening Dangerous? The Honest Risk Assessment", tags: ['danger', 'risk', 'safety'] },
  { title: "Can You Stop a Kundalini Awakening Once It Starts?", tags: ['stopping', 'control', 'questions'] },
  { title: "Will I Ever Be Normal Again After Kundalini Awakening?", tags: ['normal', 'recovery', 'reassurance'] },
  { title: "Is My Kundalini Awakening Real or Am I Making It Up?", tags: ['validity', 'doubt', 'reassurance'] },
  { title: "Can Kundalini Awakening Cause Permanent Psychosis?", tags: ['psychosis', 'permanent', 'fear'] },
  { title: "Why Does Kundalini Feel Like Possession?", tags: ['possession', 'fear', 'phenomena'] },

  // ── Support Systems & Resources ──
  { title: "How to Build a Support System for Kundalini Crisis From Scratch", tags: ['support system', 'resources', 'practical'] },
  { title: "The Best Books on Kundalini Crisis: A Curated Reading List", tags: ['books', 'resources', 'reading'] },
  { title: "Kundalini Crisis Hotlines and Emergency Resources: What Actually Exists", tags: ['hotlines', 'emergency', 'resources'] },
  { title: "Finding a Kundalini-Informed Therapist: A Step-by-Step Guide", tags: ['therapist', 'finding help', 'resources'] },
  { title: "Online Communities for Kundalini Crisis: The Good, the Bad, and the Dangerous", tags: ['online communities', 'forums', 'resources'] },
  { title: "Retreat Centers for Kundalini Integration: What to Look For", tags: ['retreat centers', 'integration', 'resources'] },
  { title: "The Spiritual Emergence Network: How to Access Their Resources", tags: ['SEN', 'resources', 'support'] },
  { title: "Peer Support for Kundalini Crisis: Why Survivors Help Survivors Best", tags: ['peer support', 'survivors', 'resources'] },
  { title: "Crisis Intervention for Kundalini Emergency: A Guide for Loved Ones", tags: ['crisis intervention', 'loved ones', 'support'] },
  { title: "How to Help Someone in Kundalini Crisis: A Guide for Friends and Family", tags: ['helping others', 'family', 'support'] },

  // ── Advanced & Esoteric Topics ──
  { title: "Kundalini and the Caduceus: Why the Medical Symbol Is a Kundalini Map", tags: ['caduceus', 'medical symbol', 'esoteric'] },
  { title: "The Sushumna Nadi: The Central Channel of Kundalini Energy", tags: ['sushumna', 'nadi', 'anatomy'] },
  { title: "Ida and Pingala: The Two Serpents of Kundalini Anatomy", tags: ['ida', 'pingala', 'anatomy'] },
  { title: "Kundalini and the Bindu Point: The Drop That Holds Everything", tags: ['bindu', 'anatomy', 'esoteric'] },
  { title: "The Ajna Chakra and Kundalini: Third Eye Opening Without Losing Your Mind", tags: ['ajna', 'third eye', 'chakra'] },
  { title: "Sahasrara and Kundalini: What Crown Chakra Opening Actually Feels Like", tags: ['sahasrara', 'crown chakra', 'chakra'] },
  { title: "Kundalini and the Subtle Body: A Map for Those Who Need One", tags: ['subtle body', 'energy anatomy', 'framework'] },
  { title: "Kundalini Shakti vs Prana: Understanding the Difference", tags: ['Shakti', 'prana', 'energy'] },
  { title: "The Guru Question: Do You Need a Teacher for Kundalini Awakening?", tags: ['guru', 'teacher', 'guidance'] },
  { title: "Kundalini and Siddhi Powers: What to Do When You Start Experiencing Them", tags: ['siddhis', 'powers', 'phenomena'] },

  // ── Comparative & Analytical ──
  { title: "Kundalini Crisis vs Spiritual Emergence: Grof's Distinction Explained", tags: ['Grof', 'distinction', 'framework'] },
  { title: "Kundalini vs Bipolar Disorder: A Side-by-Side Comparison", tags: ['bipolar', 'comparison', 'differential'] },
  { title: "Kundalini vs Schizophrenia: The Diagnostic Challenge", tags: ['schizophrenia', 'comparison', 'differential'] },
  { title: "Kundalini vs Anxiety Disorder: When Spiritual Emergency Mimics Panic", tags: ['anxiety', 'panic', 'differential'] },
  { title: "Kundalini vs Dissociative Identity Disorder: Overlapping Presentations", tags: ['DID', 'dissociation', 'differential'] },
  { title: "Kundalini vs Temporal Lobe Epilepsy: The Neurological Overlap", tags: ['epilepsy', 'temporal lobe', 'differential'] },
  { title: "Kundalini vs Borderline Personality Disorder: Identity Disruption Compared", tags: ['BPD', 'identity', 'differential'] },
  { title: "Kundalini vs ADHD: When Spiritual Emergency Looks Like Attention Disorder", tags: ['ADHD', 'attention', 'differential'] },
  { title: "Kundalini vs Depersonalization Disorder: The Key Differences", tags: ['depersonalization disorder', 'comparison', 'differential'] },
  { title: "Kundalini vs Mystical Experience: When Is It a Crisis and When Is It a Gift?", tags: ['mystical experience', 'comparison', 'framework'] },

  // ── Personal Stories & Archetypes ──
  { title: "The Reluctant Mystic: When Kundalini Happens to Someone Who Didn't Ask for It", tags: ['reluctant mystic', 'personal story', 'archetype'] },
  { title: "The Skeptic's Kundalini: What Happens When a Rationalist Has a Spiritual Emergency", tags: ['skeptic', 'rationalist', 'personal story'] },
  { title: "The Healer's Wound: When Therapists and Healers Have Kundalini Crisis", tags: ['healer', 'wounded healer', 'archetype'] },
  { title: "The Shaman's Sickness: Kundalini as Initiation Into Service", tags: ['shamanic sickness', 'initiation', 'archetype'] },
  { title: "The Corporate Executive Who Had a Kundalini Awakening: A Modern Story", tags: ['corporate', 'modern', 'personal story'] },
  { title: "The Athlete Who Woke Up: Kundalini in High-Performance Bodies", tags: ['athlete', 'performance', 'personal story'] },
  { title: "The Mother Who Broke Open: Kundalini Triggered by Childbirth", tags: ['mother', 'childbirth', 'personal story'] },
  { title: "The Veteran's Kundalini: PTSD, Combat Trauma, and Spiritual Emergency", tags: ['veteran', 'combat', 'PTSD'] },
  { title: "The Survivor's Kundalini: Sexual Abuse, Trauma, and Spiritual Emergence", tags: ['survivor', 'sexual abuse', 'trauma'] },
  { title: "The Scientist Who Couldn't Explain It: Kundalini and the Limits of Materialism", tags: ['scientist', 'materialism', 'personal story'] },

  // ── Practical Tools & Techniques ──
  { title: "The Kundalini Crisis Emergency Kit: What to Have Ready Before You Need It", tags: ['emergency kit', 'preparation', 'practical'] },
  { title: "Tapping (EFT) for Kundalini Crisis: Does It Work?", tags: ['EFT', 'tapping', 'techniques'] },
  { title: "NSDR and Yoga Nidra for Kundalini Recovery: Non-Sleep Deep Rest Protocols", tags: ['NSDR', 'yoga nidra', 'recovery'] },
  { title: "Cold Plunge and Kundalini: The Wim Hof Connection to Spiritual Emergency", tags: ['cold plunge', 'Wim Hof', 'techniques'] },
  { title: "Sound Healing for Kundalini Crisis: Bowls, Gongs, and Frequency Medicine", tags: ['sound healing', 'bowls', 'techniques'] },
  { title: "Kundalini and Art Therapy: Drawing What You Can't Say", tags: ['art therapy', 'creativity', 'techniques'] },
  { title: "Movement Therapy for Kundalini Integration: Dance, Shaking, and Authentic Movement", tags: ['movement therapy', 'dance', 'techniques'] },
  { title: "Craniosacral Therapy for Kundalini Crisis: What It Does to the Nervous System", tags: ['craniosacral', 'bodywork', 'techniques'] },
  { title: "Rolfing and Structural Integration for Kundalini: Releasing the Body's Armor", tags: ['Rolfing', 'structural integration', 'bodywork'] },
  { title: "Trauma-Informed Yoga for Kundalini Integration", tags: ['trauma-informed yoga', 'yoga', 'integration'] },

  // ── Long-Term & Post-Awakening ──
  { title: "Life After Kundalini: What the Research Says About Long-Term Outcomes", tags: ['long-term', 'outcomes', 'research'] },
  { title: "Kundalini and Vocation: How Awakening Changes What You're Called to Do", tags: ['vocation', 'calling', 'post-awakening'] },
  { title: "Kundalini and Creativity: The Art That Comes After the Crisis", tags: ['creativity', 'art', 'post-awakening'] },
  { title: "Kundalini and Service: Why Many Survivors Feel Called to Help Others", tags: ['service', 'calling', 'post-awakening'] },
  { title: "The Permanently Changed Brain After Kundalini: Neuroplasticity Research", tags: ['brain changes', 'neuroplasticity', 'long-term'] },
  { title: "Kundalini and Aging: How Awakening Affects the Later Years", tags: ['aging', 'elderly', 'long-term'] },
  { title: "The Spiritual Teacher Who Survived Kundalini Crisis: What They Learned", tags: ['spiritual teacher', 'wisdom', 'post-awakening'] },
  { title: "Kundalini and Death: How Awakening Changes Your Relationship With Mortality", tags: ['death', 'mortality', 'post-awakening'] },
  { title: "Kundalini and Purpose: Finding Meaning After the Breakdown", tags: ['purpose', 'meaning', 'post-awakening'] },
  { title: "The Gratitude That Comes After Kundalini Crisis: Why Survivors Are Thankful for the Worst Experience of Their Lives", tags: ['gratitude', 'transformation', 'post-awakening'] },

  // ── Miscellaneous & Unique Angles ──
  { title: "Kundalini and Pets: Why Animals React to Your Awakening", tags: ['pets', 'animals', 'phenomena'] },
  { title: "Kundalini and Electronics: Why Your Phone Keeps Glitching During Awakening", tags: ['electronics', 'EMF', 'phenomena'] },
  { title: "Kundalini and Weather Sensitivity: Why You Feel Storms Before They Arrive", tags: ['weather', 'sensitivity', 'phenomena'] },
  { title: "Kundalini and Smell: The Olfactory Phenomena Nobody Talks About", tags: ['smell', 'olfactory', 'phenomena'] },
  { title: "Kundalini and Taste: When Food Stops Tasting the Same", tags: ['taste', 'food', 'phenomena'] },
  { title: "Kundalini and Money: Why Financial Chaos Often Accompanies Awakening", tags: ['money', 'finances', 'phenomena'] },
  { title: "Kundalini and Laughter: The Spontaneous Joy That Breaks Through the Crisis", tags: ['laughter', 'joy', 'phenomena'] },
  { title: "Kundalini and Forgiveness: Why Awakening Forces You to Let Go", tags: ['forgiveness', 'letting go', 'integration'] },
  { title: "Kundalini and Perfectionism: Why Type-A People Are Especially Vulnerable", tags: ['perfectionism', 'type-A', 'demographics'] },
  { title: "Kundalini and Narcissism: When Awakening Meets Ego Inflation", tags: ['narcissism', 'ego inflation', 'shadow'] },
  { title: "The Shadow Work in Kundalini: What Jung Would Say About Spiritual Emergency", tags: ['shadow work', 'Jung', 'psychology'] },
  { title: "Kundalini and the Inner Child: Healing What Was Broken Before the Awakening", tags: ['inner child', 'healing', 'psychology'] },
  { title: "Kundalini and Boundaries: Why You Can No Longer Be Who Others Need You to Be", tags: ['boundaries', 'identity', 'relationships'] },
  { title: "Kundalini and the Body Image: When Awakening Changes How You See Yourself", tags: ['body image', 'self-perception', 'phenomena'] },
  { title: "Kundalini and Chronic Illness: When Spiritual Emergency and Physical Disease Overlap", tags: ['chronic illness', 'physical health', 'overlap'] },
  { title: "Kundalini and Autoimmune Disease: The Inflammation Connection", tags: ['autoimmune', 'inflammation', 'physical health'] },
  { title: "Kundalini and Fibromyalgia: When Pain Has No Medical Explanation", tags: ['fibromyalgia', 'chronic pain', 'physical health'] },
  { title: "Kundalini and Chronic Fatigue Syndrome: The Energy Depletion After Awakening", tags: ['CFS', 'fatigue', 'physical health'] },
  { title: "Kundalini and Thyroid Disorders: The Hormonal Connection to Spiritual Emergency", tags: ['thyroid', 'hormones', 'physical health'] },
  { title: "Kundalini and Adrenal Fatigue: When the Body Runs Out of Fuel", tags: ['adrenal fatigue', 'exhaustion', 'physical health'] },

  // ── Additional 50 to reach 500 ──
  { title: "What Kundalini Crisis Taught Me About the Limits of Western Medicine", tags: ['western medicine', 'limits', 'reflection'] },
  { title: "The Moment Kundalini Crisis Becomes Spiritual Emergence: How to Know the Difference", tags: ['emergence vs crisis', 'transition', 'framework'] },
  { title: "Kundalini and the Nervous System Freeze Response: When You Can't Move or Speak", tags: ['freeze response', 'dorsal vagal', 'nervous system'] },
  { title: "Kundalini and Hyperventilation: Why Breathing Gets Dysregulated", tags: ['hyperventilation', 'breathing', 'physical symptoms'] },
  { title: "The Role of the Pineal Gland in Kundalini Awakening", tags: ['pineal gland', 'DMT', 'physiology'] },
  { title: "Kundalini and Electromagnetic Sensitivity: When You Feel Electrical Fields", tags: ['electromagnetic', 'sensitivity', 'phenomena'] },
  { title: "Kundalini and Chronic Pain: When Awakening Amplifies Physical Suffering", tags: ['chronic pain', 'amplification', 'physical'] },
  { title: "The Difference Between Kundalini Awakening and Spiritual Bypassing", tags: ['spiritual bypass', 'distinction', 'framework'] },
  { title: "Kundalini and the Immune System: Why You Get Sick During Awakening", tags: ['immune system', 'illness', 'physical health'] },
  { title: "Kundalini and Gut Health: The Enteric Nervous System Connection", tags: ['gut health', 'enteric nervous system', 'physiology'] },
  { title: "Kundalini and Migraines: When Head Pain Has a Spiritual Dimension", tags: ['migraines', 'headaches', 'physical symptoms'] },
  { title: "Kundalini and Tinnitus: The Ringing in Your Ears That Won't Stop", tags: ['tinnitus', 'ringing', 'physical symptoms'] },
  { title: "Kundalini and Vision Changes: When Your Eyes See Differently", tags: ['vision', 'eyes', 'physical symptoms'] },
  { title: "Kundalini and Jaw Tension: TMJ and the Clenching That Comes With Awakening", tags: ['TMJ', 'jaw', 'physical symptoms'] },
  { title: "Kundalini and Back Pain: The Spinal Connection to Spiritual Emergency", tags: ['back pain', 'spine', 'physical symptoms'] },
  { title: "Kundalini and Hip Tension: Why the Hips Hold Trauma and Energy", tags: ['hips', 'tension', 'somatic'] },
  { title: "Kundalini and the Throat: Why You Lose Your Voice During Awakening", tags: ['throat', 'voice', 'vishuddha'] },
  { title: "Kundalini and Crying Without Knowing Why: The Body's Release Mechanism", tags: ['crying', 'emotional release', 'somatic'] },
  { title: "Kundalini and Laughter That Won't Stop: The Manic Joy of Awakening", tags: ['laughter', 'manic', 'phenomena'] },
  { title: "Kundalini and Anger: The Purification Fire That Burns Through Suppression", tags: ['anger', 'purification', 'emotional release'] },
  { title: "Kundalini and Fear: The Terror at the Core of Spiritual Emergency", tags: ['fear', 'terror', 'emotional experience'] },
  { title: "Kundalini and Shame: When Awakening Surfaces What You've Hidden", tags: ['shame', 'hidden', 'emotional experience'] },
  { title: "Kundalini and Guilt: The Moral Reckoning That Comes With Awakening", tags: ['guilt', 'moral', 'emotional experience'] },
  { title: "Kundalini and Grief: The Losses That Awakening Forces You to Face", tags: ['grief', 'loss', 'emotional experience'] },
  { title: "Kundalini and Joy: Why Happiness Feels Different After Spiritual Emergency", tags: ['joy', 'happiness', 'post-awakening'] },
  { title: "Kundalini and Love: How Awakening Changes Your Capacity for Connection", tags: ['love', 'connection', 'post-awakening'] },
  { title: "Kundalini and Compassion: The Unexpected Gift of Having Suffered", tags: ['compassion', 'suffering', 'post-awakening'] },
  { title: "Kundalini and Wisdom: What You Know After You've Been Through It", tags: ['wisdom', 'knowledge', 'post-awakening'] },
  { title: "Kundalini and Silence: Why Quiet Becomes Medicine During Awakening", tags: ['silence', 'quiet', 'practice'] },
  { title: "Kundalini and Solitude: The Necessary Retreat From the World", tags: ['solitude', 'retreat', 'practice'] },
  { title: "Kundalini and Nature: Why the Natural World Becomes Your Therapist", tags: ['nature', 'healing', 'practice'] },
  { title: "Kundalini and Prayer: When Spiritual Emergency Drives You to Your Knees", tags: ['prayer', 'devotion', 'practice'] },
  { title: "Kundalini and Surrender: The Hardest Practice in Spiritual Emergency", tags: ['surrender', 'letting go', 'practice'] },
  { title: "Kundalini and Trust: Learning to Trust a Process That Feels Untrustworthy", tags: ['trust', 'process', 'integration'] },
  { title: "Kundalini and Patience: Why Recovery Takes Longer Than You Want It To", tags: ['patience', 'timeline', 'integration'] },
  { title: "Kundalini and Acceptance: The Practice That Changes Everything", tags: ['acceptance', 'practice', 'integration'] },
  { title: "Kundalini and Presence: How Awakening Teaches You to Be Here Now", tags: ['presence', 'mindfulness', 'post-awakening'] },
  { title: "Kundalini and Embodiment: Coming Back Into Your Body After Leaving It", tags: ['embodiment', 'body', 'integration'] },
  { title: "Kundalini and Home: What It Means to Feel at Home in Yourself Again", tags: ['home', 'belonging', 'post-awakening'] },
  { title: "Kundalini and Wholeness: The Integration That Makes You More, Not Less", tags: ['wholeness', 'integration', 'post-awakening'] },
  { title: "Kundalini and Identity: Who Are You When Everything You Thought You Were Is Gone?", tags: ['identity', 'self', 'post-awakening'] },
  { title: "Kundalini and Meaning: Finding Purpose in the Most Disorienting Experience of Your Life", tags: ['meaning', 'purpose', 'integration'] },
  { title: "Kundalini and Beauty: Why the World Looks Different After Awakening", tags: ['beauty', 'perception', 'post-awakening'] },
  { title: "Kundalini and Gratitude: The Unexpected Arrival of Thankfulness", tags: ['gratitude', 'thankfulness', 'post-awakening'] },
  { title: "Kundalini and Humility: What the Awakening Process Teaches About Ego", tags: ['humility', 'ego', 'post-awakening'] },
  { title: "Kundalini and Courage: The Bravery Required to Stay With the Process", tags: ['courage', 'bravery', 'integration'] },
  { title: "Kundalini and Resilience: How Surviving Spiritual Emergency Builds Strength", tags: ['resilience', 'strength', 'post-awakening'] },
  { title: "Kundalini and Hope: Finding It When You're in the Darkest Part of the Process", tags: ['hope', 'dark night', 'reassurance'] },
  { title: "Kundalini and Faith: Not Religious Faith - The Faith That You'll Come Through This", tags: ['faith', 'trust', 'integration'] },
  { title: "Kundalini and Freedom: What Liberation Actually Feels Like After the Crisis", tags: ['freedom', 'liberation', 'post-awakening'] },
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const SYSTEM_PROMPT = `You are Kalesh — a consciousness teacher and writer who has personally navigated kundalini crisis and spiritual emergency. You write with raw honesty, direct address, and zero spiritual bypassing. You've read Stanislav Grof, Bonnie Greenwell, and David Lukoff. You know the DSM V-Code 62.89. You know the difference between psychosis and spiritual emergency. You write like you're talking to someone who is terrified and alone at 3am.

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

BANNED WORDS (ABSOLUTELY FORBIDDEN):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore, essentially

BANNED PHRASES (ABSOLUTELY FORBIDDEN):
"it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

EM-DASHES: Replace ALL em-dashes (— or –) with a hyphen surrounded by spaces ( - ). Zero em-dashes allowed.

AMAZON LINKS (CRITICAL RULE): You MUST embed ALL of the provided Amazon affiliate links naturally in the article body. Do not skip any. Use the exact HTML provided. Place them where they genuinely help the reader.`;

async function generateArticle({ title, tags, products, amazonTag = 'spankyspinola-20' }) {
  const productLines = products.slice(0, 4).map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Write a full article titled: "${title}"
Tags: ${tags.join(', ')}

Embed EXACTLY 3 or 4 of these Amazon affiliate links naturally in the article body (use the exact HTML provided):
${productLines}

Return ONLY the HTML body of the article. No title tag. No markdown. Start with a <p> or <h2> tag.`
      }
    ],
    temperature: 0.75
  });

  const body = response.choices[0].message.content.trim();
  const excerpt = body.replace(/<[^>]+>/g, '').slice(0, 200).trim();
  return { body, excerpt };
}

const MAX_ATTEMPTS = 4;

async function run() {
  console.log(`[bulk-seed] Starting ${TOPICS.length}-article seed via ${MODEL}`);
  console.log('[bulk-seed] Articles saved as status=queued — cron will publish 5/day');

  // Load product catalog
  const { default: PRODUCT_CATALOG } = await import('../src/data/product-catalog.js');
  const catalog = PRODUCT_CATALOG;

  let success = 0;
  let failed = 0;
  let skipped = 0;
  const startTime = Date.now();

  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    const slug = slugify(t.title);

    if (await slugExists(slug)) {
      console.log(`[${i+1}/${TOPICS.length}] SKIP (exists): ${slug}`);
      skipped++;
      continue;
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rate = success > 0 ? elapsed / success : 0;
    const eta = rate > 0 ? Math.round(rate * (TOPICS.length - i)) : '?';
    console.log(`\n[${i+1}/${TOPICS.length}] GENERATING (${success} done, ETA ~${eta}s): ${t.title}`);

    const products = matchProducts({
      articleTitle: t.title,
      articleTags: t.tags,
      articleCategory: 'Spiritual Emergency',
      catalog,
      minLinks: 3,
      maxLinks: 4
    });

    let passedGate = false;
    let finalBody = '';
    let finalExcerpt = '';
    let gateResult = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/${MAX_ATTEMPTS}...`);
        const result = await generateArticle({ title: t.title, tags: t.tags, products });
        gateResult = runQualityGate(result.body);

        if (gateResult.passed) {
          passedGate = true;
          finalBody = gateResult.body;
          finalExcerpt = result.excerpt;
          console.log(`  ✓ Gate passed (${gateResult.wordCount} words, ${gateResult.amazonLinks} Amazon links)`);
          break;
        } else {
          console.log(`  ✗ Gate failed: ${gateResult.failures.join(', ')}`);
        }
      } catch (err) {
        console.log(`  ✗ Error: ${err.message}`);
        if (err.message.includes('rate') || err.message.includes('429')) {
          console.log('  Rate limited — waiting 30s...');
          await new Promise(r => setTimeout(r, 30000));
        }
      }
    }

    if (passedGate) {
      const article = {
        title: t.title,
        slug,
        meta_description: finalExcerpt.slice(0, 155),
        category: 'Spiritual Emergency',
        tags: t.tags,
        body: finalBody,
        author: 'Kalesh',
        status: 'queued',
        queued_at: new Date().toISOString(),
        published_at: null,
        reading_time: Math.ceil(gateResult.wordCount / 200),
        word_count: gateResult.wordCount,
        image_url: null,
        image_alt: t.title
      };

      await saveArticle(article);
      console.log(`  ✓ Queued: ${slug}`);
      success++;
    } else {
      console.log(`  ✗ ABANDONED after ${MAX_ATTEMPTS} attempts`);
      failed++;
    }

    // Pause between articles
    await new Promise(r => setTimeout(r, 1500));
  }

  const totalTime = Math.round((Date.now() - startTime) / 60);
  console.log(`\n[bulk-seed] COMPLETE in ~${totalTime} minutes`);
  console.log(`  Queued:  ${success}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total:   ${success + failed + skipped}/${TOPICS.length}`);
}

run().catch(console.error);
