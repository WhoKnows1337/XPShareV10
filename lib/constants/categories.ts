/**
 * Central Category Constants
 *
 * Defines colors, emojis, and metadata for all experience categories
 * Used across: XPDNABadge, XPDNASpectrum, ExperienceMap, CategoryRadarChart, etc.
 *
 * Source: profil.md lines 1514-1543
 */

// Category Colors - Consistent across all components
export const CATEGORY_COLORS: Record<string, string> = {
  // Core Categories
  'ufo-sighting': '#FF6B35',        // Orange-Red
  'ufo-uap': '#7C3AED',             // Purple (alt name)
  'near-death-experience': '#4ECDC4', // Teal
  'nde-obe': '#2563EB',             // Blue (alt name)
  'out-of-body-experience': '#3498DB', // Blue
  'lucid-dream': '#9B59B6',         // Purple
  'dreams': '#0891B2',              // Cyan (alt name)

  // Paranormal & Spiritual
  'paranormal': '#E74C3C',          // Red
  'paranormal-anomalies': '#DC2626', // Dark Red (alt name)
  'ghosts-spirits': '#6366F1',      // Indigo
  'entity-encounter': '#FF5722',    // Deep Orange

  // Consciousness & Altered States
  'psychedelic': '#F39C12',         // Yellow-Orange
  'psychedelics': '#DB2777',        // Pink (alt name)
  'meditation': '#16A085',          // Green
  'altered-states': '#8B5CF6',      // Violet

  // Patterns & Phenomena
  'synchronicity': '#E91E63',       // Pink
  'precognition': '#9C27B0',        // Deep Purple
  'prophecy-premonition': '#F59E0B', // Amber
  'telepathy': '#00BCD4',           // Cyan
  'healing': '#4CAF50',             // Light Green

  // Time & Reality
  'time-anomaly': '#EA580C',        // Orange
  'glitch-matrix': '#10B981',       // Emerald

  // Fallback
  'other': '#64748b',               // Slate Gray
} as const

// Category Emojis - For UI display
export const CATEGORY_EMOJIS: Record<string, string> = {
  // Core Categories
  'ufo-sighting': '🛸',
  'ufo-uap': '🛸',
  'near-death-experience': '💫',
  'nde-obe': '💫',
  'out-of-body-experience': '✨',
  'lucid-dream': '💭',
  'dreams': '💭',

  // Paranormal & Spiritual
  'paranormal': '👻',
  'paranormal-anomalies': '👻',
  'ghosts-spirits': '👻',
  'entity-encounter': '👽',

  // Consciousness & Altered States
  'psychedelic': '🌈',
  'psychedelics': '🌈',
  'meditation': '🧘',
  'altered-states': '🌀',

  // Patterns & Phenomena
  'synchronicity': '⚡',
  'precognition': '🔮',
  'prophecy-premonition': '🔮',
  'telepathy': '🧠',
  'healing': '💚',

  // Time & Reality
  'time-anomaly': '🕐',
  'glitch-matrix': '🌐',

  // Fallback
  'other': '❓',
} as const

// Category Display Names - Human-readable labels
export const CATEGORY_LABELS: Record<string, string> = {
  'ufo-sighting': 'UFO Sighting',
  'ufo-uap': 'UFO/UAP',
  'near-death-experience': 'Near-Death Experience',
  'nde-obe': 'NDE/OBE',
  'out-of-body-experience': 'Out-of-Body Experience',
  'lucid-dream': 'Lucid Dream',
  'dreams': 'Dreams',
  'paranormal': 'Paranormal',
  'paranormal-anomalies': 'Paranormal Anomalies',
  'ghosts-spirits': 'Ghosts & Spirits',
  'entity-encounter': 'Entity Encounter',
  'psychedelic': 'Psychedelic',
  'psychedelics': 'Psychedelics',
  'meditation': 'Meditation',
  'altered-states': 'Altered States',
  'synchronicity': 'Synchronicity',
  'precognition': 'Precognition',
  'prophecy-premonition': 'Prophecy/Premonition',
  'telepathy': 'Telepathy',
  'healing': 'Healing',
  'time-anomaly': 'Time Anomaly',
  'glitch-matrix': 'Glitch in Matrix',
  'other': 'Other',
} as const

/**
 * Get color for a category
 * @param category - Category slug
 * @returns Hex color string
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other
}

/**
 * Get emoji for a category
 * @param category - Category slug
 * @returns Emoji string
 */
export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.other
}

/**
 * Get display label for a category
 * @param category - Category slug
 * @returns Human-readable label
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format category slug to display name
 * @param category - Category slug
 * @returns Formatted display name
 */
export function formatCategoryName(category: string): string {
  return category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Type exports
export type CategorySlug = keyof typeof CATEGORY_COLORS
export type CategoryColor = typeof CATEGORY_COLORS[CategorySlug]
export type CategoryEmoji = typeof CATEGORY_EMOJIS[CategorySlug]
