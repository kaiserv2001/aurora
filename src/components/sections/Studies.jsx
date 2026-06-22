// owner: layout-stylist (layout + content) + motion-designer (horizontal scroll track)
//
// DOM HOOK CONTRACT — motion-designer targets:
//   .studies__track[data-studies-track]
//     Pinned for horizontal scroll on desktop ≥ 900px + no reduced-motion.
//     On mobile / reduced-motion: vertical stack via CSS fallback (no JS).
//   .studies__panel[data-studies-panel]
//     data-panel-index="0|1|2|3|4" — used for parallax/stagger.
//   .studies__thumb[data-studies-thumb]
//     Shader-artist mount point. data-study-id identifies the study.
//   .studies__section-label[data-reveal="studies-label"]
//     Fade-in on scroll enter.
//
// PIN GUARD:
//   Horizontal pin activates only when:
//     - window.matchMedia('(max-width:900px)') does NOT match
//     - window.matchMedia('(prefers-reduced-motion: reduce)') does NOT match
//   Otherwise the CSS-only vertical column is used (layout-stylist owns that CSS).

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

const studies = [
  {
    index: 0,
    id:    'study-01',
    title: 'Diffraction Field',
    year:  '2026',
    caption: 'Spectral dispersion through simulated aperture arrays. 4096-step Euler integration.',
    hue:   '255 92%',
  },
  {
    index: 1,
    id:    'study-02',
    title: 'Chromatic Drift',
    year:  '2026',
    caption: 'Slow-wave color migration driven by Perlin noise at three octave layers.',
    hue:   '172 64%',
  },
  {
    index: 2,
    id:    'study-03',
    title: 'Particle Membrane',
    year:  '2025',
    caption: "Ten thousand points on a tension surface. Each seeks its neighbour's light.",
    hue:   '280 80%',
  },
  {
    index: 3,
    id:    'study-04',
    title: 'Solar Wind',
    year:  '2025',
    caption: 'Charged-particle stream mapped to geomagnetic field lines. Real NOAA data, 2024-11.',
    hue:   '190 70%',
  },
  {
    index: 4,
    id:    'study-05',
    title: 'Resonance Map',
    year:  '2024',
    caption: 'Chladni patterns rendered at 120 eigenfrequencies. Sand knows where to settle.',
    hue:   '230 75%',
  },
]

