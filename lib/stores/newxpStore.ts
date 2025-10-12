import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ========================================
// TYPES
// ========================================

export type InputMode = 'text' | 'voice' | 'photo'

export interface ExtractedField<T = string> {
  value: T
  confidence: number
  isManuallyEdited: boolean
}

export interface ExtractedData {
  title: ExtractedField
  location: ExtractedField
  date: ExtractedField
  time: ExtractedField
  tags: ExtractedField<string[]>
  category: ExtractedField
  size: ExtractedField
  duration: ExtractedField
  emotions: ExtractedField<string[]>
}

export interface DetectedWitness {
  name: string
  detectedFrom: 'text' | 'manual'
  position: number // Position im Text wo erkannt
  confirmed: boolean
}

export interface Witness {
  id: string
  name: string
  email?: string
  username?: string
  avatar?: string
  inviteType: 'platform' | 'email' | 'link'
  status: 'pending' | 'confirmed'
}

export interface ConversationalQuestion {
  id: string
  field: string
  question: string
  type: 'text' | 'choice' | 'chips'
  options?: string[]
  context: string // Warum diese Frage?
  priority: 'high' | 'medium' | 'low'
  canSkip: boolean
}

export interface UploadedMedia {
  id: string
  type: 'photo' | 'video' | 'audio' | 'document'
  file: File
  preview: string
  url?: string
  ocrAvailable?: boolean
  ocrText?: string
  uploadProgress: number
}

export interface InviteLink {
  id: string
  url: string
  expiresAt: Date
  createdAt: Date
}

// ========================================
// STORE INTERFACE
// ========================================

export interface NewXPStore {
  // ========================================
  // INPUT STATE
  // ========================================
  inputMode: InputMode
  rawText: string
  charCount: number
  wordCount: number
  isTypewriting: boolean
  typewriterText: string

  // ========================================
  // VOICE STATE
  // ========================================
  isRecording: boolean
  isPaused: boolean
  recordingDuration: number
  audioData: number[]

  // ========================================
  // AI EXTRACTION
  // ========================================
  extractedData: ExtractedData
  isExtracting: boolean
  lastExtractionTime: Date | null
  completionPercentage: number

  // ========================================
  // WITNESSES
  // ========================================
  detectedWitnesses: DetectedWitness[]
  confirmedWitnesses: Witness[]
  inviteLinks: InviteLink[]

  // ========================================
  // MEDIA
  // ========================================
  uploadedMedia: UploadedMedia[]

  // ========================================
  // CONVERSATIONAL PROMPTS
  // ========================================
  activeQuestions: ConversationalQuestion[]
  answeredQuestions: Record<string, any>
  currentPromptIndex: number

  // ========================================
  // PRIVACY & PUBLISH
  // ========================================
  privacyLevel: 'public' | 'anonymous' | 'private'
  isPublishing: boolean
  publishedId: string | null

  // ========================================
  // UI STATE
  // ========================================
  showPreview: boolean
  xpEarned: number
  showXPToast: boolean

  // ========================================
  // ACTIONS
  // ========================================

  // Input
  setInputMode: (mode: InputMode) => void
  setText: (text: string) => void
  setTextTypewriter: (text: string) => void
  appendText: (text: string) => void

  // Voice
  startRecording: () => void
  pauseRecording: () => void
  stopRecording: () => void
  setAudioData: (data: number[]) => void

  // AI Extraction
  triggerExtraction: () => Promise<void>
  updateExtractedField: (field: keyof ExtractedData, value: any, manual?: boolean) => void
  calculateCompletion: () => void

  // Witnesses
  detectWitnessesInText: (text: string) => void
  confirmWitness: (name: string) => void
  addWitness: (witness: Witness) => void
  removeWitness: (id: string) => void
  generateInviteLink: () => Promise<string>

  // Media
  uploadMedia: (file: File) => Promise<void>
  removeMedia: (id: string) => void
  requestOCR: (mediaId: string) => Promise<void>
  applyOCRText: (mediaId: string) => void

  // Questions
  generateQuestions: () => Promise<void>
  answerQuestion: (questionId: string, answer: any) => void
  skipQuestion: (questionId: string) => void
  dismissQuestion: (questionId: string) => void

  // Privacy & Publish
  setPrivacy: (level: 'public' | 'anonymous' | 'private') => void
  togglePreview: () => void
  publish: () => Promise<void>

  // Gamification
  addXP: (amount: number, reason: string) => void

  // Utilities
  reset: () => void
}

// ========================================
// INITIAL STATE
// ========================================

// Debounce timer for extraction
let extractionTimer: NodeJS.Timeout | null = null

