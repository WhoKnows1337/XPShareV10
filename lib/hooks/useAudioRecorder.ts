'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseAudioRecorderOptions {
  onTranscriptionComplete?: (text: string, language: string) => void
  onError?: (error: Error) => void
}

export interface UseAudioRecorderReturn {
  isRecording: boolean
  isTranscribing: boolean
  error: string | null
  detectedLanguage: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  cancelRecording: () => void
}

/**
 * useAudioRecorder - Record audio and transcribe with Whisper API
 *
 * Features:
 * - Browser MediaRecorder API integration
 * - Automatic transcription via /api/transcribe
 * - Automatic language detection
 * - Error handling & cleanup
 *
 * Usage:
 * ```tsx
 * const { isRecording, startRecording, stopRecording } = useAudioRecorder({
 *   onTranscriptionComplete: (text, lang) => setInput(text)
 * })
 * ```
 */
export function useAudioRecorder({
  onTranscriptionComplete,
  onError,
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        setIsRecording(false)

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // Transcribe
        await transcribeAudio(audioBlob)
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err: any) {
      const errorMessage =
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access.'
          : err.message || 'Failed to start recording'

      setError(errorMessage)
      onError?.(new Error(errorMessage))
    }
  }, [onError])

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [isRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    audioChunksRef.current = []
    setIsRecording(false)
    setIsTranscribing(false)
    setError(null)
  }, [])

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        setIsTranscribing(true)
        setError(null)

        // Create FormData
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        // Call transcription API
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Transcription failed')
        }

        const data = await response.json()

        setDetectedLanguage(data.language)
        onTranscriptionComplete?.(data.text, data.language)
      } catch (err: any) {
        const errorMessage = err.message || 'Transcription failed'
        setError(errorMessage)
        onError?.(new Error(errorMessage))
      } finally {
        setIsTranscribing(false)
      }
    },
    [onTranscriptionComplete, onError]
  )

  return {
    isRecording,
    isTranscribing,
    error,
    detectedLanguage,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
