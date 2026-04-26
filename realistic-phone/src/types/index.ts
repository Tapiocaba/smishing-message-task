// ── Sender ──────────────────────────────────────────────────────────────────

export type SenderFormat = 'shortCode' | 'fullPhone' | 'displayName'

export interface SmishingSender {
  /** What appears as the header in the message thread */
  displayName: string
  /** Raw number or short code as-sent (e.g. "456", "+1 (713) 565-1628") */
  phoneNumber: string
  /** Drives how the sender header renders */
  senderFormat: SenderFormat
  countryCode: string
  countryFlag: string
  /** Human-readable first contact label (e.g. "never", "several months ago") */
  firstContactLabel: string
  /** Number of prior messages from this sender (0 = never messaged before) */
  messageCount: number
}

// ── Scenario ─────────────────────────────────────────────────────────────────

export type URLRiskLevel = 'safe' | 'shortened' | 'suspicious' | 'dangerous'

export type MessageCategory =
  | 'packageDelivery'
  | 'financialDeception'
  | 'businessPromotion'
  | 'impersonation'
  | 'political'
  | 'appointment'

export interface SmishingScenario {
  id: string
  /** Human-readable type for JSON authoring — mirrors isPhishing */
  type: 'real' | 'fake'
  isPhishing: boolean
  category: MessageCategory
  urlRisk: URLRiskLevel
  sender: SmishingSender
  /** Full SMS body. May contain URLs and newlines. */
  body: string
  /**
   * Optional prior messages from the same sender shown above the trial bubble.
   * Empty array (default) = single bubble display.
   * Use 1-2 entries to simulate a scammer sending multiple messages.
   */
  threadPreamble: string[]
  warningReason: string | null
  officialURL: string | null
  hasImpersonationPattern: boolean
  /**
   * Which block(s) this message appears in.
   * 1 = Block 1 only, 2 = Block 2 only, 'both' = appears in both blocks.
   */
  blockAssignment: 1 | 2 | 'both'
}

// ── User decisions ────────────────────────────────────────────────────────────

export type UserDecision = 'not_spam' | 'report_delete'

// ── Study config (stored under localStorage key 'rp_config') ─────────────────

export interface StudyConfig {
  participantID: string
  sessionDate: string
  blockOrder: 'control_first' | 'feature_first'
  /** Key of the active feature, or 'none' for control */
  activeFeature: string
  block1Condition: 'control' | 'feature'
  block2Condition: 'control' | 'feature'
}

// ── Feature flags ─────────────────────────────────────────────────────────────

export interface FeatureFlags {
  activeFeature: string
  participantID: string
  blockOrder: 'control_first' | 'feature_first'
  // Individual feature toggles — all true by default
  brandImpersonation: boolean
  linkRiskAnnotation: boolean
  messageCategoryChip: boolean
  notificationSpamLabel: boolean
  consolidatedAction: boolean
  expandableRiskBar: boolean
  isExpectedPrompt: boolean
  tieredBlurWarning: boolean
}

/**
 * Computed at render time by ANDing each flag with isFeaturesActive.
 * Never stored — derived from FeatureFlags + block state in GameScreen.
 */
export interface ActiveFeatures {
  brandImpersonation: boolean
  linkRiskAnnotation: boolean
  messageCategoryChip: boolean
  notificationSpamLabel: boolean
  consolidatedAction: boolean
  expandableRiskBar: boolean
  isExpectedPrompt: boolean
  tieredBlurWarning: boolean
}

// ── Trial result ──────────────────────────────────────────────────────────────

export interface SmishingTrialResult {
  participantID: string
  sessionDate: string
  blockNumber: 1 | 2
  blockCondition: string
  trialNumber: number
  scenarioID: string
  isPhishing: boolean
  messageType: 'real' | 'fake'
  messageCategory: MessageCategory
  urlRisk: URLRiskLevel
  userDecision: UserDecision
  /** Milliseconds from when buttons became active to when user clicked */
  decisionTimeMs: number
  isAccurate: boolean
  isFalsePositive: boolean
  isFalseNegative: boolean
  featuresActive: string[]
}

// ── Session summary ───────────────────────────────────────────────────────────

export interface SmishingSessionSummary {
  participantID: string
  sessionDate: string
  blockOrder: string
  activeFeature: string
  block1Condition: string
  block1Accuracy: number
  block1AvgDecisionTimeMs: number
  block1FalsePositiveRate: number
  block1FalseNegativeRate: number
  block2Condition: string
  block2Accuracy: number
  block2AvgDecisionTimeMs: number
  block2FalsePositiveRate: number
  block2FalseNegativeRate: number
  accuracyDelta: number
  decisionTimeDelta: number
  falsePositiveDelta: number
  falseNegativeDelta: number
  likertHelpful: number
  likertIntrusive: number
  likertConfident: number
  likertEasy: number
}

// ── Questionnaire ─────────────────────────────────────────────────────────────

export interface QuestionnaireResponse {
  likertHelpful: number
  likertIntrusive: number
  likertConfident: number
  likertEasy: number
  openDifference: string
  openHelpful: string
  openConfusing: string
}
