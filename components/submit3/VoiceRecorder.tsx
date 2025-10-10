'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Square, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcript: string) => void
  onCancel: () => void
}

export function VoiceRecorder({ onTranscriptionComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Setup Audio Analysis for Waveform
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Start Waveform Animation
      drawWaveform()

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start Timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  // Draw Waveform
  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      // Update waveform data (downsample to 50 bars)
      const step = Math.floor(bufferLength / 50)
      const newWaveform = []
      for (let i = 0; i < 50; i++) {
        const value = dataArray[i * step]
        newWaveform.push(value / 255) // Normalize to 0-1
      }
      setWaveformData(newWaveform)

      // Draw on canvas
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = '#8B5CF6'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }

  // Transcribe Audio
  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()

      if (data.text) {
        onTranscriptionComplete(data.text)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Format Duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-purple-500" />
          Voice Recording
        </CardTitle>
        <CardDescription>
          Record your experience using your voice (max 2 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Waveform Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full h-30 rounded-lg bg-purple-50 border border-purple-200"
          />

          {/* Alternative: Bar Visualization */}
          <div className="flex items-center justify-center gap-1 h-24 mt-4">
            {waveformData.map((height, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-t from-purple-600 to-pink-500 rounded-full"
                style={{
                  width: '8px',
                  height: isRecording ? `${Math.max(height * 100, 4)}%` : '4%',
                }}
                animate={{
                  height: isRecording ? `${Math.max(height * 100, 4)}%` : '4%',
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-purple-600">
            {formatDuration(duration)}
          </div>
          {duration >= 120 && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Maximum duration reached
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <AnimatePresence mode="wait">
            {!isRecording && !audioBlob && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1"
              >
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              </motion.div>
            )}

            {isRecording && (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1"
              >
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="w-full"
                  disabled={duration >= 120}
                >
                  <Square className="mr-2 h-5 w-5" />
                  {duration >= 120 ? 'Auto-Stopped' : 'Stop Recording'}
                </Button>
              </motion.div>
            )}

            {audioBlob && !isTranscribing && (
              <motion.div
                key="transcribe"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex gap-3"
              >
                <Button
                  onClick={handleTranscribe}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Transcribe
                </Button>
                <Button
                  onClick={() => {
                    setAudioBlob(null)
                    setDuration(0)
                  }}
                  size="lg"
                  variant="outline"
                >
                  Re-record
                </Button>
              </motion.div>
            )}

            {isTranscribing && (
              <motion.div
                key="transcribing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1"
              >
                <Button size="lg" disabled className="w-full">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transcribing...
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={onCancel}
            size="lg"
            variant="ghost"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            className="flex items-center justify-center gap-2 text-red-600"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-sm font-medium">Recording in progress...</span>
          </motion.div>
        )}

        {/* Tip */}
        <div className="text-xs text-muted-foreground text-center">
          💡 Tip: Speak clearly and describe your experience in detail. The AI will transcribe and analyze it automatically.
        </div>
      </CardContent>
    </Card>
  )
}
