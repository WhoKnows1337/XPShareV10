import { useEffect, useRef, useCallback } from 'react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'

interface UseAutoSaveOptions {
  interval?: number // milliseconds
  onBlur?: boolean
  onBeforeUnload?: boolean
  storageKey?: string
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    interval = 10000, // 10 seconds default
    onBlur = true,
    onBeforeUnload = true,
    storageKey = 'xp-draft-autosave',
  } = options

  const store = useSubmissionStore()
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSaveRef = useRef<number>(0)

  const saveDraft = useCallback(() => {
    const now = Date.now()

    // Don't save if less than 1 second since last save
    if (now - lastSaveRef.current < 1000) {
      return
    }

    const draftData = {
      content: store.content,
      title: store.title,
      analysis: store.analysis,
      confirmed: store.confirmed,
      witnesses: store.witnesses,
      mediaFiles: store.mediaFiles,
      timestamp: now,
    }

    // Only save if there's actual content
    if (draftData.content || draftData.title) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(draftData))
        lastSaveRef.current = now
        console.log('[AutoSave] Draft saved at', new Date(now).toLocaleTimeString())
      } catch (error) {
        console.error('[AutoSave] Failed to save draft:', error)
      }
    }
  }, [store, storageKey])

  // Interval-based auto-save
  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(saveDraft, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, saveDraft])

  // Blur event (when user leaves input field)
  useEffect(() => {
    if (!onBlur) return

    const handleBlur = () => {
      saveDraft()
    }

    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [onBlur, saveDraft])

  // Before unload (when tab is closing)
  useEffect(() => {
    if (!onBeforeUnload) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveDraft()

      // Show browser confirmation if there's unsaved content
      if (store.content || store.title) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [onBeforeUnload, saveDraft, store.content, store.title])

  return {
    saveDraft,
    lastSave: lastSaveRef.current,
  }
}

// Check if there's a draft to recover
export function checkForRecoverableDraft(storageKey = 'xp-draft-autosave'): {
  hasDraft: boolean
  draft: any | null
  age: number
} {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return { hasDraft: false, draft: null, age: 0 }
    }

    const draft = JSON.parse(stored)
    const age = Date.now() - (draft.timestamp || 0)

    // Only offer recovery if draft is less than 7 days old
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days
    if (age > MAX_AGE) {
      localStorage.removeItem(storageKey)
      return { hasDraft: false, draft: null, age: 0 }
    }

    return {
      hasDraft: true,
      draft,
      age,
    }
  } catch (error) {
    console.error('[AutoSave] Failed to check for draft:', error)
    return { hasDraft: false, draft: null, age: 0 }
  }
}

// Recover draft to store
export function recoverDraft(draft: any) {
  const store = useSubmissionStore.getState()

  store.setContent(draft.content || '')
  store.setTitle(draft.title || '')

  if (draft.analysis) {
    store.setAnalysis(draft.analysis)
  }

  if (draft.confirmed?.category) {
    store.setCategory(draft.confirmed.category)
  }

  if (draft.confirmed?.tags) {
    store.setTags(draft.confirmed.tags)
  }

  if (draft.confirmed?.location) {
    store.setLocation(
      draft.confirmed.location.name,
      {
        lat: draft.confirmed.location.coordinates[1],
        lng: draft.confirmed.location.coordinates[0],
      }
    )
  }

  if (draft.witnesses) {
    draft.witnesses.forEach((witness: any) => {
      store.addWitness(witness)
    })
  }

  // Set media files if present
  // Note: We can't restore File objects, so we just store metadata
}

// Clear draft from storage
export function clearDraft(storageKey = 'xp-draft-autosave') {
  try {
    localStorage.removeItem(storageKey)
    console.log('[AutoSave] Draft cleared')
  } catch (error) {
    console.error('[AutoSave] Failed to clear draft:', error)
  }
}
