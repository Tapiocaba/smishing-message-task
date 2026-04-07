import styles from './CountdownBar.module.css'

interface Props {
  elapsedMs: number
}

export function CountdownBar({ elapsedMs }: Props) {
  const secs = (elapsedMs / 1000).toFixed(1)

  return (
    <div className={styles.container}>
      <span className={styles.icon}>⏱</span>
      <span className={styles.timeDisplay}>{secs}s</span>
    </div>
  )
}
