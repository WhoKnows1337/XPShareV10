'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { EnrichedTextEditor } from './EnrichedTextEditor'
import { CardPreview } from './CardPreview'
import { SummaryEditor } from './SummaryEditor'
import { ProgressBar } from '../shared/ProgressBar'
import { NavigationButtons } from '../shared/NavigationButtons'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Sparkles, Eye, EyeOff, RotateCcw, Check, ChevronDown, Database } from 'lucide-react'

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

export const ReviewEnrich = () => {
  const {
    rawText,
    enrichedText,
    enrichedInsertions,
    enrichmentApproved,
    displayMode,
    summary,
    answers,
    currentStep,
    generateEnrichedText,
    approveEnrichment,
    rejectEnrichment,
    regenerateEnrichment,
    editEnrichedText,
    generateSummary,
    nextStep,
    prevStep,
  } = useSubmitStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [isStructuredDataOpen, setIsStructuredDataOpen] = useState(false)

  // Auto-generate enriched text on mount
  useEffect(() => {
    if (!enrichedText && rawText.length > 50) {
      setIsGenerating(true)
      generateEnrichedText().finally(() => {
        setIsGenerating(false)
        // Also generate summary
        generateSummary()
      })
    }
  }, [])

  const handleApprove = () => {
    approveEnrichment()
  }

  const handleReject = () => {
    rejectEnrichment()
    setShowOriginal(true)
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await regenerateEnrichment()
    setIsGenerating(false)
    setShowOriginal(false)
  }

  const handleContinue = () => {
    if (!enrichmentApproved && enrichedText) {
      approveEnrichment()
    }
    nextStep()
  }

  const currentText = showOriginal ? rawText : enrichedText || rawText

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Überprüfe deine Erfahrung
          </h1>
          <p className="text-gray-600">
            KI hat Details aus deinen Antworten natürlich integriert
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Enriched Text Editor */}
          <div className="space-y-6">
            {/* Section A: Enriched Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  ✨ Vollversion
                  <span className="text-sm font-normal text-gray-500">
                    (Was Leser sehen werden)
                  </span>
                </h2>

                {/* Original/Enriched Toggle */}
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {showOriginal ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>KI Version</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Original</span>
                    </>
                  )}
                </button>
              </div>

              {isGenerating ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600">KI integriert deine Details...</p>
                </div>
              ) : (
                <EnrichedTextEditor
                  text={currentText}
                  insertions={showOriginal ? [] : enrichedInsertions}
                  onChange={editEnrichedText}
                  isEditable={!showOriginal}
                />
              )}

              {/* Action Buttons */}
              {!isGenerating && enrichedText && !showOriginal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <button
                    onClick={handleApprove}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      enrichmentApproved
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                    <span>{enrichmentApproved ? 'Genehmigt' : 'Gefällt mir'}</span>
                  </button>

                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-all"
                    title="Neu generieren"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleReject}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-red-500 hover:bg-red-50 transition-all"
                    title="Original anzeigen"
                  >
                    <EyeOff className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Section C: Summary Editor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SummaryEditor />
            </motion.div>

            {/* Section D: Structured Data (Collapsed) */}
            {Object.keys(answers).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Collapsible.Root
                  open={isStructuredDataOpen}
                  onOpenChange={setIsStructuredDataOpen}
                >
                  <Collapsible.Trigger asChild>
                    <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Strukturierte Daten</span>
                        <span className="text-sm text-gray-500">
                          ({Object.keys(answers).length} Antworten)
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isStructuredDataOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      </motion.div>
                    </button>
                  </Collapsible.Trigger>

                  <Collapsible.Content>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
                    >
                      <div className="divide-y divide-gray-200">
                        {Object.entries(answers).map(([question, answer], index) => (
                          <div key={index} className="p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {question}
                            </p>
                            <p className="text-gray-900">{answer}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </motion.div>
            )}
          </div>

          {/* RIGHT: Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <CardPreview />
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-12">
          <NavigationButtons
            onBack={prevStep}
            onNext={handleContinue}
          />
        </div>
      </motion.div>
    </div>
  )
}
