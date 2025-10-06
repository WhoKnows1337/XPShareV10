// XP and Level calculation utilities

export interface LevelInfo {
  level: number
  currentXP: number
  xpForCurrentLevel: number
  xpForNextLevel: number
  xpProgress: number
  xpProgressPercent: number
}

// Level thresholds (cumulative XP needed)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1850,   // Level 7
  2500,   // Level 8
  3250,   // Level 9
  4100,   // Level 10
  5050,   // Level 11
  6100,   // Level 12
  7250,   // Level 13
  8500,   // Level 14
  9850,   // Level 15
  11300,  // Level 16
  12850,  // Level 17
  14500,  // Level 18
  16250,  // Level 19
  18100,  // Level 20
  20050,  // Level 21
  22100,  // Level 22
  24250,  // Level 23
  26500,  // Level 24
  28850,  // Level 25
  31300,  // Level 26
  33850,  // Level 27
  36500,  // Level 28
  39250,  // Level 29
  42100,  // Level 30
]

export function calculateLevel(totalXP: number): LevelInfo {
  let level = 1

  // Find the current level
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  // Calculate XP for current and next level
  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] || 0
  const xpForNextLevel = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 2000

  // Calculate progress
  const xpProgress = totalXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const xpProgressPercent = Math.round((xpProgress / xpNeeded) * 100)

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    xpProgressPercent,
  }
}

export function getLevelTitle(level: number): string {
  if (level >= 30) return 'Master Explorer'
  if (level >= 25) return 'Legendary Witness'
  if (level >= 20) return 'Expert Chronicler'
  if (level >= 15) return 'Seasoned Storyteller'
  if (level >= 10) return 'Experienced Sharer'
  if (level >= 5) return 'Active Member'
  return 'Newcomer'
}

export function getLevelColor(level: number): string {
  if (level >= 30) return 'text-purple-600'
  if (level >= 25) return 'text-yellow-600'
  if (level >= 20) return 'text-orange-600'
  if (level >= 15) return 'text-blue-600'
  if (level >= 10) return 'text-green-600'
  if (level >= 5) return 'text-teal-600'
  return 'text-gray-600'
}
