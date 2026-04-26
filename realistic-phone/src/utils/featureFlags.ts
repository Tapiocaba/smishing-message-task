import type { FeatureFlags, ActiveFeatures } from '../types'

const CONFIG_KEY = 'rp_config'

export const DEFAULT_FLAGS: FeatureFlags = {
  activeFeature: 'none',
  participantID: 'P00',
  blockOrder: 'control_first',
  brandImpersonation: true,
  linkRiskAnnotation: true,
  messageCategoryChip: true,
  notificationSpamLabel: true,
  consolidatedAction: true,
  expandableRiskBar: true,
  isExpectedPrompt: true,
  tieredBlurWarning: true,
}

export function getFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    if (!stored) return { ...DEFAULT_FLAGS }
    return { ...DEFAULT_FLAGS, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULT_FLAGS }
  }
}

export function setFlags(flags: FeatureFlags): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(flags))
}

export function clearFlags(): void {
  localStorage.removeItem(CONFIG_KEY)
}

export function getActiveFeatureLabel(flags: FeatureFlags): string {
  return flags.activeFeature === 'none' ? 'control' : `feature_${flags.activeFeature}`
}

/** Returns all enabled feature keys — used to populate featuresActive[] in trial results. */
export function getActiveFeaturesArray(flags: FeatureFlags): string[] {
  const keys: (keyof ActiveFeatures)[] = [
    'brandImpersonation', 'linkRiskAnnotation', 'messageCategoryChip',
    'notificationSpamLabel', 'consolidatedAction', 'expandableRiskBar',
    'isExpectedPrompt', 'tieredBlurWarning',
  ]
  return keys.filter(k => flags[k])
}

/** Computes runtime ActiveFeatures by gating each flag with isFeaturesActive. */
export function getActiveFeatures(flags: FeatureFlags, isFeaturesActive: boolean): ActiveFeatures {
  if (!isFeaturesActive) {
    return {
      brandImpersonation: false,
      linkRiskAnnotation: false,
      messageCategoryChip: false,
      notificationSpamLabel: false,
      consolidatedAction: false,
      expandableRiskBar: false,
      isExpectedPrompt: false,
      tieredBlurWarning: false,
    }
  }
  return {
    brandImpersonation: flags.brandImpersonation,
    linkRiskAnnotation: flags.linkRiskAnnotation,
    messageCategoryChip: flags.messageCategoryChip,
    notificationSpamLabel: flags.notificationSpamLabel,
    consolidatedAction: flags.consolidatedAction,
    expandableRiskBar: flags.expandableRiskBar,
    isExpectedPrompt: flags.isExpectedPrompt,
    tieredBlurWarning: flags.tieredBlurWarning,
  }
}
