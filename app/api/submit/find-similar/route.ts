import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Find Similar Experiences API - Hybrid pattern matching
 * Uses: Text Similarity (pgvector) 40%, Attributes 30%, Category/Tags 20%, Location 10%
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    // Get the source experience with embedding and attributes
    const { data: sourceExp, error: sourceError } = await (supabase as any)
      .from('experiences')
      .select(`
        *,
        experience_attributes (
          attribute_key,
          attribute_value,
          confidence
        )
      `)
      .eq('id', experienceId)
      .single();

    if (sourceError || !sourceExp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Get source attributes map
    const sourceAttributes = new Map<string, string>();
    if (sourceExp.experience_attributes) {
      sourceExp.experience_attributes.forEach((attr: any) => {
        sourceAttributes.set(attr.attribute_key, attr.attribute_value);
      });
    }

    let candidateExperiences: any[] = [];

    // Step 1: Try pgvector semantic search if embedding exists
    if (sourceExp.embedding) {
      const { data: semanticMatches, error: vectorError } = await (supabase as any)
        .rpc('find_similar_experiences', {
          query_embedding: sourceExp.embedding,
          category_filter: null, // Don't filter by category to get diverse results
          similarity_threshold: 0.3, // 30% similarity threshold (lowered for more results)
          max_results: 20
        });

      if (!vectorError && semanticMatches && semanticMatches.length > 0) {
        candidateExperiences = semanticMatches;
      }
    }

    // Step 2: Fallback to manual search if no semantic matches
    if (candidateExperiences.length === 0) {
      const { data: manualMatches, error: fetchError } = await (supabase as any)
        .from('experiences')
        .select(`
          id, title, summary, category, tags, date_occurred, location_text, location_lat, location_lng, duration, story_text,
          experience_attributes (
            attribute_key,
            attribute_value,
            confidence
          )
        `)
        .neq('id', experienceId)
        .eq('visibility', 'public')
        .limit(50);

      if (!fetchError && manualMatches) {
        candidateExperiences = manualMatches;
      }
    } else {
      // Enrich semantic matches with attributes
      const ids = candidateExperiences.map((e: any) => e.id);
      const { data: enrichedExp } = await (supabase as any)
        .from('experiences')
        .select(`
          id, title, summary, category, tags, date_occurred, location_text, location_lat, location_lng, duration, story_text,
          experience_attributes (
            attribute_key,
            attribute_value,
            confidence
          )
        `)
        .in('id', ids);

      if (enrichedExp) {
        candidateExperiences = enrichedExp;
      }
    }

    if (!candidateExperiences || candidateExperiences.length === 0) {
      return NextResponse.json({ similar: [] });
    }

    // Calculate hybrid similarity scores
    const scoredExperiences = candidateExperiences
      .map((exp: any) => {
        let score = 0;
        const matchReasons: string[] = [];
        const sharedAttributes: string[] = [];

        // 1. Semantic Similarity (40% weight) - pgvector
        const semanticScore = exp.similarity || 0; // From find_similar_experiences RPC
        if (semanticScore > 0) {
          score += semanticScore * 0.4;
          matchReasons.push('Similar description');
        }

        // 2. Attribute Matching (30% weight)
        if (exp.experience_attributes) {
          const expAttributes = new Map<string, string>();
          exp.experience_attributes.forEach((attr: any) => {
            expAttributes.set(attr.attribute_key, attr.attribute_value);
          });

          // Count shared attributes
          let sharedCount = 0;
          sourceAttributes.forEach((value, key) => {
            if (expAttributes.get(key) === value) {
              sharedCount++;
              sharedAttributes.push(`${key}:${value}`);
            }
          });

          if (sharedCount > 0) {
            const maxAttributes = Math.max(sourceAttributes.size, expAttributes.size);
            const attributeSimilarity = sharedCount / maxAttributes;
            score += attributeSimilarity * 0.3;
            matchReasons.push(`${sharedCount} shared attributes`);
          }
        }

        // 3. Category & Tags (20% weight)
        let metadataScore = 0;
        if (exp.category === sourceExp.category) {
          metadataScore += 0.5; // 50% of 20% = 10%
          matchReasons.push('Same category');
        }

        const sourceTags = Array.isArray(sourceExp.tags) ? sourceExp.tags : [];
        const expTags = Array.isArray(exp.tags) ? exp.tags : [];
        const tagOverlap = sourceTags.filter((tag: any) => expTags.includes(tag)).length;
        if (tagOverlap > 0) {
          metadataScore += (tagOverlap / Math.max(sourceTags.length, expTags.length)) * 0.5;
          matchReasons.push(`${tagOverlap} matching tags`);
        }
        score += metadataScore * 0.2;

        // 4. Location Proximity (10% weight)
        if (
          sourceExp.location_lat &&
          sourceExp.location_lng &&
          exp.location_lat &&
          exp.location_lng
        ) {
          const distance = calculateDistance(
            sourceExp.location_lat,
            sourceExp.location_lng,
            exp.location_lat,
            exp.location_lng
          );

          if (distance < 50) {
            score += 0.1;
            matchReasons.push('Nearby location');
          } else if (distance < 200) {
            score += 0.05;
            matchReasons.push('Same region');
          }
        }

        // Create preview (first 200 chars of text)
        const preview = exp.story_text ? exp.story_text.substring(0, 200) + (exp.story_text.length > 200 ? '...' : '') : exp.summary;

        return {
          id: exp.id,
          title: exp.title,
          summary: exp.summary,
          category: exp.category,
          date: exp.date_occurred,
          location: exp.location_text,
          matchScore: Math.round(score * 100) / 100, // Round to 2 decimals
          matchReasons,
          sharedAttributes,
          preview,
        };
      })
      .filter((exp: any) => exp.matchScore > 0.1) // Only return experiences with >10% match (lowered for more results)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 matches

    return NextResponse.json({
      similar: scoredExperiences,
    });
  } catch (error: any) {
    console.error('Find similar error:', error);

    return NextResponse.json(
      {
        error: 'Failed to find similar experiences',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
