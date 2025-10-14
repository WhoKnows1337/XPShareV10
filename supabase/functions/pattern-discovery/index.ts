// ═════════════════════════════════════════════════════════════════════
// PATTERN DISCOVERY EDGE FUNCTION
// Runs pattern analysis after experience publication
// ═════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatternDiscoveryRequest {
  experienceId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { experienceId }: PatternDiscoveryRequest = await req.json();

    if (!experienceId) {
      return new Response(
        JSON.stringify({ error: 'experienceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting pattern discovery for experience: ${experienceId}`);

    // Step 1: Call the SQL function to update pattern insights
    const { error: patternError } = await supabase.rpc(
      'update_pattern_insights_for_experience',
      { p_experience_id: experienceId }
    );

    if (patternError) {
      console.error('Error updating pattern insights:', patternError);
      throw patternError;
    }

    console.log(`✓ Pattern insights updated for experience: ${experienceId}`);

    // Step 2: Get the generated insights
    const { data: insights, error: fetchError } = await supabase
      .from('pattern_insights')
      .select('*')
      .eq('experience_id', experienceId);

    if (fetchError) {
      console.error('Error fetching pattern insights:', fetchError);
      throw fetchError;
    }

    console.log(`✓ Found ${insights?.length || 0} pattern insights`);

    // Step 3: Optional - Generate additional analytics
    // For example, update experience metadata with pattern counts
    if (insights && insights.length > 0) {
      const correlationInsight = insights.find(
        (i) => i.pattern_type === 'attribute_correlation'
      );

      if (correlationInsight) {
        const similarCount = correlationInsight.insight_data?.similar_experiences?.length || 0;

        // Update experience with similar count (optional metadata)
        const { error: updateError } = await supabase
          .from('experiences')
          .update({
            // You can add a column for this if needed
            // similar_experiences_count: similarCount
          })
          .eq('id', experienceId);

        if (updateError) {
          console.warn('Error updating experience metadata:', updateError);
          // Don't throw - this is non-critical
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        experienceId,
        insightsGenerated: insights?.length || 0,
        insights: insights?.map((i) => ({
          type: i.pattern_type,
          strength: i.strength,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Pattern discovery error:', error);

    return new Response(
      JSON.stringify({
        error: 'Pattern discovery failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
