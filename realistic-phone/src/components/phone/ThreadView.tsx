import { useState } from 'react'
import type { ReactNode } from 'react'
import type { SmishingScenario, UserDecision, ActiveFeatures } from '../../types'
import { MessageBubble } from './MessageBubble'
import { BrandImpersonationChip } from './features/BrandImpersonationChip'
import { CategoryChip } from './features/CategoryChip'
import { RiskContextBar } from './features/RiskContextBar'
import { IsExpectedPrompt } from './features/IsExpectedPrompt'
import { BlurWarning } from './features/BlurWarning'
import styles from './ThreadView.module.css'

const ALL_OFF: ActiveFeatures = {
  brandImpersonation: false,
  linkRiskAnnotation: false,
  messageCategoryChip: false,
  notificationSpamLabel: false,
  consolidatedAction: false,
  expandableRiskBar: false,
  isExpectedPrompt: false,
  tieredBlurWarning: false,
}

interface Props {
  scenario: SmishingScenario
  judgement: UserDecision | null
  onBack: () => void
  onReply?: () => void   // only provided for the current (unjudged) trial
  children?: ReactNode   // ReplySheet mounts here
  activeFeatures?: ActiveFeatures
}

export function ThreadView({ scenario, judgement, onBack, onReply, children, activeFeatures = ALL_OFF }: Props) {
  const [expectedAcknowledged, setExpectedAcknowledged] = useState(false)
  const [blurRevealed, setBlurRevealed] = useState(false)

  const promptTriggered =
    activeFeatures.isExpectedPrompt &&
    (scenario.category === 'packageDelivery' || scenario.category === 'financialDeception') &&
    !judgement

  const showReply = onReply && !judgement && (!promptTriggered || expectedAcknowledged)

  return (
    <div className={styles.screen}>
      {/* iOS nav bar */}
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg viewBox="0 0 10 17" width="10" height="17" fill="none">
            <path d="M9 1L1 8.5 9 16" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.backLabel}>Messages</span>
        </button>
        <div className={styles.senderHeader}>
          <div className={styles.avatarSmall}>
            <span>{scenario.sender.displayName.charAt(0).toUpperCase()}</span>
          </div>
          <span className={styles.senderName}>{scenario.sender.displayName}</span>
        </div>
        <div className={styles.navActions}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="5" r="1.5" fill="#007aff" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="#007aff" stroke="none"/>
            <circle cx="12" cy="19" r="1.5" fill="#007aff" stroke="none"/>
          </svg>
        </div>
      </div>

      {/* Thread */}
      <div className={styles.thread}>
        <div className={styles.dateSeparator}>Today</div>

        <div className={styles.chipRow}>
          <CategoryChip scenario={scenario} isActive={activeFeatures.messageCategoryChip} />
          <BrandImpersonationChip scenario={scenario} isActive={activeFeatures.brandImpersonation} />
          {activeFeatures.notificationSpamLabel &&
           !activeFeatures.expandableRiskBar &&
           (scenario.urlRisk !== 'safe' || scenario.hasImpersonationPattern) && (
            <span className={styles.spamChip}>🚨 Possible Spam</span>
          )}
        </div>

        {scenario.threadPreamble.map((text, i) => (
          <MessageBubble key={`pre-${i}`} text={text} isNew={false} />
        ))}
        <BlurWarning
          scenario={scenario}
          isActive={activeFeatures.tieredBlurWarning && !judgement && !blurRevealed}
          onReveal={() => setBlurRevealed(true)}
        >
          <MessageBubble
            key={scenario.id}
            text={scenario.body}
            isNew={!judgement}
            urlRisk={scenario.urlRisk}
            isLinkRiskActive={activeFeatures.linkRiskAnnotation}
          />
        </BlurWarning>

        {/* When both features are on, the prompt lives inside the risk bar */}
        <RiskContextBar
          scenario={scenario}
          isActive={activeFeatures.expandableRiskBar}
          blurRevealed={blurRevealed}
          showExpectedPrompt={
            activeFeatures.expandableRiskBar &&
            activeFeatures.isExpectedPrompt &&
            promptTriggered &&
            !expectedAcknowledged
          }
          onAcknowledge={() => setExpectedAcknowledged(true)}
        />

        {/* Standalone prompt only when risk bar is off */}
        {!activeFeatures.expandableRiskBar && promptTriggered && !expectedAcknowledged && (
          <IsExpectedPrompt
            scenario={scenario}
            isActive
            onAcknowledge={() => setExpectedAcknowledged(true)}
          />
        )}

        {/* Post-decision label */}
        {judgement && (
          <div className={`${styles.judgementLabel} ${judgement === 'report_delete' ? styles.labelSpam : styles.labelSafe}`}>
            {judgement === 'report_delete'
              ? '🚫 Marked as Spam'
              : '✓ Marked as Not Spam'}
          </div>
        )}
      </div>

      {/* Input bar + Reply */}
      <div className={styles.inputArea}>
        <div className={styles.inputBar}>
          <div className={styles.inputPill}>
            {showReply ? 'Tap Reply to respond' : 'iMessage'}
          </div>
          <div className={styles.sendBtn}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" transform="rotate(-90 12 12)"/>
            </svg>
          </div>
        </div>

        {showReply && (
          <button className={styles.replyBtn} onClick={onReply}>
            Reply
          </button>
        )}
      </div>

      {/* ReplySheet renders on top */}
      {children}
    </div>
  )
}
