import {
  ArrowDownToLine,
  CheckCircle2,
  CloudUpload,
  Database,
  Gauge,
  HardDriveDownload,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { plan } from '../data/demo'
import { cn, formatMB } from '../lib/utils'

interface StatCardProps {
  label: string
  icon: LucideIcon
  iconClass: string
  badge: string
  badgeClass: string
  value: string
  suffix: string
  footer: ReactNode
  dark?: boolean
}

function StatCard({
  label,
  icon: Icon,
  iconClass,
  badge,
  badgeClass,
  value,
  suffix,
  footer,
  dark = false,
}: StatCardProps) {
  return (
    <article
      className={cn(
        'card card-hover relative overflow-hidden p-4 sm:p-5',
        dark && 'bg-gradient-to-br from-white to-[#f8faf6]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', iconClass)}>
          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold',
            badgeClass,
          )}
        >
          {badge}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="font-display text-[24px] font-bold leading-none tracking-[-0.03em] text-ink sm:text-[26px]">
          {value}
        </span>
        <span className="text-[10px] font-medium text-muted sm:text-[11px]">{suffix}</span>
      </p>
      <div className="mt-3">{footer}</div>
    </article>
  )
}

function SpeedSparkline() {
  return (
    <svg
      viewBox="0 0 120 28"
      className="h-7 w-20 shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="speed-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7a5f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0e7a5f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 22 C12 20 15 11 26 13 C38 15 40 7 52 9 C64 11 67 18 78 15 C90 12 94 4 106 6 C112 7 116 4 120 3 L120 28 L0 28 Z"
        fill="url(#speed-fill)"
      />
      <path
        d="M0 22 C12 20 15 11 26 13 C38 15 40 7 52 9 C64 11 67 18 78 15 C90 12 94 4 106 6 C112 7 116 4 120 3"
        fill="none"
        stroke="#0e7a5f"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

interface StatCardsProps {
  offlineCount: number
  offlineSize: number
  syncCount: number
  syncSize: number
}

export function StatCards({ offlineCount, offlineSize, syncCount, syncSize }: StatCardsProps) {
  const planUsedPercent = Math.round((plan.usedGB / plan.totalGB) * 100)

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard
        label="Data balance"
        icon={Database}
        iconClass="bg-brand-soft text-brand"
        badge={`${100 - planUsedPercent}% left`}
        badgeClass="border-brand/10 bg-brand-soft text-brand-dark"
        value={plan.remainingGB.toFixed(1)}
        suffix="GB"
        footer={
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1ec]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0e7a5f] to-[#4bbf97]"
                style={{ width: `${planUsedPercent}%` }}
                role="progressbar"
                aria-label={`${planUsedPercent}% of data plan used`}
                aria-valuenow={planUsedPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-2 text-[9px] leading-tight text-muted sm:text-[10px]">
              {plan.usedGB} GB used of {plan.totalGB} GB · resets {plan.resets}
            </p>
          </div>
        }
      />

      <StatCard
        label="Avg. download"
        icon={Gauge}
        iconClass="bg-[#eef2fb] text-[#4169a8]"
        badge="+12%"
        badgeClass="border-[#4169a8]/10 bg-[#eef2fb] text-[#4169a8]"
        value="24.6"
        suffix="Mbps"
        footer={
          <div className="flex items-end justify-between gap-2">
            <p className="text-[9px] leading-tight text-muted sm:text-[10px]">
              Peak 41.2 Mbps today
            </p>
            <SpeedSparkline />
          </div>
        }
      />

      <StatCard
        label="Offline content"
        icon={HardDriveDownload}
        iconClass="bg-lime-soft text-[#5a7a20]"
        badge="Ready"
        badgeClass="border-[#7a9a35]/10 bg-lime-soft text-[#5a7a20]"
        value={String(offlineCount)}
        suffix="items"
        footer={
          <p className="flex items-center gap-1.5 text-[9px] leading-tight text-muted sm:text-[10px]">
            <ArrowDownToLine className="h-3 w-3 shrink-0" aria-hidden="true" />
            {formatMB(offlineSize)} available without data
          </p>
        }
      />

      <StatCard
        label="Pending sync"
        icon={CloudUpload}
        iconClass={
          syncCount > 0 ? 'bg-amber-soft text-amber' : 'bg-brand-soft text-brand'
        }
        badge={syncCount > 0 ? `${syncCount} waiting` : 'All synced'}
        badgeClass={
          syncCount > 0
            ? 'border-amber/15 bg-amber-soft text-amber'
            : 'border-brand/10 bg-brand-soft text-brand'
        }
        value={String(syncCount)}
        suffix="items"
        footer={
          <p className="flex items-center gap-1.5 text-[9px] leading-tight text-muted sm:text-[10px]">
            {syncCount > 0 ? (
              <>
                <CloudUpload className="h-3 w-3 shrink-0" aria-hidden="true" />
                {formatMB(syncSize)} waiting to upload
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 shrink-0 text-brand" aria-hidden="true" />
                Everything is up to date
              </>
            )}
          </p>
        }
      />
    </div>
  )
}
