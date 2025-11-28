'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic import with ssr: false - this is allowed in Client Components
const MapboxMiniMap = dynamic(
  () => import('./MapboxMiniMap').then((mod) => mod.MapboxMiniMap),
  {
    loading: () => <Skeleton className="aspect-square w-full" />,
    ssr: false, // mapbox-gl requires browser APIs
  }
)

interface MapboxMiniMapWrapperProps {
  lat: number
  lng: number
  locationText?: string
  nearbyCount?: number
}

export function MapboxMiniMapWrapper(props: MapboxMiniMapWrapperProps) {
  return <MapboxMiniMap {...props} />
}