const initialState = {
  // Input
  inputMode: 'text' as InputMode,
  rawText: '',
  charCount: 0,
  wordCount: 0,
  isTypewriting: false,
  typewriterText: '',

  // Voice
  isRecording: false,
  isPaused: false,
  recordingDuration: 0,
  audioData: [] as number[],

  // Extraction
  extractedData: {
    title: { value: '', confidence: 0, isManuallyEdited: false },
    location: { value: '', confidence: 0, isManuallyEdited: false },
    date: { value: '', confidence: 0, isManuallyEdited: false },
    time: { value: '', confidence: 0, isManuallyEdited: false },
    tags: { value: [] as string[], confidence: 0, isManuallyEdited: false },
    category: { value: '', confidence: 0, isManuallyEdited: false },
    size: { value: '', confidence: 0, isManuallyEdited: false },
    duration: { value: '', confidence: 0, isManuallyEdited: false },
    emotions: { value: [] as string[], confidence: 0, isManuallyEdited: false },
  },
  isExtracting: false,
  lastExtractionTime: null,
  completionPercentage: 0,

  // Witnesses
  detectedWitnesses: [] as DetectedWitness[],
  confirmedWitnesses: [] as Witness[],
  inviteLinks: [] as InviteLink[],

  // Media
  uploadedMedia: [] as UploadedMedia[],

  // Questions
  activeQuestions: [] as ConversationalQuestion[],
  answeredQuestions: {} as Record<string, any>,
  currentPromptIndex: 0,

  // Privacy
  privacyLevel: 'anonymous' as 'public' | 'anonymous' | 'private',
  isPublishing: false,
  publishedId: null,

  // UI
  showPreview: false,
  xpEarned: 0,
  showXPToast: false,
}

// ========================================
// STORE
// ========================================

