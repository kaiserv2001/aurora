// owner: layout-stylist
// Site footer — wordmark, fictional studio credit, year, minimal links.

export function Footer() {
  const year = 2026

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer__inner">
        {/* Top row: wordmark + nav links */}
        <div className="footer__top">
          <span className="footer__wordmark" aria-label="AURORA Studio">
            AURORA
          </span>

          <nav className="footer__nav" aria-label="Footer navigation">
            <a href="#manifesto" className="footer__link">Principles</a>
            <a href="#studies"   className="footer__link">Studies</a>
            <a href="mailto:studio@aurora.field" className="footer__link">Contact</a>
          </nav>
        </div>

        {/* Divider */}
        <div className="footer__rule" aria-hidden="true" />

        {/* Bottom row: credit + year */}
        <div className="footer__bottom">
          <p className="footer__credit">
            A fictional generative-art studio.
            Light as material.
          </p>
          <p className="footer__meta">
            <span className="footer__year">{year}</span>
            {' '}—{' '}
            <span className="footer__studio">AURORA Studio</span>
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--surface);
          border-top: 1px solid var(--line);
          padding: var(--space-8) var(--gutter) var(--space-6);
        }

        .footer__inner {
          max-width: var(--max-width);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        /* Top row */
        .footer__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .footer__wordmark {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: var(--tracking-display);
          color: var(--ink);
        }

        .footer__nav {
          display: flex;
          gap: var(--space-6);
          flex-wrap: wrap;
        }

        .footer__link {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
          transition: color var(--duration-fast) var(--ease-out-expo);
        }

        .footer__link:hover {
          color: var(--ink);
        }

        /* Rule */
        .footer__rule {
          height: 1px;
          background: var(--line);
        }

        /* Bottom row */
        .footer__bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .footer__credit,
        .footer__meta {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          color: var(--muted);
          letter-spacing: 0.02em;
        }

        /* Mobile */
        @media (max-width: 600px) {
          .footer__top {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  )
}
