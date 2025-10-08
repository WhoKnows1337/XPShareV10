import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SubmissionState {
  // Current Step (1-7)
  currentStep: number

  // User Input
  content: string
  title: string
  mediaFiles: Array<{
    id: string
    type: 'image' | 'audio' | 'video' | 'sketch'
    url: string
    name: string
    size: number
  }>
  audioBlob: Blob | null
  audioTranscript: string | null

  // AI-Analysis Results
  analysis: {
    category: string | null
    subCategory: string | null
    location: {
      name: string
      coordinates: [number, number] | null
    } | null
    time: {
      date: string | null
      timeOfDay: string | null
      isApproximate: boolean
    } | null
    tags: string[]
    emotion: string | null
    similarCount: number
  }

  // User Confirmations/Edits (from Screen 3)
  confirmed: {
    category: string | null
    subCategory: string | null
    location: any
    time: any
    tags: string[]
  }

  // Dynamic Questions Answers (Screen 4)
  questionAnswers: Record<string, any>

  // Witnesses (Screen 4.5)
  witnesses: Array<{
    name: string
    email?: string
    invite: boolean
  }>

  // Pattern Insights (Screen 5)
  patterns: {
    similar: any[]
    geographic: any[]
    temporal: any[]
    externalEvents: any[]
    interestedUsers: any[]
    suggestedTags: string[]
    correlations: any[]
  }

  // Privacy Settings (Screen 6)
  privacy: 'public' | 'anonymous' | 'private'
  locationPrivacy: 'exact' | 'approximate' | 'country' | 'hidden'
  options: {
    allowComments: boolean
    allowTagging: boolean
    notifyOnSimilar: boolean
    notificationFrequency: 'instant' | 'daily' | 'weekly' | 'never'
  }

  // Draft Management
  draftId: string | null
  lastSaved: Date | null

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setContent: (content: string) => void
  setTitle: (title: string) => void
  setAnalysis: (analysis: Partial<SubmissionState['analysis']>) => void
  setCategory: (category: string) => void
  setSubcategory: (subcategory: string) => void
  setTags: (tags: string[]) => void
  setLocation: (location: string, coordinates: { lat: number; lng: number }) => void
  setDate: (date: string) => void
  setConfirmed: (field: string, value: any) => void
  setQuestionAnswer: (questionId: string, answer: any) => void
  addWitness: (witness: { name: string; email?: string; invite: boolean }) => void
  removeWitness: (index: number) => void
  setPatterns: (patterns: Partial<SubmissionState['patterns']>) => void
  setPrivacy: (privacy: SubmissionState['privacy']) => void
  setLocationPrivacy: (privacy: SubmissionState['locationPrivacy']) => void
  setOptions: (options: Partial<SubmissionState['options']>) => void
  addMediaFile: (file: SubmissionState['mediaFiles'][0]) => void
  removeMediaFile: (id: string) => void
  setAudioBlob: (blob: Blob | null) => void
  setAudioTranscript: (transcript: string | null) => void
  setMediaFiles: (files: Array<{ type: 'image' | 'audio' | 'video' | 'sketch'; file: File; url: string }>) => void
  reset: () => void
  saveDraft: () => Promise<void>
  loadDraft: (draftId: string) => Promise<void>
}

