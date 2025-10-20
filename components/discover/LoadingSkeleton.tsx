import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading Skeletons for Discovery UI Components
 * Used during progressive rendering in streamUI
 */

export function MapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function NetworkGraphSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full rounded-lg" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function HeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
        <div className="mt-4">
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ExperienceGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function InsightCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-300">
      <CardHeader>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </CardHeader>
    </Card>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full max-w-md" />
      <ExperienceGridSkeleton count={6} />
    </div>
  )
}
