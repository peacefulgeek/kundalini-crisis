import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Article {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta_description: string;
  category: string;
  tags: string[];
  image_url: string;
  image_alt: string;
  reading_time: number;
  author: string;
  published_at: string;
  word_count: number;
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="article-loading">
      <div className="container content-width">
        <div className="skeleton-title"></div>
        <div className="skeleton-image"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-text"></div>
      </div>
      <style>{`
        .article-loading { padding: 4rem 0; }
        .skeleton-title { height: 48px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 1.5rem; animation: pulse 1.5s infinite; }
        .skeleton-image { height: 400px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 2rem; animation: pulse 1.5s infinite; }
        .skeleton-text { height: 20px; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 0.75rem; animation: pulse 1.5s infinite; }
        .skeleton-text.short { width: 60%; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );

  if (error || !article) return (
    <div className="article-error container content-width">
      <h1>Article Not Found</h1>
      <p>This article doesn't exist or has been moved.</p>
      <Link to="/articles" className="btn btn-primary">Browse All Articles</Link>
    </div>
  );

  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <article className="article-page">
      <div className="article-hero">
        <div className="container">
          <div className="article-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <Link to="/articles">Articles</Link>
            <span>›</span>
            <span className="breadcrumb-current">{article.category?.replace(/-/g, ' ')}</span>
          </div>
          <div className="article-header content-width">
            <span className="article-category">{article.category?.replace(/-/g, ' ')}</span>
            <h1>{article.title}</h1>
            <div className="article-byline">
              <span className="author">By <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">{article.author}</a></span>
              <span className="separator">·</span>
              <time dateTime={article.published_at}>{date}</time>
              <span className="separator">·</span>
              <span>{article.reading_time} min read</span>
              <span className="separator">·</span>
              <span>{article.word_count?.toLocaleString()} words</span>
            </div>
          </div>
        </div>
      </div>

      {article.image_url && (
        <div className="article-hero-image">
          <div className="container">
            <img
              src={article.image_url}
              alt={article.image_alt || article.title}
              loading="eager"
              width="800"
              height="450"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <div className="article-layout container">
        <div className="article-body content-width"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        <aside className="article-sidebar">
          <div className="sidebar-sticky">
            <div className="sidebar-card">
              <h4>About Kalesh</h4>
              <p>Consciousness teacher and writer. Kalesh has guided hundreds through spiritual emergency and kundalini crisis.</p>
              <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="sidebar-link">Visit kalesh.love →</a>
            </div>
            <div className="sidebar-card">
              <h4>In Crisis?</h4>
              <a href="tel:988" className="crisis-link-sidebar">988 — Crisis Lifeline</a>
              <a href="https://www.spiritualemergence.net" target="_blank" rel="noopener noreferrer" className="crisis-link-sidebar">Spiritual Emergence Network</a>
            </div>
            <div className="sidebar-card">
              <h4>Take the Assessment</h4>
              <p>Not sure what you're experiencing? 12 questions, honest answers.</p>
              <Link to="/assessment" className="btn btn-primary" style={{fontSize:'0.85rem',padding:'0.6rem 1.2rem'}}>Start Assessment</Link>
            </div>
          </div>
        </aside>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="article-tags container content-width">
          <div className="tags-list">
            {article.tags.map(tag => (
              <Link key={tag} to={`/articles?tag=${tag}`} className="tag">{tag}</Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .article-page { padding-bottom: 4rem; }
        .article-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 3rem 0 2rem;
        }
        .article-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .article-breadcrumb a {
          color: var(--text-muted);
          text-decoration: none;
        }
        .article-breadcrumb a:hover { color: var(--accent); }
        .breadcrumb-current { color: var(--text-secondary); }
        .article-header h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          margin: 0.75rem 0 1rem;
          line-height: 1.2;
        }
        .article-byline {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          color: var(--text-muted);
          align-items: center;
        }
        .article-byline .author a { color: var(--accent); }
        .article-byline .separator { opacity: 0.4; }
        .article-hero-image {
          padding: 2rem 0;
        }
        .article-hero-image img {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
        }
        .article-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 4rem;
          padding-top: 2rem;
          align-items: start;
        }
        .article-body {
          min-width: 0;
        }
        .article-sidebar {
          position: relative;
        }
        .sidebar-sticky {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sidebar-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }
        .sidebar-card h4 {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .sidebar-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .sidebar-link {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }
        .sidebar-link:hover { color: var(--accent-soft); text-decoration: underline; }
        .crisis-link-sidebar {
          display: block;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--danger);
          text-decoration: none;
          padding: 0.3rem 0;
        }
        .crisis-link-sidebar:hover { text-decoration: underline; }
        .article-tags {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tag {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .tag:hover {
          color: var(--accent);
          border-color: var(--border-accent);
          background: var(--accent-glow);
          text-decoration: none;
        }
        .article-error {
          padding: 6rem 0;
          text-align: center;
        }
        .article-error h1 { margin-bottom: 1rem; }
        .article-error p { color: var(--text-secondary); margin-bottom: 2rem; }
        @media (max-width: 900px) {
          .article-layout {
            grid-template-columns: 1fr;
          }
          .article-sidebar {
            display: none;
          }
        }
      `}</style>
    </article>
  );
}
