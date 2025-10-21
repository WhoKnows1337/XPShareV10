/**
 * File Upload Component
 *
 * Handles file selection and preview for multi-modal messages.
 * Supports drag-and-drop, image preview, and file validation.
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { validateFile, fileToDataURL } from '@/lib/attachments/upload'
import { toast } from 'sonner'

export interface FilePreview {
  file: File
  dataUrl?: string
  isValid: boolean
  error?: string
}

export interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function FileUpload({ onFilesChange, maxFiles = 5, disabled = false }: FileUploadProps) {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Process selected files
  const processFiles = useCallback(
    async (files: File[]) => {
      if (disabled) return

      setIsProcessing(true)

      try {
        // Check max files limit
        const remainingSlots = maxFiles - filePreviews.length
        const filesToProcess = files.slice(0, remainingSlots)

        if (files.length > remainingSlots) {
          toast.warning(`Only ${remainingSlots} more file(s) can be added`)
        }

        // Validate and create previews
        const newPreviews: FilePreview[] = await Promise.all(
          filesToProcess.map(async (file) => {
            const validation = validateFile(file)

            // Create data URL for image preview
            let dataUrl: string | undefined
            if (validation.valid && file.type.startsWith('image/')) {
              try {
                dataUrl = await fileToDataURL(file)
              } catch (error) {
                console.warn('Failed to create image preview:', error)
              }
            }

            return {
              file,
              dataUrl,
              isValid: validation.valid,
              error: validation.error,
            }
          })
        )

        // Show validation errors
        newPreviews.forEach((preview) => {
          if (!preview.isValid && preview.error) {
            toast.error(`${preview.file.name}: ${preview.error}`)
          }
        })

        // Only add valid files
        const validPreviews = newPreviews.filter((p) => p.isValid)
        const updatedPreviews = [...filePreviews, ...validPreviews]
        setFilePreviews(updatedPreviews)

        // Notify parent
        onFilesChange(updatedPreviews.map((p) => p.file))
      } finally {
        setIsProcessing(false)
      }
    },
    [filePreviews, maxFiles, disabled, onFilesChange]
  )

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      processFiles(files)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  // Remove file
  const removeFile = (index: number) => {
    const updatedPreviews = filePreviews.filter((_, i) => i !== index)
    setFilePreviews(updatedPreviews)
    onFilesChange(updatedPreviews.map((p) => p.file))
  }

  // Clear all files
  const clearAll = () => {
    setFilePreviews([])
    onFilesChange([])
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,text/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Processing files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {filePreviews.length >= maxFiles
                  ? `Maximum ${maxFiles} files`
                  : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Images (PNG, JPEG, WebP, GIF) and text files • Max 10MB each
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Previews */}
      {filePreviews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {filePreviews.length} file{filePreviews.length !== 1 ? 's' : ''} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={disabled}>
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filePreviews.map((preview, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Icon/Preview */}
                <div className="flex-shrink-0">
                  {preview.dataUrl ? (
                    <img
                      src={preview.dataUrl}
                      alt={preview.file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : preview.file.type.startsWith('image/') ? (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{preview.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {preview.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(preview.file.size)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${preview.file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact file attachment badges (for showing uploaded files in chat)
 */
export function FileAttachmentBadge({
  filename,
  mediaType,
  onRemove,
}: {
  filename: string
  mediaType: string
  onRemove?: () => void
}) {
  const isImage = mediaType.startsWith('image/')

  return (
    <Badge variant="secondary" className="flex items-center gap-1.5 pr-1">
      {isImage ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
      <span className="text-xs max-w-[150px] truncate">{filename}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 rounded-full hover:bg-background/50 p-0.5"
          aria-label={`Remove ${filename}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
