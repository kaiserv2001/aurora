// owner: layout-stylist (section layout + copy) + motion-designer (entrance animations)
// AuroraCanvas is fixed at z-index: var(--z-canvas); this shell sits above it.
//
// motion-designer owns:
//   [data-reveal="hero-eyebrow"]  — fade-in entrance (delay 0)
//   [data-reveal="hero-wordmark"] — oversized headline: clip-path slide-up (delay 1)
//   [data-reveal="hero-sub"]      — sub-copy fade-up (delay 2)
//   [data-reveal="hero-scroll"]   — scroll cue bounce loop
//
// prefers-reduced-motion: all animations become instant/none.

import { motion } from 'framer-motion'
import { AuroraCanvas } from '../hero/AuroraCanvas'

// Shared spring easing (maps to --ease-spring token feel)
const springEase = [0.34, 1.56, 0.64, 1]
const expoEase   = [0.16, 1, 0.3, 1]

// Clip-path reveal: text slides up from beneath an invisible mask
const wordmarkVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    clipPath: 'inset(100% 0% 0% 0%)',
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: 0.9,
      ease: expoEase,
      delay: 0.25,
    },
  },
}

const fadeUpVariants = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: expoEase, delay },
  },
})

const scrollCueVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: 1.1 },
  },
}

export function Hero() {
  return (
    <section className="hero" aria-label="Hero">
      {/* Shader canvas — fixed layer owned by shader-artist */}
      <AuroraCanvas />

      {/* Hero content shell — transparent so the aurora shows through */}
      <div className="hero__inner">
        <div className="hero__content">
          {/* Eyebrow label */}
          <motion.span
            className="hero__eyebrow"
            data-reveal="hero-eyebrow"
            variants={fadeUpVariants(0)}
            initial="hidden"
            animate="visible"
          >
            Generative Light Studio — 2026
          </motion.span>

          {/* Oversized wordmark — clip-path mask reveal */}
          <motion.h1
            className="hero__wordmark"
            data-reveal="hero-wordmark"
            variants={wordmarkVariants}
            initial="hidden"
            animate="visible"
          >
            AURORA
          </motion.h1>

          {/* One-line statement */}
          <motion.p
            className="hero__statement"
            data-reveal="hero-sub"
            variants={fadeUpVariants(0.65)}
            initial="hidden"
            animate="visible"
          >
            Light is the material. <br className="hero__br" />
            Every frame, a new composition.
          </motion.p>
        </div>

        {/* Scroll cue — bounces gently after entrance */}
        <motion.div
          className="hero__scroll-cue"
          data-reveal="hero-scroll"
          aria-hidden="true"
          variants={scrollCueVariants}
          initial="hidden"
          animate="visible"
        >
          <span className="hero__scroll-label">Scroll</span>
          <motion.span
            className="hero__scroll-line"
            animate={{ scaleX: [1, 1.45, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
        </motion.div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }

        /* Inner sits above canvas, transparent so aurora bleeds through */
        .hero__inner {
          position: relative;
          z-index: var(--z-content);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 100svh;
          padding: var(--space-8) var(--gutter) var(--space-6);
        }

        .hero__content {
          margin-top: auto;
          padding-bottom: var(--space-12);
        }

        .hero__eyebrow {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          font-weight: 400;
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: var(--space-4);
        }

        .hero__wordmark {
          font-family: var(--font-display);
          font-size: var(--type-display-2xl);
          font-weight: 300;
          letter-spacing: var(--tracking-display);
          line-height: var(--leading-display);
          color: var(--ink);
          margin-bottom: var(--space-6);
          /* Allow aurora to glance behind if bg is transparent */
          mix-blend-mode: multiply;
        }

        .hero__statement {
          font-size: var(--type-body-lg);
          font-weight: 400;
          color: var(--muted);
          line-height: 1.5;
          max-width: var(--max-width-prose);
        }

        .hero__br {
          display: none;
        }

        /* Scroll cue */
        .hero__scroll-cue {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding-bottom: var(--space-2);
        }

        .hero__scroll-label {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
        }

        .hero__scroll-line {
          display: block;
          width: 48px;
          height: 1px;
          background: var(--muted);
          opacity: 0.4;
          transform-origin: left center;
        }

        /* Mobile refinements */
        @media (max-width: 768px) {
          .hero__inner {
            padding-top: var(--space-16);
          }

          .hero__content {
            padding-bottom: var(--space-8);
          }

          .hero__br {
            display: block;
          }
        }

        /* Reduced motion — remove blend modes and animations */
        @media (prefers-reduced-motion: reduce) {
          .hero__wordmark {
            mix-blend-mode: normal;
          }
        }
      `}</style>
    </section>
  )
}
