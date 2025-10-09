'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ConfidenceBadge } from './ConfidenceBadge'

interface ExtractionFieldProps {
  icon: React.ReactNode
  label: string
  field: string
  value: string
  confidence: number
  isEdited: boolean
  onEdit: (value: string) => void
}

export const ExtractionField = ({
  icon,
  label,
  field,
  value,
  confidence,
  isEdited,
  onEdit,
}: ExtractionFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = () => {
    onEdit(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
      onClick={() => !isEditing && handleEdit()}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1 text-gray-500">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {label}
            </span>
            <ConfidenceBadge
              confidence={confidence}
              isManuallyEdited={isEdited}
            />
          </div>

          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-900 break-words">
              {value || (
                <span className="text-gray-400 italic">Nicht erkannt</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit indicator on hover */}
      {!isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-blue-500">Klicken zum Bearbeiten</span>
        </div>
      )}
    </motion.div>
  )
}
