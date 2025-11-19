'use client'

import { motion } from 'framer-motion'
import { SlidersHorizontal, ArrowUpDown, MapPin, Calendar, Target } from 'lucide-react'

export type SortOption = 'relevance' | 'date' | 'location' | 'score'
export type FilterCategory = 'all' | 'same-city' | 'same-country' | 'high-match'

interface FilterSortBarProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  filter: FilterCategory
  onFilterChange: (filter: FilterCategory) => void
  totalCount: number
  filteredCount: number
}

export function FilterSortBar({
  sortBy,
  onSortChange,
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterSortBarProps) {
  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'relevance', label: 'Best Match', icon: <Target className="h-4 w-4" /> },
    { id: 'date', label: 'Recent', icon: <Calendar className="h-4 w-4" /> },
    { id: 'score', label: 'Similarity', icon: <ArrowUpDown className="h-4 w-4" /> },
    { id: 'location', label: 'Nearest', icon: <MapPin className="h-4 w-4" /> },
  ]

  const filterOptions: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'same-city', label: 'Same City' },
    { id: 'same-country', label: 'Same Country' },
    { id: 'high-match', label: 'High Match (>80%)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/20 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-white/50" />
        <span className="text-sm font-medium text-white/70">Sort by:</span>
        <div className="flex gap-1">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={`
                flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                ${
                  sortBy === option.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }
              `}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/70">Filter:</span>
        <div className="flex gap-1">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              className={`
                rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                ${
                  filter === option.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {filteredCount !== totalCount && (
        <div className="text-xs text-white/50">
          Showing {filteredCount} of {totalCount}
        </div>
      )}
    </motion.div>
  )
}
