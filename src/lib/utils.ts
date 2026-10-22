export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function formatMB(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} GB`
  }
  return `${value.toFixed(1)} MB`
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatTime(date = new Date()): string {
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function formatRelativeTime(iso: string): string {
  const value = new Date(iso).getTime()
  const diff = Date.now() - value
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(
    new Date(iso),
  )
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
