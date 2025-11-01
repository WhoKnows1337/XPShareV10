import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Find Similar Experiences API - Pattern matching for similar experiences
 * Uses category, tags, location, duration, and text similarity
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    // Get the source experience
    const { data: sourceExp, error: sourceError } = await (supabase as any)
      .from('experiences')
      .select('*')
      .eq('id', experienceId)
      .single();

    if (sourceError || !sourceExp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Find similar experiences
    // Strategy: Match by category first, then by tags, then by location proximity

    const { data: allExperiences, error: fetchError } = await (supabase as any)
      .from('experiences')
      .select('id, title, summary, category, tags, date, location, location_lat, location_lng, duration')
      .neq('id', experienceId)
      .eq('status', 'published')
      .limit(50);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ similar: [] });
    }

    if (!allExperiences || allExperiences.length === 0) {
      return NextResponse.json({ similar: [] });
    }

    // Calculate similarity scores
    const scoredExperiences = allExperiences
      .map((exp: any) => {
        let score = 0;
        const matchReasons: string[] = [];

        // Category match (40% weight)
        if (exp.category === sourceExp.category) {
          score += 0.4;
          matchReasons.push('Same category');
        }

        // Tag overlap (30% weight)
        const sourceTags = Array.isArray(sourceExp.tags) ? sourceExp.tags : [];
        const expTags = Array.isArray(exp.tags) ? exp.tags : [];
        const tagOverlap = sourceTags.filter((tag: any) => expTags.includes(tag)).length;
        if (tagOverlap > 0) {
          score += (tagOverlap / Math.max(sourceTags.length, expTags.length)) * 0.3;
          matchReasons.push(`${tagOverlap} matching tags`);
        }

        // Duration match (10% weight)
        if (exp.duration === sourceExp.duration) {
          score += 0.1;
          matchReasons.push('Same duration');
        }

        // Location proximity (20% weight)
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

          // Within 50km
          if (distance < 50) {
            score += 0.2;
            matchReasons.push('Nearby location');
          } else if (distance < 200) {
            score += 0.1;
            matchReasons.push('Same region');
          }
        }

        return {
          ...exp,
          matchScore: score,
          matchReasons,
        };
      })
      .filter((exp: any) => exp.matchScore > 0.2) // Only return experiences with >20% match
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
