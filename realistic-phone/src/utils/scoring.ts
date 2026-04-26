import type {
  SmishingTrialResult,
  SmishingSessionSummary,
  UserDecision,
  QuestionnaireResponse,
  MessageCategory,
} from '../types'

export function computeIsAccurate(isPhishing: boolean, decision: UserDecision): boolean {
  if (isPhishing) return decision === 'report_delete'
  return decision === 'not_spam'
}

export function computeIsFalsePositive(isPhishing: boolean, decision: UserDecision): boolean {
  return !isPhishing && decision === 'report_delete'
}

export function computeIsFalseNegative(isPhishing: boolean, decision: UserDecision): boolean {
  return isPhishing && decision === 'not_spam'
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function computeBlockStats(trials: SmishingTrialResult[]) {
  const accurate = trials.filter(t => t.isAccurate)
  const falsePositives = trials.filter(t => t.isFalsePositive)
  const falseNegatives = trials.filter(t => t.isFalseNegative)

  return {
    accuracy: trials.length > 0 ? accurate.length / trials.length : 0,
    avgDecisionTimeMs: avg(trials.map(t => t.decisionTimeMs)),
    falsePositiveRate: trials.length > 0 ? falsePositives.length / trials.length : 0,
    falseNegativeRate: trials.length > 0 ? falseNegatives.length / trials.length : 0,
  }
}

export function computeSessionSummary(
  allTrials: SmishingTrialResult[],
  questionnaire: QuestionnaireResponse,
  participantID: string,
  activeFeature: string,
  blockOrder: string
): SmishingSessionSummary {
  const block1 = allTrials.filter(t => t.blockNumber === 1)
  const block2 = allTrials.filter(t => t.blockNumber === 2)

  const b1 = computeBlockStats(block1)
  const b2 = computeBlockStats(block2)

  const block1Condition = block1[0]?.blockCondition ?? 'control'
  const block2Condition = block2[0]?.blockCondition ?? 'control'

  const featureStats = block1Condition === 'control' ? b2 : b1
  const controlStats = block1Condition === 'control' ? b1 : b2

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
    block2Condition,
    block2Accuracy: b2.accuracy,
    block2AvgDecisionTimeMs: b2.avgDecisionTimeMs,
    block2FalsePositiveRate: b2.falsePositiveRate,
    block2FalseNegativeRate: b2.falseNegativeRate,
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

const DECISIONS: UserDecision[] = ['not_spam', 'report_delete']
const URL_RISK_LEVELS = ['safe', 'shortened', 'suspicious', 'dangerous'] as const

export function computeCategoryStats(allTrials: SmishingTrialResult[], participantID: string, activeFeature: string) {
  const byCategory = ALL_CATEGORIES.map(cat => {
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

  const byUrlRisk = Object.fromEntries(
    URL_RISK_LEVELS.map(risk => {
      const trials = allTrials.filter(t => t.urlRisk === risk)
      return [risk, {
        total: trials.length,
        accurateCount: trials.filter(t => t.isAccurate).length,
        accuracy: trials.length > 0 ? trials.filter(t => t.isAccurate).length / trials.length : 0,
        avgDecisionTimeMs: avg(trials.map(t => t.decisionTimeMs)),
      }]
    })
  )

  return { participantID, sessionDate: new Date().toISOString(), activeFeature, byCategory, byUrlRisk }
}
