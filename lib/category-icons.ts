import {
  Brain,
  Ghost,
  Heart,
  Sparkles,
  Telescope,
  Zap,
  Moon,
  Clock,
  HelpCircle,
  Eye,
  Footprints,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps category slugs to Lucide Icons
 * This provides a fallback when DB doesn't have an emoji, or when we want a consistent icon set
 */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // Bewusstsein & Innere Erfahrungen
  'consciousness-inner': Brain,
  'dreams': Moon,
  'altered-states': Brain,

  // Außerirdisches & Himmelsphänomene
  'extraterrestrial-sky': Telescope,
  'ufo-uap': Telescope,

  // Wesen & Erscheinungen
  'entities-apparitions': Ghost,
  'ghost-spirit': Ghost,

  // Zeit, Raum & Synchronizität
  'time-space-sync': Clock,
  'synchronicity': Sparkles,
  'glitch-matrix': Clock,

  // Gesundheit
  'gesundheit': Heart,

  // PSI & Außersinnliche Wahrnehmung
  'psychic': Eye,
  'remote-viewing': Eye,

  // Kryptide
  'cryptid': Footprints,

  // Nahtod
  'near-death': Zap,
  'nde': Zap,

  // Legacy/old slugs (for backwards compatibility)
  'paranormal': Ghost,
  'ufo_sighting': Telescope,
  'spiritual_experience': Heart,
  'near_death_experience': Zap,
  'psychic_experience': Eye,
  'cryptid_encounter': Footprints,
  'other': HelpCircle,
};

/**
 * Get Lucide Icon for a category
 * Returns HelpCircle as fallback
 */
export function getCategoryIcon(slug: string): LucideIcon {
  const lowerSlug = slug.toLowerCase();
  return CATEGORY_ICON_MAP[lowerSlug] || HelpCircle;
}

/**
 * Category color mapping (fallback if DB doesn't have color)
 */
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  // Bewusstsein
  'consciousness-inner': '#9333EA', // purple
  'dreams': '#9333EA',
  'altered-states': '#9333EA',

  // Außerirdisches
  'extraterrestrial-sky': '#06B6D4', // cyan
  'ufo-uap': '#06B6D4',

  // Wesen
  'entities-apparitions': '#EC4899', // pink
  'ghost-spirit': '#EC4899',

  // Zeit & Raum
  'time-space-sync': '#F97316', // orange
  'synchronicity': '#F97316',
  'glitch-matrix': '#F97316',

  // Gesundheit
  'gesundheit': '#10B981', // green

  // PSI
  'psychic': '#6366F1', // indigo
  'remote-viewing': '#6366F1',

  // Kryptide
  'cryptid': '#F59E0B', // amber

  // Nahtod
  'near-death': '#EAB308', // yellow
  'nde': '#EAB308',

  // Legacy
  'paranormal': '#9333EA',
  'ufo_sighting': '#06B6D4',
  'spiritual_experience': '#10B981',
  'near_death_experience': '#EAB308',
  'psychic_experience': '#6366F1',
  'cryptid_encounter': '#F59E0B',
  'other': '#6B7280', // gray
};

/**
 * Get category color
 * Returns default gray as fallback
 */
export function getCategoryColor(slug: string, dbColor?: string | null): string {
  // Priority 1: Use DB color if available
  if (dbColor) {
    return dbColor;
  }

  // Priority 2: Use mapping
  const lowerSlug = slug.toLowerCase();
  return CATEGORY_COLOR_MAP[lowerSlug] || '#6B7280';
}

/**
 * Get Tailwind background class for category
 */
export function getCategoryBgClass(slug: string): string {
  const colorMap: Record<string, string> = {
    'consciousness-inner': 'bg-purple-500',
    'dreams': 'bg-purple-500',
    'extraterrestrial-sky': 'bg-cyan-500',
    'ufo-uap': 'bg-cyan-500',
    'entities-apparitions': 'bg-pink-500',
    'ghost-spirit': 'bg-pink-500',
    'time-space-sync': 'bg-orange-500',
    'synchronicity': 'bg-orange-500',
    'gesundheit': 'bg-green-500',
    'psychic': 'bg-indigo-500',
    'cryptid': 'bg-amber-500',
    'near-death': 'bg-yellow-500',
    'other': 'bg-gray-500',
  };

  const lowerSlug = slug.toLowerCase();
  return colorMap[lowerSlug] || 'bg-gray-500';
}
