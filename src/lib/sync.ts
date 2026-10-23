import {
  ApiError,
  ensureRegistration,
  isApiConfigured,
  pushNetworkTest,
  pushReport,
  pushWorkspace,
  type SyncChangePayload,
} from './api'
import {
  applyWorkspaceSync,
  getPendingChanges,
  getRecords,
  getUnsyncedNetworkTests,
  getUnsyncedReports,
  markNetworkTestSynced,
  markReportSynced,
  writeSyncMeta,
} from './db'
import type { PendingChange, WorkspaceRecord } from '../types'
import { createId } from './utils'

export const LAST_SYNCED_KEY = 'last-synced-at'

export interface SyncSummary {
  changes: number
  pulledRecords: number
  conflicts: number
  reports: number
  tests: number
  skipped: number
  syncedAt: string
}

let activeSync: Promise<SyncSummary> | null = null

export function syncAll(): Promise<SyncSummary> {
  if (!isApiConfigured) {
    return Promise.reject(
      new ApiError({
        status: 0,
        code: 'NOT_CONFIGURED',
        message: 'No sync server is configured for this build.',
      }),
    )
  }

  if (!activeSync) {
    activeSync = runSync().finally(() => {
      activeSync = null
    })
  }

  return activeSync
}

async function runSync(): Promise<SyncSummary> {
  await ensureRegistration()

  const workspace = await syncWorkspaceData()
  const reports = await syncReportsData()
  const tests = await syncTestsData()

  const syncedAt = new Date().toISOString()
  await writeSyncMeta(LAST_SYNCED_KEY, syncedAt)

  return {
    ...workspace,
    reports: reports.synced,
    tests: tests.synced,
    skipped: reports.skipped + tests.skipped,
    syncedAt,
  }
}

function toChangePayload(
  change: PendingChange,
  record: WorkspaceRecord | undefined,
): SyncChangePayload | null {
  if (change.action === 'delete') {
    return {
      recordId: change.recordId,
      action: 'delete',
      changedAt: change.changedAt,
    }
  }

  if (!record) return null

  return {
    recordId: change.recordId,
    action: change.action,
    changedAt: change.changedAt,
    record: {
      title: record.title,
      body: record.body,
      category: record.category,
      pinned: record.pinned,
      isSample: record.isSample ?? false,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
  }
}

async function syncWorkspaceData(): Promise<{
  changes: number
  pulledRecords: number
  conflicts: number
}> {
  const [records, changes] = await Promise.all([getRecords(), getPendingChanges()])
  const recordById = new Map(records.map((record) => [record.id, record]))

  const payload = changes
    .slice()
    .sort(
      (first, second) =>
        new Date(first.changedAt).getTime() - new Date(second.changedAt).getTime(),
    )
    .map((change) => toChangePayload(change, recordById.get(change.recordId)))
    .filter((change): change is SyncChangePayload => change !== null)

  const result = await pushWorkspace({
    batchId: createId(),
    changes: payload,
  })

  await applyWorkspaceSync(result)

  return {
    changes: payload.length,
    pulledRecords: result.records.length,
    conflicts: result.acknowledgements.filter((item) => item.status === 'conflict').length,
  }
}

function isPermanentItemError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 401 &&
    error.status !== 429
  )
}

async function syncReportsData(): Promise<{ synced: number; skipped: number }> {
  const reports = await getUnsyncedReports()
  let synced = 0
  let skipped = 0

  for (const report of reports) {
    try {
      await pushReport(report)
      await markReportSynced(report.id, new Date().toISOString())
      synced += 1
    } catch (error) {
      if (!isPermanentItemError(error)) throw error
      skipped += 1
    }
  }

  return { synced, skipped }
}

async function syncTestsData(): Promise<{ synced: number; skipped: number }> {
  const tests = await getUnsyncedNetworkTests()
  let synced = 0
  let skipped = 0

  for (const test of tests) {
    try {
      await pushNetworkTest(test)
      await markNetworkTestSynced(test.id, new Date().toISOString())
      synced += 1
    } catch (error) {
      if (!isPermanentItemError(error)) throw error
      skipped += 1
    }
  }

  return { synced, skipped }
}
