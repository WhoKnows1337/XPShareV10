'use client'

/**
 * Profile Layout Grid Component
 *
 * 2-column responsive grid layout for profile page
 * Left: Main content (Stats, Charts, Maps)
 * Right: Sidebar (XP Twins, Connections, Contributions)
 *
 * Mobile: Stacks vertically
 */

import React from 'react'

interface ProfileLayoutGridProps {
  /**
   * Main content column (left)
   */
  mainContent: React.ReactNode

  /**
   * Sidebar content column (right)
   */
  sidebarContent: React.ReactNode

  /**
   * Additional className
   */
  className?: string
}

export function ProfileLayoutGrid({
  mainContent,
  sidebarContent,
  className = ''
}: ProfileLayoutGridProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Main Content - Left Column (2/3 width on large screens) */}
      <div className="lg:col-span-2 space-y-6">
        {mainContent}
      </div>

      {/* Sidebar - Right Column (1/3 width on large screens) */}
      <div className="lg:col-span-1 space-y-6">
        {sidebarContent}
      </div>
    </div>
  )
}
