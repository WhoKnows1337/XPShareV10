'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { DropZone } from './DropZone'
import { MediaPreview } from './MediaPreview'
import { ProgressBar } from '../shared/ProgressBar'
import { NavigationButtons } from '../shared/NavigationButtons'
import { Camera, Video, Mic, Pencil } from 'lucide-react'

// Dynamic import for SketchModal to avoid SSR issues with Excalidraw
const SketchModal = dynamic(() => import('./SketchModal').then(mod => ({ default: mod.SketchModal })), {
  ssr: false
})

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

const typeButtonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200 },
  },
}

export const MediaUpload = () => {
  const { uploadedFiles, uploadFile, removeFile, additionalNotes, setAdditionalNotes, nextStep, prevStep, currentStep } = useSubmitStore()
  const [activeType, setActiveType] = useState<'photo' | 'video' | 'audio' | 'sketch'>('photo')
  const [isSketchModalOpen, setIsSketchModalOpen] = useState(false)

  const mediaTypes = [
    { type: 'photo' as const, icon: <Camera className="w-6 h-6" />, label: 'Foto', accept: 'image/*' },
    { type: 'video' as const, icon: <Video className="w-6 h-6" />, label: 'Video', accept: 'video/*' },
    { type: 'audio' as const, icon: <Mic className="w-6 h-6" />, label: 'Audio', accept: 'audio/*' },
    { type: 'sketch' as const, icon: <Pencil className="w-6 h-6" />, label: 'Skizze', accept: '' },
  ]

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(file)
    }
  }

  const handleContinue = () => {
    nextStep()
  }

  const handleSkip = () => {
    nextStep()
  }

  const handleSketchSave = async (file: File) => {
    await uploadFile(file)
  }

  const currentTypeConfig = mediaTypes.find(t => t.type === activeType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📸 Möchtest du Medien hinzufügen?
          </h1>
          <p className="text-gray-600">
            Fotos, Videos, Audio oder Skizzen können deine Erfahrung verdeutlichen
          </p>
        </motion.div>

        {/* Media Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-8"
        >
          {mediaTypes.map((type, index) => (
            <motion.button
              key={type.type}
              variants={typeButtonVariants}
              custom={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveType(type.type)}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all ${
                activeType === type.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.icon}
              <span className="text-sm font-medium">{type.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Drop Zone or Sketch Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {activeType === 'sketch' ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <Pencil className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skizze erstellen</h3>
              <p className="text-gray-600 mb-6">
                Zeichne eine Skizze um deine Erfahrung zu visualisieren
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSketchModalOpen(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Skizzen-Editor öffnen
              </motion.button>
            </div>
          ) : (
            <DropZone
              accept={currentTypeConfig?.accept || ''}
              onFilesAdded={handleFileUpload}
              maxFiles={activeType === 'photo' ? 10 : activeType === 'video' ? 3 : 5}
            />
          )}
        </motion.div>

        {/* Media Preview */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hochgeladene Dateien ({uploadedFiles.length})
            </h3>
            <MediaPreview files={uploadedFiles} onRemove={removeFile} />

            {/* Optional Notes */}
            <div className="mt-6">
              <label htmlFor="media-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notizen zu diesen Medien (optional)
              </label>
              <textarea
                id="media-notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Füge hier zusätzliche Informationen zu deinen Medien hinzu..."
                className="w-full min-h-[100px] p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
                maxLength={500}
              />
              <div className="text-right mt-1">
                <span className="text-sm text-gray-500">{additionalNotes.length}/500</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="relative">
          <NavigationButtons
            onBack={prevStep}
            onNext={handleContinue}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
            >
              Überspringen
            </motion.button>
          </motion.div>
        </div>

        {/* Sketch Modal */}
        <SketchModal
          isOpen={isSketchModalOpen}
          onClose={() => setIsSketchModalOpen(false)}
          onSave={handleSketchSave}
        />
      </motion.div>
    </div>
  )
}
