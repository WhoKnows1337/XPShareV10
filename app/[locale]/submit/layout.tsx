'use client'

import { usePathname } from 'next/navigation'
import { ProgressIndicator } from '@/components/submit/ProgressIndicator'

const ROUTE_STEPS: Record<string, number> = {
  '/submit': 0,
  '/submit/compose': 1,
  '/submit/review': 2,
  '/submit/questions': 3,
  '/submit/witnesses': 4,
  '/submit/patterns': 5,
  '/submit/preview': 6,
  '/submit/privacy': 7,
  '/submit/final': 7,
  '/submit/success': 8,
}

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Extract locale-agnostic path
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || '/submit'
  const currentStep = ROUTE_STEPS[pathWithoutLocale] ?? 0

  // Don't show progress on success page
  const showProgress = !pathWithoutLocale.includes('/success')

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {showProgress && currentStep > 0 && (
          <div className="max-w-4xl mx-auto mb-8 mt-16">
            <ProgressIndicator currentStep={currentStep} totalSteps={7} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
