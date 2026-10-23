import { AlertCircle, Loader2, Plus, RefreshCw, ServerOff, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import type { NetworkReport, NetworkReportInput, ToastTone } from '../types'
import { cn } from '../lib/utils'
import { ReportForm } from '../components/network-report/ReportForm'
import { ReportList } from '../components/network-report/ReportList'

interface NetworkReportsPageProps {
  isOnline: boolean
  isSimulatedOffline: boolean
  reports: NetworkReport[]
  isLoading: boolean
  error: string | null
  onReload: () => Promise<void>
  onAdd: (input: NetworkReportInput) => Promise<unknown>
  onRemove: (id: string) => Promise<void>
  onAddSamples: () => Promise<NetworkReport[]>
  onNotify: (message: string, tone?: ToastTone) => void
}

export function NetworkReportsPage({
  isOnline,
  isSimulatedOffline,
  reports,
  isLoading,
  error,
  onReload,
  onAdd,
  onRemove,
  onAddSamples,
  onNotify,
}: NetworkReportsPageProps) {
  const isOffline = !isOnline || isSimulatedOffline
  const [formOpen, setFormOpen] = useState(false)
  const [addingSamples, setAddingSamples] = useState(false)

  const handleAdd = async (input: NetworkReportInput) => {
    await onAdd(input)
    setFormOpen(false)
    onNotify('Report saved locally on this device.', 'success')
  }

  const handleRemove = async (id: string) => {
    await onRemove(id)
    onNotify('Report deleted from this device.', 'info')
  }

  const handleAddSamples = async () => {
    setAddingSamples(true)
    try {
      const added = await onAddSamples()
      onNotify(
        `${added.length} sample network reports added. These are clearly labeled demo reports — they are not real measurements.`,
        'info',
      )
    } finally {
      setAddingSamples(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="network-reports-page-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-2">
              Connectivity reporting
              <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
              <span className="font-medium normal-case tracking-normal text-muted">
                Demo reports are labeled
              </span>
            </p>
            <h1
              id="network-reports-page-heading"
              className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
            >
              Network reports
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Voluntarily report poor network experiences. Choose your provider and area, describe
              the issue, and save it locally. Reports can be created and viewed offline, then sync
              when a connection returns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold',
                isOffline
                  ? 'border-amber/20 bg-amber-soft text-amber'
                  : 'border-brand/15 bg-brand-soft text-brand-dark',
              )}
            >
              {isOffline ? (
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isOffline ? 'Offline' : 'Online'}
            </span>
            <button
              type="button"
              onClick={handleAddSamples}
              disabled={addingSamples}
              className="btn-secondary"
            >
              {addingSamples ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              Add sample reports
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New report
            </button>
          </div>
        </div>
      </section>

      {isOffline && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#cdddec] bg-[#eef2fb] px-4 py-3 text-[11px] leading-relaxed text-[#4169a8]">
          <ServerOff className="mt-0.5 h-4 w-4 shrink-0 text-[#4169a8]" aria-hidden="true" />
          <p>
            <span className="font-semibold">You are offline.</span>{' '}
            New reports are saved locally and can be viewed here without a connection.
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#b4544e]/20 bg-[#fbeceb] px-3.5 py-3 text-[11px] text-[#8f3f3a]">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => void onReload()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold hover:bg-white/60"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card p-5" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading saved reports</span>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-[#e8ede8]" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[150px] animate-pulse rounded-2xl bg-[#edf1ec]" />
            ))}
          </div>
        </div>
      ) : (
        <ReportList reports={reports} onDelete={handleRemove} />
      )}

      {formOpen && (
        <ReportForm
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  )
}
