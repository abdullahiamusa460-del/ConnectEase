import {
  ArrowRight,
  CheckCircle2,
  CloudOff,
  CloudUpload,
  HardDriveDownload,
  Leaf,
  RefreshCw,
  ServerOff,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  Wifi,
  WifiOff,
} from 'lucide-react'
import type { AppSettings, PendingChange } from '../types'
import { cn, formatRelativeTime } from '../lib/utils'
import { changeMeta } from '../components/workspace/recordMeta'

interface SyncPageProps {
  recordsCount: number
  changes: PendingChange[]
  isOnline: boolean
  isSimulatedOffline: boolean
  settings: AppSettings
  onCheckAgain: () => void
  onOpenSettings: () => void
  onOpenWorkspace: () => void
}

export function SyncPage({
  recordsCount,
  changes,
  isOnline,
  isSimulatedOffline,
  settings,
  onCheckAgain,
  onOpenSettings,
  onOpenWorkspace,
}: SyncPageProps) {
  const isOffline = !isOnline || isSimulatedOffline
  const lastChange = changes[0]?.changedAt

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="sync-page-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-2">
              Synchronisation
              <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
              <span className="font-medium normal-case tracking-normal text-muted">
                Local queue
              </span>
            </p>
            <h1
              id="sync-page-heading"
              className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
            >
              Sync centre
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              See which local changes are waiting and whether the app can reach a sync server.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold',
                isOffline
                  ? 'border-amber/20 bg-amber-soft text-amber'
                  : 'border-brand/15 bg-brand-soft text-brand-dark',
              )}
            >
              {isOffline ? (
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isOffline ? 'Offline' : 'Online'}
            </span>
            <button type="button" className="btn-secondary" onClick={onCheckAgain}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Check again
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-amber/25 bg-amber-soft/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <ServerOff className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
          <div>
            <p className="text-[12px] font-semibold text-[#7d5a19]">Sync server not connected</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#7d5a19]/85">
              This is a frontend-only build. Nothing is uploaded, and no change is marked as
              synced. Your records stay safely queued on this device.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber/20 bg-white/60 px-2.5 text-[10px] font-semibold text-[#7d5a19] transition-colors hover:bg-white"
        >
          <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
          Sync preferences
        </button>
      </div>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-label="Sync summary">
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <CloudUpload className="h-3 w-3" aria-hidden="true" />
            Pending
          </p>
          <p className="mt-1.5 font-display text-[22px] font-bold leading-none text-ink sm:text-[26px]">
            {changes.length}
          </p>
          <p className="mt-1.5 text-[9px] text-amber">
            {changes.length > 0 ? 'Waiting for server' : 'Nothing waiting'}
          </p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <HardDriveDownload className="h-3 w-3" aria-hidden="true" />
            Records
          </p>
          <p className="mt-1.5 font-display text-[22px] font-bold leading-none text-ink sm:text-[26px]">
            {recordsCount}
          </p>
          <p className="mt-1.5 text-[9px] text-muted">On this device</p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Last change
          </p>
          <p className="mt-1.5 font-display text-[16px] font-bold leading-none text-ink sm:text-[20px]">
            {lastChange ? formatRelativeTime(lastChange) : '—'}
          </p>
          <p className="mt-1.5 text-[9px] text-muted">Stored locally</p>
        </div>
      </section>

      {isOffline && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#cdddec] bg-[#eef2fb] px-4 py-3 text-[11px] leading-relaxed text-[#4169a8]">
          <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">You are offline.</span>{' '}
            {isSimulatedOffline && isOnline
              ? 'Offline simulation is on. Your records are still available and new changes stay queued.'
              : 'Your records are still available and new changes stay queued on this device.'}
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <section
          className="card flex min-w-0 flex-col xl:col-span-8"
          aria-labelledby="pending-changes-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-soft text-amber">
                <CloudUpload className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="pending-changes-heading"
                  className="font-display text-[15px] font-semibold tracking-[-0.01em]"
                >
                  Pending changes
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Local actions that still need a server.
                </p>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
                changes.length > 0
                  ? 'border-amber/15 bg-amber-soft text-amber'
                  : 'border-brand/10 bg-brand-soft text-brand-dark',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  changes.length > 0 ? 'bg-amber' : 'bg-brand',
                )}
                aria-hidden="true"
              />
              {changes.length > 0 ? `${changes.length} waiting` : 'Queue empty'}
            </span>
          </div>

          {changes.length > 0 ? (
            <>
              <ul className="flex-1 px-3 sm:px-4">
                {changes.map((change) => {
                  const meta = changeMeta[change.action]
                  const Icon = meta.icon
                  return (
                    <li
                      key={change.recordId}
                      className="flex items-center gap-3 rounded-2xl px-2 py-3 sm:px-2.5"
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                          meta.tile,
                        )}
                      >
                        <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-ink sm:text-[13px]">
                          {change.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted">
                          {meta.label} · {formatRelativeTime(change.changedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-amber/15 bg-amber-soft px-2 py-1 text-[9px] font-semibold text-amber">
                        Waiting for server
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-auto border-t border-line/80 p-5 sm:p-6">
                <div className="flex items-start gap-2.5 rounded-xl border border-line/80 bg-canvas/60 px-3.5 py-3 text-[10px] leading-relaxed text-muted">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" aria-hidden="true" />
                  <span>
                    These changes are not marked as synced. When a backend is added, the queue can
                    be processed without changing the records on this device.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenWorkspace}
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  Open offline workspace
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-[15px] font-semibold">No local changes waiting</p>
              <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
                Create or edit a record and it will appear here until a real sync server is
                connected.
              </p>
              <button type="button" className="btn-secondary mt-4" onClick={onOpenWorkspace}>
                Go to workspace
              </button>
            </div>
          )}
        </section>

        <div className="min-w-0 space-y-4 xl:col-span-4">
          <section className="card p-5 sm:p-6" aria-labelledby="connection-heading-sync">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fb] text-[#4169a8]">
                <Wifi className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="connection-heading-sync"
                  className="font-display text-[15px] font-semibold"
                >
                  Connection
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">Device and server status.</p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="text-[10px] text-muted">Device network</dt>
                <dd
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[10px] font-semibold',
                    isOffline ? 'text-amber' : 'text-brand',
                  )}
                >
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', isOffline ? 'bg-amber' : 'bg-brand')}
                    aria-hidden="true"
                  />
                  {isOffline ? 'Offline' : 'Online'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="text-[10px] text-muted">Sync server</dt>
                <dd className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#a8463f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b4544e]" aria-hidden="true" />
                  Not connected
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="text-[10px] text-muted">Local records</dt>
                <dd className="text-[10px] font-semibold text-ink">{recordsCount} saved</dd>
              </div>
            </dl>

            <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden="true" />
              Records remain available offline. No data leaves this device in this build.
            </p>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="sync-preferences-heading">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="sync-preferences-heading"
                  className="font-display text-[15px] font-semibold"
                >
                  Preferences
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">Saved for a future backend.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-muted">
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  Data saver
                </span>
                <span className="font-semibold text-ink">{settings.dataSaver ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-muted">
                  <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                  Sync on Wi-Fi only
                </span>
                <span className="font-semibold text-ink">
                  {settings.syncOnWifiOnly ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-muted">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Retry automatically
                </span>
                <span className="font-semibold text-ink">{settings.autoSync ? 'On' : 'Off'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Manage preferences
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
