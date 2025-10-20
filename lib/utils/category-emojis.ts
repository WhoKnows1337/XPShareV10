/**
 * Category to Emoji Mapping
 *
 * Maps experience categories to their representative emojis
 * Used across the application for visual category representation
 */

export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    // Core Categories
    'UFO': '🛸',
    'Dreams': '💭',
    'Paranormal': '👻',
    'NDE': '💫',
    'OBE': '✨',
    'Synchronicity': '⚡',
    'Entity Contact': '👽',
    'Time Anomaly': '🕐',
    'Energy': '⚡',
    'Consciousness': '🧠',
    'Meditation': '🧘',
    'Psychedelic': '🍄',
    'Astral Projection': '🌌',
    'Precognition': '🔮',
    'Telepathy': '🧠',
    'Remote Viewing': '👁️',
    'Healing': '💚',
    'Manifestation': '✨',
    'Glitch in the Matrix': '🔄',
    'Deja Vu': '🔄',
    'Past Life': '⏪',
    'Future Vision': '⏩',
    'Shadow People': '🌑',
    'Light Beings': '☀️',
    'Angels': '😇',
    'Spirits': '👻',
    'Ghosts': '👻',
    'Poltergeist': '💥',
    'Cryptid': '🦎',
    'Bigfoot': '🦍',
    'Monster': '🐉',
    'Lake Monster': '🐍',
    'Other': '✨',
  }

  return emojiMap[category] || '✨' // Default sparkle emoji
}

/**
 * Get multiple category emojis
 */
export function getCategoryEmojis(categories: string[]): string[] {
  return categories.map(cat => getCategoryEmoji(cat))
}

/**
 * Get category with emoji as string
 */
export function getCategoryWithEmoji(category: string): string {
  return `${getCategoryEmoji(category)} ${category}`
}
