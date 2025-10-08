'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface DraftData {
  id: string
  userId: string
  content: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface DraftDB extends DBSchema {
  drafts: {
    key: string
    value: DraftData
    indexes: { 'by-user': string; 'by-updated': string }
  }
}

const DB_NAME = 'xp-share-drafts'
const DB_VERSION = 1
const STORE_NAME = 'drafts'

let dbInstance: IDBPDatabase<DraftDB> | null = null

async function getDB(): Promise<IDBPDatabase<DraftDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<DraftDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-user', 'userId')
        store.createIndex('by-updated', 'updatedAt')
      }
    },
  })

  return dbInstance
}

interface UseAutoSaveOptions {
  interval?: number
  onBlur?: boolean
  onBeforeUnload?: boolean
  userId: string
  draftId?: string
}

const DEFAULT_OPTIONS = {
  interval: 10000, // 10 seconds
  onBlur: true,
  onBeforeUnload: true,
}

export function useAutoSave(
  content: string,
  metadata: Record<string, any>,
  options: UseAutoSaveOptions
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string>(
    opts.draftId || `draft-${opts.userId}-${Date.now()}`
  )

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousContentRef = useRef<string>(content)

  const saveDraft = useCallback(async () => {
    // Don't save if content hasn't changed
    if (content === previousContentRef.current && lastSaved) {
      return
    }

    // Don't save empty content
    if (!content.trim()) {
      return
    }

    previousContentRef.current = content
    setIsSaving(true)
    setError(null)

    try {
      const db = await getDB()

      const draft: DraftData = {
        id: draftId,
        userId: opts.userId,
        content,
        metadata,
        createdAt: lastSaved ? lastSaved.toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await db.put(STORE_NAME, draft)
      setLastSaved(new Date())
    } catch (err) {
      console.error('Auto-save error:', err)
      setError('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [content, metadata, draftId, opts.userId, lastSaved])

  // Interval-based auto-save
  useEffect(() => {
    if (opts.interval && content.trim()) {
      timeoutRef.current = setInterval(() => {
        saveDraft()
      }, opts.interval)

      return () => {
        if (timeoutRef.current) {
          clearInterval(timeoutRef.current)
        }
      }
    }
  }, [opts.interval, content, saveDraft])

  // Save on blur
  useEffect(() => {
    if (!opts.onBlur) return

    const handleBlur = () => saveDraft()
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  }, [opts.onBlur, saveDraft])

  // Save before unload
  useEffect(() => {
    if (!opts.onBeforeUnload) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveDraft()

      // Show warning if unsaved changes
      if (content !== previousContentRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [opts.onBeforeUnload, saveDraft, content])

  const deleteDraft = useCallback(async () => {
    try {
      const db = await getDB()
      await db.delete(STORE_NAME, draftId)
      setLastSaved(null)
    } catch (err) {
      console.error('Delete draft error:', err)
      setError('Failed to delete draft')
    }
  }, [draftId])

  const loadDraft = useCallback(async (id: string): Promise<DraftData | null> => {
    try {
      const db = await getDB()
      const draft = await db.get(STORE_NAME, id)
      return draft || null
    } catch (err) {
      console.error('Load draft error:', err)
      return null
    }
  }, [])

  const listDrafts = useCallback(async (): Promise<DraftData[]> => {
    try {
      const db = await getDB()
      const index = db.transaction(STORE_NAME).store.index('by-user')
      const drafts = await index.getAll(opts.userId)
      return drafts.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (err) {
      console.error('List drafts error:', err)
      return []
    }
  }, [opts.userId])

  return {
    lastSaved,
    isSaving,
    error,
    draftId,
    saveDraft,
    deleteDraft,
    loadDraft,
    listDrafts,
  }
}
