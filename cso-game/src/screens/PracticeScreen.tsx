import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { practiceScenarios } from '../data/practiceScenarios'
import { DEFAULT_FLAGS } from '../utils/featureFlags'
import type { UserDecision } from '../types'
import { useTimer } from '../hooks/useTimer'
import { MessageCard } from '../components/message/MessageCard'
import { DecisionButtons } from '../components/game/DecisionButtons'
import styles from './PracticeScreen.module.css'

export function PracticeScreen() {
  const navigate = useNavigate()
  const [trialIndex, setTrialIndex] = useState(0)
  const [phase, setPhase] = useState<'trial' | 'done'>('trial')
  const [isExiting, setIsExiting] = useState(false)
  const timerStarted = useRef(false)

  const { start, stop, reset } = useTimer()

  // Start timer on first render of each trial
  if (phase === 'trial' && !timerStarted.current) {
    timerStarted.current = true
    start()
  }

  function handleDecision(_: UserDecision) {
    stop()
    timerStarted.current = false
    reset()
    setIsExiting(true)

    setTimeout(() => {
      if (trialIndex + 1 >= practiceScenarios.length) {
        setPhase('done')
      } else {
        setTrialIndex(i => i + 1)
      }
      setIsExiting(false)
    }, 260)
  }

  if (phase === 'done') {
    return (
      <div className={styles.completeOverlay}>
        <div className={styles.completeCard}>
          <div className={styles.completeIcon}>✅</div>
          <h2 className={styles.completeTitle}>Practice Complete</h2>
          <p className={styles.completeSub}>
            You've completed the warm-up round. The real study begins now — same format, but your responses will be recorded.
          </p>
          <button className={styles.ctaBtn} onClick={() => navigate('/game')}>
            Ready? Start Round 1 →
          </button>
        </div>
      </div>
    )
  }

  const scenario = practiceScenarios[trialIndex]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.practiceBadge}>Practice</span>
          <span className={styles.headerTitle}>Message {trialIndex + 1} of {practiceScenarios.length}</span>
        </div>
        <div className={styles.dots}>
          {practiceScenarios.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i < trialIndex ? styles.filled : ''}`} />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.smsPanel}>
          <div
            key={trialIndex}
            className={`${styles.msgContent} ${isExiting ? styles.exiting : ''}`}
          >
            <div className={styles.conversationFrame}>
              <MessageCard scenario={scenario} flags={DEFAULT_FLAGS} isFeaturesActive={false} />
              <div className={styles.replyBar}>
                <DecisionButtons onDecision={handleDecision} disabled={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
