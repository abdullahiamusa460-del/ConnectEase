import { cn } from '../../lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: () => void
  label: string
  tone?: 'light' | 'dark'
  disabled?: boolean
}

export function Switch({ checked, onChange, label, tone = 'light', disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? tone === 'dark'
            ? 'border-emerald-200/30 bg-emerald-300'
            : 'border-brand bg-brand'
          : tone === 'dark'
            ? 'border-white/20 bg-white/10'
            : 'border-line bg-[#e9ede8]',
      )}
    >
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
          !checked && tone === 'dark' && 'bg-white/80',
        )}
      />
    </button>
  )
}
