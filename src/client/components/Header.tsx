import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/articles', label: 'Articles' },
    { to: '/assessment', label: 'Assessment' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/tools', label: 'Emergence Toolkit' },
    { to: '/about', label: 'About Kalesh' },
  ];

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-inner container">
        <Link to="/" className="site-logo" aria-label="The Emergence — Home">
          <span className="logo-symbol">✦</span>
          <span className="logo-text">
            <span className="logo-main">The Emergence</span>
            <span className="logo-sub">Kundalini Crisis &amp; Spiritual Emergency</span>
          </span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <ul>
            {navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={location.pathname.startsWith(link.to) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`hamburger${menuOpen ? ' open' : ''}`}>
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(13, 17, 23, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          transition: background var(--transition-base), box-shadow var(--transition-base);
        }
        .site-header.scrolled {
          background: rgba(13, 17, 23, 0.97);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 2rem;
        }
        .site-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .site-logo:hover { text-decoration: none; }
        .logo-symbol {
          font-size: 1.5rem;
          color: var(--accent);
          line-height: 1;
          filter: drop-shadow(0 0 8px var(--accent));
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .logo-main {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .logo-sub {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
        }
        .main-nav ul {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 0.25rem;
          align-items: center;
        }
        .main-nav a {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          transition: color var(--transition-fast), background var(--transition-fast);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .main-nav a:hover,
        .main-nav a.active {
          color: var(--accent);
          background: var(--accent-glow);
          text-decoration: none;
        }
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          min-width: 44px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 22px;
        }
        .hamburger span {
          display: block;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-fast);
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        @media (max-width: 900px) {
          .menu-toggle { display: flex; }
          .main-nav {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
            transition: transform var(--transition-base), opacity var(--transition-base);
          }
          .main-nav.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }
          .main-nav ul {
            flex-direction: column;
            gap: 0.25rem;
          }
          .main-nav a {
            display: block;
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  );
}
