import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Screen 1: Text Input
export interface Screen1Data {
  text: string;
  wordCount: number;
  charCount: number;
}

// Screen 2: AI Analysis + Questions
export interface Screen2Data {
  // AI Generated
  title: string;
  category: string;
  tags: string[];
  aiConfidence: number; // AI confidence percentage (0-100)

  // Attributes (AI-extracted structured data)
  attributes: Record<string, {
    value: string;
    confidence: number; // 0-100
    isManuallyEdited: boolean;
  }>;

  // Required Questions
  date: string;
  time: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  duration: 'less_than_1min' | '1_to_5min' | 'more_than_5min' | '';

  // Extra Questions (optional)
  extraQuestions: Record<string, any>;
  completedExtraQuestions: boolean;
}

// Screen 3: Enhanced Text + Summary
export interface Screen3Data {
  summary: string;
  enhancedText: string;
  enhancementEnabled: boolean;
  highlights: Array<{
    start: number;
    end: number;
    type: 'added' | 'enhanced';
  }>;
}

// Screen 4: Files + Witnesses
export interface Screen4Data {
  files: File[]; // Array of File objects
  witnesses: Array<{
    type: 'user' | 'email';
    userId?: string;
    username?: string;
    email?: string;
    status: 'pending' | 'confirmed' | 'declined';
  }>;
  visibility: 'public' | 'anonymous' | 'private';
}

export interface SubmitFlowState {
  // Current Step (1-4)
  currentStep: number;
  totalSteps: number; // Can be 4 or more if extra questions

  // Form Data
  screen1: Screen1Data;
  screen2: Screen2Data;
  screen3: Screen3Data;
  screen4: Screen4Data;

  // Loading States
  isAnalyzing: boolean;
  isSummarizing: boolean;
  isEnhancing: boolean;
  isPublishing: boolean;

  // Draft Management
  lastSaved: string | null;
  isDraft: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setTotalSteps: (total: number) => void;

  // Screen 1 Actions
  updateScreen1: (data: Partial<Screen1Data>) => void;
  setText: (text: string) => void;

  // Screen 2 Actions
  updateScreen2: (data: Partial<Screen2Data>) => void;
  setAIResults: (title: string, category: string, tags: string[], confidence?: number) => void;
  setTitle: (title: string) => void;
  setCategory: (category: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setExtraQuestion: (questionId: string, answer: any) => void;

  // Screen 3 Actions
  updateScreen3: (data: Partial<Screen3Data>) => void;
  setSummary: (summary: string) => void;
  setEnhancedText: (text: string, highlights: Screen3Data['highlights']) => void;
  toggleEnhancement: () => void;

  // Screen 4 Actions
  updateScreen4: (data: Partial<Screen4Data>) => void;
  addFile: (file: Screen4Data['files'][0]) => void;
  removeFile: (fileId: string) => void;
  addWitness: (witness: Screen4Data['witnesses'][0]) => void;
  removeWitness: (witnessId: string) => void;
  setVisibility: (visibility: Screen4Data['visibility']) => void;

  // Loading Actions
  setAnalyzing: (isAnalyzing: boolean) => void;
  setSummarizing: (isSummarizing: boolean) => void;
  setEnhancing: (isEnhancing: boolean) => void;
  setPublishing: (isPublishing: boolean) => void;

  // Draft Actions
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;

  // Navigation
  canGoNext: () => boolean;
  canGoBack: () => boolean;
  goNext: () => void;
  goBack: () => void;

  // Reset
  reset: () => void;
}

const initialScreen1: Screen1Data = {
  text: '',
  wordCount: 0,
  charCount: 0,
};

const initialScreen2: Screen2Data = {
  title: '',
  category: '',
  tags: [],
  aiConfidence: 0,
  attributes: {},
  date: '',
  time: '',
  location: '',
  duration: '',
  extraQuestions: {},
  completedExtraQuestions: false,
};

const initialScreen3: Screen3Data = {
  summary: '',
  enhancedText: '',
  enhancementEnabled: true,
  highlights: [],
};

const initialScreen4: Screen4Data = {
  files: [],
  witnesses: [],
  visibility: 'public',
};

export const useSubmitFlowStore = create<SubmitFlowState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      totalSteps: 4,

      screen1: initialScreen1,
      screen2: initialScreen2,
      screen3: initialScreen3,
      screen4: initialScreen4,

      isAnalyzing: false,
      isSummarizing: false,
      isEnhancing: false,
      isPublishing: false,

      lastSaved: null,
      isDraft: false,

      // Step Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      setTotalSteps: (total) => set({ totalSteps: total }),

      // Screen 1 Actions
      updateScreen1: (data) =>
        set((state) => ({
          screen1: { ...state.screen1, ...data },
          isDraft: true,
        })),

      setText: (text) => {
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const charCount = text.length;
        set((state) => ({
          screen1: { ...state.screen1, text, wordCount, charCount },
          isDraft: true,
        }));
      },

      // Screen 2 Actions
      updateScreen2: (data) =>
        set((state) => ({
          screen2: { ...state.screen2, ...data },
          isDraft: true,
        })),

