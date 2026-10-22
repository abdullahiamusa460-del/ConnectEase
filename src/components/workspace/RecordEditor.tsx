import { HardDriveDownload, Info, Loader2, Pin } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import type { RecordCategory, RecordInput, WorkspaceRecord } from '../../types'
import { cn } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Switch } from '../ui/Switch'
import { categoryMeta } from './recordMeta'

interface RecordEditorProps {
  record?: WorkspaceRecord
  onClose: () => void
  onSave: (input: RecordInput) => Promise<unknown>
}

const categories: RecordCategory[] = ['note', 'contact', 'resource']

export function RecordEditor({ record, onClose, onSave }: RecordEditorProps) {
  const formId = useId()
  const [title, setTitle] = useState(record?.title ?? '')
  const [body, setBody] = useState(record?.body ?? '')
  const [category, setCategory] = useState<RecordCategory>(record?.category ?? 'note')
  const [pinned, setPinned] = useState(record?.pinned ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Add a title before saving this record.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave({
        title,
        body,
        category,
        pinned,
        isSample: record?.isSample,
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This record could not be saved.')
      setSaving(false)
    }
  }

  return (
    <Modal
      title={record ? 'Edit record' : 'New record'}
      description="Saved in IndexedDB on this device. No account or server is involved."
      icon={
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <HardDriveDownload className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      }
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <HardDriveDownload className="h-4 w-4" aria-hidden="true" />
                Save offline
              </>
            )}
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <span className="label">Record type</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {categories.map((item) => {
              const meta = categoryMeta[item]
              const Icon = meta.icon
              const isActive = category === item
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(item)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition-colors',
                    isActive
                      ? 'border-brand/25 bg-brand-soft text-brand-dark'
                      : 'border-line bg-white text-muted hover:border-brand/20 hover:text-ink',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-title`} className="label">
            Title
          </label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            autoFocus
            placeholder="e.g. Ikeja customer visit notes"
            className="field mt-2"
          />
          <p className="mt-1.5 text-right text-[9px] text-muted">{title.length}/80</p>
        </div>

        <div>
          <label htmlFor={`${formId}-body`} className="label">
            Details
          </label>
          <textarea
            id={`${formId}-body`}
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2000}
            rows={7}
            placeholder="Write the information you need available offline…"
            className="field mt-2 min-h-36 resize-y leading-relaxed"
          />
          <p className="mt-1.5 flex items-center justify-between gap-3 text-[9px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Info className="h-3 w-3" aria-hidden="true" />
              Plain text is stored only in this browser.
            </span>
            <span>{body.length}/2000</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-canvas/60 px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-muted ring-1 ring-line">
              <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-ink">Pin to the top</p>
              <p className="text-[9px] text-muted">Keep important records easy to find.</p>
            </div>
          </div>
          <Switch checked={pinned} onChange={() => setPinned((value) => !value)} label="Pin record" />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#b4544e]/20 bg-[#fbeceb] px-3 py-2.5 text-[11px] leading-relaxed text-[#8f3f3a]"
          >
            {error}
          </p>
        )}

        <p className="flex items-start gap-1.5 rounded-xl bg-brand-soft/55 px-3 py-2.5 text-[10px] leading-relaxed text-brand-dark">
          <HardDriveDownload className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Saving adds this change to the local sync queue. The sync server is not connected yet,
          so nothing will be uploaded.
        </p>
      </form>
    </Modal>
  )
}
