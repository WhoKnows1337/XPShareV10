'use client'

import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { MapPin, Calendar, Eye, User } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const CardPreview = () => {
  const { extractedData, summary, displayMode, enrichedText, rawText } = useSubmitStore()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'UAP Sighting':
        return '🛸'
      case 'Spiritual Experience':
        return '✨'
      case 'Synchronicity':
        return '🔮'
      case 'Paranormal':
        return '👻'
      case 'Dream/Vision':
        return '💭'
      case 'Consciousness':
        return '🧠'
      default:
        return '✨'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UAP Sighting':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Spiritual Experience':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'Synchronicity':
        return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'Paranormal':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'Dream/Vision':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300'
      case 'Consciousness':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const displayText = displayMode === 'enriched' && enrichedText ? enrichedText : rawText
  const displayTitle = summary.title || extractedData.title.value || 'Deine Erfahrung'
  const displayTeaser = summary.teaser || displayText.substring(0, 280) + '...'

  // Parse date
  let displayDate = 'Kürzlich'
  try {
    if (extractedData.date.value) {
      const date = new Date(extractedData.date.value)
      if (!isNaN(date.getTime())) {
        displayDate = format(date, 'd. MMMM yyyy', { locale: de })
      }
    }
  } catch {
    displayDate = extractedData.date.value || 'Kürzlich'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        📱 So erscheint es im Feed
      </h2>

      {/* Live Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transition-all"
      >
        {/* Category Badge */}
        <div className="px-6 pt-6 pb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
              extractedData.category.value
            )}`}
          >
            <span>{getCategoryIcon(extractedData.category.value)}</span>
            <span>{extractedData.category.value || 'Erfahrung'}</span>
          </span>
        </div>

        {/* Title */}
        <div className="px-6 pb-3">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
            {displayTitle}
          </h3>
        </div>

        {/* Teaser */}
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed line-clamp-3">{displayTeaser}</p>
        </div>

        {/* Metadata */}
        <div className="px-6 pb-6 flex items-center gap-4 text-sm text-gray-500">
          {extractedData.location.value && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{extractedData.location.value}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{displayDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>Anonym</span>
          </div>
        </div>

        {/* Tags */}
        {extractedData.tags.value && extractedData.tags.value.length > 0 && (
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            {extractedData.tags.value.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>-</span>
            </div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Mehr lesen →
          </button>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <p className="text-sm text-blue-700">
          <strong>💡 Tipp:</strong> So wird deine Erfahrung in der Community sichtbar sein.
          Du kannst jederzeit bearbeiten.
        </p>
      </motion.div>
    </div>
  )
}
