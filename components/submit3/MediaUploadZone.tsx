'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, Video, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video' | 'audio' | 'other'
  size: number
}

interface MediaUploadZoneProps {
  files: MediaFile[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  maxFiles?: number
  maxSizeMB?: number
}

export function MediaUploadZone({
  files,
  onAdd,
  onRemove,
  maxFiles = 10,
  maxSizeMB = 50,
}: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(file => {
      const sizeMB = file.size / (1024 * 1024)
      return sizeMB <= maxSizeMB
    })

    if (validFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    onAdd(validFiles)
  }, [files.length, maxFiles, maxSizeMB, onAdd])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter(file => {
      const sizeMB = file.size / (1024 * 1024)
      return sizeMB <= maxSizeMB
    })

    if (validFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    onAdd(validFiles)
  }

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-5 w-5" />
    if (type === 'video') return <Video className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileInput}
          disabled={files.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />

        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-900">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Images, videos, audio • Max {maxSizeMB}MB per file • Up to {maxFiles} files
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Uploaded Files ({files.length}/{maxFiles})
            </h3>
          </div>

          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Preview */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {file.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(file.id)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
