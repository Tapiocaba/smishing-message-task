export interface MockSender {
  displayName: string
  phoneNumber: string
  countryCode: string
  countryFlag: string
  firstContactLabel: string
  messageCount: number
}

export type URLRiskLevel = 'safe' | 'shortened' | 'suspicious' | 'dangerous'

export type MessageCategory =
  | 'packageDelivery'
  | 'financialDeception'
  | 'businessPromotion'
  | 'impersonation'
  | 'political'
  | 'appointment'

export type UserDecision = 'ignore' | 'open' | 'verify' | 'report'

export interface SpamTestScenario {
  id: string
  sender: MockSender
  body: string
  isPhishing: boolean
  category: MessageCategory
  urlRisk: URLRiskLevel
  warningReason: string | null
  officialURL: string | null
  hasImpersonationPattern: boolean
  distractorDifficulty: 1 | 2 | 3
}

export interface CSOTrialResult {
  participantID: string
  sessionDate: string
  blockNumber: 1 | 2
  blockCondition: string
  trialNumber: number
  scenarioID: string
  isPhishing: boolean
  messageCategory: string
  urlRisk: string
  userDecision: UserDecision
  decisionTimeMs: number
  isAccurate: boolean
  isFalsePositive: boolean
  isFalseNegative: boolean
  distractorAccuracy: number
  featuresActive: string[]
}

export interface CategoryStat {
  category: string
  total: number
  phishingCount: number
  legitCount: number
  accurateCount: number
  accuracy: number
  avgDecisionTimeMs: number
  falsePositiveCount: number
  falseNegativeCount: number
  decisionBreakdown: Record<UserDecision, number>
}

export interface CategoryStatsExport {
  participantID: string
  sessionDate: string
  activeFeature: string
  byCategory: CategoryStat[]
  byUrlRisk: Record<string, { total: number; accurateCount: number; accuracy: number; avgDecisionTimeMs: number }>
}

export interface CSOSessionSummary {
  participantID: string
  sessionDate: string
  activeFeature: string
  blockOrder: string
  block1Condition: string
  block1Accuracy: number
  block1AvgDecisionTimeMs: number
  block1FalsePositiveRate: number
  block1FalseNegativeRate: number
  block1TimeoutCount: number
  block1DistractorAccuracy: number
  block2Condition: string
  block2Accuracy: number
  block2AvgDecisionTimeMs: number
  block2FalsePositiveRate: number
  block2FalseNegativeRate: number
  block2TimeoutCount: number
  block2DistractorAccuracy: number
  accuracyDelta: number
  decisionTimeDelta: number
  falsePositiveDelta: number
  falseNegativeDelta: number
  likertHelpful: number
  likertIntrusive: number
  likertConfident: number
  likertEasy: number
}

export interface FeatureFlags {
  senderContextStrip: boolean
  linkRiskAnnotation: boolean
  messageCategoryChip: boolean
  contextWarningBanner: boolean
  simulatedNotificationLabel: boolean
  tieredRiskDot: boolean
  isExpectedPrompt: boolean
  activeFeature: string
  participantID: string
  blockOrder: 'control_first' | 'feature_first'
}

export interface QuestionnaireResponse {
  likertHelpful: number
  likertIntrusive: number
  likertConfident: number
  likertEasy: number
  openDifference: string
  openHelpful: string
  openConfusing: string
}
