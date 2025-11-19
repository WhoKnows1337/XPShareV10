'use client'

import { useState, useMemo, useEffect } from 'react'
import { FilterSortBar, SortOption, FilterCategory } from './FilterSortBar'
import { EnhancedExperienceCard } from './EnhancedExperienceCard'

interface SimilarExperience {
  id: string
  title: string
  summary?: string
  category: string
  date: string
  location?: {
    city?: string
    country?: string
  }
  matchScore: number
  matchReasons?: string[]
}

interface EnhancedListTabProps {
  experiences: SimilarExperience[]
  userLocation?: { city?: string; country?: string }
}

export function EnhancedListTab({ experiences, userLocation }: EnhancedListTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Filter experiences
  const filteredExperiences = useMemo(() => {
    let filtered = [...experiences]

    switch (filter) {
      case 'same-city':
        if (userLocation?.city) {
          filtered = filtered.filter(
            (exp) => exp.location?.city === userLocation.city
          )
        }
        break
      case 'same-country':
        if (userLocation?.country) {
          filtered = filtered.filter(
            (exp) => exp.location?.country === userLocation.country
          )
        }
        break
      case 'high-match':
        filtered = filtered.filter((exp) => exp.matchScore >= 0.8)
        break
    }

    return filtered
  }, [experiences, filter, userLocation])

  // Sort experiences
  const sortedExperiences = useMemo(() => {
    const sorted = [...filteredExperiences]

    switch (sortBy) {
      case 'relevance':
        // Already sorted by match score from backend
        return sorted
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime()
          const dateB = new Date(b.date || 0).getTime()
          return dateB - dateA // Most recent first
        })
      case 'score':
        return sorted.sort((a, b) => b.matchScore - a.matchScore)
      case 'location':
        // Sort by same city first, then same country, then others
        return sorted.sort((a, b) => {
          const aCity = a.location?.city === userLocation?.city ? 2 : 0
          const aCountry = a.location?.country === userLocation?.country ? 1 : 0
          const bCity = b.location?.city === userLocation?.city ? 2 : 0
          const bCountry = b.location?.country === userLocation?.country ? 1 : 0
          return (bCity + bCountry) - (aCity + aCountry)
        })
      default:
        return sorted
    }
  }, [filteredExperiences, sortBy, userLocation])

  return (
    <div className="space-y-6">
      {/* Filter & Sort Bar */}
      <FilterSortBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={experiences.length}
        filteredCount={filteredExperiences.length}
      />

      {/* Enhanced Experience Cards */}
      {sortedExperiences.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedExperiences.map((experience, index) => (
            <EnhancedExperienceCard
              key={`experience-${experience.id}-${index}`}
              experience={experience}
              index={index}
              isClient={isClient}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-white/60">
          <p>No experiences match the selected filters.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
