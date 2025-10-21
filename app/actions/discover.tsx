'use server'

import { streamUI } from '@ai-sdk/rsc'
import { gpt4o } from '@/lib/openai/ai-sdk-client'
import { z } from 'zod'

// Import backend tools from Phase 2
import { hybridSearch } from '@/lib/search/hybrid'
import { generateEmbedding } from '@/lib/openai/client'
import { getExperiences } from '@/lib/search/hybrid'

// Import UI components - Dynamic imports for heavy client libraries
import {
  DynamicTimelineChart,
  DynamicExperienceMapCard,
  DynamicNetworkGraph,
  DynamicHeatmapChart,
} from '@/components/discover/DynamicVisualizations'
import { InsightCard } from '@/components/discover/InsightCard'
import {
  MapSkeleton,
  TimelineSkeleton,
  NetworkGraphSkeleton,
  HeatmapSkeleton,
  ExperienceGridSkeleton,
} from '@/components/discover/LoadingSkeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * AI Discovery Server Action - Generative UI with streamUI()
 *
 * Phase 3: Progressive UI rendering with React Server Components
 * Streams interactive visualizations as they become available
 *
 * Usage: await streamDiscovery(message, conversationHistory)
 */

const DISCOVERY_SYSTEM_PROMPT = `You are XPShare Discovery Assistant, an AI specialized in analyzing and discovering patterns in extraordinary human experiences.

Your mission: Help users discover meaningful insights, patterns, and connections in anomalous experiences.

## Available Data

You have access to experiences across 40+ categories:
- UFO/UAP sightings, Dreams, NDEs, OBEs, Paranormal, Synchronicities, and more

## Your Capabilities

You can create interactive visualizations:

1. **search_and_show** - Search experiences and display results
2. **show_timeline** - Display temporal patterns with interactive charts
3. **show_map** - Show geographic distribution on interactive map
4. **show_network** - Visualize connections as network graph
5. **show_heatmap** - Display 2D density correlation (category × time)
6. **show_insight** - Display pattern insights as cards

## Instructions

- Always start with search when exploring a new query
- Use visualizations to clarify patterns
- Provide clear, concise explanations
- Highlight interesting patterns and anomalies
- Use specific numbers and data points
- Suggest follow-up questions

## Response Style

- Conversational and informative
- Data-driven insights
- Clear explanations of patterns
- No speculation without evidence
- Cite experience IDs when referencing specific cases

Remember: You are a discovery assistant. Your goal is to help users find meaningful insights.`

