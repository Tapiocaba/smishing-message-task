import type { SmishingScenario } from '../../../types'
import styles from './IsExpectedPrompt.module.css'

interface Props {
  scenario: SmishingScenario
  isActive: boolean
  onAcknowledge: (response: boolean) => void
}

export function IsExpectedPrompt({ scenario, isActive, onAcknowledge }: Props) {
  const triggered =
    scenario.category === 'packageDelivery' || scenario.category === 'financialDeception'

  if (!isActive || !triggered) return null

  return (
    <div className={styles.banner}>
      <span className={styles.question}>Are you expecting this message?</span>
      <div className={styles.buttons}>
        <button
          className={`${styles.btn} ${styles.btnYes}`}
          onClick={() => onAcknowledge(true)}
        >
          Yes ✓
        </button>
        <button
          className={`${styles.btn} ${styles.btnNo}`}
          onClick={() => onAcknowledge(false)}
        >
          No ✗
        </button>
      </div>
    </div>
  )
}
