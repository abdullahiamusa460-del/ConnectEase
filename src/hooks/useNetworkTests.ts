import { useCallback, useEffect, useState } from 'react'
import {
  runNetworkTest,
  type NetworkTestResult,
} from '../lib/networkTest'
import {
  addSampleReports,
  createReport,
  deleteReport,
  getNetworkTests,
  getReports,
} from '../lib/db'
import type { NetworkProvider, NetworkReport, NetworkReportInput } from '../types'

export function useNetworkTests() {
  const [tests, setTests] = useState<NetworkTestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const next = await getNetworkTests()
    setTests(next)
    setError(null)
  }, [])

  useEffect(() => {
    let active = true
    load().catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load test history.')
    }).finally(() => {
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
      setError(cause instanceof Error ? cause.message : 'Could not load test history.')
    } finally {
      setIsLoading(false)
    }
  }, [load])

  const test = useCallback(
    async (endpoint: string | null) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await runNetworkTest(endpoint)
        await reload()
        return result
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Network test failed.'
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [reload],
  )

  return { tests, isLoading, error, reload, test }
}

export function useNetworkReports() {
  const [reports, setReports] = useState<NetworkReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const next = await getReports()
    setReports(next)
    setError(null)
  }, [])

  useEffect(() => {
    let active = true
    load().catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load reports.')
    }).finally(() => {
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
      setError(cause instanceof Error ? cause.message : 'Could not load reports.')
    } finally {
      setIsLoading(false)
    }
  }, [load])

  const add = useCallback(
    async (input: NetworkReportInput) => {
      const report = await createReport(input)
      await reload()
      return report
    },
    [reload],
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteReport(id)
      await reload()
    },
    [reload],
  )

  const addSamples = useCallback(async () => {
    const added = await addSampleReports()
    await reload()
    return added
  }, [reload])

  const filtered = (filters: { query: string; provider: NetworkProvider | 'all' }) => {
    const normalizedQuery = filters.query.trim().toLowerCase()
    return reports.filter((report) => {
      const matchesProvider = filters.provider === 'all' || report.provider === filters.provider
      const matchesQuery =
        !normalizedQuery ||
        report.provider.toLowerCase().includes(normalizedQuery) ||
        (report.location ?? '').toLowerCase().includes(normalizedQuery) ||
        report.issue.toLowerCase().includes(normalizedQuery) ||
        report.id.includes(normalizedQuery)
      return matchesProvider && matchesQuery
    })
  }

  return {
    reports,
    isLoading,
    error,
    reload,
    add,
    remove,
    addSamples,
    filtered,
  }
}
