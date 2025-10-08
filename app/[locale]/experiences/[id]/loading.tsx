import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-24 w-full rounded" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-12 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="aspect-square w-full rounded" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="lg:hidden space-y-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
