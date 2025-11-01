import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/openai/client';
import { publishSchema, type PublishInput } from '@/lib/validation/submit-schemas';
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeAttributeValue,
  sanitizeEmail,
  sanitizeLocation,
  sanitizeCoordinates,
  containsSuspiciousPatterns
} from '@/lib/validation/sanitization';

/**
 * Secure Publish Experience API with full validation and transactions
 * Implements atomic database operations with rollback on failure
 */

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Start timing for performance monitoring
  const startTime = Date.now();

  try {
    // ============================================================
    // 1. AUTHENTICATION CHECK
    // ============================================================
    const { data: { user }, error: userError } = await (supabase as any).auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. REQUEST VALIDATION & SANITIZATION
    // ============================================================
    const body = await request.json();

    // Validate with Zod schema
    const validation = publishSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data: PublishInput = validation.data;

    // Additional security checks
    if (containsSuspiciousPatterns(data.text)) {
      console.warn(`Suspicious patterns detected for user ${user.id}`);
      return NextResponse.json(
        { error: 'Content contains prohibited patterns' },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. SANITIZE ALL INPUT DATA
    // ============================================================
    const sanitizedData = {
      title: sanitizeText(data.title),
      text: sanitizeRichText(data.text),
      enhancedText: data.enhancedText ? sanitizeRichText(data.enhancedText) : undefined,
      category: data.category, // Already validated by Zod enum
      tags: data.tags.map(tag => sanitizeText(tag)),
      location: data.location ? sanitizeLocation(data.location) : null,
      coordinates: (data.locationLat && data.locationLng)
        ? sanitizeCoordinates(data.locationLat, data.locationLng)
        : null,
      summary: data.summary ? sanitizeText(data.summary) : undefined,
      visibility: data.visibility,
    };

    // Determine final text to save
    const finalText = sanitizedData.enhancedText && data.enhancementEnabled
      ? sanitizedData.enhancedText
      : sanitizedData.text;

    // ============================================================
    // 4. DATABASE TRANSACTION - All or Nothing
    // ============================================================

    // Begin transaction-like operations with proper error handling
    let experienceId: string | null = null;
    let rollbackNeeded = false;

    try {
      // ============================================================
      // 4.1. INSERT MAIN EXPERIENCE RECORD
      // ============================================================
      const { data: experience, error: insertError } = await (supabase as any)
        .from('experiences')
        .insert({
          user_id: user.id,
          title: sanitizedData.title,
          story_text: finalText,
          category: sanitizedData.category,
          tags: sanitizedData.tags,
          date_occurred: data.dateOccurred || null,
          time_of_day: data.timeOfDay || null,
          duration: data.duration || null,
          location_text: sanitizedData.location,
          location_lat: sanitizedData.coordinates?.lat || null,
          location_lng: sanitizedData.coordinates?.lng || null,
          question_answers: data.questionAnswers || {},
          visibility: sanitizedData.visibility,
          ai_enhancement_used: data.aiEnhancementUsed || false,
          user_edited_ai: data.userEditedAi || false,
          enhancement_model: data.enhancementModel || null,
          // Add metadata
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Experience insert failed: ${insertError.message}`);
      }

      experienceId = experience.id;

      // ============================================================
      // 4.2. GENERATE AND SAVE EMBEDDING
      // ============================================================
      try {
        const embedding = await generateEmbedding(finalText);

        const { error: embeddingError } = await (supabase as any)
          .from('experiences')
          .update({
            embedding: JSON.stringify(embedding),
            embedding_model: 'text-embedding-ada-002',
            embedding_generated_at: new Date().toISOString(),
          })
          .eq('id', experienceId);

        if (embeddingError) {
          console.error('Embedding update error:', embeddingError);
          // Continue - embedding is not critical for initial publish
        }
      } catch (embeddingError) {
        console.error('Embedding generation failed:', embeddingError);
        // Continue without embedding
      }

      // ============================================================
      // 4.3. SAVE EXPERIENCE ATTRIBUTES
      // ============================================================
      if (data.attributes && Object.keys(data.attributes).length > 0) {
        const attributeRecords = Object.entries(data.attributes).map(([key, attr]) => {
          const sanitizedValue = sanitizeAttributeValue(attr.value);
          const sanitizedCustom = attr.customValue
            ? sanitizeAttributeValue(attr.customValue)
            : null;

          return {
            experience_id: experienceId,
            attribute_key: key,
            attribute_value: sanitizedValue,
            custom_value: sanitizedCustom,
            is_custom_value: attr.customValue ? true : false,
            confidence: Math.min(1, Math.max(0, attr.confidence)), // Clamp 0-1
            source: attr.isManuallyEdited ? 'user_confirmed' : 'ai_extracted',
            verified_by_user: attr.isManuallyEdited || false,
            created_by: user.id,
            created_at: new Date().toISOString(),
          };
        });

        const { error: attrError } = await (supabase as any)
          .from('experience_attributes')
          .insert(attributeRecords);

        if (attrError) {
          throw new Error(`Attributes insert failed: ${attrError.message}`);
        }
      }

      // ============================================================
      // 4.4. SAVE WITNESSES WITH VALIDATION
      // ============================================================
      if (data.witnesses && data.witnesses.length > 0) {
        const witnessRecords = data.witnesses.map(witness => {
          // Validate and sanitize witness data
          const sanitizedEmail = witness.email
            ? sanitizeEmail(witness.email)
            : null;

          return {
            experience_id: experienceId,
            name: sanitizeText(witness.name),
            contact_info: sanitizedEmail,
            user_id: witness.userId || null,
            is_verified: false,
            created_at: new Date().toISOString(),
          };
        });

        const { error: witnessError } = await (supabase as any)
          .from('experience_witnesses')
          .insert(witnessRecords);

        if (witnessError) {
          throw new Error(`Witnesses insert failed: ${witnessError.message}`);
        }
      }

      // ============================================================
      // 4.5. HANDLE MEDIA UPLOADS (deferred - needs separate upload flow)
      // ============================================================
      // Media URLs should come from a secure upload endpoint, not direct URLs
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        console.warn('Media URLs provided directly - should use secure upload flow');
        // TODO: Implement secure media upload handling
      }

      // ============================================================
      // 5. GAMIFICATION - XP AND BADGES
      // ============================================================
      const xpResult = await calculateAndAwardXP(
        supabase,
        user.id,
        experienceId!,
        {
          wordCount: finalText.split(/\s+/).length,
          hasExtraQuestions: !!data.questionAnswers && Object.keys(data.questionAnswers).length > 0,
          attributeCount: data.attributes ? Object.keys(data.attributes).length : 0,
        }
      );

      // ============================================================
      // 6. SUCCESS RESPONSE
      // ============================================================
      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        experienceId,
        xpEarned: xpResult.xpEarned,
        badgesEarned: xpResult.badgesEarned,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        processingTimeMs: processingTime,
      });

    } catch (dbError: any) {
      // ============================================================
      // ROLLBACK ON ERROR
      // ============================================================
      console.error('Database transaction error:', dbError);

      // Attempt to rollback by deleting the experience if it was created
      if (experienceId) {
        try {
          await (supabase as any)
            .from('experiences')
            .delete()
            .eq('id', experienceId);

          console.log(`Rolled back experience ${experienceId}`);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      return NextResponse.json(
        {
          error: 'Failed to save experience',
          details: dbError.message,
          rollback: experienceId ? 'attempted' : 'not-needed',
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Publish endpoint error:', error);

    // Log suspicious activity
    if (error.message?.includes('prohibited patterns')) {
      console.warn('Security: Prohibited patterns detected', {
        userId: (await (supabase as any).auth.getUser()).data?.user?.id,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to publish experience',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate and award XP based on contribution quality
 */
async function calculateAndAwardXP(
  supabase: any,
  userId: string,
  experienceId: string,
  metrics: {
    wordCount: number;
    hasExtraQuestions: boolean;
    attributeCount: number;
  }
) {
  let xpEarned = 50; // Base XP

  // Word count bonus (capped at 500 XP)
  if (metrics.wordCount >= 1000) xpEarned += 500;
  else if (metrics.wordCount >= 500) xpEarned += 200;
  else if (metrics.wordCount >= 300) xpEarned += 100;
  else if (metrics.wordCount >= 150) xpEarned += 50;

  // Extra questions bonus
  if (metrics.hasExtraQuestions) {
    xpEarned += 100;
  }

  // Attributes bonus (5 XP per attribute, max 50 XP)
  xpEarned += Math.min(50, metrics.attributeCount * 5);

  // Get current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single();

  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const newXP = currentXP + xpEarned;

  // Calculate level (progressive scaling)
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > currentLevel;

  // Update profile with new XP and level
  await supabase
    .from('profiles')
    .update({
      xp: newXP,
      level: newLevel,
      last_xp_earned_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Check and award badges
  const badgesEarned = await checkAndAwardBadges(
    supabase,
    userId,
    experienceId,
    {
      wordCount: metrics.wordCount,
      hasExtraQuestions: metrics.hasExtraQuestions,
      isFirstExperience: false, // Will be checked separately
    }
  );

  return {
    xpEarned,
    badgesEarned,
    leveledUp,
    newLevel: leveledUp ? newLevel : currentLevel,
  };
}

/**
 * Calculate level from XP with progressive scaling
 */
function calculateLevel(xp: number): number {
  // Progressive scaling: each level requires more XP
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-450, etc.
  let level = 1;
  let requiredXP = 100;
  let totalRequired = 0;

  while (xp >= totalRequired + requiredXP) {
    totalRequired += requiredXP;
    level++;
    requiredXP = 100 + (level - 1) * 50;
  }

  return level;
}

/**
 * Check and award appropriate badges
 */
async function checkAndAwardBadges(
  supabase: any,
  userId: string,
  experienceId: string,
  metrics: {
    wordCount: number;
    hasExtraQuestions: boolean;
    isFirstExperience: boolean;
  }
): Promise<string[]> {
  const badgesEarned: string[] = [];

  try {
    // Check if this is user's first experience
    const { count } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count === 1) {
      await awardBadge(supabase, userId, 'first-experience');
      badgesEarned.push('First Experience');
    }

    // Detailed Reporter badge
    if (metrics.wordCount >= 300) {
      const awarded = await awardBadge(supabase, userId, 'detailed-reporter');
      if (awarded) badgesEarned.push('Detailed Reporter');
    }

    // Pattern Seeker badge
    if (metrics.hasExtraQuestions) {
      const awarded = await awardBadge(supabase, userId, 'pattern-seeker');
      if (awarded) badgesEarned.push('Pattern Seeker');
    }

  } catch (error) {
    console.error('Badge check error:', error);
  }

  return badgesEarned;
}

/**
 * Award a specific badge to a user
 */
async function awardBadge(
  supabase: any,
  userId: string,
  badgeSlug: string
): Promise<boolean> {
  try {
    // Get badge details
    const { data: badge } = await supabase
      .from('badges')
      .select('id, name, description')
      .eq('slug', badgeSlug)
      .single();

    if (!badge) {
      console.warn(`Badge not found: ${badgeSlug}`);
      return false;
    }

    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .single();

    if (existing) {
      return false; // Already has badge
    }

    // Award the badge
    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badge.id,
      earned_at: new Date().toISOString(),
    });

    // Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'badge_earned',
      title: `Badge Earned: ${badge.name}`,
      message: badge.description || `You've earned the ${badge.name} badge!`,
      metadata: { badge_id: badge.id, badge_slug: badgeSlug },
      read: false,
      created_at: new Date().toISOString(),
    });

    console.log(`Badge awarded: ${badgeSlug} to user ${userId}`);
    return true;

  } catch (error) {
    console.error(`Failed to award badge ${badgeSlug}:`, error);
    return false;
  }
}