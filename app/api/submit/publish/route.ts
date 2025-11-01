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

// ⚠️ CRITICAL: Force Node.js runtime for Supabase cookies() compatibility on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Optimized Publish Experience API using PostgreSQL atomic function
 * Significantly reduced complexity - delegates transaction handling to DB
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    // ============================================================
    // 1. AUTHENTICATION CHECK
    // ============================================================
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ============================================================
    // 2. REQUEST VALIDATION & SANITIZATION
    // ============================================================
    const body = await request.json();
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

    // Security check for suspicious patterns
    if (containsSuspiciousPatterns(data.text)) {
      console.warn(`Suspicious patterns detected for user ${user.id}`);
      return NextResponse.json(
        { error: 'Content contains prohibited patterns' },
        { status: 400 }
      );
    }

    // ============================================================
    // 3. PREPARE DATA FOR ATOMIC FUNCTION
    // ============================================================
    const sanitizedData = {
      title: sanitizeText(data.title),
      text: sanitizeRichText(data.text),
      enhancedText: data.enhancedText ? sanitizeRichText(data.enhancedText) : undefined,
      category: data.category,
      tags: data.tags.map(tag => sanitizeText(tag)),
      location: data.location ? sanitizeLocation(data.location) : null,
      coordinates: (data.locationLat && data.locationLng)
        ? sanitizeCoordinates(data.locationLat, data.locationLng)
        : null,
    };

    const finalText = sanitizedData.enhancedText && data.enhancementEnabled
      ? sanitizedData.enhancedText
      : sanitizedData.text;

    // Generate embedding if text is substantial
    let embedding = null;
    if (finalText.length > 100) {
      try {
        embedding = await generateEmbedding(finalText);
      } catch (err) {
        console.error('Embedding generation failed:', err);
        // Continue without embedding - not critical
      }
    }

    // Prepare attributes for DB function
    const attributes = data.attributes ? Object.entries(data.attributes).map(([key, attr]) => ({
      key,
      value: sanitizeAttributeValue(attr.value),
      customValue: attr.customValue ? sanitizeAttributeValue(attr.customValue) : null,
      confidence: Math.min(1, Math.max(0, attr.confidence)),
      isManuallyEdited: attr.isManuallyEdited || false,
    })) : [];

    // Prepare witnesses for DB function
    const witnesses = data.witnesses ? data.witnesses.map(witness => ({
      name: sanitizeText(witness.name),
      email: witness.email ? sanitizeEmail(witness.email) : null,
      userId: witness.userId || null,
    })) : [];

    // ============================================================
    // 4. CALL ATOMIC DATABASE FUNCTION
    // ============================================================
    const { data: result, error: dbError } = await supabase
      .rpc('publish_experience_atomic', {
        p_user_id: user.id,
        p_title: sanitizedData.title,
        p_story_text: finalText,
        p_category: sanitizedData.category,
        p_tags: sanitizedData.tags,
        p_date_occurred: data.dateOccurred || undefined,
        p_time_of_day: data.timeOfDay || undefined,
        p_duration: data.duration || undefined,
        p_location_text: sanitizedData.location ?? undefined,
        p_location_lat: sanitizedData.coordinates?.lat || undefined,
        p_location_lng: sanitizedData.coordinates?.lng || undefined,
        p_question_answers: data.questionAnswers || {},
        p_visibility: data.visibility,
        p_ai_enhancement_used: data.aiEnhancementUsed || false,
        p_user_edited_ai: data.userEditedAi || false,
        p_enhancement_model: data.enhancementModel || undefined,
        p_attributes: attributes,
        p_witnesses: witnesses,
        p_embedding: embedding,
        p_media_urls: data.mediaUrls || [], // NEW: Send media URLs to function
      })
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to save experience',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 5. SUCCESS RESPONSE
    // ============================================================
    const processingTime = Date.now() - startTime;

    const typedResult = result as any;

    return NextResponse.json({
      success: true,
      experienceId: typedResult.experience_id,
      xpEarned: typedResult.xp_earned,
      badgesEarned: typedResult.badges_earned || [],
      leveledUp: typedResult.leveled_up,
      newLevel: typedResult.new_level,
      processingTimeMs: processingTime,
    });

  } catch (error: any) {
    console.error('Publish endpoint error:', error);

    return NextResponse.json(
      {
        error: 'Failed to publish experience',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}