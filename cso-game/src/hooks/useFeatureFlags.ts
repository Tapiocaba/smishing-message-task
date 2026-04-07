import { useState, useEffect } from 'react'
import type { FeatureFlags } from '../types'
import { getFlags } from '../utils/featureFlags'

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(getFlags)

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'cso_flags') {
        setFlags(getFlags())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return flags
}
