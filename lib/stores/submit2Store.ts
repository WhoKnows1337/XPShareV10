import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MediaFile {
  id: string
  type: 'image' | 'audio' | 'video' | 'sketch'
  url: string
  name: string
  size: number
}

export interface Submit2State {
  // Step 1: Compose
  originalContent: string
  mediaFiles: MediaFile[]
  audioBlob: Blob | null
  audioTranscript: string | null

  // AI Analysis (from live-analysis API)
  analysis: {
    category: string | null
    location: {
      name: string | null
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

  // Step 2: Details (User confirmed/edited values)
  confirmedLocation: {
    name: string
    coordinates: [number, number] | null
    accuracy: 'exact' | 'approximate' | 'country' | 'hidden'
  } | null
  confirmedTime: string | null
  questionAnswers: Record<string, any>
  witnesses: Array<{
    name: string
    email?: string
    invite: boolean
    detectedFromText?: boolean
  }>
  sketchData: string | null

  // Step 3: Preview
  enhancedContent: string | null
  useEnhanced: boolean
  generatedTitle: string | null
  summary: string | null
  privacy: 'public' | 'anonymous' | 'private'
  locationPrivacy: 'exact' | 'approximate' | 'country' | 'hidden'

  // Draft management
  draftId: string | null
  lastSaved: Date | null
  currentStep: number

  // Actions
  setOriginalContent: (content: string) => void
  setAnalysis: (analysis: Partial<Submit2State['analysis']>) => void
  setConfirmedLocation: (location: Submit2State['confirmedLocation']) => void
  setConfirmedTime: (time: string) => void
  setQuestionAnswer: (questionId: string, answer: any) => void
  addWitness: (witness: Submit2State['witnesses'][0]) => void
  removeWitness: (index: number) => void
  setSketchData: (data: string | null) => void
  setEnhancedContent: (content: string) => void
  setUseEnhanced: (use: boolean) => void
  setGeneratedTitle: (title: string) => void
  setSummary: (summary: string) => void
  setPrivacy: (privacy: Submit2State['privacy']) => void
  setLocationPrivacy: (privacy: Submit2State['locationPrivacy']) => void
  addMediaFile: (file: MediaFile) => void
  removeMediaFile: (id: string) => void
  setAudioBlob: (blob: Blob | null) => void
  setAudioTranscript: (transcript: string | null) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const initialState = {
  originalContent: '',
  mediaFiles: [],
  audioBlob: null,
  audioTranscript: null,

  analysis: {
    category: null,
    location: null,
    time: null,
    tags: [],
    emotion: null,
    similarCount: 0,
  },

  confirmedLocation: null,
  confirmedTime: null,
  questionAnswers: {},
  witnesses: [],
  sketchData: null,

  enhancedContent: null,
  useEnhanced: true,
  generatedTitle: null,
  summary: null,
  privacy: 'public' as const,
  locationPrivacy: 'approximate' as const,

  draftId: null,
  lastSaved: null,
  currentStep: 1,
}

export const useSubmit2Store = create<Submit2State>()(
  persist(
    (set) => ({
      ...initialState,

      setOriginalContent: (content) => set({ originalContent: content }),

      setAnalysis: (analysis) =>
        set((state) => ({
          analysis: { ...state.analysis, ...analysis },
        })),

      setConfirmedLocation: (location) => set({ confirmedLocation: location }),

      setConfirmedTime: (time) => set({ confirmedTime: time }),

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

      setSketchData: (data) => set({ sketchData: data }),

      setEnhancedContent: (content) => set({ enhancedContent: content }),

      setUseEnhanced: (use) => set({ useEnhanced: use }),

      setGeneratedTitle: (title) => set({ generatedTitle: title }),

      setSummary: (summary) => set({ summary: summary }),

      setPrivacy: (privacy) => set({ privacy }),

      setLocationPrivacy: (privacy) => set({ locationPrivacy: privacy }),

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

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'xp-submit2-storage',
      partialize: (state) => ({
        // Only persist certain fields (not audioBlob - too large!)
        originalContent: state.originalContent,
        mediaFiles: state.mediaFiles,
        audioTranscript: state.audioTranscript,
        analysis: state.analysis,
        confirmedLocation: state.confirmedLocation,
        confirmedTime: state.confirmedTime,
        questionAnswers: state.questionAnswers,
        witnesses: state.witnesses,
        sketchData: state.sketchData,
        enhancedContent: state.enhancedContent,
        useEnhanced: state.useEnhanced,
        generatedTitle: state.generatedTitle,
        summary: state.summary,
        privacy: state.privacy,
        locationPrivacy: state.locationPrivacy,
        currentStep: state.currentStep,
        draftId: state.draftId,
      }),
    }
  )
)
