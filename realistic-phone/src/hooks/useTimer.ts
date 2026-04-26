import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Counts elapsed milliseconds upward from 0.
 * No expiry — purely a background measurement tool.
 */
export function useTimer() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clear()
    startTimeRef.current = performance.now()
    setElapsedMs(0)
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startTimeRef.current))
    }, 100)
  }, [clear])

  const stop = useCallback(() => {
    clear()
    setIsRunning(false)
    return Math.round(performance.now() - startTimeRef.current)
  }, [clear])

  const reset = useCallback(() => {
    clear()
    setElapsedMs(0)
    setIsRunning(false)
  }, [clear])

  useEffect(() => () => clear(), [clear])

  return { elapsedMs, isRunning, start, stop, reset }
}
