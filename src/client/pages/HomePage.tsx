import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

interface Article {
  id: number;
  slug: string;
  title: string;
  meta_description: string;
  category: string;
  image_url: string;
  image_alt: string;
  reading_time: number;
  author: string;
  published_at: string;
}

const KALESH_QUOTES = [
  "What if you're not losing your mind? What if you're losing a mind that was never actually yours?",
  "Spiritual emergency is what happens when the soul outpaces the nervous system.",
  "Nobody tells you that awakening can feel like psychosis.",
  "The emergence isn't gentle. And pretending it is doesn't help anyone.",
  "Let's slow this down. What you're experiencing has a name, a history, and a way through.",
];

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * KALESH_QUOTES.length));

  useEffect(() => {
    fetch('/api/articles?limit=9')
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1, 9);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>✦</span> Spiritual Emergency &amp; Kundalini Crisis
          </div>
          <h1 className="hero-title">
            Your Awakening<br />
            <span className="hero-title-accent">Isn't Breaking You.</span><br />
            It's Breaking You <em>Open.</em>
          </h1>
          <p className="hero-quote">"{KALESH_QUOTES[quoteIndex]}"</p>
          <p className="hero-attribution">— Kalesh</p>
          <div className="hero-actions">
            <Link to="/assessment" className="btn btn-primary">
              Take the Assessment
            </Link>
            <Link to="/articles" className="btn btn-ghost">
              Read the Articles
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">30+</span>
              <span className="stat-label">In-depth articles</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">Free</span>
              <span className="stat-label">Assessment tool</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">Real</span>
              <span className="stat-label">No spiritual bypassing</span>
            </div>
          </div>
        </div>
      </section>

      {/* What Is This Site */}
      <section className="intro-section">
        <div className="container content-width">
          <div className="intro-grid">
            <div className="intro-text">
              <h2>You're Not Crazy. You're in Crisis.</h2>
              <p>
                There's a specific kind of hell that nobody talks about. You've been meditating, or doing breathwork, or took a plant medicine, or it just happened out of nowhere. And now everything feels wrong. Your body is doing things you can't explain. Your mind won't stop. You can't sleep. You can't eat. You feel like you're dissolving.
              </p>
              <p>
                Your doctor says anxiety. Your family says breakdown. But something in you knows this is different.
              </p>
              <p>
                This site is for that. For the people whose spiritual awakening isn't beautiful. It's terrifying, destabilizing, and no one around them understands what's happening.
              </p>
              <p>
                Stanislav Grof called it spiritual emergency. Bonnie Greenwell mapped the kundalini symptoms. David Lukoff got it into the DSM. The research is real. The experience is real. And there's a way through.
              </p>
              <Link to="/about" className="text-link">Meet Kalesh →</Link>
            </div>
            <div className="intro-features">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Kundalini Crisis</h3>
                <p>Tremors, heat, involuntary movement, energy surges. What's happening in your body and why.</p>
                <Link to="/articles?category=kundalini-crisis">Read more →</Link>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌑</div>
                <h3>Dark Night of the Soul</h3>
                <p>Not depression. Not psychosis. The clinical-grade disorientation of losing everything you thought was real.</p>
                <Link to="/articles?category=dark-night">Read more →</Link>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Spiritual vs. Mental Illness</h3>
                <p>How to tell the difference. When to call a psychiatrist. When to call a spiritual director.</p>
                <Link to="/articles?category=mental-health">Read more →</Link>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <h3>Integration</h3>
                <p>The long road back. Grounding practices, nervous system support, and how to rebuild.</p>
                <Link to="/articles?category=integration">Read more →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured</h2>
            </div>
            <Link to={`/articles/${featured.slug}`} className="featured-card">
              <div className="featured-image">
                <img
                  src={featured.image_url || 'https://kundalini-crisis.b-cdn.net/images/articles/placeholder.webp'}
                  alt={featured.image_alt || featured.title}
                  loading="eager"
                  width="800"
                  height="450"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://kundalini-crisis.b-cdn.net/images/articles/placeholder.webp';
                  }}
                />
              </div>
              <div className="featured-content">
                <span className="article-category">{featured.category?.replace(/-/g, ' ')}</span>
                <h3>{featured.title}</h3>
                <p>{featured.meta_description}</p>
                <div className="article-meta">
                  <span>By {featured.author}</span>
                  <span>·</span>
                  <span>{featured.reading_time} min read</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Articles</h2>
            <Link to="/articles" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="articles-grid">
              {rest.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Assessment CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-icon">✦</div>
            <h2>Not Sure What You're Experiencing?</h2>
            <p>Take the Spiritual Emergency Assessment. 12 questions. Honest answers. No email required.</p>
            <div className="cta-actions">
              <Link to="/assessment" className="btn btn-primary">Take the Assessment</Link>
              <Link to="/quiz" className="btn btn-ghost">What Stage Are You In?</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(107, 63, 160, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(232, 168, 56, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(13, 17, 23, 0.8) 0%, transparent 60%),
            linear-gradient(135deg, #0D1117 0%, #0A0D14 50%, #0D1117 100%);
        }
        .hero-particles {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20% 30%, rgba(232, 168, 56, 0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 70%, rgba(232, 168, 56, 0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 20%, rgba(107, 63, 160, 0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 80%, rgba(232, 168, 56, 0.2) 0%, transparent 100%),
            radial-gradient(2px 2px at 10% 60%, rgba(232, 168, 56, 0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(107, 63, 160, 0.4) 0%, transparent 100%);
          background-size: 400px 400px, 300px 300px, 500px 500px, 350px 350px, 250px 250px, 450px 450px;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding-top: 6rem;
          padding-bottom: 6rem;
          max-width: 800px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid var(--border-accent);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          margin-bottom: 2rem;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.01em;
        }
        .hero-title-accent {
          color: var(--accent);
          text-shadow: 0 0 40px rgba(232, 168, 56, 0.3);
        }
        .hero-title em {
          font-style: italic;
          color: var(--violet-soft);
        }
        .hero-quote {
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-style: italic;
          color: var(--text-secondary);
          max-width: 600px;
          margin-bottom: 0.5rem;
          line-height: 1.6;
          border-left: 2px solid var(--accent);
          padding-left: 1rem;
        }
        .hero-attribution {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          padding-left: 1rem;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all var(--transition-base);
          cursor: pointer;
          border: none;
          min-height: var(--tap-target-min);
          letter-spacing: 0.02em;
        }
        .btn-primary {
          background: var(--accent);
          color: #0D1117;
          box-shadow: 0 4px 20px rgba(232, 168, 56, 0.3);
        }
        .btn-primary:hover {
          background: var(--accent-soft);
          box-shadow: 0 6px 30px rgba(232, 168, 56, 0.5);
          transform: translateY(-1px);
          text-decoration: none;
          color: #0D1117;
        }
        .btn-ghost {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-glow);
          text-decoration: none;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .stat-num {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }

        /* Intro section */
        .intro-section {
          padding: 6rem 0;
        }
        .intro-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .intro-text h2 {
          color: var(--accent-soft);
          margin-bottom: 1.5rem;
          margin-top: 0;
        }
        .intro-text p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .text-link {
          font-family: var(--font-ui);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--accent);
          text-decoration: none;
          letter-spacing: 0.02em;
        }
        .text-link:hover {
          color: var(--accent-soft);
          text-decoration: underline;
        }
        .intro-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        .feature-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
        }
        .feature-icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1;
        }
        .feature-card h3 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .feature-card a {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }
        .feature-card a:hover {
          color: var(--accent-soft);
          text-decoration: underline;
        }

        /* Featured */
        .featured-section {
          padding: 4rem 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0;
        }
        .section-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }
        .section-link:hover {
          color: var(--accent-soft);
          text-decoration: underline;
        }
        .featured-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          text-decoration: none;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }
        .featured-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
          text-decoration: none;
        }
        .featured-image {
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .featured-card:hover .featured-image img {
          transform: scale(1.03);
        }
        .featured-content {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .article-category {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: 0.75rem;
          display: block;
        }
        .featured-content h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-top: 0;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .featured-content p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .article-meta {
          display: flex;
          gap: 0.5rem;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Articles grid */
        .articles-section {
          padding: 4rem 0;
        }
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .card-skeleton {
          height: 320px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* CTA */
        .cta-section {
          padding: 4rem 0 6rem;
        }
        .cta-card {
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-xl);
          padding: 4rem;
          text-align: center;
          box-shadow: var(--shadow-glow);
        }
        .cta-icon {
          font-size: 2rem;
          color: var(--accent);
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 12px var(--accent));
        }
        .cta-card h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: var(--text-primary);
          margin-bottom: 1rem;
          margin-top: 0;
        }
        .cta-card p {
          font-size: 1.1rem;
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

        @media (max-width: 1024px) {
          .articles-grid,
          .loading-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .intro-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        @media (max-width: 768px) {
          .featured-card {
            grid-template-columns: 1fr;
          }
          .featured-image {
            aspect-ratio: 16/9;
          }
          .featured-content {
            padding: 1.5rem;
          }
          .articles-grid,
          .loading-grid {
            grid-template-columns: 1fr;
          }
          .intro-features {
            grid-template-columns: 1fr;
          }
          .cta-card {
            padding: 2rem;
          }
          .hero-stats {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
