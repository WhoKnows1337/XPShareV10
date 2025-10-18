/**
 * Lunar Phase Calculator
 *
 * Calculates moon phase for any given date using astronomical algorithms.
 * Based on Jean Meeus' "Astronomical Algorithms" (1991)
 *
 * No external APIs required - fully deterministic.
 */

export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

export interface LunarPhaseData {
  phase: MoonPhase
  illumination: number // 0-1 (0 = new moon, 1 = full moon)
  age: number // Days since new moon (0-29.53)
  emoji: string
  name: string
  description: string
}

/**
 * Calculate Julian Date Number
 * Used as basis for astronomical calculations
 */
function julianDate(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let y = year
  let m = month

  if (m <= 2) {
    y -= 1
    m += 12
  }

  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)

  const JD = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + B - 1524.5

  return JD
}

/**
 * Calculate moon age in days since last new moon
 * Based on synodic month period (29.53059 days)
 */
function calculateMoonAge(jd: number): number {
  // Known new moon: January 6, 2000, 18:14 UTC (JD 2451550.26)
  const knownNewMoon = 2451550.26
  const synodicMonth = 29.53058867 // Average length of lunar month in days

  // Days since known new moon
  const daysSinceKnownNewMoon = jd - knownNewMoon

  // Calculate current position in lunar cycle
  const cycles = daysSinceKnownNewMoon / synodicMonth
  const age = (cycles - Math.floor(cycles)) * synodicMonth

  return age
}

/**
 * Calculate illumination percentage
 * 0 = new moon, 1 = full moon
 */
function calculateIllumination(age: number): number {
  const synodicMonth = 29.53058867

  // Phase angle in radians (0 to 2π)
  const phaseAngle = (age / synodicMonth) * 2 * Math.PI

  // Illumination using cosine formula
  // Illumination = (1 - cos(phase)) / 2
  const illumination = (1 - Math.cos(phaseAngle)) / 2

  return illumination
}

/**
 * Determine moon phase name from age
 */
function getPhaseFromAge(age: number): MoonPhase {
  const synodicMonth = 29.53058867
  const eighthPhase = synodicMonth / 8

  // 8 phases divided into equal segments
  if (age < eighthPhase) return 'new_moon'
  if (age < 2 * eighthPhase) return 'waxing_crescent'
  if (age < 3 * eighthPhase) return 'first_quarter'
  if (age < 4 * eighthPhase) return 'waxing_gibbous'
  if (age < 5 * eighthPhase) return 'full_moon'
  if (age < 6 * eighthPhase) return 'waning_gibbous'
  if (age < 7 * eighthPhase) return 'last_quarter'
  return 'waning_crescent'
}

/**
 * Get emoji and name for moon phase
 */
function getPhaseMetadata(phase: MoonPhase): {
  emoji: string
  name: string
  description: string
} {
  const metadata: Record<MoonPhase, { emoji: string; name: string; description: string }> = {
    new_moon: {
      emoji: '🌑',
      name: 'New Moon',
      description: 'Moon is between Earth and Sun, invisible from Earth'
    },
    waxing_crescent: {
      emoji: '🌒',
      name: 'Waxing Crescent',
      description: 'Growing sliver of light appears after new moon'
    },
    first_quarter: {
      emoji: '🌓',
      name: 'First Quarter',
      description: 'Half of moon is illuminated, right side visible'
    },
    waxing_gibbous: {
      emoji: '🌔',
      name: 'Waxing Gibbous',
      description: 'More than half illuminated, approaching full moon'
    },
    full_moon: {
      emoji: '🌕',
      name: 'Full Moon',
      description: 'Entire face of moon is illuminated, Earth is between Sun and Moon'
    },
    waning_gibbous: {
      emoji: '🌖',
      name: 'Waning Gibbous',
      description: 'More than half illuminated, decreasing after full moon'
    },
    last_quarter: {
      emoji: '🌗',
      name: 'Last Quarter',
      description: 'Half of moon is illuminated, left side visible'
    },
    waning_crescent: {
      emoji: '🌘',
      name: 'Waning Crescent',
      description: 'Thin sliver of light before new moon'
    }
  }

  return metadata[phase]
}

/**
 * Main function: Calculate lunar phase for a given date
 *
 * @param date - Date to calculate moon phase for
 * @returns Complete lunar phase data
 *
 * @example
 * ```typescript
 * const phase = calculateMoonPhase(new Date('2024-10-17'))
 * console.log(phase.emoji) // 🌕
 * console.log(phase.name) // "Full Moon"
 * console.log(phase.illumination) // 0.98
 * ```
 */
export function calculateMoonPhase(date: Date): LunarPhaseData {
  // Normalize to UTC midnight to avoid timezone issues
  const utcDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ))

  const jd = julianDate(utcDate)
  const age = calculateMoonAge(jd)
  const illumination = calculateIllumination(age)
  const phase = getPhaseFromAge(age)
  const { emoji, name, description } = getPhaseMetadata(phase)

  return {
    phase,
    illumination: Math.round(illumination * 100) / 100, // Round to 2 decimals
    age: Math.round(age * 100) / 100,
    emoji,
    name,
    description
  }
}

/**
 * Check if a date is within ±3 days of a specific moon phase
 * Useful for pattern detection
 *
 * @example
 * ```typescript
 * const isFullMoonPeriod = isMoonPhaseWindow(new Date(), 'full_moon', 3)
 * ```
 */
export function isMoonPhaseWindow(
  date: Date,
  targetPhase: MoonPhase,
  windowDays: number = 3
): boolean {
  const currentPhase = calculateMoonPhase(date)

  // Check ±windowDays
  for (let offset = -windowDays; offset <= windowDays; offset++) {
    const checkDate = new Date(date)
    checkDate.setDate(checkDate.getDate() + offset)
    const phase = calculateMoonPhase(checkDate)

    if (phase.phase === targetPhase) {
      return true
    }
  }

  return false
}

/**
 * Get all dates for a specific moon phase in a given year
 * Useful for populating external_events table
 *
 * @example
 * ```typescript
 * const fullMoons2024 = getMoonPhaseDatesInYear(2024, 'full_moon')
 * // Returns ~12-13 dates (one per lunar month)
 * ```
 */
export function getMoonPhaseDatesInYear(
  year: number,
  targetPhase: MoonPhase
): Date[] {
  const dates: Date[] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year + 1, 0, 1)

  let currentDate = new Date(startDate)
  let lastPhase: MoonPhase | null = null

  // Iterate through every day of the year
  while (currentDate < endDate) {
    const phaseData = calculateMoonPhase(currentDate)

    // Detect phase transition (when phase changes TO target phase)
    if (phaseData.phase === targetPhase && lastPhase !== targetPhase) {
      dates.push(new Date(currentDate))
    }

    lastPhase = phaseData.phase
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * Calculate percentage of illumination as integer (0-100)
 * Convenience function for display
 */
export function getMoonIlluminationPercent(date: Date): number {
  const { illumination } = calculateMoonPhase(date)
  return Math.round(illumination * 100)
}

/**
 * Get simplified phase name for pattern grouping
 * Groups 8 phases into 4 major phases
 */
export function getSimplifiedPhase(date: Date): 'new' | 'waxing' | 'full' | 'waning' {
  const { phase } = calculateMoonPhase(date)

  switch (phase) {
    case 'new_moon':
      return 'new'
    case 'waxing_crescent':
    case 'first_quarter':
    case 'waxing_gibbous':
      return 'waxing'
    case 'full_moon':
      return 'full'
    case 'waning_gibbous':
    case 'last_quarter':
    case 'waning_crescent':
      return 'waning'
  }
}