export async function streamDiscovery(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }> = []
) {
  // Validation
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required')
  }

  const result = await streamUI({
    model: gpt4o,
    messages: [
      { role: 'system', content: DISCOVERY_SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      { role: 'user' as const, content: message },
    ],
    text: ({ content }) => (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </CardContent>
      </Card>
    ),
    tools: {
      // Tool 1: Search and Display Results
      search_and_show: {
        description: 'Search for experiences and display results with metadata',
        inputSchema: z.object({
          query: z.string().describe('Natural language search query'),
        }),
        generate: async function* ({ query }) {
          // 1️⃣ Loading state
          yield <ExperienceGridSkeleton count={3} />

          // 2️⃣ Generate embedding and search
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({
            embedding,
            query,
            filters: {},
            maxResults: 10,
          })

          // 3️⃣ Render results
          return (
            <Card>
              <CardHeader>
                <CardTitle>
                  Search Results: &quot;{query}&quot;
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{results.length} found</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((exp: any) => (
                    <Card key={exp.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {exp.title}
                        </h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {exp.category_slug}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {exp.description}
                        </p>
                        {exp.location_text && (
                          <p className="text-xs text-muted-foreground mt-2">
                            📍 {exp.location_text}
                          </p>
                        )}
                        {exp.date_occurred && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📅 {exp.date_occurred.substring(0, 10)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        },
      },

      // Tool 2: Show Timeline
      show_timeline: {
        description: 'Display temporal patterns as interactive timeline chart. Use when user asks about: "over time", "timeline", "temporal patterns", "trends", "when did", "frequency"',
        inputSchema: z.object({
          query: z.string().describe('Search query to find experiences to visualize'),
          granularity: z
            .enum(['hour', 'day', 'week', 'month', 'year'])
            .optional()
            .describe('Time granularity (default: month)'),
        }),
        generate: async function* ({ query, granularity }) {
          const timeGranularity = granularity || 'month'
          // 1️⃣ Loading
          yield <TimelineSkeleton />

          // 2️⃣ Search first to get real UUIDs
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({
            embedding,
            query,
            filters: {},
            maxResults: 100, // Get more for better timeline
          })

          // Group by granularity
          const counts = new Map<string, number>()
          results.forEach((exp: any) => {
            if (!exp.date_occurred) return
            let key = exp.date_occurred.substring(0, 10) // YYYY-MM-DD
            if (timeGranularity === 'month') key = exp.date_occurred.substring(0, 7)
            if (timeGranularity === 'year') key = exp.date_occurred.substring(0, 4)
            counts.set(key, (counts.get(key) || 0) + 1)
          })

          const timelineData = Array.from(counts.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))

          // 3️⃣ Render timeline
          return (
            <DynamicTimelineChart
              data={timelineData}
              granularity={timeGranularity}
              title={`Temporal Distribution: "${query}"`}
              interactive={true}
            />
          )
        },
      },

      // Tool 3: Show Map
      show_map: {
        description: 'Show experiences on interactive geographic map. Use when user asks about: "map", "where", "locations", "geographic distribution", "places"',
        inputSchema: z.object({
          query: z.string().describe('Search query to find experiences to map'),
        }),
        generate: async function* ({ query }) {
          // 1️⃣ Loading state
          yield <MapSkeleton />

          // 2️⃣ Search first to get real UUIDs
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({
            embedding,
            query,
            filters: {},
            maxResults: 50,
          })

          // Filter for experiences with coordinates
          const markers = results
            .filter((e: any) => e.latitude && e.longitude)
            .map((e: any) => ({
              id: e.id,
              lat: e.latitude,
              lng: e.longitude,
              title: e.title,
              category: e.category_slug,
              date: e.date_occurred,
            }))

          // 3️⃣ Render map
          return <DynamicExperienceMapCard markers={markers} title={`Geographic Distribution: "${query}"`} />
        },
      },

      // Tool 4: Show Network Graph
      show_network: {
        description: 'Visualize connections between experiences as network graph. Use when user asks about: "connections", "relationships", "network", "how are they connected", "links"',
        inputSchema: z.object({
          query: z.string().describe('Search query to find experiences to connect'),
        }),
        generate: async function* ({ query }) {
          // 1️⃣ Loading
          yield <NetworkGraphSkeleton />

          // 2️⃣ Search first to get real UUIDs
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({
            embedding,
            query,
            filters: {},
            maxResults: 30,
          })

          const nodes = results.map((e: any) => ({
            id: e.id,
            label: e.title.substring(0, 30) + '...',
            category: e.category_slug,
          }))

          // Generate edges based on shared tags
          const edges: any[] = []
          for (let i = 0; i < results.length; i++) {
            for (let j = i + 1; j < results.length; j++) {
              const exp1 = results[i]
              const exp2 = results[j]

              const sharedTags =
                exp1.tags?.filter((tag: string) => exp2.tags?.includes(tag)) || []

              if (sharedTags.length > 0) {
                edges.push({
                  source: exp1.id,
                  target: exp2.id,
                  weight: sharedTags.length,
                  sharedTags,
                })
              }
            }
          }

          // 3️⃣ Render network
          return <DynamicNetworkGraph nodes={nodes} edges={edges} title={`Connection Network: "${query}"`} />
        },
      },

      // Tool 5: Show Heatmap
      show_heatmap: {
        description: 'Display 2D density correlation (category × time). Use when user asks about: "heatmap", "category trends", "what categories when", "density over time"',
        inputSchema: z.object({
          query: z.string().describe('Search query to find experiences to analyze'),
        }),
        generate: async function* ({ query }) {
          // 1️⃣ Loading
          yield <HeatmapSkeleton />

          // 2️⃣ Search first to get real UUIDs
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({
            embedding,
            query,
            filters: {},
            maxResults: 100,
          })

          // Process into heatmap data
          const heatmapData: any[] = []
          results.forEach((exp: any) => {
            if (!exp.date_occurred) return

            const month = exp.date_occurred.substring(0, 7) // YYYY-MM
            const category = exp.category_slug

            const existing = heatmapData.find(
              (d) => d.category === category && d.month === month
            )

            if (existing) {
              existing.count++
            } else {
              heatmapData.push({ category, month, count: 1 })
            }
          })

          // 3️⃣ Render heatmap
          return <DynamicHeatmapChart data={heatmapData} title={`Category × Time Density: "${query}"`} />
        },
      },

      // Tool 6: Show Insight
      show_insight: {
        description: 'Display detected pattern as insight card',
        inputSchema: z.object({
          type: z
            .enum(['temporal', 'geographic', 'semantic', 'emotional', 'crossCategory'])
            .describe('Pattern type'),
          pattern: z.string().describe('Pattern description'),
          confidence: z.number().min(0).max(1).describe('Confidence score'),
          dataPoints: z.array(z.object({
            label: z.string(),
            value: z.union([z.string(), z.number()]),
          })).describe('Supporting data points with label and value'),
        }),
        generate: async function* (params) {
          // No loading needed for instant cards
          return (
            <InsightCard
              type={params.type}
              pattern={params.pattern}
              confidence={params.confidence}
              dataPoints={params.dataPoints}
            />
          )
        },
      },
    },
    temperature: 0.3,
    // Note: maxSteps removed in AI SDK 5.0 - use maxToolRoundtrips instead if needed
  })

  return result.value
}
