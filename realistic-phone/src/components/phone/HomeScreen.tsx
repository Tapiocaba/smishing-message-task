import styles from './HomeScreen.module.css'

function MessagesAppIcon() {
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <rect width="60" height="60" rx="14" fill="#34c759" />
      <path
        d="M30 12C19.5 12 11 19.6 11 29c0 4.9 2.3 9.3 6 12.4l-1.9 6.5 7-2.7C24.2 46 27 46.5 30 46.5c10.5 0 19-7.6 19-17s-8.5-17.5-19-17.5z"
        fill="white"
      />
    </svg>
  )
}

interface Props {
  /** Number of messages not yet judged (shows as red badge). */
  unreadCount: number
  /** Whether any scenarios have been received at all. */
  hasReceived: boolean
  /** Called when the user taps the Messages icon. */
  onOpenMessages: () => void
}

export function HomeScreen({ unreadCount, hasReceived, onOpenMessages }: Props) {
  return (
    <div className={styles.homeScreen}>
      {/* Subtle dark wallpaper */}
      <div className={styles.wallpaper} />

      <div className={styles.content}>
        {hasReceived ? (
          <div className={styles.appGrid}>
            <button className={styles.appIcon} onClick={onOpenMessages} aria-label="Open Messages">
              <div className={styles.iconWrapper}>
                <MessagesAppIcon />
                {unreadCount > 0 && (
                  <div className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</div>
                )}
              </div>
              <span className={styles.appLabel}>Messages</span>
            </button>
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <path d="M24 14v14M24 34v2" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.emptyText}>No messages yet</p>
            <p className={styles.emptySubtext}>Your incoming messages will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
