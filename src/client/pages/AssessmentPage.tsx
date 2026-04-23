import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How long have you been experiencing these symptoms or changes?",
    category: "duration",
    options: [
      { value: 1, label: "Less than a week" },
      { value: 2, label: "1-4 weeks" },
      { value: 3, label: "1-6 months" },
      { value: 4, label: "More than 6 months" },
    ]
  },
  {
    id: 2,
    text: "Are you experiencing physical sensations you can't explain — heat, electricity, tremors, pressure in the head or spine?",
    category: "somatic",
    options: [
      { value: 0, label: "No, nothing like that" },
      { value: 1, label: "Mild, occasional" },
      { value: 2, label: "Moderate, fairly frequent" },
      { value: 3, label: "Intense, hard to ignore" },
    ]
  },
  {
    id: 3,
    text: "Did these experiences begin or intensify after a spiritual practice, plant medicine, breathwork, or meditation retreat?",
    category: "trigger",
    options: [
      { value: 0, label: "No clear connection" },
      { value: 1, label: "Maybe, but I'm not sure" },
      { value: 2, label: "Yes, there's a clear connection" },
      { value: 3, label: "Yes, it started immediately after" },
    ]
  },
  {
    id: 4,
    text: "Are you experiencing episodes where you feel detached from your body or like reality isn't real?",
    category: "dissociation",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Occasionally" },
      { value: 2, label: "Frequently" },
      { value: 3, label: "Almost constantly" },
    ]
  },
  {
    id: 5,
    text: "How is your sleep?",
    category: "sleep",
    options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "Slightly disrupted" },
      { value: 2, label: "Significantly disrupted — waking at 3-4am, vivid dreams" },
      { value: 3, label: "Barely sleeping, or sleeping too much" },
    ]
  },
  {
    id: 6,
    text: "Are you experiencing unusual perceptions — seeing light, hearing sounds, feeling presences, or having visions?",
    category: "perception",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Rarely, and they feel benign" },
      { value: 2, label: "Sometimes, and they're disorienting" },
      { value: 3, label: "Frequently, and they're frightening" },
    ]
  },
  {
    id: 7,
    text: "Do you feel like you understand something fundamental about reality that others don't see?",
    category: "insight",
    options: [
      { value: 0, label: "No, not particularly" },
      { value: 1, label: "I've had some unusual insights" },
      { value: 2, label: "Yes, and it's hard to relate to people" },
      { value: 3, label: "Yes, and it feels urgent or mission-like" },
    ]
  },
  {
    id: 8,
    text: "How are your relationships and daily functioning?",
    category: "functioning",
    options: [
      { value: 0, label: "Mostly normal" },
      { value: 1, label: "Somewhat strained" },
      { value: 2, label: "Significantly impaired" },
      { value: 3, label: "I can barely function" },
    ]
  },
  {
    id: 9,
    text: "Have you had any thoughts of harming yourself or others?",
    category: "safety",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Passive thoughts (wishing I wasn't here)" },
      { value: 2, label: "Active thoughts without plan" },
      { value: 3, label: "Active thoughts with plan or intent" },
    ]
  },
  {
    id: 10,
    text: "Do your experiences feel like they have meaning or purpose, even when they're difficult?",
    category: "meaning",
    options: [
      { value: 3, label: "No, it just feels like suffering" },
      { value: 2, label: "Sometimes, but mostly it's chaos" },
      { value: 1, label: "Yes, there's a sense of something unfolding" },
      { value: 0, label: "Yes, strongly — this feels like a transformation" },
    ]
  },
  {
    id: 11,
    text: "Have you been evaluated by a mental health professional?",
    category: "professional",
    options: [
      { value: 0, label: "Yes, and they found nothing concerning" },
      { value: 1, label: "Yes, but I don't think they understood what I'm experiencing" },
      { value: 2, label: "No, I haven't sought help" },
      { value: 3, label: "I'm afraid to — I don't want to be hospitalized" },
    ]
  },
  {
    id: 12,
    text: "What's your gut sense about what's happening to you?",
    category: "intuition",
    options: [
      { value: 0, label: "I think I'm having a mental health crisis" },
      { value: 1, label: "I'm not sure — could be either" },
      { value: 2, label: "I think this is spiritual, but I need support" },
      { value: 3, label: "I know this is spiritual, but it's overwhelming" },
    ]
  },
];

interface Result {
  level: string;
  title: string;
  description: string;
  recommendations: string[];
  color: string;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
}

