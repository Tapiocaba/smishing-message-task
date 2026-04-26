import { useState, useCallback } from 'react'
import { getMessagesForBlock } from '../data/messages'
import type { SmishingTrialResult, FeatureFlags, UserDecision } from '../types'
import {
  computeIsAccurate,
  computeIsFalsePositive,
  computeIsFalseNegative,
} from '../utils/scoring'
import { getActiveFeaturesArray, getActiveFeatureLabel } from '../utils/featureFlags'

const RESULTS_KEY = 'rp_results'

export type GamePhase = 'trial' | 'blockDone' | 'sessionDone'

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
  const [results, setResults] = useState<SmishingTrialResult[]>([])
  const [phase, setPhase] = useState<GamePhase>('trial')

  const currentScenarios = getMessagesForBlock(blockNumber)
  const currentScenario = currentScenarios[trialIndex] ?? null
  const totalTrials = currentScenarios.length
  const isFeaturesActive = areFlagsActiveForBlock(blockNumber, flags)

  const recordDecision = useCallback(
    (decision: UserDecision, decisionTimeMs: number) => {
      if (!currentScenario) return

      const result: SmishingTrialResult = {
        participantID: flags.participantID,
        sessionDate: new Date().toISOString(),
        blockNumber,
        blockCondition: getBlockCondition(blockNumber, flags),
        trialNumber: trialIndex + 1,
        scenarioID: currentScenario.id,
        isPhishing: currentScenario.isPhishing,
        messageType: currentScenario.type,
        messageCategory: currentScenario.category,
        urlRisk: currentScenario.urlRisk,
        userDecision: decision,
        decisionTimeMs,
        isAccurate: computeIsAccurate(currentScenario.isPhishing, decision),
        isFalsePositive: computeIsFalsePositive(currentScenario.isPhishing, decision),
        isFalseNegative: computeIsFalseNegative(currentScenario.isPhishing, decision),
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
      setPhase(blockNumber === 1 ? 'blockDone' : 'sessionDone')
    } else {
      setTrialIndex(i => i + 1)
    }
  }, [trialIndex, totalTrials, blockNumber])

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
    recordDecision,
    advanceTrial,
    startBlock2,
  }
}
