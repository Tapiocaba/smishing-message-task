import { useState } from 'react'
import type { SpamTestScenario } from '../../types'
import styles from './TieredRiskDot.module.css'

interface Props {
  scenario: SpamTestScenario
  isActive: boolean
}

export function TieredRiskDot({ scenario, isActive }: Props) {
  const [state, setState] = useState<0 | 1 | 2>(0)

  if (!isActive || !scenario.warningReason) return null

  const shortReason = scenario.warningReason.split(/\.\s/)[0]

  function cycle() {
    setState(s => ((s + 1) % 3) as 0 | 1 | 2)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.dot} onClick={cycle} title="Click for risk details" />

      {state === 1 && (
        <span className={styles.shortReason} onClick={cycle}>
          {shortReason}
        </span>
      )}

      {state === 2 && (
        <div className={styles.detailPanel} onClick={cycle}>
          <div className={styles.detailTitle}>Risk Signals</div>
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>URL Risk:</span>
            <span>{scenario.urlRisk}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>Country:</span>
            <span>{scenario.sender.countryFlag} {scenario.sender.countryCode}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>First contact:</span>
            <span>{scenario.sender.firstContactLabel}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailKey}>Note:</span>
            <span>{scenario.warningReason}</span>
          </div>
        </div>
      )}
    </div>
  )
}
