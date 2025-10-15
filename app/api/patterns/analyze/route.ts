import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Pattern Analysis API - Trigger background pattern discovery
 *
 * Called after experience publication to analyze patterns
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await (supabase as any).auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { experienceId } = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Verify user owns this experience
    const { data: experience, error: fetchError } = await supabase
      .from('experiences')
      .select('id, user_id')
      .eq('id', experienceId)
      .single();

    if (fetchError || !experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    if (experience.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Call Edge Function for pattern analysis
    const edgeFunctionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      'https://',
      'https://'
    ) + '/functions/v1/pattern-discovery';

    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ experienceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', errorData);
        throw new Error('Edge function failed');
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        experienceId,
        insightsGenerated: result.insightsGenerated || 0,
      });
    } catch (edgeError) {
      // Fallback: Call SQL function directly
      console.warn('Edge function unavailable, using direct SQL:', edgeError);

      const { error: sqlError } = await (supabase as any).rpc(
        'update_pattern_insights_for_experience',
        { p_experience_id: experienceId }
      );

      if (sqlError) {
        console.error('Direct SQL error:', sqlError);
        throw sqlError;
      }

      return NextResponse.json({
        success: true,
        experienceId,
        method: 'direct_sql',
      });
    }
  } catch (error: any) {
    console.error('Pattern analysis error:', error);

    return NextResponse.json(
      {
        error: 'Pattern analysis failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get pattern insights for an experience
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experienceId is required' },
        { status: 400 }
      );
    }

    // Fetch pattern insights
    const { data: insights, error } = await (supabase as any)
      .from('pattern_insights')
      .select('*')
      .eq('experience_id', experienceId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      experienceId,
      insights: insights || [],
    });
  } catch (error: any) {
    console.error('Get pattern insights error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch pattern insights',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
