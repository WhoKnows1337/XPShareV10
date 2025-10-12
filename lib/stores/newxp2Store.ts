import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ========================================
// TYPES
// ========================================

export type Phase = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type OrbState = 'idle' | 'listening' | 'thinking' | 'celebrating'
export type InputMode = 'text' | 'voice'

export interface FloatingCard {
  id: string
  field: keyof ExtractedData
  value: any
  confidence: number
  position: { x: number; y: number }
  isNew: boolean // For glow animation
  isEditing: boolean
}

export interface ExtractedData {
  title: string
  category: string
  location: string
  date: string
  time: string
  tags: string[]
  size: string
  duration: string
  emotions: string[]
}

export interface Witness {
  id: string
  name: string
  email?: string
  username?: string
  avatar?: string
  type: 'platform' | 'email' | 'link'
  status: 'pending' | 'confirmed' | 'skipped'
}

export interface MediaFile {
  id: string
  type: 'photo' | 'video' | 'audio' | 'document'
  file: File
  preview: string
  url?: string
  uploadProgress: number
  ocrText?: string
  ocrAvailable: boolean
}

export interface PatternMatch {
  id: string
  title: string
  similarity: number
  category: string
  location?: string
  date?: string
  userAvatar?: string
  userName?: string
}

export interface ConstellationData {
  nodes: Array<{ id: string; x: number; y: number; label: string }>
  edges: Array<{ from: string; to: string; strength: number }>
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp: number
}

// ========================================
// STORE INTERFACE
// ========================================

export interface NewXP2Store {
  // ========================================
  // PHASE MANAGEMENT
  // ========================================
  currentPhase: Phase
  setPhase: (phase: Phase) => void
  nextPhase: () => void
  previousPhase: () => void
  canProceed: () => boolean

  // ========================================
  // CANVAS STATE
  // ========================================
  cosmicAnimationEnabled: boolean
  toggleCosmicAnimation: () => void
  orbState: OrbState
  setOrbState: (state: OrbState) => void

  // ========================================
  // INPUT (Phase 1)
  // ========================================
  inputMode: InputMode
  setInputMode: (mode: InputMode) => void
  rawText: string
  setText: (text: string) => void
  isRecording: boolean
  recordingDuration: number
  audioWaveform: number[]
  startRecording: () => void
  stopRecording: () => void
  setAudioWaveform: (data: number[]) => void

  // ========================================
  // EXTRACTION (Phase 2)
  // ========================================
  extractedData: ExtractedData
  floatingCards: FloatingCard[]
  isExtracting: boolean
  extractionProgress: number
  triggerExtraction: () => Promise<void>
  updateCard: (cardId: string, value: any) => void
  addFloatingCard: (field: keyof ExtractedData, value: any, confidence: number) => void
  removeFloatingCard: (cardId: string) => void

  // ========================================
  // WITNESSES (Phase 3)
  // ========================================
  witnesses: Witness[]
  currentWitnessIndex: number
  addWitness: (witness: Witness) => void
  swipeWitness: (direction: 'left' | 'right') => void
  searchWitnesses: (query: string) => Promise<Witness[]>

  // ========================================
  // MEDIA (Phase 4)
  // ========================================
  mediaFiles: MediaFile[]
  uploadMedia: (file: File) => Promise<void>
  removeMedia: (id: string) => void
  requestOCR: (id: string) => Promise<void>
  applyOCRText: (id: string) => void

  // ========================================
  // PREVIEW (Phase 5)
  // ========================================
  completionScore: number
  missingSuggestions: string[]
  calculateCompletion: () => void

  // ========================================
  // PRIVACY (Phase 6)
  // ========================================
  privacyLevel: 'public' | 'anonymous' | 'private'
  setPrivacy: (level: 'public' | 'anonymous' | 'private') => void
  isPublishing: boolean
  publishedId: string | null
  publish: () => Promise<void>

  // ========================================
  // PATTERN MATCHING (Phase 7)
  // ========================================
  isMatchingPatterns: boolean
  patternMatches: PatternMatch[]
  constellation: ConstellationData | null
  insights: string[]
  currentMatchIndex: number
  findPatterns: () => Promise<void>
  swipeMatch: (direction: 'left' | 'right') => void

