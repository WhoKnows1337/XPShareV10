'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Save } from 'lucide-react'

interface AutosaveIndicatorProps {
  lastSaved?: Date
  isSaving?: boolean
}

export const AutosaveIndicator = ({ lastSaved, isSaving = false }: AutosaveIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)

      if (seconds < 5) {
        setTimeAgo('Gerade gespeichert')
        setIsVisible(true)
      } else if (seconds < 60) {
        setTimeAgo(`Vor ${seconds}s gespeichert`)
        setIsVisible(true)
      } else if (seconds < 120) {
        setTimeAgo('Vor 1 Min gespeichert')
        setIsVisible(false) // Fade out after 2 minutes
      } else {
        setIsVisible(false)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastSaved])

  // Show indicator when saving or recently saved
  useEffect(() => {
    if (isSaving) {
      setIsVisible(true)
    }
  }, [isSaving])

  return (
    <AnimatePresence>
      {(isVisible || isSaving) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 animate-pulse" />
              <span>Speichert...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">{timeAgo}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to track autosave from Zustand persist
export const useAutosaveTracking = () => {
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Listen for Zustand persist events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'experience-submit-storage' && e.newValue) {
        setLastSaved(new Date())
        setIsSaving(false)
      }
    }

    // Track when text changes (saving)
    let saveTimeout: NodeJS.Timeout
    const handleBeforeSave = () => {
      setIsSaving(true)
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        setIsSaving(false)
        setLastSaved(new Date())
      }, 300) // Debounce
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      clearTimeout(saveTimeout)
    }
  }, [])

  return { lastSaved, isSaving, triggerSave: () => setLastSaved(new Date()) }
}
