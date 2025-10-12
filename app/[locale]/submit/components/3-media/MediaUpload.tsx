'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { DropZone } from './DropZone'
import { MediaPreview } from './MediaPreview'
import { ProgressBar } from '../shared/ProgressBar'
import { NavigationButtons } from '../shared/NavigationButtons'
import { WitnessManager } from '@/components/submit3/WitnessManager'
import { Pencil } from 'lucide-react'

// Dynamic import for Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-xl">
        <p className="text-gray-500">Lade Skizzen-Editor...</p>
      </div>
    ),
  }
)

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
  const {
    uploadedFiles,
    uploadFile,
    removeFile,
    additionalNotes,
    setAdditionalNotes,
    witnesses,
    addWitness,
    removeWitness,
    nextStep,
    prevStep,
    currentStep
  } = useSubmitStore()
  const [showSketch, setShowSketch] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)

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

  const handleSaveSketch = async () => {
    if (!excalidrawAPI) return

    try {
      const elements = excalidrawAPI.getSceneElements()
      const appState = excalidrawAPI.getAppState()

      if (elements.length === 0) {
        alert('Bitte zeichne etwas, bevor du speicherst')
        return
      }

      // Export to blob
      const { exportToBlob } = await import('@excalidraw/excalidraw')
      const blob = await exportToBlob({
        elements,
        appState,
        files: excalidrawAPI.getFiles(),
      })

      // Convert blob to file
      const file = new File([blob], `sketch-${Date.now()}.png`, {
        type: 'image/png',
      })

      await uploadFile(file)
      setShowSketch(false)
    } catch (error) {
      console.error('Error saving sketch:', error)
      alert('Fehler beim Speichern der Skizze')
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Medien & Zeugen
          </h1>
          <p className="text-lg text-gray-600">
            Füge Medien hinzu und benenne Personen, die dabei waren
          </p>
        </motion.div>

        {/* Unified Drop Zone for all media types */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📸 Medien hinzufügen (optional)
          </h2>
          <DropZone
            accept="image/*,video/*,audio/*"
            onFilesAdded={handleFileUpload}
            maxFiles={20}
          />
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

        {/* Witness Manager */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Zeugen (optional)
          </h2>
          <WitnessManager
            witnesses={witnesses}
            onAdd={addWitness}
            onRemove={removeWitness}
          />
        </motion.div>

        {/* Inline Sketch Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✏️ Skizze erstellen (optional)
          </h2>

          {!showSketch ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSketch(true)}
              className="w-full p-8 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <Pencil className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 font-medium">Skizzen-Editor öffnen</p>
              <p className="text-sm text-gray-500 mt-1">
                Zeichne eine Skizze um deine Erfahrung zu visualisieren
              </p>
            </motion.button>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-[500px] border-2 border-gray-200 rounded-t-xl">
                <Excalidraw
                  excalidrawAPI={(api) => setExcalidrawAPI(api)}
                  initialData={{
                    appState: { viewBackgroundColor: '#ffffff' },
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between rounded-b-xl">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSketch(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Abbrechen
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSketch}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Skizze speichern
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

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
      </motion.div>
    </div>
  )
}
