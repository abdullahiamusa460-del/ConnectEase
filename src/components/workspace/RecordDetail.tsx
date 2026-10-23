import {
  CalendarDays,
  CloudUpload,
  HardDriveDownload,
  Loader2,
  Pencil,
  Pin,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import type { PendingChange, WorkspaceRecord } from '../../types'
import { cn, formatDateTime, formatRelativeTime } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { categoryMeta, changeMeta } from './recordMeta'

interface RecordDetailProps {
  record: WorkspaceRecord
  pending?: PendingChange
  onClose: () => void
  onEdit: (record: WorkspaceRecord) => void
  onDelete: (record: WorkspaceRecord) => Promise<void>
}

export function RecordDetail({
  record,
  pending,
  onClose,
  onEdit,
  onDelete,
}: RecordDetailProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const meta = categoryMeta[record.category]
  const Icon = meta.icon
  const change = pending ? changeMeta[pending.action] : null

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(record)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This record could not be deleted.')
      setDeleting(false)
    }
  }

  return (
    <Modal
      title="Saved record"
      description="Stored locally in IndexedDB"
      icon={
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', meta.tile)}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      }
      onClose={onClose}
      size="lg"
      footer={
        confirming ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] leading-relaxed text-[#8f3f3a]">
              This removes the record from this device immediately.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Keep record
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#a8463f] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#8f3a34] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                Delete record
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-[#a8463f] transition-colors hover:bg-[#fbeceb]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn-primary" onClick={() => onEdit(record)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit record
              </button>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
            meta.badge,
          )}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
          {meta.label}
        </span>
        {record.pinned && (
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-1 text-[9px] font-semibold text-muted">
            <Pin className="h-3 w-3" aria-hidden="true" />
            Pinned
          </span>
        )}
        {record.isSample && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber/20 bg-amber-soft px-2.5 py-1 text-[9px] font-semibold text-amber">
            Sample record
          </span>
        )}
        {change ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
              change.badge,
            )}
          >
            <CloudUpload className="h-3 w-3" aria-hidden="true" />
            {change.label} · waiting to sync
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/10 bg-brand-soft px-2.5 py-1 text-[9px] font-semibold text-brand-dark">
            <HardDriveDownload className="h-3 w-3" aria-hidden="true" />
            Saved on this device
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-[23px] font-semibold leading-snug tracking-[-0.025em] text-ink">
        {record.title}
      </h3>

      <div className="mt-4 rounded-2xl border border-line/80 bg-canvas/45 px-4 py-4">
        {record.body ? (
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink/80">
            {record.body}
          </p>
        ) : (
          <p className="text-[12px] italic text-muted">No details were added to this record.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          Created {formatDateTime(record.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Updated {formatRelativeTime(record.updatedAt)}
        </span>
      </div>

      {pending && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber/20 bg-amber-soft/65 px-3.5 py-3 text-[10px] leading-relaxed text-[#7d5a19]">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            This change is queued on this device and will upload when the app is online and the
            sync server is reachable. Until then, it stays saved locally.
          </span>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-[#b4544e]/20 bg-[#fbeceb] px-3 py-2.5 text-[11px] text-[#8f3f3a]"
        >
          {error}
        </p>
      )}
    </Modal>
  )
}
