'use client'

/**
 * Service Worker Provider
 *
 * Registers service worker for offline support.
 */

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/pwa/install'

export function ServiceWorkerProvider() {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker()
  }, [])

  return null
}
