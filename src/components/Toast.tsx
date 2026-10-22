import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ToastMessage } from '../types'
import { cn } from '../lib/utils'

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

const toneStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-brand',
    wrapper: 'border-brand/20 bg-white',
  },
  info: {
    icon: Info,
    iconClass: 'text-[#3f6d9a]',
    wrapper: 'border-[#cdddec] bg-white',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-amber',
    wrapper: 'border-amber/25 bg-white',
  },
} as const

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDismiss, 4200)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const { icon: Icon, iconClass, wrapper } = toneStyles[toast.tone]

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center lg:inset-x-auto lg:bottom-6 lg:right-6 lg:justify-end">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className={cn(
          'animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3.5 shadow-float',
          wrapper,
        )}
      >
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-canvas">
          <Icon className={cn('h-4 w-4', iconClass)} aria-hidden="true" />
        </span>
        <p className="flex-1 pt-0.5 text-xs leading-relaxed text-ink">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
