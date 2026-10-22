import {
  Activity,
  CloudUpload,
  HardDriveDownload,
  LayoutDashboard,
  NotebookPen,
  Settings,
} from 'lucide-react'
import type { AppNavItem, NavItem } from '../types'

export const appNavItems: AppNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
  },
  {
    id: 'workspace',
    label: 'Offline workspace',
    shortLabel: 'Workspace',
    icon: NotebookPen,
  },
  {
    id: 'sync',
    label: 'Sync centre',
    shortLabel: 'Sync',
    icon: CloudUpload,
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
  },
]

export const dashboardSections: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    showInMobileNav: false,
  },
  {
    id: 'offline',
    label: 'Offline library',
    shortLabel: 'Offline',
    icon: HardDriveDownload,
    showInMobileNav: false,
  },
  {
    id: 'sync',
    label: 'Demo sync queue',
    shortLabel: 'Sync',
    icon: CloudUpload,
    showInMobileNav: false,
  },
  {
    id: 'activity',
    label: 'Recent activity',
    shortLabel: 'Activity',
    icon: Activity,
    showInMobileNav: false,
  },
]

export const sectionIds = dashboardSections.map((item) => item.id)
