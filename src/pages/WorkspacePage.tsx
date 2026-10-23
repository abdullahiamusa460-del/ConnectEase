import {
  ArrowRight,
  ArrowUpRight,
  CloudUpload,
  FilePlus2,
  HardDriveDownload,
  Loader2,
  NotebookPen,
  Pin,
  Plus,
  Search,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn, formatRelativeTime } from '../lib/utils'
import type {
  PendingChange,
  RecordCategory,
  RecordInput,
  ToastTone,
  WorkspaceRecord,
} from '../types'
import { RecordDetail } from '../components/workspace/RecordDetail'
import { RecordEditor } from '../components/workspace/RecordEditor'
import { categoryMeta } from '../components/workspace/recordMeta'

interface WorkspacePageProps {
  records: WorkspaceRecord[]
  changes: PendingChange[]
  isLoading: boolean
  error: string | null
  onReload: () => Promise<void>
  onCreate: (input: RecordInput) => Promise<WorkspaceRecord>
  onUpdate: (id: string, input: RecordInput) => Promise<WorkspaceRecord>
  onDelete: (record: WorkspaceRecord) => Promise<void>
  onAddSamples: () => Promise<WorkspaceRecord[]>
  onNotify: (message: string, tone?: ToastTone) => void
  onOpenSync: () => void
}

type Filter = 'all' | RecordCategory

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All records' },
  { id: 'note', label: 'Notes' },
  { id: 'contact', label: 'Contacts' },
  { id: 'resource', label: 'Resources' },
]

function WorkspaceSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading records from this device</span>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="card h-[194px] animate-pulse p-4">
          <div className="flex justify-between">
            <div className="h-9 w-9 rounded-xl bg-[#e8ede8]" />
            <div className="h-5 w-16 rounded-full bg-[#e8ede8]" />
          </div>
          <div className="mt-4 h-2.5 w-20 rounded bg-[#e8ede8]" />
          <div className="mt-3 h-3.5 w-4/5 rounded bg-[#e8ede8]" />
          <div className="mt-2 h-2.5 w-full rounded bg-[#edf1ec]" />
          <div className="mt-2 h-2.5 w-2/3 rounded bg-[#edf1ec]" />
          <div className="mt-5 h-2 w-24 rounded bg-[#e8ede8]" />
        </div>
      ))}
    </div>
  )
}

