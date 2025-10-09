'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, FileImage, FileVideo, FileAudio, Loader2 } from 'lucide-react'
import type { UploadedFile } from '@/lib/stores/experienceSubmitStore'

interface MediaPreviewProps {
  files: UploadedFile[]
  onRemove: (fileId: string) => void
}

export const MediaPreview = ({ files, onRemove }: MediaPreviewProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-6 h-6" />
      case 'video':
        return <FileVideo className="w-6 h-6" />
      case 'audio':
        return <FileAudio className="w-6 h-6" />
      default:
        return <FileImage className="w-6 h-6" />
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            {/* Preview Container */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
              {/* Image Preview */}
              {file.type === 'image' && file.preview && (
                <img
                  src={file.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Video Preview */}
              {file.type === 'video' && file.preview && (
                <video
                  src={file.preview}
                  className="w-full h-full object-cover"
                  muted
                />
              )}

              {/* Audio/Other Icon */}
              {(file.type === 'audio' || !file.preview) && (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {getIcon(file.type)}
                </div>
              )}

              {/* Upload Progress Overlay */}
              {file.uploadProgress < 100 && (
                <motion.div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">{file.uploadProgress}%</p>
                  </div>
                </motion.div>
              )}

              {/* Remove Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onRemove(file.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* File Name */}
            <p className="mt-2 text-sm text-gray-600 truncate px-1">
              {file.file.name}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
