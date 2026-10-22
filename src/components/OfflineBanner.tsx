import { ArrowRight, WifiOff } from 'lucide-react'

interface OfflineBannerProps {
  isDeviceOffline: boolean
  isSimulatedOffline: boolean
  onOpenSync: () => void
}

export function OfflineBanner({
  isDeviceOffline,
  isSimulatedOffline,
  onOpenSync,
}: OfflineBannerProps) {
  if (!isDeviceOffline && !isSimulatedOffline) return null

  return (
    <div className="mb-4 flex flex-col gap-2.5 rounded-2xl border border-amber/20 bg-amber-soft/70 px-3.5 py-3 text-[11px] leading-relaxed text-[#7d5a19] sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-start gap-2.5">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
        <p>
          <span className="font-semibold">
            {isDeviceOffline ? 'You are offline.' : 'Offline simulation is on.'}
          </span>{' '}
          Saved records and the dashboard remain available. New changes are queued on this device
          and nothing is uploaded.
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenSync}
        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-amber/20 bg-white/60 px-2.5 text-[10px] font-semibold text-[#7d5a19] transition-colors hover:bg-white sm:self-auto"
      >
        View local queue
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  )
}
