import {
  Activity,
  BarChart3,
  CloudUpload,
  HardDriveDownload,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Smartphone,
} from 'lucide-react'
import type { AppNavItem, NavItem, NetworkProvider } from '../types'

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
    showBadge: true,
  },
  {
    id: 'sync',
    label: 'Sync centre',
    shortLabel: 'Sync',
    icon: CloudUpload,
    showBadge: true,
  },
  {
    id: 'network-test',
    label: 'Network test',
    shortLabel: 'Test',
    icon: BarChart3,
  },
  {
    id: 'network-reports',
    label: 'Network reports',
    shortLabel: 'Reports',
    icon: Smartphone,
    showBadge: true,
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

export const networkProviders: NetworkProvider[] = ['MTN', 'Airtel', 'Glo', '9mobile', 'Other']

export const providerLabels: Record<NetworkProvider, string> = {
  MTN: 'MTN',
  Airtel: 'Airtel',
  Glo: 'Glo',
  '9mobile': '9mobile',
  Other: 'Other provider',
}
