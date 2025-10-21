/**
 * Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts for the Discovery interface.
 * Detects platform (Mac/Windows/Linux) and adjusts modifier keys.
 */

'use client'

import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean // Cmd on Mac, ignored on Windows/Linux
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Detect if user is on Mac
 */
function isMac(): boolean {
  if (typeof window === 'undefined') return false
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

/**
 * Check if keyboard event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const mac = isMac()

  // Key match (case-insensitive)
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false
  }

  // Modifier keys
  const ctrlPressed = event.ctrlKey || (mac && event.metaKey) // Ctrl or Cmd on Mac
  const metaPressed = mac ? event.metaKey : event.ctrlKey // Cmd on Mac, Ctrl elsewhere
  const shiftPressed = event.shiftKey
  const altPressed = event.altKey

  // On Mac, use cmd (meta), on Windows/Linux use ctrl
  const modifierPressed = mac
    ? !!(shortcut.meta && metaPressed) || !!(shortcut.ctrl && ctrlPressed)
    : !!(shortcut.ctrl && ctrlPressed)

  const shiftMatches = !shortcut.shift || shiftPressed
  const altMatches = !shortcut.alt || altPressed

  return modifierPressed && shiftMatches && altMatches
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow Escape key to work in inputs
        if (event.key !== 'Escape') {
          return
        }
      }

      // Check each shortcut
      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'meta' | 'shift' | 'alt'>): string {
  const mac = isMac()
  const parts: string[] = []

  if (mac) {
    if (shortcut.ctrl) parts.push('⌃')
    if (shortcut.alt) parts.push('⌥')
    if (shortcut.shift) parts.push('⇧')
    if (shortcut.meta) parts.push('⌘')
  } else {
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join(mac ? '' : '+')
}
