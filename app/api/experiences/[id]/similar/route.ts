import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * Similar Experiences API - Uses REAL pgvector semantic similarity
 *
 * Priority order:
 * 1. pgvector semantic search (if embedding exists)
 * 2. Attribute-based Jaccard similarity (fallback)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    // Get the source experience WITH embedding
    const { data: sourceExperience, error: sourceError } = await supabase
      .from('experiences')
      .select('id, embedding, category, tags, location_lat, location_lng, story_text')
      .eq('id', id)
      .single()

    if (sourceError || !sourceExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      )
    }

    let similar: SimilarExperience[] = []
    let matchMethod: 'semantic' | 'attribute' | 'category' = 'category'

    // Strategy 1: pgvector semantic search (preferred)
    if (sourceExperience.embedding) {
      const { data: semanticMatches, error: rpcError } = await supabase.rpc('match_experiences', {
        query_embedding: sourceExperience.embedding,
        match_threshold: 0.5, // 50% minimum similarity (0-1 scale)
        match_count: 10,
        // Note: No p_experience_id param - we filter manually below
      })

      if (!rpcError && semanticMatches && semanticMatches.length > 0) {
        // Filter out self and convert similarity 0-1 → 0-100
        const filtered = semanticMatches
          .filter((match: PgVectorMatch) => match.id !== id)
          .slice(0, 8)

        if (filtered.length > 0) {
          matchMethod = 'semantic'
          similar = filtered.map((match: PgVectorMatch) => {
            const matchScore = Math.round(match.similarity * 100)
            return {
              id: match.id,
              title: match.title,
              category: match.category,
              date: match.date_occurred || null,
              teaser: match.story_text?.substring(0, 200) + '...' || '',
              user: null, // RPC doesn't return user profiles
              matchScore,
              matchReasons: [`${matchScore}% semantische Ähnlichkeit`],
            }
          })
        }
      }
    }

    // Strategy 2: Attribute-based similarity (fallback)
    if (similar.length === 0) {
      const { data: attrMatches, error: attrError } = await supabase.rpc('find_experiences_by_shared_attributes', {
        p_experience_id: id,
        p_threshold: 0.3, // 30% minimum Jaccard similarity
        p_limit: 8,
      })

      if (!attrError && attrMatches && attrMatches.length > 0) {
        matchMethod = 'attribute'

        // Fetch full details for matched experiences
        const matchIds = attrMatches.map((m: AttributeMatch) => m.experience_id)
        const { data: fullExperiences } = await supabase
          .from('experiences')
          .select(`
            id, title, category, date_occurred, story_text,
            user_profiles!experiences_user_id_fkey (username, display_name, avatar_url)
          `)
          .in('id', matchIds)
          .eq('visibility', 'public')

        const expMap = new Map(fullExperiences?.map((e: FullExperience) => [e.id, e]) || [])

        similar = attrMatches.map((match: AttributeMatch) => {
          const exp = expMap.get(match.experience_id) as FullExperience | undefined
          const score = Math.round(match.similarity_score * 100)
          return {
            id: match.experience_id,
            title: exp?.title || 'Untitled',
            category: exp?.category || sourceExperience.category,
            date: exp?.date_occurred || null,
            teaser: exp?.story_text?.substring(0, 200) + '...' || '',
            user: exp?.user_profiles || null,
            matchScore: score,
            matchReasons: [
              `${match.shared_count} gemeinsame Attribute`,
              `${score}% Attribut-Ähnlichkeit`,
            ],
          }
        })
      }
    }

    // Strategy 3: Same category (last resort - honest, no fake scores)
    if (similar.length === 0) {
      const { data: categoryMatches } = await supabase
        .from('experiences')
        .select(`
          id, title, category, date_occurred, story_text, tags,
          user_profiles!experiences_user_id_fkey (username, display_name, avatar_url)
        `)
        .eq('category', sourceExperience.category)
        .neq('id', id)
        .eq('visibility', 'public')
        .limit(5)

      if (categoryMatches && categoryMatches.length > 0) {
        matchMethod = 'category'
        similar = categoryMatches.map((exp) => {
          // Calculate honest tag overlap score
          const sourceTags = sourceExperience.tags || []
          const expTags = exp.tags || []
          const commonTags = sourceTags.filter((tag: string) => expTags.includes(tag))
          const tagScore = sourceTags.length > 0
            ? Math.round((commonTags.length / Math.max(sourceTags.length, expTags.length)) * 50)
            : 0

          return {
            id: exp.id,
            title: exp.title,
            category: exp.category,
            date: exp.date_occurred,
            teaser: exp.story_text?.substring(0, 200) + '...' || '',
            user: exp.user_profiles,
            matchScore: 40 + tagScore, // 40 base for same category + tag bonus
            matchReasons: [
              `Gleiche Kategorie: ${exp.category}`,
              commonTags.length > 0 ? `${commonTags.length} gemeinsame Tags` : null,
            ].filter(Boolean) as string[],
          }
        })
      }
    }

    // Sort by match score
    similar.sort((a, b) => b.matchScore - a.matchScore)

    // Calculate stats
    const stats = {
      totalSimilar: similar.length,
      globalCategoryCount: await getGlobalCategoryCount(supabase, sourceExperience.category),
      averageMatchScore: similar.length
        ? Math.floor(similar.reduce((sum, exp) => sum + exp.matchScore, 0) / similar.length)
        : 0,
      matchMethod,
    }

    return NextResponse.json({
      similar: similar.slice(0, 5),
      stats,
    })
  } catch (error) {
    console.error('Similar experiences error:', error)
    return NextResponse.json(
      {
        error: 'Failed to find similar experiences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Types
interface SimilarExperience {
  id: string
  title: string
  category: string
  date: string | null
  teaser: string
  user: UserProfile | null
  matchScore: number
  matchReasons: string[]
}

interface UserProfile {
  username: string
  display_name: string | null
  avatar_url?: string | null
}

interface PgVectorMatch {
  id: string
  title: string
  story_text: string | null
  category: string
  date_occurred: string | null
  location_text: string | null
  tags: string[]
  similarity: number // 0-1 scale
  exact_match: boolean
}

interface AttributeMatch {
  experience_id: string
  similarity_score: number
  shared_attributes: unknown // Json type from Supabase
  shared_count: number
  total_attributes: number
}

interface FullExperience {
  id: string
  title: string
  category: string
  date_occurred: string | null
  story_text: string | null
  user_profiles: UserProfile | null
}

// Helper: Get global count for category
async function getGlobalCategoryCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  category: string
): Promise<number> {
  const { count, error } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('visibility', 'public')

  if (error) {
    console.error('Count error:', error)
    return 0
  }

  return count || 0
}

// Use nodejs runtime for Supabase cookies() compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
