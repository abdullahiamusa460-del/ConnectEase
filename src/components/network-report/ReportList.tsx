import { Calendar, CloudOff, Filter, MapPin, Network, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn, formatDateTime } from '../../lib/utils'
import { providerLabels } from '../../data/navigation'
import type { NetworkProvider, NetworkReport } from '../../types'

interface ReportListProps {
  reports: NetworkReport[]
  onDelete: (id: string) => Promise<void>
}

export function ReportList({ reports, onDelete }: ReportListProps) {
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState<NetworkProvider | 'all'>('all')

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return reports.filter((report) => {
      const matchesProvider = provider === 'all' || report.provider === provider
      const matchesQuery =
        !normalizedQuery ||
        providerLabels[report.provider].toLowerCase().includes(normalizedQuery) ||
        (report.location ?? '').toLowerCase().includes(normalizedQuery) ||
        report.issue.toLowerCase().includes(normalizedQuery)
      return matchesProvider && matchesQuery
    })
  }, [query, provider, reports])

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="card overflow-hidden" aria-label="Network reports">
      <div className="flex flex-col gap-3 border-b border-line/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbeceb] text-[#b4544e]">
            <Network className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-[15px] font-semibold">Network reports</h2>
            <p className="mt-0.5 text-[11px] text-muted">Saved offline first; synced when online.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search reports</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search provider, location or issue…"
              className="field h-9 py-0 pl-9 text-[11px]"
            />
          </label>

          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as NetworkProvider | 'all')}
            className="field h-9 text-[11px] bg-white"
          >
            <option value="all">All providers</option>
            {[...new Set(['MTN', 'Airtel', 'Glo', '9mobile', 'Other'])].map((item) => (
              <option key={item} value={item}>
                {providerLabels[item as NetworkProvider]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
              <Filter className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-sm font-semibold">
              No reports match your filters
            </p>
            <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
              Adjust the search or provider filter. Reports are stored locally on this device.
            </p>
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => {
                setQuery('')
                setProvider('all')
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((report) => (
                <div key={report.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
                        report.provider === 'MTN'
                          ? 'border-[#0e7a5f]/10 bg-brand-soft text-brand-dark'
                          : report.provider === 'Airtel'
                            ? 'border-[#4169a8]/10 bg-[#eef2fb] text-[#4169a8]'
                            : report.provider === 'Glo'
                              ? 'border-[#7a9a35]/10 bg-lime-soft text-[#5a7a20]'
                              : report.provider === '9mobile'
                                ? 'border-amber/15 bg-amber-soft text-amber'
                                : 'border-muted/10 bg-canvas text-muted',
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                      {providerLabels[report.provider]}
                    </span>
                    <span className="text-[10px] text-muted">{formatDateTime(report.reportedAt)}</span>
                  </div>

                  {report.isDemo && (
                    <p className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber/20 bg-amber-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber">
                        Demo data — not a real report
                      </span>
                    </p>
                  )}

                  <div className="mb-3 rounded-xl border border-line/70 bg-canvas/40 p-3">
                    <p className="flex items-center gap-2 text-[10px] text-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {report.location ?? 'Location not provided'}
                    </p>
                  </div>

                  <p className="mb-4 line-clamp-3 text-[11px] leading-relaxed text-ink/85">
                    {report.issue}
                  </p>

                  <div className="flex items-center justify-between gap-2 border-t border-line/70 pt-3">
                    <span className="text-[10px] text-muted">
                      {report.isDemo
                        ? 'Demo · not synced'
                        : report.syncedAt
                          ? 'Synced'
                          : 'Saved offline'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onDelete(report.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-semibold text-[#a8463f] transition-colors hover:bg-[#fbeceb]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/80 pt-3 text-[9px] text-muted sm:px-5">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {filtered.length} of {reports.length} report{reports.length === 1 ? '' : 's'}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                Offline first
              </span>
            </div>
          </>
        )}
      </div>
    </section>

      {/* Map-ready layout: a placeholder area where a map can be integrated later. */}
      <section className="card p-5 sm:p-6" aria-labelledby="map-ready-heading">
        <div className="flex items-center gap-3 mb-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fb] text-[#4169a8]">
            <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 id="map-ready-heading" className="font-display text-[15px] font-semibold">
              Map-ready layout
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Report locations are stored so a map view can be added later.
            </p>
          </div>
        </div>
        <div className="aspect-video rounded-2xl border border-line/70 bg-canvas/40 flex flex-col items-center justify-center text-center">
          <CloudOff className="mb-2 h-8 w-8 text-muted/40" aria-hidden="true" />
          <p className="text-[10px] font-semibold text-muted">Map not included in this build</p>
          <p className="text-[10px] text-muted/70">
            Latitude and longitude can be attached to reports when a map component is added.
          </p>
        </div>
      </section>
    </div>
  )
}
