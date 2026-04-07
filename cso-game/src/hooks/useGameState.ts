import { useState, useCallback, useRef } from 'react'
import { scenarios } from '../data/scenarios'
import type { CSOTrialResult, FeatureFlags, UserDecision, SpamTestScenario } from '../types'
import {
  computeIsAccurate,
  computeIsFalsePositive,
  computeIsFalseNegative,
} from '../utils/scoring'
import { getActiveFeaturesArray, getActiveFeatureLabel } from '../utils/featureFlags'

const RESULTS_KEY = 'cso_results'

function getScenariosForBlock(blockNumber: 1 | 2): SpamTestScenario[] {
  return blockNumber === 1 ? [...scenarios] : [...scenarios].reverse()
}

function getBlockCondition(blockNumber: 1 | 2, flags: FeatureFlags): string {
  const isFeatureBlock =
    (blockNumber === 1 && flags.blockOrder === 'feature_first') ||
    (blockNumber === 2 && flags.blockOrder === 'control_first')
  return isFeatureBlock ? getActiveFeatureLabel(flags) : 'control'
}

function areFlagsActiveForBlock(blockNumber: 1 | 2, flags: FeatureFlags): boolean {
  if (blockNumber === 1 && flags.blockOrder === 'feature_first') return true
  if (blockNumber === 2 && flags.blockOrder === 'control_first') return true
  return false
}

export function useGameState(flags: FeatureFlags, initialBlock: 1 | 2 = 1) {
  const [blockNumber, setBlockNumber] = useState<1 | 2>(initialBlock)
  const [trialIndex, setTrialIndex] = useState(0)
  const [results, setResults] = useState<CSOTrialResult[]>([])
  const [phase, setPhase] = useState<'trial' | 'done'>('trial')
  const buttonEnabledAtRef = useRef<number>(0)

  const currentScenarios = getScenariosForBlock(blockNumber)
  const currentScenario = currentScenarios[trialIndex] ?? null
  const totalTrials = currentScenarios.length
  const isFeaturesActive = areFlagsActiveForBlock(blockNumber, flags)

  function markButtonsEnabled() {
    buttonEnabledAtRef.current = performance.now()
  }

  function captureDecisionTime(): number {
    return Math.round(performance.now() - buttonEnabledAtRef.current)
  }

  const recordDecision = useCallback(
    (decision: UserDecision, capturedTimeMs: number) => {
      if (!currentScenario) return

      const result: CSOTrialResult = {
        participantID: flags.participantID,
        sessionDate: new Date().toISOString(),
        blockNumber,
        blockCondition: getBlockCondition(blockNumber, flags),
        trialNumber: trialIndex + 1,
        scenarioID: currentScenario.id,
        isPhishing: currentScenario.isPhishing,
        messageCategory: currentScenario.category,
        urlRisk: currentScenario.urlRisk,
        userDecision: decision,
        decisionTimeMs: capturedTimeMs,
        isAccurate: computeIsAccurate(currentScenario.isPhishing, decision),
        isFalsePositive: computeIsFalsePositive(currentScenario.isPhishing, decision),
        isFalseNegative: computeIsFalseNegative(currentScenario.isPhishing, decision),
        distractorAccuracy: 0,
        featuresActive: isFeaturesActive ? getActiveFeaturesArray(flags) : [],
      }

      setResults(prev => {
        const updated = [...prev, result]
        try {
          localStorage.setItem(RESULTS_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })
    },
    [currentScenario, blockNumber, trialIndex, flags, isFeaturesActive]
  )

  const advanceTrial = useCallback(() => {
    if (trialIndex + 1 >= totalTrials) {
      setPhase('done')
    } else {
      setTrialIndex(i => i + 1)
    }
  }, [trialIndex, totalTrials])

  const startBlock2 = useCallback(() => {
    setBlockNumber(2)
    setTrialIndex(0)
    setPhase('trial')
  }, [])

  return {
    blockNumber,
    trialIndex,
    currentScenario,
    totalTrials,
    results,
    phase,
    isFeaturesActive,
    markButtonsEnabled,
    captureDecisionTime,
    recordDecision,
    advanceTrial,
    startBlock2,
  }
}
