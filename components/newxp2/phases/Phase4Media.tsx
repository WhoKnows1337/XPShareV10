'use client'

import { motion } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { ArrowRight, ArrowLeft, Upload, Image, Film, Mic2 } from 'lucide-react'
import { useCallback } from 'react'

export function Phase4Media() {
  const { mediaFiles, uploadMedia, removeMedia, nextPhase, previousPhase } = useNewXP2Store()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => uploadMedia(file))
  }, [uploadMedia])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => uploadMedia(file))
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12 max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Zeig uns mehr 📸
        </h1>
        <p className="text-white/60 text-lg">
          Lade Fotos, Videos oder Audio-Aufnahmen hoch
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        className="w-full max-w-2xl mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label
          htmlFor="media-upload"
          className="block border-2 border-dashed border-white/30 hover:border-white/50 rounded-2xl p-12 text-center cursor-pointer transition-colors bg-white/5 backdrop-blur-xl hover:bg-white/10"
        >
          <Upload className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Dateien hierher ziehen oder klicken</p>
          <p className="text-white/40 text-sm">PNG, JPG, MP4, MP3, WAV</p>
          <input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </motion.div>

      {/* Media Grid */}
      {mediaFiles.length > 0 && (
        <motion.div
          className="w-full max-w-2xl grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {mediaFiles.map((media) => (
            <motion.div
              key={media.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {media.type === 'photo' && (
                <img src={media.preview} alt="" className="w-full h-full object-cover" />
              )}
              {media.type === 'video' && (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-white/60" />
                </div>
              )}
              {media.type === 'audio' && (
                <div className="w-full h-full flex items-center justify-center">
                  <Mic2 className="w-12 h-12 text-white/60" />
                </div>
              )}

              {/* Progress */}
              {media.uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${media.uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeMedia(media.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={previousPhase}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </motion.button>

        <motion.button
          onClick={nextPhase}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mediaFiles.length > 0 ? 'Weiter' : 'Überspringen'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      <motion.p
        className="mt-4 text-white/40 text-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Optional: Medien machen deine Experience lebendiger
      </motion.p>
    </div>
  )
}
