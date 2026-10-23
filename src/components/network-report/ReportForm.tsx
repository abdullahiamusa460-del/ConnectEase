import {
  AlertCircle,
  Calendar,
  Loader2,
  MapPin,
  Network,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import type { NetworkProvider, NetworkReportInput } from '../../types'
import { networkProviders, providerLabels } from '../../data/navigation'
import { Modal } from '../ui/Modal'

interface ReportFormProps {
  onClose: () => void
  onSubmit: (input: NetworkReportInput) => Promise<unknown>
}

const providerIcons: Record<NetworkProvider, LucideIcon> = {
  MTN: Network,
  Airtel: Network,
  Glo: Network,
  '9mobile': Network,
  Other: Network,
} as const

export function ReportForm({ onClose, onSubmit }: ReportFormProps) {
  const [provider, setProvider] = useState<NetworkProvider>('MTN')
  const [location, setLocation] = useState('')
  const [issue, setIssue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!issue.trim()) {
      setError('Please describe the network issue you experienced.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        provider,
        location: location.trim() || null,
        issue: issue.trim(),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Report could not be saved.')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Report a network issue"
      description="Voluntarily report poor network experiences. Reports are saved on this device first and sync when online."
      icon={
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbeceb] text-[#b4544e]">
          <AlertCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      }
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="network-report-form" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Save report locally
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="network-report-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="label">Mobile provider</span>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {networkProviders.map((item) => {
              const Icon = providerIcons[item as NetworkProvider]
              const isActive = provider === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setProvider(item)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'border-brand/25 bg-brand-soft text-brand-dark'
                      : 'border-line bg-white text-muted hover:border-brand/20 hover:text-ink',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {providerLabels[item]}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="report-location" className="label">
            Area or approximate location
          </label>
          <input
            id="report-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={80}
            placeholder="e.g. Ikeja, Lagos"
            className="field mt-2"
          />
          <p className="mt-1 text-[10px] text-muted">Optional. Do not share personal addresses.</p>
        </div>

        <div>
          <label htmlFor="report-issue" className="label">
            What happened
          </label>
          <textarea
            id="report-issue"
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="e.g. Calls drop repeatedly, slow browsing, no signal indoors…"
            className="field mt-2 min-h-[120px] resize-y leading-relaxed"
          />
          <p className="mt-1.5 text-[10px] text-muted">{issue.length}/1000</p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-canvas/60 px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-muted ring-1 ring-line">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-ink">Reported</p>
              <p className="text-[9px] text-muted">Recorded with local date and time.</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-ink">{new Date().toLocaleString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</span>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#b4544e]/20 bg-[#fbeceb] px-3 py-2.5 text-[11px] leading-relaxed text-[#8f3f3a]"
          >
            {error}
          </p>
        )}

        <p className="flex items-start gap-1.5 rounded-xl bg-[#fbeceb]/55 px-3 py-2.5 text-[10px] leading-relaxed text-[#8f3f3a]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This report is saved in IndexedDB first. When a sync server is configured, it is
          uploaded automatically the next time you are online.
        </p>
      </form>
    </Modal>
  )
}
