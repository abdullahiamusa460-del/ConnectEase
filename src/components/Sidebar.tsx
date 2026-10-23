import { Leaf, ShieldCheck, Wifi, WifiOff } from 'lucide-react'
import { Brand } from './Brand'
import { demoUser, plan } from '../data/demo'
import { appNavItems, dashboardSections } from '../data/navigation'
import { cn } from '../lib/utils'
import type { AppRoute } from '../types'

interface SidebarProps {
  route: AppRoute
  activeSection: string
  demoQueueCount: number
  pendingChangesCount: number
  reportsCount: number
  isOffline: boolean
  dataSaverOn: boolean
  onNavigate: (route: AppRoute) => void
  onNavigateSection: (sectionId: string) => void
}

export function Sidebar({
  route,
  activeSection,
  demoQueueCount,
  pendingChangesCount,
  reportsCount,
  isOffline,
  dataSaverOn,
  onNavigate,
  onNavigateSection,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto bg-brand-deep lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.11),transparent_65%)]" />

      <div className="relative px-6 pb-6 pt-7">
        <Brand theme="dark" />
      </div>

      <div className="relative px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-200">
              {isOffline ? (
                <WifiOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Wifi className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/90">Demo workspace</p>
              <p className="truncate text-[11px] text-white/45">{demoUser.location}</p>
            </div>
            <span
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                isOffline
                  ? 'bg-amber/15 text-amber-200'
                  : 'bg-emerald-300/10 text-emerald-200',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isOffline ? 'bg-amber-300' : 'bg-emerald-300',
                )}
              />
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      <nav className="relative mt-6 px-4" aria-label="Application">
        <p className="px-3.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Workspace
        </p>
        <div className="mt-2.5 space-y-1">
          {appNavItems.map((item) => {
            const Icon = item.icon
            const isActive = route === item.id
            const isBadgeItem =
              item.id === 'workspace' ||
              item.id === 'sync' ||
              item.id === 'network-reports'
            const badge = isBadgeItem
              ? item.id === 'network-reports'
                ? reportsCount
                : pendingChangesCount
              : 0
            return (
              <a
                key={item.id}
                href={`#/${item.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(item.id)
                }}
                aria-current={isActive ? 'page' : undefined}
                className={cn('nav-link', isActive && 'nav-link-active')}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber/20 px-1.5 text-[10px] font-bold text-amber-200">
                    {badge}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </nav>

      <nav className="relative mt-5 px-4" aria-label="Dashboard sections">
        <p className="px-3.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
          Dashboard sections
        </p>
        <div className="mt-2.5 space-y-1">
          {dashboardSections.map((item) => {
            const Icon = item.icon
            const isActive = route === 'dashboard' && activeSection === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigateSection(item.id)
                }}
                aria-current={isActive ? 'location' : undefined}
                className={cn('nav-link', isActive && 'nav-link-active')}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.id === 'sync' && demoQueueCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/10 px-1.5 text-[10px] font-bold text-white/60">
                    {demoQueueCount}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </nav>

      <div className="relative mt-6 px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.025] p-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white">
            Offline-ready by design
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/45">
            Your essentials stay available, even when the network doesn&apos;t.
          </p>
          <div className="mt-3.5 flex items-center justify-between text-[9px] font-medium uppercase tracking-wider text-white/35">
            <span>Local records</span>
            <span className="text-white/65">{pendingChangesCount} queued</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-300/70"
              style={{ width: `${Math.min(pendingChangesCount * 12, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[9px] text-white/30">
            {plan.remainingGB} GB of plan data remaining
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/35">
              <Leaf className="h-3 w-3" aria-hidden="true" />
              Data saver
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px] font-semibold',
                dataSaverOn ? 'text-emerald-200' : 'text-white/40',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  dataSaverOn ? 'bg-emerald-300' : 'bg-white/25',
                )}
                aria-hidden="true"
              />
              {dataSaverOn ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-auto px-4 pb-5 pt-7">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e9b95f] to-[#c98530] text-xs font-bold text-[#3d2a0b]">
            {demoUser.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white/90">{demoUser.name}</p>
            <p className="truncate text-[10px] text-white/40">{demoUser.role}</p>
          </div>
          <span className="ml-auto rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white/35">
            Demo
          </span>
        </div>
        <p className="mt-4 text-center text-[9px] tracking-wide text-white/25">
          ConnectEase · Task 3 preview
        </p>
      </div>
    </aside>
  )
}
