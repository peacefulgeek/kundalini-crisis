import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const CATEGORIES = [
  { value: '', label: 'All Topics' },
  { value: 'kundalini-crisis', label: 'Kundalini Crisis' },
  { value: 'spiritual-emergency', label: 'Spiritual Emergency' },
  { value: 'dark-night', label: 'Dark Night' },
  { value: 'meditation-effects', label: 'Meditation Effects' },
  { value: 'integration', label: 'Integration' },
  { value: 'grounding', label: 'Grounding' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'community', label: 'Community' },
];

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || '';
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (category) params.set('category', category);

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, page]);

  const handleCategory = (cat: string) => {
    setPage(1);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="articles-page">
      <div className="page-hero">
        <div className="container">
          <h1>All Articles</h1>
          <p>Research-backed writing on spiritual emergency, kundalini crisis, and the dark night of the soul. By Kalesh.</p>
        </div>
      </div>

      <div className="container">
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`filter-btn${category === cat.value ? ' active' : ''}`}
              onClick={() => handleCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="articles-grid loading-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card-skeleton"></div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>No articles found in this category yet. Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="articles-grid">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .articles-page { padding-bottom: 4rem; }
        .page-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .page-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 0.75rem;
        }
        .page-hero p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
        }
        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
        }
        .filter-btn {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .filter-btn:hover {
          color: var(--accent);
          border-color: var(--border-accent);
          background: var(--accent-glow);
        }
        .filter-btn.active {
          color: #0D1117;
          background: var(--accent);
          border-color: var(--accent);
          font-weight: 600;
        }
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .empty-state {
          text-align: center;
          padding: 4rem;
          color: var(--text-muted);
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        .page-btn {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          background: none;
          border: 1px solid var(--border-accent);
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }
        .page-btn:hover:not(:disabled) {
          background: var(--accent-glow);
        }
        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .page-info {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        @media (max-width: 900px) {
          .articles-grid, .loading-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .articles-grid, .loading-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
