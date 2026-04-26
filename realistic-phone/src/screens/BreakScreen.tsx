import { useNavigate } from 'react-router-dom'
import styles from './BreakScreen.module.css'

export function BreakScreen() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.icon}>☕</span>
        <h2 className={styles.title}>Round 1 complete</h2>
        <p className={styles.text}>
          Take a short break. Round 2 begins when you're ready.
        </p>
        <button className={styles.ctaBtn} onClick={() => navigate('/game', { replace: true })}>
          Start Round 2 →
        </button>
      </div>
    </div>
  )
}
