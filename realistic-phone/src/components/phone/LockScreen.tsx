import { useState, useEffect } from 'react'
import type { SmishingScenario } from '../../types'
import type { FakeNotif } from '../../hooks/usePhoneState'
import { NotificationBanner } from './NotificationBanner'
import styles from './LockScreen.module.css'

function getTimeStr() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function getDateStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function FakeNotifBanner({ sender, preview }: Omit<FakeNotif, 'id'>) {
  return (
    <div className={styles.fakeBanner} aria-hidden="true">
      <div className={styles.fakeIcon}>
        <span className={styles.fakeIconLetter}>{sender[0]}</span>
      </div>
      <div className={styles.fakeBannerContent}>
        <div className={styles.fakeBannerRow}>
          <span className={styles.fakeBannerApp}>{sender}</span>
          <span className={styles.fakeBannerTime}>now</span>
        </div>
        <div className={styles.fakeBannerPreview}>{preview}</div>
      </div>
    </div>
  )
}

interface Props {
  showBanner: boolean
  scenario: SmishingScenario | null
  onTapBanner: () => void
  sleeping: boolean
  onTapLocked: () => void
  fakeNotifStack: FakeNotif[]
  onGoToMessages: () => void
  isSpamActive?: boolean
  isCategoryChipActive?: boolean
}

export function LockScreen({ showBanner, scenario, onTapBanner, sleeping, onTapLocked, fakeNotifStack, onGoToMessages, isSpamActive = false, isCategoryChipActive = false }: Props) {
  const [time, setTime] = useState(getTimeStr)
  const [date] = useState(getDateStr)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeStr()), 60_000)
    return () => clearInterval(id)
  }, [])

  const isLit = !sleeping
  const hasNotification = showBanner && !!scenario
  const hasStacked = fakeNotifStack.length > 0

  return (
    <div
      className={styles.lockScreen}
      onClick={sleeping ? onTapLocked : undefined}
    >
      {/* Wallpaper gradient — fades in when lit */}
      <div className={`${styles.wallpaper} ${isLit ? styles.visible : ''}`} />

      {/* Content — fades in/out with pointer-events toggled */}
      <div className={`${styles.content} ${isLit ? styles.visible : ''}`}>

        {/* Clock — always at the top of the lit lock screen */}
        <div className={styles.clockArea}>
          <div className={styles.time}>{time}</div>
          <div className={styles.date}>{date}</div>
        </div>

        {/* Notification banners flow BELOW the clock, clear of Dynamic Island */}
        {(hasNotification || hasStacked) && (
          <div className={styles.notifContainer}>
            {fakeNotifStack.map(n => (
              <FakeNotifBanner key={n.id} sender={n.sender} preview={n.preview} />
            ))}
            {hasNotification && (
              <NotificationBanner
                scenario={scenario!}
                onTap={onTapBanner}
                isSpamActive={isSpamActive}
                isCategoryChipActive={isCategoryChipActive}
              />
            )}
          </div>
        )}

        {!hasNotification && (
          <div className={styles.noNotifs}>No New Notifications</div>
        )}

        {hasNotification && (
          <div className={styles.swipeHint}>Tap notification to open</div>
        )}

        {/* Messages shortcut — always visible on lit screen */}
        <button
          className={styles.messagesBtn}
          onClick={onGoToMessages}
          aria-label="Open Messages"
        >
          <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#34c759" />
            <path
              d="M20 8C13.4 8 8 12.9 8 19c0 3.2 1.5 6.1 3.9 8.1L10 32l5.4-2.1C16.9 30.6 18.4 31 20 31c6.6 0 12-4.9 12-11S26.6 8 20 8z"
              fill="white"
            />
          </svg>
          <span className={styles.messagesBtnLabel}>Messages</span>
        </button>
      </div>
    </div>
  )
}
