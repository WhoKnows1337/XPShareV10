'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic import with ssr: false - this is allowed in Client Components
// BentoTabs contains react-leaflet which requires browser APIs
const BentoTabs = dynamic(
  () => import('./BentoTabs').then((mod) => ({ default: mod.BentoTabs })),
  {
    loading: () => <Skeleton className="h-40 w-full" />,
    ssr: false, // Required for react-leaflet (GeographicHeatmap)
  }
)

interface MatchReason {
  type: 'category' | 'location' | 'temporal' | 'similarity' | 'semantic' | 'attribute'
  label: string
  value: string
  weight: number
}

interface SimilarExperience {
  id: string
  title: string
  category: string
  created_at: string
  user_profiles?: {
    username: string
    display_name?: string
  }
  match_score?: number
  match_reasons?: MatchReason[]
}

interface BentoTabsWrapperProps {
  similarExperiences: SimilarExperience[]
  patternData?: {
    geographic?: { count: number; total: number; location: string }
    temporal?: { count: number; total: number; period: string }
    category?: { count: number; total: number; name: string }
  }
  commentsPreview?: Array<{
    id: string
    user: string
    text: string
    created_at: string
  }>
  experienceId: string
}

export function BentoTabsWrapper(props: BentoTabsWrapperProps) {
  return <BentoTabs {...props} />
}
