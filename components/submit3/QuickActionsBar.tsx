'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mic, Image as ImageIcon, Edit3, MapPin, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { VoiceRecorder } from './VoiceRecorder'

interface QuickActionsBarProps {
  onVoiceTranscript: (transcript: string) => void
  onPhotoUpload?: (file: File) => void
  onSketchCreate?: (imageData: string) => void
  onLocationSelect?: (location: { name: string; coordinates: [number, number] }) => void
  compact?: boolean
}

export function QuickActionsBar({
  onVoiceTranscript,
  onPhotoUpload,
  onSketchCreate,
  onLocationSelect,
  compact = false,
}: QuickActionsBarProps) {
  const [showVoiceDialog, setShowVoiceDialog] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)

  const handleVoiceComplete = (transcript: string) => {
    onVoiceTranscript(transcript)
    setShowVoiceDialog(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onPhotoUpload) {
      onPhotoUpload(file)
      setShowPhotoDialog(false)
    }
  }

  const actions = [
    {
      icon: Mic,
      label: 'Voice',
      description: 'Record your story',
      gradient: 'from-red-500 to-pink-500',
      onClick: () => setShowVoiceDialog(true),
      available: true,
    },
    {
      icon: ImageIcon,
      label: 'Photo',
      description: 'Upload an image',
      gradient: 'from-blue-500 to-purple-500',
      onClick: () => setShowPhotoDialog(true),
      available: !!onPhotoUpload,
    },
    {
      icon: Edit3,
      label: 'Sketch',
      description: 'Draw something',
      gradient: 'from-green-500 to-teal-500',
      onClick: () => {
        // TODO: Implement sketch dialog
        alert('Sketch feature coming soon!')
      },
      available: !!onSketchCreate,
    },
    {
      icon: MapPin,
      label: 'Location',
      description: 'Add a place',
      gradient: 'from-orange-500 to-yellow-500',
      onClick: () => {
        // TODO: Implement location picker
        alert('Location picker coming soon!')
      },
      available: !!onLocationSelect,
    },
  ]

  // Compact version (icon-only)
  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          {actions.filter(a => a.available).map((action) => (
            <motion.div
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={action.onClick}
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
              >
                <action.icon className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Voice Dialog */}
        <Dialog open={showVoiceDialog} onOpenChange={setShowVoiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Voice Recording</DialogTitle>
            </DialogHeader>
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceComplete}
              onCancel={() => setShowVoiceDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Photo Dialog */}
        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-purple-50/50"
              >
                <Upload className="h-12 w-12 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Click to upload or drag & drop
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 10MB
                </span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Full version (with labels)
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.filter(a => a.available).map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={action.onClick}
              variant="outline"
              className="h-auto flex-col items-start p-4 w-full text-left hover:border-purple-500 transition-colors"
            >
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="font-semibold text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Voice Dialog */}
      <Dialog open={showVoiceDialog} onOpenChange={setShowVoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Voice Recording</DialogTitle>
          </DialogHeader>
          <VoiceRecorder
            onTranscriptionComplete={handleVoiceComplete}
            onCancel={() => setShowVoiceDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label
              htmlFor="photo-upload-full"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-purple-50/50"
            >
              <Upload className="h-12 w-12 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-purple-700">
                Click to upload or drag & drop
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP up to 10MB
              </span>
              <input
                id="photo-upload-full"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
