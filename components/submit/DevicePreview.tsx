'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Tag, Users, Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewData {
  title?: string
  content: string
  category: string
  tags: string[]
  location?: string
  date?: string
  witnesses?: Array<{ name: string }>
  mediaFiles?: Array<{ url: string; type: string }>
}

interface DevicePreviewProps {
  data: PreviewData
  deviceType: 'desktop' | 'mobile'
  className?: string
}

export function DevicePreview({ data, deviceType, className }: DevicePreviewProps) {
  const isMobile = deviceType === 'mobile'

  return (
    <div
      className={cn(
        'relative',
        isMobile ? 'max-w-[375px] mx-auto' : 'max-w-4xl mx-auto',
        className
      )}
    >
      {/* Device Frame */}
      <div
        className={cn(
          'relative bg-background border rounded-lg overflow-hidden',
          isMobile && 'border-8 border-gray-800 rounded-[2.5rem] shadow-2xl'
        )}
      >
        {/* Mobile Notch */}
        {isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10" />
        )}

        {/* Content Area */}
        <div
          className={cn(
            'bg-background overflow-y-auto',
            isMobile ? 'h-[667px]' : 'min-h-[600px]'
          )}
        >
          {/* Navbar (Preview) */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                {!isMobile && <span className="font-semibold">XP-Share</span>}
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <>
                    <Button variant="ghost" size="sm">
                      Feed
                    </Button>
                    <Button variant="ghost" size="sm">
                      Search
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Experience Card */}
          <div className={cn('p-4', isMobile ? 'space-y-3' : 'space-y-4')}>
            <Card className={cn('overflow-hidden', isMobile ? 'text-sm' : '')}>
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Du</p>
                    <p className="text-xs text-muted-foreground">Gerade eben</p>
                  </div>
                  <Badge variant="secondary" className={cn(isMobile && 'text-xs')}>
                    {data.category}
                  </Badge>
                </div>
              </div>

              {/* Media Preview */}
              {data.mediaFiles && data.mediaFiles.length > 0 && (
                <div className="relative aspect-video bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    📷 {data.mediaFiles.length} Foto(s)
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={cn('p-4 space-y-3', isMobile && 'text-sm')}>
                {data.title && (
                  <h3 className={cn('font-bold', isMobile ? 'text-base' : 'text-lg')}>
                    {data.title}
                  </h3>
                )}

                <p className="whitespace-pre-wrap leading-relaxed">
                  {data.content.length > 200 && isMobile
                    ? `${data.content.substring(0, 200)}... mehr lesen`
                    : data.content}
                </p>

                {/* Tags */}
                {data.tags && data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {data.tags.slice(0, isMobile ? 3 : 6).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(isMobile ? 'text-xs' : 'text-sm')}
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {data.tags.length > (isMobile ? 3 : 6) && (
                      <Badge variant="outline" className={cn(isMobile ? 'text-xs' : 'text-sm')}>
                        +{data.tags.length - (isMobile ? 3 : 6)}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className={cn('flex flex-wrap gap-3 text-muted-foreground', isMobile && 'text-xs')}>
                  {data.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className={cn(isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
                      <span>{data.location}</span>
                    </div>
                  )}
                  {data.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className={cn(isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
                      <span>{new Date(data.date).toLocaleDateString('de-DE')}</span>
                    </div>
                  )}
                  {data.witnesses && data.witnesses.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className={cn(isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
                      <span>{data.witnesses.length} Zeuge(n)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center gap-3 border-t pt-3">
                <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="flex-1">
                  <Heart className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5', 'mr-1')} />
                  {!isMobile && 'Like'}
                </Button>
                <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="flex-1">
                  <MessageCircle className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5', 'mr-1')} />
                  {!isMobile && 'Comment'}
                </Button>
                <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="flex-1">
                  <Share2 className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5', 'mr-1')} />
                  {!isMobile && 'Share'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          {isMobile ? 'Mobile Ansicht (375px)' : 'Desktop Ansicht'}
        </p>
      </div>
    </div>
  )
}
