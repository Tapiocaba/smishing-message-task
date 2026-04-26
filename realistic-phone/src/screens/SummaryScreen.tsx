import { useNavigate } from 'react-router-dom'
import type { SmishingTrialResult, QuestionnaireResponse } from '../types'
import { computeSessionSummary, computeCategoryStats } from '../utils/scoring'
import { downloadJSON, getExportFilenames } from '../utils/export'
import { getFlags } from '../utils/featureFlags'
import { getActiveFeatureLabel } from '../utils/featureFlags'
import styles from './SummaryScreen.module.css'

const RESULTS_KEY = 'rp_results'
const QUESTIONNAIRE_KEY = 'rp_questionnaire'

const DEFAULT_QUESTIONNAIRE: QuestionnaireResponse = {
  likertHelpful: 3, likertIntrusive: 3, likertConfident: 3, likertEasy: 3,
  openDifference: '', openHelpful: '', openConfusing: '',
}

export function SummaryScreen() {
  const navigate = useNavigate()
  const flags = getFlags()

  const results: SmishingTrialResult[] = (() => {
    try { return JSON.parse(localStorage.getItem(RESULTS_KEY) ?? '[]') } catch { return [] }
  })()
  const questionnaire: QuestionnaireResponse = (() => {
    try { return JSON.parse(localStorage.getItem(QUESTIONNAIRE_KEY) ?? '{}') ?? DEFAULT_QUESTIONNAIRE } catch { return DEFAULT_QUESTIONNAIRE }
  })()

  const activeFeature = getActiveFeatureLabel(flags)
  const summary = computeSessionSummary(results, questionnaire, flags.participantID, activeFeature, flags.blockOrder)
  const categoryStats = computeCategoryStats(results, flags.participantID, activeFeature)
  const filenames = getExportFilenames(flags.participantID)

  const block1Pct = Math.round(summary.block1Accuracy * 100)
  const block2Pct = Math.round(summary.block2Accuracy * 100)

  function handleExport() {
    downloadJSON(results, filenames.trials)
    downloadJSON(summary, filenames.summary)
    downloadJSON(categoryStats, filenames.byCategory)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Session Complete</h1>
        <p className={styles.sub}>Participant: <strong>{flags.participantID}</strong></p>

        <div className={styles.statsGrid}>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{block1Pct}%</span>
            <span className={styles.statLabel}>Round 1 accuracy<br /><em>{summary.block1Condition}</em></span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{block2Pct}%</span>
            <span className={styles.statLabel}>Round 2 accuracy<br /><em>{summary.block2Condition}</em></span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{Math.round(summary.block1AvgDecisionTimeMs / 100) / 10}s</span>
            <span className={styles.statLabel}>Avg time (round 1)</span>
          </div>
          <div className={styles.statBlock}>
            <span className={styles.statValue}>{Math.round(summary.block2AvgDecisionTimeMs / 100) / 10}s</span>
            <span className={styles.statLabel}>Avg time (round 2)</span>
          </div>
        </div>

        <div className={styles.exportSection}>
          <p className={styles.exportNote}>
            Exports 3 JSON files: trials, summary, and by-category breakdown.
          </p>
          <button className={styles.exportBtn} onClick={handleExport}>
            Export Data (3 files)
          </button>
        </div>

        <button className={styles.resetBtn} onClick={() => navigate('/researcher')}>
          New Session →
        </button>
      </div>
    </div>
  )
}
