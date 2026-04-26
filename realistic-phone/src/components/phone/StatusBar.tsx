import { useState, useEffect } from 'react'
import styles from './StatusBar.module.css'

function getTimeStr() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function SignalBars() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="4.5" y="5" width="3" height="7" rx="1" />
      <rect x="9" y="2" width="3" height="10" rx="1" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.3" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M1 4.5C3.5 2 6.6 0.7 8 0.7s4.5 1.3 7 3.8" />
      <path d="M3 7C4.5 5.5 6.2 4.5 8 4.5s3.5 1 5 2.5" />
      <path d="M5.5 9.5C6.3 8.7 7.1 8.2 8 8.2s1.7.5 2.5 1.3" />
      <circle cx="8" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4" />
      <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
    </svg>
  )
}

interface Props {
  /** dark=true → dark text on white background (Messages app). dark=false → white text on dark (lock screen). */
  dark?: boolean
}

export function StatusBar({ dark = false }: Props) {
  const [time, setTime] = useState(getTimeStr)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeStr()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`${styles.statusBar} ${dark ? styles.statusBarDark : styles.statusBarLight}`}>
      <span className={styles.time}>{time}</span>
      <div className={styles.indicators}>
        <SignalBars />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}
