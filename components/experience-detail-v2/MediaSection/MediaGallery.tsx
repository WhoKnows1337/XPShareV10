'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, FileAudio, FileText, Link2, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mediaGalleryVariants, mediaThumbnailVariants, lightboxVariants } from '../shared/animations'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'image' | 'video' | 'audio' | 'sketch' | 'document'
  caption?: string
  duration?: number
  fileName?: string
}

interface MediaGalleryProps {
  items: MediaItem[]
  className?: string
}

export function MediaGallery({ items, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!items || items.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-8 w-8" />
      case 'audio':
        return <FileAudio className="h-8 w-8" />
      case 'document':
        return <FileText className="h-8 w-8" />
      default:
        return null
    }
  }

  return (
    <>
      <motion.div
        variants={mediaGalleryVariants}
        initial="hidden"
        animate="visible"
        className={cn('relative group', className)}
      >
        {/* Scroll Buttons */}
        {items.length > 3 && (
          <>
            <button
              onClick={() => scroll('left')}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                'h-10 w-10 rounded-full',
                'bg-space-deep/80 backdrop-blur-sm',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-space-mid'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                'h-10 w-10 rounded-full',
                'bg-space-deep/80 backdrop-blur-sm',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-space-mid'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Gallery Container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-3 overflow-x-auto pb-2',
            'snap-x snap-mandatory',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            '-mx-4 px-4' // Negative margin for edge-to-edge on mobile
          )}
        >
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              variants={mediaThumbnailVariants}
              whileHover="hover"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative flex-shrink-0 snap-start',
                'w-32 h-32 rounded-xl overflow-hidden',
                'bg-space-light',
                'ring-2 ring-transparent hover:ring-primary/50 transition-all'
              )}
            >
              {item.type === 'photo' || item.type === 'image' || item.type === 'sketch' ? (
                <Image
                  src={item.url}
                  alt={item.caption || 'Media'}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-space-mid to-space-deep">
                  {getMediaIcon(item.type)}
                </div>
              )}

              {/* Type Badge */}
              {item.type !== 'photo' && item.type !== 'image' && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs">
                  {item.type === 'sketch' ? '🎨' : item.type}
                </div>
              )}

              {/* Duration Badge */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 text-xs">
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </div>
              )}

              {/* Expand Icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors opacity-0 hover:opacity-100">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Item Count */}
        {items.length > 1 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {items.length} Medien
          </p>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <MediaLightbox
            items={items}
            currentIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onNext={() => setSelectedIndex((selectedIndex + 1) % items.length)}
            onPrev={() => setSelectedIndex((selectedIndex - 1 + items.length) % items.length)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface MediaLightboxProps {
  items: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

function MediaLightbox({ items, currentIndex, onClose, onNext, onPrev }: MediaLightboxProps) {
  const currentItem = items[currentIndex]

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight') onNext()
    if (e.key === 'ArrowLeft') onPrev()
  }

  return (
    <motion.div
      variants={lightboxVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Content */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {currentItem.type === 'photo' || currentItem.type === 'image' || currentItem.type === 'sketch' ? (
          <Image
            src={currentItem.url}
            alt={currentItem.caption || 'Media'}
            width={1200}
            height={800}
            className="object-contain max-h-[85vh]"
          />
        ) : currentItem.type === 'video' ? (
          <video
            src={currentItem.url}
            controls
            autoPlay
            className="max-h-[85vh]"
          />
        ) : currentItem.type === 'audio' ? (
          <div className="p-8 bg-space-mid rounded-xl">
            <audio src={currentItem.url} controls className="w-full" />
          </div>
        ) : null}

        {/* Caption */}
        {currentItem.caption && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {currentItem.caption}
          </p>
        )}

        {/* Counter */}
        {items.length > 1 && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            {currentIndex + 1} / {items.length}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

export default MediaGallery
