import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFlags, setFlags, getActiveFeaturesArray } from '../utils/featureFlags'
import styles from './ResearcherScreen.module.css'

const FEATURE_KEYS = [
  { key: 'brandImpersonation',    label: 'Brand Impersonation' },
  { key: 'linkRiskAnnotation',    label: 'Link Risk Annotation' },
  { key: 'messageCategoryChip',   label: 'Category Chip' },
  { key: 'notificationSpamLabel', label: 'Notification Spam Label' },
  { key: 'consolidatedAction',    label: 'Consolidated Action' },
  { key: 'expandableRiskBar',     label: 'Expandable Risk Bar' },
  { key: 'isExpectedPrompt',      label: 'Is Expected Prompt' },
  { key: 'tieredBlurWarning',     label: 'Tiered Blur Warning' },
] as const

type FeatureKey = typeof FEATURE_KEYS[number]['key']

export function ResearcherScreen() {
  const navigate = useNavigate()
  const [flags, setLocal] = useState(getFlags)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const updated = { ...flags, activeFeature: getActiveFeaturesArray(flags).join(',') || 'none' }
    setFlags(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleBeginStudy() {
    const updated = { ...flags, activeFeature: getActiveFeaturesArray(flags).join(',') || 'none' }
    setFlags(updated)
    navigate('/', { replace: true })
  }

  function handleClear() {
    localStorage.clear()
    setLocal(getFlags())
    setSaved(false)
  }

  function toggleFeature(key: FeatureKey) {
    setLocal(f => ({ ...f, [key]: !f[key] }))
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Researcher Settings</h1>
        <p className={styles.subtitle}>Configure before each session. Not visible to participants.</p>

        <div className={styles.field}>
          <label className={styles.label}>Participant ID</label>
          <input
            className={styles.input}
            value={flags.participantID}
            onChange={e => setLocal(f => ({ ...f, participantID: e.target.value }))}
            placeholder="e.g. P01"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Block Order</label>
          <select
            className={styles.select}
            value={flags.blockOrder}
            onChange={e => setLocal(f => ({ ...f, blockOrder: e.target.value as 'control_first' | 'feature_first' }))}
          >
            <option value="control_first">Block 1 = Control, Block 2 = Feature</option>
            <option value="feature_first">Block 1 = Feature, Block 2 = Control</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Active Features</label>
          <div className={styles.featureList}>
            {FEATURE_KEYS.map(({ key, label }) => (
              <div key={key} className={styles.featureRow}>
                <span className={styles.featureLabel}>{label}</span>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={!!flags[key]}
                    onChange={() => toggleFeature(key)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          <button className={styles.clearBtn} onClick={handleClear}>
            Clear All Data
          </button>
        </div>

        <button className={styles.beginBtn} onClick={handleBeginStudy}>
          Begin Study →
        </button>

        <div className={styles.storageInfo}>
          <span className={styles.storageLabel}>localStorage keys in use:</span>
          <code className={styles.storageKeys}>rp_config · rp_results · rp_questionnaire</code>
        </div>
      </div>
    </div>
  )
}
