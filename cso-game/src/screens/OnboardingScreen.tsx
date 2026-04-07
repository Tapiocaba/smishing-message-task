import { useNavigate } from 'react-router-dom'
import styles from './OnboardingScreen.module.css'

export function OnboardingScreen() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>📱</span>
          <h1 className={styles.heroTitle}>Control Survey</h1>
          <p className={styles.heroSubtitle}>
            Read each message carefully and decide how you'd respond.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Your four choices</div>
          <div className={styles.buttonList}>
            {[
              { chip: styles.chipIgnore, label: 'Ignore', desc: 'Delete without acting' },
              { chip: styles.chipOpen,   label: 'Open',   desc: "You'd read more or tap a link" },
              { chip: styles.chipVerify, label: 'Verify', desc: "You'd look it up before acting" },
              { chip: styles.chipReport, label: 'Report', desc: 'Definitely spam or a scam' },
            ].map(({ chip, label, desc }) => (
              <div key={label} className={styles.buttonItem}>
                <span className={`${styles.btnChip} ${chip}`}>{label}</span>
                <span className={styles.btnDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.timingNote}>
          <span className={styles.timingIcon}>📋</span>
          <span>You'll do <strong>2 rounds of 20 messages</strong> each. Take as long as you need for each one.</span>
        </div>

        <button className={styles.ctaBtn} onClick={() => navigate('/practice')}>
          Start Practice Round →
        </button>
      </div>
    </div>
  )
}
