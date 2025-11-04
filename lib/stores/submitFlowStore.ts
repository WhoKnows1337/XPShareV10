import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TextSegment, TextChange } from '@/lib/utils/text-diff';

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

  // NEW: Advanced editing features
  segments: TextSegment[]; // Segments for interactive editing
  textVersions: {
    original: string;           // From Screen 1
    afterAIEnhancement: string; // After first AI pass
    current: string;            // Current state after user edits
  };
  changeLog: TextChange[];      // History of text changes

  // NEW: Re-analysis state
  reAnalysisNeeded: boolean;
  reAnalysisOffered: boolean;   // Prevents asking twice
  pendingReAnalysis: {
    change: TextChange | null;
    newAttributes?: Record<string, any>;
    newQuestions?: any[];
    invalidatedQuestions?: string[];
  };

  // NEW: Undo stack
  undoStack: Array<{
    action: 'remove-segment' | 'edit-segment' | 'text-edit';
    timestamp: number;
    data: any;
  }>;

  // NEW: Final text approval fields
  finalText?: string;       // User's approved text for saving
  wasEnhanced?: boolean;    // true = saved with AI, false = saved original
  wasEdited?: boolean;      // true = user made manual edits

  // FIX: Track if enrichment was completed in Step 2 to avoid double loading
  enrichmentCompletedInStep2?: boolean;
}

// Screen 4: Files + Witnesses
export interface Screen4Data {
  // CHANGED: Store uploaded media URLs instead of File objects (for localStorage compatibility)
  uploadedMedia: Array<{
    id: string; // Unique ID for React keys
    url: string; // R2 URL from upload response
    type: 'image' | 'video' | 'audio' | 'sketch' | 'document';
    fileName: string;
    size: number;
    duration?: number; // For video/audio
    width?: number; // For images/videos
    height?: number; // For images/videos
  }>;
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
  setEnhancementEnabled: (enabled: boolean) => void;

  // NEW: Advanced Screen 3 Actions
  setTextSegments: (segments: TextSegment[]) => void;
  setTextVersionAfterAI: (text: string) => void;
  setEnrichmentCompletedInStep2: (completed: boolean) => void;
  removeSegment: (segmentId: string) => void;
  editSegment: (segmentId: string, newText: string) => void;
  setCurrentText: (text: string) => void;
  logTextChange: (change: TextChange) => void;
  setReAnalysisNeeded: (needed: boolean) => void;
  setReAnalysisOffered: (offered: boolean) => void;
  undo: () => boolean; // Returns true if undo was successful

  // Screen 4 Actions
  updateScreen4: (data: Partial<Screen4Data>) => void;
  addUploadedMedia: (media: Screen4Data['uploadedMedia'][0]) => void; // Changed from addFile
  removeUploadedMedia: (mediaId: string) => void; // Changed from removeFile
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
  saveDraftAndExit: () => boolean;
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
  segments: [],
  textVersions: {
    original: '',
    afterAIEnhancement: '',
    current: '',
  },
  changeLog: [],
  reAnalysisNeeded: false,
  reAnalysisOffered: false,
  pendingReAnalysis: {
    change: null,
  },
  undoStack: [],
  enrichmentCompletedInStep2: false,
};

