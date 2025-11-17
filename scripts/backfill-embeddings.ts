#!/usr/bin/env tsx
/**
 * Backfill Embeddings Script
 * Generates embeddings for all experiences that don't have one
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 10; // Process in batches to avoid rate limits

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0].embedding;
}

async function backfillEmbeddings() {
  console.log('🔍 Finding experiences without embeddings...\n');

  // Get all experiences without embeddings
  const { data: experiences, error } = await supabase
    .from('experiences')
    .select('id, story_text, title')
    .is('embedding', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching experiences:', error);
    return;
  }

  if (!experiences || experiences.length === 0) {
    console.log('✅ All experiences already have embeddings!');
    return;
  }

  console.log(`📊 Found ${experiences.length} experiences without embeddings\n`);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < experiences.length; i += BATCH_SIZE) {
    const batch = experiences.slice(i, Math.min(i + BATCH_SIZE, experiences.length));

    console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(experiences.length / BATCH_SIZE)}`);
    console.log(`   Experiences ${i + 1}-${Math.min(i + BATCH_SIZE, experiences.length)} of ${experiences.length}`);

    for (const exp of batch) {
      try {
        // Combine title and story for embedding
        const textToEmbed = `${exp.title}\n\n${exp.story_text}`;

        console.log(`   → Generating embedding for "${exp.title.substring(0, 50)}..."`);

        // Generate embedding
        const embedding = await generateEmbedding(textToEmbed);

        // Update database
        const { error: updateError } = await supabase
          .from('experiences')
          .update({
            embedding: JSON.stringify(embedding),
            embedding_model: EMBEDDING_MODEL,
            embedding_generated_at: new Date().toISOString(),
          })
          .eq('id', exp.id);

        if (updateError) {
          console.error(`     ❌ Failed to update: ${updateError.message}`);
          failed++;
        } else {
          console.log(`     ✅ Success`);
          succeeded++;
        }
      } catch (error: any) {
        console.error(`     ❌ Error: ${error.message}`);
        failed++;
      }

      processed++;
    }

    // Rate limit delay between batches (OpenAI rate limit)
    if (i + BATCH_SIZE < experiences.length) {
      console.log(`   ⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Processed: ${processed}`);
  console.log(`✅ Succeeded:    ${succeeded}`);
  console.log(`❌ Failed:       ${failed}`);
  console.log('='.repeat(60) + '\n');

  if (succeeded > 0) {
    console.log('✨ Embeddings backfill completed successfully!\n');
  }
}

// Run the backfill
backfillEmbeddings()
  .then(() => {
    console.log('🎉 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
