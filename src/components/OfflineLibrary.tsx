import {
  ArrowDownToLine,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  HardDrive,
  HardDriveDownload,
  Headphones,
  Map,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import type { OfflineItem, OfflineKind } from '../types'
import { cn, formatMB } from '../lib/utils'

interface OfflineLibraryProps {
  items: OfflineItem[]
  onOpenItem: (item: OfflineItem) => void
}

const kindMeta: Record<OfflineKind, { icon: LucideIcon; tile: string }> = {
  Article: { icon: Newspaper, tile: 'bg-brand-soft text-brand' },
  Map: { icon: Map, tile: 'bg-lime-soft text-[#5a7a20]' },
  Guide: { icon: BookOpen, tile: 'bg-amber-soft text-amber' },
  Audio: { icon: Headphones, tile: 'bg-[#eef2fb] text-[#4169a8]' },
  PDF: { icon: FileText, tile: 'bg-[#fbeef0] text-[#b45a6a]' },
}

const filters: Array<{ id: 'All' | OfflineKind; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Article', label: 'Articles' },
  { id: 'Map', label: 'Maps' },
  { id: 'Guide', label: 'Guides' },
  { id: 'Audio', label: 'Audio' },
  { id: 'PDF', label: 'PDFs' },
]

export function OfflineLibrary({ items, onOpenItem }: OfflineLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | OfflineKind>('All')
  const totalSize = items.reduce((sum, item) => sum + item.sizeMB, 0)
  const filteredItems =
    activeFilter === 'All' ? items : items.filter((item) => item.kind === activeFilter)

  return (
    <article id="offline" className="card flex h-full min-w-0 scroll-mt-24 flex-col" aria-labelledby="offline-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-[#5a7a20]">
            <HardDriveDownload className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="offline-heading"
              className="font-display text-[15px] font-semibold tracking-[-0.01em]"
            >
              Offline library
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">Saved and ready for low-data moments.</p>
          </div>
        </div>
        <span className="chip">
          <ArrowDownToLine className="h-3 w-3 text-brand" aria-hidden="true" />
          {items.length} items · {formatMB(totalSize)}
        </span>
      </div>

      <div className="px-4 pb-3 sm:px-5">
        <div
          className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-canvas/80 p-1"
          role="tablist"
          aria-label="Filter offline content"
        >
          {filters.map((filter) => {
            const count =
              filter.id === 'All'
                ? items.length
                : items.filter((item) => item.kind === filter.id).length
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-muted hover:text-ink',
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'ml-1 text-[9px]',
                    isActive ? 'text-brand' : 'text-muted/60',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <ul className="flex-1 px-3 sm:px-4">
          {filteredItems.map((item) => {
            const meta = kindMeta[item.kind]
            const Icon = meta.icon
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(item)}
                  className="group flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-canvas sm:px-2.5"
                  aria-label={`Preview ${item.title} — demo action`}
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      meta.tile,
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink sm:text-[13px]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted">
                      {item.kind} · {formatMB(item.sizeMB)} · Saved {item.savedAt}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[9px] font-semibold text-brand-dark sm:inline-flex">
                    <Check className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={3} />
                    Ready
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-muted">
            <HardDriveDownload className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-display text-sm font-semibold">Nothing saved here yet</p>
          <p className="mt-1 max-w-[230px] text-[11px] leading-relaxed text-muted">
            Saved articles, maps and guides will appear in this space.
          </p>
        </div>
      )}

      <div className="mt-auto border-t border-line/80 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted">
          <span className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
            On-device storage
          </span>
          <span>
            <span className="font-semibold text-ink">{formatMB(totalSize)}</span> of 500 MB
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0e7a5f]/70 to-[#69c7a7]"
            style={{ width: `${Math.min((totalSize / 500) * 100, 100)}%` }}
            role="progressbar"
            aria-label="On-device storage used"
            aria-valuenow={Math.round((totalSize / 500) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </article>
  )
}
