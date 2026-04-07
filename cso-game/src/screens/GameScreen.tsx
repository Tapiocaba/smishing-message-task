import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import { useGameState } from '../hooks/useGameState'
import { useTimer } from '../hooks/useTimer'
import type { UserDecision } from '../types'
import { MessageCard } from '../components/message/MessageCard'
import { CategoryChip } from '../components/message/CategoryChip'
import { NotificationBanner } from '../components/message/NotificationBanner'
import { WarningBanner } from '../components/message/WarningBanner'
import { IsExpectedPrompt } from '../components/message/IsExpectedPrompt'
import { DecisionButtons } from '../components/game/DecisionButtons'
import styles from './GameScreen.module.css'

export function GameScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const initialBlock = (state as { block?: number } | null)?.block === 2 ? 2 as const : 1 as const
  const flags = useFeatureFlags()
  const [showBanner, setShowBanner] = useState(false)
  const [buttonsEnabled, setButtonsEnabled] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const blockDoneRef = useRef(false)

  const {
    blockNumber,
    trialIndex,
    currentScenario,
    totalTrials,
    phase,
    isFeaturesActive,
    markButtonsEnabled,
    captureDecisionTime,
    recordDecision,
    advanceTrial,
  } = useGameState(flags, initialBlock)

  const { start, stop, reset } = useTimer()

  // Navigate when block finishes
  useEffect(() => {
    if (phase === 'done' && !blockDoneRef.current) {
      blockDoneRef.current = true
      stop()
      if (blockNumber === 1) {
        navigate('/break')
      } else {
        navigate('/questionnaire')
      }
    }
  }, [phase, blockNumber, navigate, stop])

  useEffect(() => {
    blockDoneRef.current = false
  }, [blockNumber])

  // Set up each new trial
  useEffect(() => {
    if (phase !== 'trial' || !currentScenario) return

    setIsEscalated(false)
    setButtonsEnabled(false)
    setCardVisible(false)
    reset()

    const useNotification = isFeaturesActive && flags.simulatedNotificationLabel

    if (useNotification) {
      setShowBanner(true)
      start()
    } else {
      setShowBanner(false)
      setCardVisible(true)
      setButtonsEnabled(true)
      markButtonsEnabled()
      start()
    }
  }, [trialIndex, phase, currentScenario])

  function handleBannerDismiss() {
    setShowBanner(false)
    setCardVisible(true)
    setButtonsEnabled(true)
    markButtonsEnabled()
  }

  function handleDecision(decision: UserDecision) {
    const captured = captureDecisionTime()
    stop()
    setButtonsEnabled(false)
    setIsExiting(true)

    setTimeout(() => {
      recordDecision(decision, captured)
      advanceTrial()
      setIsExiting(false)
    }, 260)
  }

  if (!currentScenario) return null

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerLeft}>
          <strong>Round {blockNumber}</strong> of 2 &middot; Message {trialIndex + 1} of {totalTrials}
        </span>
        <div className={styles.progressDots}>
          {Array.from({ length: totalTrials }).map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i < trialIndex ? styles.done : i === trialIndex ? styles.current : ''}`}
            />
          ))}
        </div>
        {isFeaturesActive && flags.activeFeature !== 'none' && (
          <span className={styles.featureBadge}>{flags.activeFeature}</span>
        )}
      </div>

      {/* Centered SMS panel */}
      <div className={styles.body}>
        <div className={styles.smsPanel}>
          {showBanner && (
            <NotificationBanner
              scenario={currentScenario}
              isFeatureActive={isFeaturesActive && flags.simulatedNotificationLabel}
              onDismiss={handleBannerDismiss}
            />
          )}

          {cardVisible && (
            <div
              key={trialIndex}
              className={`${styles.msgContent} ${isExiting ? styles.exiting : ''}`}
            >
              {isFeaturesActive && flags.messageCategoryChip && (
                <CategoryChip category={currentScenario.category} />
              )}

              <div className={styles.conversationFrame}>
                <MessageCard
                  scenario={currentScenario}
                  flags={flags}
                  isFeaturesActive={isFeaturesActive}
                />

                {isFeaturesActive && flags.contextWarningBanner && (
                  <WarningBanner
                    warningReason={currentScenario.warningReason}
                    isActive={true}
                    isEscalated={isEscalated}
                  />
                )}

                {isFeaturesActive && flags.isExpectedPrompt && (
                  <IsExpectedPrompt
                    scenario={currentScenario}
                    isActive={true}
                    onExpecting={() => setIsEscalated(false)}
                    onNotExpecting={() => setIsEscalated(true)}
                  />
                )}

                <div className={styles.replyBar}>
                  <DecisionButtons
                    onDecision={handleDecision}
                    disabled={!buttonsEnabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
