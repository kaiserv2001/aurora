// owner: shader-artist
// Aurora hero canvas — fullscreen plane with a domain-warped flow-field shader.
// Luminous violet→teal ribbons on a near-white page via alpha-composited NormalBlending.
// Reads cursor from useCursor() → uMouse uniform; derives velocity internally.

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCursor } from '../../providers/CursorContext'
import { vertexShader, fragmentShader } from '../../shaders/aurora'

// prefers-reduced-motion check — evaluated once at module load
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Scene ──────────────────────────────────────────────────────────────────

function Scene() {
  const matRef    = useRef(null)
  const meshRef   = useRef(null)
  // useCursor() returns the stable pos ref — read .current.{x,y} each frame
  const cursorRef = useCursor()
  const { size, gl } = useThree()

  // Previous mouse position — used to derive velocity without external dep
  const prevMouse = useRef({ x: 0.5, y: 0.5 })
  // Smoothed velocity — exponential decay so velocity fades after cursor stops
  const smoothVel = useRef({ x: 0, y: 0 })

  // Intersection observer: pause frameloop when hero is off-screen
  const canvasEl = gl.domElement
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        gl.setAnimationLoop(entry.isIntersecting ? undefined : null)
      },
      { threshold: 0.0 }
    )
    obs.observe(canvasEl)
    return () => obs.disconnect()
  }, [canvasEl, gl])

  // Build the ShaderMaterial once
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      // NormalBlending + straight alpha: ribbon color composites over the white page.
      // Alpha=0 → white shows through; alpha=1 → full violet/teal ribbon.
      // (premultipliedAlpha:false on the Canvas gl context matches this output.)
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime:       { value: 0.0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVel:   { value: new THREE.Vector2(0.0, 0.0) },
        // Violet #7C5CFF → teal #2DD4BF — from design tokens
        uColorA:     { value: new THREE.Color('#7C5CFF') },
        uColorB:     { value: new THREE.Color('#2DD4BF') },
        // uIntensity: tunable by layout-stylist / theming if desired
        uIntensity:  { value: 1.15 },
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally omit size — handled in useFrame below

  // Drive uniforms every frame — mutate in place (r3f v9 pattern)
  useFrame((_, delta) => {
    const mat = matRef.current
    if (!mat) return

    // Time: freeze or crawl on reduced-motion
    if (prefersReducedMotion) {
      mat.uniforms.uTime.value += delta * 0.02 // near-static — barely drifts
    } else {
      mat.uniforms.uTime.value += delta * 0.45
    }

    // Resolution (handles resize)
    const { width, height } = gl.domElement.getBoundingClientRect()
    if (
      mat.uniforms.uResolution.value.x !== width ||
      mat.uniforms.uResolution.value.y !== height
    ) {
      mat.uniforms.uResolution.value.set(width, height)
    }

    // Cursor: useCursor() returns a stable ref — read .current each frame.
    // Defensive fallback to 0.5,0.5 if the ref hasn't been populated yet.
    const cur = cursorRef?.current ?? { x: 0.5, y: 0.5 }
    const cx  = typeof cur.x === 'number' ? cur.x : 0.5
    const cy  = typeof cur.y === 'number' ? cur.y : 0.5

    // Velocity: frame-to-frame delta (no external dep)
    const raw_dvx = cx - prevMouse.current.x
    const raw_dvy = cy - prevMouse.current.y
    prevMouse.current.x = cx
    prevMouse.current.y = cy

    // Exponential smoothing: vel decays to zero when cursor stops
    const decay = 0.12 // lower = longer tail
    smoothVel.current.x = smoothVel.current.x * (1 - decay) + raw_dvx * decay
    smoothVel.current.y = smoothVel.current.y * (1 - decay) + raw_dvy * decay

    mat.uniforms.uMouse.value.set(cx, cy)
    mat.uniforms.uMouseVel.value.set(smoothVel.current.x, smoothVel.current.y)
  })

  // Full-viewport plane: 2 units wide in clip space — covers the view at orthographic fov
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  )
}

// ── Canvas wrapper ─────────────────────────────────────────────────────────

// Lazy-loadable: caller (Hero.jsx) wraps with React.lazy / Suspense if desired.
// dpr=[1, 1.75] is the architect-set budget; Scene stays within it.
export function AuroraCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: false,        // not needed on a fullscreen 2D shader
        alpha: true,             // transparent canvas so white page shows through
        premultipliedAlpha: false, // straight alpha — matches gl_FragColor output in shader
        powerPreference: 'high-performance',
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      // No orthographic camera — vertex shader is a clip-space passthrough,
      // so camera frustum units are irrelevant.
      // frameloop continuous; off-screen pause handled by IntersectionObserver in Scene.
    >
      <Scene />
    </Canvas>
  )
}