const initialState = {
  currentStep: 1,
  content: '',
  title: '',
  mediaFiles: [],
  audioBlob: null,
  audioTranscript: null,

  analysis: {
    category: null,
    subCategory: null,
    location: null,
    time: null,
    tags: [],
    emotion: null,
    similarCount: 0,
  },

  confirmed: {
    category: null,
    subCategory: null,
    location: null,
    time: null,
    tags: [],
  },

  questionAnswers: {},
  witnesses: [],

  patterns: {
    similar: [],
    geographic: [],
    temporal: [],
    externalEvents: [],
    interestedUsers: [],
    suggestedTags: [],
    correlations: [],
  },

  privacy: 'public' as const,
  locationPrivacy: 'approximate' as const,
  options: {
    allowComments: true,
    allowTagging: true,
    notifyOnSimilar: false,
    notificationFrequency: 'daily' as const,
  },

  draftId: null,
  lastSaved: null,
}

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 7),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      setContent: (content) => set({ content }),

      setTitle: (title) => set({ title }),

      setAnalysis: (analysis) =>
        set((state) => ({
          analysis: { ...state.analysis, ...analysis },
        })),

      setCategory: (category) =>
        set((state) => ({
          confirmed: { ...state.confirmed, category },
        })),

      setSubcategory: (subcategory) =>
        set((state) => ({
          confirmed: { ...state.confirmed, subCategory: subcategory },
        })),

      setTags: (tags) =>
        set((state) => ({
          confirmed: { ...state.confirmed, tags },
        })),

      setLocation: (location, coordinates) =>
        set((state) => ({
          confirmed: {
            ...state.confirmed,
            location: {
              name: location,
              coordinates: [coordinates.lng, coordinates.lat],
            },
          },
        })),

      setDate: (date) =>
        set((state) => ({
          confirmed: {
            ...state.confirmed,
            time: { ...state.confirmed.time, date },
          },
        })),

      setConfirmed: (field, value) =>
        set((state) => ({
          confirmed: { ...state.confirmed, [field]: value },
        })),

      setQuestionAnswer: (questionId, answer) =>
        set((state) => ({
          questionAnswers: { ...state.questionAnswers, [questionId]: answer },
        })),

      addWitness: (witness) =>
        set((state) => ({
          witnesses: [...state.witnesses, witness],
        })),

      removeWitness: (index) =>
        set((state) => ({
          witnesses: state.witnesses.filter((_, i) => i !== index),
        })),

      setPatterns: (patterns) =>
        set((state) => ({
          patterns: { ...state.patterns, ...patterns },
        })),

      setPrivacy: (privacy) => set({ privacy }),

      setLocationPrivacy: (locationPrivacy) => set({ locationPrivacy }),

      setOptions: (options) =>
        set((state) => ({
          options: { ...state.options, ...options },
        })),

      addMediaFile: (file) =>
        set((state) => ({
          mediaFiles: [...state.mediaFiles, file],
        })),

      removeMediaFile: (id) =>
        set((state) => ({
          mediaFiles: state.mediaFiles.filter((f) => f.id !== id),
        })),

      setAudioBlob: (blob) => set({ audioBlob: blob }),

      setAudioTranscript: (transcript) => set({ audioTranscript: transcript }),

      setMediaFiles: (files) =>
        set({
          mediaFiles: files.map((file, index) => ({
            id: `media-${Date.now()}-${index}`,
            type: file.type,
            url: file.url,
            name: file.file.name,
            size: file.file.size,
          })),
        }),

      reset: () => set(initialState),

      saveDraft: async () => {
        const state = get()

        try {
          const response = await fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: state.draftId,
              content: state.content,
              title: state.title,
              metadata: {
                currentStep: state.currentStep,
                analysis: state.analysis,
                confirmed: state.confirmed,
                questionAnswers: state.questionAnswers,
                witnesses: state.witnesses,
                patterns: state.patterns,
                privacy: state.privacy,
                locationPrivacy: state.locationPrivacy,
                options: state.options,
                mediaFiles: state.mediaFiles,
                audioTranscript: state.audioTranscript,
              },
            }),
          })

          if (response.ok) {
            const draft = await response.json()
            set({ draftId: draft.id, lastSaved: new Date() })
          }
        } catch (error) {
          console.error('Failed to save draft:', error)
        }
      },

      loadDraft: async (draftId: string) => {
        try {
          const response = await fetch(`/api/drafts/${draftId}`)
          if (response.ok) {
            const draft = await response.json()
            set({
              draftId: draft.id,
              content: draft.content || '',
              title: draft.title || '',
              currentStep: draft.metadata?.currentStep || 1,
              analysis: draft.metadata?.analysis || initialState.analysis,
              confirmed: draft.metadata?.confirmed || initialState.confirmed,
              questionAnswers: draft.metadata?.questionAnswers || {},
              witnesses: draft.metadata?.witnesses || [],
              patterns: draft.metadata?.patterns || initialState.patterns,
              privacy: draft.metadata?.privacy || 'public',
              locationPrivacy: draft.metadata?.locationPrivacy || 'approximate',
              options: draft.metadata?.options || initialState.options,
              mediaFiles: draft.metadata?.mediaFiles || [],
              audioTranscript: draft.metadata?.audioTranscript || null,
              lastSaved: new Date(draft.updated_at),
            })
          }
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      },
    }),
    {
      name: 'xp-submission-storage',
      partialize: (state) => ({
        // Nur bestimmte Felder persistieren (nicht audioBlob - zu groß!)
        draftId: state.draftId,
        content: state.content,
        title: state.title,
        currentStep: state.currentStep,
        analysis: state.analysis,
        confirmed: state.confirmed,
        questionAnswers: state.questionAnswers,
        witnesses: state.witnesses,
        privacy: state.privacy,
        locationPrivacy: state.locationPrivacy,
        options: state.options,
        mediaFiles: state.mediaFiles,
        audioTranscript: state.audioTranscript,
      }),
    }
  )
)
