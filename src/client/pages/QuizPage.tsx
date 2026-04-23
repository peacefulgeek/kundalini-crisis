import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface QuizQuestion {
  id: number;
  text: string;
  options: { label: string; stage: string }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "What best describes your current experience?",
    options: [
      { label: "Everything feels like it's falling apart and I don't know why", stage: "onset" },
      { label: "I'm in the middle of it — intense, disorienting, overwhelming", stage: "acute" },
      { label: "The worst seems to have passed, but I'm trying to make sense of it", stage: "integration" },
      { label: "I've come through something major and I'm rebuilding my life", stage: "post" },
    ]
  },
  {
    id: 2,
    text: "How do you feel about your spiritual practice right now?",
    options: [
      { label: "I've stopped everything — it feels dangerous", stage: "acute" },
      { label: "I'm questioning whether I should have started", stage: "onset" },
      { label: "I'm slowly returning to gentle practices", stage: "integration" },
      { label: "I have a completely different relationship with practice now", stage: "post" },
    ]
  },
  {
    id: 3,
    text: "How are you sleeping?",
    options: [
      { label: "Barely at all — waking at 3am, vivid dreams, energy surges at night", stage: "acute" },
      { label: "Disrupted but improving", stage: "integration" },
      { label: "Starting to normalize", stage: "post" },
      { label: "Newly disrupted — this is recent", stage: "onset" },
    ]
  },
  {
    id: 4,
    text: "What's your relationship with other people like?",
    options: [
      { label: "I feel completely isolated — no one understands", stage: "acute" },
      { label: "I'm starting to find others who get it", stage: "integration" },
      { label: "I've rebuilt my social world around people who understand", stage: "post" },
      { label: "I'm withdrawing but still connected", stage: "onset" },
    ]
  },
  {
    id: 5,
    text: "What do you most need right now?",
    options: [
      { label: "Someone to tell me what's happening and that I'm not crazy", stage: "onset" },
      { label: "Immediate stabilization — grounding, safety, stop the spinning", stage: "acute" },
      { label: "Help making meaning of what happened", stage: "integration" },
      { label: "Community and a way to use what I've learned", stage: "post" },
    ]
  },
];

interface StageResult {
  stage: string;
  title: string;
  description: string;
  keyNeeds: string[];
  articles: { title: string; slug: string }[];
  color: string;
}

const STAGE_RESULTS: Record<string, StageResult> = {
  onset: {
    stage: 'Stage 1: The Onset',
    title: 'Something Is Shifting',
    description: "You're at the beginning. Things are changing and you don't have a framework for it yet. The disorientation is real. The fear is real. And the most important thing right now is information — understanding what might be happening so you can stop being terrified of it.",
    keyNeeds: [
      "A framework for understanding spiritual emergency",
      "Reassurance that this has happened to others",
      "Basic grounding practices",
      "Someone to talk to who won't pathologize you"
    ],
    articles: [
      { title: "Spiritual Emergency vs. Mental Illness: How to Tell the Difference", slug: "spiritual-emergency-vs-mental-illness-how-to-tell-the-difference" },
      { title: "What Is a Kundalini Crisis? (And Why Nobody Warned You)", slug: "what-is-a-kundalini-crisis-and-why-nobody-warned-you" },
      { title: "Why Your Friends and Family Think You're Losing It", slug: "why-your-friends-and-family-think-youre-losing-it" },
    ],
    color: '#6B3FA0'
  },
  acute: {
    stage: 'Stage 2: The Acute Phase',
    title: 'In the Eye of the Storm',
    description: "You're in it. This is the most intense phase — the one that feels like it might never end. It will. But right now, the only goal is stabilization. Not insight. Not growth. Just getting through the day with your nervous system intact.",
    keyNeeds: [
      "Immediate grounding and stabilization",
      "Reduction or cessation of all spiritual practice",
      "Professional support from someone who understands this",
      "Physical support: food, sleep, movement, earthing"
    ],
    articles: [
      { title: "Emergency Grounding Practices When Awakening Gets Too Intense", slug: "emergency-grounding-practices-when-awakening-gets-too-intense" },
      { title: "The Somatic Experience of Spiritual Awakening", slug: "the-somatic-experience-of-spiritual-awakening-tremors-heat-involuntary-movement" },
      { title: "When to Go to the Emergency Room (And When Not To)", slug: "when-to-go-to-the-emergency-room-and-when-not-to" },
    ],
    color: '#E05555'
  },
  integration: {
    stage: 'Stage 3: Integration',
    title: 'Making Sense of It',
    description: "The acute phase has passed, but you're left with a lot of pieces that don't fit together yet. Integration is the long, unglamorous work of rebuilding — your identity, your relationships, your relationship with reality. It takes longer than anyone tells you.",
    keyNeeds: [
      "Meaning-making and narrative",
      "Community with others who've been through it",
      "Slow return to practice on your own terms",
      "Ongoing somatic and nervous system support"
    ],
    articles: [
      { title: "Integration After Spiritual Emergency: The Long Road Back", slug: "integration-after-spiritual-emergency-the-long-road-back" },
      { title: "How to Journal Your Way Through Spiritual Emergency", slug: "how-to-journal-your-way-through-spiritual-emergency" },
      { title: "Post-Awakening Depression: When the Fireworks End and You're Still Here", slug: "post-awakening-depression-when-the-fireworks-end-and-youre-still-here" },
    ],
    color: '#E8A838'
  },
  post: {
    stage: 'Stage 4: The Other Side',
    title: 'Emerged',
    description: "You've come through. Not unchanged — that's the point. You're building a new life with a new understanding of what you are and what reality is. This stage has its own challenges: isolation, the difficulty of relating to people who haven't been through it, and the question of what to do with what you now know.",
    keyNeeds: [
      "Community of others who've emerged",
      "Ways to use your experience in service",
      "Continued integration of the deepest layers",
      "A sustainable spiritual practice"
    ],
    articles: [
      { title: "The Other Side: What Life Looks Like After Spiritual Emergency", slug: "the-other-side-what-life-looks-like-after-spiritual-emergency" },
      { title: "The Role of Community (And Why Isolation Makes Everything Worse)", slug: "the-role-of-community-and-why-isolation-makes-everything-worse" },
      { title: "The Difference Between Spiritual Emergency and Spiritual Bypassing", slug: "the-difference-between-spiritual-emergency-and-spiritual-bypassing" },
    ],
    color: '#4CAF50'
  }
};

