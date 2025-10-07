'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ThreeColumnLayoutProps {
  leftSidebar?: ReactNode
  mainContent: ReactNode
  rightPanel?: ReactNode
  className?: string
}

export function ThreeColumnLayout({
  leftSidebar,
  mainContent,
  rightPanel,
  className,
}: ThreeColumnLayoutProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1800px]', className)}>
      <div className="flex gap-6 px-4 py-8">
        {/* Left Sidebar - 240px, sticky, hidden on mobile */}
        {leftSidebar && (
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-20 space-y-6">{leftSidebar}</div>
          </aside>
        )}

        {/* Main Content - Flexible, max 900px */}
        <main className="flex-1 min-w-0 max-w-[900px] mx-auto">{mainContent}</main>

        {/* Right Panel - 340px, sticky, hidden on md */}
        {rightPanel && (
          <aside className="hidden xl:block w-[340px] flex-shrink-0">
            <div className="sticky top-20 space-y-6">{rightPanel}</div>
          </aside>
        )}
      </div>
    </div>
  )
}
