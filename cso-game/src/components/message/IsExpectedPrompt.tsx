import type { SpamTestScenario } from '../../types'
import styles from './IsExpectedPrompt.module.css'

interface Props {
  scenario: SpamTestScenario
  isActive: boolean
  onExpecting: () => void
  onNotExpecting: () => void
}

export function IsExpectedPrompt({ scenario, isActive, onExpecting, onNotExpecting }: Props) {
  if (!isActive || scenario.category !== 'packageDelivery' || scenario.urlRisk === 'safe') {
    return null
  }

  return (
    <div className={styles.prompt}>
      <span className={styles.question}>Are you expecting a package?</span>
      <div className={styles.actions}>
        <button className={styles.btnYes} onClick={onExpecting}>
          Yes, expecting one
        </button>
        <button className={styles.btnNo} onClick={onNotExpecting}>
          No
        </button>
      </div>
    </div>
  )
}
