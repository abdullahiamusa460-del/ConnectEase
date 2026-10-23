import { CloudOff, Info, ServerOff, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { NetworkTestResult } from '../types'
import { cn, formatRelativeTime } from '../lib/utils'
import { formatLatency, formatSpeed } from '../lib/networkTest'
import { getNetworkTests } from '../lib/db'
import { NetworkTestCard } from '../components/network-test/NetworkTestCard'

interface NetworkTestPageProps {
  isOnline: boolean
  isSimulatedOffline: boolean
  onSaveResult: (result: NetworkTestResult) => void
}

export function NetworkTestPage({
  isOnline,
  isSimulatedOffline,
  onSaveResult,
}: NetworkTestPageProps) {
  const isOffline = !isOnline || isSimulatedOffline
  const [tests, setTests] = useState<NetworkTestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    const next = await getNetworkTests()
    setTests(next)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSaveResult = (result: NetworkTestResult) => {
    setTests((previous) => [result, ...previous])
    onSaveResult(result)
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="network-test-page-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-2">
              Connectivity
              <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
              <span className="font-medium normal-case tracking-normal text-muted">
                Measurements are local estimates
              </span>
            </p>
            <h1
              id="network-test-page-heading"
              className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
            >
              Network test
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Run a latency, download and upload test against an endpoint you provide. Speeds are
              measured, never simulated. Tests cannot run without a reachable endpoint.
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
          </div>
        </div>
      </section>

      {isOffline && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#cdddec] bg-[#eef2fb] px-4 py-3 text-[11px] leading-relaxed text-[#4169a8]">
          <ServerOff className="mt-0.5 h-4 w-4 shrink-0 text-[#4169a8]" aria-hidden="true" />
          <p>
            <span className="font-semibold">You are offline.</span>{' '}
            Network tests cannot reach an endpoint while disconnected. Saved records and reports
            remain available.
          </p>
        </div>
      )}

      <NetworkTestCard onSaveResult={handleSaveResult} />

      <section className="card overflow-hidden" aria-label="Test history">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5 border-b border-line/80">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <CloudOff className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-[15px] font-semibold">Recent tests</h2>
              <p className="mt-0.5 text-[11px] text-muted">Saved locally; synced when online.</p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
              tests.length > 0
                ? 'border-brand/10 bg-brand-soft text-brand-dark'
                : 'border-line bg-canvas text-muted',
            )}
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full', tests.length > 0 ? 'bg-brand' : 'bg-muted/50')}
              aria-hidden="true"
            />
            {tests.length > 0 ? `${tests.length} saved` : 'No tests yet'}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading test history</span>
              {[0, 1, 2].map((item) => (
                <div key={item} className="card h-[120px] animate-pulse p-4">
                  <div className="flex justify-between">
                    <div className="h-9 w-9 rounded-xl bg-[#e8ede8]" />
                    <div className="h-5 w-20 rounded-full bg-[#e8ede8]" />
                  </div>
                  <div className="mt-4 h-2 w-24 rounded bg-[#edf1ec]" />
                  <div className="mt-3 h-2 w-full rounded bg-[#edf1ec]" />
                </div>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
                <Info className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-sm font-semibold">No test history yet</p>
              <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
                Run a network test above. Results are saved locally and appear here; they sync
                when you are online.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tests.map((test) => (
                <div key={test.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
                        test.available
                          ? 'border-brand/10 bg-brand-soft text-brand-dark'
                          : 'border-amber/15 bg-amber-soft text-amber',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          test.available ? 'bg-brand' : 'bg-amber',
                        )}
                        aria-hidden="true"
                      />
                      {test.available ? 'Completed' : 'Unavailable'}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatRelativeTime(test.testedAt)}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Latency
                      </p>
                      <p className="font-display text-[15px] font-bold text-ink whitespace-nowrap sm:text-[16px]">
                        {formatLatency(test.latencyMs)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Download
                      </p>
                      <p className="font-display text-[15px] font-bold text-ink whitespace-nowrap sm:text-[16px]">
                        {formatSpeed(test.downloadMbps)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Upload
                      </p>
                      <p className="font-display text-[15px] font-bold text-ink whitespace-nowrap sm:text-[16px]">
                        {formatSpeed(test.uploadMbps)}
                      </p>
                    </div>
                  </dl>
                  {test.endpoint && (
                    <p className="mt-3 break-all text-[10px] text-muted">
                      <span className="font-semibold">Endpoint:</span>{' '}
                      {test.endpoint}
                    </p>
                  )}
                  {test.error && (
                    <p className="mt-2 text-[10px] leading-relaxed text-[#8f3f3a]">
                      {test.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
