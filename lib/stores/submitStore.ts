import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ========================================
// TYPES
// ========================================

export interface ExtractedField<T = string> {
  value: T
  confidence: number
  isManuallyEdited: boolean
}

export interface Question {
  id: string
  type: 'text' | 'date' | 'location' | 'multi-choice' | 'emotional'
  question: string
  options?: string[]
  required: boolean
  category: string
}

export interface UploadedFile {
  id: string
  type: 'image' | 'video' | 'audio'
  file: File
  preview: string
  uploadProgress: number
  url?: string
}

export interface SketchData {
  id: string
  elements: any[]
  preview: string
}

export interface Insertion {
  start: number
  end: number
  text: string
  type: 'detail' | 'fact' | 'emotion' | 'timeline'
  sourceFields?: string[]
}

export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
}

export interface InviteLink {
  id: string
  url: string
  expiresAt?: Date
  createdAt: Date
}

export interface SimilarExperience {
  id: string
  title: string
  teaser: string
  matchScore: number
  matchReasons: string[]
  location: string
  date: Date
  witnessCount: number
  category: string
  user: {
    id: string
    username?: string
    isAnonymous: boolean
  }
}

export interface MapData {
  dots: Array<{
    lat: number
    lng: number
    count: number
    experienceIds: string[]
  }>
  center: { lat: number; lng: number }
  zoom: number
}

export interface DiscoveryStats {
  totalSimilar: number
  globalCategoryCount: number
  averageMatchScore: number
  countriesCount: number
  timeframeMonths: number
  trendPercentage: number
}

// ========================================
// STORE INTERFACE
// ========================================

export interface SubmitStore {
  // ========================================
  // GLOBAL STATE
  // ========================================
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  isLoading: boolean
  error: string | null

  // ========================================
  // STEP 1: CANVAS
  // ========================================
  rawText: string
  wordCount: number
  charCount: number
  extractedData: {
    title: ExtractedField
    location: ExtractedField
    date: ExtractedField
    tags: ExtractedField<string[]>
    category: ExtractedField
  }
  isExtracting: boolean
  lastExtractionTime: Date | null

  // ========================================
  // STEP 2: QUESTIONS
  // ========================================
  needsQuestions: boolean
  questions: Question[]
  answers: Record<string, any>

  // ========================================
  // STEP 3: MEDIA
  // ========================================
  uploadedFiles: UploadedFile[]
  sketches: SketchData[]
  additionalNotes: string

  // ========================================
  // STEP 4: REVIEW & ENRICH
  // ========================================
  enrichedText: string
  enrichedInsertions: Insertion[]
  enrichmentApproved: boolean
  summary: {
    title: string
    teaser: string
    titleSuggestions: string[]
  }
  displayMode: 'original' | 'enriched'

  // ========================================
  // STEP 5: PRIVACY
  // ========================================
  privacyLevel: 'public' | 'anonymous' | 'private'
  witnesses: User[]
  linkedExperiences: string[]
  inviteLinks: InviteLink[]

  // ========================================
  // STEP 6: DISCOVERY
  // ========================================
  experienceId: string | null
  similarExperiences: SimilarExperience[]
  mapData: MapData
  stats: DiscoveryStats

  // ========================================
  // ACTIONS
  // ========================================

  // Canvas
  setText: (text: string) => void
  triggerExtraction: () => Promise<void>
  updateExtractedField: (field: keyof SubmitStore['extractedData'], value: any) => void

  // Questions
  answerQuestion: (questionId: string, answer: any) => void

  // Media
  uploadFile: (file: File) => Promise<void>
  removeFile: (fileId: string) => void
  addSketch: (data: SketchData) => void

  // Review & Enrich
  generateEnrichedText: () => Promise<void>
  approveEnrichment: () => void
  rejectEnrichment: () => void
  regenerateEnrichment: () => Promise<void>
  editEnrichedText: (text: string) => void
  generateSummary: () => Promise<void>
  updateSummary: (field: 'title' | 'teaser', value: string) => void

