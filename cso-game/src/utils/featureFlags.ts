import type { FeatureFlags } from '../types'

const FLAGS_KEY = 'cso_flags'

export const DEFAULT_FLAGS: FeatureFlags = {
  senderContextStrip: false,
  linkRiskAnnotation: false,
  messageCategoryChip: false,
  contextWarningBanner: false,
  simulatedNotificationLabel: false,
  tieredRiskDot: false,
  isExpectedPrompt: false,
  activeFeature: 'none',
  participantID: 'P00',
  blockOrder: 'control_first',
}

export function getFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(FLAGS_KEY)
    if (!stored) return { ...DEFAULT_FLAGS }
    return { ...DEFAULT_FLAGS, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULT_FLAGS }
  }
}

export function setFlags(flags: FeatureFlags): void {
  localStorage.setItem(FLAGS_KEY, JSON.stringify(flags))
}

export function clearFlags(): void {
  localStorage.removeItem(FLAGS_KEY)
}

export function getActiveFeatureLabel(flags: FeatureFlags): string {
  if (flags.senderContextStrip) return 'feature_senderContextStrip'
  if (flags.linkRiskAnnotation) return 'feature_linkRiskAnnotation'
  if (flags.messageCategoryChip) return 'feature_messageCategoryChip'
  if (flags.contextWarningBanner) return 'feature_contextWarningBanner'
  if (flags.simulatedNotificationLabel) return 'feature_simulatedNotificationLabel'
  if (flags.tieredRiskDot) return 'feature_tieredRiskDot'
  if (flags.isExpectedPrompt) return 'feature_isExpectedPrompt'
  return 'control'
}

export function getActiveFeaturesArray(flags: FeatureFlags): string[] {
  const active: string[] = []
  if (flags.senderContextStrip) active.push('senderContextStrip')
  if (flags.linkRiskAnnotation) active.push('linkRiskAnnotation')
  if (flags.messageCategoryChip) active.push('messageCategoryChip')
  if (flags.contextWarningBanner) active.push('contextWarningBanner')
  if (flags.simulatedNotificationLabel) active.push('simulatedNotificationLabel')
  if (flags.tieredRiskDot) active.push('tieredRiskDot')
  if (flags.isExpectedPrompt) active.push('isExpectedPrompt')
  return active
}
