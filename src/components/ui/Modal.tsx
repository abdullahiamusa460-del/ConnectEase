import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  title: string
  description?: string
  icon?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({
  title,
  description,
  icon,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-brand-deep/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'animate-modal-in relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:max-h-[88vh] sm:rounded-3xl',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start gap-3 border-b border-line/80 p-5 sm:p-6">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-base font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>

        {footer && (
          <div className="border-t border-line/80 bg-canvas/55 p-4 sm:px-6">{footer}</div>
        )}
      </div>
    </div>
  )
}
