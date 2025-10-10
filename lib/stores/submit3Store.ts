import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video' | 'audio'
  size: number
}

export interface Witness {
  name: string
  email?: string
  invite: boolean
  detectedFromText: boolean
}

export interface Location {
  name: string
  coordinates: [number, number] // [lng, lat]
  accuracy: 'exact' | 'approximate' | 'country' | 'hidden'
}

export interface LiveAnalysisResult {
  category: string | null
  location: {
    name: string | null
    confidence: number
    coordinates?: [number, number]
  } | null
  time: {
    date: string | null
    timeOfDay: string | null
    isApproximate: boolean
  } | null
  emotion: string | null
  tags: string[]
  similarCount: number
  externalEvents: Array<{
    type: string
    title: string
    timestamp: string
    relevance: number
  }>
}

export type SubmissionMode = 'focus' | 'guided' | 'expert'
export type Privacy = 'public' | 'anonymous' | 'private'

// State Interface
export interface Submit3State {
  // === Input Phase ===
  originalContent: string
  audioBlob: Blob | null
  audioTranscript: string | null
  mediaFiles: MediaFile[]
  sketchData: string | null

  // === AI Analysis ===
  analysis: LiveAnalysisResult | null
  enhancedContent: string | null
  generatedTitle: string | null
  summary: string | null

  // === Confirmed Metadata ===
  confirmedCategory: string | null
  confirmedLocation: Location | null
  confirmedTime: string | null
  confirmedTags: string[]

  // === Questions & Witnesses ===
  questionAnswers: Record<string, any>
  witnesses: Witness[]

  // === Privacy ===
  privacy: Privacy
  locationAccuracy: 'exact' | 'approximate' | 'country' | 'hidden'

  // === UI State ===
  mode: SubmissionMode
  currentStep: number
  useEnhanced: boolean
  draftId: string | null

  // === Actions ===
  // Input
  setOriginalContent: (content: string) => void
  setAudioBlob: (blob: Blob | null) => void
  setAudioTranscript: (transcript: string | null) => void
  addMediaFile: (file: MediaFile) => void
  removeMediaFile: (id: string) => void
  setSketchData: (data: string | null) => void

  // Analysis
  setAnalysis: (analysis: Partial<LiveAnalysisResult>) => void
  setEnhancedContent: (content: string) => void
  setGeneratedTitle: (title: string) => void
  setSummary: (summary: string) => void

  // Metadata
  setConfirmedCategory: (category: string) => void
  setConfirmedLocation: (location: Location) => void
  setConfirmedTime: (time: string) => void
  setConfirmedTags: (tags: string[]) => void

  // Questions & Witnesses
  setQuestionAnswer: (questionId: string, answer: any) => void
  addWitness: (witness: Witness) => void
  removeWitness: (index: number) => void

  // Privacy
  setPrivacy: (privacy: Privacy) => void
  setLocationAccuracy: (accuracy: 'exact' | 'approximate' | 'country' | 'hidden') => void

  // UI State
  setMode: (mode: SubmissionMode) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setUseEnhanced: (use: boolean) => void

  // Utilities
  reset: () => void
}

// Initial State
const initialState = {
  // Input
  originalContent: '',
  audioBlob: null,
  audioTranscript: null,
  mediaFiles: [],
  sketchData: null,

  // Analysis
  analysis: null,
  enhancedContent: null,
  generatedTitle: null,
  summary: null,

  // Metadata
  confirmedCategory: null,
  confirmedLocation: null,
  confirmedTime: null,
  confirmedTags: [],

  // Questions & Witnesses
  questionAnswers: {},
  witnesses: [],

  // Privacy
  privacy: 'public' as Privacy,
  locationAccuracy: 'approximate' as const,

  // UI State
  mode: 'guided' as SubmissionMode,
  currentStep: 1,
  useEnhanced: true,
  draftId: null,
}

// Store
export const useSubmit3Store = create<Submit3State>()(
  persist(
    (set) => ({
      ...initialState,

      // Input Actions
      setOriginalContent: (content) => set({ originalContent: content }),

      setAudioBlob: (blob) => set({ audioBlob: blob }),

      setAudioTranscript: (transcript) => set({ audioTranscript: transcript }),

      addMediaFile: (file) =>
        set((state) => ({
          mediaFiles: [...state.mediaFiles, file],
        })),

      removeMediaFile: (id) =>
        set((state) => ({
          mediaFiles: state.mediaFiles.filter((f) => f.id !== id),
        })),

      setSketchData: (data) => set({ sketchData: data }),

      // Analysis Actions
      setAnalysis: (analysis) =>
        set((state) => ({
          analysis: { ...state.analysis, ...analysis } as LiveAnalysisResult,
        })),

      setEnhancedContent: (content) => set({ enhancedContent: content }),

      setGeneratedTitle: (title) => set({ generatedTitle: title }),

      setSummary: (summary) => set({ summary: summary }),

      // Metadata Actions
      setConfirmedCategory: (category) => set({ confirmedCategory: category }),

      setConfirmedLocation: (location) => set({ confirmedLocation: location }),

      setConfirmedTime: (time) => set({ confirmedTime: time }),

      setConfirmedTags: (tags) => set({ confirmedTags: tags }),

      // Questions & Witnesses Actions
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

      // Privacy Actions
      setPrivacy: (privacy) => set({ privacy }),

      setLocationAccuracy: (accuracy) => set({ locationAccuracy: accuracy }),

      // UI State Actions
      setMode: (mode) => set({ mode }),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 7),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      setUseEnhanced: (use) => set({ useEnhanced: use }),

      // Utilities
      reset: () => set(initialState),
    }),
    {
      name: 'xp-submit3-storage',
      partialize: (state) => ({
        // Only persist certain fields (not audioBlob - too large!)
        originalContent: state.originalContent,
        mediaFiles: state.mediaFiles.map(f => ({
          ...f,
          file: undefined, // Don't persist File objects
        })),
        audioTranscript: state.audioTranscript,
        analysis: state.analysis,
        confirmedCategory: state.confirmedCategory,
        confirmedLocation: state.confirmedLocation,
        confirmedTime: state.confirmedTime,
        confirmedTags: state.confirmedTags,
        questionAnswers: state.questionAnswers,
        witnesses: state.witnesses,
        sketchData: state.sketchData,
        enhancedContent: state.enhancedContent,
        useEnhanced: state.useEnhanced,
        generatedTitle: state.generatedTitle,
        summary: state.summary,
        privacy: state.privacy,
        locationAccuracy: state.locationAccuracy,
        mode: state.mode,
        currentStep: state.currentStep,
        draftId: state.draftId,
      }),
    }
  )
)
