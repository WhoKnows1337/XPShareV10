// Timeline Tool
export interface TimelineArgs {
  query: string
  granularity?: 'day' | 'month' | 'year'
}

export interface TimelineResult {
  data: Array<{ date: string; count: number }>
  granularity: 'day' | 'month' | 'year'
  total: number
}

// Geographic Tool
export interface GeographicArgs {
  query: string
}

export interface GeographicResult {
  markers: Array<{
    id: string
    lat: number
    lng: number
    title: string
    category: string
  }>
  total: number
}

// Network Tool
export interface NetworkArgs {
  query: string
}

export interface NetworkResult {
  nodes: Array<{ id: string; label: string; category: string }>
  edges: Array<{ source: string; target: string; weight: number }>
  total: number
}

// Heatmap Tool
export interface HeatmapArgs {
  query: string
}

export interface HeatmapResult {
  data: Array<{ category: string; month: string; count: number }>
  total: number
}

// Search Tool
export interface SearchArgs {
  query: string
}

export interface SearchResult {
  results: Array<{
    id: string
    title: string
    category: string
    description: string
    location: string
    date: string
  }>
  count: number
}
