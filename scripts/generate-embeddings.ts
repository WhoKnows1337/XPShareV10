/**
 * Generate embeddings for experiences that don't have them yet
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 */

// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation...\n')

  // Dynamic imports after env is loaded
  const { generateEmbedding } = await import('../lib/openai/client')
  const { createClient } = await import('@supabase/supabase-js')

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch experiences without embeddings
  const { data: experiences, error: fetchError } = await supabase
    .from('experiences')
    .select('id, title, story_text, category, tags')
    .is('embedding', null)
    .eq('visibility', 'public')
    .limit(50) // Process in batches of 50

  if (fetchError) {
    console.error('❌ Error fetching experiences:', fetchError)
    process.exit(1)
  }

  if (!experiences || experiences.length === 0) {
    console.log('✅ All experiences already have embeddings!')
    return
  }

  console.log(`📊 Found ${experiences.length} experiences without embeddings\n`)

  let successCount = 0
  let errorCount = 0

  for (const experience of experiences) {
    try {
      // Build text for embedding
      const text = [
        experience.title || '',
        experience.story_text || '',
        experience.category || '',
        ...(experience.tags || []),
      ]
        .filter(Boolean)
        .join(' ')

      if (!text.trim()) {
        console.log(`⚠️  Skipping experience ${experience.id} (no text content)`)
        continue
      }

      // Generate embedding
      console.log(`🔄 Generating embedding for experience ${experience.id}...`)
      const embedding = await generateEmbedding(text)

      // Update experience with embedding
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ embedding: JSON.stringify(embedding) })
        .eq('id', experience.id)

      if (updateError) {
        console.error(`   ❌ Error updating experience ${experience.id}:`, updateError.message)
        errorCount++
      } else {
        console.log(`   ✅ Successfully generated embedding for experience ${experience.id}`)
        successCount++
      }

      // Rate limiting: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error: any) {
      console.error(`   ❌ Error processing experience ${experience.id}:`, error.message)
      errorCount++
    }
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total processed: ${successCount + errorCount}`)
}

// Run the script
generateEmbeddings()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
