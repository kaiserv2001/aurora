// owner: motion-designer
// Lenis smooth-scroll provider.
// autoRaf: false — we run ONE top-level requestAnimationFrame so shader-artist's r3f useFrame
// and Lenis share a single tick, avoiding stacked loops and jank.
// Framer Motion useScroll + useLenis scroll-events are the only ways to derive scroll values.

import { useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Single top-level rAF loop — feeds Lenis only.
    // r3f (shader-artist) owns its own useFrame which Vite/r3f starts automatically.
    // We deliberately do NOT nest here; if shader-artist ever needs to sync Lenis they
    // can call useLenis() and read lenis.scroll inside their useFrame.
    let rafId

    function loop(time) {
      lenisRef.current?.lenis?.raf(time)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,   // we drive it above
        lerp: 0.085,      // smooth, weighted feel
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
