import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Similar Experiences by Shared Attributes
 * Uses the find_experiences_by_shared_attributes SQL function
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseFloat(searchParams.get('threshold') || '0.3');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call the SQL function to find similar experiences
    const { data: similarResults, error: similarError } = await supabase.rpc(
      'find_experiences_by_shared_attributes',
      {
        p_experience_id: experienceId,
        p_threshold: threshold,
        p_limit: limit,
      }
    );

    if (similarError) {
      console.error('Error finding similar experiences:', similarError);
      throw similarError;
    }

    if (!similarResults || similarResults.length === 0) {
      return NextResponse.json({ experiences: [] });
    }

    // Fetch full experience details for each similar experience
    const experienceIds = similarResults.map((r: any) => r.experience_id);

    const { data: experiences, error: fetchError } = await supabase
      .from('experiences')
      .select(`
        id,
        title,
        category,
        created_at,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .in('id', experienceIds)
      .eq('visibility', 'public');

    if (fetchError) {
      console.error('Error fetching experience details:', fetchError);
      throw fetchError;
    }

    // Merge similarity data with experience details
    const mergedResults = experiences.map((exp: any) => {
      const similarData = similarResults.find(
        (r: any) => r.experience_id === exp.id
      );

      return {
        ...exp,
        similarity_score: similarData?.similarity_score || 0,
        shared_attributes: similarData?.shared_attributes || {},
        shared_count: similarData?.shared_count || 0,
        total_attributes: similarData?.total_attributes || 0,
      };
    });

    // Sort by similarity score (descending)
    mergedResults.sort((a, b) => b.similarity_score - a.similarity_score);

    return NextResponse.json({
      experiences: mergedResults,
      count: mergedResults.length,
    });
  } catch (error: any) {
    console.error('Similar experiences API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch similar experiences',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
