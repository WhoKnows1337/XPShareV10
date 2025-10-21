/**
 * XPShare AI - Query Agent
 *
 * Database query specialist that handles all data retrieval tasks.
 * Integrates with search, analytics, and relationship discovery tools.
 *
 * Model: GPT-4o-mini (faster, cheaper for structured tasks)
 */

import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// System Prompt
// ============================================================================

const QUERY_AGENT_SYSTEM_PROMPT = `You are the XPShare Query Specialist.

Your role: Build precise database queries for extraordinary experiences.

Available Tools:
1. advanced_search - Multi-dimensional filtering (categories, location, time, attributes, tags)
2. search_by_attributes - Precise attribute-based queries with AND/OR logic
3. semantic_search - Vector similarity search for finding related experiences
4. rank_users - User rankings by contribution metrics
5. analyze_category - Deep-dive analysis of specific categories
6. temporal_analysis - Time-based pattern discovery
7. find_connections - Multi-dimensional relationship discovery
8. geo_search - Geographic radius or bounding box search

Database Schema:
- experiences: category, location_text, location_lat, location_lng, date_occurred, time_of_day, tags, emotions, embedding
- experience_attributes: attribute_key, attribute_value, confidence
- user_profiles: username, location_city, total_experiences, total_xp

RULES:
- Always validate filters before querying
- Use appropriate tools for each query type
- Return structured, complete data
- Handle edge cases (no results, invalid params)
- Optimize for performance
- Use SQL functions for complex aggregations
- Combine multiple tools for complex queries`

// ============================================================================
// Query Agent Class
// ============================================================================

