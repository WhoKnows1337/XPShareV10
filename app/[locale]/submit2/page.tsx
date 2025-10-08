'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Submit2Page() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Redirect to compose page
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit2/compose`)
  }, [router, pathname])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
