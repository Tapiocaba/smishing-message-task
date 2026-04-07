import { useNavigate } from 'react-router-dom'
import styles from './BlockBreak.module.css'

export function BlockBreak() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>✓ Round 1 Complete</div>
        <h2 className={styles.heading}>Take a short break</h2>
        <p className={styles.sub}>
          Round 2 will begin when you're ready. The format is the same — 20 messages, decide at your own pace.
        </p>
        <button className={styles.ctaBtn} onClick={() => navigate('/game', { state: { block: 2 } })}>
          Start Round 2 →
        </button>
      </div>
    </div>
  )
}
