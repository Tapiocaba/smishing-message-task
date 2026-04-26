import type { SmishingScenario } from '../../types'
import styles from './DeletedMessages.module.css'

interface Props {
  deletedScenarios: SmishingScenario[]
  onBack: () => void
  isConsolidatedActive?: boolean
}

export function DeletedMessages({ deletedScenarios, onBack, isConsolidatedActive = false }: Props) {
  return (
    <div className={styles.screen}>
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg viewBox="0 0 10 17" width="10" height="17" fill="none">
            <path d="M9 1L1 8.5 9 16" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.backLabel}>Messages</span>
        </button>
        <span className={styles.navTitle}>Recently Deleted</span>
        <div style={{ width: 80 }} />
      </div>

      <div className={styles.list}>
        {deletedScenarios.length === 0 ? (
          <div className={styles.empty}>No recently deleted messages.</div>
        ) : (
          deletedScenarios.map(scenario => (
            <div key={scenario.id} className={styles.row}>
              <div className={styles.avatarCircle}>
                <span className={styles.avatarInitial}>
                  {scenario.sender.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={styles.content}>
                <div className={styles.rowTop}>
                  <span className={styles.senderName}>{scenario.sender.displayName}</span>
                  <span className={`${styles.spamBadge} ${isConsolidatedActive ? styles.spamBadgeActive : ''}`}>
                    {isConsolidatedActive ? '🗑️ SPAM' : 'Spam'}
                  </span>
                </div>
                <span className={styles.preview}>
                  {scenario.body.replace(/\n/g, ' ').slice(0, 70)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerNote}>
          Reported messages are read-only. Your judgement has been recorded.
        </p>
      </div>
    </div>
  )
}
