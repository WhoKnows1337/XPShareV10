# XPShare AI - Visualization Engine & Auto-Selection

**Version:** 1.0
**Related:** 02_AGENT_SYSTEM.md, 03_TOOLS_CATALOG.md

---

## 🎯 Overview

The Visualization Engine automatically selects and generates the optimal visualization based on data structure and user query intent.

**Key Features:**
- 🤖 Auto-detection of data dimensions
- 📊 5 core visualization types (Map, Timeline, Network, Heatmap, Dashboard)
- 🎨 Consistent design system
- ⚡ Streaming support for progressive rendering
- 📱 Responsive and accessible

---

## 🧠 Auto-Selection Logic

### Decision Tree

```typescript
function selectVisualization(data: any[], query: string): VizType {
  const analysis = analyzeDataStructure(data)

  // Geographic data → Map
  if (analysis.hasGeo && analysis.geoRatio > 0.5) {
    return 'map'
  }

  // Temporal data → Timeline
  if (analysis.hasTemporal && analysis.temporalRatio > 0.6) {
    return 'timeline'
  }

  // Relationships → Network
  if (analysis.hasConnections || query.includes('connection') || query.includes('relationship')) {
    return 'network'
  }

  // Multi-dimensional (Category × Time) → Heatmap
  if (analysis.hasCategories && analysis.hasTemporal && data.length > 20) {
    return 'heatmap'
  }

  // Complex queries → Dashboard
  if (analysis.hasMultipleDimensions && data.length > 30) {
    return 'dashboard'
  }

  // Fallback → Table
  return 'table'
}
```

### Data Structure Analyzer

```typescript
// lib/viz/analyzer.ts
export interface DataAnalysis {
  hasGeo: boolean
  hasTemporal: boolean
  hasCategories: boolean
  hasConnections: boolean
  hasAttributes: boolean
  hasMultipleDimensions: boolean
  geoRatio: number
  temporalRatio: number
  categoryCounts: Map<string, number>
  count: number
}

export function analyzeDataStructure(data: any[]): DataAnalysis {
  if (!data || data.length === 0) {
    return {
      hasGeo: false,
      hasTemporal: false,
      hasCategories: false,
      hasConnections: false,
      hasAttributes: false,
      hasMultipleDimensions: false,
      geoRatio: 0,
      temporalRatio: 0,
      categoryCounts: new Map(),
      count: 0,
    }
  }

  const geoCount = data.filter(
    (d) => d.latitude || d.lat || d.location?.lat
  ).length
  const temporalCount = data.filter(
    (d) => d.date || d.date_occurred || d.time || d.month
  ).length
  const categoryCount = data.filter((d) => d.category || d.category_slug).length

  const categoryCounts = new Map<string, number>()
  data.forEach((d) => {
    const cat = d.category || d.category_slug
    if (cat) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
    }
  })

  const dimensions = [
    geoCount > 0,
    temporalCount > 0,
    categoryCount > 0,
    data.some((d) => d.tags?.length > 0),
    data.some((d) => d.attributes),
  ].filter(Boolean).length

  return {
    hasGeo: geoCount > 0,
    hasTemporal: temporalCount > 0,
    hasCategories: categoryCount > 0,
    hasConnections: data.some((d) => d.edges || d.connections),
    hasAttributes: data.some((d) => d.attributes),
    hasMultipleDimensions: dimensions >= 3,
    geoRatio: geoCount / data.length,
    temporalRatio: temporalCount / data.length,
    categoryCounts,
    count: data.length,
  }
}
```

---

## 🗺️ Map Visualization

### Purpose
Display geographic distribution of experiences

### When to Use
- `hasGeo === true` and `geoRatio > 0.5`
- Queries containing: "map", "location", "where", "city"

### Implementation

