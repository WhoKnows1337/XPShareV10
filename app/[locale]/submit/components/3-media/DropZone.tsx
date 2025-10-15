'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileCheck } from 'lucide-react'

interface DropZoneProps {
  accept: string
  onFilesAdded: (files: File[]) => void
  maxFiles?: number
}

export const DropZone = ({ accept, onFilesAdded, maxFiles = 10 }: DropZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles)
    },
    [onFilesAdded]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles,
  })

  const getBorderColor = () => {
    if (isDragAccept) return 'border-green-500 bg-green-50'
    if (isDragReject) return 'border-red-500 bg-red-50'
    if (isDragActive) return 'border-blue-500 bg-blue-50'
    return 'border-gray-300 bg-white'
  }

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer hover:scale-[1.01] ${getBorderColor()}`}
    >
      <input {...getInputProps()} />

      <div className="text-center">
        <motion.div
          animate={{
            y: isDragActive ? -10 : 0,
            scale: isDragActive ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="inline-block mb-4"
        >
          {isDragAccept ? (
            <FileCheck className="w-16 h-16 text-green-500" />
          ) : (
            <Upload className="w-16 h-16 text-gray-400" />
          )}
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive ? (
            isDragAccept ? (
              'Datei(en) hier ablegen'
            ) : (
              'Dieser Dateityp wird nicht unterstützt'
            )
          ) : (
            'Dateien hier her ziehen'
          )}
        </h3>

        <p className="text-gray-600 mb-4">
          oder klicke zum Hochladen
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
          <span>Max. {maxFiles} Dateien</span>
          {accept && (
            <>
              <span>•</span>
              <span>{accept === 'image/*' ? 'Bilder' : accept === 'video/*' ? 'Videos' : 'Audio'}</span>
            </>
          )}
        </div>
      </div>

      {/* Animated Border Pulse on Drag */}
      {isDragActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-blue-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  )
}
