import { useCallback, useEffect, useState } from 'react'
import type { AppRoute } from '../types'

const routeHashes: Record<AppRoute, string> = {
  dashboard: '#/dashboard',
  workspace: '#/workspace',
  sync: '#/sync',
  settings: '#/settings',
}

function readRoute(): AppRoute {
  if (typeof window === 'undefined') return 'dashboard'
  const value = window.location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]
  if (value === 'workspace') return 'workspace'
  if (value === 'sync' || value === 'sync-centre') return 'sync'
  if (value === 'settings') return 'settings'
  return 'dashboard'
}

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(readRoute)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(readRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((next: AppRoute) => {
    const target = routeHashes[next]
    if (window.location.hash === target) {
      setRoute(next)
      window.scrollTo(0, 0)
      return
    }
    window.location.hash = target
  }, [])

  const navigateToSection = useCallback(
    (sectionId: string) => {
      const scrollToSection = () => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (readRoute() !== 'dashboard') {
        window.location.hash = routeHashes.dashboard
        setRoute('dashboard')
        window.setTimeout(scrollToSection, 120)
      } else {
        scrollToSection()
      }
    },
    [],
  )

  return { route, navigate, navigateToSection }
}
