import React from 'react';
import { Link } from 'react-router-dom';

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

interface Props {
  article: Article;
}

export function ArticleCard({ article }: Props) {
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <Link to={`/articles/${article.slug}`} className="article-card">
      <div className="card-image">
        <img
          src={article.image_url || 'https://kundalini-crisis.b-cdn.net/images/articles/placeholder.webp'}
          alt={article.image_alt || article.title}
          loading="lazy"
          width="400"
          height="225"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://kundalini-crisis.b-cdn.net/images/articles/placeholder.webp';
          }}
        />
      </div>
      <div className="card-content">
        <span className="article-category">{article.category?.replace(/-/g, ' ')}</span>
        <h3 className="card-title">{article.title}</h3>
        <p className="card-excerpt">{article.meta_description}</p>
        <div className="card-meta">
          <span>{date}</span>
          <span>·</span>
          <span>{article.reading_time} min read</span>
        </div>
      </div>

      <style>{`
        .article-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          text-decoration: none;
          transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
        }
        .article-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
          text-decoration: none;
        }
        .card-image {
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--bg-elevated);
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .article-card:hover .card-image img {
          transform: scale(1.05);
        }
        .card-content {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: 1rem;
          color: var(--text-primary);
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          flex: 1;
        }
        .card-excerpt {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-meta {
          display: flex;
          gap: 0.4rem;
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: auto;
        }
      `}</style>
    </Link>
  );
}
