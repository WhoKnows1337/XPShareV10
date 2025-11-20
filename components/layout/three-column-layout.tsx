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
      {/* Desktop: CSS Grid Layout (20% Context | 50% Main Story | 30% Discovery) */}
      {/* Mobile: Stack Layout (Main Content Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-[20%_50%_30%] gap-6 px-4 py-8">
        {/* Left Sidebar - Context Rail (20%) - Hidden on mobile */}
        {leftSidebar && (
          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-24 space-y-6">{leftSidebar}</div>
          </aside>
        )}

        {/* Main Content - Main Story (50%) - Always visible */}
        <main className="min-w-0">{mainContent}</main>

        {/* Right Panel - Discovery Rail (30%) - Hidden on mobile */}
        {rightPanel && (
          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-24 space-y-6">{rightPanel}</div>
          </aside>
        )}
      </div>
    </div>
  )
}
