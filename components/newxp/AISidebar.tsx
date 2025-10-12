'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Sparkles, Edit2, Check, AlertCircle, Users, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { WitnessManager } from './WitnessManager'

export const AISidebar = () => {
  const { extractedData, isExtracting, completionPercentage, confirmedWitnesses, uploadedMedia } =
    useNewXPStore()

  return (
    <div className="sticky top-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-bold text-gray-900">KI-Assistent</h2>
      </div>

      {/* Completion Bar */}
      <CompletionBar percentage={completionPercentage} />

      {/* Extracting Loader */}
      {isExtracting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Analysiere...</span>
        </motion.div>
      )}

      {/* Extracted Fields */}
      <div className="space-y-3">
        <ExtractedField
          icon="📁"
          label="Kategorie"
          field="category"
          value={extractedData.category.value}
          confidence={extractedData.category.confidence}
          isEdited={extractedData.category.isManuallyEdited}
        />
        <ExtractedField
          icon="📍"
          label="Ort"
          field="location"
          value={extractedData.location.value}
          confidence={extractedData.location.confidence}
          isEdited={extractedData.location.isManuallyEdited}
        />
        <ExtractedField
          icon="📅"
          label="Datum"
          field="date"
          value={extractedData.date.value}
          confidence={extractedData.date.confidence}
          isEdited={extractedData.date.isManuallyEdited}
        />
        <ExtractedField
          icon="🕐"
          label="Uhrzeit"
          field="time"
          value={extractedData.time.value}
          confidence={extractedData.time.confidence}
          isEdited={extractedData.time.isManuallyEdited}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Witnesses Section */}
      <WitnessManager />

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Media Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Medien
          </h3>
          <span className="text-xs text-gray-500">
            {uploadedMedia.length} {uploadedMedia.length === 1 ? 'Datei' : 'Dateien'}
          </span>
        </div>
        {uploadedMedia.length === 0 ? (
          <p className="text-xs text-gray-500">Noch keine Medien hochgeladen</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {uploadedMedia.slice(0, 6).map((media) => (
              <div
                key={media.id}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                {media.type === 'photo' && (
                  <img src={media.preview} alt="" className="w-full h-full object-cover" />
                )}
                {media.type !== 'photo' && (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {media.type === 'video' ? '🎥' : media.type === 'audio' ? '🎵' : '📄'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ========================================
// COMPLETION BAR
// ========================================

const CompletionBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Vollständigkeit</span>
        <span className="text-lg font-bold text-blue-600">{percentage}%</span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {percentage === 100 && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-green-600 font-medium mt-2"
        >
          ✨ Perfekt! Bereit zum Veröffentlichen
        </motion.p>
      )}
    </div>
  )
}

// ========================================
// EXTRACTED FIELD
// ========================================

const ExtractedField = ({
  icon,
  label,
  field,
  value,
  confidence,
  isEdited,
}: {
  icon: string
  label: string
  field: string
  value: string
  confidence: number
  isEdited: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const { updateExtractedField } = useNewXPStore()

  const handleSave = () => {
    updateExtractedField(field as any, editValue, true)
    setIsEditing(false)
  }

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = () => {
    if (confidence >= 80) return <Check className="w-3 h-3" />
    if (confidence >= 60) return <AlertCircle className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setEditValue(value)
              setIsEditing(true)
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Speichern
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <>
          {value ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-900">{value}</p>
              {!isEdited && (
                <div
                  className={`flex items-center gap-1 text-xs ${getConfidenceColor()}`}
                  title={`${confidence}% Konfidenz`}
                >
                  {getConfidenceIcon()}
                  <span>{confidence}%</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              + Hinzufügen
            </button>
          )}
        </>
      )}
    </div>
  )
}
