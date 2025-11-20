/**
 * Discovery Stream Events Generator
 * Generates progressive discovery events for the loading screen
 */

import { createClient } from '@/lib/supabase/server';
import type { DiscoveryEvent, DiscoveryResult } from '@/components/discovery/types';

export async function generateDiscoveryEvents(experienceId: string): Promise<DiscoveryEvent[]> {
  const supabase = await createClient();
  const events: DiscoveryEvent[] = [];

  // Event 1: Saved
  events.push({
    type: 'saved',
    timestamp: Date.now(),
  });

  // Event 2: Embedding generation
  events.push({
    type: 'embedding',
    timestamp: Date.now() + 500,
    data: { message: 'Generating semantic embedding...' },
  });

  // Event 3: Start scanning
  const { count: totalCount } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true });

  events.push({
    type: 'scanning',
    timestamp: Date.now() + 1000,
    data: { count: totalCount || 0 },
  });

  // Event 4: Find similar experiences
  const { data: similarExperiences } = await supabase.rpc(
    'get_similar_experiences_by_attributes',
    {
      p_experience_id: experienceId,
      p_limit: 50,
    }
  );

  const similarCount = similarExperiences?.length || 0;

  events.push({
    type: 'similar_found',
    timestamp: Date.now() + 2000,
    data: { count: similarCount },
  });

  // Event 5: Check for active wave
  if (similarCount > 10) {
    // Check recent similar (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = similarExperiences?.filter((exp: any) => {
      const createdAt = new Date(exp.created_at);
      return createdAt >= sevenDaysAgo;
    }).length || 0;

    if (recentCount > 5) {
      events.push({
        type: 'wave_detected',
        timestamp: Date.now() + 3000,
        data: { message: 'Active wave detected' },
      });
    }
  }

  // Event 6: Get experience details for category
  const { data: experience } = await supabase
    .from('experiences')
    .select('category, location_text')
    .eq('id', experienceId)
    .single();

  if (experience) {
    // Category matches
    const categoryMatches = similarExperiences?.filter(
      (exp: any) => exp.category === experience.category
    ).length || 0;

    if (categoryMatches > 0) {
      events.push({
        type: 'category_match',
        timestamp: Date.now() + 4000,
        data: {
          count: categoryMatches,
          category: experience.category,
        },
      });
    }

    // Location cluster
    if (experience.location_text && similarCount > 5) {
      const locationParts = experience.location_text.split(',');
      const city = locationParts[0]?.trim();

      events.push({
        type: 'location_cluster',
        timestamp: Date.now() + 5000,
        data: { location: city },
      });
    }
  }

  // Event 7: Temporal patterns
  if (similarCount > 3) {
    events.push({
      type: 'temporal_pattern',
      timestamp: Date.now() + 6000,
      data: { timeframe: 'Peak activity detected' },
    });
  }

  return events;
}

export async function getDiscoveryResult(experienceId: string): Promise<DiscoveryResult> {
  const supabase = await createClient();

  // Get similar experiences
  const { data: similarExperiences } = await supabase.rpc(
    'get_similar_experiences_by_attributes',
    {
      p_experience_id: experienceId,
      p_limit: 50,
    }
  );

  const similarCount = similarExperiences?.length || 0;

  // Get experience details
  const { data: experience } = await supabase
    .from('experiences')
    .select('category, location_text, time_of_day')
    .eq('id', experienceId)
    .single();

  // Calculate matches
  const categoryMatches = similarExperiences?.filter(
    (exp: any) => exp.category === experience?.category
  ).length || 0;

  const locationMatches = similarExperiences?.filter(
    (exp: any) => exp.location_text?.split(',')[0]?.trim() === experience?.location_text?.split(',')[0]?.trim()
  ).length || 0;

  const temporalMatches = similarExperiences?.filter(
    (exp: any) => exp.time_of_day === experience?.time_of_day
  ).length || 0;

  // Check for active wave
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = similarExperiences?.filter((exp: any) => {
    const createdAt = new Date(exp.created_at);
    return createdAt >= sevenDaysAgo;
  }).length || 0;

  const hasActiveWave = recentCount > 5;

  // Calculate pattern strength (0-100)
  const patternStrength = Math.min(100, Math.round(
    (categoryMatches / Math.max(similarCount, 1)) * 40 +
    (locationMatches / Math.max(similarCount, 1)) * 30 +
    (temporalMatches / Math.max(similarCount, 1)) * 20 +
    (hasActiveWave ? 10 : 0)
  ));

  // Get rewards data (from publish result if available)
  // For now, use default values - this should come from the publish API
  const rewards = {
    xpEarned: 50,
    badgesEarned: [],
    leveledUp: false,
    currentLevel: 1,
  };

  return {
    experienceId,
    similarCount,
    categoryMatches,
    locationMatches,
    temporalMatches,
    hasActiveWave,
    patternStrength,
    rewards,
  };
}
