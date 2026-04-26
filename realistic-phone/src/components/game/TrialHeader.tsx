import styles from './TrialHeader.module.css'

interface Props {
  blockNumber: 1 | 2
  trialIndex: number
  totalTrials: number
  conditionLabel: string
}

export function TrialHeader({ blockNumber, trialIndex, totalTrials, conditionLabel }: Props) {
  return (
    <div className={styles.header}>
      <span className={styles.meta}>
        Round {blockNumber} of 2 &nbsp;·&nbsp; Message {trialIndex + 1} of {totalTrials}
      </span>
      <div className={styles.dots}>
        {Array.from({ length: totalTrials }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < trialIndex ? styles.dotDone : ''} ${i === trialIndex ? styles.dotCurrent : ''}`}
          />
        ))}
      </div>
      {conditionLabel !== 'control' && (
        <span className={styles.conditionBadge}>{conditionLabel}</span>
      )}
    </div>
  )
}
