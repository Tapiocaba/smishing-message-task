import { useNavigate } from 'react-router-dom'
import styles from './OnboardingScreen.module.css'

export function OnboardingScreen() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>📱</span>
          <h1 className={styles.heroTitle}>SMS Study</h1>
          <p className={styles.heroSubtitle}>
            Read each message and decide how you'd respond in real life.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Your four choices</div>
          <div className={styles.buttonList}>
            {[
              { label: 'Ignore', desc: 'Delete without acting', cls: styles.chipIgnore },
              { label: 'Open',   desc: "Tap the link or respond", cls: styles.chipOpen },
              { label: 'Verify', desc: "Look it up before acting", cls: styles.chipVerify },
              { label: 'Report', desc: 'Flag as spam or scam', cls: styles.chipReport },
            ].map(({ label, desc, cls }) => (
              <div key={label} className={styles.buttonItem}>
                <span className={`${styles.btnChip} ${cls}`}>{label}</span>
                <span className={styles.btnDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.note}>
          You'll do <strong>2 rounds of messages</strong>. Take as long as you need for each one.
        </div>

        <button className={styles.ctaBtn} onClick={() => navigate('/practice', { replace: true })}>
          Start Practice Round →
        </button>
      </div>
    </div>
  )
}
