import {
  Activity,
  CloudUpload,
  HardDriveDownload,
  Leaf,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityCategory, ActivityItem } from '../types'
import { cn } from '../lib/utils'

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const categoryMeta: Record<ActivityCategory, { icon: LucideIcon; tile: string }> = {
  sync: { icon: CloudUpload, tile: 'border-brand/15 bg-brand-soft text-brand' },
  network: { icon: Wifi, tile: 'border-[#4169a8]/15 bg-[#eef2fb] text-[#4169a8]' },
  offline: { icon: HardDriveDownload, tile: 'border-[#7a9a35]/15 bg-lime-soft text-[#5a7a20]' },
  data: { icon: Leaf, tile: 'border-amber/15 bg-amber-soft text-amber' },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <article
      id="activity"
      className="card flex h-full scroll-mt-24 flex-col p-5 sm:p-6"
      aria-labelledby="activity-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Activity className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="activity-heading"
              className="font-display text-[15px] font-semibold tracking-[-0.01em]"
            >
              Recent activity
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">What happened across your workspace.</p>
          </div>
        </div>
        <span className="chip">Newest first</span>
      </div>

      {activities.length > 0 ? (
        <ol className="mt-6 flex-1">
          {activities.map((activity, index) => {
            const meta = categoryMeta[activity.category]
            const Icon = meta.icon
            const isLast = index === activities.length - 1
            return (
              <li key={activity.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute bottom-1 left-[17px] top-9 w-px bg-line"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border',
                    meta.tile,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-[12px] font-semibold text-ink sm:text-[13px]">
                      {activity.title}
                    </p>
                    <time className="shrink-0 text-[9px] text-muted sm:text-[10px]">
                      {activity.time}
                    </time>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted sm:text-[11px]">
                    {activity.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-display text-sm font-semibold">No activity yet</p>
          <p className="mt-1 max-w-[230px] text-[11px] leading-relaxed text-muted">
            Network changes, syncs and downloads will show up here.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/80 pt-4">
        <p className="flex items-center gap-1.5 text-[9px] text-muted sm:text-[10px]">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Activity is stored locally on this device
        </p>
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted/70">
          Demo data
        </span>
      </div>
    </article>
  )
}
