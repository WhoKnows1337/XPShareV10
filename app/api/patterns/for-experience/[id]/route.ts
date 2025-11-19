import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { featureFlags } from '@/lib/config/feature-flags';

/**
 * Pattern Insights API - ENHANCED
 * GET - Get pattern insights for an experience using all 10 pattern types
 *
 * Pattern Types (10 total):
 * 1. Semantic Similarity - Similar experiences
 * 2. Geographic Hotspots - Location clusters
 * 3. Temporal Clusters - Time-based patterns (moon phases, seasons)
 * 4. Cross-Category - Category overlaps
 * 5. Tag Networks - Tag co-occurrences
 * 6. Witness Networks - Shared witnesses (NEW)
 * 7. Sequential Patterns - Event sequences A→B→C (NEW)
 * 8. User Connections - XP DNA Twins (NEW)
 * 9. Location Chains - Geographic migration (NEW)
 * 10. Temporal Waves - Cyclical patterns (NEW)
 * 11. Tag Sequences - Specific tags (3:33, 11:11) (NEW)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify experience exists
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('id, category, location_text, user_id')
      .eq('id', id)
      .single();

    if (expError || !experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Step 1: Find similar experiences (attribute-based matching as fallback)
    const { data: similarExperiences, error: similarError } = await (supabase as any)
      .rpc('get_similar_experiences_by_attributes', {
        p_experience_id: id,
        p_min_shared_attributes: 1,  // Lower threshold to find more candidates
        p_limit: 50,  // Fetch 50 candidates for pattern detection
      });

    if (similarError) {
      console.warn('Similar experiences error:', similarError);
    }

    const candidateIds = similarExperiences
      ? [id, ...similarExperiences.map((e: any) => e.similar_experience_id).slice(0, 49)]
      : [id];

    // Step 2: Run enhanced pattern summary with all 10 pattern types
    const useAdvancedPatterns = featureFlags.advancedPatterns;

    const { data: patternSummary, error: patternError } = await (supabase as any)
      .rpc(
        useAdvancedPatterns ? 'get_enhanced_pattern_summary' : 'get_pattern_summary',
        {
          p_experience_ids: candidateIds,
          p_options: JSON.stringify({
            epsilon_km: 50,
            min_points: 2,
            min_cooccurrence: 2,
          }),
        }
      );

    if (patternError) {
      console.error('Pattern summary error:', patternError);
      throw patternError;
    }

    // Step 3: Transform patterns into insights format
    const insights: any[] = [];

    if (!patternSummary || !patternSummary.patterns) {
      console.warn('⚠️ No patterns found or patterns is null/undefined');
      return NextResponse.json({
        insights: [],
        summary: patternSummary?.summary || {},
        metadata: {
          experience_id: id,
          candidate_count: candidateIds.length,
          advanced_patterns_enabled: useAdvancedPatterns,
        },
      });
    }

    const patterns = patternSummary.patterns;

    // Geographic Patterns
    if (patterns.geographic?.patterns && patterns.geographic.patterns.length > 0) {
      const topCluster = patterns.geographic.patterns[0];
      if (topCluster.pattern_count >= 2) {
        insights.push({
          type: 'geographic',
          title: 'Geographic Hotspot',
          count: topCluster.pattern_count,
          location: experience.location_text || 'Regional',
          center: {
            lat: topCluster.metadata.center_lat,
            lng: topCluster.metadata.center_lng,
          },
          radius_km: topCluster.metadata.radius_km,
          description: `${topCluster.pattern_count} experiences in ${Math.round(topCluster.metadata.radius_km)}km radius`,
        });
      }
    }

    // Temporal Patterns (Moon Phases)
    if (patterns.temporal?.patterns && patterns.temporal.patterns.length > 0) {
      const moonPattern = patterns.temporal.patterns[0];
      if (moonPattern.pattern_count >= 2) {
        insights.push({
          type: 'temporal',
          title: `${moonPattern.metadata.emoji} ${moonPattern.metadata.phase_name}`,
          count: moonPattern.pattern_count,
          phase: moonPattern.metadata.phase,
          description: `${moonPattern.pattern_count} experiences during ${moonPattern.metadata.phase_name}`,
        });
      }
    }

    // Tag Network Patterns
    if (patterns.tag_network?.patterns && patterns.tag_network.patterns.length > 0) {
      const topTagPair = patterns.tag_network.patterns[0];
      if (topTagPair.cooccurrence_count >= 2) {
        insights.push({
          type: 'tag_network',
          title: 'Tag Connection',
          tags: [topTagPair.tag1, topTagPair.tag2],
          count: topTagPair.cooccurrence_count,
          strength: topTagPair.metadata.strength,
          description: `"${topTagPair.tag1}" and "${topTagPair.tag2}" appear together`,
        });
      }
    }

    // Cross-Category Patterns
    if (patterns.cross_category?.patterns && patterns.cross_category.patterns.length > 0) {
      const crossCat = patterns.cross_category.patterns[0];
      if (crossCat.overlap_count >= 2) {
        insights.push({
          type: 'cross_category',
          title: 'Category Overlap',
          categories: [crossCat.category1, crossCat.category2],
          count: crossCat.overlap_count,
          description: `${crossCat.category1} + ${crossCat.category2} connection`,
        });
      }
    }

    // NEW: Witness Networks (if advanced patterns enabled)
    if (useAdvancedPatterns && patterns.witness_networks?.patterns && patterns.witness_networks.patterns.length > 0) {
      const witnessNet = patterns.witness_networks.patterns[0];
      if (witnessNet.network_size >= 2) {
        insights.push({
          type: 'witness_network',
          title: 'Shared Witnesses',
          count: witnessNet.network_size,
          witnesses: witnessNet.witnesses,
          description: `${witnessNet.network_size} experiences share witnesses`,
        });
      }
    }

    // NEW: Sequential Patterns
    if (useAdvancedPatterns && patterns.sequential?.patterns && patterns.sequential.patterns.length > 0) {
      const sequence = patterns.sequential.patterns[0];
      if (sequence.sequence_count >= 2) {
        insights.push({
          type: 'sequential',
          title: 'Event Sequence',
          pattern: sequence.sequence_pattern,
          count: sequence.sequence_count,
          avg_gap_days: Math.round(sequence.avg_gap_days),
          description: `${sequence.sequence_pattern} occurs in sequence`,
        });
      }
    }

    // NEW: User Connections (XP DNA Twins)
    if (useAdvancedPatterns && patterns.user_connections?.patterns && patterns.user_connections.patterns.length > 0) {
      const userConn = patterns.user_connections.patterns[0];
      if (userConn.similarity_score >= 0.6) {
        insights.push({
          type: 'user_connection',
          title: 'XP DNA Twin',
          similarity: Math.round(userConn.similarity_score * 100),
          shared_categories: userConn.shared_categories,
          description: `${Math.round(userConn.similarity_score * 100)}% similarity with another user`,
        });
      }
    }

    // NEW: Location Chains
    if (useAdvancedPatterns && patterns.location_chains?.patterns && patterns.location_chains.patterns.length > 0) {
      const chain = patterns.location_chains.patterns[0];
      if (chain.chain_length >= 3) {
        insights.push({
          type: 'location_chain',
          title: 'Geographic Migration',
          chain_length: chain.chain_length,
          locations: chain.locations,
          time_span_days: chain.time_span_days,
          description: `Phenomenon moved across ${chain.chain_length} locations in ${chain.time_span_days} days`,
        });
      }
    }

    // NEW: Temporal Waves
    if (useAdvancedPatterns && patterns.temporal_waves?.patterns && patterns.temporal_waves.patterns.length > 0) {
      const wave = patterns.temporal_waves.patterns[0];
      if (wave.wave_count >= 2) {
        const cycleYears = Math.round((wave.wave_cycle_months / 12) * 10) / 10;
        insights.push({
          type: 'temporal_wave',
          title: `${cycleYears}-Year Cycle`,
          cycle_months: wave.wave_cycle_months,
          cycle_years: cycleYears,
          count: wave.wave_count,
          peak_dates: wave.peak_dates,
          description: `Pattern repeats every ~${cycleYears} years`,
        });
      }
    }

    // NEW: Tag Sequences (3:33, 11:11, etc.)
    if (useAdvancedPatterns && patterns.tag_sequences?.patterns && patterns.tag_sequences.patterns.length > 0) {
      const tagSeq = patterns.tag_sequences.patterns[0];
      if (tagSeq.occurrence_count >= 3) {
        insights.push({
          type: 'tag_sequence',
          title: `"${tagSeq.tag_pattern}" Pattern`,
          tag: tagSeq.tag_pattern,
          count: tagSeq.occurrence_count,
          pattern_category: tagSeq.metadata.pattern_category,
          description: `${tagSeq.occurrence_count} experiences mention "${tagSeq.tag_pattern}"`,
        });
      }
    }

    return NextResponse.json({
      insights,
      summary: patternSummary.summary,
      metadata: {
        experience_id: id,
        candidate_count: candidateIds.length,
        advanced_patterns_enabled: useAdvancedPatterns,
        total_patterns_found: patternSummary.summary?.total_patterns_found || 0,
      },
    });

  } catch (error: any) {
    console.error('Pattern insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pattern insights', details: error.message },
      { status: 500 }
    );
  }
}