export const useNewXPStore = create<NewXPStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========================================
        // INPUT ACTIONS
        // ========================================
        setInputMode: (mode) => set({ inputMode: mode }),

        setText: (text) => {
          const wordCount = text.trim().split(/\s+/).filter(Boolean).length
          const charCount = text.length

          set({
            rawText: text,
            wordCount,
            charCount,
          })

          // Debounced auto-trigger extraction (wait 1.5s after last keystroke)
          if (extractionTimer) {
            clearTimeout(extractionTimer)
          }

          if (charCount > 50) {
            console.log('🔍 Scheduling extraction in 1.5s...')
            extractionTimer = setTimeout(() => {
              console.log('🚀 Triggering extraction now!')
              get().triggerExtraction()
            }, 1500)
          }

          // Auto-detect witnesses (no debounce needed)
          if (charCount > 20) {
            get().detectWitnessesInText(text)
          }
        },

        setTextTypewriter: (text) => {
          set({
            isTypewriting: true,
            typewriterText: text,
          })
        },

        appendText: (text) => {
          const current = get().rawText
          const newText = current ? current + ' ' + text : text
          get().setText(newText)
        },

        // ========================================
        // VOICE ACTIONS
        // ========================================
        startRecording: () => set({ isRecording: true, isPaused: false }),
        pauseRecording: () => set({ isPaused: true }),
        stopRecording: () => set({ isRecording: false, isPaused: false, recordingDuration: 0 }),
        setAudioData: (data) => set({ audioData: data }),

        // ========================================
        // AI EXTRACTION
        // ========================================
        triggerExtraction: async () => {
          const { rawText, isExtracting } = get()

          if (isExtracting || rawText.length < 50) {
            console.log('⏸️ Extraction skipped:', { isExtracting, length: rawText.length })
            return
          }

          console.log('✨ Starting AI extraction for', rawText.length, 'characters...')
          set({ isExtracting: true })

          try {
            const response = await fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: rawText }),
            })

            if (!response.ok) {
              console.error('❌ API returned', response.status)
              throw new Error('Extraction failed')
            }

            const data = await response.json()
            console.log('✅ Extraction successful:', data)

            set({
              extractedData: {
                title: { ...data.title, isManuallyEdited: false },
                location: { ...data.location, isManuallyEdited: false },
                date: { ...data.date, isManuallyEdited: false },
                time: { ...data.time, isManuallyEdited: false },
                tags: { ...data.tags, isManuallyEdited: false },
                category: { ...data.category, isManuallyEdited: false },
                size: { ...data.size, isManuallyEdited: false },
                duration: { ...data.duration, isManuallyEdited: false },
                emotions: { ...data.emotions, isManuallyEdited: false },
              },
              lastExtractionTime: new Date(),
              isExtracting: false,
            })

            console.log('📊 Calculating completion...')
            // Calculate completion
            get().calculateCompletion()

            // Generate questions for missing data
            get().generateQuestions()
          } catch (error) {
            set({ isExtracting: false })
            console.error('❌ Extraction error:', error)
          }
        },

        updateExtractedField: (field, value, manual = true) => {
          set((state) => ({
            extractedData: {
              ...state.extractedData,
              [field]: {
                value,
                confidence: 100,
                isManuallyEdited: manual,
              },
            },
          }))

          // Award XP for manual edits
          if (manual) {
            get().addXP(5, `Updated ${field}`)
          }

          get().calculateCompletion()
        },

        calculateCompletion: () => {
          const { extractedData, confirmedWitnesses, uploadedMedia } = get()

          let totalFields = 0
          let filledFields = 0

          // Core fields
          const coreFields: (keyof ExtractedData)[] = ['category', 'location', 'date']
          coreFields.forEach(field => {
            totalFields++
            if (extractedData[field].value && extractedData[field].confidence > 60) {
              filledFields++
            }
          })

          // Optional fields (bonus)
          const optionalFields: (keyof ExtractedData)[] = ['time', 'size', 'duration']
          optionalFields.forEach(field => {
            totalFields += 0.5
            if (extractedData[field].value && extractedData[field].confidence > 60) {
              filledFields += 0.5
            }
          })

          // Media
          if (uploadedMedia.length > 0) filledFields += 1
          totalFields += 1

          // Witnesses
          if (confirmedWitnesses.length > 0) filledFields += 1
          totalFields += 1

          const percentage = Math.min(100, Math.round((filledFields / totalFields) * 100))

          set({ completionPercentage: percentage })
        },

        // ========================================
        // WITNESS DETECTION
        // ========================================
        detectWitnessesInText: (text) => {
          // Simple pattern: "ich und NAME" oder "NAME und ich" oder "mit NAME"
          const patterns = [
            /(?:ich und|und ich|mit|zusammen mit)\s+([A-Z][a-zäöüß]+)/g,
            /([A-Z][a-zäöüß]+)\s+(?:und ich|war auch dabei|war dabei)/g,
          ]

          const detected: DetectedWitness[] = []
          const seenNames = new Set<string>()

          patterns.forEach(pattern => {
            let match
            while ((match = pattern.exec(text)) !== null) {
              const name = match[1]
              if (!seenNames.has(name) && name.length > 2) {
                detected.push({
                  name,
                  detectedFrom: 'text',
                  position: match.index,
                  confirmed: false,
                })
                seenNames.add(name)
              }
            }
          })

          if (detected.length > 0) {
            set({ detectedWitnesses: detected })
          }
        },

        confirmWitness: (name) => {
          set((state) => ({
            detectedWitnesses: state.detectedWitnesses.map(w =>
              w.name === name ? { ...w, confirmed: true } : w
            ),
          }))
        },

        addWitness: (witness) => {
          set((state) => ({
            confirmedWitnesses: [...state.confirmedWitnesses, witness],
          }))

          get().addXP(10, 'Added witness')
          get().calculateCompletion()
        },

        removeWitness: (id) => {
          set((state) => ({
            confirmedWitnesses: state.confirmedWitnesses.filter(w => w.id !== id),
          }))
          get().calculateCompletion()
        },

        generateInviteLink: async () => {
          const linkId = Math.random().toString(36).substring(7)
          const url = `${window.location.origin}/invite/${linkId}`

          const inviteLink: InviteLink = {
            id: linkId,
            url,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdAt: new Date(),
          }

          set((state) => ({
            inviteLinks: [...state.inviteLinks, inviteLink],
          }))

          return url
        },

        // ========================================
        // MEDIA ACTIONS
        // ========================================
        uploadMedia: async (file) => {
          const mediaId = Math.random().toString(36).substring(7)
          const preview = URL.createObjectURL(file)

          // Detect type
          let type: UploadedMedia['type'] = 'photo'
          if (file.type.startsWith('image/')) type = 'photo'
          else if (file.type.startsWith('video/')) type = 'video'
          else if (file.type.startsWith('audio/')) type = 'audio'
          else if (file.type === 'application/pdf' || file.type.includes('text')) type = 'document'

          // Check if OCR available
          const ocrAvailable = type === 'document' || (type === 'photo' && file.size < 5_000_000)

          const media: UploadedMedia = {
            id: mediaId,
            type,
            file,
            preview,
            uploadProgress: 0,
            ocrAvailable,
          }

          set((state) => ({
            uploadedMedia: [...state.uploadedMedia, media],
          }))

          // Upload to server
          try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/media/upload', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()

            set((state) => ({
              uploadedMedia: state.uploadedMedia.map(m =>
                m.id === mediaId
                  ? { ...m, url: data.url, uploadProgress: 100 }
                  : m
              ),
            }))

            get().addXP(5, 'Uploaded media')
            get().calculateCompletion()
          } catch (error) {
            // Remove on error
            set((state) => ({
              uploadedMedia: state.uploadedMedia.filter(m => m.id !== mediaId),
            }))
            console.error('Upload error:', error)
          }
        },

        removeMedia: (id) => {
          set((state) => ({
            uploadedMedia: state.uploadedMedia.filter(m => m.id !== id),
          }))
          get().calculateCompletion()
        },

        requestOCR: async (mediaId) => {
          const media = get().uploadedMedia.find(m => m.id === mediaId)
          if (!media || !media.ocrAvailable) return

          try {
            const formData = new FormData()
            formData.append('file', media.file)

            const response = await fetch('/api/ocr', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) throw new Error('OCR failed')

            const data = await response.json()

            set((state) => ({
              uploadedMedia: state.uploadedMedia.map(m =>
                m.id === mediaId
                  ? { ...m, ocrText: data.text }
                  : m
              ),
            }))
          } catch (error) {
            console.error('OCR error:', error)
          }
        },

        applyOCRText: (mediaId) => {
          const media = get().uploadedMedia.find(m => m.id === mediaId)
          if (!media?.ocrText) return

          get().appendText(media.ocrText)
          get().addXP(10, 'Applied OCR text')
        },

        // ========================================
        // CONVERSATIONAL QUESTIONS
        // ========================================
        generateQuestions: async () => {
          const { extractedData, rawText, activeQuestions } = get()

          // Don't spam questions
          if (activeQuestions.length > 0) return

          try {
            const response = await fetch('/api/questions/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                extractedData,
                text: rawText,
              }),
            })

            // API not implemented yet - gracefully skip
            if (response.status === 404) {
              console.log('Question generation API not yet implemented - skipping conversational prompts')
              return
            }

            if (!response.ok) throw new Error('Question generation failed')

            const data = await response.json()

            set({
              activeQuestions: data.questions || [],
              currentPromptIndex: 0,
            })
          } catch (error) {
            // Silently fail - conversational prompts are optional
            if (error instanceof TypeError && error.message.includes('fetch')) {
              console.log('Question generation API not available - continuing without prompts')
            } else {
              console.error('Question generation error:', error)
            }
          }
        },

        answerQuestion: (questionId, answer) => {
          set((state) => ({
            answeredQuestions: {
              ...state.answeredQuestions,
              [questionId]: answer,
            },
            activeQuestions: state.activeQuestions.filter(q => q.id !== questionId),
          }))

          get().addXP(5, 'Answered question')
        },

        skipQuestion: (questionId) => {
          set((state) => ({
            activeQuestions: state.activeQuestions.filter(q => q.id !== questionId),
          }))
        },

        dismissQuestion: (questionId) => {
          set((state) => ({
            activeQuestions: state.activeQuestions.filter(q => q.id !== questionId),
          }))
        },

        // ========================================
        // PRIVACY & PUBLISH
        // ========================================
        setPrivacy: (level) => set({ privacyLevel: level }),

        togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),

        publish: async () => {
          const state = get()

          set({ isPublishing: true })

          try {
            const response = await fetch('/api/experiences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: state.extractedData.title.value || state.rawText.substring(0, 60),
                category: state.extractedData.category.value || 'other',
                location: state.extractedData.location.value ? {
                  text: state.extractedData.location.value,
                } : undefined,
                date: state.extractedData.date.value,
                time: state.extractedData.time.value,
                tags: state.extractedData.tags.value,
                rawText: state.rawText,
                mediaUrls: {
                  photos: state.uploadedMedia.filter(m => m.type === 'photo' && m.url).map(m => m.url!),
                  videos: state.uploadedMedia.filter(m => m.type === 'video' && m.url).map(m => m.url!),
                  audio: state.uploadedMedia.filter(m => m.type === 'audio' && m.url).map(m => m.url!),
                },
                privacy: state.privacyLevel,
                language: 'de',
              }),
            })

            if (!response.ok) throw new Error('Publish failed')

            const data = await response.json()

            set({
              publishedId: data.id,
              isPublishing: false,
            })

            // Award completion XP
            get().addXP(50, 'Published experience')
          } catch (error) {
            set({ isPublishing: false })
            console.error('Publish error:', error)
            throw error
          }
        },

        // ========================================
        // GAMIFICATION
        // ========================================
        addXP: (amount, reason) => {
          set((state) => ({
            xpEarned: state.xpEarned + amount,
            showXPToast: true,
          }))

          // Auto-hide toast
          setTimeout(() => {
            set({ showXPToast: false })
          }, 2000)
        },

        // ========================================
        // UTILITIES
        // ========================================
        reset: () => {
          set(initialState)
        },
      }),
      {
        name: 'newxp-storage',
        partialize: (state) => ({
          rawText: state.rawText,
          extractedData: state.extractedData,
          privacyLevel: state.privacyLevel,
        }),
      }
    )
  )
)
