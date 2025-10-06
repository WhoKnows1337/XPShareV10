import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { text, category, tags, experienceId, limit = 5 } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // For now, use simple text-based matching until embeddings are generated
    // This will find experiences with similar:
    // 1. Category
    // 2. Tags
    // 3. Keywords in story text

    let query = supabase
      .from('experiences')
      .select(`
        id,
        title,
        story_text,
        category,
        tags,
        location_text,
        date_occurred,
        created_at,
        user_profiles!experiences_user_id_fkey (
          username,
          display_name
        )
      `)
      .eq('visibility', 'public')

    // Exclude current experience if provided
    if (experienceId) {
      query = query.neq('id', experienceId)
    }

    // Priority 1: Same category
    if (category) {
      query = query.eq('category', category)
    }

    const { data: experiences, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit * 2) // Get more to filter

    if (error) {
      console.error('Similar experiences query error:', error)
      return NextResponse.json({ error: 'Failed to fetch similar experiences' }, { status: 500 })
    }

    // Score and sort by similarity
    const scoredExperiences = (experiences || []).map((exp: any) => {
      let score = 0

      // Same category: +3 points
      if (exp.category === category) score += 3

      // Matching tags: +1 point per tag
      if (tags && exp.tags) {
        const matchingTags = exp.tags.filter((tag: string) =>
          tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
        )
        score += matchingTags.length
      }

      // Same location: +2 points
      // Add more scoring logic here

      return { ...exp, similarity_score: score }
    })

    // Sort by score and return top results
    const sortedExperiences = scoredExperiences
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    return NextResponse.json({
      experiences: sortedExperiences,
      count: sortedExperiences.length,
    })
  } catch (error) {
    console.error('Similar experiences API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