  // ========================================
  // GAMIFICATION
  // ========================================
  totalXP: number
  achievements: Achievement[]
  showAchievement: Achievement | null
  addXP: (amount: number, reason: string) => void
  unlockAchievement: (achievement: Achievement) => void
  triggerConfetti: () => void
  confettiActive: boolean

  // ========================================
  // UTILITIES
  // ========================================
  reset: () => void
  saveDraft: () => Promise<void>
  loadDraft: () => Promise<void>
}

// ========================================
// INITIAL STATE
// ========================================

const initialExtractedData: ExtractedData = {
  title: '',
  category: '',
  location: '',
  date: '',
  time: '',
  tags: [],
  size: '',
  duration: '',
  emotions: [],
}

const initialState = {
  // Phase
  currentPhase: 1 as Phase,

  // Canvas
  cosmicAnimationEnabled: true,
  orbState: 'idle' as OrbState,

  // Input
  inputMode: 'text' as InputMode,
  rawText: '',
  isRecording: false,
  recordingDuration: 0,
  audioWaveform: [],

  // Extraction
  extractedData: initialExtractedData,
  floatingCards: [] as FloatingCard[],
  isExtracting: false,
  extractionProgress: 0,

  // Witnesses
  witnesses: [] as Witness[],
  currentWitnessIndex: 0,

  // Media
  mediaFiles: [] as MediaFile[],

  // Preview
  completionScore: 0,
  missingSuggestions: [] as string[],

  // Privacy
  privacyLevel: 'anonymous' as 'public' | 'anonymous' | 'private',
  isPublishing: false,
  publishedId: null,

  // Pattern Matching
  isMatchingPatterns: false,
  patternMatches: [] as PatternMatch[],
  constellation: null,
  insights: [] as string[],
  currentMatchIndex: 0,

  // Gamification
  totalXP: 0,
  achievements: [] as Achievement[],
  showAchievement: null,
  confettiActive: false,
}

// ========================================
// STORE
// ========================================

