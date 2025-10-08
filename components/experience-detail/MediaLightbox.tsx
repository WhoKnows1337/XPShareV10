'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'audio'
  caption?: string
}

interface MediaLightboxProps {
  media: MediaItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function MediaLightbox({ media, initialIndex, isOpen, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }, [media.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }, [media.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          goToNext()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, goToNext, goToPrevious, onClose])

  const currentMedia = media[currentIndex]
  if (!currentMedia) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogTitle>Media Gallery - {currentMedia.caption || `Image ${currentIndex + 1} of ${media.length}`}</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[90vh] flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={goToPrevious}
            disabled={media.length <= 1}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Image Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-16"
            >
              {currentMedia.type === 'image' && (
                <Image
                  src={currentMedia.url}
                  alt={currentMedia.caption || `Media ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="95vw"
                  priority
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={goToNext}
            disabled={media.length <= 1}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Counter & Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {currentIndex + 1} / {media.length}
              </p>
              {currentMedia.caption && (
                <p className="text-sm text-white/80">{currentMedia.caption}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
