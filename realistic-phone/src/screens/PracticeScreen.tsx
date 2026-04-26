import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneFrame } from '../components/phone/PhoneFrame'
import { TrialHeader } from '../components/game/TrialHeader'
import { practiceMessages } from '../data/messages'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import { getActiveFeatures } from '../utils/featureFlags'
import type { UserDecision } from '../types'
import styles from './PracticeScreen.module.css'

export function PracticeScreen() {
  const navigate = useNavigate()
  const flags = useFeatureFlags()
  const [trialIndex, setTrialIndex] = useState(0)
  const [done, setDone] = useState(false)

  const scenario = practiceMessages[trialIndex] ?? null

  // Receives the decision immediately (for timing capture) but does not advance.
  // Advancement happens in handleTrialComplete, called by PhoneFrame when the
  // participant navigates back from the thread_marked outcome screen.
  function handleDecision(_decision: UserDecision, _timeMs: number) {
    // Practice decisions are not recorded; nothing to do here.
  }

  // Called by PhoneFrame when the user leaves thread_marked (taps < Messages).
  function handleTrialComplete() {
    if (trialIndex + 1 >= practiceMessages.length) {
      setDone(true)
    } else {
      setTrialIndex(i => i + 1)
    }
  }

  if (done) {
    return (
      <div className={styles.doneOverlay}>
        <div className={styles.doneCard}>
          <h2 className={styles.doneTitle}>Practice complete</h2>
          <p className={styles.doneText}>
            The real study starts now. Your decisions from here on will be recorded.
          </p>
          <button className={styles.ctaBtn} onClick={() => navigate('/game', { replace: true })}>
            Begin Study →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <TrialHeader
        blockNumber={1}
        trialIndex={trialIndex}
        totalTrials={practiceMessages.length}
        conditionLabel="practice"
      />
      <div className={styles.body}>
        <PhoneFrame
          scenario={scenario}
          onDecision={handleDecision}
          onTrialComplete={handleTrialComplete}
          activeFeatures={getActiveFeatures(flags, flags.activeFeature !== 'none')}
          immediate
        />
      </div>
    </div>
  )
}