      setAIResults: (title, category, tags, confidence = 85) =>
        set((state) => ({
          screen2: { ...state.screen2, title, category, tags, aiConfidence: confidence },
        })),

      setTitle: (title) =>
        set((state) => ({
          screen2: { ...state.screen2, title },
          isDraft: true,
        })),

      setCategory: (category) =>
        set((state) => ({
          screen2: { ...state.screen2, category },
          isDraft: true,
        })),

      addTag: (tag) =>
        set((state) => {
          // Max 10 tags, no duplicates
          if (state.screen2.tags.length >= 10) return state;
          if (state.screen2.tags.includes(tag)) return state;

          return {
            screen2: {
              ...state.screen2,
              tags: [...state.screen2.tags, tag],
            },
            isDraft: true,
          };
        }),

      removeTag: (tag) =>
        set((state) => ({
          screen2: {
            ...state.screen2,
            tags: state.screen2.tags.filter((t) => t !== tag),
          },
          isDraft: true,
        })),

      setExtraQuestion: (questionId, answer) =>
        set((state) => ({
          screen2: {
            ...state.screen2,
            extraQuestions: {
              ...state.screen2.extraQuestions,
              [questionId]: answer,
            },
          },
          isDraft: true,
        })),

      // Screen 3 Actions
      updateScreen3: (data) =>
        set((state) => ({
          screen3: { ...state.screen3, ...data },
          isDraft: true,
        })),

      setSummary: (summary) =>
        set((state) => ({
          screen3: { ...state.screen3, summary },
          isDraft: true,
        })),

      setEnhancedText: (enhancedText, highlights) =>
        set((state) => ({
          screen3: { ...state.screen3, enhancedText, highlights },
        })),

      toggleEnhancement: () =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            enhancementEnabled: !state.screen3.enhancementEnabled,
          },
        })),

      // Screen 4 Actions
      updateScreen4: (data) =>
        set((state) => ({
          screen4: { ...state.screen4, ...data },
          isDraft: true,
        })),

      addFile: (file) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            files: [...state.screen4.files, file],
          },
          isDraft: true,
        })),

      removeFile: (fileId) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            files: state.screen4.files.filter((f) => f.name !== fileId),
          },
          isDraft: true,
        })),

      addWitness: (witness) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            witnesses: [...state.screen4.witnesses, witness],
          },
          isDraft: true,
        })),

      removeWitness: (witnessId) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            witnesses: state.screen4.witnesses.filter(
              (w) => (w.type === 'user' ? w.username : w.email) !== witnessId
            ),
          },
          isDraft: true,
        })),

      setVisibility: (visibility) =>
        set((state) => ({
          screen4: { ...state.screen4, visibility },
          isDraft: true,
        })),

      // Loading Actions
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setSummarizing: (isSummarizing) => set({ isSummarizing }),
      setEnhancing: (isEnhancing) => set({ isEnhancing }),
      setPublishing: (isPublishing) => set({ isPublishing }),

      // Draft Actions
      saveDraft: () =>
        set({
          lastSaved: new Date().toISOString(),
          isDraft: true,
        }),

      loadDraft: () => {
        // Draft is automatically loaded from localStorage via persist middleware
      },

      clearDraft: () =>
        set({
          screen1: initialScreen1,
          screen2: initialScreen2,
          screen3: initialScreen3,
          screen4: initialScreen4,
          currentStep: 1,
          totalSteps: 4,
          lastSaved: null,
          isDraft: false,
        }),

      // Navigation
      canGoNext: () => {
        const state = get();
        switch (state.currentStep) {
          case 1:
            // Minimum 50 characters required
            return state.screen1.charCount >= 50;
          case 2:
            // Required questions must be filled
            return (
              state.screen2.date !== '' &&
              state.screen2.time !== '' &&
              state.screen2.location !== '' &&
              state.screen2.duration !== ''
            );
          case 3:
            // Summary must exist
            return state.screen3.summary !== '';
          case 4:
            // Optional screen, always can proceed
            return true;
          default:
            return false;
        }
      },

      canGoBack: () => {
        const state = get();
        return state.currentStep > 1;
      },

      goNext: () => {
        const state = get();
        if (state.canGoNext() && state.currentStep < state.totalSteps) {
          set({ currentStep: state.currentStep + 1 });
        }
      },

      goBack: () => {
        const state = get();
        if (state.canGoBack()) {
          set({ currentStep: state.currentStep - 1 });
        }
      },

      // Reset
      reset: () =>
        set({
          screen1: initialScreen1,
          screen2: initialScreen2,
          screen3: initialScreen3,
          screen4: initialScreen4,
          currentStep: 1,
          totalSteps: 4,
          isAnalyzing: false,
          isSummarizing: false,
          isEnhancing: false,
          isPublishing: false,
          lastSaved: null,
          isDraft: false,
        }),
    }),
    {
      name: 'submit-flow-storage', // localStorage key
      partialize: (state) => ({
        // Only persist form data, not UI state
        screen1: state.screen1,
        screen2: state.screen2,
        screen3: state.screen3,
        screen4: state.screen4,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
        isDraft: state.isDraft,
      }),
    }
  )
);