```typescript
// components/viz/ExperienceMap.tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'

interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  category: string
}

interface ExperienceMapProps {
  markers: MapMarker[]
  center?: LatLngExpression
  zoom?: number
  clusterRadius?: number
}

export function ExperienceMap({
  markers,
  center,
  zoom = 6,
  clusterRadius = 50,
}: ExperienceMapProps) {
  // Auto-calculate center if not provided
  const mapCenter = useMemo(() => {
    if (center) return center

    if (markers.length === 0) return [52.52, 13.405] as LatLngExpression // Berlin default

    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length

    return [avgLat, avgLng] as LatLngExpression
  }, [markers, center])

  // Category colors
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      ufo: '#8b5cf6',
      dreams: '#3b82f6',
      nde: '#ec4899',
      psychedelics: '#10b981',
      synchronicity: '#f59e0b',
      paranormal: '#ef4444',
    }
    return colors[category] || '#6b7280'
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={8}
            fillColor={getCategoryColor(marker.category)}
            fillOpacity={0.7}
            stroke={true}
            color="#fff"
            weight={2}
          >
            <Popup>
              <div className="p-2">
                <div className="font-semibold">{marker.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {marker.category}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

// Tool UI wrapper for streaming
export function MapToolUI({ part, onRetry }: any) {
  const markers = part.result?.markers || []

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Geographic Distribution ({markers.length} locations)
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>

      {markers.length > 0 ? (
        <ExperienceMap markers={markers} />
      ) : (
        <div className="text-sm text-muted-foreground">
          No geographic data available
        </div>
      )}
    </div>
  )
}
```

---

## 📈 Timeline Visualization

### Purpose
Display temporal patterns and trends

### When to Use
- `hasTemporal === true` and `temporalRatio > 0.6`
- Queries containing: "timeline", "trend", "over time", "when"

### Implementation

```typescript
// components/viz/TimelineChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface TimelineDataPoint {
  date: string
  count: number
  category?: string
}

interface TimelineChartProps {
  data: TimelineDataPoint[]
  granularity: 'day' | 'month' | 'year'
  groupBy?: 'category' | 'none'
}

export function TimelineChart({
  data,
  granularity,
  groupBy = 'none',
}: TimelineChartProps) {
  // Format dates based on granularity
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      switch (granularity) {
        case 'year':
          return format(date, 'yyyy')
        case 'month':
          return format(date, 'MMM yyyy')
        case 'day':
          return format(date, 'MMM dd')
        default:
          return dateStr
      }
    } catch {
      return dateStr
    }
  }

  // Prepare data for Recharts
  const chartData = useMemo(() => {
    if (groupBy === 'none') {
      return data.map((d) => ({
        date: formatDate(d.date),
        count: d.count,
      }))
    }

    // Group by category
    const grouped = new Map<string, Map<string, number>>()

    data.forEach((d) => {
      if (!grouped.has(d.date)) {
        grouped.set(d.date, new Map())
      }
      grouped.get(d.date)!.set(d.category || 'Unknown', d.count)
    })

    return Array.from(grouped.entries()).map(([date, categories]) => {
      const point: any = { date: formatDate(date) }
      categories.forEach((count, category) => {
        point[category] = count
      })
      return point
    })
  }, [data, granularity, groupBy])

  // Get unique categories for multi-line chart
  const categories = useMemo(() => {
    if (groupBy === 'none') return []
    const cats = new Set<string>()
    data.forEach((d) => {
      if (d.category) cats.add(d.category)
    })
    return Array.from(cats)
  }, [data, groupBy])

  const categoryColors = {
    ufo: '#8b5cf6',
    dreams: '#3b82f6',
    nde: '#ec4899',
    psychedelics: '#10b981',
    synchronicity: '#f59e0b',
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          {groupBy === 'none' ? (
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ) : (
            <>
              <Legend />
              {categories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[category as keyof typeof categoryColors] || '#6b7280'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Tool UI wrapper
export function TimelineToolUI({ part, onRetry }: any) {
  const data = part.result?.data || []
  const granularity = part.result?.granularity || 'month'
  const total = part.result?.total || 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Temporal Pattern ({total} experiences)
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>

      {data.length > 0 ? (
        <TimelineChart data={data} granularity={granularity} />
      ) : (
        <div className="text-sm text-muted-foreground">
          No temporal data available
        </div>
      )}
    </div>
  )
}
```

