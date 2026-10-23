import type {
  AppSettings,
  NetworkReport,
  NetworkReportInput,
  NetworkTestResult,
  PendingChange,
  RecordInput,
  SyncAcknowledgement,
  SyncedWorkspaceRecord,
  WorkspaceRecord,
  WorkspaceTombstone,
} from '../types'
import { createId } from './utils'

const DB_NAME = 'connectease-offline'
const DB_VERSION = 3
const SETTINGS_KEY = 'app-preferences'
const TESTS_STORE = 'networkTests'
const REPORTS_STORE = 'reports'
const SYNC_STORE = 'syncMeta'

const DEFAULT_SETTINGS: AppSettings = {
  dataSaver: true,
  compressImages: true,
  autoDownloadUpdates: false,
  downloadOnWifiOnly: true,
  syncOnWifiOnly: true,
  autoSync: true,
}

let dbPromise: Promise<IDBDatabase> | null = null

export { DEFAULT_SETTINGS, TESTS_STORE, REPORTS_STORE, SYNC_STORE }

export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDBSupported()) {
    return Promise.reject(new Error('This browser does not support local databases.'))
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result

        if (!db.objectStoreNames.contains('records')) {
          const records = db.createObjectStore('records', { keyPath: 'id' })
          records.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('changes')) {
          const changes = db.createObjectStore('changes', { keyPath: 'recordId' })
          changes.createIndex('changedAt', 'changedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains(TESTS_STORE)) {
          const tests = db.createObjectStore(TESTS_STORE, { keyPath: 'id' })
          tests.createIndex('testedAt', 'testedAt', { unique: false })
          tests.createIndex('available', 'available', { unique: false })
        }

        if (!db.objectStoreNames.contains(REPORTS_STORE)) {
          const reports = db.createObjectStore(REPORTS_STORE, { keyPath: 'id' })
          reports.createIndex('reportedAt', 'reportedAt', { unique: false })
          reports.createIndex('provider', 'provider', { unique: false })
        }

        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        const db = request.result
        db.onversionchange = () => {
          db.close()
          dbPromise = null
        }
        resolve(db)
      }

      request.onerror = () => {
        dbPromise = null
        reject(request.error ?? new Error('Could not open the local database.'))
      }
    })
  }

  return dbPromise
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local database request failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Local database transaction failed.'))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Local database transaction was cancelled.'))
  })
}

function normalizeInput(input: RecordInput): RecordInput {
  return {
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category,
    pinned: input.pinned,
    isSample: input.isSample,
  }
}

export async function getRecords(): Promise<WorkspaceRecord[]> {
  const db = await openDatabase()
  const transaction = db.transaction('records', 'readonly')
  const records = await requestResult(
    transaction.objectStore('records').getAll() as IDBRequest<WorkspaceRecord[]>,
  )
  await transactionComplete(transaction)

  return records.sort((first, second) => {
    if (first.pinned !== second.pinned) return first.pinned ? -1 : 1
    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  })
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await openDatabase()
  const transaction = db.transaction('changes', 'readonly')
  const changes = await requestResult(
    transaction.objectStore('changes').getAll() as IDBRequest<PendingChange[]>,
  )
  await transactionComplete(transaction)

  return changes.sort(
    (first, second) =>
      new Date(second.changedAt).getTime() - new Date(first.changedAt).getTime(),
  )
}

export async function getRecord(id: string): Promise<WorkspaceRecord | undefined> {
  const db = await openDatabase()
  const transaction = db.transaction('records', 'readonly')
  const record = await requestResult(
    transaction.objectStore('records').get(id) as IDBRequest<WorkspaceRecord | undefined>,
  )
  await transactionComplete(transaction)
  return record
}

