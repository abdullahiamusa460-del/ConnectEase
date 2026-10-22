import { Check, Leaf, TrendingUp } from 'lucide-react'
import { dataSaver } from '../data/demo'
import { cn } from '../lib/utils'
import { Switch } from './ui/Switch'

interface DataSaverCardProps {
  enabled: boolean
  onToggle: () => void
}

const optimisations = [
  'Images compressed before loading',
  'Video capped at 480p',
  'Background sync limited',
]

function SavingsRing({ percent }: { percent: number }) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * percent) / 100

  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="58" cy="58" r={radius} fill="none" stroke="#edf1ec" strokeWidth="9" />
        <circle
          cx="58"
          cy="58"
          r={radius}
          fill="none"
          stroke="url(#savings-gradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="savings-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0e7a5f" />
            <stop offset="100%" stopColor="#5fc9a5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[23px] font-bold leading-none tracking-[-0.02em] text-ink">
          {percent}%
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          saved
        </span>
      </div>
    </div>
  )
}

export function DataSaverCard({ enabled, onToggle }: DataSaverCardProps) {
  return (
    <section
      id="data-saver"
      aria-labelledby="data-saver-heading"
      className="card flex h-full scroll-mt-24 flex-col p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-brand-dark">
            <Leaf className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="data-saver-heading"
              className="font-display text-[15px] font-semibold tracking-[-0.01em]"
            >
              Data saver
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {enabled ? 'Active · less data used' : 'Paused · full quality'}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onChange={onToggle} label="Toggle data saver" />
      </div>

      <div className="mt-5 flex items-center gap-4 sm:mt-6 sm:gap-5">
        <SavingsRing percent={enabled ? dataSaver.savingsPercent : 0} />
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            Saved this month
          </p>
          <p className="mt-1 font-display text-[26px] font-bold leading-none tracking-[-0.03em] text-ink">
            {enabled ? `${dataSaver.savedMB} MB` : '0 MB'}
          </p>
          {enabled ? (
            <p className="mt-2 flex items-start gap-1 text-[10px] leading-relaxed text-brand">
              <TrendingUp className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{dataSaver.comparedToLastMonth}% less than last month</span>
            </p>
          ) : (
            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              Turn on to save about {dataSaver.potentialMonthlyMB} MB monthly.
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div
          className={cn(
            'rounded-2xl border border-line/70 bg-canvas/80 px-3.5 py-3 transition-opacity duration-300',
            !enabled && 'opacity-55',
          )}
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            {enabled ? 'Active optimisations' : 'Optimisations paused'}
          </p>
          <ul className="mt-2 space-y-1.5">
            {optimisations.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[11px] text-ink/75">
                <span
                  className={cn(
                    'grid h-4 w-4 shrink-0 place-items-center rounded-full',
                    enabled ? 'bg-brand/10 text-brand' : 'bg-line text-muted',
                  )}
                >
                  <Check className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
