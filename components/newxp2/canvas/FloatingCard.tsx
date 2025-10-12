'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Check, X } from 'lucide-react'
import { ExtractedData } from '@/lib/stores/newxp2Store'

interface FloatingCardProps {
  id: string
  field: keyof ExtractedData
  value: any
  confidence: number
  position: { x: number; y: number }
  isNew: boolean
  onUpdate: (id: string, newValue: any) => void
  onRemove: (id: string) => void
}

export function FloatingCard({
  id,
  field,
  value,
  confidence,
  position,
  isNew,
  onUpdate,
  onRemove,
}: FloatingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(Array.isArray(value) ? value.join(', ') : value)

  const getFieldLabel = (field: keyof ExtractedData): string => {
    const labels: Record<keyof ExtractedData, string> = {
      title: 'Titel',
      category: 'Kategorie',
      location: 'Ort',
      date: 'Datum',
      time: 'Zeit',
      tags: 'Tags',
      size: 'Größe',
      duration: 'Dauer',
      emotions: 'Emotionen',
    }
    return labels[field]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'from-green-500 to-emerald-500'
    if (confidence >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  const handleSave = () => {
    const newValue = field === 'tags' || field === 'emotions'
      ? editValue.split(',').map((v: string) => v.trim()).filter(Boolean)
      : editValue
    onUpdate(id, newValue)
    setIsEditing(false)
  }

  const displayValue = Array.isArray(value) ? value.join(', ') : value

  return (
    <motion.div
      className="absolute"
      style={{ left: `calc(50% + ${position.x}px)`, top: `calc(50% + ${position.y}px)` }}
      initial={{ opacity: 0, scale: 0, rotate: -10 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: isNew ? [0, -10, 0] : 0,
      }}
      exit={{ opacity: 0, scale: 0, rotate: 10 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 min-w-[200px] max-w-[300px] shadow-2xl"
        style={{
          boxShadow: isNew
            ? '0 0 40px rgba(99, 102, 241, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)'
            : '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs uppercase tracking-wide font-semibold">
            {getFieldLabel(field)}
          </span>

          {/* Confidence Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${getConfidenceColor(confidence)}`}
          >
            <span className="text-white text-xs font-bold">{confidence}%</span>
          </div>
        </div>

        {/* Value */}
        {!isEditing ? (
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-medium text-sm flex-1 line-clamp-2">
              {displayValue || <span className="text-white/40 italic">Leer</span>}
            </p>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setIsEditing(false)
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs font-medium transition-colors"
              >
                <Check className="w-3 h-3" />
                Speichern
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-medium transition-colors"
              >
                <X className="w-3 h-3" />
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Glow effect when new */}
        {isNew && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  )
}
