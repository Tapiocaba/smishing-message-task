import { useEffect, useState } from 'react'
import type { SpamTestScenario } from '../../types'
import styles from './NotificationBanner.module.css'

interface Props {
  scenario: SpamTestScenario
  isFeatureActive: boolean
  onDismiss: () => void
}

export function NotificationBanner({ scenario, isFeatureActive, onDismiss }: Props) {
  const [dismissing, setDismissing] = useState(false)

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setDismissing(true)
    }, 1700)

    return () => clearTimeout(dismissTimer)
  }, [scenario.id])

  useEffect(() => {
    if (!dismissing) return
    const t = setTimeout(onDismiss, 250)
    return () => clearTimeout(t)
  }, [dismissing, onDismiss])

  const preview = scenario.body.length > 60
    ? scenario.body.slice(0, 60) + '…'
    : scenario.body

  return (
    <div className={`${styles.wrapper} ${dismissing ? styles.dismissing : ''}`}>
      <div className={`${styles.banner} ${isFeatureActive ? styles.bannerFeature : styles.bannerControl}`}>
        <div className={styles.header}>
          <span className={styles.appLabel}>
            <span className={styles.appIcon}>📱</span>
            Signal
          </span>
          <span className={styles.timeLabel}>now</span>
        </div>

        <div className={styles.title}>
          {isFeatureActive && (
            <span className={styles.spamBadge}>⚠ Spam Likely</span>
          )}
          {scenario.sender.displayName}
        </div>

        <div className={styles.preview}>{preview}</div>
      </div>
    </div>
  )
}
