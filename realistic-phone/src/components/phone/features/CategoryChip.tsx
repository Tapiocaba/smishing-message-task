import type { SmishingScenario, MessageCategory } from '../../../types'
import styles from './CategoryChip.module.css'

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  packageDelivery:    '📦 Package Delivery',
  financialDeception: '🏦 Bank Alert',
  businessPromotion:  '📢 Promotion',
  impersonation:      '🎭 Impersonation',
  political:          '🗳️ Political',
  appointment:        '📅 Appointment',
}

interface Props {
  scenario: SmishingScenario
  isActive: boolean
}

export function CategoryChip({ scenario, isActive }: Props) {
  if (!isActive) return null

  return (
    <div className={styles.chip}>
      {CATEGORY_LABELS[scenario.category]}
    </div>
  )
}
