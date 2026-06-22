// owner: motion-designer + shader-artist
// Shared pointer context — single source of truth for normalized [x, y] cursor position.
// shader-artist reads pos.current.{x, y} from useCursor() for the uMouse shader uniform.
// motion-designer attaches the pointermove listener here.
// CONTRACT: pos.current always has shape { x, y } (normalized 0..1).
// Never remove or rename x/y — shader-artist depends on them.

import { createContext, useContext, useEffect, useRef } from 'react'

const CursorCtx = createContext(null)

export function CursorContext({ children }) {
  // pos is a stable ref — writes are direct (.current = {...}) so they never cause re-renders.
  // Consumers that need reactivity should use their own RAF / Framer Motion springs to sample it.
  const pos = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    function onPointerMove(e) {
      pos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return (
    <CursorCtx.Provider value={pos}>
      {children}
    </CursorCtx.Provider>
  )
}

// Returns the stable ref object. Read .current.{x, y} at render/rAF time.
export function useCursor() {
  return useContext(CursorCtx)
}
