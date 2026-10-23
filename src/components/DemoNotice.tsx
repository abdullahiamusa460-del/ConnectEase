import { Info, X } from 'lucide-react'

interface DemoNoticeProps {
  onDismiss: () => void
}

export function DemoNotice({ onDismiss }: DemoNoticeProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-amber/20 bg-amber-soft/70 px-3.5 py-3 text-[11px] leading-relaxed text-[#7d5a19] sm:items-center sm:px-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber sm:mt-0" aria-hidden="true" />
      <p className="flex-1">
        <span className="font-semibold">Demo preview.</span> Dashboard figures and sample records
        are demo data. Your workspace records, reports and test results are saved on this device
        first, then sync with the ConnectEase server when it is available.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss demo notice"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#7d5a19]/60 transition-colors hover:bg-amber/10 hover:text-[#7d5a19]"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
