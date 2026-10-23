import type {
  NetworkReport,
  NetworkTestResult,
  SyncMetaCredentials,
  WorkspaceSyncResponse,
} from '../types'
import { readSyncMeta, writeSyncMeta } from './db'
import { createId } from './utils'

const API_PATH = '/api/v1'
const CREDENTIALS_KEY = 'installation-credentials'
const REQUEST_TIMEOUT_MS = 20_000

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(options: {
    status: number
    code: string
    message: string
    details?: unknown
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}

function resolveApiBase(): string | null {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`
  }

  return null
}

export const apiBaseUrl = resolveApiBase()
export const isApiConfigured = apiBaseUrl !== null

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE'
    body?: unknown
    token?: string
    keepalive?: boolean
  } = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError({
      status: 0,
      code: 'NOT_CONFIGURED',
      message: 'No sync server is configured for this build.',
    })
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiBaseUrl}${API_PATH}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      keepalive: options.keepalive,
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : null

    if (!response.ok) {
      const error = (payload as { error?: { code?: string; message?: string; details?: unknown } })
        ?.error
      throw new ApiError({
        status: response.status,
        code: error?.code ?? `HTTP_${response.status}`,
        message: error?.message ?? `The sync server returned HTTP ${response.status}.`,
        details: error?.details,
      })
    }

    return payload as T
  } catch (cause) {
    if (cause instanceof ApiError) throw cause
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw new ApiError({
        status: 0,
        code: 'TIMEOUT',
        message: 'The sync server took too long to respond. Your changes remain queued.',
      })
    }
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'The sync server could not be reached. Your changes remain queued locally.',
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

function generateSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function createCredentials(): Promise<SyncMetaCredentials> {
  const credentials: SyncMetaCredentials = {
    installationId: createId(),
    secret: generateSecret(),
    createdAt: new Date().toISOString(),
  }
  await writeSyncMeta(CREDENTIALS_KEY, credentials)
  return credentials
}

async function getCredentials(): Promise<SyncMetaCredentials> {
  const stored = await readSyncMeta<SyncMetaCredentials>(CREDENTIALS_KEY)
  if (
    stored &&
    typeof stored.installationId === 'string' &&
    typeof stored.secret === 'string'
  ) {
    return stored
  }
  return createCredentials()
}

let registration: Promise<SyncMetaCredentials> | null = null

/**
 * Register (or re-register) the anonymous installation. Credentials are
 * generated on the device; the secret is never returned by the server.
 */
export function ensureRegistration(): Promise<SyncMetaCredentials> {
  if (!registration) {
    registration = registerWithRetry().finally(() => {
      registration = null
    })
  }
  return registration
}

async function registerWithRetry(): Promise<SyncMetaCredentials> {
  let credentials = await getCredentials()

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await request('/installations/register', {
        method: 'POST',
        body: {
          installationId: credentials.installationId,
          secret: credentials.secret,
        },
      })
      return credentials
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409 && attempt === 0) {
        // The id exists with different credentials (for example after local
        // storage was partially cleared). Start a fresh anonymous installation
        // rather than blocking every future sync.
        credentials = await createCredentials()
        continue
      }
      throw cause
    }
  }

  throw new ApiError({
    status: 409,
    code: 'REGISTRATION_FAILED',
    message: 'The installation could not be registered. Your changes remain queued locally.',
  })
}

function authorization(credentials: SyncMetaCredentials): string {
  return `ce1.${credentials.installationId}.${credentials.secret}`
}

export interface SyncChangePayload {
  recordId: string
  action: 'create' | 'update' | 'delete'
  changedAt: string
  record?: {
    title: string
    body: string
    category: 'note' | 'contact' | 'resource'
    pinned: boolean
    isSample: boolean
    createdAt: string
    updatedAt: string
  }
}

export async function pushWorkspace(payload: {
  batchId: string
  changes: SyncChangePayload[]
}): Promise<WorkspaceSyncResponse> {
  const credentials = await ensureRegistration()
  return request<WorkspaceSyncResponse>('/sync', {
    method: 'POST',
    body: payload,
    token: authorization(credentials),
  })
}

export async function pushReport(
  report: Pick<NetworkReport, 'id' | 'provider' | 'location' | 'issue' | 'reportedAt'>,
): Promise<{ report: NetworkReport; duplicate: boolean }> {
  const credentials = await ensureRegistration()
  return request('/reports', {
    method: 'POST',
    body: {
      id: report.id,
      provider: report.provider,
      location: report.location,
      issue: report.issue,
      reportedAt: report.reportedAt,
    },
    token: authorization(credentials),
  })
}

export async function removeRemoteReport(id: string): Promise<void> {
  const credentials = await ensureRegistration()
  await request(`/reports/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token: authorization(credentials),
  })
}

export async function pushNetworkTest(
  test: Pick<
    NetworkTestResult,
    | 'id'
    | 'endpoint'
    | 'latencyMs'
    | 'downloadMbps'
    | 'uploadMbps'
    | 'testedAt'
    | 'error'
    | 'available'
  >,
): Promise<{ test: NetworkTestResult; duplicate: boolean }> {
  const credentials = await ensureRegistration()
  return request('/network-tests', {
    method: 'POST',
    body: {
      id: test.id,
      endpoint: test.endpoint,
      latencyMs: test.latencyMs,
      downloadMbps: test.downloadMbps,
      uploadMbps: test.uploadMbps,
      testedAt: test.testedAt,
      error: test.error,
      available: test.available,
    },
    token: authorization(credentials),
  })
}

export interface RemoteReportFilters {
  provider?: string
  location?: string
  q?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
  sort?: 'newest' | 'oldest'
}

export interface RemoteReportsPage {
  data: NetworkReport[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export async function fetchReports(
  filters: RemoteReportFilters = {},
): Promise<RemoteReportsPage> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return request<RemoteReportsPage>(`/reports${query ? `?${query}` : ''}`)
}

export interface RemoteNetworkStats {
  generatedAt: string
  filters: {
    provider: string | null
    location: string | null
    from: string | null
    to: string | null
  }
  reports: {
    total: number
    last24h: number
    last7d: number
    lastReportedAt: string | null
    byProvider: Array<{ provider: string; count: number }>
    topLocations: Array<{ location: string; count: number }>
  }
  networkTests: {
    total: number
    completed: number
    unavailable: number
    averageLatencyMs: number | null
    averageDownloadMbps: number | null
    averageUploadMbps: number | null
    p50DownloadMbps: number | null
    p95LatencyMs: number | null
    latestTestedAt: string | null
  }
  dataSource: 'measured'
  sampleDataIncluded: false
}

export async function fetchStats(
  filters: Pick<RemoteReportFilters, 'provider' | 'location' | 'from' | 'to'> = {},
): Promise<RemoteNetworkStats> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  const response = await request<{ stats: RemoteNetworkStats }>(
    `/stats${query ? `?${query}` : ''}`,
  )
  return response.stats
}
