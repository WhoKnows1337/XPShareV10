'use client'

import { motion } from 'framer-motion'
import type { SimilarExperience } from '@/lib/stores/experienceSubmitStore'
import { MapPin, Calendar, Users, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface SimilarExperiencesProps {
  experiences: SimilarExperience[]
}

export const SimilarExperiences = ({ experiences }: SimilarExperiencesProps) => {
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (experiences.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
        <p className="text-gray-600">Noch keine ähnlichen Erfahrungen gefunden...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {experiences.map((exp, index) => {
        let displayDate = 'Kürzlich'
        try {
          if (exp.date) {
            const date = new Date(exp.date)
            if (!isNaN(date.getTime())) {
              displayDate = format(date, 'd. MMM yyyy', { locale: de })
            }
          }
        } catch {
          displayDate = 'Kürzlich'
        }

        return (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 cursor-pointer transition-all"
          >
            {/* Match Score Badge */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(
                  exp.matchScore
                )}`}
              >
                <TrendingUp className="w-4 h-4" />
                {exp.matchScore}% Übereinstimmung
              </span>

              <span className="text-sm text-gray-500">{exp.category}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {exp.title}
            </h3>

            {/* Teaser */}
            <p className="text-gray-600 mb-4 line-clamp-3">{exp.teaser}</p>

            {/* Match Reasons */}
            {exp.matchReasons && exp.matchReasons.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Gemeinsamkeiten:</p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
              {exp.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{exp.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{displayDate}</span>
              </div>

              {exp.witnessCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{exp.witnessCount}</span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-3 h-3 text-gray-600" />
              </div>
              <span>
                {exp.user.isAnonymous ? 'Anonym' : exp.user.username || 'Unbekannt'}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
