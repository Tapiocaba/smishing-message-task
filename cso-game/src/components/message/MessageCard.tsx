import type { SpamTestScenario, FeatureFlags } from '../../types'
import { LinkRiskBadge } from './LinkRiskBadge'
import { SenderContextStrip } from './SenderContextStrip'
import { TieredRiskDot } from './TieredRiskDot'
import styles from './MessageCard.module.css'

interface Props {
  scenario: SpamTestScenario
  flags: FeatureFlags
  isFeaturesActive: boolean
}

export function MessageCard({ scenario, flags, isFeaturesActive }: Props) {
  const showTieredDot = isFeaturesActive && flags.tieredRiskDot
  const showContextStrip = isFeaturesActive && flags.senderContextStrip
  const showLinkRisk = isFeaturesActive && flags.linkRiskAnnotation

  return (
    <div className={styles.smsCard}>
      {/* Contact header */}
      <div className={styles.contactHeader}>
        <div className={styles.avatar}>
          {/* Generic person silhouette */}
          <svg className={styles.avatarIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <div className={styles.contactInfo}>
          <div className={styles.contactNameRow}>
            <span className={styles.displayName}>{scenario.sender.displayName}</span>
            {showTieredDot && (
              <TieredRiskDot scenario={scenario} isActive={showTieredDot} />
            )}
          </div>
          <div className={styles.phoneNumber}>{scenario.sender.phoneNumber}</div>
        </div>
      </div>

      {/* Chat area */}
      <div className={styles.chatArea}>
        <div className={styles.bubble}>
          <LinkRiskBadge
            body={scenario.body}
            urlRisk={scenario.urlRisk}
            isActive={showLinkRisk}
          />
        </div>

        <SenderContextStrip
          scenario={scenario}
          isActive={showContextStrip}
        />
      </div>
    </div>
  )
}