function getResult(score: number, safetyScore: number): Result {
  if (safetyScore >= 2) {
    return {
      level: 'Immediate Support Needed',
      title: 'Please Reach Out Now',
      description: "Your responses indicate you may be having thoughts of self-harm. This is serious and needs immediate attention. Spiritual emergency can co-occur with mental health crises that require professional care.",
      recommendations: [
        "Call or text 988 (Suicide & Crisis Lifeline) right now",
        "Go to your nearest emergency room if you feel unsafe",
        "Call a trusted person and tell them what you're experiencing",
        "Do not be alone right now"
      ],
      color: '#E05555',
      urgency: 'crisis'
    };
  }

  if (score <= 8) {
    return {
      level: 'Mild Emergence',
      title: 'Early Signs of Awakening',
      description: "You're noticing changes, but they're manageable. This could be the beginning of a spiritual opening, or a period of natural growth and sensitivity. You don't need crisis support, but grounding and self-care matter now.",
      recommendations: [
        "Establish a grounding practice (walking, cold water, physical exercise)",
        "Reduce or pause intense spiritual practices temporarily",
        "Read about spiritual emergence to understand what may be happening",
        "Connect with others who understand this territory"
      ],
      color: '#4CAF50',
      urgency: 'low'
    };
  }

  if (score <= 18) {
    return {
      level: 'Moderate Spiritual Emergency',
      title: 'You Need Support',
      description: "What you're experiencing is real, significant, and has a name. This is spiritual emergency territory. You're not crazy. But you do need support — from someone who understands both the spiritual and psychological dimensions.",
      recommendations: [
        "Find a therapist familiar with spiritual emergency (search Spiritual Emergence Network)",
        "Implement daily grounding practices — weighted blankets, cold showers, physical movement",
        "Reduce or stop intensive spiritual practices until stable",
        "Consider magnesium glycinate and L-theanine for nervous system support",
        "Read Stanislav Grof's work on spiritual emergency"
      ],
      color: '#E8A838',
      urgency: 'medium'
    };
  }

  return {
    level: 'Acute Spiritual Emergency',
    title: 'This Is Serious — Get Support Now',
    description: "You're in the thick of it. This level of intensity needs professional support — ideally from someone who understands spiritual emergency and won't pathologize your experience. You also need to rule out any medical or psychiatric conditions that need treatment.",
    recommendations: [
      "See a mental health professional immediately — tell them everything",
      "Contact the Spiritual Emergence Network for referrals",
      "Do not do any spiritual practice right now — your system is overwhelmed",
      "Focus entirely on grounding: food, sleep, physical contact with earth",
      "Tell someone you trust what's happening — isolation makes this worse",
      "Consider whether medication might help stabilize you temporarily"
    ],
    color: '#E05555',
    urgency: 'high'
  };
}

export function AssessmentPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleAnswer = (questionId: number, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300);
    } else {
      // Calculate result
      const total = Object.values(newAnswers).reduce((sum, v) => sum + v, 0);
      const safetyQ = QUESTIONS.find(q => q.category === 'safety');
      const safetyScore = safetyQ ? (newAnswers[safetyQ.id] || 0) : 0;
      setResult(getResult(total, safetyScore));
      setCompleted(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers({});
    setCompleted(false);
    setResult(null);
  };

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <div className="assessment-page">
      <div className="page-hero">
        <div className="container">
          <h1>Spiritual Emergency Assessment</h1>
          <p>12 questions. Honest answers. No email required. This isn't a diagnosis — it's a compass.</p>
        </div>
      </div>

      <div className="container">
        <div className="assessment-container">
          {!completed ? (
            <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-label">
                Question {currentQ + 1} of {QUESTIONS.length}
              </div>

              <div className="question-card">
                <div className="question-category">{QUESTIONS[currentQ].category}</div>
                <h2 className="question-text">{QUESTIONS[currentQ].text}</h2>
                <div className="options-list">
                  {QUESTIONS[currentQ].options.map(option => (
                    <button
                      key={option.value}
                      className={`option-btn${answers[QUESTIONS[currentQ].id] === option.value ? ' selected' : ''}`}
                      onClick={() => handleAnswer(QUESTIONS[currentQ].id, option.value)}
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
              <div className="result-level" style={{ color: result.color }}>{result.level}</div>
              <h2 className="result-title">{result.title}</h2>
              <p className="result-description">{result.description}</p>

              {result.urgency === 'crisis' && (
                <div className="crisis-banner">
                  <a href="tel:988" className="crisis-call-btn">📞 Call or Text 988 Now</a>
                </div>
              )}

              <div className="recommendations">
                <h3>What to do now:</h3>
                <ul>
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="result-disclaimer">
                <p>This assessment is for educational purposes only. It is not a medical or psychiatric diagnosis. If you're in crisis, please contact a mental health professional or call 988.</p>
              </div>

              <div className="result-actions">
                <Link to="/articles" className="btn btn-primary">Read the Articles</Link>
                <Link to="/tools" className="btn btn-ghost">Emergence Toolkit</Link>
                <button className="btn btn-ghost" onClick={restart}>Retake Assessment</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .assessment-page { padding-bottom: 4rem; }
        .page-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-hero h1 { margin-bottom: 0.75rem; }
        .page-hero p { color: var(--text-secondary); font-size: 1.1rem; }
        .assessment-container {
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
        .question-category {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: 1rem;
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
        .option-btn.selected {
          color: var(--text-primary);
          border-color: var(--accent);
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
        .result-level {
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
        .crisis-banner {
          margin: 1.5rem 0;
        }
        .crisis-call-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-ui);
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          background: var(--danger);
          padding: 1rem 2rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background var(--transition-fast);
        }
        .crisis-call-btn:hover {
          background: #FF6666;
          text-decoration: none;
          color: white;
        }
        .recommendations {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .recommendations h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-top: 0;
          margin-bottom: 1rem;
        }
        .recommendations ul {
          margin: 0;
          padding-left: 1.25rem;
        }
        .recommendations li {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 0.6rem;
          line-height: 1.5;
        }
        .result-disclaimer {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(232, 168, 56, 0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          margin: 1.5rem 0;
        }
        .result-disclaimer p { margin: 0; }
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
