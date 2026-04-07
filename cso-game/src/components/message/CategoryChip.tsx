import type { MessageCategory } from '../../types'
import styles from './CategoryChip.module.css'

interface Props {
  category: MessageCategory
}

const CHIP_CONFIG: Record<Exclude<MessageCategory, 'appointment'>, { label: string; className: string }> = {
  packageDelivery:   { label: '📦 Delivery Update',  className: styles.blue },
  financialDeception:{ label: '🏦 Account Alert',    className: styles.orange },
  businessPromotion: { label: '🎁 Prize / Offer',     className: styles.purple },
  impersonation:     { label: '👤 Unknown Contact',   className: styles.gray },
  political:         { label: '🗳️ Political',         className: styles.gray },
}

export function CategoryChip({ category }: Props) {
  if (category === 'appointment') return null
  const config = CHIP_CONFIG[category]
  return (
    <span className={`${styles.chip} ${config.className}`}>
      {config.label}
    </span>
  )
}
