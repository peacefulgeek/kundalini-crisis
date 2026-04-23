import React from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero">
        <div className="container">
          <div className="hero-content content-width">
            <div className="author-badge">Consciousness Teacher &amp; Writer</div>
            <h1>About Kalesh</h1>
            <p className="hero-sub">
              I write about what happens when awakening isn't beautiful. When it's terrifying, destabilizing, and the people around you have no idea what you're going through.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="about-layout content-width">
          <div className="about-image-section">
            <div className="author-image-container">
              <img
                src="https://kundalini-crisis.b-cdn.net/images/kalesh-author.webp"
                alt="Kalesh — Consciousness Teacher and Writer"
                width="400"
                height="500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="author-card">
                <div className="author-name">Kalesh</div>
                <div className="author-title">Consciousness Teacher &amp; Writer</div>
                <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="author-site-link">
                  kalesh.love →
                </a>
              </div>
            </div>
          </div>

          <div className="about-text">
            <h2>The site for people whose awakening isn't going according to plan</h2>

            <p>
              There's a specific kind of suffering that nobody talks about. You've done everything right. You meditated. You went on retreat. You worked with a teacher. Or maybe it just happened — spontaneously, out of nowhere, in the middle of an ordinary Tuesday.
            </p>

            <p>
              And now everything is wrong. Your body is doing things you can't explain. Your mind won't stop. You can't sleep. You feel like you're dissolving. The people around you are scared. Your doctor says anxiety. Your family says breakdown.
            </p>

            <p>
              But something in you knows this is different.
            </p>

            <blockquote>
              "Spiritual emergency is what happens when the soul outpaces the nervous system. The experience is real. The research is real. And there's a way through."
            </blockquote>

            <p>
              Stanislav Grof spent decades documenting this. Bonnie Greenwell mapped the kundalini symptoms. David Lukoff got it into the DSM. The Spiritual Emergency Network has been supporting people through this since 1980. This is not new. This is not rare. And it is not the same as psychosis, though it can look like it from the outside.
            </p>

            <h2>What I write about</h2>

            <p>
              I write about spiritual emergency, kundalini crisis, the dark night of the soul, and what happens when meditation or plant medicine or breathwork opens something that doesn't close again. I write about the difference between spiritual experience and mental illness. I write about grounding, integration, and the long road back.
            </p>

            <p>
              I write for the person who is in the middle of it and terrified. And for the person who has come through it and is trying to make sense of what happened.
            </p>

            <h2>A note on mental health</h2>

            <p>
              Everything on this site is for educational purposes. I am not a licensed mental health professional. Spiritual emergency can co-occur with mental health conditions that need professional treatment. If you're in crisis, please reach out to a mental health professional or call 988.
            </p>

            <p>
              That said: your psychiatrist isn't wrong. They're just not seeing the whole picture. Both things can be true.
            </p>

            <div className="about-links">
              <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Visit kalesh.love
              </a>
              <Link to="/assessment" className="btn btn-ghost">
                Take the Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-page { padding-bottom: 4rem; }
        .page-hero {
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0 3rem;
          margin-bottom: 3rem;
        }
        .author-badge {
          display: inline-block;
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid var(--border-accent);
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          margin-bottom: 1rem;
        }
        .page-hero h1 { margin-bottom: 1rem; }
        .hero-sub {
          font-size: 1.15rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 600px;
        }
        .about-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 4rem;
          align-items: start;
        }
        .author-image-container {
          position: sticky;
          top: 100px;
        }
        .author-image-container img {
          width: 100%;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          margin-bottom: 1rem;
        }
        .author-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          text-align: center;
        }
        .author-name {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .author-title {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .author-site-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }
        .author-site-link:hover { color: var(--accent-soft); text-decoration: underline; }
        .about-text h2 {
          color: var(--accent-soft);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .about-text h2:first-child { margin-top: 0; }
        .about-text p {
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }
        .about-text blockquote {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-primary);
          border-left-color: var(--accent);
        }
        .about-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        @media (max-width: 900px) {
          .about-layout {
            grid-template-columns: 1fr;
          }
          .author-image-container {
            position: static;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}
