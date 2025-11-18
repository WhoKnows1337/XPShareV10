import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Pattern Insights API - SIMPLIFIED
 * GET - Get top 2-3 most relevant pattern insights for an experience
 *
 * Returns only the most significant patterns:
 * - Geographic Hotspot (if cluster > 10 experiences)
 * - Temporal Pattern (if significance > 40%)
 * - Strongest Correlation (top 1)
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
      .select('id, category, location_text')
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
        insights: [],
      });
    }

    // Run only 3 DB queries in parallel - most important patterns only
    const [geoData, temporalData, correlationData] = await Promise.all([
      // 1. Geographic Hotspot (only for first attribute)
      (supabase as any)
        .rpc('get_attribute_geographic_clusters', {
          attr_key: attributes[0].attribute_key,
          attr_val: attributes[0].attribute_value,
          radius_km: 100,
        })
        .then((res: any) => res.data),

      // 2. Temporal Pattern (only for first attribute)
      (supabase as any)
        .rpc('get_attribute_temporal_patterns', {
          attr_key: attributes[0].attribute_key,
          attr_val: attributes[0].attribute_value,
        })
        .then((res: any) => res.data),

      // 3. Strongest Correlation (only for first attribute)
      (supabase as any)
        .rpc('get_attribute_correlation', {
          attr_key: attributes[0].attribute_key,
          attr_val: attributes[0].attribute_value,
          min_support: 0.05,
          min_confidence: 0.5, // Lowered to 50% to get more results
        })
        .then((res: any) => res.data),
    ]);

    const insights: any[] = [];

    // Extract Geographic Hotspot (only if significant)
    if (geoData && geoData.length > 0) {
      const largestCluster = geoData.sort((a: any, b: any) => b.cluster_count - a.cluster_count)[0];
      if (largestCluster.cluster_count >= 10) {
        insights.push({
          type: 'wave',
          title: `${experience.location_text || 'Regional'} Hotspot`,
          count: largestCluster.cluster_count,
          location: experience.location_text || 'Regional',
          timeframe: '30 days',
          trend: 200, // Mock trend for now
          attribute: attributes[0].attribute_key,
          value: attributes[0].attribute_value,
        });
      }
    }

    // Extract Temporal Pattern (only strongest)
    if (temporalData && temporalData.length > 0) {
      const strongestPattern = temporalData
        .filter((p: any) => parseFloat(p.percentage) > 40) // Only significant patterns
        .sort((a: any, b: any) => parseFloat(b.percentage) - parseFloat(a.percentage))[0];

      if (strongestPattern) {
        const period = strongestPattern.time_of_day || strongestPattern.day_of_week || strongestPattern.season;
        insights.push({
          type: 'temporal',
          title: `${period} Pattern`,
          period,
          count: strongestPattern.occurrence_count,
          trend: Math.round(parseFloat(strongestPattern.percentage)),
          comparison: 'vs. other times',
        });
      }
    }

    // Extract Strongest Correlation (top 1 only)
    if (correlationData && correlationData.length > 0) {
      const strongest = correlationData.sort((a: any, b: any) =>
        parseFloat(b.confidence) - parseFloat(a.confidence)
      )[0];

      if (strongest && parseFloat(strongest.confidence) > 0.6) {
        insights.push({
          type: 'correlation',
          title: `${strongest.correlated_key} Connection`,
          attribute1: attributes[0].attribute_key,
          value1: attributes[0].attribute_value,
          attribute2: strongest.correlated_key,
          value2: strongest.correlated_value,
          strength: parseFloat(strongest.confidence),
          percentage: Math.round(parseFloat(strongest.confidence) * 100),
          description: `${Math.round(parseFloat(strongest.confidence) * 100)}% of ${attributes[0].attribute_key}=${attributes[0].attribute_value} also report ${strongest.correlated_key}=${strongest.correlated_value}`,
        });
      }
    }

    return NextResponse.json({
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