export function WorkspacePage({
  records,
  changes,
  isLoading,
  error,
  onReload,
  onCreate,
  onUpdate,
  onDelete,
  onAddSamples,
  onNotify,
  onOpenSync,
}: WorkspacePageProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editor, setEditor] = useState<{ record?: WorkspaceRecord } | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [addingSamples, setAddingSamples] = useState(false)

  const pendingByRecord = useMemo(
    () => new Map(changes.map((change) => [change.recordId, change])),
    [changes],
  )

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return records.filter((record) => {
      const matchesFilter = filter === 'all' || record.category === filter
      const matchesQuery =
        !normalizedQuery ||
        record.title.toLowerCase().includes(normalizedQuery) ||
        record.body.toLowerCase().includes(normalizedQuery)
      return matchesFilter && matchesQuery
    })
  }, [filter, query, records])

  const viewingRecord = records.find((record) => record.id === viewingId)
  const pinnedCount = records.filter((record) => record.pinned).length

  const handleSave = async (input: RecordInput) => {
    if (editor?.record) {
      await onUpdate(editor.record.id, input)
      setEditor(null)
      onNotify('Record updated on this device. The change is waiting in the sync queue.', 'success')
    } else {
      await onCreate(input)
      setEditor(null)
      onNotify('Record saved on this device. The change is waiting in the sync queue.', 'success')
    }
  }

  const handleDelete = async (record: WorkspaceRecord) => {
    await onDelete(record)
    setViewingId(null)
    onNotify('Record deleted from this device. The local queue has been updated.', 'warning')
  }

  const handleAddSamples = async () => {
    setAddingSamples(true)
    try {
      const added = await onAddSamples()
      onNotify(
        `${added.length} sample records added. They are marked as samples and stored only on this device.`,
        'info',
      )
    } finally {
      setAddingSamples(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="workspace-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-2">
              Workspace
              <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
              <span className="font-medium normal-case tracking-normal text-muted">
                IndexedDB · offline first
              </span>
            </p>
            <h1
              id="workspace-heading"
              className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
            >
              Offline workspace
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Create notes, contacts and resources that stay available without a connection.
              Everything is stored in this browser and syncs when you are online.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip h-8">
              <HardDriveDownload className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              Saved locally
            </span>
            <button type="button" className="btn-primary" onClick={() => setEditor({})}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New record
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-label="Workspace summary">
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <NotebookPen className="h-3 w-3" aria-hidden="true" />
            Records
          </p>
          <p className="mt-1.5 font-display text-[22px] font-bold leading-none text-ink sm:text-[26px]">
            {records.length}
          </p>
          <p className="mt-1.5 text-[9px] text-muted">Available offline</p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <CloudUpload className="h-3 w-3" aria-hidden="true" />
            Queue
          </p>
          <p className="mt-1.5 font-display text-[22px] font-bold leading-none text-ink sm:text-[26px]">
            {changes.length}
          </p>
          <p className="mt-1.5 text-[9px] text-amber">
            {changes.length > 0 ? 'Waiting to sync' : 'Nothing waiting'}
          </p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            <Pin className="h-3 w-3" aria-hidden="true" />
            Pinned
          </p>
          <p className="mt-1.5 font-display text-[22px] font-bold leading-none text-ink sm:text-[26px]">
            {pinnedCount}
          </p>
          <p className="mt-1.5 text-[9px] text-muted">Kept at the top</p>
        </div>
      </section>

      {changes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber/20 bg-amber-soft/65 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex items-start gap-2.5">
            <CloudUpload className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed text-[#7d5a19]">
              <span className="font-semibold">
                {changes.length} local {changes.length === 1 ? 'change is' : 'changes are'} waiting
                to sync.
              </span>{' '}
              They are saved on this device. The sync server is not connected yet, so nothing has
              been uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSync}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber/20 bg-white/60 px-2.5 text-[10px] font-semibold text-[#7d5a19] transition-colors hover:bg-white"
          >
            View sync centre
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="card overflow-hidden" aria-label="Saved records">
        <div className="flex flex-col gap-3 border-b border-line/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-canvas/80 p-1">
            {filters.map((item) => {
              const isActive = filter === item.id
              const count =
                item.id === 'all'
                  ? records.length
                  : records.filter((record) => record.category === item.id).length
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                    isActive ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {item.label}
                  <span
                    className={cn('ml-1 text-[9px]', isActive ? 'text-brand' : 'text-muted/60')}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search saved records</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records…"
              className="field h-9 py-0 pl-9 text-[11px]"
            />
          </label>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <WorkspaceSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fbeceb] text-[#b4544e]">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-sm font-semibold">Local storage is unavailable</p>
              <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">{error}</p>
              <button type="button" className="btn-secondary mt-4" onClick={() => void onReload()}>
                Try again
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
                <NotebookPen className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-[17px] font-semibold tracking-[-0.02em]">
                Your offline workspace is empty
              </p>
              <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-muted">
                Create a note, contact or resource and it will be saved in IndexedDB. It stays
                available after a refresh and without a network connection.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button type="button" className="btn-primary" onClick={() => setEditor({})}>
                  <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                  Create your first record
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void handleAddSamples()}
                  disabled={addingSamples}
                >
                  {addingSamples ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  Load sample records
                </button>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-display text-sm font-semibold">No records match</p>
              <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
                Try a different search or filter. Your saved records are still on this device.
              </p>
              <button
                type="button"
                className="btn-secondary mt-4"
                onClick={() => {
                  setQuery('')
                  setFilter('all')
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] text-muted">
                  Showing <span className="font-semibold text-ink">{filteredRecords.length}</span>{' '}
                  of {records.length} {records.length === 1 ? 'record' : 'records'}
                </p>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                  Readable offline
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRecords.map((record) => {
                  const meta = categoryMeta[record.category]
                  const Icon = meta.icon
                  const pending = pendingByRecord.get(record.id)
                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setViewingId(record.id)}
                      aria-label={`Open ${record.title}`}
                      className="card card-hover group flex h-full flex-col p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            'grid h-9 w-9 place-items-center rounded-xl',
                            meta.tile,
                          )}
                        >
                          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                        </span>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {record.pinned && (
                            <span
                              className="grid h-5 w-5 place-items-center rounded-full bg-canvas text-muted"
                              title="Pinned"
                            >
                              <Pin className="h-3 w-3" aria-hidden="true" />
                            </span>
                          )}
                          {record.isSample && (
                            <span className="rounded-full border border-amber/20 bg-amber-soft px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber">
                              Sample
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {meta.label}
                        </span>
                        {pending ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
                            Waiting to sync
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-brand">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                            Saved locally
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 line-clamp-2 font-display text-[14px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                        {record.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted">
                        {record.body || 'No details were added to this record.'}
                      </p>

                      <span className="mt-auto flex items-center justify-between gap-2 border-t border-line/70 pt-3 text-[9px] text-muted">
                        <span>Updated {formatRelativeTime(record.updatedAt)}</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 text-muted/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {!isLoading && !error && records.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/80 px-4 py-3 text-[9px] text-muted sm:px-5">
            <span className="inline-flex items-center gap-1.5">
              <HardDriveDownload className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              Stored in IndexedDB on this device
            </span>
            <button
              type="button"
              onClick={() => void handleAddSamples()}
              disabled={addingSamples}
              className="font-semibold text-brand transition-colors hover:text-brand-dark disabled:opacity-50"
            >
              Add sample records
            </button>
          </div>
        )}
      </section>

      {editor && (
        <RecordEditor
          record={editor.record}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      )}

      {viewingRecord && (
        <RecordDetail
          record={viewingRecord}
          pending={pendingByRecord.get(viewingRecord.id)}
          onClose={() => setViewingId(null)}
          onEdit={(record) => {
            setViewingId(null)
            setEditor({ record })
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
