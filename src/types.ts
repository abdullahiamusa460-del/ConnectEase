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

export type AppRoute = 'dashboard' | 'workspace' | 'sync' | 'settings'

export interface AppNavItem {
  id: AppRoute
  label: string
  shortLabel: string
  icon: LucideIcon
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
