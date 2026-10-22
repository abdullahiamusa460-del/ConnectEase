import { useEffect, useState } from 'react'
import type { ServiceWorkerStatus } from '../types'

export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>('registering')

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }

    if (!import.meta.env.PROD) {
      setStatus('dev')
      return
    }

    let active = true

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        if (active) setStatus('ready')
      })
      .catch((cause: unknown) => {
        console.warn('ConnectEase service worker registration failed.', cause)
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  return status
}
