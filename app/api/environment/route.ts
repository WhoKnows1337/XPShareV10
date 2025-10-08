import { NextRequest, NextResponse } from 'next/server'

interface EnvironmentData {
  weather?: {
    condition: string
    temperature: number
    clouds: number
    wind: number
    humidity: number
  }
  moon: {
    phase: string
    illumination: number
    emoji: string
  }
  solar?: {
    activity: string
    kpIndex: number
    level: string
    hoursBeforeEvent: number
  }
}

// Calculate moon phase from date
function calculateMoonPhase(date: Date): { phase: string; illumination: number; emoji: string } {
  // Simple moon phase calculation (approximate)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let c = 0
  let e = 0
  let jd = 0
  let b = 0

  if (month < 3) {
    const year2 = year - 1
    const month2 = month + 12
    c = Math.floor(year2 / 100)
    e = c - Math.floor(c / 4) - 2
    jd = Math.floor(365.25 * (year2 + 4716)) + Math.floor(30.6001 * (month2 + 1)) + day + b - 1524.5
  } else {
    c = Math.floor(year / 100)
    e = c - Math.floor(c / 4) - 2
    jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5
  }

  const moonAge = ((jd - 2451550.1) / 29.530588853) % 1
  const illumination = Math.round((1 - Math.cos(moonAge * 2 * Math.PI)) * 50)

  let phase = ''
  let emoji = ''

  if (illumination < 5) {
    phase = 'Neumond'
    emoji = '🌑'
  } else if (illumination < 25) {
    phase = 'Zunehmender Sichelmond'
    emoji = '🌒'
  } else if (illumination < 45) {
    phase = 'Erstes Viertel'
    emoji = '🌓'
  } else if (illumination < 55) {
    phase = 'Zunehmender Mond'
    emoji = '🌔'
  } else if (illumination < 95) {
    phase = 'Vollmond'
    emoji = '🌕'
  } else if (illumination < 75) {
    phase = 'Abnehmender Mond'
    emoji = '🌖'
  } else if (illumination < 55) {
    phase = 'Letztes Viertel'
    emoji = '🌗'
  } else {
    phase = 'Abnehmender Sichelmond'
    emoji = '🌘'
  }

  // Fix illumination calculation for full range
  if (illumination > 50) {
    phase = phase.replace('Zunehmender', 'Vollmond nähernd')
  }

  // More accurate emoji mapping
  if (illumination >= 95) {
    phase = 'Vollmond'
    emoji = '🌕'
  } else if (illumination >= 55) {
    phase = 'Zunehmender Mond'
    emoji = '🌔'
  } else if (illumination >= 45) {
    phase = 'Erstes Viertel'
    emoji = '🌓'
  } else if (illumination >= 5) {
    phase = 'Zunehmender Sichelmond'
    emoji = '🌒'
  } else {
    phase = 'Neumond'
    emoji = '🌑'
  }

  return { phase, illumination, emoji }
}

// Simulate weather data (in production, use OpenWeatherMap or similar)
function getWeatherData(
  lat: number,
  lng: number,
  timestamp: string
): EnvironmentData['weather'] | null {
  // In production, call OpenWeatherMap API with historical data
  // For now, return simulated data based on location and time
  const hour = new Date(timestamp).getHours()
  const isNight = hour < 6 || hour > 20

  // Simulate different weather conditions
  const conditions = ['Klar', 'Bewölkt', 'Teilweise bewölkt', 'Leicht bewölkt']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  return {
    condition,
    temperature: Math.round(Math.random() * 15 + 5), // 5-20°C
    clouds: Math.round(Math.random() * 100),
    wind: Math.round(Math.random() * 30),
    humidity: Math.round(Math.random() * 40 + 40), // 40-80%
  }
}

// Simulate solar activity data (in production, use NOAA SWPC API)
function getSolarActivity(timestamp: string): EnvironmentData['solar'] | null {
  const date = new Date(timestamp)
  const now = new Date()
  const hoursAgo = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

  // Simulate solar storms with ~10% probability
  if (Math.random() < 0.1 || hoursAgo < 48) {
    const kpIndex = Math.random() * 5 + 3 // 3-8
    let level = 'G1'
    let activity = 'Geringer Sturm'

    if (kpIndex >= 7) {
      level = 'G3'
      activity = 'Starker Sturm'
    } else if (kpIndex >= 6) {
      level = 'G2'
      activity = 'Moderater Sturm'
    }

    return {
      activity,
      kpIndex: Math.round(kpIndex * 10) / 10,
      level,
      hoursBeforeEvent: Math.round(hoursAgo),
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const timestamp = searchParams.get('timestamp')

    if (!timestamp) {
      return NextResponse.json({ error: 'Missing timestamp' }, { status: 400 })
    }

    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    }

    const data: EnvironmentData = {
      moon: calculateMoonPhase(date),
    }

    // Add weather if coordinates provided
    if (lat && lng) {
      const weather = getWeatherData(parseFloat(lat), parseFloat(lng), timestamp)
      if (weather) {
        data.weather = weather
      }
    }

    // Add solar activity
    const solar = getSolarActivity(timestamp)
    if (solar) {
      data.solar = solar
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Environment data error:', error)
    return NextResponse.json({ error: 'Failed to fetch environment data' }, { status: 500 })
  }
}
