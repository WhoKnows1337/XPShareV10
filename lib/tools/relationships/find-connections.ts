/**
 * XPShare AI - Find Connections Tool
 *
 * Multi-dimensional relationship discovery.
 * Uses SQL function from Phase 1 for semantic, geographic, temporal, and attribute similarity.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Schema Definition
// ============================================================================

const findConnectionsSchema = z.object({
  experienceId: z.string().uuid().describe('UUID of the experience to find connections for'),
  useSemantic: z
    .boolean()
    .default(true)
    .describe('Use semantic similarity (vector embeddings, weight 0.4)'),
  useGeographic: z
    .boolean()
    .default(true)
    .describe('Use geographic similarity (PostGIS distance, weight 0.3)'),
  useTemporal: z
    .boolean()
    .default(true)
    .describe('Use temporal similarity (date proximity, weight 0.2)'),
  useAttributes: z
    .boolean()
    .default(true)
    .describe('Use attribute similarity (Jaccard index, weight 0.1)'),
  maxResults: z
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe('Maximum number of related experiences to return'),
  minScore: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Minimum combined similarity score (0-1)'),
})

// ============================================================================
// Tool Implementation
// ============================================================================

export const createFindConnectionsTool = (supabase: any) =>
  tool({
    description:
      'NETWORK ANALYSIS: Build relationship networks between experiences using multi-dimensional similarity scores. Requires an experienceId to analyze connections. Combines semantic vectors (0.4), geographic distance (0.3), temporal proximity (0.2), and attribute overlap (0.1) into weighted similarity scores. Returns ranked list of connected experiences with scores. DO NOT use for simple search - use this only when user asks for "connections", "relationships", "network", "similar to specific experience", or "related to [experience ID]".',
    inputSchema: findConnectionsSchema,
    execute: async (params) => {
      // Call SQL function from Phase 1 (using request-scoped Supabase client)
      const { data, error } = await supabase.rpc('find_related_experiences', {
        p_experience_id: params.experienceId,
        p_use_semantic: params.useSemantic,
        p_use_geographic: params.useGeographic,
        p_use_temporal: params.useTemporal,
        p_use_attributes: params.useAttributes,
        p_max_results: params.maxResults,
        p_min_score: params.minScore,
      })

      if (error) {
        throw new Error(`Find connections failed: ${error.message}`)
      }

      const connections = data || []

      // Calculate summary statistics
      const dimensions = []
      if (params.useSemantic) dimensions.push('semantic')
      if (params.useGeographic) dimensions.push('geographic')
      if (params.useTemporal) dimensions.push('temporal')
      if (params.useAttributes) dimensions.push('attributes')

      const avgScore =
        connections.length > 0
          ? connections.reduce((sum: number, c: any) => sum + (c.similarity_score || 0), 0) /
            connections.length
          : 0

      return {
        connections,
        count: connections.length,
        sourceExperienceId: params.experienceId,
        dimensionsUsed: dimensions,
        summary: {
          totalConnections: connections.length,
          averageScore: Math.round(avgScore * 1000) / 1000,
          minScore: params.minScore,
          dimensions: dimensions.join(', '),
        },
        summaryText: `Found ${connections.length} related experiences using ${dimensions.join(', ')} similarity`,
      }
    },
  })

// Backward compatibility: Default export using env vars (will be deprecated)
export const findConnectionsTool = createFindConnectionsTool(
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)