export function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<StageResult | null>(null);

  const handleAnswer = (stage: string) => {
    const newCounts = { ...stageCounts, [stage]: (stageCounts[stage] || 0) + 1 };
    setStageCounts(newCounts);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300);
    } else {
      // Find dominant stage
      const dominant = Object.entries(newCounts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(STAGE_RESULTS[dominant]);
      setCompleted(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setStageCounts({});
    setCompleted(false);
    setResult(null);
  };

  const progress = (currentQ / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="quiz-page">
      <div className="page-hero">
        <div className="container">
          <h1>What Stage Are You In?</h1>
          <p>5 questions to help you understand where you are in the process — and what you actually need right now.</p>
        </div>
      </div>

      <div className="container">
        <div className="quiz-container">
          {!completed ? (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-label">
                Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
              </div>

              <div className="question-card">
                <h2 className="question-text">{QUIZ_QUESTIONS[currentQ].text}</h2>
                <div className="options-list">
                  {QUIZ_QUESTIONS[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      className="option-btn"
                      onClick={() => handleAnswer(option.stage)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {currentQ > 0 && (
                <button className="back-btn" onClick={() => setCurrentQ(q => q - 1)}>
                  ← Back
                </button>
              )}
            </>
          ) : result ? (
            <div className="result-card" style={{ borderColor: result.color }}>
              <div className="result-stage" style={{ color: result.color }}>{result.stage}</div>
              <h2 className="result-title">{result.title}</h2>
              <p className="result-description">{result.description}</p>

              <div className="key-needs">
                <h3>What you need right now:</h3>
                <ul>
                  {result.keyNeeds.map((need, i) => (
                    <li key={i}>{need}</li>
                  ))}
                </ul>
              </div>

              <div className="recommended-articles">
                <h3>Articles for your stage:</h3>
                <div className="article-links">
                  {result.articles.map((article, i) => (
                    <Link key={i} to={`/articles/${article.slug}`} className="article-link-card">
                      {article.title} →
                    </Link>
                  ))}
                </div>
              </div>

              <div className="result-actions">
                <Link to="/assessment" className="btn btn-primary">Take Full Assessment</Link>
                <Link to="/tools" className="btn btn-ghost">Emergence Toolkit</Link>
                <button className="btn btn-ghost" onClick={restart}>Retake Quiz</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .quiz-page { padding-bottom: 4rem; }
        .page-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-hero h1 { margin-bottom: 0.75rem; }
        .page-hero p { color: var(--text-secondary); font-size: 1.1rem; }
        .quiz-container {
          max-width: 680px;
          margin: 0 auto;
        }
        .progress-bar {
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          margin-bottom: 0.5rem;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--violet), var(--accent));
          border-radius: 2px;
          transition: width var(--transition-base);
        }
        .progress-label {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          text-align: right;
        }
        .question-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          margin-bottom: 1.5rem;
        }
        .question-text {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 2rem;
          margin-top: 0;
          line-height: 1.4;
        }
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .option-btn {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
          line-height: 1.4;
        }
        .option-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-accent);
          background: var(--accent-glow);
        }
        .back-btn {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          transition: color var(--transition-fast);
        }
        .back-btn:hover { color: var(--text-primary); }
        .result-card {
          background: var(--bg-secondary);
          border: 2px solid;
          border-radius: var(--radius-xl);
          padding: 2.5rem;
        }
        .result-stage {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 0.75rem;
        }
        .result-title {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          margin-top: 0;
        }
        .result-description {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .key-needs {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .key-needs h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-top: 0;
          margin-bottom: 1rem;
        }
        .key-needs ul {
          margin: 0;
          padding-left: 1.25rem;
        }
        .key-needs li {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }
        .recommended-articles {
          margin: 1.5rem 0;
        }
        .recommended-articles h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .article-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .article-link-card {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--accent);
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .article-link-card:hover {
          border-color: var(--border-accent);
          background: var(--accent-glow);
          text-decoration: none;
          color: var(--accent-soft);
        }
        .result-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
