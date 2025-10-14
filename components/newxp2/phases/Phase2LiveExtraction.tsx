'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { FloatingCard } from '../canvas/FloatingCard'
import { ExtractionSidebar } from '../ui/ExtractionSidebar'
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

export function Phase2LiveExtraction() {
  const {
    floatingCards,
    isExtracting,
    orbState,
    nextPhase,
    previousPhase,
    updateCard,
    removeFloatingCard,
    rawText,
    extractedData,
    updateAttribute,
    updateBasicField,
  } = useNewXP2Store()

  const hasEnoughData = floatingCards.filter(c => c.confidence > 60).length >= 2 ||
                        (extractedData.attributes && Object.keys(extractedData.attributes).length > 0)

  const handleUpdate = (field: string, newValue: any, isAttribute: boolean = false) => {
    if (isAttribute) {
      updateAttribute(field, newValue)
    } else {
      updateBasicField(field as any, newValue)
    }
  }

  return (
    <div className="relative w-full min-h-screen flex items-start justify-center p-6 gap-6">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl flex flex-col items-center">
        {/* Header */}
        <motion.div
          className="text-center mb-12 max-w-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Die Magie geschieht ✨
          </h1>
          <p className="text-white/60 text-lg">
            Wir erkennen automatisch wichtige Details aus deiner Story
          </p>
        </motion.div>

        {/* Text Preview */}
        <motion.div
          className="mb-12 max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
            {rawText}
          </p>
        </motion.div>

        {/* Floating Cards Container */}
        <div className="relative w-full max-w-4xl h-[400px] mb-12">
        {isExtracting && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Analysiere deine Experience...</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {floatingCards.map((card) => (
            <FloatingCard
              key={card.id}
              id={card.id}
              field={card.field}
              value={card.value}
              confidence={card.confidence}
              position={card.position}
              isNew={card.isNew}
              onUpdate={updateCard}
              onRemove={removeFloatingCard}
            />
          ))}
        </AnimatePresence>

        {!isExtracting && floatingCards.length === 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/40 text-center">
              Keine Daten erkannt. Bitte füge mehr Details zu deiner Story hinzu.
            </p>
          </motion.div>
        )}
      </div>

      {/* Help Text */}
      {floatingCards.length > 0 && (
        <motion.p
          className="text-white/40 text-sm text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 Ziehe die Karten um sie zu verschieben, klicke zum Bearbeiten
        </motion.p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={previousPhase}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </motion.button>

        {hasEnoughData && (
          <motion.button
            onClick={nextPhase}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Weiter
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

        {/* Progress Hint */}
        {!hasEnoughData && !isExtracting && floatingCards.length > 0 && (
          <motion.p
            className="mt-4 text-white/40 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Mindestens 2 Felder mit hoher Genauigkeit benötigt
          </motion.p>
        )}
      </div>

      {/* Extraction Sidebar */}
      {(extractedData.attributes || extractedData.title || extractedData.category) && (
        <ExtractionSidebar
          extractedData={extractedData}
          onUpdate={handleUpdate}
          className="w-96 sticky top-6"
        />
      )}
    </div>
  )
}
