import { useMemo } from 'react'
import type { CSOTrialResult, QuestionnaireResponse } from '../types'
import { getFlags, getActiveFeatureLabel } from '../utils/featureFlags'
import { computeSessionSummary, computeCategoryStats } from '../utils/scoring'
import { downloadJSON, getExportFilenames } from '../utils/export'
import styles from './SummaryScreen.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  packageDelivery:    '📦 Package Delivery',
  financialDeception: '🏦 Financial Deception',
  businessPromotion:  '🎁 Business Promotion',
  impersonation:      '👤 Impersonation',
  political:          '🗳️ Political',
  appointment:        '📅 Appointment',
}

export function SummaryScreen() {
  const results: CSOTrialResult[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('cso_results') ?? '[]') }
    catch { return [] }
  }, [])

  const questionnaire: QuestionnaireResponse = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('cso_questionnaire') ?? '{}')
    } catch {
      return { likertHelpful: 3, likertIntrusive: 3, likertConfident: 3, likertEasy: 3, openDifference: '', openHelpful: '', openConfusing: '' }
    }
  }, [])

  const flags = getFlags()
  const accurate = results.filter(r => r.isAccurate).length
  const total = results.length

  const categoryStats = useMemo(
    () => computeCategoryStats(results, flags.participantID, getActiveFeatureLabel(flags)),
    [results]
  )

  function handleDownload() {
    const summary = computeSessionSummary(
      results,
      questionnaire,
      flags.participantID,
      getActiveFeatureLabel(flags),
      flags.blockOrder
    )
    const filenames = getExportFilenames(flags.participantID)
    downloadJSON(results, filenames.trials)
    setTimeout(() => downloadJSON(summary, filenames.summary), 300)
    setTimeout(() => downloadJSON(categoryStats, filenames.trials.replace('_trials.json', '_by_category.json')), 600)
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        {/* Terminal accuracy block */}
        <div className={styles.terminal}>
          <div className={styles.terminalBar}>
            <div className={`${styles.dot} ${styles.dotRed}`} />
            <div className={`${styles.dot} ${styles.dotYellow}`} />
            <div className={`${styles.dot} ${styles.dotGreen}`} />
          </div>
          <div className={styles.terminalBody}>
            <div className={styles.prompt}>session_results — participant {flags.participantID}</div>
            <div className={styles.accuracyLine}>Messages correctly classified:</div>
            <span className={styles.accuracyNumber}>
              {accurate}
              <span className={styles.accuracyDenom}> / {total}</span>
            </span>
            <div className={styles.accuracyLabel}>
              across both rounds ({total > 0 ? Math.round(accurate / total * 100) : 0}% accuracy)
            </div>
            <div className={styles.outputLine}><span>block_order</span><span>{flags.blockOrder}</span></div>
            <div className={styles.outputLine}><span>active_feature</span><span>{getActiveFeatureLabel(flags)}</span></div>
            <div className={styles.outputLine}><span>trials_recorded</span><span>{total}</span></div>
          </div>
        </div>

        {/* Per-category breakdown */}
        {categoryStats.byCategory.length > 0 && (
          <div className={styles.categorySection}>
            <div className={styles.categoryTitle}>Results by Message Type</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Accurate</th>
                  <th>Accuracy</th>
                  <th>Avg time</th>
                  <th>False +</th>
                  <th>False −</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.byCategory.map(stat => (
                  <tr key={stat.category}>
                    <td className={styles.catLabel}>{CATEGORY_LABELS[stat.category] ?? stat.category}</td>
                    <td>{stat.total}</td>
                    <td>{stat.accurateCount}</td>
                    <td className={stat.accuracy >= 0.7 ? styles.good : stat.accuracy >= 0.5 ? styles.warn : styles.bad}>
                      {Math.round(stat.accuracy * 100)}%
                    </td>
                    <td className={styles.mono}>{(stat.avgDecisionTimeMs / 1000).toFixed(1)}s</td>
                    <td>{stat.falsePositiveCount}</td>
                    <td>{stat.falseNegativeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className={styles.downloadBtn} onClick={handleDownload}>
          Download Results (3 JSON files) ↓
        </button>
        <div className={styles.downloadNote}>
          trials · summary · by_category
        </div>

        <div className={styles.debrief}>
          <div className={styles.debriefTitle}>About this study</div>
          <p className={styles.debriefText}>
            This study is investigating whether specific UI cues — like sender context, link risk labels, or message category tags — help people identify SMS phishing attacks (smishing) more accurately. Your responses will help researchers understand which design features are most effective at protecting people from phishing without creating excessive false alarms or decision fatigue. Thank you for participating.
          </p>
        </div>
      </div>
    </div>
  )
}