export function Studies() {
  const reduced = useReducedMotion()
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)

  // Horizontal travel in PIXELS = how far the track overflows the viewport.
  // Measured from real layout so the translate never over/under-shoots (the old
  // percentage approximation flung the track thousands of px off-screen).
  const [maxShift, setMaxShift] = useState(0)
  useEffect(() => {
    const measure = () => {
      const track  = trackRef.current
      const mobile = window.matchMedia('(max-width: 900px)').matches
      if (reduced || mobile || !track) { setMaxShift(0); return }
      setMaxShift(Math.max(0, track.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [reduced])

  // Pin the section via sticky + a padded wrapper; the track translates -X (px) as
  // the wrapper scrolls. Wrapper height = 100vh + maxShift → a natural 1:1 feel.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxShift])

  // Section label entrance
  const labelVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.6, ease: [0.16,1,0.3,1] } },
  }

  const pinActive = maxShift > 0

  return (
    <div
      ref={sectionRef}
      className="studies-pin-wrapper"
      style={pinActive ? { '--pin-height': `calc(100vh + ${maxShift}px)` } : undefined}
    >
      <section
        className={`studies studies--pin-active`}
        aria-label="Studies in Light"
      >
        <div className="studies__header">
          <motion.span
            className="studies__section-label"
            data-reveal="studies-label"
            variants={labelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            Studies in Light
          </motion.span>
          <p className="studies__section-sub">
            An ongoing series of generative investigations.
          </p>
        </div>

        {/* Track — pinned, translateX-driven on desktop */}
        <motion.div
          ref={trackRef}
          className="studies__track"
          data-studies-track
          style={pinActive ? { x } : undefined}
        >
          {studies.map(({ index, id, title, year, caption, hue }) => (
            <article
              key={id}
              className="studies__panel"
              data-studies-panel
              data-panel-index={index}
              aria-label={title}
            >
              {/* Generative thumbnail — a still rendered from the aurora engine */}
              <div
                className="studies__thumb"
                data-studies-thumb
                data-study-id={id}
                style={{ '--study-hue': hue }}
                aria-hidden="true"
              >
                <img
                  className="studies__thumb-img"
                  src={`/studies/${id}.jpeg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="studies__panel-body">
                <div className="studies__panel-meta">
                  <span className="studies__panel-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="studies__panel-year">{year}</span>
                </div>
                <h3 className="studies__panel-title">{title}</h3>
                <p className="studies__panel-caption">{caption}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </section>

      <style>{`
        /* ---- Pin wrapper — provides the scroll distance for horizontal travel ---- */
        .studies-pin-wrapper {
          position: relative;
          height: var(--pin-height, auto);
        }

        /* ---- Sticky container — stays in view while wrapper scrolls ---- */
        .studies.studies--pin-active {
          background: var(--surface);
          border-top: 1px solid var(--line);
          overflow: hidden;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding-top: var(--space-16);
        }

        /* Section header stays in normal flow */
        .studies__header {
          padding: 0 var(--gutter) var(--space-8);
          max-width: var(--max-width);
          margin: 0 auto;
          width: 100%;
        }

        .studies__section-label {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: var(--space-2);
          will-change: opacity, transform;
        }

        .studies__section-sub {
          font-size: var(--type-sm);
          color: var(--muted);
        }

        /* ---- Desktop: horizontal track ---- */
        .studies__track {
          display: flex;
          flex-direction: row;
          gap: var(--space-4);
          padding: 0 var(--gutter) var(--space-16);
          width: max-content;
          flex: 1;
          align-items: flex-start;
        }

        /* ---- Each panel ---- */
        .studies__panel {
          flex: 0 0 auto;
          width: clamp(280px, 38vw, 520px);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color var(--duration-base) var(--ease-out-expo);
        }

        .studies__panel:hover {
          border-color: rgba(124, 92, 255, .25);
        }

        /* Thumbnail placeholder */
        .studies__thumb {
          aspect-ratio: 4 / 3;
          background: linear-gradient(
            135deg,
            hsl(var(--study-hue) 12% / .15) 0%,
            hsl(var(--study-hue) 20% / .08) 100%
          );
          position: relative;
          overflow: hidden;
        }

        .studies__thumb-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform var(--duration-slow, 640ms) var(--ease-out-expo);
        }

        .studies__panel:hover .studies__thumb-img {
          transform: scale(1.04);
        }

        .studies__thumb::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.6;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .studies__panel-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .studies__panel-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .studies__panel-index,
        .studies__panel-year {
          font-family: var(--font-mono);
          font-size: var(--type-xs);
          color: var(--muted);
          letter-spacing: var(--tracking-wide);
        }

        .studies__panel-title {
          font-family: var(--font-display);
          font-size: var(--type-display-md);
          font-weight: 300;
          letter-spacing: var(--tracking-tight);
          line-height: 1.2;
          color: var(--ink);
        }

        .studies__panel-caption {
          font-size: var(--type-sm);
          color: var(--muted);
          line-height: 1.55;
        }

        /* ---- MOBILE / reduced-motion fallback (CSS-only, no JS) ---- */
        @media (max-width: 900px) {
          .studies-pin-wrapper {
            height: auto !important;
          }

          .studies.studies--pin-active {
            position: static;
            height: auto;
            overflow: visible;
            padding-top: var(--space-16);
          }

          .studies__track {
            flex-direction: column;
            width: auto;
            padding: 0 var(--gutter) var(--space-8);
            gap: var(--space-4);
            /* Framer's x transform won't apply when guard fires but reset anyway */
            transform: none !important;
          }

          .studies__panel {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .studies-pin-wrapper {
            height: auto !important;
          }

          .studies.studies--pin-active {
            position: static;
            height: auto;
            overflow: visible;
          }

          .studies__track {
            flex-direction: column;
            width: auto;
            padding: 0 var(--gutter) var(--space-8);
            transform: none !important;
          }

          .studies__panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
