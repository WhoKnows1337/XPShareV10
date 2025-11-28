import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/experiences/[id]/validation
 *
 * Returns validation metrics for an experience:
 * - similar_count: Number of similar experiences found
 * - avg_match_quality: Average match quality score (0-100)
 * - is_trending: Whether the experience is currently trending
 * - is_in_wave: Whether experience is part of a geographic wave pattern
 * - pattern_confidence: Confidence score of pattern detection
 *
 * @see docs/maindocs/xpresultsv2/04-components-spec.md - Section 3 (ValidationScoreCard)
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 2, Task 2.1
 */

interface ValidationAPIResponse {
  similar_count: number;
  avg_match_quality: number;
  is_trending: boolean;
  is_in_wave: boolean;
  pattern_confidence: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: experienceId } = await params;
    const supabase = await createClient();

    // Query validation metrics from experience_matches table
    // Note: RPC and tables may not be in generated types yet - cast as any
    const { data, error } = await (supabase as any).rpc('get_validation_metrics', {
      p_experience_id: experienceId,
    });

    if (error) {
      console.error('[ValidationAPI] Error fetching validation metrics:', error);

      // Fallback: Direct query if RPC doesn't exist yet
      const { data: matchData, error: matchError } = await (supabase as any)
        .from('experience_matches')
        .select('match_score')
        .eq('experience_id', experienceId);

      if (matchError) {
        return NextResponse.json(
          { error: 'Failed to fetch validation data' },
          { status: 500 }
        );
      }

      const similar_count = matchData?.length || 0;
      const avg_match_quality = matchData && matchData.length > 0
        ? Math.round(matchData.reduce((sum: number, m: any) => sum + (m.match_score || 0), 0) / matchData.length)
        : 0;

      // Basic trending detection: Check if experience has recent activity
      const { count: recentViews } = await (supabase as any)
        .from('experience_views')
        .select('*', { count: 'exact', head: true })
        .eq('experience_id', experienceId)
        .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const is_trending = (recentViews || 0) > 10;

      // Check for geographic wave pattern
      const { data: patternData } = await (supabase as any)
        .from('experience_patterns')
        .select('pattern_type, confidence')
        .eq('experience_id', experienceId)
        .eq('pattern_type', 'geographic_wave')
        .single();

      const response: ValidationAPIResponse = {
        similar_count,
        avg_match_quality,
        is_trending,
        is_in_wave: !!patternData,
        pattern_confidence: patternData?.confidence || 0,
      };

      return NextResponse.json(response);
    }

    // If RPC exists, use its response
    return NextResponse.json(data as ValidationAPIResponse);
  } catch (error) {
    console.error('[ValidationAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
