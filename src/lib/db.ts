import type {
  AppSettings,
  PendingChange,
  RecordInput,
  WorkspaceRecord,
} from '../types'
import { createId } from './utils'

const DB_NAME = 'connectease-offline'
const DB_VERSION = 1
const SETTINGS_KEY = 'app-preferences'

const DEFAULT_SETTINGS: AppSettings = {
  dataSaver: true,
  compressImages: true,
  autoDownloadUpdates: false,
  downloadOnWifiOnly: true,
  syncOnWifiOnly: true,
  autoSync: true,
}

let dbPromise: Promise<IDBDatabase> | null = null

export { DEFAULT_SETTINGS }

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
