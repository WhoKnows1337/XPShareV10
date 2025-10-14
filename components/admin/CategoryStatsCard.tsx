'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, FileText, Tag, Database, TrendingUp } from 'lucide-react'

interface CategoryStat {
  id: string
  slug: string
  name: string
  parent_category_id: string | null
  is_active: boolean
  question_count: number
  attribute_count: number
  experience_count: number
  completion_percentage: number
  status: 'complete' | 'partial' | 'incomplete'
}

interface CategoryStatsCardProps {
  className?: string
}

export function CategoryStatsCard({ className = '' }: CategoryStatsCardProps) {
  const [stats, setStats] = useState<CategoryStat[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'complete' | 'partial' | 'incomplete'>('all')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.stats || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error('Error fetching category stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: CategoryStat['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'incomplete':
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: CategoryStat['status']) => {
    switch (status) {
      case 'complete':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold rounded">
            Vollständig
          </span>
        )
      case 'partial':
        return (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-semibold rounded">
            Teilweise
          </span>
        )
      case 'incomplete':
        return (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-semibold rounded">
            Unvollständig
          </span>
        )
    }
  }

  const filteredStats = stats.filter((stat) => {
    if (filter === 'all') return true
    return stat.status === filter
  })

  const mainCategories = filteredStats.filter((s) => !s.parent_category_id)
  const subCategories = filteredStats.filter((s) => s.parent_category_id)

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Kategorie Statistiken
        </h3>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Kategorien
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {summary.total_categories}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Fragen
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary.total_questions}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Attribute
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {summary.total_attributes}
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Experiences
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {summary.total_experiences}
              </p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Alle ({stats.length})
          </button>
          <button
            onClick={() => setFilter('complete')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'complete'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-semibold'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Vollständig ({summary?.complete_categories || 0})
          </button>
          <button
            onClick={() => setFilter('partial')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'partial'
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 font-semibold'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Teilweise ({summary?.partial_categories || 0})
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'incomplete'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Unvollständig ({summary?.incomplete_categories || 0})
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {mainCategories.map((mainCat) => {
          const children = subCategories.filter((s) => s.parent_category_id === mainCat.id)

          return (
            <div key={mainCat.id} className="space-y-2">
              {/* Main Category */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(mainCat.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {mainCat.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{mainCat.question_count} Fragen</span>
                      <span>{mainCat.attribute_count} Attribute</span>
                      <span>{mainCat.experience_count} Experiences</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {mainCat.completion_percentage}%
                    </div>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          mainCat.status === 'complete'
                            ? 'bg-green-500'
                            : mainCat.status === 'partial'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${mainCat.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  {getStatusBadge(mainCat.status)}
                </div>
              </div>

              {/* Subcategories */}
              {children.length > 0 && (
                <div className="ml-8 space-y-2">
                  {children.map((subCat) => (
                    <div
                      key={subCat.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subCat.status)}
                        <div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {subCat.name}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{subCat.question_count} Q</span>
                            <span>{subCat.attribute_count} A</span>
                            <span>{subCat.experience_count} E</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {subCat.completion_percentage}%
                        </span>
                        {getStatusBadge(subCat.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredStats.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Keine Kategorien mit diesem Status
          </div>
        )}
      </div>
    </div>
  )
}
