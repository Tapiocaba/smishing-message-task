import type { UserDecision } from '../../types'
import styles from './ReplySheet.module.css'

interface Props {
  onDecision: (d: UserDecision) => void
  onCancel: () => void
  isConsolidatedActive?: boolean
}

export function ReplySheet({ onDecision, onCancel, isConsolidatedActive = false }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.sheet}>
        <div className={styles.mainCard}>
          {isConsolidatedActive ? (
            <>
              <button
                className={`${styles.btn} ${styles.btnConsolidatedReport}`}
                onClick={() => onDecision('report_delete')}
              >
                🗑️ Delete &amp; Report Spam
              </button>
              <div className={styles.divider} />
              <button
                className={`${styles.btn} ${styles.btnConsolidatedSafe}`}
                onClick={() => onDecision('not_spam')}
              >
                ✓ Not Spam
              </button>
            </>
          ) : (
            <>
              <button
                className={`${styles.btn} ${styles.btnNotSpam}`}
                onClick={() => onDecision('not_spam')}
              >
                Not Spam
              </button>
              <div className={styles.divider} />
              <button
                className={`${styles.btn} ${styles.btnReport}`}
                onClick={() => onDecision('report_delete')}
              >
                Report Spam and Delete
              </button>
            </>
          )}
        </div>

        <button className={`${styles.cancelCard} ${styles.btn}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
