'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperienceSubmitStore } from '@/lib/stores/experienceSubmitStore'
import { Sparkles, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export const SummaryEditor = () => {
  const { summary, updateSummary, generateSummary } = useExperienceSubmitStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await generateSummary()
    setIsGenerating(false)
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    updateSummary('title', suggestion)
    setShowSuggestions(false)
  }

  const teaserCharCount = summary.teaser.length
  const maxTeaserChars = 280

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">📝 Titel & Teaser</h2>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 space-y-6">
        {/* Title Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Titel</label>
            <div className="flex items-center gap-2">
              {summary.titleSuggestions.length > 0 && (
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>KI-Vorschläge ({summary.titleSuggestions.length})</span>
                  {showSuggestions ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors disabled:opacity-50"
                title="Neu generieren"
              >
                <RotateCcw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <input
            type="text"
            value={summary.title}
            onChange={(e) => updateSummary('title', e.target.value)}
            placeholder="Ein aussagekräftiger Titel für deine Erfahrung..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-medium"
            maxLength={60}
          />

          <div className="text-sm text-gray-500 text-right">{summary.title.length}/60 Zeichen</div>

          {/* AI Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && summary.titleSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-700 mb-2">
                    KI-Vorschläge (klicke zum Übernehmen):
                  </p>
                  {summary.titleSuggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 bg-white border border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <span className="text-gray-900">{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Teaser Editor */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Teaser <span className="text-gray-500">(Kurzbeschreibung für Feed)</span>
          </label>

          <textarea
            value={summary.teaser}
            onChange={(e) => updateSummary('teaser', e.target.value)}
            placeholder="Eine kurze, spannende Zusammenfassung die Leser neugierig macht..."
            rows={4}
            maxLength={maxTeaserChars}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />

          <div
            className={`text-sm text-right ${
              teaserCharCount > maxTeaserChars * 0.9
                ? 'text-orange-500'
                : teaserCharCount > maxTeaserChars * 0.95
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {teaserCharCount}/{maxTeaserChars} Zeichen
          </div>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-gray-600">
            <strong>💡 Tipp:</strong> Ein guter Titel weckt Neugier, ohne zu viel zu verraten.
            Der Teaser sollte die Essenz deiner Erfahrung in 1-2 Sätzen einfangen.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