export const useNewXP2Store = create<NewXP2Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========================================
        // PHASE MANAGEMENT
        // ========================================
        setPhase: (phase) => set({ currentPhase: phase }),

        nextPhase: () => {
          const current = get().currentPhase
          if (current < 7) {
            set({ currentPhase: (current + 1) as Phase })
            get().addXP(10, `Phase ${current + 1} erreicht`)
          }
        },

        previousPhase: () => {
          const current = get().currentPhase
          if (current > 1) {
            set({ currentPhase: (current - 1) as Phase })
          }
        },

        canProceed: () => {
          const { currentPhase, rawText, extractedData, privacyLevel } = get()

          switch (currentPhase) {
            case 1:
              return rawText.length >= 50
            case 2:
              return extractedData.category !== '' && extractedData.location !== ''
            case 3:
            case 4:
            case 5:
              return true
            case 6:
              return privacyLevel !== null
            default:
              return true
          }
        },

        // ========================================
        // CANVAS STATE
        // ========================================
        toggleCosmicAnimation: () =>
          set((state) => ({ cosmicAnimationEnabled: !state.cosmicAnimationEnabled })),

        setOrbState: (state) => set({ orbState: state }),

        // ========================================
        // INPUT
        // ========================================
        setInputMode: (mode) => set({ inputMode: mode }),

        setText: (text) => {
          set({ rawText: text })

          // Auto-trigger extraction after 1.5s
          const timer = setTimeout(() => {
            if (text.length >= 50) {
              get().triggerExtraction()
            }
          }, 1500)

          return () => clearTimeout(timer)
        },

        startRecording: () => {
          set({ isRecording: true, orbState: 'listening' })
        },

        stopRecording: () => {
          set({ isRecording: false, recordingDuration: 0, orbState: 'idle' })
        },

        setAudioWaveform: (data) => set({ audioWaveform: data }),

        // ========================================
        // EXTRACTION
        // ========================================
        triggerExtraction: async () => {
          const { rawText, isExtracting } = get()
          if (isExtracting || rawText.length < 50) return

          set({ isExtracting: true, orbState: 'thinking' })

          try {
            const response = await fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: rawText }),
            })

            if (!response.ok) throw new Error('Extraction failed')

            const data = await response.json()

            // Update extracted data
            const extractedData: ExtractedData = {
              title: data.title?.value || '',
              category: data.category?.value || '',
              location: data.location?.value || '',
              date: data.date?.value || '',
              time: data.time?.value || '',
              tags: data.tags?.value || [],
              size: data.size?.value || '',
              duration: data.duration?.value || '',
              emotions: data.emotions?.value || [],
            }

            set({ extractedData, isExtracting: false, orbState: 'celebrating' })

            // Create floating cards for high-confidence fields
            Object.entries(data).forEach(([field, fieldData]: [string, any]) => {
              if (fieldData.confidence > 60 && fieldData.value) {
                get().addFloatingCard(field as keyof ExtractedData, fieldData.value, fieldData.confidence)
              }
            })

            get().calculateCompletion()
            get().triggerConfetti()
            get().addXP(20, 'Extraction completed')

            // Auto-proceed to phase 2 if we have ANY extracted data
            // Less strict: category OR location OR at least one floating card
            const hasData = extractedData.category || extractedData.location || get().floatingCards.length > 0

            if (hasData) {
              console.log('[newxp2] Auto-proceeding to Phase 2 (extracted data found)')
              setTimeout(() => {
                get().nextPhase()
              }, 2000)
            } else {
              console.log('[newxp2] No data extracted, user must proceed manually')
            }
          } catch (error) {
            console.error('Extraction error:', error)
            set({ isExtracting: false, orbState: 'idle' })
          }
        },

        addFloatingCard: (field, value, confidence) => {
          const id = Math.random().toString(36).substring(7)
          const position = {
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
          }

          const card: FloatingCard = {
            id,
            field,
            value,
            confidence,
            position,
            isNew: true,
            isEditing: false,
          }

          set((state) => ({
            floatingCards: [...state.floatingCards, card],
          }))

          // Remove "isNew" flag after animation
          setTimeout(() => {
            set((state) => ({
              floatingCards: state.floatingCards.map((c) =>
                c.id === id ? { ...c, isNew: false } : c
              ),
            }))
          }, 1000)
        },

        updateCard: (cardId, value) => {
          set((state) => ({
            floatingCards: state.floatingCards.map((card) =>
              card.id === cardId ? { ...card, value, confidence: 100 } : card
            ),
          }))

          // Update extracted data
          const card = get().floatingCards.find((c) => c.id === cardId)
          if (card) {
            set((state) => ({
              extractedData: {
                ...state.extractedData,
                [card.field]: value,
              },
            }))
          }

          get().calculateCompletion()
          get().addXP(5, 'Manual edit')
        },

        removeFloatingCard: (cardId) => {
          set((state) => ({
            floatingCards: state.floatingCards.filter((c) => c.id !== cardId),
          }))
        },

        // ========================================
        // WITNESSES
        // ========================================
        addWitness: (witness) => {
          set((state) => ({
            witnesses: [...state.witnesses, witness],
          }))
          get().addXP(10, 'Witness added')
        },

        swipeWitness: (direction) => {
          const { currentWitnessIndex, witnesses } = get()
          const witness = witnesses[currentWitnessIndex]

          if (witness) {
            if (direction === 'right') {
              // Confirm witness
              set((state) => ({
                witnesses: state.witnesses.map((w) =>
                  w.id === witness.id ? { ...w, status: 'confirmed' } : w
                ),
              }))
              get().addXP(10, 'Witness confirmed')
            } else {
              // Skip witness
              set((state) => ({
                witnesses: state.witnesses.map((w) =>
                  w.id === witness.id ? { ...w, status: 'skipped' } : w
                ),
              }))
            }

            // Move to next
            set({ currentWitnessIndex: currentWitnessIndex + 1 })
          }
        },

        searchWitnesses: async (query) => {
          // TODO: Implement witness search API
          return []
        },

        // ========================================
        // MEDIA
        // ========================================
        uploadMedia: async (file) => {
          const id = Math.random().toString(36).substring(7)
          const preview = URL.createObjectURL(file)

          let type: MediaFile['type'] = 'photo'
          if (file.type.startsWith('image/')) type = 'photo'
          else if (file.type.startsWith('video/')) type = 'video'
          else if (file.type.startsWith('audio/')) type = 'audio'
          else type = 'document'

          const ocrAvailable = type === 'document' || (type === 'photo' && file.size < 5_000_000)

          const media: MediaFile = {
            id,
            type,
            file,
            preview,
            uploadProgress: 0,
            ocrAvailable,
          }

          set((state) => ({
            mediaFiles: [...state.mediaFiles, media],
          }))

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
              mediaFiles: state.mediaFiles.map((m) =>
                m.id === id ? { ...m, url: data.url, uploadProgress: 100 } : m
              ),
            }))

            get().addXP(10, 'Media uploaded')
            get().calculateCompletion()
          } catch (error) {
            console.error('Upload error:', error)
            set((state) => ({
              mediaFiles: state.mediaFiles.filter((m) => m.id !== id),
            }))
          }
        },

        removeMedia: (id) => {
          set((state) => ({
            mediaFiles: state.mediaFiles.filter((m) => m.id !== id),
          }))
          get().calculateCompletion()
        },

        requestOCR: async (id) => {
          const media = get().mediaFiles.find((m) => m.id === id)
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
              mediaFiles: state.mediaFiles.map((m) =>
                m.id === id ? { ...m, ocrText: data.text } : m
              ),
            }))

            get().addXP(15, 'OCR completed')
          } catch (error) {
            console.error('OCR error:', error)
          }
        },

        applyOCRText: (id) => {
          const media = get().mediaFiles.find((m) => m.id === id)
          if (!media?.ocrText) return

          const current = get().rawText
          const newText = current ? `${current}\n\n${media.ocrText}` : media.ocrText
          get().setText(newText)
          get().addXP(10, 'OCR text applied')
        },

        // ========================================
        // PREVIEW
        // ========================================
        calculateCompletion: () => {
          const { extractedData, mediaFiles, witnesses } = get()
          let score = 0
          const suggestions: string[] = []

          // Core fields (60%)
          if (extractedData.category) score += 20
          else suggestions.push('Kategorie hinzufügen')

          if (extractedData.location) score += 20
          else suggestions.push('Ort hinzufügen')

          if (extractedData.date) score += 20
          else suggestions.push('Datum hinzufügen')

          // Optional fields (30%)
          if (extractedData.time) score += 10
          if (extractedData.tags.length > 0) score += 10
          if (extractedData.emotions.length > 0) score += 10

          // Enrichments (10%)
          if (mediaFiles.length > 0) score += 5
          else suggestions.push('Medien hochladen (optional)')

          if (witnesses.filter((w) => w.status === 'confirmed').length > 0) score += 5
          else suggestions.push('Zeugen hinzufügen (optional)')

          set({ completionScore: score, missingSuggestions: suggestions })
        },

        // ========================================
        // PRIVACY & PUBLISH
        // ========================================
        setPrivacy: (level) => set({ privacyLevel: level }),

        publish: async () => {
          console.log('[newxp2] Starting publish...')
          set({ isPublishing: true })

          try {
            const { extractedData, rawText, mediaFiles, witnesses, privacyLevel } = get()

            // Validate required fields
            if (!rawText || rawText.length < 50) {
              console.error('[newxp2] Publish validation failed: rawText too short', rawText?.length)
              throw new Error('Text muss mindestens 50 Zeichen lang sein')
            }

            if (!extractedData.category) {
              console.error('[newxp2] Publish validation failed: no category')
              throw new Error('Kategorie fehlt')
            }

            // Format location as object with text property (API expects {text, lat, lng})
            const location = extractedData.location
              ? { text: extractedData.location, lat: null, lng: null }
              : undefined

            // Format media URLs by type (API expects {photos: [], videos: [], audio: [], sketches: []})
            const mediaUrls = mediaFiles.length > 0 ? {
              photos: mediaFiles.filter(m => m.type === 'photo' && m.url).map(m => m.url!),
              videos: mediaFiles.filter(m => m.type === 'video' && m.url).map(m => m.url!),
              audio: mediaFiles.filter(m => m.type === 'audio' && m.url).map(m => m.url!),
              sketches: [],
            } : undefined

            const payload = {
              title: extractedData.title || rawText.substring(0, 60),
              category: extractedData.category,
              rawText, // API expects 'rawText' not 'story_text'
              location, // Now an object {text, lat, lng}
              date: extractedData.date,
              tags: extractedData.tags,
              mediaUrls, // Formatted as {photos: [], videos: [], audio: [], sketches: []}
              privacy: privacyLevel,
              language: 'de',
            }

            console.log('[newxp2] Publishing with payload:', payload)

            const response = await fetch('/api/experiences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })

            console.log('[newxp2] Publish response status:', response.status)

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              console.error('[newxp2] Publish error response:', errorData)
              throw new Error(errorData.error || 'Publish failed')
            }

            const data = await response.json()
            console.log('[newxp2] Publish successful:', data)

            set({ publishedId: data.id, isPublishing: false })

            // Award XP based on privacy level
            const xpRewards = { public: 50, anonymous: 30, private: 10 }
            get().addXP(xpRewards[privacyLevel], 'Experience published')

            // Trigger pattern matching
            get().findPatterns()
          } catch (error) {
            console.error('[newxp2] Publish error:', error)
            set({ isPublishing: false })
            alert(`Fehler beim Veröffentlichen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
            throw error
          }
        },

        // ========================================
        // PATTERN MATCHING
        // ========================================
        findPatterns: async () => {
          const { publishedId, extractedData } = get()
          if (!publishedId) return

          set({ isMatchingPatterns: true })

          try {
            const response = await fetch('/api/patterns/similar-experiences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                experienceId: publishedId,
                category: extractedData.category,
                location: extractedData.location,
                date: extractedData.date,
              }),
            })

            if (!response.ok) throw new Error('Pattern matching failed')

            const data = await response.json()

            set({
              patternMatches: data.matches || [],
              insights: data.insights || [],
              constellation: data.constellation || null,
              isMatchingPatterns: false,
            })

            get().nextPhase() // Move to Phase 7
          } catch (error) {
            console.error('Pattern matching error:', error)
            set({ isMatchingPatterns: false })
          }
        },

        swipeMatch: (direction) => {
          const { currentMatchIndex, patternMatches } = get()

          if (direction === 'right') {
            // Connect with this match
            get().addXP(15, 'Pattern connection made')
          }

          // Move to next
          if (currentMatchIndex < patternMatches.length - 1) {
            set({ currentMatchIndex: currentMatchIndex + 1 })
          }
        },

        // ========================================
        // GAMIFICATION
        // ========================================
        addXP: (amount, reason) => {
          set((state) => ({
            totalXP: state.totalXP + amount,
          }))

          console.log(`+${amount} XP: ${reason}`)
        },

        unlockAchievement: (achievement) => {
          set((state) => ({
            achievements: [...state.achievements, achievement],
            showAchievement: achievement,
          }))

          get().addXP(achievement.xp, `Achievement: ${achievement.title}`)
          get().triggerConfetti()

          // Hide achievement popup after 3s
          setTimeout(() => {
            set({ showAchievement: null })
          }, 3000)
        },

        triggerConfetti: () => {
          set({ confettiActive: true })
          setTimeout(() => {
            set({ confettiActive: false })
          }, 3000)
        },

        // ========================================
        // UTILITIES
        // ========================================
        reset: () => {
          set(initialState)
        },

        saveDraft: async () => {
          // TODO: Implement draft saving
          console.log('Draft saved')
        },

        loadDraft: async () => {
          // TODO: Implement draft loading
          console.log('Draft loaded')
        },
      }),
      {
        name: 'newxp2-storage',
        partialize: (state) => ({
          rawText: state.rawText,
          extractedData: state.extractedData,
          privacyLevel: state.privacyLevel,
          currentPhase: state.currentPhase,
        }),
      }
    )
  )
)
