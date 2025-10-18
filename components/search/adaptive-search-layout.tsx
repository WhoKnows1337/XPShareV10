'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdaptiveSearchLayoutProps {
  mode: 'empty' | 'results'
  searchHeader: ReactNode
  filtersSidebar?: ReactNode
  mainContent: ReactNode
  relatedSidebar?: ReactNode
  className?: string
}

/**
 * Adaptive Search Layout - 2025 Best Practice Pattern
 *
 * EMPTY STATE:
 * - Centered, welcoming layout
 * - Large search bar
 * - Popular searches, tips, guides
 *
 * RESULTS STATE:
 * - Compact header
 * - Persistent filters sidebar (left)
 * - Results area (center, max-w-5xl)
 * - Related content sidebar (right, compact)
 */
export function AdaptiveSearchLayout({
  mode,
  searchHeader,
  filtersSidebar,
  mainContent,
  relatedSidebar,
  className,
}: AdaptiveSearchLayoutProps) {

  if (mode === 'empty') {
    // EMPTY STATE: Centered, Welcoming
    return (
      <div className={cn('min-h-screen w-full', className)}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="mx-auto max-w-4xl">
            {searchHeader}
            {mainContent}
          </div>
        </div>
      </div>
    )
  }

  // RESULTS STATE: Compact with Sidebars
  return (
    <div className={cn('min-h-screen w-full', className)}>
      {/* Compact Search Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          {searchHeader}
        </div>
      </div>

      {/* Main Layout with Sidebars */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* LEFT SIDEBAR: Persistent Filters (Desktop) */}
          {filtersSidebar && (
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {filtersSidebar}
              </div>
            </aside>
          )}

          {/* MAIN CONTENT AREA: Results */}
          <main className="flex-1 min-w-0">
            <div className="mx-auto max-w-5xl">
              {mainContent}
            </div>
          </main>

          {/* RIGHT SIDEBAR: Related & Stats (Desktop) */}
          {relatedSidebar && (
            <aside className="hidden xl:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {relatedSidebar}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* MOBILE: Filter Bottom Sheet Trigger */}
      {filtersSidebar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:hidden z-50">
          {/* This will be handled by the filters sidebar component */}
        </div>
      )}
    </div>
  )
}
