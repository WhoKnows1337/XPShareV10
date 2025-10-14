import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Publish Experience API - Saves experience and returns rewards
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const experienceData = await request.json();

    // Insert experience into database
    const { data: experience, error: insertError } = await supabase
      .from('experiences')
      .insert({
        user_id: user.id,
        title: experienceData.title,
        text: experienceData.enhancedText || experienceData.text,
        summary: experienceData.summary,
        category: experienceData.category,
        tags: experienceData.tags,
        date: experienceData.date,
        time: experienceData.time,
        location: experienceData.location,
        location_lat: experienceData.locationLat,
        location_lng: experienceData.locationLng,
        duration: experienceData.duration,
        extra_questions: experienceData.extraQuestions,
        word_count: experienceData.wordCount,
        visibility: experienceData.visibility,
        status: 'published',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save experience', details: insertError.message }, { status: 500 });
    }

    // Save attributes to experience_attributes table
    if (experienceData.attributes && Object.keys(experienceData.attributes).length > 0) {
      const attributeRecords = Object.entries(experienceData.attributes).map(([key, attr]: [string, any]) => ({
        experience_id: experience.id,
        attribute_key: key,
        attribute_value: attr.value,
        confidence: attr.confidence / 100, // Convert from 0-100 to 0.0-1.0
        source: attr.isManuallyEdited ? 'user_confirmed' : 'ai_extracted',
        verified_by_user: attr.isManuallyEdited || false,
        created_by: user.id,
      }));

      const { error: attributesError } = await supabase
        .from('experience_attributes')
        .insert(attributeRecords);

      if (attributesError) {
        console.error('Error saving attributes:', attributesError);
        // Don't fail the entire publish if attributes fail
      }
    }

    // Calculate XP earned based on contribution
    let xpEarned = 50; // Base XP

    // Bonus for word count
    if (experienceData.wordCount >= 500) xpEarned += 200;
    else if (experienceData.wordCount >= 300) xpEarned += 100;
    else if (experienceData.wordCount >= 150) xpEarned += 50;
    else if (experienceData.wordCount >= 50) xpEarned += 20;

    // Bonus for extra questions
    if (experienceData.extraQuestions && Object.keys(experienceData.extraQuestions).length > 0) {
      xpEarned += 100;
    }

    // Bonus for attributes (5 XP per confirmed attribute)
    if (experienceData.attributes && Object.keys(experienceData.attributes).length > 0) {
      const attributeCount = Object.keys(experienceData.attributes).length;
      xpEarned += attributeCount * 5;
    }

    // Award XP to user
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();

    const currentXP = profile?.xp || 0;
    const currentLevel = profile?.level || 1;
    const newXP = currentXP + xpEarned;

    // Calculate new level (100 XP per level, simple formula)
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > currentLevel;

    // Update profile
    await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
      })
      .eq('id', user.id);

    // Check for badges earned (simplified logic)
    const badgesEarned: string[] = [];

    // First Experience badge
    const { count } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count === 1) {
      badgesEarned.push('First Experience');
      // Award badge in database
      await awardBadge(supabase, user.id, 'first-experience');
    }

    // Detailed Reporter badge (>300 words)
    if (experienceData.wordCount >= 300 && !badgesEarned.includes('Detailed Reporter')) {
      badgesEarned.push('Detailed Reporter');
      await awardBadge(supabase, user.id, 'detailed-reporter');
    }

    // Pattern Seeker badge (completed extra questions)
    if (
      experienceData.extraQuestions &&
      Object.keys(experienceData.extraQuestions).length > 0 &&
      !badgesEarned.includes('Pattern Seeker')
    ) {
      badgesEarned.push('Pattern Seeker');
      await awardBadge(supabase, user.id, 'pattern-seeker');
    }

    return NextResponse.json({
      experienceId: experience.id,
      xpEarned,
      badgesEarned,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    });
  } catch (error: any) {
    console.error('Publish error:', error);

    return NextResponse.json(
      {
        error: 'Failed to publish experience',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to award badges
async function awardBadge(supabase: any, userId: string, badgeSlug: string) {
  try {
    // Get badge ID
    const { data: badge } = await supabase
      .from('badges')
      .select('id, name')
      .eq('slug', badgeSlug)
      .single();

    if (!badge) return;

    // Check if user already has badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .single();

    if (existing) return;

    // Award badge
    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badge.id,
    });

    // Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'badge_earned',
      title: `Badge Earned: ${badge.name}`,
      message: `You've earned the ${badge.name} badge!`,
      read: false,
    });
  } catch (error) {
    console.error('Award badge error:', error);
  }
}