export async function createRecord(input: RecordInput): Promise<WorkspaceRecord> {
  const db = await openDatabase()
  const now = new Date().toISOString()
  const normalized = normalizeInput(input)
  const record: WorkspaceRecord = {
    id: createId(),
    title: normalized.title,
    body: normalized.body,
    category: normalized.category,
    pinned: normalized.pinned,
    isSample: normalized.isSample,
    createdAt: now,
    updatedAt: now,
  }

  const transaction = db.transaction(['records', 'changes'], 'readwrite')
  transaction.objectStore('records').put(record)

  const change: PendingChange = {
    recordId: record.id,
    action: 'create',
    title: record.title,
    category: record.category,
    changedAt: now,
  }
  transaction.objectStore('changes').put(change)

  await transactionComplete(transaction)
  return record
}

export async function updateRecord(
  id: string,
  input: RecordInput,
): Promise<WorkspaceRecord> {
  const db = await openDatabase()
  const transaction = db.transaction(['records', 'changes'], 'readwrite')
  const recordStore = transaction.objectStore('records')
  const changeStore = transaction.objectStore('changes')

  const existing = await requestResult(
    recordStore.get(id) as IDBRequest<WorkspaceRecord | undefined>,
  )
  if (!existing) {
    transaction.abort()
    throw new Error('This record no longer exists on this device.')
  }

  const pending = await requestResult(
    changeStore.get(id) as IDBRequest<PendingChange | undefined>,
  )
  const now = new Date().toISOString()
  const normalized = normalizeInput(input)
  const next: WorkspaceRecord = {
    ...existing,
    title: normalized.title,
    body: normalized.body,
    category: normalized.category,
    pinned: normalized.pinned,
    updatedAt: now,
  }

  recordStore.put(next)
  const change: PendingChange = {
    recordId: id,
    action: pending?.action === 'create' ? 'create' : 'update',
    title: next.title,
    category: next.category,
    changedAt: now,
  }
  changeStore.put(change)

  await transactionComplete(transaction)
  return next
}

export async function deleteRecord(record: WorkspaceRecord): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(['records', 'changes'], 'readwrite')
  const recordStore = transaction.objectStore('records')
  const changeStore = transaction.objectStore('changes')

  const pending = await requestResult(
    changeStore.get(record.id) as IDBRequest<PendingChange | undefined>,
  )

  recordStore.delete(record.id)

  if (pending?.action === 'create') {
    // The record never reached a server, so there is nothing useful to queue.
    changeStore.delete(record.id)
  } else {
    const change: PendingChange = {
      recordId: record.id,
      action: 'delete',
      title: record.title,
      category: record.category,
      changedAt: new Date().toISOString(),
    }
    changeStore.put(change)
  }

  await transactionComplete(transaction)
}

export async function readSettings(): Promise<AppSettings> {
  const db = await openDatabase()
  const transaction = db.transaction('settings', 'readonly')
  const stored = await requestResult(
    transaction.objectStore('settings').get(SETTINGS_KEY) as IDBRequest<
      { key: string; value: AppSettings } | undefined
    >,
  )
  await transactionComplete(transaction)

  return { ...DEFAULT_SETTINGS, ...(stored?.value ?? {}) }
}

export async function writeSettings(settings: AppSettings): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction('settings', 'readwrite')
  transaction.objectStore('settings').put({ key: SETTINGS_KEY, value: settings })
  await transactionComplete(transaction)
}

const sampleInputs: RecordInput[] = [
  {
    title: 'Lekki market survey — field notes',
    body:
      'Visited 12 traders around Ikate and Lekki Phase 1.\n\nKey findings:\n• Most traders use two networks and switch when one drops.\n• Bundle expiry is a bigger concern than headline data price.\n• Offline receipts would be useful during market-day congestion.\n\nFollow up with three shop owners next Tuesday.',
    category: 'note',
    pinned: true,
    isSample: true,
  },
  {
    title: 'Ibrahim Musa — shop owner',
    body:
      'Phone: 0803 000 0000\nBusiness: Musa Fabrics, Adeniran Ogunsanya\n\nPrefers WhatsApp voice notes. Interested in a weekly stock-taking template that works without data. Best time to call: after 6pm.',
    category: 'contact',
    pinned: false,
    isSample: true,
  },
  {
    title: 'Useful data bundle USSD codes',
    body:
      'Save this reference before travelling.\n\nMTN: *131#\nAirtel: *141#\nGlo: *777#\n9mobile: *228#\n\nTip: check the bundle balance before downloading offline maps. Night plans are cheaper but may not roll over.',
    category: 'resource',
    pinned: false,
    isSample: true,
  },
]

