import { appNavItems } from '../data/navigation'
import { cn } from '../lib/utils'
import type { AppRoute } from '../types'

interface MobileNavProps {
  route: AppRoute
  pendingChangesCount: number
}

export function MobileNav({ route, pendingChangesCount }: MobileNavProps) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pt-1.5 backdrop-blur-xl lg:hidden"
      aria-label="Application"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {appNavItems.map((item) => {
          const Icon = item.icon
          const isActive = route === item.id
          const showBadge = item.id === 'sync' && pendingChangesCount > 0
          return (
            <a
              key={item.id}
              href={`#/${item.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-ink',
              )}
            >
              <span className="relative">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {showBadge && (
                  <span
                    className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full border border-white bg-amber"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span>{item.shortLabel}</span>
              {showBadge && <span className="sr-only">{pendingChangesCount} pending</span>}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
