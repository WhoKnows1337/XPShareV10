/**
 * Keyboard Navigation Hook
 *
 * Provides keyboard navigation for lists and interactive elements.
 * Follows WCAG 2.1 AA guidelines for keyboard accessibility.
 */

import { useEffect, useRef } from 'react'

export interface KeyboardNavigationOptions {
  /**
   * Enable arrow key navigation
   */
  arrowKeys?: boolean

  /**
   * Enable Home/End keys
   */
  homeEnd?: boolean

  /**
   * Enable Tab key handling
   */
  tabKey?: boolean

  /**
   * CSS selector for focusable items
   */
  itemSelector?: string

  /**
   * Callback when an item is selected
   */
  onSelect?: (index: number) => void

  /**
   * Whether navigation is enabled
   */
  enabled?: boolean
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const {
    arrowKeys = true,
    homeEnd = true,
    tabKey = false,
    itemSelector = '[role="button"], button, a, [tabindex="0"]',
    onSelect,
    enabled = true,
  } = options

  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current

    function handleKeyDown(event: KeyboardEvent) {
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      ).filter((item) => !item.hasAttribute('disabled') && !item.getAttribute('aria-disabled'))

      if (items.length === 0) return

      let newIndex = currentIndexRef.current

      // Arrow Keys
      if (arrowKeys) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          newIndex = Math.min(newIndex + 1, items.length - 1)
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          newIndex = Math.max(newIndex - 1, 0)
        }
      }

      // Home/End
      if (homeEnd) {
        if (event.key === 'Home') {
          event.preventDefault()
          newIndex = 0
        } else if (event.key === 'End') {
          event.preventDefault()
          newIndex = items.length - 1
        }
      }

      // Tab (optional)
      if (tabKey && event.key === 'Tab') {
        if (event.shiftKey) {
          newIndex = Math.max(newIndex - 1, 0)
        } else {
          newIndex = Math.min(newIndex + 1, items.length - 1)
        }
        event.preventDefault()
      }

      // Enter or Space to select
      if (event.key === 'Enter' || event.key === ' ') {
        const activeElement = document.activeElement as HTMLElement
        if (items.includes(activeElement)) {
          event.preventDefault()
          const index = items.indexOf(activeElement)
          onSelect?.(index)
          activeElement.click()
        }
      }

      // Update focus if index changed
      if (newIndex !== currentIndexRef.current) {
        currentIndexRef.current = newIndex
        items[newIndex]?.focus()

        // Scroll into view if needed
        items[newIndex]?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [enabled, containerRef, itemSelector, arrowKeys, homeEnd, tabKey, onSelect])

  return {
    /**
     * Current focused index
     */
    currentIndex: currentIndexRef.current,

    /**
     * Focus item at specific index
     */
    focusItem: (index: number) => {
      if (!containerRef.current) return

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
      )

      if (items[index]) {
        currentIndexRef.current = index
        items[index].focus()
      }
    },

    /**
     * Reset to first item
     */
    reset: () => {
      currentIndexRef.current = 0
    },
  }
}

/**
 * Hook for announcing messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create live region for announcements
    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
    announcerRef.current = announcer

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current)
      }
    }
  }, [])

  return {
    /**
     * Announce a message to screen readers
     */
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcerRef.current) return

      announcerRef.current.setAttribute('aria-live', priority)
      announcerRef.current.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    },
  }
}
