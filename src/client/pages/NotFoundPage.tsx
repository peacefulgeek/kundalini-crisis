import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-symbol">✦</div>
          <h1>Page Not Found</h1>
          <p>This page doesn't exist, or it's been moved. The emergence continues elsewhere.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">Go Home</Link>
            <Link to="/articles" className="btn btn-ghost">Browse Articles</Link>
          </div>
        </div>
      </div>
      <style>{`
        .not-found-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          padding: 4rem 0;
        }
        .not-found-content {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        .not-found-symbol {
          font-size: 3rem;
          color: var(--accent);
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 12px var(--accent));
        }
        .not-found-content h1 {
          margin-bottom: 1rem;
        }
        .not-found-content p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
