import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneFrame } from '../components/phone/PhoneFrame'
import { TrialHeader } from '../components/game/TrialHeader'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import { useGameState } from '../hooks/useGameState'
import { getActiveFeatureLabel, getActiveFeatures } from '../utils/featureFlags'
import type { UserDecision } from '../types'
import styles from './GameScreen.module.css'

export function GameScreen() {
  const navigate = useNavigate()
  const flags = useFeatureFlags()
  const game = useGameState(flags)

  // Navigate when block or session ends
  useEffect(() => {
    if (game.phase === 'blockDone') navigate('/break', { replace: true })
    else if (game.phase === 'sessionDone') navigate('/questionnaire', { replace: true })
  }, [game.phase, navigate])

  // Record the decision immediately (captures timing + result).
  // The trial does NOT advance here — advanceTrial is passed as onTrialComplete
  // and called by PhoneFrame only when the user navigates back from thread_marked.
  // This prevents the scheduling effect from resetting the phone to 'locked' while
  // the participant is still reading the "Marked as Spam/Safe" outcome screen.
  function handleDecision(decision: UserDecision, decisionTimeMs: number) {
    game.recordDecision(decision, decisionTimeMs)
  }

  const conditionLabel = getActiveFeatureLabel(flags)
  const activeFeatures = getActiveFeatures(flags, game.isFeaturesActive)

  return (
    <div className={styles.page}>
      <TrialHeader
        blockNumber={game.blockNumber}
        trialIndex={game.trialIndex}
        totalTrials={game.totalTrials}
        conditionLabel={conditionLabel}
      />
      <div className={styles.body}>
        <PhoneFrame
          scenario={game.currentScenario}
          onDecision={handleDecision}
          onTrialComplete={game.advanceTrial}
          activeFeatures={activeFeatures}
        />
      </div>
    </div>
  )
}
