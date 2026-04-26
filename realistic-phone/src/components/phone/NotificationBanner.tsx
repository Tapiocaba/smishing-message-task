import type { SmishingScenario } from '../../types'
import { CATEGORY_LABELS } from './features/CategoryChip'
import styles from './NotificationBanner.module.css'

function MessagesIcon() {
  return (
    <div className={styles.appIcon}>
      <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#34c759" />
        <path
          d="M20 8C13.4 8 8 12.9 8 19c0 3.2 1.5 6.1 3.9 8.1L10 32l5.4-2.1C16.9 30.6 18.4 31 20 31c6.6 0 12-4.9 12-11S26.6 8 20 8z"
          fill="white"
        />
      </svg>
    </div>
  )
}

interface Props {
  scenario: SmishingScenario
  onTap: () => void
  isSpamActive?: boolean
  isCategoryChipActive?: boolean
}

export function NotificationBanner({ scenario, onTap, isSpamActive = false, isCategoryChipActive = false }: Props) {
  const preview = scenario.body.replace(/\n/g, ' ').slice(0, 80)
  const showSpamLabel =
    isSpamActive && (scenario.urlRisk !== 'safe' || scenario.hasImpersonationPattern)
  const showCategory = isCategoryChipActive

  return (
    <button className={styles.banner} onClick={onTap} aria-label="Open message notification">
      <MessagesIcon />
      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.appName}>Messages</span>
          <span className={styles.time}>now</span>
        </div>
        <div className={styles.sender}>{scenario.sender.displayName}</div>
        <div className={styles.preview}>{preview}</div>
        {(showCategory || showSpamLabel) && (
          <div className={styles.labelRow}>
            {showCategory && (
              <span className={styles.categoryLabel}>
                {CATEGORY_LABELS[scenario.category]}
              </span>
            )}
            {showSpamLabel && (
              <span className={styles.spamLabel}>🚨 Possible Spam</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
