import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandImpersonationChip } from '../components/phone/features/BrandImpersonationChip'
import { CategoryChip } from '../components/phone/features/CategoryChip'
import { AnnotatedBody } from '../components/phone/features/AnnotatedBody'
import { RiskContextBar } from '../components/phone/features/RiskContextBar'
import { IsExpectedPrompt } from '../components/phone/features/IsExpectedPrompt'
import { BlurWarning } from '../components/phone/features/BlurWarning'
import { NotificationBanner } from '../components/phone/NotificationBanner'
import { PhoneFrame } from '../components/phone/PhoneFrame'
import type { SmishingScenario, FeatureFlags, ActiveFeatures } from '../types'
import styles from './AdminScreen.module.css'

const PREVIEW_SCENARIO: SmishingScenario = {
  id: 'preview_admin',
  type: 'fake',
  isPhishing: true,
  category: 'packageDelivery',
  urlRisk: 'dangerous',
  sender: {
    displayName: 'USPS',
    phoneNumber: '+1 (800) 000-0000',
    senderFormat: 'displayName',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    firstContactLabel: 'never',
    messageCount: 0,
  },
  body: 'USPS: Your package #9400111899220083590062 is held. Confirm your address and pay customs fee $3.50 to release: http://usps-secure-pkg-release.com/pay',
  threadPreamble: [],
  warningReason: 'USPS never requests payment via SMS. The link domain is not usps.com.',
  officialURL: 'https://usps.com',
  hasImpersonationPattern: true,
  blockAssignment: 'both',
}

type FeatureFlagKey = keyof Pick<FeatureFlags,
  'brandImpersonation' | 'linkRiskAnnotation' | 'messageCategoryChip' |
  'notificationSpamLabel' | 'consolidatedAction' | 'expandableRiskBar' |
  'isExpectedPrompt' | 'tieredBlurWarning'>

const ALL_FEATURES_OFF: ActiveFeatures = {
  brandImpersonation: false,
  linkRiskAnnotation: false,
  messageCategoryChip: false,
  notificationSpamLabel: false,
  consolidatedAction: false,
  expandableRiskBar: false,
  isExpectedPrompt: false,
  tieredBlurWarning: false,
}

function singleFeatureActive(key: FeatureFlagKey): ActiveFeatures {
  return { ...ALL_FEATURES_OFF, [key]: true }
}

// ── Feature card ──────────────────────────────────────────────────────────────

interface FeatureCardProps {
  title: string
  description: string
  flagKey: FeatureFlagKey
  onPreview: (key: FeatureFlagKey, title: string) => void
  children: React.ReactNode
}

