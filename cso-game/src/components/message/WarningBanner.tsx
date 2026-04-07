import styles from './WarningBanner.module.css'

interface Props {
  warningReason: string | null
  isActive: boolean
  isEscalated?: boolean
}

export function WarningBanner({ warningReason, isActive, isEscalated = false }: Props) {
  if (!isActive || !warningReason) return null

  return (
    <div className={`${styles.banner} ${isEscalated ? styles.escalated : styles.normal}`}>
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>
        {isEscalated && (
          <span className={styles.escalatedPrefix}>
            You indicated you're not expecting a package —
          </span>
        )}
        {warningReason}
      </span>
    </div>
  )
}
