'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { staggerContainer, fadeInUp } from '../shared/animations'

interface MetadataRowProps {
  location?: string
  timeOfDay?: string
  dateOccurred?: string
  tags?: string[]
  className?: string
  variant?: 'row' | 'grid' | 'stacked'
}

const timeOfDayLabels: Record<string, { icon: string; label: string }> = {
  morning: { icon: '🌅', label: 'Morgen' },
  afternoon: { icon: '☀️', label: 'Nachmittag' },
  evening: { icon: '🌆', label: 'Abend' },
  night: { icon: '🌙', label: 'Nacht' },
  dawn: { icon: '🌄', label: 'Morgendämmerung' },
  dusk: { icon: '🌇', label: 'Abenddämmerung' },
}

export function MetadataRow({
  location,
  timeOfDay,
  dateOccurred,
  tags,
  className,
  variant = 'row',
}: MetadataRowProps) {
  const hasMetadata = location || timeOfDay || dateOccurred
  const hasTags = tags && tags.length > 0

  if (!hasMetadata && !hasTags) return null

  const timeInfo = timeOfDay ? timeOfDayLabels[timeOfDay] : null
  const formattedDate = dateOccurred
    ? format(new Date(dateOccurred), 'd. MMM yyyy', { locale: de })
    : null

  if (variant === 'stacked') {
    return (
      <motion.div
        variants={staggerContainer(0.05)}
        initial="hidden"
        animate="visible"
        className={cn('space-y-3', className)}
      >
        {/* Metadata Items */}
        {hasMetadata && (
          <div className="flex flex-wrap gap-4">
            {location && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <MapPin className="h-4 w-4 text-primary/70" />
                <span>{location}</span>
              </motion.div>
            )}

            {timeInfo && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span>{timeInfo.icon}</span>
                <span>{timeInfo.label}</span>
              </motion.div>
            )}

            {formattedDate && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Calendar className="h-4 w-4 text-primary/70" />
                <span>{formattedDate}</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <motion.a
                key={tag}
                href={`/discover?tag=${encodeURIComponent(tag)}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1',
                  'rounded-full text-xs font-medium',
                  'bg-white/5 hover:bg-white/10',
                  'border border-white/10 hover:border-white/20',
                  'transition-colors'
                )}
              >
                <span className="text-muted-foreground">#</span>
                {tag}
              </motion.a>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  if (variant === 'grid') {
    return (
      <motion.div
        variants={staggerContainer(0.05)}
        initial="hidden"
        animate="visible"
        className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}
      >
        {location && (
          <motion.div
            variants={fadeInUp}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl',
              'bg-card/30 border border-white/5'
            )}
          >
            <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </motion.div>
        )}

        {timeInfo && (
          <motion.div
            variants={fadeInUp}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl',
              'bg-card/30 border border-white/5'
            )}
          >
            <span className="text-lg">{timeInfo.icon}</span>
            <span className="text-sm">{timeInfo.label}</span>
          </motion.div>
        )}

        {formattedDate && (
          <motion.div
            variants={fadeInUp}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl',
              'bg-card/30 border border-white/5'
            )}
          >
            <Calendar className="h-4 w-4 text-primary/70 flex-shrink-0" />
            <span className="text-sm">{formattedDate}</span>
          </motion.div>
        )}

        {hasTags && (
          <motion.div
            variants={fadeInUp}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl',
              'bg-card/30 border border-white/5',
              'col-span-2 md:col-span-1'
            )}
          >
            <Tag className="h-4 w-4 text-primary/70 flex-shrink-0" />
            <span className="text-sm truncate">{tags.join(', ')}</span>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Default: Row variant
  return (
    <motion.div
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="visible"
      className={cn('space-y-3', className)}
    >
      {/* Inline Metadata */}
      {hasMetadata && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
        >
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          )}

          {timeInfo && (
            <span className="inline-flex items-center gap-1.5">
              <span>{timeInfo.icon}</span>
              {timeInfo.label}
            </span>
          )}

          {formattedDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          )}
        </motion.div>
      )}

      {/* Tags */}
      {hasTags && (
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.a
              key={tag}
              href={`/discover?tag=${encodeURIComponent(tag)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1',
                'rounded-full text-xs',
                'bg-white/5 hover:bg-white/10',
                'text-muted-foreground hover:text-foreground',
                'transition-colors'
              )}
            >
              #{tag}
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default MetadataRow
