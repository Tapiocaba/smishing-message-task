import { useState, useEffect } from 'react'
import { getFlags } from '../utils/featureFlags'
import type { FeatureFlags } from '../types'

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(getFlags)

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'rp_config') setFlags(getFlags())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return flags
}
