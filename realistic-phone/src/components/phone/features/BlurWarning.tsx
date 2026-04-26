import type { ReactNode } from 'react'
import type { SmishingScenario, URLRiskLevel } from '../../../types'
import styles from './BlurWarning.module.css'

// ── Tier scoring ──────────────────────────────────────────────────────────────

function score(scenario: SmishingScenario): number {
  let s = 0
  if (scenario.urlRisk === 'shortened')  s += 1
  if (scenario.urlRisk === 'suspicious') s += 2
  if (scenario.urlRisk === 'dangerous')  s += 3
  if (scenario.hasImpersonationPattern)  s += 2
  if (scenario.sender.messageCount === 0 && scenario.sender.firstContactLabel === 'never') s += 1
  return s
}

function getTier(scenario: SmishingScenario): 0 | 1 | 2 | 3 {
  const s = score(scenario)
  if (s === 0) return 0
  if (s <= 2)  return 1
  if (s <= 4)  return 2
  return 3
}

const TIER_META: Record<1 | 2 | 3, { blurClass: string; overlayClass: string; label: string }> = {
  1: { blurClass: styles.blur1, overlayClass: styles.overlay1, label: 'May be suspicious' },
  2: { blurClass: styles.blur2, overlayClass: styles.overlay2, label: 'Likely suspicious' },
  3: { blurClass: styles.blur3, overlayClass: styles.overlay3, label: 'High risk — possible scam' },
}

function getReasons(scenario: SmishingScenario): string[] {
  const r: string[] = []
  const urlMap: Partial<Record<URLRiskLevel, string>> = {
    dangerous:  'Known phishing link',
    suspicious: 'Suspicious link detected',
    shortened:  'Shortened link — destination hidden',
  }
  const urlLabel = urlMap[scenario.urlRisk]
  if (urlLabel) r.push(urlLabel)
  if (scenario.hasImpersonationPattern) r.push(`Claims to be ${scenario.sender.displayName}`)
  if (scenario.sender.messageCount === 0) r.push('No prior messages from this number')
  return r
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  scenario: SmishingScenario
  isActive: boolean
  onReveal: () => void
  children: ReactNode
}

export function BlurWarning({ scenario, isActive, onReveal, children }: Props) {
  const tier = getTier(scenario)

  if (!isActive || tier === 0) return <>{children}</>

  const meta = TIER_META[tier]
  const reasons = getReasons(scenario)

  return (
    <div className={styles.card}>
      {/* Blurred body preview */}
      <div className={`${styles.blurredText} ${meta.blurClass}`}>
        {scenario.body}
      </div>

      {/* Warning section */}
      <div className={`${styles.warning} ${meta.overlayClass}`}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <span className={styles.warningLabel}>{meta.label}</span>
        </div>
        <ul className={styles.reasons}>
          {reasons.map((r, i) => (
            <li key={i} className={styles.reason}>
              <span className={styles.bullet}>·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <button className={styles.revealBtn} onClick={onReveal}>
          Read message anyway →
        </button>
      </div>
    </div>
  )
}
