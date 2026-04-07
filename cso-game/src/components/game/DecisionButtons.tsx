import type { UserDecision } from '../../types'
import styles from './DecisionButtons.module.css'

interface Props {
  onDecision: (d: UserDecision) => void
  disabled: boolean
}

const BUTTONS: { decision: UserDecision; label: string; className: string }[] = [
  { decision: 'ignore', label: 'Ignore',  className: styles.ignore },
  { decision: 'open',   label: 'Open',    className: styles.open },
  { decision: 'verify', label: 'Verify',  className: styles.verify },
  { decision: 'report', label: 'Report',  className: styles.report },
]

export function DecisionButtons({ onDecision, disabled }: Props) {
  return (
    <div className={styles.row}>
      {BUTTONS.map(({ decision, label, className }) => (
        <button
          key={decision}
          className={`${styles.btn} ${className}`}
          onClick={() => onDecision(decision)}
          disabled={disabled}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
