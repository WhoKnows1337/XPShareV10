'use client'

import { motion } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Rocket, Eye, Loader2 } from 'lucide-react'

export const SmartPublish = () => {
  const { rawText, completionPercentage, isPublishing, togglePreview, publish } = useNewXPStore()

  const canPublish = rawText.length >= 50 && completionPercentage >= 50

  const handlePublish = async () => {
    if (!canPublish || isPublishing) return

    try {
      await publish()
    } catch (error) {
      console.error('Publish error:', error)
      alert('Veröffentlichung fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Preview Button */}
      <motion.button
        whileHover={{ scale: canPublish ? 1.05 : 1 }}
        whileTap={{ scale: canPublish ? 0.95 : 1 }}
        onClick={togglePreview}
        disabled={!canPublish}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
          ${
            canPublish
              ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <Eye className="w-5 h-5" />
        <span>Vorschau</span>
      </motion.button>

      {/* Publish Button */}
      <motion.button
        whileHover={{ scale: canPublish ? 1.05 : 1 }}
        whileTap={{ scale: canPublish ? 0.95 : 1 }}
        onClick={handlePublish}
        disabled={!canPublish || isPublishing}
        className={`
          flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium transition-all shadow-lg
          ${
            canPublish && !isPublishing
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Veröffentliche...</span>
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            <span>Veröffentlichen</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
