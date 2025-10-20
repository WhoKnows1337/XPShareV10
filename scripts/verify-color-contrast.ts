/**
 * Color Contrast Verification Script
 *
 * Verifies WCAG AAA compliance for all category colors
 *
 * WCAG AAA Requirements:
 * - Normal text: 7:1 contrast ratio
 * - Large text (18pt+ or 14pt+ bold): 4.5:1 contrast ratio
 *
 * Run: npx ts-node scripts/verify-color-contrast.ts
 */

interface ColorCheck {
  category: string
  color: string
  contrastOnWhite: number
  contrastOnBlack: number
  meetsAAANormal: boolean
  meetsAAALarge: boolean
  recommendation?: string
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(...rgb1)
  const lum2 = getLuminance(...rgb2)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Parse HSL color string
 */
function parseHSL(hslString: string): [number, number, number] | null {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return null

  return [
    parseInt(match[1]),
    parseInt(match[2]),
    parseInt(match[3])
  ]
}

/**
 * Suggest adjusted lightness for better contrast
 */
function suggestLightnessAdjustment(h: number, s: number, currentL: number): number {
  // For AAA normal text on white, we need 7:1 contrast
  // Darker colors (lower lightness) have better contrast on white
  // Try different lightness values to find one that meets AAA

  for (let l = currentL; l >= 20; l -= 5) {
    const rgb = hslToRgb(h, s, l)
    const contrast = getContrastRatio(rgb, [255, 255, 255])
    if (contrast >= 7) {
      return l
    }
  }

  return currentL // Return original if no adjustment found
}

// Category colors from category-colors.ts
const categoryColors: Record<string, string> = {
  'UFO': 'hsl(270, 80%, 60%)',
  'Dreams': 'hsl(210, 85%, 65%)',
  'Paranormal': 'hsl(330, 85%, 65%)',
  'NDE': 'hsl(180, 75%, 55%)',
  'OBE': 'hsl(280, 75%, 65%)',
  'Synchronicity': 'hsl(45, 95%, 55%)',
  'Entity Contact': 'hsl(260, 80%, 60%)',
  'Time Anomaly': 'hsl(30, 95%, 55%)',
  'Energy': 'hsl(120, 70%, 50%)',
  'Consciousness': 'hsl(250, 75%, 60%)',
  'Meditation': 'hsl(140, 65%, 50%)',
  'Psychedelic': 'hsl(300, 85%, 60%)',
  'Astral Projection': 'hsl(240, 70%, 60%)',
  'Precognition': 'hsl(280, 80%, 60%)',
  'Telepathy': 'hsl(190, 75%, 55%)',
  'Remote Viewing': 'hsl(200, 70%, 55%)',
  'Healing': 'hsl(150, 65%, 50%)',
  'Manifestation': 'hsl(50, 90%, 55%)',
  'Glitch in the Matrix': 'hsl(0, 0%, 50%)',
  'Deja Vu': 'hsl(35, 85%, 55%)',
  'Past Life': 'hsl(270, 70%, 55%)',
  'Future Vision': 'hsl(200, 75%, 55%)',
  'Shadow People': 'hsl(0, 0%, 30%)',
  'Light Beings': 'hsl(55, 95%, 60%)',
  'Angels': 'hsl(210, 80%, 70%)',
  'Spirits': 'hsl(280, 70%, 65%)',
  'Ghosts': 'hsl(0, 0%, 40%)',
  'Poltergeist': 'hsl(0, 75%, 55%)',
  'Cryptid': 'hsl(100, 60%, 45%)',
  'Bigfoot': 'hsl(25, 60%, 40%)',
  'Monster': 'hsl(0, 70%, 50%)',
  'Lake Monster': 'hsl(200, 70%, 50%)',
  'Other': 'hsl(0, 0%, 55%)',
}

// Run verification
console.log('\n🎨 Color Contrast Verification for WCAG AAA\n')
console.log('='.repeat(80))

const results: ColorCheck[] = []
const white: [number, number, number] = [255, 255, 255]
const black: [number, number, number] = [0, 0, 0]

let failedNormal = 0
let failedLarge = 0

for (const [category, hslString] of Object.entries(categoryColors)) {
  const hsl = parseHSL(hslString)
  if (!hsl) {
    console.error(`❌ Failed to parse HSL for ${category}: ${hslString}`)
    continue
  }

  const rgb = hslToRgb(...hsl)
  const contrastOnWhite = getContrastRatio(rgb, white)
  const contrastOnBlack = getContrastRatio(rgb, black)

  const meetsAAANormal = contrastOnWhite >= 7 || contrastOnBlack >= 7
  const meetsAAALarge = contrastOnWhite >= 4.5 || contrastOnBlack >= 4.5

  let recommendation: string | undefined

  if (!meetsAAANormal) {
    failedNormal++
    const suggestedL = suggestLightnessAdjustment(hsl[0], hsl[1], hsl[2])
    if (suggestedL !== hsl[2]) {
      recommendation = `Try hsl(${hsl[0]}, ${hsl[1]}%, ${suggestedL}%) for AAA compliance`
    }
  }

  if (!meetsAAALarge) {
    failedLarge++
  }

  results.push({
    category,
    color: hslString,
    contrastOnWhite,
    contrastOnBlack,
    meetsAAANormal,
    meetsAAALarge,
    recommendation
  })
}

// Sort by AAA compliance status (failures first)
results.sort((a, b) => {
  if (a.meetsAAANormal === b.meetsAAANormal) {
    return a.category.localeCompare(b.category)
  }
  return a.meetsAAANormal ? 1 : -1
})

// Print results
for (const result of results) {
  const statusNormal = result.meetsAAANormal ? '✅ AAA' : '⚠️  AA'
  const statusLarge = result.meetsAAALarge ? '✅ AAA' : '⚠️  AA'

  console.log(`\n${result.category}`)
  console.log(`  Color: ${result.color}`)
  console.log(`  Contrast on white: ${result.contrastOnWhite.toFixed(2)}:1 ${statusNormal}`)
  console.log(`  Contrast on black: ${result.contrastOnBlack.toFixed(2)}:1`)
  console.log(`  Normal text: ${statusNormal} | Large text: ${statusLarge}`)

  if (result.recommendation) {
    console.log(`  💡 ${result.recommendation}`)
  }
}

// Summary
console.log('\n' + '='.repeat(80))
console.log('\n📊 Summary:')
console.log(`  Total categories: ${results.length}`)
console.log(`  AAA Normal text (7:1): ${results.length - failedNormal}/${results.length}`)
console.log(`  AAA Large text (4.5:1): ${results.length - failedLarge}/${results.length}`)

if (failedNormal === 0) {
  console.log('\n✅ All colors meet WCAG AAA for normal text!')
} else {
  console.log(`\n⚠️  ${failedNormal} colors need adjustment for AAA normal text compliance`)
}

if (failedLarge === 0) {
  console.log('✅ All colors meet WCAG AAA for large text!')
} else {
  console.log(`⚠️  ${failedLarge} colors need adjustment for AAA large text compliance`)
}

console.log('\n')
