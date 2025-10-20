import { openai } from '@ai-sdk/openai'
import { streamText, tool, convertToModelMessages, smoothStream } from 'ai'
import { z } from 'zod'
import { hybridSearch } from '@/lib/search/hybrid'
import { generateEmbedding } from '@/lib/openai/client'

export const maxDuration = 30

const DISCOVERY_SYSTEM_PROMPT = `You are XPShare Discovery Assistant, specialized in analyzing extraordinary human experiences.

When users ask about patterns or visualizations:
1. Use search_experiences for basic searches
2. Use analyze_timeline for temporal patterns (timeline charts)
3. Use analyze_geographic for location patterns (maps) 
4. Use analyze_network for connections (network graphs)
5. Use analyze_heatmap for category trends (heatmaps)

Always provide context and insights with the data.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    system: DISCOVERY_SYSTEM_PROMPT,
    tools: {
      search_experiences: tool({
        description: 'Search experiences and return results',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({ embedding, query, filters: {}, maxResults: 10 })
          return { results: results.map((e: any) => ({ id: e.id, title: e.title, category: e.category_slug, description: e.description?.substring(0, 200), location: e.location_text, date: e.date_occurred?.substring(0, 10) })), count: results.length }
        },
      }),
      analyze_timeline: tool({
        description: 'Analyze temporal patterns - returns data for timeline visualization',
        inputSchema: z.object({ query: z.string(), granularity: z.enum(['day', 'month', 'year']).optional() }),
        execute: async ({ query, granularity = 'month' }) => {
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({ embedding, query, filters: {}, maxResults: 100 })
          const counts = new Map<string, number>()
          results.forEach((exp: any) => {
            if (!exp.date_occurred) return
            let key = exp.date_occurred.substring(0, granularity === 'year' ? 4 : granularity === 'month' ? 7 : 10)
            counts.set(key, (counts.get(key) || 0) + 1)
          })
          return { data: Array.from(counts.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)), granularity, total: results.length }
        },
      }),
      analyze_geographic: tool({
        description: 'Analyze geographic distribution - returns data for map visualization',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({ embedding, query, filters: {}, maxResults: 50 })
          const markers = results.filter((e: any) => e.latitude && e.longitude).map((e: any) => ({ id: e.id, lat: e.latitude, lng: e.longitude, title: e.title, category: e.category_slug }))
          return { markers, total: markers.length }
        },
      }),
      analyze_network: tool({
        description: 'Find connections between experiences - returns data for network graph',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({ embedding, query, filters: {}, maxResults: 30 })
          const nodes = results.map((e: any) => ({ id: e.id, label: e.title.substring(0, 30), category: e.category_slug }))
          const edges: any[] = []
          for (let i = 0; i < results.length; i++) {
            for (let j = i + 1; j < results.length; j++) {
              const sharedTags = results[i].tags?.filter((tag: string) => results[j].tags?.includes(tag)) || []
              if (sharedTags.length > 0) edges.push({ source: results[i].id, target: results[j].id, weight: sharedTags.length })
            }
          }
          return { nodes, edges, total: nodes.length }
        },
      }),
      analyze_heatmap: tool({
        description: 'Analyze category × time density - returns data for heatmap visualization',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          const embedding = await generateEmbedding(query)
          const results = await hybridSearch({ embedding, query, filters: {}, maxResults: 100 })
          const heatmapData: any[] = []
          results.forEach((exp: any) => {
            if (!exp.date_occurred) return
            const month = exp.date_occurred.substring(0, 7)
            const existing = heatmapData.find(d => d.category === exp.category_slug && d.month === month)
            if (existing) existing.count++
            else heatmapData.push({ category: exp.category_slug, month, count: 1 })
          })
          return { data: heatmapData, total: results.length }
        },
      }),
    },
    temperature: 0.3,
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse({
    transform: smoothStream({ chunking: 'word' }),
  })
}
