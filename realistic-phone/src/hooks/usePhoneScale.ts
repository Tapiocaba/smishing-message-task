import { useState, useEffect } from 'react'

const FRAME_HEIGHT = 852
const PADDING = 120 // header + body padding allowance

/**
 * Returns a scale factor in [0.5, 1.0] so the phone frame fits in the viewport.
 * Applied as transform: scale() on the PhoneFrame outerFrame div.
 */
export function usePhoneScale(): number {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function compute() {
      const available = window.innerHeight - PADDING
      setScale(Math.min(1, Math.max(0.5, available / FRAME_HEIGHT)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return scale
}
