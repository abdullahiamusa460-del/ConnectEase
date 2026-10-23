import { BarChart3, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { cn, formatRelativeTime } from '../../lib/utils'
import {
  runNetworkTest,
  formatLatency,
  formatSpeed,
  testStatusLabel,
  type NetworkTestResult,
} from '../../lib/networkTest'
import { saveNetworkTest } from '../../lib/db'

interface NetworkTestCardProps {
  onSaveResult?: (result: NetworkTestResult) => void
}

export function NetworkTestCard({ onSaveResult }: NetworkTestCardProps) {
  const [endpoint, setEndpoint] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<NetworkTestResult | null>(null)

  const handleRun = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const next = await runNetworkTest(endpoint || null)
      setResult(next)
      await saveNetworkTest(next)
      onSaveResult?.(next)
    } catch (cause) {
      setResult({
        id: crypto.randomUUID(),
        endpoint: endpoint || null,
        latencyMs: null,
        downloadMbps: null,
        uploadMbps: null,
        testedAt: new Date().toISOString(),
        error: cause instanceof Error ? cause.message : 'Network test could not complete.',
        available: false,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="network-test-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fb] text-[#4169a8]">
            <BarChart3 className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 id="network-test-heading" className="font-display text-[15px] font-semibold tracking-[-0.01em]">
              Network test
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Measure latency, download and upload speed against an endpoint.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="label sm:shrink-0">Test endpoint URL</label>
          <div className="flex-1 min-w-0">
            <input
              type="url"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder="https://example.com/test-file"
              className="field"
            />
          </div>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              'btn-primary shrink-0',
              isRunning && 'cursor-wait opacity-80',
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Testing…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Run test
              </>
            )}
          </button>
        </div>

        {!endpoint && (
          <p className="text-[10px] text-muted">
            Enter a URL above to measure. Latency, download and upload speed are all unavailable
            without a test endpoint — no speeds are simulated.
          </p>
        )}

        {result && (
          <div className="mt-3 rounded-2xl border border-line/80 bg-canvas/40 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Result
                </p>
                <p className="text-[11px] font-medium text-ink">
                  {testStatusLabel(result)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold',
                  result.available
                    ? 'border-brand/10 bg-brand-soft text-brand-dark'
                    : 'border-amber/15 bg-amber-soft text-amber',
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', result.available ? 'bg-brand' : 'bg-amber')}
                  aria-hidden="true"
                />
                {result.available ? 'Completed' : 'Unavailable'}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-line bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Latency</p>
                <p className="font-display text-[18px] font-bold text-ink whitespace-nowrap">{formatLatency(result.latencyMs)}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Download</p>
                <p className="font-display text-[18px] font-bold text-ink whitespace-nowrap">{formatSpeed(result.downloadMbps)}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Upload</p>
                <p className="font-display text-[18px] font-bold text-ink whitespace-nowrap">{formatSpeed(result.uploadMbps)}</p>
              </div>
              <div className="rounded-xl border border-line bg-white p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Tested</p>
                <p className="font-display text-[14px] font-bold text-ink">
                  {formatRelativeTime(result.testedAt)}
                </p>
              </div>
            </dl>

            {result.endpoint && (
              <div className="mt-3 text-[10px] leading-relaxed text-muted">
                <span className="font-semibold">Endpoint:</span>{' '}
                <span className="break-all text-ink/70">{result.endpoint}</span>
              </div>
            )}

            {result.error && (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-[#b4544e]/20 bg-[#fbeceb] px-3 py-2.5 text-[11px] leading-relaxed text-[#8f3f3a]"
              >
                {result.error}
              </p>
            )}

            {!result.available && !result.error && (
              <p className="mt-3 text-[10px] text-muted">
                No speed data was measured. This is not a simulated result — the test could not
                complete against the endpoint provided.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
