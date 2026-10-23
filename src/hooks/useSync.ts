import { useCallback, useEffect, useRef, useState } from 'react'
import { isApiConfigured } from '../lib/api'
import { readSyncMeta } from '../lib/db'
import { LAST_SYNCED_KEY, syncAll, type SyncSummary } from '../lib/sync'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'unconfigured'

interface UseSyncOptions {
  isOnline: boolean
  isSimulatedOffline: boolean
  autoSync: boolean
  pendingChanges: number
  onSynced: () => void | Promise<void>
}

export function useSync(options: UseSyncOptions) {
  const { isOnline, isSimulatedOffline, autoSync, pendingChanges, onSynced } = options
  const offline = !isOnline || isSimulatedOffline

  const [status, setStatus] = useState<SyncStatus>(
    isApiConfigured ? 'idle' : 'unconfigured',
  )
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const inFlight = useRef(false)
  const debounce = useRef<number | null>(null)
  const booted = useRef(false)
  const previousOffline = useRef(offline)
  const onSyncedRef = useRef(onSynced)
  onSyncedRef.current = onSynced

  useEffect(() => {
    let active = true
    readSyncMeta<string>(LAST_SYNCED_KEY)
      .then((value) => {
        if (active && typeof value === 'string') setLastSyncedAt(value)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounce.current !== null) window.clearTimeout(debounce.current)
    }
  }, [])

  useEffect(() => {
    if (!isApiConfigured) {
      setStatus('unconfigured')
      return
    }
    if (offline) {
      setStatus('offline')
    } else {
      setStatus((current) => (current === 'offline' ? 'idle' : current))
    }
  }, [offline])

  const run = useCallback(async (): Promise<SyncSummary | null> => {
    if (!isApiConfigured) {
      setStatus('unconfigured')
      return null
    }
    if (offline) {
      setStatus('offline')
      return null
    }
    if (inFlight.current) return null

    inFlight.current = true
    setStatus('syncing')
    setError(null)

    try {
      const summary = await syncAll()
      setLastSyncedAt(summary.syncedAt)
      setStatus('synced')
      await onSyncedRef.current()
      return summary
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Sync could not be completed.',
      )
      setStatus('error')
      return null
    } finally {
      inFlight.current = false
    }
  }, [offline])

  const schedule = useCallback(
    (delay: number) => {
      if (!isApiConfigured || offline || !autoSync) return
      if (debounce.current !== null) window.clearTimeout(debounce.current)
      debounce.current = window.setTimeout(() => {
        debounce.current = null
        void run()
      }, delay)
    },
    [autoSync, offline, run],
  )

  useEffect(() => {
    if (booted.current || !autoSync || offline || !isApiConfigured) return
    booted.current = true
    schedule(900)
  }, [autoSync, offline, schedule])

  useEffect(() => {
    const wasOffline = previousOffline.current
    previousOffline.current = offline
    if (wasOffline && !offline && autoSync && isApiConfigured) schedule(400)
  }, [autoSync, offline, schedule])

  useEffect(() => {
    if (pendingChanges > 0) schedule(1200)
  }, [pendingChanges, schedule])

  const syncNow = useCallback(async (): Promise<SyncSummary | null> => {
    if (debounce.current !== null) {
      window.clearTimeout(debounce.current)
      debounce.current = null
    }
    return run()
  }, [run])

  return {
    status,
    lastSyncedAt,
    error,
    isConfigured: isApiConfigured,
    syncNow,
    requestSync: () => schedule(600),
  }
}
