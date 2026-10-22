import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, readSettings, writeSettings } from '../lib/db'
import type { AppSettings } from '../types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    readSettings()
      .then((stored) => {
        if (active) setSettings(stored)
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not load saved preferences.')
        }
      })
      .finally(() => {
        if (active) setIsLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  const updateSetting = useCallback(
    <Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) => {
      setSettings((previous) => {
        const next = { ...previous, [key]: value }
        void writeSettings(next).catch((cause: unknown) => {
          console.warn('ConnectEase could not save preferences.', cause)
        })
        return next
      })
    },
    [],
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    void writeSettings(DEFAULT_SETTINGS).catch((cause: unknown) => {
      console.warn('ConnectEase could not reset preferences.', cause)
    })
  }, [])

  return { settings, isLoaded, error, updateSetting, resetSettings }
}
