import type { LucideIcon } from 'lucide-react'

export type OfflineKind = 'Article' | 'Map' | 'Guide' | 'Audio' | 'PDF'

export interface OfflineItem {
  id: string
  title: string
  kind: OfflineKind
  sizeMB: number
  savedAt: string
  description: string
}

export type SyncStatus = 'queued' | 'waiting' | 'retry'

export interface SyncItem {
  id: string
  title: string
  sizeMB: number
  status: SyncStatus
  detail: string
}

export type ActivityCategory = 'sync' | 'network' | 'offline' | 'data'

export interface ActivityItem {
  id: string
  title: string
  detail: string
  time: string
  category: ActivityCategory
}

export type ToastTone = 'success' | 'info' | 'warning'

export interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
}

export interface NavItem {
  id: string
  label: string
  shortLabel: string
  icon: LucideIcon
  showInMobileNav: boolean
}

export type AppRoute = 'dashboard' | 'workspace' | 'sync' | 'settings' | 'network-test' | 'network-reports'

export interface AppNavItem {
  id: AppRoute
  label: string
  shortLabel: string
  icon: LucideIcon
  showBadge?: boolean
}

export type RecordCategory = 'note' | 'contact' | 'resource'

export interface WorkspaceRecord {
  id: string
  title: string
  body: string
  category: RecordCategory
  pinned: boolean
  createdAt: string
  updatedAt: string
  isSample?: boolean
}

export interface RecordInput {
  title: string
  body: string
  category: RecordCategory
  pinned: boolean
  isSample?: boolean
}

export type ChangeAction = 'create' | 'update' | 'delete'

export interface PendingChange {
  recordId: string
  action: ChangeAction
  title: string
  category: RecordCategory
  changedAt: string
}

export interface AppSettings {
  dataSaver: boolean
  compressImages: boolean
  autoDownloadUpdates: boolean
  downloadOnWifiOnly: boolean
  syncOnWifiOnly: boolean
  autoSync: boolean
}

export type ServiceWorkerStatus = 'dev' | 'unsupported' | 'registering' | 'ready' | 'error'

export type NetworkProvider = 'MTN' | 'Airtel' | 'Glo' | '9mobile' | 'Other'

export interface NetworkTestResult {
  id: string
  endpoint: string | null
  latencyMs: number | null
  downloadMbps: number | null
  uploadMbps: number | null
  testedAt: string
  error: string | null
  available: boolean
  syncedAt?: string
}

export interface NetworkReport {
  id: string
  provider: NetworkProvider
  location: string | null
  issue: string
  reportedAt: string
  isDemo?: boolean
  syncedAt?: string
}

export interface NetworkReportInput {
  provider: NetworkProvider
  location: string | null
  issue: string
}

export interface NetworkReportFilters {
  query: string
  provider: NetworkProvider | 'all'
}

/**
 * Shapes returned by the ConnectEase sync API. They intentionally mirror the
 * local workspace types so records can be merged without a UI-specific mapper.
 */
export interface SyncedWorkspaceRecord {
  recordId: string
  title: string
  body: string
  category: RecordCategory
  pinned: boolean
  isSample: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkspaceTombstone {
  recordId: string
  deletedAt: string
}

export interface SyncAcknowledgement {
  recordId: string
  action: ChangeAction
  status: 'applied' | 'conflict'
  changedAt: string
  serverUpdatedAt?: string
}

export interface WorkspaceSyncResponse {
  batchId: string
  replayed: boolean
  acknowledgements: SyncAcknowledgement[]
  records: SyncedWorkspaceRecord[]
  tombstones: WorkspaceTombstone[]
  serverTime: string
}

export interface SyncMetaCredentials {
  installationId: string
  secret: string
  createdAt: string
}
