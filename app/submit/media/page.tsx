'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Image as ImageIcon, Film, X, FileAudio } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'audio'
  url: string
  file: File
}

export default function MediaPage() {
  const router = useRouter()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)

    try {
      const newFiles: MediaFile[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const type = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
          ? 'audio'
          : null

        if (!type) continue

        // Create preview URL
        const url = URL.createObjectURL(file)

        newFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type,
          url,
          file,
        })
      }

      setMediaFiles([...mediaFiles, ...newFiles])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (id: string) => {
    const file = mediaFiles.find(f => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.url)
    }
    setMediaFiles(mediaFiles.filter(f => f.id !== id))
  }

  const handleContinue = () => {
    // Save media references to localStorage (in production, upload to Supabase Storage)
    const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')
    localStorage.setItem(
      'experience_draft',
      JSON.stringify({
        ...draft,
        mediaFiles: mediaFiles.map(f => ({ id: f.id, name: f.name, type: f.type })),
      })
    )
    router.push('/submit/final')
  }

  const handleSkip = () => {
    router.push('/submit/final')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'video':
        return <Film className="h-5 w-5" />
      case 'audio':
        return <FileAudio className="h-5 w-5" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Media Upload</h1>
        <p className="text-muted-foreground">
          Add photos, videos, or audio recordings to support your experience
        </p>
      </div>

      <Alert className="mb-6">
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Supported formats: Images (JPG, PNG, GIF), Videos (MP4, MOV), Audio (MP3, WAV)
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-500" />
            Upload Media
          </CardTitle>
          <CardDescription>
            Add visual or audio evidence to make your experience more vivid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              id="media-upload"
              className="hidden"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                Images, videos, or audio files
              </p>
            </label>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  className="relative group rounded-lg overflow-hidden border bg-muted"
                >
                  {media.type === 'image' && (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  {media.type === 'video' && (
                    <video
                      src={media.url}
                      className="w-full h-40 object-cover"
                      controls
                    />
                  )}
                  {media.type === 'audio' && (
                    <div className="h-40 flex items-center justify-center">
                      <FileAudio className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(media.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>

                  <div className="p-2 bg-background">
                    <div className="flex items-center gap-2">
                      {getIcon(media.type)}
                      <span className="text-xs truncate">{media.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mediaFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No media files uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          Skip This Step
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Continue to Review →
        </Button>
      </div>
    </div>
  )
}
