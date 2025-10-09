'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { DropZone } from './DropZone'
import { MediaPreview } from './MediaPreview'
import { Camera, Video, Mic, Pencil, ArrowLeft, ArrowRight } from 'lucide-react'

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
  const { uploadedFiles, uploadFile, removeFile, nextStep, prevStep, currentStep } = useSubmitStore()
  const [activeType, setActiveType] = useState<'photo' | 'video' | 'audio' | 'sketch'>('photo')

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

  const currentTypeConfig = mediaTypes.find(t => t.type === activeType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Schritt {currentStep} von 6</span>
            <span className="text-sm text-gray-500">Optional</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 6) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

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
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Skizzen-Editor öffnen
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Excalidraw integration coming soon...
              </p>
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
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Überspringen
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-xl transition-all shadow-lg"
            >
              <span>Weiter</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
