'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Upload, X, FileText, Loader2, Check } from 'lucide-react'

export const PhotoUploader = () => {
  const { uploadedMedia, uploadMedia, removeMedia, requestOCR, applyOCRText } = useNewXPStore()
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      await uploadMedia(file)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await uploadMedia(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-12 transition-all
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Dateien hier ablegen
          </p>
          <p className="text-sm text-gray-500 mb-4">
            oder
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
            <span>Dateien auswählen</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-4">
            📷 Fotos · 🎥 Videos · 🎵 Audio · 📄 Dokumente
          </p>
        </div>
      </div>

      {/* Uploaded Media */}
      {uploadedMedia.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Hochgeladene Dateien ({uploadedMedia.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {uploadedMedia.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  onRemove={() => removeMedia(media.id)}
                  onRequestOCR={() => requestOCR(media.id)}
                  onApplyOCR={() => applyOCRText(media.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ========================================
// MEDIA CARD
// ========================================

const MediaCard = ({
  media,
  onRemove,
  onRequestOCR,
  onApplyOCR,
}: {
  media: any
  onRemove: () => void
  onRequestOCR: () => void
  onApplyOCR: () => void
}) => {
  const [showOCROptions, setShowOCROptions] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)

  const handleOCRRequest = async () => {
    setIsProcessingOCR(true)
    await onRequestOCR()
    setIsProcessingOCR(false)
    setShowOCROptions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
    >
      {/* Preview */}
      {media.type === 'photo' && (
        <img src={media.preview} alt="" className="w-full h-full object-cover" />
      )}
      {media.type === 'video' && (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <span className="text-4xl">🎥</span>
        </div>
      )}
      {media.type === 'audio' && (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <span className="text-4xl">🎵</span>
        </div>
      )}
      {media.type === 'document' && (
        <div className="w-full h-full flex items-center justify-center bg-blue-50">
          <div className="text-center">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Dokument</p>
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Upload Progress */}
      {media.uploadProgress < 100 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">{media.uploadProgress}%</p>
          </div>
        </div>
      )}

      {/* OCR Available Badge */}
      {media.ocrAvailable && !media.ocrText && media.uploadProgress === 100 && (
        <button
          onClick={() => setShowOCROptions(true)}
          className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          📄 Text erkennen (OCR)
        </button>
      )}

      {/* OCR Text Available */}
      {media.ocrText && (
        <button
          onClick={onApplyOCR}
          className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
        >
          <Check className="w-3 h-3" />
          Text erkannt - Hinzufügen
        </button>
      )}

      {/* OCR Options Modal */}
      <AnimatePresence>
        {showOCROptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowOCROptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-4 space-y-3 w-full"
            >
              <p className="text-sm font-medium text-gray-900 text-center">
                Text in Bild erkannt
              </p>
              <p className="text-xs text-gray-600 text-center">
                Möchtest du den Text automatisch erkennen?
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleOCRRequest}
                  disabled={isProcessingOCR}
                  className="w-full px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingOCR ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Erkenne...
                    </>
                  ) : (
                    '📝 Text erkennen (OCR)'
                  )}
                </button>
                <button
                  onClick={() => setShowOCROptions(false)}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  📸 Nur als Bild anhängen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