---

## 🕸️ Network Graph Visualization

### Purpose
Display connections and relationships between experiences

### When to Use
- `hasConnections === true`
- Queries containing: "connection", "relationship", "related", "similar"

### Implementation

```typescript
// components/viz/NetworkGraph.tsx
'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

// Dynamically import 3D force graph (client-side only)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
})

interface Node {
  id: string
  label: string
  category: string
}

interface Edge {
  source: string
  target: string
  weight: number
}

interface NetworkGraphProps {
  nodes: Node[]
  edges: Edge[]
  height?: number
}

export function NetworkGraph({ nodes, edges, height = 500 }: NetworkGraphProps) {
  // Prepare graph data
  const graphData = useMemo(() => {
    // Add category-based colors
    const colorMap: Record<string, string> = {
      ufo: '#8b5cf6',
      dreams: '#3b82f6',
      nde: '#ec4899',
      psychedelics: '#10b981',
      synchronicity: '#f59e0b',
    }

    return {
      nodes: nodes.map((node) => ({
        ...node,
        color: colorMap[node.category] || '#6b7280',
        val: 10, // Node size
      })),
      links: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        value: edge.weight,
      })),
    }
  }, [nodes, edges])

  return (
    <div className="w-full rounded-lg overflow-hidden border bg-background">
      <ForceGraph3D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="category"
        linkWidth={(link: any) => link.value * 2}
        linkOpacity={0.6}
        height={height}
        backgroundColor="hsl(var(--background))"
        nodeThreeObject={(node: any) => {
          // Custom 3D sphere
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: new THREE.CanvasTexture(generateNodeTexture(node.category)),
            })
          )
          sprite.scale.set(12, 12, 1)
          return sprite
        }}
        onNodeClick={(node: any) => {
          console.log('Node clicked:', node)
        }}
      />
    </div>
  )
}

function generateNodeTexture(category: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64

  const ctx = canvas.getContext('2d')!

  // Draw circle
  ctx.beginPath()
  ctx.arc(32, 32, 30, 0, 2 * Math.PI)
  ctx.fillStyle = getCategoryColor(category)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 4
  ctx.stroke()

  return canvas
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ufo: '#8b5cf6',
    dreams: '#3b82f6',
    nde: '#ec4899',
    psychedelics: '#10b981',
    synchronicity: '#f59e0b',
  }
  return colors[category] || '#6b7280'
}

// Tool UI wrapper
export function NetworkToolUI({ part, onRetry }: any) {
  const nodes = part.result?.nodes || []
  const edges = part.result?.edges || []
  const total = part.result?.total || 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Connection Network ({nodes.length} nodes, {edges.length} connections)
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>

      {nodes.length > 0 ? (
        <NetworkGraph nodes={nodes} edges={edges} />
      ) : (
        <div className="text-sm text-muted-foreground">
          No connections found
        </div>
      )}
    </div>
  )
}
```

---

## 🔥 Heatmap Visualization

### Purpose
Display category × time density patterns

### When to Use
- `hasCategories && hasTemporal && count > 20`
- Queries containing: "heatmap", "density", "trend by category"

### Implementation