function FeatureCard({ title, description, flagKey, onPreview, children }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={styles.cardTitle}>{title}</span>
          <span className={styles.cardDesc}>{description}</span>
        </div>
      </div>
      <div className={styles.preview}>
        <div className={styles.previewLabelRow}>
          <span className={styles.previewLabel}>Preview</span>
          <button
            className={styles.previewPhoneBtn}
            onClick={() => onPreview(flagKey, title)}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
              <rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="6" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            View in phone
          </button>
        </div>
        <div className={styles.previewContent}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Inline reply sheet preview ────────────────────────────────────────────────

function PreviewReplySheet({ isConsolidated }: { isConsolidated: boolean }) {
  return (
    <div className={styles.previewSheet}>
      <div className={styles.previewSheetCard}>
        {isConsolidated ? (
          <>
            <div className={`${styles.previewSheetBtn} ${styles.previewSheetBtnReport}`}>
              🗑️ Delete &amp; Report Spam
            </div>
            <div className={styles.previewSheetDivider} />
            <div className={`${styles.previewSheetBtn} ${styles.previewSheetBtnSafe}`}>
              ✓ Not Spam
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.previewSheetBtn} ${styles.previewSheetBtnSafe}`}>
              Not Spam
            </div>
            <div className={styles.previewSheetDivider} />
            <div className={`${styles.previewSheetBtn} ${styles.previewSheetBtnReport}`}>
              Report Spam and Delete
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface PreviewModal {
  flagKey: FeatureFlagKey
  title: string
  resetKey: number
}

export function AdminScreen() {
  const navigate = useNavigate()
  const [modal, setModal] = useState<PreviewModal | null>(null)

  function openPreview(key: FeatureFlagKey, title: string) {
    setModal({ flagKey: key, title, resetKey: 0 })
  }

  function resetPreview() {
    setModal(m => m ? { ...m, resetKey: m.resetKey + 1 } : null)
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <svg viewBox="0 0 10 17" width="9" height="15" fill="none">
              <path d="M9 1L1 8.5 9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Storybook</h1>
            <p className={styles.subtitle}>8 anti-phishing features · tap "View in phone" to interact</p>
          </div>
        </div>

        <div className={styles.cards}>

          <FeatureCard
            title="Brand Impersonation Warning"
            description="Inline chip warning when sender claims to be a known brand (e.g. USPS, Chase Bank)."
            flagKey="brandImpersonation"
            onPreview={openPreview}
          >
            <BrandImpersonationChip scenario={PREVIEW_SCENARIO} isActive />
          </FeatureCard>

          <FeatureCard
            title="Link Risk Annotation"
            description="URL in the message body is highlighted with a risk indicator. Hover for tooltip explaining why."
            flagKey="linkRiskAnnotation"
            onPreview={openPreview}
          >
            <div className={styles.previewBubble}>
              <AnnotatedBody body={PREVIEW_SCENARIO.body} urlRisk={PREVIEW_SCENARIO.urlRisk} isActive />
            </div>
          </FeatureCard>

          <FeatureCard
            title="Category Chip"
            description="Pill label identifying the message category — shown in thread, messages list, and notification."
            flagKey="messageCategoryChip"
            onPreview={openPreview}
          >
            <CategoryChip scenario={PREVIEW_SCENARIO} isActive />
          </FeatureCard>

          <FeatureCard
            title="Notification Spam Label"
            description="'Possible Spam Detected' badge on the iOS push notification before the user opens the app."
            flagKey="notificationSpamLabel"
            onPreview={openPreview}
          >
            <div className={styles.previewNotif}>
              <NotificationBanner scenario={PREVIEW_SCENARIO} onTap={() => {}} isSpamActive isCategoryChipActive />
            </div>
          </FeatureCard>

          <FeatureCard
            title="Consolidated Action"
            description="Action sheet shows a prominent 'Delete & Report Spam' primary button instead of two equal options."
            flagKey="consolidatedAction"
            onPreview={openPreview}
          >
            <PreviewReplySheet isConsolidated />
          </FeatureCard>

          <FeatureCard
            title="Expandable Risk + Context Bar"
            description="Collapsible panel below the message with URL risk, warning reason, sender context, and official domain."
            flagKey="expandableRiskBar"
            onPreview={openPreview}
          >
            <RiskContextBar scenario={PREVIEW_SCENARIO} isActive defaultExpanded />
          </FeatureCard>

          <FeatureCard
            title={'Y/N "Is this expected?" Prompt'}
            description="Prompts reflection before replying on package delivery and financial messages. Embedded in risk bar when both are active."
            flagKey="isExpectedPrompt"
            onPreview={openPreview}
          >
            <IsExpectedPrompt scenario={PREVIEW_SCENARIO} isActive onAcknowledge={() => {}} />
          </FeatureCard>

          <FeatureCard
            title="Tiered Blur Warning"
            description="Message starts blurred with a risk summary. Blur intensity and label severity scale with the number of signals detected."
            flagKey="tieredBlurWarning"
            onPreview={openPreview}
          >
            <BlurWarning scenario={PREVIEW_SCENARIO} isActive onReveal={() => {}}>
              <div />
            </BlurWarning>
          </FeatureCard>

        </div>
      </div>

      {/* ── Phone preview modal ── */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modalInner} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalBadge}>Storybook</span>
                <span className={styles.modalFeatureName}>{modal.title}</span>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalResetBtn} onClick={resetPreview}>
                  ↺ Restart
                </button>
                <button className={styles.modalCloseBtn} onClick={() => setModal(null)}>
                  ✕ Close
                </button>
              </div>
            </div>
            <div className={styles.modalPhone}>
              <PhoneFrame
                key={`${modal.flagKey}-${modal.resetKey}`}
                scenario={PREVIEW_SCENARIO}
                onDecision={() => {}}
                immediate
                activeFeatures={singleFeatureActive(modal.flagKey)}
                disableIdleTimeout
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
