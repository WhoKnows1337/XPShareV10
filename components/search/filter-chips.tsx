'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Tag, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActiveFilter {
  key: string
  type: 'category' | 'location' | 'tags' | 'dateRange' | 'witnesses'
  label: string
  value: string
}

interface FilterChipsProps {
  filters: ActiveFilter[]
  onRemoveFilter: (key: string) => void
  onClearAll?: () => void
  className?: string
}

const filterTypeConfig = {
  category: {
    color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    icon: Tag,
  },
  location: {
    color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
    icon: MapPin,
  },
  tags: {
    color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
    icon: Tag,
  },
  dateRange: {
    color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
    icon: Calendar,
  },
  witnesses: {
    color: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
    icon: Users,
  },
}

/**
 * FilterChips - Removable badges showing active filters
 *
 * Features:
 * - Smooth fade-in/scale-out animations
 * - Color-coded by filter type
 * - X button with hover effect
 * - "Clear all" button when multiple filters
 * - Responsive layout
 */
export function FilterChips({ filters, onRemoveFilter, onClearAll, className }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <AnimatePresence mode="popLayout">
        {filters.map((filter) => {
          const config = filterTypeConfig[filter.type]
          const Icon = config.icon

          return (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              layout
            >
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                  config.color
                )}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="max-w-[150px] truncate">
                  {filter.label}: {filter.value}
                </span>
                <button
                  onClick={() => onRemoveFilter(filter.key)}
                  className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}

        {/* Clear All Button */}
        {filters.length > 1 && onClearAll && (
          <motion.button
            key="clear-all"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Clear all
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
