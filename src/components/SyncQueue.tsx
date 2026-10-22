import {
  CheckCircle2,
  CloudOff,
  CloudUpload,
  FileText,
  Images,
  Loader2,
  Map,
  RefreshCw,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import type { SyncItem, SyncStatus } from '../types'
import { cn, formatMB } from '../lib/utils'

interface SyncQueueProps {
  items: SyncItem[]
  isOffline: boolean
  isSyncing: boolean
  onSync: () => void
  onRestore: () => void
}

const statusStyles: Record<SyncStatus, string> = {
  waiting: 'bg-amber-soft text-amber',
  queued: 'bg-[#eef2f7] text-[#4b6b8a]',
  retry: 'bg-[#fbeceb] text-[#b4544e]',
}

const itemIcons: LucideIcon[] = [FileText, Images, Map]

const itemTileStyles = [
  'bg-brand-soft text-brand',
  'bg-[#eef2fb] text-[#4169a8]',
  'bg-lime-soft text-[#5a7a20]',
]

export function SyncQueue({ items, isOffline, isSyncing, onSync, onRestore }: SyncQueueProps) {
  const totalSize = items.reduce((sum, item) => sum + item.sizeMB, 0)
  const hasItems = items.length > 0
  const syncDisabled = !hasItems || isOffline || isSyncing

  return (
    <article id="sync" className="card flex h-full min-w-0 scroll-mt-24 flex-col" aria-labelledby="sync-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-soft text-amber">
            <CloudUpload className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="sync-heading"
              className="font-display text-[15px] font-semibold tracking-[-0.01em]"
            >
              Pending sync
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {isSyncing
                ? 'Previewing the demo queue locally…'
                : hasItems
                  ? 'Sample changes waiting in the demo queue.'
                  : 'All local changes are up to date.'}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
            isSyncing
              ? 'border-brand/15 bg-brand-soft text-brand-dark'
              : hasItems
                ? 'border-amber/15 bg-amber-soft text-amber'
                : 'border-brand/10 bg-brand-soft text-brand-dark',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isSyncing ? 'animate-pulse bg-brand' : hasItems ? 'bg-amber' : 'bg-brand',
            )}
            aria-hidden="true"
          />
          {isSyncing ? 'Previewing' : hasItems ? `${items.length} pending` : 'Preview cleared'}
        </span>
      </div>

      {isOffline && hasItems && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-amber/15 bg-amber-soft/70 px-3 py-2.5 text-[10px] leading-relaxed text-[#7d5a19] sm:mx-6">
          <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>You&apos;re offline. Sync will resume automatically when you reconnect.</span>
        </div>
      )}

      {hasItems ? (
        <>
          <ul className="flex-1 px-3 sm:px-4">
            {items.map((item, index) => {
              const Icon = itemIcons[index % itemIcons.length]
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-2 py-3 transition-opacity sm:px-2.5',
                    isSyncing && 'opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      itemTileStyles[index % itemTileStyles.length],
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-ink sm:text-[13px]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">
                      {formatMB(item.sizeMB)} · {isSyncing ? 'Previewing…' : item.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold capitalize',
                      isSyncing ? 'bg-brand-soft text-brand' : statusStyles[item.status],
                    )}
                  >
                    {isSyncing ? 'Previewing' : item.status}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="mx-5 mb-4 mt-1 sm:mx-6">
            <div className="rounded-2xl border border-line/70 bg-canvas/70 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-ink">Smart sync</p>
                  <p className="text-[9px] text-muted">Wi-Fi first for large uploads</p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-brand ring-1 ring-line">
                  On
                </span>
              </div>
              <p className="mt-2 text-[9px] leading-relaxed text-muted">
                Notes under 5 MB can sync on mobile data. Photos and maps wait for Wi-Fi.
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-line/70 pt-2 text-[9px]">
                <span className="text-muted">Last demo queue check</span>
                <span className="font-semibold text-ink">12 min ago</span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-line/80 p-5 sm:p-6">
            <button
              type="button"
              onClick={onSync}
              disabled={syncDisabled}
              className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors',
                syncDisabled
                  ? 'cursor-not-allowed bg-[#dfe8e3] text-[#6d8279]'
                  : 'bg-brand text-white shadow-[0_12px_24px_-14px_rgba(14,122,95,0.9)] hover:bg-brand-dark',
              )}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Previewing {items.length} items…
                </>
              ) : isOffline ? (
                <>
                  <CloudOff className="h-4 w-4" aria-hidden="true" />
                  Connect to sync
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Preview demo sync
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-muted">
              {isOffline
                ? 'You can keep working offline in the meantime.'
                : `Demo only · no server connected · ${formatMB(totalSize)} waiting`}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-[15px] font-semibold">Demo queue preview complete</p>
          <p className="mt-1 max-w-[230px] text-[11px] leading-relaxed text-muted">
            The demo queue was cleared locally. No server was contacted.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand/10 bg-brand-soft px-2.5 py-1 text-[9px] font-semibold text-brand-dark">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Demo queue cleared locally
          </p>
          <button
            type="button"
            onClick={onRestore}
            className="mt-4 text-[10px] font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-dark hover:underline"
          >
            Restore demo queue
          </button>
        </div>
      )}
    </article>
  )
}