  // Privacy
  setPrivacy: (level: 'public' | 'anonymous' | 'private') => void
  addWitness: (user: User) => void
  removeWitness: (userId: string) => void
  generateInviteLink: () => Promise<string>

  // Submit
  submit: () => Promise<void>

  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void

  // Utilities
  reset: () => void
  saveDraft: () => Promise<void>
  loadDraft: (draftId: string) => Promise<void>
}

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  currentStep: 1 as 1 | 2 | 3 | 4 | 5 | 6,
  isLoading: false,
  error: null,

  // Step 1
  rawText: '',
  wordCount: 0,
  charCount: 0,
  extractedData: {
    title: { value: '', confidence: 0, isManuallyEdited: false },
    location: { value: '', confidence: 0, isManuallyEdited: false },
    date: { value: '', confidence: 0, isManuallyEdited: false },
    tags: { value: [] as string[], confidence: 0, isManuallyEdited: false },
    category: { value: '', confidence: 0, isManuallyEdited: false },
  },
  isExtracting: false,
  lastExtractionTime: null,

  // Step 2
  needsQuestions: false,
  questions: [] as Question[],
  answers: {} as Record<string, any>,

  // Step 3
  uploadedFiles: [] as UploadedFile[],
  sketches: [] as SketchData[],
  additionalNotes: '',

  // Step 4
  enrichedText: '',
  enrichedInsertions: [] as Insertion[],
  enrichmentApproved: false,
  summary: {
    title: '',
    teaser: '',
    titleSuggestions: [] as string[],
  },
  displayMode: 'enriched' as 'original' | 'enriched',

  // Step 5
  privacyLevel: 'anonymous' as 'public' | 'anonymous' | 'private',
  witnesses: [] as User[],
  linkedExperiences: [] as string[],
  inviteLinks: [] as InviteLink[],

  // Step 6
  experienceId: null,
  similarExperiences: [] as SimilarExperience[],
  mapData: {
    dots: [],
    center: { lat: 0, lng: 0 },
    zoom: 2,
  },
  stats: {
    totalSimilar: 0,
    globalCategoryCount: 0,
    averageMatchScore: 0,
    countriesCount: 0,
    timeframeMonths: 0,
    trendPercentage: 0,
  },
}

// ========================================
// STORE
// ========================================

