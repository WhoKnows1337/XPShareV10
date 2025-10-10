'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Submit3Page() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Redirect to compose page
    const parts = pathname.split('/').filter(Boolean)

    // If pathname is like /submit3, redirect to /submit3/compose (locale will be added by middleware)
    // If pathname is like /en/submit3, redirect to /en/submit3/compose
    const hasLocale = parts.length >= 2 && ['en', 'de', 'fr', 'es'].includes(parts[0])

    if (hasLocale) {
      router.push(`/${parts[0]}/submit3/compose`)
    } else {
      router.push('/submit3/compose')
    }
  }, [router, pathname])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Starting your experience submission...</p>
      </div>
    </div>
  )
}