const initialScreen4: Screen4Data = {
  uploadedMedia: [], // Changed from files: []
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

      setEnhancementEnabled: (enabled) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            enhancementEnabled: enabled,
          },
        })),

      // NEW: Advanced Screen 3 Actions
      setTextSegments: (segments) =>
        set((state) => ({
          screen3: { ...state.screen3, segments },
          isDraft: true,
        })),

      setTextVersionAfterAI: (text) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            textVersions: {
              ...state.screen3.textVersions,
              afterAIEnhancement: text,
            },
          },
        })),

      setEnrichmentCompletedInStep2: (completed) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            enrichmentCompletedInStep2: completed,
          },
        })),

      removeSegment: (segmentId) =>
        set((state) => {
          const segment = state.screen3.segments.find((s) => s.id === segmentId);
          if (!segment) return state;

          // Add to undo stack
          const undoEntry = {
            action: 'remove-segment' as const,
            timestamp: Date.now(),
            data: segment,
          };

          // Remove segment and update current text
          const updatedSegments = state.screen3.segments.map((s) =>
            s.id === segmentId ? { ...s, type: 'ai-added' as const, text: '' } : s
          );

          return {
            screen3: {
              ...state.screen3,
              segments: updatedSegments,
              undoStack: [...state.screen3.undoStack, undoEntry],
            },
            isDraft: true,
          };
        }),

      editSegment: (segmentId, newText) =>
        set((state) => {
          const segment = state.screen3.segments.find((s) => s.id === segmentId);
          if (!segment) return state;

          // Add to undo stack
          const undoEntry = {
            action: 'edit-segment' as const,
            timestamp: Date.now(),
            data: { segmentId, oldText: segment.text, newText },
          };

          // Update segment
          const updatedSegments = state.screen3.segments.map((s) =>
            s.id === segmentId
              ? { ...s, text: newText, type: 'user-edited' as const }
              : s
          );

          return {
            screen3: {
              ...state.screen3,
              segments: updatedSegments,
              undoStack: [...state.screen3.undoStack, undoEntry],
            },
            isDraft: true,
          };
        }),

      setCurrentText: (text) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            textVersions: {
              ...state.screen3.textVersions,
              current: text,
            },
          },
          isDraft: true,
        })),

      logTextChange: (change) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            changeLog: [...state.screen3.changeLog, change],
          },
        })),

      setReAnalysisNeeded: (needed) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            reAnalysisNeeded: needed,
          },
        })),

      setReAnalysisOffered: (offered) =>
        set((state) => ({
          screen3: {
            ...state.screen3,
            reAnalysisOffered: offered,
          },
        })),

      undo: () => {
        const state = get();
        const undoStack = state.screen3.undoStack;

        if (undoStack.length === 0) return false;

        const lastAction = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);

        switch (lastAction.action) {
          case 'remove-segment': {
            // Restore the removed segment
            const restoredSegment = lastAction.data as TextSegment;
            const updatedSegments = state.screen3.segments.map((s) =>
              s.id === restoredSegment.id ? restoredSegment : s
            );
            set({
              screen3: {
                ...state.screen3,
                segments: updatedSegments,
                undoStack: newUndoStack,
              },
            });
            return true;
          }

          case 'edit-segment': {
            // Restore the old text
            const { segmentId, oldText } = lastAction.data;
            const updatedSegments = state.screen3.segments.map((s) =>
              s.id === segmentId ? { ...s, text: oldText } : s
            );
            set({
              screen3: {
                ...state.screen3,
                segments: updatedSegments,
                undoStack: newUndoStack,
              },
            });
            return true;
          }

          default:
            return false;
        }
      },

      // Screen 4 Actions
      updateScreen4: (data) =>
        set((state) => ({
          screen4: { ...state.screen4, ...data },
          isDraft: true,
        })),

      addUploadedMedia: (media) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            uploadedMedia: [...(state.screen4.uploadedMedia || []), media],
          },
          isDraft: true,
        })),

      removeUploadedMedia: (mediaId) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            uploadedMedia: (state.screen4.uploadedMedia || []).filter((m) => m.id !== mediaId),
          },
          isDraft: true,
        })),

      addWitness: (witness) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            witnesses: [...(state.screen4.witnesses || []), witness],
          },
          isDraft: true,
        })),

      removeWitness: (witnessId) =>
        set((state) => ({
          screen4: {
            ...state.screen4,
            witnesses: (state.screen4.witnesses || []).filter(
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

      saveDraftAndExit: () => {
        // Save current state with timestamp
        set({
          lastSaved: new Date().toISOString(),
          isDraft: true,
        });
        // Navigation will be handled by the component calling this
        return true;
      },

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
            // Step 2: Category must be set (questions are optional)
            // User can skip questions and go directly to Step 3
            return state.screen2.category !== '';
          case 3:
            // Summary must exist (will be generated automatically)
            return true; // Always can proceed from Step 3
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
          const newStep = state.currentStep - 1;
          // Reset enrichmentCompletedInStep2 flag when going back from Step 3 to Step 2
          // This ensures the enrichment can run again if needed
          if (state.currentStep === 3 && newStep === 2) {
            set({
              currentStep: newStep,
              screen3: {
                ...state.screen3,
                enrichmentCompletedInStep2: false,
              },
            });
          } else {
            set({ currentStep: newStep });
          }
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
      // Migration: Convert old File[] drafts to new uploadedMedia format
      migrate: (persistedState: any, version: number) => {
        // Check if old format exists (screen4.files instead of screen4.uploadedMedia)
        if (persistedState?.screen4?.files && Array.isArray(persistedState.screen4.files)) {
          console.log('[Store Migration] Detected old File[] format, clearing incompatible data');

          // Clear old File[] array (cannot be serialized/restored)
          persistedState.screen4.uploadedMedia = [];
          delete persistedState.screen4.files;

          // Show user-friendly warning (will be visible in console)
          console.warn(
            '[Store Migration] Old uploaded files were cleared. ' +
            'Please re-upload your files. (File objects cannot be persisted in localStorage)'
          );
        }

        return persistedState;
      },
    }
  )
);
