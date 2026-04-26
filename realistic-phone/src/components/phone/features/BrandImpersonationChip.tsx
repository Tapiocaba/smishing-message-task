import type { SmishingScenario } from '../../../types'
import styles from './BrandImpersonationChip.module.css'

interface Props {
  scenario: SmishingScenario
  isActive: boolean
}

export function BrandImpersonationChip({ scenario, isActive }: Props) {
  if (!isActive || !scenario.hasImpersonationPattern) return null

  return (
    <div className={styles.chip}>
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
        <path d="M8 1.5L1 14h14L8 1.5z" stroke="#ff3b30" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="#ff3b30" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="11.5" r="0.75" fill="#ff3b30"/>
      </svg>
      <span>Claiming to be <strong>{scenario.sender.displayName}</strong></span>
    </div>
  )
}
