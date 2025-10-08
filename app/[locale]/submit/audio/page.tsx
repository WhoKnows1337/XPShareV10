'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Loader2,
  ArrowLeft,
  Info,
} from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function AudioPage() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { setContent, setAudioBlob, setAudioTranscript } = useSubmissionStore()

  const MAX_RECORDING_TIME = 600 // 10 minutes in seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setAudioBlob(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Mikrofon-Zugriff verweigert. Bitte erlaube Mikrofon-Zugriff in deinem Browser.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resetRecording = () => {
    if (audioURL) URL.revokeObjectURL(audioURL)
    setAudioURL(null)
    setRecordingTime(0)
    setTranscript(null)
    setAudioBlob(null)
    audioChunksRef.current = []
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTranscribe = async () => {
    if (!audioURL) return

    setIsTranscribing(true)
    setError(null)

    try {
      // Get audio blob from store
      const { audioBlob } = useSubmissionStore.getState()
      if (!audioBlob) throw new Error('No audio blob')

      // Create FormData
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Call Whisper API
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const { transcript: transcribedText } = await response.json()

      // Store transcript locally and in store
      setTranscript(transcribedText)
      setAudioTranscript(transcribedText)
    } catch (err) {
      console.error('Transcription error:', err)
      setError('Transkription fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleContinue = () => {
    if (transcript) {
      setContent(transcript)
      router.push('/submit/compose')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">🎤 Erzähl deine Erfahrung</h1>
          <p className="text-muted-foreground">
            Sprich frei - wir transkribieren automatisch
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {!isRecording && !audioURL && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            💡 Tipp: Erzähl es so, wie du es einem Freund erzählen würdest. Alle Details sind
            hilfreich!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recording Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Waveform / Timer */}
            <div className="text-center space-y-4">
              <motion.div
                animate={isRecording && !isPaused ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`h-24 w-24 rounded-full flex items-center justify-center ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-pink-500'
                    : 'bg-gradient-to-br from-primary/20 to-primary/10'
                }`}
              >
                <Mic className="h-12 w-12 text-white" />
              </motion.div>

              <div className="text-4xl font-bold tabular-nums">
                {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
              </div>

              {isRecording && !isPaused && (
                <Badge variant="destructive" className="animate-pulse">
                  ● Aufnahme läuft
                </Badge>
              )}
              {isPaused && <Badge variant="secondary">⏸ Pausiert</Badge>}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!isRecording && !audioURL && (
                <Button size="lg" onClick={startRecording} className="h-16 px-8">
                  <Mic className="h-5 w-5 mr-2" />
                  Aufnahme starten
                </Button>
              )}

              {isRecording && !isPaused && (
                <>
                  <Button size="lg" variant="outline" onClick={pauseRecording} className="h-16">
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                  <Button size="lg" variant="destructive" onClick={stopRecording} className="h-16">
                    <Square className="h-5 w-5 mr-2" />
                    Stopp
                  </Button>
                </>
              )}

              {isPaused && (
                <>
                  <Button size="lg" onClick={resumeRecording} className="h-16">
                    <Mic className="h-5 w-5 mr-2" />
                    Fortsetzen
                  </Button>
                  <Button size="lg" variant="destructive" onClick={stopRecording} className="h-16">
                    <Square className="h-5 w-5 mr-2" />
                    Stopp
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playback & Transcribe */}
      {audioURL && !transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✓ Aufnahme beendet
                <Badge variant="secondary">{formatTime(recordingTime)}</Badge>
              </CardTitle>
              <CardDescription>
                Hör sie dir an oder transkribiere sie mit Whisper AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Audio Player */}
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Anhören'}
                </Button>

                <Button variant="outline" onClick={resetRecording}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Neu aufnehmen
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  size="lg"
                  className="w-full h-14"
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Transkribiere mit Whisper AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Transkribieren mit AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Transcript Result */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-500/20 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Transkript
                <Badge variant="secondary">Whisper AI</Badge>
              </CardTitle>
              <CardDescription>
                Deine Aufnahme wurde erfolgreich transkribiert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Transcript Text */}
              <div className="p-4 bg-background rounded-lg border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>

              {/* Audio Player */}
              <audio
                ref={audioRef}
                src={audioURL || ''}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={togglePlayPause} size="sm">
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Audio anhören'}
                </Button>

                <Button variant="outline" onClick={resetRecording} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Neu aufnehmen
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  size="lg"
                  className="w-full h-14"
                  onClick={handleContinue}
                >
                  Weiter zur Erfahrung →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