export const useSubmitStore = create<SubmitStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========================================
        // CANVAS ACTIONS
        // ========================================
        setText: (text: string) => {
          const wordCount = text.trim().split(/\s+/).length
          const charCount = text.length

          set({
            rawText: text,
            wordCount,
            charCount,
          })

          // Trigger extraction if text is long enough
          if (charCount > 50) {
            get().triggerExtraction()
          }
        },

        triggerExtraction: async () => {
          const { rawText, isExtracting } = get()

          // Don't extract if already extracting or text too short
          if (isExtracting || rawText.length < 50) return

          set({ isExtracting: true, error: null })

          try {
            // TODO: Call API endpoint
            const response = await fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: rawText }),
            })

            if (!response.ok) throw new Error('Extraction failed')

            const data = await response.json()

            set({
              extractedData: {
                title: { ...data.title, isManuallyEdited: false },
                location: { ...data.location, isManuallyEdited: false },
                date: { ...data.date, isManuallyEdited: false },
                tags: { ...data.tags, isManuallyEdited: false },
                category: { ...data.category, isManuallyEdited: false },
              },
              lastExtractionTime: new Date(),
              isExtracting: false,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Extraction failed',
              isExtracting: false,
            })
          }
        },

        updateExtractedField: (field, value) => {
          set((state) => ({
            extractedData: {
              ...state.extractedData,
              [field]: {
                ...state.extractedData[field],
                value,
                confidence: 100,
                isManuallyEdited: true,
              },
            },
          }))
        },

        // ========================================
        // QUESTIONS ACTIONS
        // ========================================
        answerQuestion: (questionId: string, answer: any) => {
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: answer,
            },
          }))
        },

        // ========================================
        // MEDIA ACTIONS
        // ========================================
        uploadFile: async (file: File) => {
          const fileId = Math.random().toString(36).substring(7)
          const preview = URL.createObjectURL(file)

          // Determine file type
          const fileType = file.type.startsWith('image/') ? 'image' :
                          file.type.startsWith('video/') ? 'video' : 'audio'

          // Add to store immediately
          set((state) => ({
            uploadedFiles: [
              ...state.uploadedFiles,
              {
                id: fileId,
                type: fileType,
                file,
                preview,
                uploadProgress: 0,
              },
            ],
          }))

          try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', fileType === 'image' ? 'photo' : fileType)

            const response = await fetch('/api/media/upload', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) throw new Error('Upload failed')

            const data = await response.json()

            // Update with server URL
            set((state) => ({
              uploadedFiles: state.uploadedFiles.map((f) =>
                f.id === fileId
                  ? { ...f, url: data.url, uploadProgress: 100 }
                  : f
              ),
            }))
          } catch (error) {
            // Remove from list on error
            set((state) => ({
              uploadedFiles: state.uploadedFiles.filter((f) => f.id !== fileId),
              error: error instanceof Error ? error.message : 'Upload failed',
            }))
          }
        },

        removeFile: (fileId: string) => {
          set((state) => ({
            uploadedFiles: state.uploadedFiles.filter((f) => f.id !== fileId),
          }))
        },

        addSketch: (data: SketchData) => {
          set((state) => ({
            sketches: [...state.sketches, data],
          }))
        },

        // ========================================
        // REVIEW & ENRICH ACTIONS
        // ========================================
        generateEnrichedText: async () => {
          const { rawText, answers, extractedData } = get()

          set({ isLoading: true, error: null })

          try {
            const response = await fetch('/api/experiences/enrich', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originalText: rawText,
                answers,
                category: extractedData.category.value,
              }),
            })

            if (!response.ok) throw new Error('Enrichment failed')

            const data = await response.json()

            set({
              enrichedText: data.enrichedText,
              enrichedInsertions: data.insertions,
              isLoading: false,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Enrichment failed',
              isLoading: false,
            })
          }
        },

        approveEnrichment: () => {
          set({ enrichmentApproved: true })
        },

        rejectEnrichment: () => {
          set({
            enrichedText: '',
            enrichedInsertions: [],
            displayMode: 'original',
          })
        },

        regenerateEnrichment: async () => {
          const { rawText, answers, extractedData, enrichedText } = get()

          set({ isLoading: true, error: null })

          try {
            const response = await fetch('/api/experiences/enrich', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originalText: rawText,
                answers,
                category: extractedData.category.value,
                previousVersion: enrichedText,
              }),
            })

            if (!response.ok) throw new Error('Regeneration failed')

            const data = await response.json()

            set({
              enrichedText: data.enrichedText,
              enrichedInsertions: data.insertions,
              isLoading: false,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Regeneration failed',
              isLoading: false,
            })
          }
        },

        editEnrichedText: (text: string) => {
          set({
            enrichedText: text,
            enrichedInsertions: [],
            enrichmentApproved: true,
          })
        },

        generateSummary: async () => {
          const { enrichedText, rawText, displayMode, extractedData } = get()
          const text = displayMode === 'enriched' ? enrichedText : rawText

          set({ isLoading: true, error: null })

          try {
            const response = await fetch('/api/experiences/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text,
                category: extractedData.category.value,
              }),
            })

            if (!response.ok) throw new Error('Summary generation failed')

            const data = await response.json()

            set({
              summary: {
                title: data.titleSuggestions[0]?.text || '',
                teaser: data.teaser || '',
                titleSuggestions: data.titleSuggestions.map((s: any) => s.text),
              },
              isLoading: false,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Summary generation failed',
              isLoading: false,
            })
          }
        },

        updateSummary: (field: 'title' | 'teaser', value: string) => {
          set((state) => ({
            summary: {
              ...state.summary,
              [field]: value,
            },
          }))
        },

        // ========================================
        // PRIVACY ACTIONS
        // ========================================
        setPrivacy: (level) => {
          set({ privacyLevel: level })
        },

        addWitness: (user: User) => {
          set((state) => ({
            witnesses: [...state.witnesses, user],
          }))
        },

        removeWitness: (userId: string) => {
          set((state) => ({
            witnesses: state.witnesses.filter((w) => w.id !== userId),
          }))
        },

        generateInviteLink: async () => {
          // TODO: Implement invite link generation
          const linkId = Math.random().toString(36).substring(7)
          const url = `${window.location.origin}/invite/${linkId}`

          const inviteLink: InviteLink = {
            id: linkId,
            url,
            createdAt: new Date(),
          }

          set((state) => ({
            inviteLinks: [...state.inviteLinks, inviteLink],
          }))

          return url
        },

        // ========================================
        // SUBMIT
        // ========================================
        submit: async () => {
          const state = get()

          set({ isLoading: true, error: null })

          try {
            // Group media URLs by type
            const mediaUrls: {
              photos?: string[]
              videos?: string[]
              audio?: string[]
              sketches?: string[]
            } = {}

            state.uploadedFiles.forEach((file) => {
              if (file.url) {
                if (file.type === 'image') {
                  mediaUrls.photos = [...(mediaUrls.photos || []), file.url]
                } else if (file.type === 'video') {
                  mediaUrls.videos = [...(mediaUrls.videos || []), file.url]
                } else if (file.type === 'audio') {
                  mediaUrls.audio = [...(mediaUrls.audio || []), file.url]
                }
              }
            })

            // Add sketches if any
            if (state.sketches.length > 0) {
              mediaUrls.sketches = state.sketches.map((s) => s.preview)
            }

            const response = await fetch('/api/experiences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: state.summary.title || state.extractedData.title.value || state.rawText.substring(0, 60),
                category: state.extractedData.category.value,
                location: state.extractedData.location.value ? {
                  text: state.extractedData.location.value,
                } : undefined,
                date: state.extractedData.date.value,
                tags: state.extractedData.tags.value,
                rawText: state.rawText,
                enrichedText: state.displayMode === 'enriched' && state.enrichedText ? state.enrichedText : undefined,
                questionAnswers: state.answers,
                mediaUrls: Object.keys(mediaUrls).length > 0 ? mediaUrls : undefined,
                privacy: state.privacyLevel,
                language: 'de',
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Submission failed')
            }

            const data = await response.json()

            set({
              experienceId: data.id,
              currentStep: 6,
              isLoading: false,
            })

            // Fetch similar experiences
            const similarResponse = await fetch(
              `/api/experiences/${data.id}/similar`
            )

            if (similarResponse.ok) {
              const similarData = await similarResponse.json()

              set({
                similarExperiences: similarData.similar || [],
                stats: similarData.stats || {
                  totalSimilar: 0,
                  globalCategoryCount: 0,
                  averageMatchScore: 0,
                  countriesCount: 0,
                  timeframeMonths: 0,
                  trendPercentage: 0,
                },
              })
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Submission failed',
              isLoading: false,
            })
          }
        },

        // ========================================
        // NAVIGATION
        // ========================================
        nextStep: () => {
          set((state) => ({
            currentStep: Math.min(6, state.currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6,
          }))
        },

        prevStep: () => {
          set((state) => ({
            currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6,
          }))
        },

        goToStep: (step) => {
          set({ currentStep: step })
        },

        // ========================================
        // UTILITIES
        // ========================================
        reset: () => {
          set(initialState)
        },

        saveDraft: async () => {
          // TODO: Implement draft saving
          const state = get()
          localStorage.setItem('experience-draft', JSON.stringify(state))
        },

        loadDraft: async (draftId: string) => {
          // TODO: Implement draft loading
          const draft = localStorage.getItem('experience-draft')
          if (draft) {
            const parsed = JSON.parse(draft)
            set(parsed)
          }
        },
      }),
      {
        name: 'experience-submit-storage',
        partialize: (state) => ({
          // Only persist certain fields
          rawText: state.rawText,
          extractedData: state.extractedData,
          answers: state.answers,
          currentStep: state.currentStep,
        }),
      }
    )
  )
)
