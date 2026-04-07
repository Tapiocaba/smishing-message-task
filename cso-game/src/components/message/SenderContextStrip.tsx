import type { SpamTestScenario } from '../../types'
import styles from './SenderContextStrip.module.css'

interface Props {
  scenario: SpamTestScenario
  isActive: boolean
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  NG: 'Nigeria',
  DO: 'Dominican Republic',
  CA: 'Canada',
  GB: 'United Kingdom',
}

export function SenderContextStrip({ scenario, isActive }: Props) {
  if (!isActive || scenario.sender.messageCount > 0) return null

  const countryName = COUNTRY_NAMES[scenario.sender.countryCode] ?? scenario.sender.countryCode

  return (
    <div className={styles.strip}>
      <div className={styles.infoRow}>
        <span>{scenario.sender.countryFlag}</span>
        <span className={styles.label}>{countryName}</span>
        <span className={styles.dot}>·</span>
        <span>First contact: <strong>{scenario.sender.firstContactLabel}</strong></span>
        <span className={styles.dot}>·</span>
        <span>{scenario.sender.messageCount} prior messages</span>
      </div>
      {scenario.hasImpersonationPattern && (
        <div className={styles.impersonationWarning}>
          <span>⚠</span>
          <span>Claims to be a known contact from a new number</span>
        </div>
      )}
    </div>
  )
}