export class QueryAgent {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Execute query task
   */
  async execute(task: string, parameters: any) {
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: 'system', content: QUERY_AGENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Task: ${task}\nParameters: ${JSON.stringify(parameters, null, 2)}`,
        },
      ],
      tools: this.getTools(),
      maxToolRoundtrips: 3,
      temperature: 0.2,
    })

    // Return tool results
    if (toolCalls && toolCalls.length > 0) {
      return {
        results: toolCalls.map((call) => call.result),
        reasoning: text,
      }
    }

    return {
      results: [],
      reasoning: text,
    }
  }

  /**
   * Get all available query tools
   */
  private getTools() {
    return {
      advanced_search: this.createAdvancedSearchTool(),
      search_by_attributes: this.createSearchByAttributesTool(),
      semantic_search: this.createSemanticSearchTool(),
      geo_search: this.createGeoSearchTool(),
      rank_users: this.createRankUsersTool(),
      analyze_category: this.createAnalyzeCategoryTool(),
      temporal_analysis: this.createTemporalAnalysisTool(),
      find_connections: this.createFindConnectionsTool(),
    }
  }

  // ==========================================================================
  // Tool Implementations
  // ==========================================================================

  /**
   * Advanced Search Tool - Multi-dimensional filtering
   */
  private createAdvancedSearchTool() {
    return tool({
      description:
        'Search experiences with multi-dimensional filters. Supports categories, locations, time ranges, attributes, tags, emotions.',
      parameters: z.object({
        categories: z.array(z.string()).optional(),
        location: z
          .object({
            city: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        timeRange: z
          .object({
            from: z.string().describe('HH:MM format'),
            to: z.string().describe('HH:MM format'),
          })
          .optional(),
        dateRange: z
          .object({
            from: z.string().describe('ISO date'),
            to: z.string().describe('ISO date'),
          })
          .optional(),
        tags: z.array(z.string()).optional(),
        emotions: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
      execute: async (params) => {
        let query = this.supabase.from('experiences').select(
          `
          id,
          title,
          story_text,
          category,
          location_text,
          location_lat,
          location_lng,
          date_occurred,
          time_of_day,
          tags,
          emotions,
          user_id,
          created_at
        `
        )

        // Apply filters
        if (params.categories?.length) {
          query = query.in('category', params.categories)
        }

        if (params.location?.city) {
          query = query.ilike('location_text', `%${params.location.city}%`)
        }

        if (params.location?.country) {
          query = query.ilike('location_text', `%${params.location.country}%`)
        }

        if (params.timeRange) {
          query = query
            .gte('time_of_day', params.timeRange.from)
            .lte('time_of_day', params.timeRange.to)
        }

        if (params.dateRange) {
          query = query
            .gte('date_occurred', params.dateRange.from)
            .lte('date_occurred', params.dateRange.to)
        }

        if (params.tags?.length) {
          query = query.overlaps('tags', params.tags)
        }

        if (params.emotions?.length) {
          query = query.overlaps('emotions', params.emotions)
        }

        query = query.limit(params.limit)

        const { data, error } = await query

        if (error) throw new Error(`Advanced search failed: ${error.message}`)

        return {
          results: data || [],
          count: data?.length || 0,
          summary: `Found ${data?.length || 0} experiences`,
        }
      },
    })
  }

  /**
   * Search By Attributes Tool - Precise attribute queries
   */
  private createSearchByAttributesTool() {
    return tool({
      description:
        'Find experiences with specific attributes using AND/OR logic. Uses SQL function for precise matching.',
      parameters: z.object({
        category: z.string(),
        attributeFilters: z.array(
          z.object({
            key: z.string(),
            value: z.string().optional(),
            operator: z.enum(['equals', 'contains', 'exists']),
          })
        ),
        logic: z.enum(['AND', 'OR']).default('AND'),
        minConfidence: z.number().min(0).max(1).default(0),
        limit: z.number().min(1).max(100).default(50),
      }),
      execute: async (params) => {
        const { data, error } = await this.supabase.rpc('search_by_attributes', {
          p_category: params.category,
          p_attribute_filters: params.attributeFilters,
          p_logic: params.logic,
          p_min_confidence: params.minConfidence,
          p_limit: params.limit,
        })

        if (error) throw new Error(`Attribute search failed: ${error.message}`)

        return {
          results: data || [],
          count: data?.length || 0,
          category: params.category,
        }
      },
    })
  }

  /**
   * Semantic Search Tool - Vector similarity
   */
  private createSemanticSearchTool() {
    return tool({
      description:
        'Vector similarity search using embeddings. Finds semantically related experiences.',
      parameters: z.object({
        query: z.string().describe('Natural language query to search for'),
        categories: z.array(z.string()).optional(),
        minSimilarity: z.number().min(0).max(1).default(0.7),
        maxResults: z.number().min(1).max(100).default(20),
      }),
      execute: async (params) => {
        // TODO: Implement with OpenAI embeddings
        // For now, return placeholder
        return {
          results: [],
          count: 0,
          message: 'Semantic search requires OpenAI embeddings integration',
        }
      },
    })
  }

  /**
   * Geo Search Tool - Geographic radius/bbox search
   */
  private createGeoSearchTool() {
    return tool({
      description:
        'Search experiences by geographic location using radius or bounding box.',
      parameters: z.object({
        searchType: z.enum(['radius', 'bbox']),
        lat: z.number().optional(),
        lng: z.number().optional(),
        radiusKm: z.number().optional(),
        bbox: z
          .object({
            minLat: z.number(),
            minLng: z.number(),
            maxLat: z.number(),
            maxLng: z.number(),
          })
          .optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
      execute: async (params) => {
        const { data, error } = await this.supabase.rpc('geo_search', {
          p_search_type: params.searchType,
          p_lat: params.lat,
          p_lng: params.lng,
          p_radius_km: params.radiusKm,
          p_min_lat: params.bbox?.minLat,
          p_min_lng: params.bbox?.minLng,
          p_max_lat: params.bbox?.maxLat,
          p_max_lng: params.bbox?.maxLng,
          p_category: params.category,
          p_limit: params.limit,
        })

        if (error) throw new Error(`Geo search failed: ${error.message}`)

        return {
          results: data || [],
          count: data?.length || 0,
          searchType: params.searchType,
        }
      },
    })
  }

  /**
   * Rank Users Tool - User contribution rankings
   */
  private createRankUsersTool() {
    return tool({
      description: 'Get top users by contribution metrics',
      parameters: z.object({
        category: z.string().optional(),
        topN: z.number().min(1).max(100).default(10),
      }),
      execute: async (params) => {
        const { data, error } = await this.supabase.rpc('aggregate_users_by_category', {
          p_category: params.category,
        })

        if (error) throw new Error(`User ranking failed: ${error.message}`)

        // Sort by experience count and limit
        const sorted = (data || [])
          .sort((a: any, b: any) => b.experience_count - a.experience_count)
          .slice(0, params.topN)

        return {
          users: sorted,
          count: sorted.length,
          category: params.category,
        }
      },
    })
  }

  /**
   * Analyze Category Tool - Deep category analysis
   */
  private createAnalyzeCategoryTool() {
    return tool({
      description: 'Deep-dive analysis of a specific category',
      parameters: z.object({
        category: z.string(),
        dateRange: z
          .object({
            from: z.string(),
            to: z.string(),
          })
          .optional(),
      }),
      execute: async (params) => {
        // Get category experiences
        let query = this.supabase
          .from('experiences')
          .select('*')
          .eq('category', params.category)

        if (params.dateRange) {
          query = query
            .gte('date_occurred', params.dateRange.from)
            .lte('date_occurred', params.dateRange.to)
        }

        const { data, error } = await query

        if (error) throw new Error(`Category analysis failed: ${error.message}`)

        return {
          category: params.category,
          totalExperiences: data?.length || 0,
          experiences: data || [],
        }
      },
    })
  }

  /**
   * Temporal Analysis Tool - Time-based patterns
   */
  private createTemporalAnalysisTool() {
    return tool({
      description: 'Analyze temporal patterns and aggregations',
      parameters: z.object({
        granularity: z.enum(['hour', 'day', 'week', 'month', 'year']),
        category: z.string().optional(),
        location: z.string().optional(),
        dateRange: z
          .object({
            from: z.string(),
            to: z.string(),
          })
          .optional(),
      }),
      execute: async (params) => {
        const { data, error } = await this.supabase.rpc('temporal_aggregation', {
          p_granularity: params.granularity,
          p_category: params.category,
          p_location: params.location,
          p_start_date: params.dateRange?.from,
          p_end_date: params.dateRange?.to,
        })

        if (error) throw new Error(`Temporal analysis failed: ${error.message}`)

        return {
          periods: data || [],
          granularity: params.granularity,
          category: params.category,
        }
      },
    })
  }

  /**
   * Find Connections Tool - Multi-dimensional relationships
   */
  private createFindConnectionsTool() {
    return tool({
      description:
        'Find related experiences using multi-dimensional similarity (semantic, geographic, temporal, attributes)',
      parameters: z.object({
        experienceId: z.string(),
        useSemantic: z.boolean().default(true),
        useGeographic: z.boolean().default(true),
        useTemporal: z.boolean().default(true),
        useAttributes: z.boolean().default(true),
        maxResults: z.number().min(1).max(100).default(10),
        minScore: z.number().min(0).max(1).default(0.5),
      }),
      execute: async (params) => {
        const { data, error } = await this.supabase.rpc('find_related_experiences', {
          p_experience_id: params.experienceId,
          p_use_semantic: params.useSemantic,
          p_use_geographic: params.useGeographic,
          p_use_temporal: params.useTemporal,
          p_use_attributes: params.useAttributes,
          p_max_results: params.maxResults,
          p_min_score: params.minScore,
        })

        if (error) throw new Error(`Find connections failed: ${error.message}`)

        return {
          connections: data || [],
          count: data?.length || 0,
          sourceExperienceId: params.experienceId,
        }
      },
    })
  }
}
