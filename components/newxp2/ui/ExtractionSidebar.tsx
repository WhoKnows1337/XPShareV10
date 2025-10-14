'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface AttributeData {
  value: string
  confidence: number
  evidence: string
  isManuallyEdited?: boolean
}

interface ExtractionSidebarProps {
  extractedData: {
    title?: string
    category?: string
    summary?: string
    tags?: string[]
    attributes?: Record<string, AttributeData>
    missing_info?: string[]
  }
  onUpdate: (field: string, newValue: any, isAttribute?: boolean) => void
  className?: string
}

export function ExtractionSidebar({
  extractedData,
  onUpdate,
  className = '',
}: ExtractionSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'attributes'])
  )
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500 bg-green-500/10'
    if (confidence >= 0.6) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-orange-500 bg-orange-500/10'
  }

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getConfidenceColor(confidence)}`}>
        {percentage}%
      </span>
    )
  }

  const handleEdit = (field: string, currentValue: string, isAttribute: boolean = false) => {
    setEditingField(isAttribute ? `attr_${field}` : field)
    setEditValue(currentValue)
  }

  const handleSave = (field: string, isAttribute: boolean = false) => {
    onUpdate(field, editValue, isAttribute)
    setEditingField(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">KI-Extraktion</h3>
      </div>

      {/* Basic Fields Section */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
        >
          <span className="font-medium text-sm uppercase tracking-wide">Grunddaten</span>
          {expandedSections.has('basic') ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.has('basic') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Title */}
              {extractedData.title && (
                <FieldItem
                  label="Titel"
                  value={extractedData.title}
                  isEditing={editingField === 'title'}
                  editValue={editValue}
                  onEdit={() => handleEdit('title', extractedData.title || '')}
                  onSave={() => handleSave('title')}
                  onCancel={handleCancel}
                  onEditValueChange={setEditValue}
                />
              )}

              {/* Category */}
              {extractedData.category && (
                <FieldItem
                  label="Kategorie"
                  value={extractedData.category}
                  isEditing={editingField === 'category'}
                  editValue={editValue}
                  onEdit={() => handleEdit('category', extractedData.category || '')}
                  onSave={() => handleSave('category')}
                  onCancel={handleCancel}
                  onEditValueChange={setEditValue}
                />
              )}

              {/* Tags */}
              {extractedData.tags && extractedData.tags.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60 text-xs uppercase tracking-wide mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {extractedData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attributes Section */}
      {extractedData.attributes && Object.keys(extractedData.attributes).length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('attributes')}
            className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
          >
            <span className="font-medium text-sm uppercase tracking-wide">
              Attribute ({Object.keys(extractedData.attributes).length})
            </span>
            {expandedSections.has('attributes') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.has('attributes') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {Object.entries(extractedData.attributes).map(([key, attr]) => (
                  <AttributeItem
                    key={key}
                    attrKey={key}
                    attribute={attr}
                    isEditing={editingField === `attr_${key}`}
                    editValue={editValue}
                    onEdit={() => handleEdit(key, attr.value, true)}
                    onSave={() => handleSave(key, true)}
                    onCancel={handleCancel}
                    onEditValueChange={setEditValue}
                    getConfidenceBadge={getConfidenceBadge}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Missing Info Section */}
      {extractedData.missing_info && extractedData.missing_info.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('missing')}
            className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
          >
            <span className="font-medium text-sm uppercase tracking-wide">Fehlende Infos</span>
            {expandedSections.has('missing') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.has('missing') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                {extractedData.missing_info.map((info, idx) => (
                  <div key={idx} className="text-orange-400/80 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400/80 rounded-full"></span>
                    {info}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// Field Item Component (Basic Fields)
interface FieldItemProps {
  label: string
  value: string
  isEditing: boolean
  editValue: string
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValueChange: (value: string) => void
}

function FieldItem({
  label,
  value,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange,
}: FieldItemProps) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs uppercase tracking-wide">{label}</span>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Edit2 className="w-3 h-3 text-white/60" />
          </button>
        )}
      </div>

      {!isEditing ? (
        <p className="text-white text-sm font-medium">{value}</p>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/40"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave()
              if (e.key === 'Escape') onCancel()
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Speichern
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Attribute Item Component
interface AttributeItemProps {
  attrKey: string
  attribute: AttributeData
  isEditing: boolean
  editValue: string
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditValueChange: (value: string) => void
  getConfidenceBadge: (confidence: number) => JSX.Element
}

function AttributeItem({
  attrKey,
  attribute,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onEditValueChange,
  getConfidenceBadge,
}: AttributeItemProps) {
  const [showEvidence, setShowEvidence] = useState(false)

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs uppercase tracking-wide">{attrKey}</span>
        <div className="flex items-center gap-2">
          {getConfidenceBadge(attribute.confidence)}
          {!isEditing && (
            <button
              onClick={onEdit}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Edit2 className="w-3 h-3 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <>
          <p className="text-white text-sm font-medium">
            {attribute.value}
            {attribute.isManuallyEdited && (
              <span className="ml-2 text-xs text-green-400">(bearbeitet)</span>
            )}
          </p>
          {attribute.evidence && (
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showEvidence ? 'Evidenz ausblenden' : 'Evidenz anzeigen'}
            </button>
          )}
          {showEvidence && attribute.evidence && (
            <p className="text-white/60 text-xs italic border-l-2 border-blue-400/50 pl-2">
              "{attribute.evidence}"
            </p>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/40"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave()
              if (e.key === 'Escape') onCancel()
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs font-medium transition-colors"
            >
              <Check className="w-3 h-3" />
              Speichern
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
