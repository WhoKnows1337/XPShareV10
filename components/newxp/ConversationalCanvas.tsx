'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { MultiModalInput } from './MultiModalInput'
import { AISidebar } from './AISidebar'
import { ConversationalPrompts } from './ConversationalPrompts'
import { FloatingMediaButton } from './FloatingMediaButton'
import { SmartPublish } from './SmartPublish'
import { XPToast } from './XPToast'
import { useRouter } from 'next/navigation'

export const ConversationalCanvas = () => {
  const router = useRouter()
  const {
    publishedId,
    completionPercentage,
    showPreview,
    togglePreview,
  } = useNewXPStore()

  // Redirect to success page after publish
  useEffect(() => {
    if (publishedId) {
      router.push(`/newxp/success?id=${publishedId}`)
    }
  }, [publishedId, router])

  return (
    <div className="relative min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Was hast du erlebt? ✨
            </h1>
            <p className="text-gray-600 mt-1">
              Schreibe, spreche oder zeige uns deine Experience
            </p>
          </div>

          {/* Privacy Selector */}
          <PrivacySelector />
        </motion.header>

        {/* Main Grid: Input + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Left: Main Input */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <MultiModalInput />

            {/* Conversational Prompts */}
            <div className="mt-6">
              <ConversationalPrompts />
            </div>

            {/* Publish Button */}
            <div className="mt-6">
              <SmartPublish />
            </div>
          </motion.div>

          {/* Right: AI Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <AISidebar />
          </motion.div>
        </div>

        {/* Floating Action Button (Mobile & Desktop) */}
        <FloatingMediaButton />

        {/* XP Toast */}
        <XPToast />

        {/* Completion Indicator (Mobile) */}
        <MobileCompletionBar percentage={completionPercentage} />
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <PreviewModal onClose={togglePreview} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ========================================
// PRIVACY SELECTOR
// ========================================

const PrivacySelector = () => {
  const { privacyLevel, setPrivacy } = useNewXPStore()
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: 'public' as const, icon: '🌍', label: 'Öffentlich' },
    { value: 'anonymous' as const, icon: '👤', label: 'Anonym' },
    { value: 'private' as const, icon: '🔒', label: 'Privat' },
  ]

  const selected = options.find(o => o.value === privacyLevel) || options[1]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <span>{selected.icon}</span>
        <span className="font-medium text-gray-700">{selected.label}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPrivacy(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    privacyLevel === option.value ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-gray-700">{option.label}</span>
                  {privacyLevel === option.value && (
                    <span className="ml-auto text-blue-500">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ========================================
// MOBILE COMPLETION BAR
// ========================================

const MobileCompletionBar = ({ percentage }: { percentage: number }) => {
  if (percentage === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 left-4 right-4 lg:hidden z-30"
    >
      <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Vollständigkeit</span>
          <span className="text-xs font-bold text-blue-600">{percentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ========================================
// PREVIEW MODAL
// ========================================

import { useState } from 'react'
import { X } from 'lucide-react'

const PreviewModal = ({ onClose }: { onClose: () => void }) => {
  const { rawText, extractedData, uploadedMedia, confirmedWitnesses } = useNewXPStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {extractedData.title.value || 'Deine Experience'}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {extractedData.location.value && (
                <span className="flex items-center gap-1">
                  📍 {extractedData.location.value}
                </span>
              )}
              {extractedData.date.value && (
                <span className="flex items-center gap-1">
                  📅 {extractedData.date.value}
                </span>
              )}
              {extractedData.category.value && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {extractedData.category.value}
                </span>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {rawText}
            </p>
          </div>

          {/* Media */}
          {uploadedMedia.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Medien ({uploadedMedia.length})</h4>
              <div className="grid grid-cols-3 gap-2">
                {uploadedMedia.slice(0, 6).map((media) => (
                  <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {media.type === 'photo' && (
                      <img src={media.preview} alt="" className="w-full h-full object-cover" />
                    )}
                    {media.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center">
                        🎥
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Witnesses */}
          {confirmedWitnesses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Zeugen ({confirmedWitnesses.length})</h4>
              <div className="flex flex-wrap gap-2">
                {confirmedWitnesses.map((witness) => (
                  <div
                    key={witness.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full"
                  >
                    <span className="text-sm">👤</span>
                    <span className="text-sm font-medium text-gray-700">
                      {witness.name || witness.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
