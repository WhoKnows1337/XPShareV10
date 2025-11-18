/**
 * Category Themes for Success Reveal Page
 *
 * Defines visual themes for each category including:
 * - Background gradients
 * - Accent colors (Tailwind classes)
 * - Hero illustrations/icons
 * - Mood/atmosphere settings
 */

import { getCategoryColor, getCategoryEmoji } from '@/lib/constants/categories'

export interface CategoryTheme {
  /** Category slug */
  slug: string
  /** Hero emoji (large display) */
  heroEmoji: string
  /** Background gradient (Tailwind classes) */
  gradient: string
  /** Text accent color (Tailwind class) */
  accentColor: string
  /** Border accent color (Tailwind class) */
  borderColor: string
  /** Glow/shadow color for effects */
  glowColor: string
  /** Mood descriptor for UI tone */
  mood: 'mysterious' | 'cosmic' | 'spiritual' | 'scientific' | 'energetic' | 'ethereal'
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  // UFO & Aerial Phenomena
  'ufo-sighting': {
    slug: 'ufo-sighting',
    heroEmoji: '🛸',
    gradient: 'from-blue-950/40 via-purple-900/30 to-indigo-950/40',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/50',
    mood: 'cosmic',
  },
  'ufo-uap': {
    slug: 'ufo-uap',
    heroEmoji: '🛸',
    gradient: 'from-purple-950/40 via-blue-900/30 to-violet-950/40',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/50',
    mood: 'cosmic',
  },

  // Near-Death & OBE
  'near-death-experience': {
    slug: 'near-death-experience',
    heroEmoji: '💫',
    gradient: 'from-cyan-950/30 via-teal-900/20 to-blue-950/30',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/50',
    mood: 'ethereal',
  },
  'nde-obe': {
    slug: 'nde-obe',
    heroEmoji: '💫',
    gradient: 'from-blue-950/30 via-cyan-900/20 to-indigo-950/30',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/50',
    mood: 'ethereal',
  },
  'out-of-body-experience': {
    slug: 'out-of-body-experience',
    heroEmoji: '✨',
    gradient: 'from-indigo-950/30 via-blue-900/20 to-purple-950/30',
    accentColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/50',
    mood: 'ethereal',
  },

  // Dreams & Altered States
  'lucid-dream': {
    slug: 'lucid-dream',
    heroEmoji: '💭',
    gradient: 'from-purple-950/30 via-violet-900/20 to-fuchsia-950/30',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/50',
    mood: 'ethereal',
  },
  'dreams': {
    slug: 'dreams',
    heroEmoji: '💭',
    gradient: 'from-cyan-950/30 via-blue-900/20 to-indigo-950/30',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/50',
    mood: 'ethereal',
  },

  // Paranormal & Spirits
  'paranormal': {
    slug: 'paranormal',
    heroEmoji: '👻',
    gradient: 'from-slate-950/50 via-purple-950/30 to-gray-950/50',
    accentColor: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/50',
    mood: 'mysterious',
  },
  'paranormal-anomalies': {
    slug: 'paranormal-anomalies',
    heroEmoji: '👻',
    gradient: 'from-gray-950/50 via-red-950/30 to-slate-950/50',
    accentColor: 'text-red-300',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-red-500/50',
    mood: 'mysterious',
  },
  'ghosts-spirits': {
    slug: 'ghosts-spirits',
    heroEmoji: '👻',
    gradient: 'from-indigo-950/40 via-purple-900/30 to-slate-950/40',
    accentColor: 'text-indigo-300',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/50',
    mood: 'mysterious',
  },
  'entity-encounter': {
    slug: 'entity-encounter',
    heroEmoji: '👽',
    gradient: 'from-green-950/40 via-emerald-900/30 to-teal-950/40',
    accentColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/50',
    mood: 'mysterious',
  },

