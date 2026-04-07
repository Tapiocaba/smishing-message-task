import type { CSOTrialResult, CSOSessionSummary, UserDecision, QuestionnaireResponse, CategoryStat, CategoryStatsExport, MessageCategory } from '../types'

export function computeIsAccurate(isPhishing: boolean, decision: UserDecision): boolean {
  if (isPhishing) return decision === 'report' || decision === 'ignore'
  return decision === 'open' || decision === 'verify'
}

export function computeIsFalsePositive(isPhishing: boolean, decision: UserDecision): boolean {
  return !isPhishing && decision === 'report'
}

export function computeIsFalseNegative(isPhishing: boolean, decision: UserDecision): boolean {
  return isPhishing && decision === 'open'
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function computeBlockStats(trials: CSOTrialResult[]) {
  const accurate = trials.filter(t => t.isAccurate)
  const falsePositives = trials.filter(t => t.isFalsePositive)
  const falseNegatives = trials.filter(t => t.isFalseNegative)

  return {
    accuracy: trials.length > 0 ? accurate.length / trials.length : 0,
    avgDecisionTimeMs: avg(trials.map(t => t.decisionTimeMs)),
    falsePositiveRate: trials.length > 0 ? falsePositives.length / trials.length : 0,
    falseNegativeRate: trials.length > 0 ? falseNegatives.length / trials.length : 0,
    timeoutCount: 0,
    distractorAccuracy: avg(trials.map(t => t.distractorAccuracy)),
  }
}

export function computeSessionSummary(
  allTrials: CSOTrialResult[],
  questionnaire: QuestionnaireResponse,
  participantID: string,
  activeFeature: string,
  blockOrder: string
): CSOSessionSummary {
  const block1 = allTrials.filter(t => t.blockNumber === 1)
  const block2 = allTrials.filter(t => t.blockNumber === 2)

  const b1 = computeBlockStats(block1)
  const b2 = computeBlockStats(block2)

  const block1Condition = block1[0]?.blockCondition ?? 'control'
  const block2Condition = block2[0]?.blockCondition ?? 'control'

  let featureStats = b1
  let controlStats = b2
  if (block1Condition === 'control') {
    featureStats = b2
    controlStats = b1
  }

  return {
    participantID,
    sessionDate: new Date().toISOString(),
    activeFeature,
    blockOrder,
    block1Condition,
    block1Accuracy: b1.accuracy,
    block1AvgDecisionTimeMs: b1.avgDecisionTimeMs,
    block1FalsePositiveRate: b1.falsePositiveRate,
    block1FalseNegativeRate: b1.falseNegativeRate,
    block1TimeoutCount: 0,
    block1DistractorAccuracy: b1.distractorAccuracy,
    block2Condition,
    block2Accuracy: b2.accuracy,
    block2AvgDecisionTimeMs: b2.avgDecisionTimeMs,
    block2FalsePositiveRate: b2.falsePositiveRate,
    block2FalseNegativeRate: b2.falseNegativeRate,
    block2TimeoutCount: 0,
    block2DistractorAccuracy: b2.distractorAccuracy,
    accuracyDelta: featureStats.accuracy - controlStats.accuracy,
    decisionTimeDelta: featureStats.avgDecisionTimeMs - controlStats.avgDecisionTimeMs,
    falsePositiveDelta: featureStats.falsePositiveRate - controlStats.falsePositiveRate,
    falseNegativeDelta: featureStats.falseNegativeRate - controlStats.falseNegativeRate,
    likertHelpful: questionnaire.likertHelpful,
    likertIntrusive: questionnaire.likertIntrusive,
    likertConfident: questionnaire.likertConfident,
    likertEasy: questionnaire.likertEasy,
  }
}

const ALL_CATEGORIES: MessageCategory[] = [
  'packageDelivery',
  'financialDeception',
  'businessPromotion',
  'impersonation',
  'political',
  'appointment',
]

const DECISIONS: UserDecision[] = ['ignore', 'open', 'verify', 'report']

export function computeCategoryStats(
  allTrials: CSOTrialResult[],
  participantID: string,
  activeFeature: string
): CategoryStatsExport {
  const byCategory: CategoryStat[] = ALL_CATEGORIES.map(cat => {
    const trials = allTrials.filter(t => t.messageCategory === cat)

    const breakdown = Object.fromEntries(
      DECISIONS.map(d => [d, trials.filter(t => t.userDecision === d).length])
    ) as Record<UserDecision, number>

    return {
      category: cat,
      total: trials.length,
      phishingCount: trials.filter(t => t.isPhishing).length,
      legitCount: trials.filter(t => !t.isPhishing).length,
      accurateCount: trials.filter(t => t.isAccurate).length,
      accuracy: trials.length > 0 ? trials.filter(t => t.isAccurate).length / trials.length : 0,
      avgDecisionTimeMs: avg(trials.map(t => t.decisionTimeMs)),
      falsePositiveCount: trials.filter(t => t.isFalsePositive).length,
      falseNegativeCount: trials.filter(t => t.isFalseNegative).length,
      decisionBreakdown: breakdown,
    }
  }).filter(s => s.total > 0)

  const urlRiskLevels = ['safe', 'shortened', 'suspicious', 'dangerous'] as const
  const byUrlRisk = Object.fromEntries(
    urlRiskLevels.map(risk => {
      const trials = allTrials.filter(t => t.urlRisk === risk)
      return [risk, {
        total: trials.length,
        accurateCount: trials.filter(t => t.isAccurate).length,
        accuracy: trials.length > 0 ? trials.filter(t => t.isAccurate).length / trials.length : 0,
        avgDecisionTimeMs: avg(trials.map(t => t.decisionTimeMs)),
      }]
    })
  )

  return {
    participantID,
    sessionDate: new Date().toISOString(),
    activeFeature,
    byCategory,
    byUrlRisk,
  }
}