```typescript
// components/viz/Heatmap.tsx
'use client'

import { useMemo } from 'react'

interface HeatmapCell {
  category: string
  month: string
  count: number
}

interface HeatmapProps {
  data: HeatmapCell[]
}

export function Heatmap({ data }: HeatmapProps) {
  // Prepare matrix
  const { categories, months, matrix, maxCount } = useMemo(() => {
    const categories = Array.from(new Set(data.map((d) => d.category))).sort()
    const months = Array.from(new Set(data.map((d) => d.month))).sort()

    const matrix = categories.map((cat) =>
      months.map((month) => {
        const cell = data.find((d) => d.category === cat && d.month === month)
        return cell?.count || 0
      })
    )

    const maxCount = Math.max(...data.map((d) => d.count))

    return { categories, months, matrix, maxCount }
  }, [data])

  // Color scale
  const getColor = (count: number) => {
    if (count === 0) return 'hsl(var(--muted))'
    const intensity = count / maxCount
    return `hsl(var(--primary) / ${intensity})`
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month headers */}
        <div className="flex">
          <div className="w-32 flex-shrink-0" /> {/* Spacer for category labels */}
          {months.map((month) => (
            <div
              key={month}
              className="w-16 text-xs text-center text-muted-foreground py-2"
            >
              {month.substring(5)}
            </div>
          ))}
        </div>

        {/* Heatmap cells */}
        {categories.map((category, rowIndex) => (
          <div key={category} className="flex">
            {/* Category label */}
            <div className="w-32 flex-shrink-0 text-xs py-2 pr-2 text-right font-medium">
              {category}
            </div>

            {/* Cells */}
            {matrix[rowIndex].map((count, colIndex) => (
              <div
                key={`${category}-${months[colIndex]}`}
                className="w-16 h-12 border border-border"
                style={{ backgroundColor: getColor(count) }}
                title={`${category} - ${months[colIndex]}: ${count} experiences`}
              >
                {count > 0 && (
                  <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                    {count}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Tool UI wrapper
export function HeatmapToolUI({ part, onRetry }: any) {
  const data = part.result?.data || []
  const total = part.result?.total || 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Category × Time Density ({total} experiences)
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>

      {data.length > 0 ? (
        <Heatmap data={data} />
      ) : (
        <div className="text-sm text-muted-foreground">
          Insufficient data for heatmap
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Dashboard (Multi-Viz)

### Purpose
Combine multiple visualizations for complex queries

### When to Use
- `hasMultipleDimensions && count > 30`
- Complex queries requiring multiple perspectives

### Implementation

```typescript
// components/viz/Dashboard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExperienceMap } from './ExperienceMap'
import { TimelineChart } from './TimelineChart'
import { NetworkGraph } from './NetworkGraph'

interface DashboardProps {
  mapData?: any
  timelineData?: any
  networkData?: any
  statsData?: any
}

