// owner: motion-designer
// useMagnetic — attaches magnetic pull behavior to a [data-magnetic] wrapper.
// The wrapper listens to pointermove and translates its .btn-magnetic__inner child
// by 0.35× the offset from center. Spring-releases on pointerleave.
// prefers-reduced-motion: no-ops entirely (native cursor and layout unchanged).

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

const PULL_FACTOR = 0.35

export function useMagnetic(wrapperRef) {
  const innerRef = useRef(null)
  const cancelX = useRef(null)
  const cancelY = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const wrap = wrapperRef.current
    if (!wrap) return

    // Find the physical moving element inside the wrapper
    const inner = wrap.querySelector('.btn-magnetic__inner')
    if (!inner) return
    innerRef.current = inner

    let currentX = 0
    let currentY = 0

    function onPointerMove(e) {
      const rect = wrap.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const offsetX = (e.clientX - centerX) * PULL_FACTOR
      const offsetY = (e.clientY - centerY) * PULL_FACTOR

      // Cancel any in-flight spring-back
      cancelX.current?.()
      cancelY.current?.()

      // Animate to pulled position
      cancelX.current = animate(currentX, offsetX, {
        type: 'spring',
        stiffness: 300,
        damping: 28,
        mass: 0.6,
        onUpdate: (v) => {
          currentX = v
          inner.style.transform = `translate(${currentX}px, ${currentY}px)`
        },
      }).stop

      cancelY.current = animate(currentY, offsetY, {
        type: 'spring',
        stiffness: 300,
        damping: 28,
        mass: 0.6,
        onUpdate: (v) => {
          currentY = v
          inner.style.transform = `translate(${currentX}px, ${currentY}px)`
        },
      }).stop
    }

    function onPointerLeave() {
      // Cancel any in-flight pull
      cancelX.current?.()
      cancelY.current?.()

      // Spring back to center
      cancelX.current = animate(currentX, 0, {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        mass: 0.7,
        onUpdate: (v) => {
          currentX = v
          inner.style.transform = `translate(${currentX}px, ${currentY}px)`
        },
      }).stop

      cancelY.current = animate(currentY, 0, {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        mass: 0.7,
        onUpdate: (v) => {
          currentY = v
          inner.style.transform = `translate(${currentX}px, ${currentY}px)`
        },
      }).stop
    }

    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerleave', onPointerLeave)

    return () => {
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      cancelX.current?.()
      cancelY.current?.()
    }
  }, [wrapperRef])
}
