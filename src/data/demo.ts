import type { ActivityItem, OfflineItem, SyncItem } from '../types'

export const demoUser = {
  name: 'Adaeze Okafor',
  firstName: 'Adaeze',
  initials: 'AO',
  location: 'Ikeja, Lagos',
  role: 'Field operations',
  plan: 'MTN · 3 GB monthly',
}

export const connection = {
  carrier: 'MTN',
  technology: '4G LTE',
  location: 'Ikeja, Lagos',
  signalLabel: 'Excellent',
  signalDbm: '−67 dBm',
  download: '24.6',
  upload: '8.2',
  latency: '38',
  session: '2h 16m',
  dataUsed: '86 MB',
  connectedSince: '08:42',
}

export const plan = {
  totalGB: 3,
  remainingGB: 1.8,
  usedGB: 1.2,
  resets: '24 Oct',
}

export const dataSaver = {
  savedMB: 486,
  savingsPercent: 68,
  potentialMonthlyMB: 486,
  comparedToLastMonth: 18,
}

export const initialOfflineItems: OfflineItem[] = [
  {
    id: 'offline-1',
    title: 'Understanding mobile data bundles in Nigeria',
    kind: 'Article',
    sizeMB: 1.2,
    savedAt: '2h ago',
    description: 'A plain-language guide to bundle rollover, night plans and USSD codes.',
  },
  {
    id: 'offline-2',
    title: 'Lagos → Ibadan route map',
    kind: 'Map',
    sizeMB: 12.8,
    savedAt: 'Yesterday',
    description: 'Offline map with fuel stops, toll points and alternate routes.',
  },
  {
    id: 'offline-3',
    title: 'Small business budgeting guide',
    kind: 'Guide',
    sizeMB: 3.4,
    savedAt: 'Yesterday',
    description: 'A practical workbook for tracking income, stock and daily expenses.',
  },
  {
    id: 'offline-4',
    title: 'Yoruba language basics — audio',
    kind: 'Audio',
    sizeMB: 8.6,
    savedAt: '2 days ago',
    description: 'Everyday greetings and market phrases, recorded for offline listening.',
  },
  {
    id: 'offline-5',
    title: 'First aid essentials',
    kind: 'PDF',
    sizeMB: 4.1,
    savedAt: '3 days ago',
    description: 'Step-by-step first response notes for common emergencies.',
  },
]

export const initialSyncItems: SyncItem[] = [
  {
    id: 'sync-1',
    title: 'Field notes — Lekki market survey',
    sizeMB: 2.4,
    status: 'waiting',
    detail: 'Waiting for Wi-Fi',
  },
  {
    id: 'sync-2',
    title: 'Customer visit photos (8)',
    sizeMB: 18.6,
    status: 'queued',
    detail: 'Queued · saved locally',
  },
  {
    id: 'sync-3',
    title: 'Kano route map update',
    sizeMB: 6.1,
    status: 'retry',
    detail: 'Connection dropped · retry',
  },
]

export const initialActivities: ActivityItem[] = [
  {
    id: 'activity-1',
    title: 'Offline library synced',
    detail: '3 saved items are now up to date.',
    time: '12 min ago',
    category: 'sync',
  },
  {
    id: 'activity-2',
    title: 'Connected to MTN 4G LTE',
    detail: 'Strong signal in Ikeja, Lagos.',
    time: '2h ago',
    category: 'network',
  },
  {
    id: 'activity-3',
    title: 'Saved a route map offline',
    detail: 'Lagos → Ibadan · 12.8 MB.',
    time: 'Yesterday · 18:24',
    category: 'offline',
  },
  {
    id: 'activity-4',
    title: 'Data saver compressed 6 images',
    detail: 'Around 24 MB of mobile data saved.',
    time: 'Yesterday · 09:10',
    category: 'data',
  },
  {
    id: 'activity-5',
    title: 'Queued field notes for sync',
    detail: 'Will upload automatically when connected.',
    time: 'Mon · 16:40',
    category: 'sync',
  },
]

export const weeklyUsage = [
  { day: 'Mon', used: 140, saved: 40 },
  { day: 'Tue', used: 210, saved: 70 },
  { day: 'Wed', used: 90, saved: 20 },
  { day: 'Thu', used: 260, saved: 90 },
  { day: 'Fri', used: 160, saved: 50 },
  { day: 'Sat', used: 230, saved: 80 },
  { day: 'Sun', used: 100, saved: 30 },
]
