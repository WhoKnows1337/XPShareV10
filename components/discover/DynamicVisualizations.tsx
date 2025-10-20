'use client'

/**
 * Dynamic Import Wrappers for Visualization Components
 *
 * Workaround for Next.js 15 + AI SDK streamUI Client Manifest error.
 * Heavy client libraries (Mapbox, Recharts, D3) must be dynamically imported
 * with ssr: false to prevent RSC bundler issues.
 */

import dynamic from 'next/dynamic'
import {
  TimelineSkeleton,
  MapSkeleton,
  NetworkGraphSkeleton,
  HeatmapSkeleton,
} from './LoadingSkeleton'

// Dynamic import for TimelineChart (uses Recharts)
export const DynamicTimelineChart = dynamic(
  () => import('./TimelineChart').then((mod) => mod.TimelineChart),
  {
    ssr: false,
    loading: () => <TimelineSkeleton />,
  }
)

// Dynamic import for ExperienceMapCard (uses Mapbox GL)
export const DynamicExperienceMapCard = dynamic(
  () => import('./ExperienceMapCard').then((mod) => mod.ExperienceMapCard),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
)

// Dynamic import for NetworkGraph (uses react-force-graph-2d)
export const DynamicNetworkGraph = dynamic(
  () => import('./NetworkGraph').then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => <NetworkGraphSkeleton />,
  }
)

// Dynamic import for HeatmapChart (uses Tremor + D3)
export const DynamicHeatmapChart = dynamic(
  () => import('./HeatmapChart').then((mod) => mod.HeatmapChart),
  {
    ssr: false,
    loading: () => <HeatmapSkeleton />,
  }
)

// Note: Type exports removed - import directly from component files if needed
