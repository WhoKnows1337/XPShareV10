'use client'

import { ActivityHeatmap } from '@/components/profile/activity-heatmap'

export function StatsTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <ActivityHeatmap userId={userId} />

      {/* TODO: Add more stat visualizations */}
      {/* - Category breakdown chart */}
      {/* - Experience timeline */}
      {/* - Collaboration network graph */}
    </div>
  )
}
