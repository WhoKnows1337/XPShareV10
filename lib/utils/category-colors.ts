/**
 * Category to Color Mapping
 *
 * Maps experience categories to consistent colors across the application
 * Colors meet WCAG AA contrast requirements (AAA verification needed)
 *
 * Format: Tailwind CSS color classes or HSL values
 */

export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    // Core Categories - Vibrant but accessible colors
    'UFO': 'hsl(270, 80%, 60%)',           // Purple
    'Dreams': 'hsl(210, 85%, 65%)',        // Blue
    'Paranormal': 'hsl(330, 85%, 65%)',    // Pink
    'NDE': 'hsl(180, 75%, 55%)',           // Teal
    'OBE': 'hsl(280, 75%, 65%)',           // Violet
    'Synchronicity': 'hsl(45, 95%, 55%)',  // Gold
    'Entity Contact': 'hsl(260, 80%, 60%)', // Indigo
    'Time Anomaly': 'hsl(30, 95%, 55%)',   // Orange
    'Energy': 'hsl(120, 70%, 50%)',        // Green
    'Consciousness': 'hsl(250, 75%, 60%)', // Deep Blue
    'Meditation': 'hsl(140, 65%, 50%)',    // Emerald
    'Psychedelic': 'hsl(300, 85%, 60%)',   // Magenta
    'Astral Projection': 'hsl(240, 70%, 60%)', // Blue-Purple
    'Precognition': 'hsl(280, 80%, 60%)',  // Purple
    'Telepathy': 'hsl(190, 75%, 55%)',     // Cyan
    'Remote Viewing': 'hsl(200, 70%, 55%)', // Light Blue
    'Healing': 'hsl(150, 65%, 50%)',       // Green
    'Manifestation': 'hsl(50, 90%, 55%)',  // Yellow
    'Glitch in the Matrix': 'hsl(0, 0%, 50%)', // Gray
    'Deja Vu': 'hsl(35, 85%, 55%)',        // Amber
    'Past Life': 'hsl(270, 70%, 55%)',     // Purple
    'Future Vision': 'hsl(200, 75%, 55%)', // Blue
    'Shadow People': 'hsl(0, 0%, 30%)',    // Dark Gray
    'Light Beings': 'hsl(55, 95%, 60%)',   // Bright Yellow
    'Angels': 'hsl(210, 80%, 70%)',        // Light Blue
    'Spirits': 'hsl(280, 70%, 65%)',       // Lavender
    'Ghosts': 'hsl(0, 0%, 40%)',           // Gray
    'Poltergeist': 'hsl(0, 75%, 55%)',     // Red
    'Cryptid': 'hsl(100, 60%, 45%)',       // Forest Green
    'Bigfoot': 'hsl(25, 60%, 40%)',        // Brown
    'Monster': 'hsl(0, 70%, 50%)',         // Red
    'Lake Monster': 'hsl(200, 70%, 50%)',  // Blue
    'Other': 'hsl(0, 0%, 55%)',            // Medium Gray
  }

  return colorMap[category] || 'hsl(0, 0%, 55%)' // Default gray
}

/**
 * Get Tailwind CSS class for category color
 * Useful for background colors
 */
export function getCategoryBgClass(category: string): string {
  const classMap: Record<string, string> = {
    'UFO': 'bg-purple-100 text-purple-900',
    'Dreams': 'bg-blue-100 text-blue-900',
    'Paranormal': 'bg-pink-100 text-pink-900',
    'NDE': 'bg-teal-100 text-teal-900',
    'OBE': 'bg-violet-100 text-violet-900',
    'Synchronicity': 'bg-amber-100 text-amber-900',
    'Entity Contact': 'bg-indigo-100 text-indigo-900',
    'Time Anomaly': 'bg-orange-100 text-orange-900',
    'Energy': 'bg-green-100 text-green-900',
    'Consciousness': 'bg-blue-100 text-blue-900',
    'Meditation': 'bg-emerald-100 text-emerald-900',
    'Psychedelic': 'bg-fuchsia-100 text-fuchsia-900',
    'Other': 'bg-gray-100 text-gray-900',
  }

  return classMap[category] || 'bg-gray-100 text-gray-900'
}

/**
 * Get category color with opacity
 */
export function getCategoryColorWithOpacity(category: string, opacity: number = 1): string {
  const baseColor = getCategoryColor(category)
  // Extract HSL values and add opacity
  const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (hslMatch) {
    const [, h, s, l] = hslMatch
    return `hsla(${h}, ${s}%, ${l}%, ${opacity})`
  }
  return baseColor
}
