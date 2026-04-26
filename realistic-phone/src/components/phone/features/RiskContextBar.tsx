import { useState, useEffect } from 'react'
import type { SmishingScenario, URLRiskLevel } from '../../../types'
import styles from './RiskContextBar.module.css'

const RISK_ICONS: Record<URLRiskLevel, string> = {
  safe:       '🔗',
  shortened:  '⚠️',
  suspicious: '⚠️',
  dangerous:  '🔴',
}

const RISK_LABELS: Record<URLRiskLevel, string> = {
  safe:       'Link appears safe',
  shortened:  'Shortened link detected',
  suspicious: 'Suspicious link',
  dangerous:  'Dangerous link detected',
}

interface Props {
  scenario: SmishingScenario
  isActive: boolean
  defaultExpanded?: boolean
  /** When true, the yes/no reflection prompt is embedded at the bottom */
  showExpectedPrompt?: boolean
  onAcknowledge?: () => void
}

export function RiskContextBar({
  scenario,
  isActive,
  defaultExpanded = false,
  showExpectedPrompt = false,
  onAcknowledge,
}: Props) {
  // Auto-expand when there's an embedded prompt so the user sees the question
  const [expanded, setExpanded] = useState(defaultExpanded || showExpectedPrompt)

  useEffect(() => {
    if (showExpectedPrompt) setExpanded(true)
  }, [showExpectedPrompt])

  if (!isActive || !scenario.warningReason) return null

  const collapseLabel = showExpectedPrompt && !expanded
    ? 'Tap to see why — and answer a quick question'
    : expanded ? 'Hide details' : 'Why this may be suspicious'

  return (
    <div className={styles.bar}>
      <button
        className={styles.collapseRow}
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <span className={styles.collapseIcon}>ⓘ</span>
        <span className={styles.collapseLabel}>{collapseLabel}</span>
        <svg
          className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}
          viewBox="0 0 10 6" width="10" height="6" fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && (
        <div className={styles.details}>
          <div className={styles.row}>
            <span className={styles.rowIcon}>{RISK_ICONS[scenario.urlRisk]}</span>
            <span className={styles.rowText}>{RISK_LABELS[scenario.urlRisk]}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowIcon}>📋</span>
            <span className={styles.rowText}>{scenario.warningReason}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowIcon}>👤</span>
            <span className={styles.rowText}>
              First contact: {scenario.sender.firstContactLabel}
              {scenario.sender.messageCount > 0
                ? ` · ${scenario.sender.messageCount} prior message${scenario.sender.messageCount !== 1 ? 's' : ''}`
                : ' · No prior messages'}
            </span>
          </div>
          {scenario.officialURL && (
            <div className={styles.row}>
              <span className={styles.rowIcon}>✅</span>
              <span className={styles.rowText}>
                Legitimate site: <span className={styles.officialUrl}>{scenario.officialURL}</span>
              </span>
            </div>
          )}

          {showExpectedPrompt && onAcknowledge && (
            <div className={styles.expectedPrompt}>
              <span className={styles.expectedQuestion}>Are you expecting this message?</span>
              <div className={styles.expectedBtns}>
                <button className={`${styles.expectedBtn} ${styles.expectedBtnYes}`} onClick={() => onAcknowledge()}>
                  Yes ✓
                </button>
                <button className={`${styles.expectedBtn} ${styles.expectedBtnNo}`} onClick={() => onAcknowledge()}>
                  No ✗
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
