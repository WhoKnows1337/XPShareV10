'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AttributeValue {
  value: string
  count: number
  label_en: string
}

interface AttributeInfo {
  display_name: string
  display_name_de: string | null
  display_name_fr: string | null
  display_name_es: string | null
  data_type: string
  allowed_values: string[] | null
  values: AttributeValue[]
  total_count: number
}

interface AttributeFiltersProps {
  category?: string
  locale?: string
  onFiltersChange: (filters: Record<string, string[]>) => void
  className?: string
}

export function AttributeFilters({
  category,
  locale = 'de',
  onFiltersChange,
  className = '',
}: AttributeFiltersProps) {
  const [attributes, setAttributes] = useState<Record<string, AttributeInfo>>({})
  const [loading, setLoading] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAvailableAttributes()
  }, [category])

  const fetchAvailableAttributes = async () => {
    try {
      setLoading(true)
      const url = category
        ? `/api/attributes/available?category=${category}`
        : '/api/attributes/available'

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch attributes')

      const data = await response.json()
      setAttributes(data.attributes || {})
    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAttribute = (key: string) => {
    setExpandedAttributes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleValue = (attributeKey: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[attributeKey] || []
      const next = { ...prev }

      if (current.includes(value)) {
        // Remove value
        next[attributeKey] = current.filter((v) => v !== value)
        if (next[attributeKey].length === 0) {
          delete next[attributeKey]
        }
      } else {
        // Add value
        next[attributeKey] = [...current, value]
      }

      onFiltersChange(next)
      return next
    })
  }

  const clearFilter = (attributeKey: string) => {
    setSelectedFilters((prev) => {
      const next = { ...prev }
      delete next[attributeKey]
      onFiltersChange(next)
      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
    onFiltersChange({})
  }

  const getDisplayName = (attr: AttributeInfo): string => {
    switch (locale) {
      case 'de':
        return attr.display_name_de || attr.display_name
      case 'fr':
        return attr.display_name_fr || attr.display_name
      case 'es':
        return attr.display_name_es || attr.display_name
      default:
        return attr.display_name
    }
  }

  const attributeKeys = Object.keys(attributes)
  const hasActiveFilters = Object.keys(selectedFilters).length > 0
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, values) => sum + values.length,
    0
  )

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (attributeKeys.length === 0) {
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Attribute Filter
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Alle löschen
            </button>
          )}
        </div>
      </div>

      {/* Attribute List */}
      <div className="p-4 space-y-3">
        {attributeKeys.map((key) => {
          const attr = attributes[key]
          const isExpanded = expandedAttributes.has(key)
          const selectedValues = selectedFilters[key] || []
          const hasSelection = selectedValues.length > 0

          return (
            <div
              key={key}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Attribute Header */}
              <button
                onClick={() => toggleAttribute(key)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {getDisplayName(attr)}
                  </span>
                  {hasSelection && (
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded">
                      {selectedValues.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{attr.total_count}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Attribute Values */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                      {attr.values.map((valueInfo) => {
                        const isSelected = selectedValues.includes(valueInfo.value)

                        return (
                          <label
                            key={valueInfo.value}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleValue(key, valueInfo.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {valueInfo.label_en}
                            </span>
                            <span className="text-xs text-gray-500">
                              {valueInfo.count}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([key, values]) => {
              const attr = attributes[key]
              if (!attr) return null

              return values.map((value) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full"
                >
                  <span>{getDisplayName(attr)}: {value}</span>
                  <button
                    onClick={() => toggleValue(key, value)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            })}
          </div>
        </div>
      )}
    </div>
  )
}
