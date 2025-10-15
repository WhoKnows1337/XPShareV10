import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Pattern Insights API
 * GET - Get pattern insights for an experience
 *
 * Returns correlations, geographic clusters, temporal patterns, and co-occurrence
 * based on the experience's attributes.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify experience exists and get its attributes
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('id, category')
      .eq('id', id)
      .single();

    if (expError || !experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Get experience attributes
    const { data: attributes, error: attrError } = await supabase
      .from('experience_attributes')
      .select('attribute_key, attribute_value')
      .eq('experience_id', id);

    if (attrError) {
      throw attrError;
    }

    if (!attributes || attributes.length === 0) {
      return NextResponse.json({
        success: true,
        hasPatterns: false,
        message: 'No attributes found for pattern analysis',
      });
    }

    // Prepare pattern insights response
    const insights: any = {
      correlations: {},
      geographic: [],
      temporal: [],
      coOccurrence: [],
      valueDistribution: {},
      similar: [],
      confidenceStats: {},
    };

    // 1. Get attribute correlations
    for (const attr of attributes) {
      const { data: correlations } = await (supabase as any)
        .rpc('get_attribute_correlation', {
          attr_key: attr.attribute_key,
          attr_val: attr.attribute_value,
          min_support: 0.05, // 5% minimum support
          min_confidence: 0.6, // 60% minimum confidence
        });

      if (correlations && correlations.length > 0) {
        correlations.forEach((corr: any) => {
          const key = `${attr.attribute_key}_${corr.correlated_key}`;
          insights.correlations[key] = {
            attribute1: attr.attribute_key,
            value1: attr.attribute_value,
            attribute2: corr.correlated_key,
            value2: corr.correlated_value,
            strength: parseFloat(corr.confidence),
            support: parseFloat(corr.support),
            description: `${Math.round(parseFloat(corr.confidence) * 100)}% of ${attr.attribute_key}=${attr.attribute_value} also report ${corr.correlated_key}=${corr.correlated_value}`,
          };
        });
      }
    }

    // 2. Get geographic clusters
    if (attributes.length > 0) {
      const { data: geoClusters } = await (supabase as any)
        .rpc('get_attribute_geographic_clusters', {
          attr_key: attributes[0].attribute_key,
          attr_val: attributes[0].attribute_value,
          radius_km: 100,
        });

      if (geoClusters && geoClusters.length > 0) {
        insights.geographic = geoClusters.map((cluster: any) => ({
          latitude: parseFloat(cluster.center_lat),
          longitude: parseFloat(cluster.center_lng),
          count: cluster.cluster_count,
          radius: 100,
          attribute: attributes[0].attribute_key,
          value: attributes[0].attribute_value,
        }));
      }
    }

    // 3. Get temporal patterns
    for (const attr of attributes.slice(0, 3)) { // Limit to first 3 attributes
      const { data: temporal } = await (supabase as any)
        .rpc('get_attribute_temporal_patterns', {
          attr_key: attr.attribute_key,
          attr_val: attr.attribute_value,
        });

      if (temporal && temporal.length > 0) {
        temporal.forEach((pattern: any) => {
          insights.temporal.push({
            attribute: attr.attribute_key,
            value: attr.attribute_value,
            timeOfDay: pattern.time_of_day,
            dayOfWeek: pattern.day_of_week,
            season: pattern.season,
            count: pattern.occurrence_count,
            percentage: parseFloat(pattern.percentage),
          });
        });
      }
    }

    // 4. Get co-occurrence patterns
    for (const attr of attributes.slice(0, 2)) { // Limit to first 2 attributes
      const { data: coOccurrence } = await (supabase as any)
        .rpc('get_attribute_co_occurrence', {
          attr_key: attr.attribute_key,
          attr_val: attr.attribute_value,
          min_count: 2,
        });

      if (coOccurrence && coOccurrence.length > 0) {
        coOccurrence.forEach((coOcc: any) => {
          insights.coOccurrence.push({
            attribute1: attr.attribute_key,
            value1: attr.attribute_value,
            attribute2: coOcc.co_occurring_key,
            value2: coOcc.co_occurring_value,
            count: coOcc.co_occurrence_count,
            correlation: parseFloat(coOcc.correlation_strength),
          });
        });
      }
    }

    // 5. Get value distribution
    for (const attr of attributes) {
      const { data: distribution } = await (supabase as any)
        .rpc('get_attribute_value_distribution', {
          attr_key: attr.attribute_key,
        });

      if (distribution && distribution.length > 0) {
        insights.valueDistribution[attr.attribute_key] = distribution.map((dist: any) => ({
          value: dist.attribute_value,
          count: dist.value_count,
          percentage: parseFloat(dist.percentage),
        }));
      }
    }

    // 6. Get similar experiences
    const { data: similar } = await (supabase as any)
      .rpc('get_similar_experiences_by_attributes', {
        exp_id: id,
        min_shared: Math.min(2, attributes.length), // At least 2 shared attributes or all if less
        max_results: 10,
      });

    if (similar && similar.length > 0) {
      insights.similar = similar.map((sim: any) => ({
        experienceId: sim.similar_experience_id,
        sharedAttributeCount: sim.shared_attribute_count,
        similarity: parseFloat(sim.similarity_score),
        sharedAttributes: sim.shared_attributes,
      }));
    }

    // 7. Get confidence stats
    for (const attr of attributes) {
      const { data: stats } = await (supabase as any)
        .rpc('get_attribute_confidence_stats', {
          attr_key: attr.attribute_key,
          attr_val: attr.attribute_value,
        });

      if (stats && stats.length > 0) {
        insights.confidenceStats[attr.attribute_key] = {
          value: attr.attribute_value,
          avgConfidence: parseFloat(stats[0].avg_confidence),
          aiExtractedCount: stats[0].ai_extracted_count,
          userConfirmedCount: stats[0].user_confirmed_count,
          totalCount: stats[0].total_count,
          confirmationRate: parseFloat(stats[0].confirmation_rate),
        };
      }
    }

    return NextResponse.json({
      success: true,
      hasPatterns: true,
      experienceId: id,
      attributeCount: attributes.length,
      insights,
    });

  } catch (error: any) {
    console.error('Pattern insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pattern insights', details: error.message },
      { status: 500 }
    );
  }
}
