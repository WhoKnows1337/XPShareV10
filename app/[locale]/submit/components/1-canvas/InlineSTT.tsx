'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Waveform } from './STTModal/Waveform'
import { Controls } from './STTModal/Controls'
import { useSubmitStore } from '@/lib/stores/submitStore'
import { Loader2 } from 'lucide-react'

interface InlineSTTProps {
  onClose: () => void
}

export const InlineSTT = ({ onClose }: InlineSTTProps) => {
  const { rawText, setTextTypewriter } = useSubmitStore()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioData, setAudioData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio analyzer for waveform
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Start waveform visualization
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
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      startTimer()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Mikrofon-Zugriff fehlgeschlagen. Bitte erlauben Sie den Zugriff.')
    }
  }

  const updateWaveform = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Convert to 0-1 range for visualization
    const normalized = Array.from(dataArray).map((value) => value / 255)
    setAudioData(normalized)

    animationFrameRef.current = requestAnimationFrame(updateWaveform)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      stopTimer()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimer()
      updateWaveform()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      stopTimer()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
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

      // Append text with typewriter animation
      const newText = rawText ? rawText + ' ' + data.text : data.text
      setTextTypewriter(newText)

      // Close inline STT after successful transcription
      onClose()
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Fehler bei der Transkription. Bitte versuchen Sie es erneut.')
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-6 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-lg"
      >
        {isTranscribing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Transkribiere Audio...</p>
          </div>
        ) : (
          <>
            {/* Waveform */}
            <div className="mb-6">
              <Waveform
                audioData={audioData}
                isRecording={isRecording}
                isPaused={isPaused}
              />
            </div>

            {/* Controls */}
            <Controls
              isRecording={isRecording}
              isPaused={isPaused}
              onStart={startRecording}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
              duration={formatTime(duration)}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
