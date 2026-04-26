import type { SmishingScenario } from '../types'
import rawMessages from './messages.json'
import rawPractice from './practiceMessages.json'

export const messages: SmishingScenario[] = rawMessages as SmishingScenario[]
export const practiceMessages: SmishingScenario[] = rawPractice as SmishingScenario[]

export function getMessagesForBlock(block: 1 | 2): SmishingScenario[] {
  const pool = messages.filter(
    m => m.blockAssignment === block || m.blockAssignment === 'both'
  )
  // Block 2 uses reversed order to partially mitigate practice effects
  return block === 2 ? [...pool].reverse() : pool
}
