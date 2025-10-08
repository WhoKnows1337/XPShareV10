import { useState, useEffect } from 'react'

export interface EnvironmentData {
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

interface UseEnvironmentDataOptions {
  enabled?: boolean
}

export function useEnvironmentData(
  timestamp: string | null,
  coordinates?: [number, number] | null,
  options: UseEnvironmentDataOptions = {}
) {
  const { enabled = true } = options
  const [data, setData] = useState<EnvironmentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !timestamp) {
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ timestamp })
        if (coordinates && coordinates.length === 2) {
          params.append('lat', coordinates[0].toString())
          params.append('lng', coordinates[1].toString())
        }

        const response = await fetch(`/api/environment?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch environment data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Environment data fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timestamp, coordinates?.[0], coordinates?.[1], enabled])

  return { data, isLoading, error }
}
