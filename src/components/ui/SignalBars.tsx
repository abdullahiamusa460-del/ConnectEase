import { cn } from '../../lib/utils'

interface SignalBarsProps {
  level: 0 | 1 | 2 | 3 | 4
  tone?: 'light' | 'dark'
  className?: string
}

const heights = ['h-1.5', 'h-2.5', 'h-3.5', 'h-[18px]']

export function SignalBars({ level, tone = 'light', className }: SignalBarsProps) {
  return (
    <div
      className={cn('flex items-end gap-[3px]', className)}
      role="img"
      aria-label={`Signal strength ${level} of 4 bars`}
    >
      {heights.map((height, index) => {
        const isActive = index < level
        return (
          <span
            key={height}
            className={cn(
              'w-[4px] rounded-full transition-colors duration-300',
              height,
              isActive
                ? tone === 'dark'
                  ? 'bg-emerald-300'
                  : 'bg-brand'
                : tone === 'dark'
                  ? 'bg-white/20'
                  : 'bg-line',
            )}
          />
        )
      })}
    </div>
  )
}
