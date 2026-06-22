// owner: layout-stylist (layout + copy + magnetic button markup)
// motion-designer owns: magnetic button pull, [data-magnetic] listeners,
//   and entrance animations on [data-reveal="cta-block"] / [data-reveal="cta-headline"].
//
// DOM HOOK CONTRACT (preserved):
//   [data-reveal="cta-block"]    — section entrance reveal
//   [data-magnetic]              — magnetic button containers
//   .btn-magnetic__inner         — physical moving element
//   [data-reveal="cta-headline"] — headline word-split entrance

import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMagnetic } from '../../hooks/useMagnetic'

const expoEase = [0.16, 1, 0.3, 1]

// Per-word stagger for the headline
function MagneticButton({ children, href, className }) {
  const wrapRef = useRef(null)
  useMagnetic(wrapRef)

  return (
    <div ref={wrapRef} className="btn-magnetic-wrap" data-magnetic>
      <a href={href} className={`btn-magnetic ${className}`}>
        <span className="btn-magnetic__inner">{children}</span>
      </a>
    </div>
  )
}

export function Interactive() {
  const reduced = useReducedMotion()

  const blockVariants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.8,
        ease: expoEase,
        staggerChildren: reduced ? 0 : 0.12,
      },
    },
  }

  const itemVariants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.65, ease: expoEase },
    },
  }

  // Headline word-split
  const headlineWords = 'Enter the field.'.split(' ')

  return (
    <section className="interactive" aria-label="Enter the field">
      <motion.div
        className="interactive__inner"
        data-reveal="cta-block"
        variants={blockVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Eyebrow */}
        <motion.span className="interactive__eyebrow" variants={itemVariants}>
          Begin
        </motion.span>

        {/* Headline — word split */}
        <motion.h2
          className="interactive__headline"
          data-reveal="cta-headline"
          variants={itemVariants}
          aria-label="Enter the field."
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block', marginRight: '0.3em' }}
              variants={{
                hidden:  { opacity: 0, y: reduced ? 0 : 28 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: reduced ? 0 : 0.7,
                    ease: expoEase,
                    delay: i * (reduced ? 0 : 0.09),
                  },
                },
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p className="interactive__body" variants={itemVariants}>
          Commission a generative work. Collaborate on a live installation.
          <br />
          Let light decide the rest.
        </motion.p>

        {/* CTA cluster — magnetic buttons */}
        <motion.div className="interactive__cta-group" variants={itemVariants}>
          <MagneticButton href="mailto:studio@aurora.field" className="btn-magnetic--primary">
            Commission a work
          </MagneticButton>

          <MagneticButton href="#studies" className="btn-magnetic--ghost">
            View studies
          </MagneticButton>
        </motion.div>

        {/* Decorative light smear */}
        <div className="interactive__glow" aria-hidden="true" />
      </motion.div>

      <style>{`
        .interactive {
          background: var(--bg);
          padding: var(--space-24) var(--gutter);
          border-top: 1px solid var(--line);
          position: relative;
          overflow: hidden;
        }

        .interactive__inner {
          position: relative;
          z-index: 1;
          max-width: var(--max-width);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-6);
          will-change: opacity, transform;
        }

        .interactive__eyebrow {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
        }

        .interactive__headline {
          font-family: var(--font-display);
          font-size: var(--type-display-xl);
          font-weight: 300;
          letter-spacing: var(--tracking-display);
          line-height: var(--leading-display);
          color: var(--ink);
          will-change: opacity, transform;
        }

        .interactive__body {
          font-size: var(--type-body-lg);
          color: var(--muted);
          line-height: 1.6;
          max-width: 44ch;
        }

        /* CTA cluster */
        .interactive__cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        /* Magnetic button wrapper */
        .btn-magnetic-wrap {
          display: inline-flex;
        }

        .btn-magnetic {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-pill);
          padding: 0;
          transition:
            background var(--duration-base) var(--ease-out-expo),
            border-color var(--duration-base) var(--ease-out-expo),
            color var(--duration-base) var(--ease-out-expo);
        }

        /* Inner span is the physical moving element */
        .btn-magnetic__inner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2.25rem;
          border-radius: var(--radius-pill);
          font-size: var(--type-sm);
          font-weight: 500;
          letter-spacing: 0.01em;
          pointer-events: none;
          /* CSS spring back on leave via transition as a fallback */
          will-change: transform;
        }

        .btn-magnetic--primary {
          background: var(--accent);
          color: var(--surface);
        }

        .btn-magnetic--primary:hover {
          background: color-mix(in srgb, var(--accent) 88%, white);
        }

        .btn-magnetic--ghost {
          background: transparent;
          outline: 1px solid var(--line);
          color: var(--ink);
        }

        .btn-magnetic--ghost:hover {
          outline-color: rgba(124, 92, 255, .35);
          background: var(--accent-soft);
        }

        /* Decorative blur glow */
        .interactive__glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124, 92, 255, .07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 60%, rgba(45, 212, 191, .05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .interactive {
            padding: var(--space-16) var(--gutter);
          }

          .interactive__cta-group {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-magnetic-wrap {
            width: 100%;
          }

          .btn-magnetic {
            width: 100%;
          }

          .btn-magnetic__inner {
            width: 100%;
            justify-content: center;
            padding: 1.125rem 2rem;
          }
        }
      `}</style>
    </section>
  )
}
