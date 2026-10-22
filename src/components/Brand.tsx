import { cn } from '../lib/utils'

interface BrandProps {
  theme?: 'light' | 'dark'
  compact?: boolean
  className?: string
}

export function Brand({ theme = 'light', compact = false, className }: BrandProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-[#149578] to-[#075e49] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_-10px_rgba(7,94,73,0.8)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="h-6 w-6 text-white" fill="none">
          <circle cx="20" cy="27.5" r="2.6" fill="currentColor" />
          <path
            d="M13.2 21.2a9.4 9.4 0 0 1 13.6 0"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M8.6 16.1a16 16 0 0 1 22.8 0"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block font-display text-[17px] font-bold leading-none tracking-[-0.02em]',
            theme === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          ConnectEase
        </span>
        {!compact && (
          <span
            className={cn(
              'mt-1 block text-[9px] font-semibold uppercase tracking-[0.19em]',
              theme === 'dark' ? 'text-white/40' : 'text-muted',
            )}
          >
            Offline-first · Nigeria
          </span>
        )}
      </span>
    </div>
  )
}
