'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Plus, Camera, Image as ImageIcon, Video, Mic, FileText } from 'lucide-react'

export const FloatingMediaButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { uploadMedia, setInputMode } = useNewXPStore()

  const handleFileUpload = async (accept: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = true

    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      for (const file of files) {
        await uploadMedia(file)
      }
      setIsOpen(false)
    }

    input.click()
  }

  const actions = [
    {
      icon: Camera,
      label: 'Foto aufnehmen',
      color: 'bg-blue-500',
      action: () => handleFileUpload('image/*'),
    },
    {
      icon: ImageIcon,
      label: 'Galerie',
      color: 'bg-purple-500',
      action: () => handleFileUpload('image/*,video/*'),
    },
    {
      icon: Video,
      label: 'Video',
      color: 'bg-red-500',
      action: () => handleFileUpload('video/*'),
    },
    {
      icon: Mic,
      label: 'Audio',
      color: 'bg-green-500',
      action: () => {
        setInputMode('voice')
        setIsOpen(false)
      },
    },
    {
      icon: FileText,
      label: 'Dokument (OCR)',
      color: 'bg-orange-500',
      action: () => handleFileUpload('.pdf,.txt,image/*'),
    },
  ]

  return (
    <>
      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          ${isOpen ? 'bg-gray-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}
        `}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>

      {/* Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-30"
            />

            {/* Actions */}
            <div className="fixed bottom-24 right-6 z-40 space-y-3">
              {actions.map((action, index) => {
                const Icon = action.icon

                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { delay: index * 0.05 },
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                      scale: 0.8,
                      transition: { delay: (actions.length - index) * 0.05 },
                    }}
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className="flex items-center gap-3 group"
                  >
                    <span className="px-3 py-1.5 bg-white rounded-lg shadow-lg text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {action.label}
                    </span>
                    <div
                      className={`
                        w-12 h-12 rounded-full shadow-lg
                        flex items-center justify-center
                        ${action.color}
                      `}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