export function Dashboard({
  mapData,
  timelineData,
  networkData,
  statsData,
}: DashboardProps) {
  return (
    <div className="w-full space-y-4">
      {/* Summary Stats */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Experiences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.categories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.locations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.users}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualizations Tabs */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">Geographic</TabsTrigger>
          <TabsTrigger value="timeline">Temporal</TabsTrigger>
          <TabsTrigger value="network">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          {mapData ? (
            <ExperienceMap markers={mapData.markers} />
          ) : (
            <div className="text-sm text-muted-foreground">
              No geographic data
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {timelineData ? (
            <TimelineChart
              data={timelineData.data}
              granularity={timelineData.granularity}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              No temporal data
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="mt-4">
          {networkData ? (
            <NetworkGraph nodes={networkData.nodes} edges={networkData.edges} />
          ) : (
            <div className="text-sm text-muted-foreground">
              No connection data
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 🎨 Visualization Agent Implementation

```typescript
// lib/agents/viz-agent.ts
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { analyzeDataStructure } from '@/lib/viz/analyzer'

const VIZ_AGENT_SYSTEM_PROMPT = `You are the XPShare Visualization Specialist.

Your role: Select optimal visualizations based on data structure.

Decision Rules:
- Geographic data (lat/lng) → Map
- Temporal data (dates/times) → Timeline
- Relationships/connections → Network Graph
- Category × Time → Heatmap
- Complex multi-dimensional → Dashboard

Always return visualization configuration as JSON.`

export class VizAgent {
  async execute(task: string, data: any) {
    const analysis = analyzeDataStructure(data)

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: VIZ_AGENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `
Task: ${task}

Data Analysis:
${JSON.stringify(analysis, null, 2)}

Sample Data:
${JSON.stringify(data.slice(0, 3), null, 2)}

Select the best visualization and return config as JSON:
{
  "type": "map" | "timeline" | "network" | "heatmap" | "dashboard",
  "config": {...},
  "reason": "Why this viz is optimal"
}
          `,
        },
      ],
      temperature: 0.3,
    })

    const vizSpec = JSON.parse(text)
    return this.generateVisualization(vizSpec, data)
  }

  private generateVisualization(spec: any, data: any) {
    switch (spec.type) {
      case 'map':
        return {
          type: 'map',
          component: 'DynamicExperienceMapCard',
          props: {
            markers: this.prepareMapData(data),
            config: spec.config,
          },
          reason: spec.reason,
        }

      case 'timeline':
        return {
          type: 'timeline',
          component: 'DynamicTimelineChart',
          props: {
            data: this.prepareTimelineData(data),
            granularity: spec.config.granularity || 'month',
          },
          reason: spec.reason,
        }

      case 'network':
        return {
          type: 'network',
          component: 'DynamicNetworkGraph',
          props: {
            nodes: data.nodes || [],
            edges: data.edges || [],
            config: spec.config,
          },
          reason: spec.reason,
        }

      case 'heatmap':
        return {
          type: 'heatmap',
          component: 'DynamicHeatmap',
          props: {
            data: this.prepareHeatmapData(data),
          },
          reason: spec.reason,
        }

      case 'dashboard':
        return {
          type: 'dashboard',
          component: 'DynamicDashboard',
          props: {
            mapData: this.prepareMapData(data),
            timelineData: this.prepareTimelineData(data),
            networkData: data.connections || null,
            statsData: this.prepareStatsData(data),
          },
          reason: spec.reason,
        }

      default:
        return spec
    }
  }

  private prepareMapData(data: any[]) {
    return data
      .filter((d) => d.latitude && d.longitude)
      .map((d) => ({
        id: d.id,
        lat: d.latitude || d.lat,
        lng: d.longitude || d.lng,
        title: d.title,
        category: d.category || d.category_slug,
      }))
  }

  private prepareTimelineData(data: any[]) {
    const counts = new Map<string, number>()

    data.forEach((exp) => {
      if (!exp.date_occurred && !exp.date) return
      const date = exp.date_occurred || exp.date
      const key = date.substring(0, 7) // YYYY-MM
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private prepareHeatmapData(data: any[]) {
    return data.map((d) => ({
      category: d.category || d.category_slug,
      month: d.month || d.date?.substring(0, 7),
      count: d.count || 1,
    }))
  }

  private prepareStatsData(data: any[]) {
    return {
      total: data.length,
      categories: new Set(data.map((d) => d.category || d.category_slug)).size,
      locations: new Set(data.map((d) => d.location_text)).size,
      users: new Set(data.map((d) => d.user_id)).size,
    }
  }
}
```

---

## 🎨 Styling & Theming

All visualizations use CSS variables from shadcn/ui:

```css
/* globals.css */
:root {
  --viz-primary: hsl(var(--primary));
  --viz-secondary: hsl(var(--secondary));
  --viz-accent: hsl(var(--accent));
  --viz-muted: hsl(var(--muted));
  --viz-border: hsl(var(--border));
}

/* Category colors */
.category-ufo { color: #8b5cf6; }
.category-dreams { color: #3b82f6; }
.category-nde { color: #ec4899; }
.category-psychedelics { color: #10b981; }
.category-synchronicity { color: #f59e0b; }
```

---

**Next:** See 06_ADVANCED_FEATURES.md for insights and predictions.