export async function addSampleRecords(): Promise<WorkspaceRecord[]> {
  const records: WorkspaceRecord[] = []
  for (const input of sampleInputs) {
    records.push(await createRecord(input))
  }
  return records
}

export async function getSettingsDefaults(): Promise<AppSettings> {
  return { ...DEFAULT_SETTINGS }
}

export async function saveNetworkTest(result: NetworkTestResult): Promise<NetworkTestResult> {
  const db = await openDatabase()

  const transaction = db.transaction(TESTS_STORE, 'readwrite')
  transaction.objectStore(TESTS_STORE).put(result)
  await transactionComplete(transaction)
  return result
}

export async function getNetworkTests(): Promise<NetworkTestResult[]> {
  const db = await openDatabase()
  const transaction = db.transaction(TESTS_STORE, 'readonly')
  const tests = await requestResult(
    transaction.objectStore(TESTS_STORE).getAll() as IDBRequest<NetworkTestResult[]>,
  )
  await transactionComplete(transaction)

  return tests.sort(
    (first, second) =>
      new Date(second.testedAt).getTime() - new Date(first.testedAt).getTime(),
  )
}

async function persistReport(
  input: NetworkReportInput,
  isDemo = false,
): Promise<NetworkReport> {
  const db = await openDatabase()
  const now = new Date().toISOString()
  const report: NetworkReport = {
    id: createId(),
    provider: input.provider,
    location: input.location ? input.location.trim() || null : null,
    issue: input.issue.trim(),
    reportedAt: now,
    ...(isDemo ? { isDemo: true } : {}),
  }

  const transaction = db.transaction(REPORTS_STORE, 'readwrite')
  transaction.objectStore(REPORTS_STORE).put(report)
  await transactionComplete(transaction)
  return report
}

export async function createReport(input: NetworkReportInput): Promise<NetworkReport> {
  return persistReport(input)
}

export async function getReports(): Promise<NetworkReport[]> {
  const db = await openDatabase()
  const transaction = db.transaction(REPORTS_STORE, 'readonly')
  const reports = await requestResult(
    transaction.objectStore(REPORTS_STORE).getAll() as IDBRequest<NetworkReport[]>,
  )
  await transactionComplete(transaction)

  return reports.sort(
    (first, second) =>
      new Date(second.reportedAt).getTime() - new Date(first.reportedAt).getTime(),
  )
}

export async function deleteReport(id: string): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(REPORTS_STORE, 'readwrite')
  transaction.objectStore(REPORTS_STORE).delete(id)
  await transactionComplete(transaction)
}

export async function getUnsyncedReports(): Promise<NetworkReport[]> {
  const reports = await getReports()
  return reports.filter((report) => !report.syncedAt && !report.isDemo)
}

export async function markReportSynced(id: string, syncedAt: string): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(REPORTS_STORE, 'readwrite')
  const store = transaction.objectStore(REPORTS_STORE)
  const report = await requestResult(
    store.get(id) as IDBRequest<NetworkReport | undefined>,
  )
  if (report) store.put({ ...report, syncedAt })
  await transactionComplete(transaction)
}

export async function getUnsyncedNetworkTests(): Promise<NetworkTestResult[]> {
  const tests = await getNetworkTests()
  return tests.filter((test) => !test.syncedAt)
}

export async function markNetworkTestSynced(id: string, syncedAt: string): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(TESTS_STORE, 'readwrite')
  const store = transaction.objectStore(TESTS_STORE)
  const test = await requestResult(
    store.get(id) as IDBRequest<NetworkTestResult | undefined>,
  )
  if (test) store.put({ ...test, syncedAt })
  await transactionComplete(transaction)
}

