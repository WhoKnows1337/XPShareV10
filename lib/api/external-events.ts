// External Events API Integration
// Fetches solar, lunar, and weather data for pattern correlation

interface SolarStorm {
  type: 'solar'
  name: string
  timestamp: string
  kp_index: number
  intensity: number
  description: string
}

interface MoonPhase {
  type: 'moon'
  name: string
  phase: string
  illumination: number
  timestamp: string
}

interface WeatherData {
  type: 'weather'
  name: string
  condition: string
  temperature: number
  clouds: number
  wind_speed: number
  timestamp: string
}

export type ExternalEvent = SolarStorm | MoonPhase | WeatherData

/**
 * Fetch solar storm data from NOAA API
 */
async function getSolarStorms(
  date: Date,
  windowHours: number = 48
): Promise<SolarStorm[]> {
  try {
    // In production, integrate with NOAA Space Weather API
    // For now, return mock data based on date patterns
    const events: SolarStorm[] = []

    // Simulate solar storm if date matches certain patterns
    const dayOfMonth = date.getDate()
    if (dayOfMonth % 7 === 0) {
      const kpIndex = Math.floor(Math.random() * 4) + 5 // KP 5-9
      events.push({
        type: 'solar',
        name: `Solar Storm G${kpIndex - 4}`,
        timestamp: new Date(date.getTime() - 18 * 60 * 60 * 1000).toISOString(),
        kp_index: kpIndex,
        intensity: (kpIndex / 9) * 100,
        description: `Geomagnetic storm with KP index ${kpIndex}`,
      })
    }

    return events
  } catch (error) {
    console.error('Failed to fetch solar storms:', error)
    return []
  }
}

/**
 * Calculate moon phase for a given date
 */
async function getMoonPhase(date: Date): Promise<MoonPhase | null> {
  try {
    // Simple moon phase calculation
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // Approximate moon phase using simple algorithm
    let c = 0
    let e = 0
    let jd = 0
    let b = 0

    if (month < 3) {
      const yr = year - 1
      const mn = month + 12
      c = Math.floor(yr / 100)
      e = Math.floor(c / 4)
      jd = Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mn + 1)) + day - 1524.5
      b = Math.floor(c / 4) - c - 2
    } else {
      c = Math.floor(year / 100)
      e = Math.floor(c / 4)
      jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5
      b = Math.floor(c / 4) - c - 2
    }

    jd = jd + b

    // Calculate moon age
    const daysSinceNew = ((jd - 2451550.1) % 29.530588853) + 29.530588853
    const moonAge = daysSinceNew % 29.530588853

    // Calculate illumination (0-100%)
    const illumination = Math.round(
      (1 - Math.cos((moonAge / 29.530588853) * 2 * Math.PI)) * 50
    )

    // Determine phase name
    let phaseName = ''
    if (moonAge < 1.84566) phaseName = 'New Moon'
    else if (moonAge < 5.53699) phaseName = 'Waxing Crescent'
    else if (moonAge < 9.22831) phaseName = 'First Quarter'
    else if (moonAge < 12.91963) phaseName = 'Waxing Gibbous'
    else if (moonAge < 16.61096) phaseName = 'Full Moon'
    else if (moonAge < 20.30228) phaseName = 'Waning Gibbous'
    else if (moonAge < 23.99361) phaseName = 'Last Quarter'
    else phaseName = 'Waning Crescent'

    return {
      type: 'moon',
      name: phaseName,
      phase: phaseName,
      illumination,
      timestamp: date.toISOString(),
    }
  } catch (error) {
    console.error('Failed to calculate moon phase:', error)
    return null
  }
}

/**
 * Fetch historical weather data
 */
async function getHistoricalWeather(
  lat: number,
  lng: number,
  date: Date
): Promise<WeatherData | null> {
  try {
    // In production, integrate with OpenWeatherMap Historical API
    // For now, return realistic mock data
    const conditions = ['Clear', 'Cloudy', 'Partly Cloudy', 'Overcast', 'Foggy']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      type: 'weather',
      name: condition,
      condition,
      temperature: Math.floor(Math.random() * 25) + 5, // 5-30°C
      clouds: Math.floor(Math.random() * 100),
      wind_speed: Math.floor(Math.random() * 40) + 5,
      timestamp: date.toISOString(),
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    return null
  }
}

/**
 * Main function to fetch all external events for an experience
 */
export async function getExternalEvents(
  dateOccurred: Date,
  locationLat?: number,
  locationLng?: number
): Promise<ExternalEvent[]> {
  const events: ExternalEvent[] = []

  try {
    // Fetch solar storms (±48h window)
    const solarStorms = await getSolarStorms(dateOccurred, 48)
    events.push(...solarStorms)

    // Fetch moon phase
    const moonPhase = await getMoonPhase(dateOccurred)
    if (moonPhase) events.push(moonPhase)

    // Fetch weather data if location is available
    if (locationLat && locationLng) {
      const weather = await getHistoricalWeather(locationLat, locationLng, dateOccurred)
      if (weather) events.push(weather)
    }

    return events
  } catch (error) {
    console.error('Failed to fetch external events:', error)
    return []
  }
}

/**
 * Format external event for display
 */
export function formatExternalEvent(event: ExternalEvent) {
  switch (event.type) {
    case 'solar':
      return {
        icon: '☀️',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
      }
    case 'moon':
      return {
        icon: '🌙',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
      }
    case 'weather':
      return {
        icon: '🌤️',
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
      }
  }
}