  // Psychedelics & Consciousness
  'psychedelic': {
    slug: 'psychedelic',
    heroEmoji: '🌈',
    gradient: 'from-fuchsia-950/40 via-purple-900/30 to-pink-950/40',
    accentColor: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-500/30',
    glowColor: 'shadow-fuchsia-500/50',
    mood: 'energetic',
  },
  'psychedelics': {
    slug: 'psychedelics',
    heroEmoji: '🌈',
    gradient: 'from-pink-950/40 via-fuchsia-900/30 to-purple-950/40',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-pink-500/50',
    mood: 'energetic',
  },
  'meditation': {
    slug: 'meditation',
    heroEmoji: '🧘',
    gradient: 'from-teal-950/30 via-emerald-900/20 to-green-950/30',
    accentColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    glowColor: 'shadow-teal-500/50',
    mood: 'spiritual',
  },
  'altered-states': {
    slug: 'altered-states',
    heroEmoji: '🌀',
    gradient: 'from-violet-950/40 via-purple-900/30 to-fuchsia-950/40',
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    glowColor: 'shadow-violet-500/50',
    mood: 'ethereal',
  },

  // Patterns & Phenomena
  'synchronicity': {
    slug: 'synchronicity',
    heroEmoji: '⚡',
    gradient: 'from-yellow-950/40 via-amber-900/30 to-orange-950/40',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/50',
    mood: 'energetic',
  },
  'precognition': {
    slug: 'precognition',
    heroEmoji: '🔮',
    gradient: 'from-purple-950/40 via-violet-900/30 to-indigo-950/40',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/50',
    mood: 'mysterious',
  },
  'prophecy-premonition': {
    slug: 'prophecy-premonition',
    heroEmoji: '🔮',
    gradient: 'from-amber-950/40 via-orange-900/30 to-yellow-950/40',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/50',
    mood: 'mysterious',
  },
  'telepathy': {
    slug: 'telepathy',
    heroEmoji: '🧠',
    gradient: 'from-cyan-950/40 via-blue-900/30 to-teal-950/40',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/50',
    mood: 'scientific',
  },
  'healing': {
    slug: 'healing',
    heroEmoji: '💚',
    gradient: 'from-emerald-950/30 via-green-900/20 to-teal-950/30',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/50',
    mood: 'spiritual',
  },

  // Time & Reality
  'time-anomaly': {
    slug: 'time-anomaly',
    heroEmoji: '🕐',
    gradient: 'from-orange-950/40 via-red-900/30 to-amber-950/40',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/50',
    mood: 'mysterious',
  },
  'glitch-matrix': {
    slug: 'glitch-matrix',
    heroEmoji: '🌐',
    gradient: 'from-emerald-950/40 via-green-900/30 to-teal-950/40',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/50',
    mood: 'scientific',
  },

  // Fallback
  'other': {
    slug: 'other',
    heroEmoji: '❓',
    gradient: 'from-slate-950/30 via-gray-900/20 to-zinc-950/30',
    accentColor: 'text-slate-400',
    borderColor: 'border-slate-500/30',
    glowColor: 'shadow-slate-500/50',
    mood: 'mysterious',
  },
}

/**
 * Get theme for a category
 * @param category - Category slug
 * @returns CategoryTheme object
 */
export function getCategoryTheme(category: string): CategoryTheme {
  return (
    CATEGORY_THEMES[category] || {
      slug: category,
      heroEmoji: getCategoryEmoji(category),
      gradient: 'from-slate-950/30 via-gray-900/20 to-zinc-950/30',
      accentColor: 'text-slate-400',
      borderColor: 'border-slate-500/30',
      glowColor: 'shadow-slate-500/50',
      mood: 'mysterious' as const,
    }
  )
}

/**
 * Get mood-specific particle effects config
 * @param mood - Theme mood
 * @returns Particle/animation settings
 */
export function getMoodEffects(mood: CategoryTheme['mood']) {
  const effects = {
    mysterious: {
      particles: 'fog',
      animation: 'slow-drift',
      intensity: 0.3,
    },
    cosmic: {
      particles: 'stars',
      animation: 'twinkle',
      intensity: 0.6,
    },
    spiritual: {
      particles: 'light-orbs',
      animation: 'gentle-float',
      intensity: 0.4,
    },
    scientific: {
      particles: 'data-points',
      animation: 'precise-grid',
      intensity: 0.5,
    },
    energetic: {
      particles: 'energy-sparks',
      animation: 'rapid-pulse',
      intensity: 0.7,
    },
    ethereal: {
      particles: 'soft-glow',
      animation: 'smooth-wave',
      intensity: 0.5,
    },
  }
  return effects[mood]
}

// Type exports
export type CategoryThemeMood = CategoryTheme['mood']
