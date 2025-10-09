'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MainInput } from './MainInput'
import { ExtractionSidebar } from './ExtractionSidebar'
import { STTModal } from './STTModal/STTModal'
import { useExperienceSubmitStore } from '@/lib/stores/experienceSubmitStore'
import { shouldShowQuestions, generateQuestions } from '@/lib/utils/confidenceChecker'
import { Mic, Camera, Pencil, Paperclip } from 'lucide-react'

const mediaButtonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i + 1,
      duration: 0.3,
    },
  }),
}

export const Canvas = () => {
  const { charCount, extractedData, nextStep } = useExperienceSubmitStore()
  const [isSTTModalOpen, setIsSTTModalOpen] = useState(false)

  const handleContinue = () => {
    // Check if questions are needed
    const needsQuestions = shouldShowQuestions(extractedData)

    if (needsQuestions) {
      // Generate and store questions
      const questions = generateQuestions(extractedData)
      useExperienceSubmitStore.setState({
        needsQuestions: true,
        questions
      })
      nextStep() // Go to Screen 2
    } else {
      // Skip Screen 2, go directly to Screen 3 (Media)
      useExperienceSubmitStore.setState({
        needsQuestions: false,
        currentStep: 3 as 3
      })
    }
  }

  const mediaButtons = [
    { icon: <Mic className="w-5 h-5" />, label: 'Sprechen', action: 'stt' },
    { icon: <Camera className="w-5 h-5" />, label: 'Foto', action: 'photo' },
    { icon: <Pencil className="w-5 h-5" />, label: 'Skizze', action: 'sketch' },
    { icon: <Paperclip className="w-5 h-5" />, label: 'Datei', action: 'file' },
  ]

  const handleMediaButtonClick = (action: string) => {
    if (action === 'stt') {
      setIsSTTModalOpen(true)
    }
    // TODO: Implement other media actions
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Input Area */}
        <div className="relative">
          <MainInput />

          {/* Media Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex gap-3 mt-6"
          >
            {mediaButtons.map((button, i) => (
              <motion.button
                key={button.action}
                custom={i}
                variants={mediaButtonVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMediaButtonClick(button.action)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                {button.icon}
                <span className="text-sm font-medium text-gray-700">
                  {button.label}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Continue Button */}
          {charCount > 50 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-lg hover:bg-blue-600 transition-colors duration-200 ml-auto block"
            >
              Weiter →
            </motion.button>
          )}
        </div>
      </div>

      {/* Extraction Sidebar */}
      <ExtractionSidebar />

      {/* STT Modal */}
      <STTModal
        isOpen={isSTTModalOpen}
        onClose={() => setIsSTTModalOpen(false)}
      />
    </div>
  )
}
