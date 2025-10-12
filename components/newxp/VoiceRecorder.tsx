'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNewXPStore } from '@/lib/stores/newxpStore'
import { Mic, Square, Play, Pause, Loader2 } from 'lucide-react'

export const VoiceRecorder = () => {
  const { isRecording, isPaused, startRecording, pauseRecording, stopRecording, appendText } = useNewXPStore()
  const [duration, setDuration] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [audioData, setAudioData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio analyzer
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Start waveform
      updateWaveform()

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribe(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      startRecording()
      startTimer()
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Mikrofon-Zugriff fehlgeschlagen')
    }
  }

  const updateWaveform = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const normalized = Array.from(dataArray).map((value) => value / 255)
    setAudioData(normalized)

    animationFrameRef.current = requestAnimationFrame(updateWaveform)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }

  const handlePause = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      pauseRecording()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleResume = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      startRecording()
      startTimer()
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      stopRecording()
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      setDuration(0)
    }
  }

  const transcribe = async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Transcription failed')

      const data = await response.json()
      appendText(data.text)
      setLiveTranscript('')
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Transkription fehlgeschlagen')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isTranscribing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600">Transkribiere Audio...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Waveform */}
      <Waveform audioData={audioData} isRecording={isRecording} isPaused={isPaused} />

      {/* Timer */}
      {isRecording && (
        <div className="text-center">
          <span className="text-3xl font-mono font-bold text-gray-900">
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white rounded-full font-medium shadow-lg hover:bg-red-600 transition-colors"
          >
            <Mic className="w-6 h-6" />
            <span>Aufnahme starten</span>
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isPaused ? handleResume : handlePause}
              className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            >
              {isPaused ? (
                <Play className="w-6 h-6 text-gray-700" />
              ) : (
                <Pause className="w-6 h-6 text-gray-700" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStop}
              className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              <Square className="w-6 h-6 text-white fill-current" />
            </motion.button>
          </>
        )}
      </div>

      {/* Live Transcript */}
      {liveTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm font-medium text-blue-900 mb-1">Live-Transkription:</p>
          <p className="text-gray-700">{liveTranscript}</p>
        </motion.div>
      )}

      {/* Hint */}
      {!isRecording && (
        <p className="text-center text-sm text-gray-500">
          Sprich einfach los - KI transkribiert deine Stimme in Text
        </p>
      )}
    </motion.div>
  )
}

// ========================================
// WAVEFORM
// ========================================

const Waveform = ({
  audioData,
  isRecording,
  isPaused,
}: {
  audioData: number[]
  isRecording: boolean
  isPaused: boolean
}) => {
  const bars = 64

  return (
    <div className="flex items-center justify-center gap-1 h-32 bg-gray-50 rounded-lg px-4">
      {Array.from({ length: bars }).map((_, i) => {
        const value = audioData[i] || 0
        const height = isRecording && !isPaused ? Math.max(4, value * 100) : 4

        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${
              isRecording && !isPaused ? 'bg-red-500' : 'bg-gray-300'
            }`}
            animate={{
              height: `${height}%`,
            }}
            transition={{
              duration: 0.1,
            }}
          />
        )
      })}
    </div>
  )
}
