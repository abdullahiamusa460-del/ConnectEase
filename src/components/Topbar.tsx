import { ChevronRight, Leaf, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Brand } from './Brand'
import { demoUser } from '../data/demo'
import { cn } from '../lib/utils'
import type { AppRoute } from '../types'

interface TopbarProps {
  route: AppRoute
  dataSaverOn: boolean
  onToggleDataSaver: () => void
  isLoading: boolean
  onRefresh: () => void
  lastUpdated: string
  isOnline: boolean
  isSimulatedOffline: boolean
}

const routeMeta: Record<AppRoute, { crumb: string; title: string; subtitle?: string }> = {
  dashboard: { crumb: 'Workspace', title: 'Dashboard', subtitle: 'Overview' },
  workspace: { crumb: 'Workspace', title: 'Offline workspace' },
  sync: { crumb: 'Workspace', title: 'Sync centre' },
  'network-test': { crumb: 'Connectivity', title: 'Network test' },
  'network-reports': { crumb: 'Connectivity', title: 'Network reports' },
  settings: { crumb: 'Preferences', title: 'Settings' },
}

export function Topbar({
  route,
  dataSaverOn,
  onToggleDataSaver,
  isLoading,
  onRefresh,
  lastUpdated,
  isOnline,
  isSimulatedOffline,
}: TopbarProps) {
  const meta = routeMeta[route]
  const statusLabel = !isOnline ? 'Device offline' : isSimulatedOffline ? 'Offline demo' : 'Online'

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
              <span>{meta.crumb}</span>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span className="text-ink">{meta.title}</span>
            </div>
            <p className="mt-0.5 font-display text-sm font-semibold text-ink">
              {meta.subtitle ?? meta.title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-amber/20 bg-amber-soft px-2.5 py-1 text-[10px] font-semibold text-amber sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
            Demo data
          </span>

          <span
            className={cn(
              'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold lg:inline-flex',
              !isOnline || isSimulatedOffline
                ? 'border-amber/20 bg-amber-soft text-amber'
                : 'border-brand/15 bg-brand-soft text-brand-dark',
            )}
            title={statusLabel}
          >
            {!isOnline || isSimulatedOffline ? (
              <WifiOff className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Wifi className="h-3 w-3" aria-hidden="true" />
            )}
            {statusLabel}
          </span>

          <span className="hidden text-[10px] text-muted xl:inline">Updated {lastUpdated}</span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh current view"
            title="Refresh current view"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-muted shadow-sm transition-colors hover:border-brand/30 hover:text-brand disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={onToggleDataSaver}
            aria-pressed={dataSaverOn}
            aria-label={`Data saver is ${dataSaverOn ? 'on' : 'off'}. Toggle data saver.`}
            title="Toggle data saver"
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold transition-colors',
              dataSaverOn
                ? 'border-brand/20 bg-brand-soft text-brand-dark'
                : 'border-line bg-white text-muted hover:text-ink',
            )}
          >
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Data saver</span>
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                dataSaverOn ? 'bg-brand' : 'bg-muted/50',
              )}
              aria-hidden="true"
            />
          </button>

          <div className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#e9b95f] to-[#c98530] text-[11px] font-bold text-[#3d2a0b] ring-2 ring-white shadow-sm">
              {demoUser.initials}
            </span>
            <span className="hidden leading-tight xl:block">
              <span className="block text-[11px] font-semibold text-ink">{demoUser.name}</span>
              <span className="block text-[10px] text-muted">Demo workspace</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
