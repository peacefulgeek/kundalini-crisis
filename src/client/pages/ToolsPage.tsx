import React from 'react';
import { Link } from 'react-router-dom';

interface Product {
  asin: string;
  name: string;
  description: string;
  category: string;
  why: string;
}

const TOOLKIT_PRODUCTS: Product[] = [
  {
    asin: '0874776317',
    name: 'The Stormy Search for the Self',
    description: 'By Stanislav & Christina Grof. The foundational text on spiritual emergency. If you read one book, make it this one.',
    category: 'Essential Reading',
    why: 'Grof coined the term spiritual emergency. This book will give you a framework for everything you\'re experiencing.'
  },
  {
    asin: '1591799449',
    name: 'When Spirit Leaps',
    description: 'By Bonnie Greenwell. The most practical guide to kundalini awakening and its physical symptoms.',
    category: 'Essential Reading',
    why: 'Greenwell is a therapist who has worked with hundreds of people in kundalini crisis. Her maps are accurate.'
  },
  {
    asin: '0892815191',
    name: 'Psychosynthesis',
    description: 'By Roberto Assagioli. The psychological framework that takes spiritual experience seriously.',
    category: 'Essential Reading',
    why: 'Assagioli understood that spiritual crises are real and require a different approach than standard therapy.'
  },
  {
    asin: 'B07D6YWPWJ',
    name: 'Weighted Blanket 15 lbs',
    description: 'Deep pressure stimulation for nervous system regulation. One of the most effective grounding tools during acute phases.',
    category: 'Grounding',
    why: 'When your nervous system is in overdrive, deep pressure is one of the fastest ways to bring it down.'
  },
  {
    asin: 'B07GZJZ7X5',
    name: 'Earthing Sheet Set',
    description: 'Grounding sheets that connect you to the earth\'s electrical field while you sleep.',
    category: 'Grounding',
    why: 'Earthing has measurable effects on cortisol and inflammation. During spiritual emergency, sleep is critical.'
  },
  {
    asin: 'B07YWZQJPX',
    name: 'Acupressure Mat',
    description: 'Stimulates acupressure points, promotes endorphin release, and grounds energy in the body.',
    category: 'Somatic',
    why: 'When energy is stuck in the head, you need to bring it down into the body. This works.'
  },
  {
    asin: 'B00YQXPFXS',
    name: 'Magnesium Glycinate',
    description: 'The most bioavailable form of magnesium. Essential for nervous system regulation and sleep.',
    category: 'Nervous System Support',
    why: 'Most people in spiritual emergency are severely depleted in magnesium. This is the first supplement to try.'
  },
  {
    asin: 'B07BKQXPFX',
    name: 'L-Theanine 200mg',
    description: 'Amino acid found in green tea. Promotes calm without sedation. Safe and effective.',
    category: 'Nervous System Support',
    why: 'L-theanine takes the edge off anxiety without dulling consciousness. Useful during acute phases.'
  },
  {
    asin: 'B08BDZQJPX',
    name: 'White Noise Machine',
    description: '20 unique sounds for sleep support. When your mind won\'t stop at 3am, sound can help.',
    category: 'Sleep',
    why: 'Sleep disruption is one of the most dangerous aspects of spiritual emergency. Protect your sleep.'
  },
  {
    asin: 'B07D6YWPWJ',
    name: 'Manta Sleep Mask',
    description: '100% blackout eye mask. Complete darkness is essential for melatonin production.',
    category: 'Sleep',
    why: 'Light disrupts sleep. During spiritual emergency, you need every advantage you can get.'
  },
  {
    asin: 'B07GZJZ7X5',
    name: 'Tibetan Singing Bowl Set',
    description: 'Handcrafted singing bowls for sound healing and grounding meditation.',
    category: 'Gentle Practice',
    why: 'Sound is grounding. Unlike visualization or breathwork, singing bowls work with the body, not against it.'
  },
  {
    asin: 'B07YWZQJPX',
    name: 'Zafu Meditation Cushion',
    description: 'Buckwheat-filled cushion for supported sitting. When you return to practice, do it right.',
    category: 'Gentle Practice',
    why: 'When you\'re ready to return to practice, physical support matters. Don\'t meditate on the floor.'
  },
];

const CATEGORIES = ['Essential Reading', 'Grounding', 'Somatic', 'Nervous System Support', 'Sleep', 'Gentle Practice'];

export function ToolsPage() {
  return (
    <div className="tools-page">
      <div className="page-hero">
        <div className="container">
          <h1>Emergence Toolkit</h1>
          <p>
            The tools that actually help during spiritual emergency. Not crystals and affirmations. Books, grounding tools, nervous system support, and sleep aids — the things that work when you're in the middle of it.
          </p>
          <p className="disclaimer">
            As an Amazon Associate, I earn from qualifying purchases. I only recommend things I'd actually use.
          </p>
        </div>
      </div>

      <div className="container">
        {CATEGORIES.map(category => {
          const products = TOOLKIT_PRODUCTS.filter(p => p.category === category);
          if (products.length === 0) return null;
          return (
            <section key={category} className="toolkit-section">
              <h2 className="category-title">{category}</h2>
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.asin} className="product-card">
                    <div className="product-category-badge">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-why">
                      <span className="why-label">Why it helps:</span>
                      <span className="why-text">{product.why}</span>
                    </div>
                    <a
                      href={`https://www.amazon.com/dp/${product.asin}?tag=spankyspinola-20`}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="product-link"
                    >
                      View on Amazon <span className="paid-link">(paid link)</span>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="toolkit-cta">
          <h2>Not sure where to start?</h2>
          <p>Take the assessment to understand what you're experiencing, then come back here for the tools that match your stage.</p>
          <div className="cta-actions">
            <Link to="/assessment" className="btn btn-primary">Take the Assessment</Link>
            <Link to="/articles" className="btn btn-ghost">Read the Articles</Link>
          </div>
        </div>
      </div>

      <style>{`
        .tools-page { padding-bottom: 4rem; }
        .page-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-hero h1 { margin-bottom: 0.75rem; }
        .page-hero p {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin-bottom: 0.75rem;
        }
        .disclaimer {
          font-family: var(--font-ui);
          font-size: 0.8rem !important;
          color: var(--text-muted) !important;
        }
        .toolkit-section {
          margin-bottom: 3.5rem;
        }
        .category-title {
          font-size: 1.5rem;
          color: var(--accent-soft);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-accent);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .product-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        .product-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
        }
        .product-category-badge {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid var(--border-accent);
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          display: inline-block;
          width: fit-content;
        }
        .product-name {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }
        .product-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .product-why {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .why-label {
          font-family: var(--font-ui);
          font-weight: 600;
          color: var(--accent);
          margin-right: 0.4rem;
        }
        .why-text {
          color: var(--text-secondary);
        }
        .product-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
          margin-top: auto;
          transition: color var(--transition-fast);
        }
        .product-link:hover {
          color: var(--accent-soft);
          text-decoration: underline;
        }
        .paid-link {
          font-weight: 400;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .toolkit-cta {
          background: var(--bg-secondary);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-xl);
          padding: 3rem;
          text-align: center;
          margin-top: 2rem;
          box-shadow: var(--shadow-glow);
        }
        .toolkit-cta h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          margin-top: 0;
        }
        .toolkit-cta p {
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: 1fr; }
          .toolkit-cta { padding: 2rem; }
        }
      `}</style>
    </div>
  );
}
