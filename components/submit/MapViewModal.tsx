'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Map as MapIcon, List, X } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/submit/MapView'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
})

interface Experience {
  id: string
  title: string
  content?: string
  created_at: string
  location?: {
    name: string
    coordinates?: [number, number]
  }
  similarity: number
  user?: {
    username: string
  }
}

interface MapViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experiences: Experience[]
}

export function MapViewModal({ open, onOpenChange, experiences }: MapViewModalProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  const validExperiences = experiences.filter(
    (exp) => exp.location?.coordinates && exp.location.coordinates.length === 2
  )

  const recentCount = experiences.filter((exp) => {
    const daysSince = (Date.now() - new Date(exp.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 7
  }).length

  const monthCount = experiences.filter((exp) => {
    const daysSince = (Date.now() - new Date(exp.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > 7 && daysSince <= 30
  }).length

  const olderCount = experiences.length - recentCount - monthCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <MapIcon className="h-6 w-6 text-purple-500" />
                Geographic Distribution
              </DialogTitle>
              <DialogDescription className="mt-2">
                {validExperiences.length} similar experiences plotted on map
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              {recentCount} last week
            </Badge>
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              {monthCount} last month
            </Badge>
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              {olderCount} older
            </Badge>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              Timeline View
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'map' && (
            <div className="h-full p-6">
              <MapView experiences={validExperiences} />
            </div>
          )}

          {viewMode === 'list' && (
            <div className="h-full overflow-y-auto px-6 py-4 space-y-3">
              {experiences
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .map((exp) => {
                  const daysSince =
                    (Date.now() - new Date(exp.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  let colorClass = 'bg-slate-400'
                  if (daysSince <= 7) colorClass = 'bg-red-500'
                  else if (daysSince <= 30) colorClass = 'bg-yellow-500'

                  return (
                    <div
                      key={exp.id}
                      className="p-4 rounded-lg border border-border hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-3 w-3 rounded-full ${colorClass} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exp.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(exp.created_at).toLocaleDateString('de-DE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                                {exp.user && ` • ${exp.user.username}`}
                              </p>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0">
                              {Math.round(exp.similarity * 100)}% match
                            </Badge>
                          </div>
                          {exp.content && (
                            <p className="text-sm line-clamp-2 text-muted-foreground">
                              {exp.content}
                            </p>
                          )}
                          {exp.location?.name && (
                            <p className="text-xs text-muted-foreground mt-2">
                              📍 {exp.location.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
