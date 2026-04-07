import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FeatureFlags } from '../types'
import { DEFAULT_FLAGS, setFlags } from '../utils/featureFlags'
import { downloadJSON } from '../utils/export'
import styles from './ResearcherScreen.module.css'

type ActiveFeatureKey = 'none' | keyof Pick<FeatureFlags,
  'senderContextStrip' | 'linkRiskAnnotation' | 'messageCategoryChip' |
  'contextWarningBanner' | 'simulatedNotificationLabel' | 'tieredRiskDot' | 'isExpectedPrompt'>

const FEATURE_OPTIONS: { key: ActiveFeatureKey; label: string }[] = [
  { key: 'none',                      label: 'None (Control)' },
  { key: 'senderContextStrip',        label: 'Sender Context Strip' },
  { key: 'linkRiskAnnotation',        label: 'Link Risk Annotation' },
  { key: 'messageCategoryChip',       label: 'Category Chip' },
  { key: 'contextWarningBanner',      label: 'Warning Banner' },
  { key: 'simulatedNotificationLabel',label: 'Notification Label' },
  { key: 'tieredRiskDot',             label: 'Tiered Risk Dot' },
  { key: 'isExpectedPrompt',          label: 'Is Expected Prompt' },
]

const FLAG_KEYS: (keyof Pick<FeatureFlags,
  'senderContextStrip' | 'linkRiskAnnotation' | 'messageCategoryChip' |
  'contextWarningBanner' | 'simulatedNotificationLabel' | 'tieredRiskDot' | 'isExpectedPrompt'>)[] = [
  'senderContextStrip',
  'linkRiskAnnotation',
  'messageCategoryChip',
  'contextWarningBanner',
  'simulatedNotificationLabel',
  'tieredRiskDot',
  'isExpectedPrompt',
]

export function ResearcherScreen() {
  const navigate = useNavigate()
  const [participantID, setParticipantID] = useState('P01')
  const [blockOrder, setBlockOrder] = useState<FeatureFlags['blockOrder']>('control_first')
  const [activeFeature, setActiveFeature] = useState<ActiveFeatureKey>('none')
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  function buildFlags(): FeatureFlags {
    const base: FeatureFlags = {
      ...DEFAULT_FLAGS,
      participantID,
      blockOrder,
      activeFeature: activeFeature === 'none' ? 'none' : activeFeature,
    }

    // Turn on the selected feature
    if (activeFeature !== 'none') {
      (base as unknown as Record<string, unknown>)[activeFeature] = true
    }

    // Apply manual overrides
    FLAG_KEYS.forEach(k => {
      if (k in overrides) {
        (base as unknown as Record<string, unknown>)[k] = overrides[k]
      }
    })

    return base
  }

  function handleInit() {
    if (!participantID.trim()) return
    const flags = buildFlags()
    setFlags(flags)
    navigate('/')
  }

  function handleExport() {
    const raw = localStorage.getItem('cso_results')
    if (!raw) return
    const data = JSON.parse(raw)
    downloadJSON(data, `session_${participantID}_last_export.json`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>
            <span className={styles.lockIcon}>🔒</span>
            Researcher Configuration
          </span>
          <span className={styles.disclaimer}>not visible to participants</span>
        </div>

        <div className={styles.body}>
          {/* Participant ID */}
          <div className={styles.field}>
            <label className={styles.label}>Participant ID</label>
            <input
              className={styles.input}
              value={participantID}
              onChange={e => setParticipantID(e.target.value)}
              placeholder="P01"
              spellCheck={false}
            />
          </div>

          {/* Block Order */}
          <div className={styles.field}>
            <label className={styles.label}>Block Order</label>
            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${blockOrder === 'control_first' ? styles.active : ''}`}
                onClick={() => setBlockOrder('control_first')}
              >
                Control First
              </button>
              <button
                className={`${styles.toggleBtn} ${blockOrder === 'feature_first' ? styles.active : ''}`}
                onClick={() => setBlockOrder('feature_first')}
              >
                Feature First
              </button>
            </div>
          </div>

          {/* Active Feature */}
          <div className={styles.field}>
            <label className={styles.label}>Active Feature</label>
            <div className={styles.featureGrid}>
              {FEATURE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  className={`${styles.featureBtn} ${activeFeature === opt.key ? styles.selected : ''}`}
                  onClick={() => setActiveFeature(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.separator} />

          {/* Advanced Overrides */}
          <button
            className={styles.advancedToggle}
            onClick={() => setShowAdvanced(v => !v)}
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            Advanced Flag Overrides
          </button>

          {showAdvanced && (
            <div>
              {FLAG_KEYS.map(k => (
                <div key={k} className={styles.overrideRow}>
                  <span className={styles.overrideLabel}>{k}</span>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={overrides[k] ?? false}
                      onChange={e => setOverrides(prev => ({ ...prev, [k]: e.target.checked }))}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className={styles.separator} />

          <button className={styles.initBtn} onClick={handleInit}>
            Initialize Session →
          </button>

          <button className={styles.exportBtn} onClick={handleExport}>
            Export Last Session
          </button>
        </div>
      </div>
    </div>
  )
}
