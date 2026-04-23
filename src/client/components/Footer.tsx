import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-symbol">✦</span>
              <span className="logo-main">The Emergence</span>
            </div>
            <p className="footer-tagline">
              For people whose spiritual awakening isn't beautiful. It's terrifying, destabilizing, and no one around them understands.
            </p>
            <p className="footer-author">
              Written by <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Kalesh</a> — Consciousness Teacher &amp; Writer
            </p>
          </div>

          <div className="footer-nav">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/articles">All Articles</Link></li>
              <li><Link to="/assessment">Spiritual Emergency Assessment</Link></li>
              <li><Link to="/quiz">What Stage Are You In?</Link></li>
              <li><Link to="/tools">Emergence Toolkit</Link></li>
              <li><Link to="/about">About Kalesh</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4>Topics</h4>
            <ul>
              <li><Link to="/articles?category=kundalini-crisis">Kundalini Crisis</Link></li>
              <li><Link to="/articles?category=spiritual-emergency">Spiritual Emergency</Link></li>
              <li><Link to="/articles?category=dark-night">Dark Night of the Soul</Link></li>
              <li><Link to="/articles?category=meditation-effects">Meditation Effects</Link></li>
              <li><Link to="/articles?category=integration">Integration</Link></li>
            </ul>
          </div>

          <div className="footer-crisis">
            <h4>In Crisis?</h4>
            <div className="crisis-box">
              <p>If you're in immediate danger, please reach out:</p>
              <a href="tel:988" className="crisis-link">988 — Suicide &amp; Crisis Lifeline</a>
              <a href="https://www.spiritualemergence.net" target="_blank" rel="noopener noreferrer" className="crisis-link">Spiritual Emergence Network</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-legal">
            &copy; {year} The Emergence. All rights reserved.
            <span className="separator">·</span>
            As an Amazon Associate, I earn from qualifying purchases.
            <span className="separator">·</span>
            Content is for educational purposes only. Not a substitute for professional mental health care.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: 4rem 0 2rem;
          margin-top: 6rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .footer-logo .logo-symbol {
          font-size: 1.25rem;
          color: var(--accent);
          filter: drop-shadow(0 0 6px var(--accent));
        }
        .footer-logo .logo-main {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.05em;
        }
        .footer-tagline {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .footer-author {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .footer-author a {
          color: var(--accent);
        }
        .footer-nav h4 {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .footer-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-nav li {
          margin-bottom: 0.5rem;
        }
        .footer-nav a {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .footer-nav a:hover {
          color: var(--accent);
          text-decoration: none;
        }
        .footer-crisis h4 {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--danger);
          margin-bottom: 1rem;
        }
        .crisis-box {
          background: rgba(224, 85, 85, 0.08);
          border: 1px solid rgba(224, 85, 85, 0.2);
          border-radius: var(--radius-md);
          padding: 1rem;
        }
        .crisis-box p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .crisis-link {
          display: block;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--danger);
          text-decoration: none;
          padding: 0.4rem 0;
          transition: color var(--transition-fast);
        }
        .crisis-link:hover {
          color: #FF7777;
          text-decoration: underline;
        }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 2rem;
        }
        .footer-legal {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .separator {
          margin: 0 0.5rem;
          opacity: 0.4;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
