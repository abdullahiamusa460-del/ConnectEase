import { Leaf, TrendingDown } from 'lucide-react'
import { weeklyUsage } from '../data/demo'
import { cn, formatMB } from '../lib/utils'

interface UsageCardProps {
  dataSaverOn: boolean
}

export function UsageCard({ dataSaverOn }: UsageCardProps) {
  const totalUsed = weeklyUsage.reduce((sum, day) => sum + day.used, 0)
  const totalSaved = weeklyUsage.reduce((sum, day) => sum + day.saved, 0)
  const maxValue = Math.max(...weeklyUsage.map((day) => day.used + day.saved))

  return (
    <article className="card flex h-full flex-col p-5 sm:p-6" aria-labelledby="usage-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fb] text-[#4169a8]">
            <TrendingDown className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="usage-heading"
              className="font-display text-[15px] font-semibold tracking-[-0.01em]"
            >
              Weekly data usage
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">Last 7 days · mobile data</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
            dataSaverOn
              ? 'border-brand/10 bg-brand-soft text-brand-dark'
              : 'border-line bg-canvas text-muted',
          )}
        >
          <Leaf className="h-3 w-3" aria-hidden="true" />
          {dataSaverOn ? `${formatMB(totalSaved)} saved` : 'Saver off'}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-[26px] font-bold leading-none tracking-[-0.03em] text-ink">
            {formatMB(totalUsed)}
          </p>
          <p className="mt-1 text-[10px] text-muted">Used this week</p>
        </div>
        <p className="text-right text-[10px] leading-relaxed text-muted">
          <span className="block font-semibold text-brand">
            {dataSaverOn ? '−18%' : '0%'}
          </span>
          vs. last week
        </p>
      </div>

      <div
        className="mt-5 flex min-h-36 flex-1 items-stretch gap-1.5 sm:gap-2"
        role="img"
        aria-label={`Weekly usage chart. ${formatMB(totalUsed)} used and ${dataSaverOn ? formatMB(totalSaved) : '0 MB'} saved with data saver.`}
      >
        {weeklyUsage.map((day) => {
          const usedPercent = (day.used / maxValue) * 100
          const savedPercent = (day.saved / maxValue) * 100
          return (
            <div key={day.day} className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="group relative flex-1">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-[4px] bg-brand transition-colors group-hover:bg-brand-dark"
                  style={{ height: `${usedPercent}%` }}
                  title={`${day.day} · ${formatMB(day.used)} used${
                    dataSaverOn ? ` · ${formatMB(day.saved)} saved` : ''
                  }`}
                />
                {dataSaverOn && (
                  <div
                    className="absolute inset-x-0 rounded-t-[4px] bg-[#b9ddcd]"
                    style={{ bottom: `${usedPercent}%`, height: `${savedPercent}%` }}
                    title={`${day.day} · ${formatMB(day.saved)} saved`}
                  />
                )}
              </div>
              <span className="text-center text-[9px] font-medium text-muted">{day.day}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line/80 pt-4">
        <span className="flex items-center gap-1.5 text-[9px] text-muted">
          <span className="h-2 w-2 rounded-sm bg-brand" aria-hidden="true" />
          Data used
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-muted">
          <span
            className={cn('h-2 w-2 rounded-sm', dataSaverOn ? 'bg-[#b9ddcd]' : 'bg-line')}
            aria-hidden="true"
          />
          Saved by data saver
        </span>
        <span className="ml-auto text-[9px] text-muted">
          {dataSaverOn
            ? `~${formatMB(totalSaved)} saved this week`
            : 'Turn on data saver to save more'}
        </span>
      </div>
    </article>
  )
}
