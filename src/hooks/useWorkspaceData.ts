import { useCallback, useEffect, useState } from 'react'
import {
  addSampleRecords,
  createRecord,
  deleteRecord,
  getPendingChanges,
  getRecords,
  updateRecord,
} from '../lib/db'
import type { PendingChange, RecordInput, WorkspaceRecord } from '../types'

function messageFor(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'The local workspace could not be loaded.'
}

export function useWorkspaceData() {
  const [records, setRecords] = useState<WorkspaceRecord[]>([])
  const [changes, setChanges] = useState<PendingChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [nextRecords, nextChanges] = await Promise.all([getRecords(), getPendingChanges()])
    setRecords(nextRecords)
    setChanges(nextChanges)
    setError(null)
  }, [])

  useEffect(() => {
    let active = true

    load()
      .catch((cause: unknown) => {
        if (active) setError(messageFor(cause))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [load])

  const reload = useCallback(async () => {
    setIsLoading(true)
    try {
      await load()
    } catch (cause) {
      setError(messageFor(cause))
    } finally {
      setIsLoading(false)
    }
  }, [load])

  const refresh = useCallback(async () => {
    try {
      await load()
    } catch (cause) {
      setError(messageFor(cause))
    }
  }, [load])

  const create = useCallback(
    async (input: RecordInput) => {
      const record = await createRecord(input)
      await refresh()
      return record
    },
    [refresh],
  )

  const update = useCallback(
    async (id: string, input: RecordInput) => {
      const record = await updateRecord(id, input)
      await refresh()
      return record
    },
    [refresh],
  )

  const remove = useCallback(
    async (record: WorkspaceRecord) => {
      await deleteRecord(record)
      await refresh()
    },
    [refresh],
  )

  const addSamples = useCallback(async () => {
    const added = await addSampleRecords()
    await refresh()
    return added
  }, [refresh])

  return {
    records,
    changes,
    isLoading,
    error,
    reload,
    refresh,
    create,
    update,
    remove,
    addSamples,
  }
}
