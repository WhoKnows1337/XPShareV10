'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewXP2Store } from '@/lib/stores/newxp2Store'
import { PulsingOrb } from '../canvas/PulsingOrb'
import { Mic, Type, ArrowRight } from 'lucide-react'

export function Phase1Entry() {
  const {
    inputMode,
    setInputMode,
    rawText,
    setText,
    orbState,
    setOrbState,
    isRecording,
    startRecording,
    stopRecording,
    audioWaveform,
    setAudioWaveform,
    nextPhase,
    canProceed,
    triggerExtraction,
  } = useNewXP2Store()

  const [localText, setLocalText] = useState(rawText)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  // Auto-focus textarea on mount
  useEffect(() => {
    if (inputMode === 'text' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [inputMode])

  // Handle text change
  const handleTextChange = (value: string) => {
    setLocalText(value)
    setText(value)

    if (value.length >= 50 && orbState === 'idle') {
      setOrbState('thinking')
    }
  }

  // Start voice recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio context for waveform
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 64
      source.connect(analyserRef.current)

      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })

        // Send to transcription API
        const formData = new FormData()
        formData.append('audio', blob)

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            handleTextChange(data.text)
            setOrbState('celebrating')
            setTimeout(() => setOrbState('idle'), 2000)
          }
        } catch (error) {
          console.error('Transcription error:', error)
          setOrbState('idle')
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      startRecording()
      visualizeWaveform()
    } catch (error) {
      console.error('Recording error:', error)
      alert('Mikrofon-Zugriff verweigert')
    }
  }

  // Stop voice recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      stopRecording()

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }

  // Visualize waveform
  const visualizeWaveform = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const draw = () => {
      analyserRef.current!.getByteFrequencyData(dataArray)
      setAudioWaveform(Array.from(dataArray))
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  // Handle continue
  const handleContinue = () => {
    if (canProceed()) {
      triggerExtraction()
      // Auto-proceed happens in store after extraction
    }
  }

  const wordCount = localText.trim().split(/\s+/).filter(Boolean).length
  const charCount = localText.length

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Tell me what happened...
        </h1>
        <p className="text-white/60 text-lg">
          Schreibe oder erzähle uns deine Experience
        </p>
      </motion.div>

      {/* Pulsing Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="mb-12"
      >
        <PulsingOrb state={orbState} size={200} waveformData={audioWaveform} />
      </motion.div>

      {/* Input Mode Toggle */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            inputMode === 'text'
              ? 'bg-white text-gray-900 shadow-lg scale-110'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Type className="w-5 h-5" />
          <span>Text</span>
        </button>

        <div className="text-white/40 font-bold">oder</div>

        <button
          onClick={() => setInputMode('voice')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            inputMode === 'voice'
              ? 'bg-white text-gray-900 shadow-lg scale-110'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>Voice</span>
        </button>
      </motion.div>

      {/* Input Area */}
      <AnimatePresence mode="wait">
        {inputMode === 'text' ? (
          <motion.div
            key="text-input"
            className="w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={localText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Beginne zu schreiben... Es war eine Nacht wie jede andere, als..."
                className="w-full h-64 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 text-white placeholder-white/40 text-lg resize-none focus:outline-none focus:border-white/40 transition-colors"
                style={{
                  fontFamily: 'inherit',
                }}
              />

              {/* Stats */}
              <div className="absolute bottom-4 right-6 flex items-center gap-4 text-sm text-white/50">
                <span>{wordCount} Wörter</span>
                <span>·</span>
                <span>{charCount} Zeichen</span>
              </div>
            </div>

            {/* Helper Text */}
            {charCount < 50 && (
              <motion.p
                className="text-center text-white/40 text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Mindestens 50 Zeichen benötigt ({50 - charCount} verbleibend)
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="voice-input"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Record Button */}
            {!isRecording ? (
              <motion.button
                onClick={handleStartRecording}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-12 h-12 text-white" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleStopRecording}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.7)',
                    '0 0 0 20px rgba(239, 68, 68, 0)',
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-white rounded" />
              </motion.button>
            )}

            <p className="text-white/60 mt-6 text-center">
              {isRecording ? (
                <>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                  Aufnahme läuft... Tippe zum Stoppen
                </>
              ) : (
                'Tippe zum Starten'
              )}
            </p>

            {/* Transcribed Text Preview */}
            {localText && (
              <motion.div
                className="mt-8 max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-white/80 text-sm line-clamp-3">{localText}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button */}
      {mounted && (
        <AnimatePresence>
          {canProceed() && (
            <motion.button
              onClick={handleContinue}
              className="mt-8 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Weiter</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Skip to Text Hint (Voice Mode) */}
      {inputMode === 'voice' && !isRecording && !localText && (
        <motion.button
          onClick={() => setInputMode('text')}
          className="mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Lieber tippen? Wechsle zu Text
        </motion.button>
      )}
    </div>
  )
}
