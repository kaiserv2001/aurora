// owner: motion-designer
// Custom magnetic cursor.
// - Hides the native cursor (CSS: cursor: none on html)
// - Lerps toward the pointer via Framer Motion spring
// - Grows and adds a label ring over [data-magnetic] targets
// - prefers-reduced-motion: renders nothing, native cursor returns

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCursor } from '../providers/CursorContext'

// Spring config — weighted, not snappy
const SPRING = { stiffness: 180, damping: 22, mass: 0.8 }
const SPRING_SCALE = { stiffness: 220, damping: 24, mass: 0.6 }

export function Cursor() {
  const posRef = useCursor()
  const [reduced, setReduced] = useState(false)
  const [hovering, setHovering] = useState(false)
  const frameRef = useRef(null)

  // Raw motion values — updated each rAF from the shared ref so we never add a second event loop
  const mx = useMotionValue(window.innerWidth / 2)
  const my = useMotionValue(window.innerHeight / 2)

  // Springy display values
  const springX = useSpring(mx, SPRING)
  const springY = useSpring(my, SPRING)
  const scale = useSpring(1, SPRING_SCALE)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Sample the shared cursor ref each animation frame — no second event listener
  useEffect(() => {
    if (reduced) return

    function tick() {
      if (posRef?.current) {
        mx.set(posRef.current.x * window.innerWidth)
        my.set(posRef.current.y * window.innerHeight)
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [reduced, posRef, mx, my])

  // Magnetic target hover detection — attach to [data-magnetic] elements
  useEffect(() => {
    if (reduced) return

    function onEnter(e) {
      if (e.currentTarget.dataset.magnetic !== undefined) {
        setHovering(true)
        scale.set(2.2)
      }
    }

    function onLeave(e) {
      if (e.currentTarget.dataset.magnetic !== undefined) {
        setHovering(false)
        scale.set(1)
      }
    }

    const targets = document.querySelectorAll('[data-magnetic]')
    targets.forEach((el) => {
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointerleave', onLeave)
    })

    return () => {
      targets.forEach((el) => {
        el.removeEventListener('pointerenter', onEnter)
        el.removeEventListener('pointerleave', onLeave)
      })
    }
  }, [reduced, scale])

  // Hide native cursor globally when our cursor is active
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = reduced
      ? ''
      : `html, * { cursor: none !important; }`
    style.id = 'aurora-cursor-hide'
    document.head.appendChild(style)
    return () => style.remove()
  }, [reduced])

  if (reduced) return null

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        // Use translate so we offset from top-left origin
        x: springX,
        y: springY,
        // Offset to center the dot on the pointer
        translateX: '-50%',
        translateY: '-50%',
        scale,
        zIndex: 'var(--z-cursor)',
        pointerEvents: 'none',
        mixBlendMode: hovering ? 'difference' : 'normal',
      }}
    >
      {/* Outer ring — only visible on magnetic hover */}
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(124,92,255,0.6)',
          opacity: hovering ? 1 : 0,
          scale: hovering ? 1 : 0.4,
          transition: 'opacity 200ms, scale 200ms',
        }}
      />

      {/* Core dot */}
      <span
        style={{
          display: 'block',
          width: hovering ? 40 : 10,
          height: hovering ? 40 : 10,
          borderRadius: '50%',
          background: hovering ? 'var(--ink)' : 'var(--accent)',
          transition: `width 300ms cubic-bezier(0.34,1.56,0.64,1),
                       height 300ms cubic-bezier(0.34,1.56,0.64,1),
                       background 200ms`,
        }}
      />
    </motion.div>
  )
}