export async function readSyncMeta<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase()
  const transaction = db.transaction(SYNC_STORE, 'readonly')
  const stored = await requestResult(
    transaction.objectStore(SYNC_STORE).get(key) as IDBRequest<
      { key: string; value: T } | undefined
    >,
  )
  await transactionComplete(transaction)
  return stored?.value
}

export async function writeSyncMeta<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(SYNC_STORE, 'readwrite')
  transaction.objectStore(SYNC_STORE).put({ key, value })
  await transactionComplete(transaction)
}

/**
 * Merge a successful sync response into IndexedDB. Local edits that are newer
 * than the server copy are preserved and stay queued for the next sync.
 */
export async function applyWorkspaceSync(input: {
  acknowledgements: SyncAcknowledgement[]
  records: SyncedWorkspaceRecord[]
  tombstones: WorkspaceTombstone[]
}): Promise<void> {
  const db = await openDatabase()
  const transaction = db.transaction(['records', 'changes'], 'readwrite')
  const recordStore = transaction.objectStore('records')
  const changeStore = transaction.objectStore('changes')

  const touched = new Set<string>([
    ...input.acknowledgements.map((item) => item.recordId),
    ...input.records.map((item) => item.recordId),
    ...input.tombstones.map((item) => item.recordId),
  ])

  const pendingByRecord = new Map<string, PendingChange>()
  for (const recordId of touched) {
    const pending = await requestResult(
      changeStore.get(recordId) as IDBRequest<PendingChange | undefined>,
    )
    if (pending) pendingByRecord.set(recordId, pending)
  }

  for (const acknowledgement of input.acknowledgements) {
    const pending = pendingByRecord.get(acknowledgement.recordId)
    if (
      pending &&
      new Date(pending.changedAt).getTime() <=
        new Date(acknowledgement.changedAt).getTime()
    ) {
      changeStore.delete(acknowledgement.recordId)
      pendingByRecord.delete(acknowledgement.recordId)
    }
  }

  for (const remote of input.records) {
    const pending = pendingByRecord.get(remote.recordId)
    if (
      pending &&
      new Date(pending.changedAt).getTime() > new Date(remote.updatedAt).getTime()
    ) {
      continue
    }

    const existing = await requestResult(
      recordStore.get(remote.recordId) as IDBRequest<WorkspaceRecord | undefined>,
    )
    if (
      existing &&
      new Date(existing.updatedAt).getTime() > new Date(remote.updatedAt).getTime() &&
      !pending
    ) {
      continue
    }

    recordStore.put({
      id: remote.recordId,
      title: remote.title,
      body: remote.body,
      category: remote.category,
      pinned: remote.pinned,
      isSample: remote.isSample,
      createdAt: remote.createdAt,
      updatedAt: remote.updatedAt,
    } satisfies WorkspaceRecord)
  }

  for (const tombstone of input.tombstones) {
    const pending = pendingByRecord.get(tombstone.recordId)
    if (
      pending &&
      new Date(pending.changedAt).getTime() >
        new Date(tombstone.deletedAt).getTime()
    ) {
      continue
    }
    recordStore.delete(tombstone.recordId)
  }

  await transactionComplete(transaction)
}

const sampleReports: NetworkReportInput[] = [
  {
    provider: 'MTN',
    location: 'Ikeja, Lagos',
    issue: 'Data connection drops frequently during evening hours.',
  },
  {
    provider: 'Airtel',
    location: 'Yaba, Lagos',
    issue: 'Slow browsing speeds even with full signal bars.',
  },
  {
    provider: 'Glo',
    location: 'Ibadan, Oyo',
    issue: 'Unable to send WhatsApp messages during rainfall.',
  },
  {
    provider: '9mobile',
    location: 'Abuja, FCT',
    issue: 'No network in basement office.',
  },
]

export async function addSampleReports(): Promise<NetworkReport[]> {
  const reports: NetworkReport[] = []
  for (const input of sampleReports) {
    reports.push(await persistReport(input, true))
  }
  return reports
}
