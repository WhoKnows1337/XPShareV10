/**
 * Category Gradient Utilities for XPShare
 *
 * Provides gradient styling for AI Elements components based on experience categories
 * Optimized for both light and dark modes
 */

import { getCategoryColor } from './category-colors'

/**
 * Get a CSS gradient string for a category
 * Creates a subtle gradient from the category color to a lighter/darker variant
 */
export function getCategoryGradient(category: string, isDark: boolean = false): string {
  const baseColor = getCategoryColor(category)

  // Extract HSL values
  const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hslMatch) return isDark ? 'linear-gradient(135deg, hsl(0, 0%, 10%) 0%, hsl(0, 0%, 15%) 100%)' : 'linear-gradient(135deg, hsl(0, 0%, 95%) 0%, hsl(0, 0%, 100%) 100%)'

  const [, h, s, l] = hslMatch
  const hue = parseInt(h)
  const sat = parseInt(s)
  const light = parseInt(l)

  if (isDark) {
    // Dark mode: darker, more saturated gradients
    const color1 = `hsl(${hue}, ${Math.min(sat + 10, 100)}%, ${Math.max(light - 35, 10)}%)`
    const color2 = `hsl(${hue}, ${Math.min(sat + 5, 100)}%, ${Math.max(light - 40, 8)}%)`
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
  } else {
    // Light mode: lighter, softer gradients
    const color1 = `hsl(${hue}, ${Math.max(sat - 20, 20)}%, ${Math.min(light + 25, 95)}%)`
    const color2 = `hsl(${hue}, ${Math.max(sat - 25, 15)}%, ${Math.min(light + 30, 98)}%)`
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
  }
}

/**
 * Get a CSS gradient for Message components (user vs assistant)
 * User messages: category-based gradient
 * Assistant messages: neutral gradient
 */
export function getMessageGradient(role: 'user' | 'assistant', category?: string, isDark: boolean = false): string {
  if (role === 'assistant') {
    // Assistant messages: neutral blue-gray gradient
    if (isDark) {
      return 'linear-gradient(135deg, hsl(220, 15%, 15%) 0%, hsl(220, 18%, 12%) 100%)'
    } else {
      return 'linear-gradient(135deg, hsl(220, 20%, 96%) 0%, hsl(220, 25%, 98%) 100%)'
    }
  }

  // User messages: category gradient or default purple
  if (category) {
    return getCategoryGradient(category, isDark)
  }

  // Default user gradient (purple)
  if (isDark) {
    return 'linear-gradient(135deg, hsl(270, 70%, 25%) 0%, hsl(270, 75%, 20%) 100%)'
  } else {
    return 'linear-gradient(135deg, hsl(270, 60%, 90%) 0%, hsl(270, 65%, 95%) 100%)'
  }
}

/**
 * Get border color for a category (for accents)
 */
export function getCategoryBorderColor(category: string, isDark: boolean = false): string {
  const baseColor = getCategoryColor(category)

  // Extract HSL values
  const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hslMatch) return isDark ? 'hsl(0, 0%, 30%)' : 'hsl(0, 0%, 70%)'

  const [, h, s, l] = hslMatch
  const hue = parseInt(h)
  const sat = parseInt(s)
  const light = parseInt(l)

  if (isDark) {
    return `hsl(${hue}, ${sat}%, ${Math.max(light - 10, 20)}%)`
  } else {
    return `hsl(${hue}, ${Math.max(sat - 10, 30)}%, ${Math.min(light + 10, 80)}%)`
  }
}

/**
 * Get glow/shadow effect for category (for hover states)
 */
export function getCategoryGlow(category: string, isDark: boolean = false): string {
  const baseColor = getCategoryColor(category)

  // Extract HSL values
  const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hslMatch) return isDark ? '0 0 20px rgba(255, 255, 255, 0.1)' : '0 0 20px rgba(0, 0, 0, 0.1)'

  const [, h, s, l] = hslMatch

  if (isDark) {
    return `0 0 20px hsla(${h}, ${s}%, ${l}%, 0.3), 0 0 40px hsla(${h}, ${s}%, ${l}%, 0.15)`
  } else {
    return `0 0 15px hsla(${h}, ${s}%, ${l}%, 0.4), 0 0 30px hsla(${h}, ${s}%, ${l}%, 0.2)`
  }
}
