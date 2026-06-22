// owner: layout-stylist (layout + copy) + motion-designer (scroll-triggered reveals)
//
// DOM HOOK CONTRACT — motion-designer targets:
//   .manifesto__statement[data-reveal="manifesto-line"]
//     Each statement is an independent reveal unit.
//     data-index="0|1|2|3" — stagger offset multiplier (× 80ms).
//   .manifesto__word[data-word]
//     Individual word spans — stagger word-by-word inside each statement.
//   .manifesto__counter — fades in with its sibling statement.
//
// prefers-reduced-motion: whileInView fires instantly (Framer Motion respects the media query
// for viewport animations when no explicit transition is provided; here we set duration: 0).

import { motion, useReducedMotion } from 'framer-motion'

const expoEase = [0.16, 1, 0.3, 1]

// Container that staggers word children
function statementVariants(reduced) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.04,
        delayChildren:   reduced ? 0 : 0,
      },
    },
  }
}

function wordVariants(reduced) {
  return {
    hidden: {
      opacity: 0,
      y: reduced ? 0 : 18,
      skewX: reduced ? 0 : 4,
    },
    visible: {
      opacity: 1,
      y: 0,
      skewX: 0,
      transition: {
        duration: reduced ? 0 : 0.55,
        ease: expoEase,
      },
    },
  }
}

function counterVariants(reduced) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: reduced ? 0 : 0.4, ease: 'easeOut' },
    },
  }
}

const statements = [
  {
    index: 0,
    counter: '01',
    text: 'Light does not decorate. It reveals.',
  },
  {
    index: 1,
    counter: '02',
    text: 'Each particle a decision. Each frame, unrepeatable.',
  },
  {
    index: 2,
    counter: '03',
    text: 'We do not illustrate ideas. We grow them — from math, from time, from chance.',
  },
  {
    index: 3,
    counter: '04',
    text: 'The aurora is not a metaphor. It is the method.',
  },
]

export function Manifesto() {
  const reduced = useReducedMotion()

  return (
    <section className="manifesto" aria-label="Manifesto">
      <div className="manifesto__inner">
        {/* Section label */}
        <div className="manifesto__header">
          <span className="manifesto__label">Principles</span>
        </div>

        {/* Kinetic statements */}
        <ol className="manifesto__list" role="list">
          {statements.map(({ index, counter, text }) => {
            const words = text.split(' ')
            // Each statement enters 80ms after the previous one (stagger)
            const entryDelay = reduced ? 0 : index * 0.08

            return (
              <motion.li
                key={index}
                className="manifesto__statement"
                data-reveal="manifesto-line"
                data-index={index}
                variants={statementVariants(reduced)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                // Apply per-statement entry delay on the container
                transition={{ delayChildren: entryDelay }}
              >
                {/* Counter fades in simultaneously with its statement */}
                <motion.span
                  className="manifesto__counter"
                  aria-hidden="true"
                  variants={counterVariants(reduced)}
                >
                  {counter}
                </motion.span>

                <p className="manifesto__text">
                  {words.map((word, wi) => (
                    <motion.span
                      key={wi}
                      className="manifesto__word"
                      data-word={wi}
                      variants={wordVariants(reduced)}
                      // Inline so words wrap naturally
                      style={{ display: 'inline-block', willChange: 'opacity, transform' }}
                    >
                      {word}
                      {wi < words.length - 1 ? ' ' : ''}
                    </motion.span>
                  ))}
                </p>
              </motion.li>
            )
          })}
        </ol>
      </div>

      <style>{`
        .manifesto {
          background: var(--bg);
          padding: var(--space-24) var(--gutter);
          border-top: 1px solid var(--line);
        }

        .manifesto__inner {
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .manifesto__header {
          margin-bottom: var(--space-12);
        }

        .manifesto__label {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
        }

        .manifesto__list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .manifesto__statement {
          display: grid;
          grid-template-columns: 3.5rem 1fr;
          gap: var(--space-4);
          align-items: start;
          padding: var(--space-8) 0;
          border-top: 1px solid var(--line);
          will-change: opacity, transform;
        }

        .manifesto__statement:last-child {
          border-bottom: 1px solid var(--line);
        }

        .manifesto__counter {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          color: var(--muted);
          padding-top: 0.5em; /* optical align to text cap height */
          user-select: none;
        }

        .manifesto__text {
          font-family: var(--font-display);
          font-size: var(--type-display-lg);
          font-weight: 300;
          letter-spacing: var(--tracking-tight);
          line-height: 1.15;
          color: var(--ink);
          /* Clip overflow so words don't ghost above line during reveal */
          overflow: hidden;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .manifesto {
            padding: var(--space-16) var(--gutter);
          }

          .manifesto__statement {
            grid-template-columns: 2.5rem 1fr;
            gap: var(--space-2);
            padding: var(--space-6) 0;
          }

          .manifesto__text {
            font-size: clamp(1.625rem, 6vw, 2.5rem);
          }
        }
      `}</style>
    </section>
  )
}
