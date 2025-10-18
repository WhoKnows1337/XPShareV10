/**
 * Generate 100 realistic test experiences for pattern detection testing
 *
 * Distribution:
 * - UFO/UAP: 30
 * - Dreams: 25
 * - Paranormal: 15
 * - Psychedelics: 10
 * - Synchronicity: 8
 * - NDE/OBE: 7
 * - Ghosts: 5
 *
 * Features:
 * - Category-specific question_answers based on schema
 * - Geographic coverage: 50-80%
 * - Temporal coverage: 70-90%
 * - Realistic stories
 * - OpenAI embeddings
 * - Marked with is_test_data = true
 *
 * Usage: npx tsx scripts/generate-test-experiences.ts
 */

// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

interface ExperienceTemplate {
  category: string
  title: string
  story_text: string
  question_answers: Record<string, any>
  tags: string[]
  emotions: string[]
  location_text?: string
  location_lat?: number
  location_lng?: number
  date_occurred?: string
  time_of_day?: string
}

// ==================== UFO/UAP TEMPLATES (30) ====================
const ufoTemplates: ExperienceTemplate[] = [
  {
    category: 'ufo-uap',
    title: 'Triangle Craft Hovering Over Lake',
    story_text: 'Late evening walk with my dog near the lake when I noticed a bright triangular object hovering silently above the treeline. It had pulsing orange lights at each corner and moved in a jerky, non-linear pattern before shooting off at incredible speed. My dog was acting strangely, whining and pulling me back home. The whole sighting lasted maybe 2-3 minutes. No sound whatsoever.',
    question_answers: { shape: 'triangle', movement: 'hovering', light_color: 'orange', size: 'large' },
    tags: ['ufo', 'triangle', 'silent', 'orange-lights', 'fast-departure'],
    emotions: ['awe', 'fear', 'curiosity'],
    location_text: 'Lake District, UK',
    location_lat: 54.4609,
    location_lng: -3.0886,
    date_occurred: '2024-08-15',
    time_of_day: 'evening'
  },
  {
    category: 'ufo-uap',
    title: 'Disc-Shaped Object With Rotating Lights',
    story_text: 'Driving home from work around 10 PM when I saw a classic disc-shaped craft with multicolored lights rotating around the edge. It was hovering over a field, completely silent. I pulled over and watched for about 5 minutes before it suddenly accelerated vertically and disappeared. My car radio was filled with static the entire time.',
    question_answers: { shape: 'disc', movement: 'hovering', light_color: 'multicolor', size: 'medium' },
    tags: ['ufo', 'disc', 'rotating-lights', 'vertical-ascent', 'em-effects'],
    emotions: ['amazement', 'confusion'],
    location_text: 'Nevada, USA',
    location_lat: 39.8494,
    location_lng: -117.0920,
    date_occurred: '2024-05-22',
    time_of_day: 'night'
  },
  {
    category: 'ufo-uap',
    title: 'Glowing Orb Following Aircraft',
    story_text: 'On a red-eye flight to Tokyo, I looked out the window and saw a bright white orb keeping pace with our plane. It stayed in formation for at least 10 minutes, then made an impossible 90-degree turn and shot away. Several other passengers saw it too. The flight attendants refused to comment.',
    question_answers: { shape: 'orb', movement: 'smooth', light_color: 'white', size: 'small' },
    tags: ['ufo', 'orb', 'aerial-encounter', 'multiple-witnesses'],
    emotions: ['excitement', 'disbelief'],
    date_occurred: '2024-03-10',
    time_of_day: 'night'
  },
  {
    category: 'ufo-uap',
    title: 'Cigar-Shaped Craft Over Desert',
    story_text: 'Camping in the Arizona desert with friends when we all saw a massive cigar-shaped object silently gliding across the sky. It had no wings, no visible propulsion, just a dark metallic surface reflecting moonlight. We estimated it was the size of a football field. It moved slowly and deliberately before vanishing behind a mountain.',
    question_answers: { shape: 'cigar', movement: 'smooth', light_color: 'white', size: 'huge' },
    tags: ['ufo', 'cigar', 'massive', 'silent', 'metallic'],
    emotions: ['awe', 'wonder'],
    location_text: 'Arizona Desert, USA',
    location_lat: 34.0489,
    location_lng: -111.0937,
    date_occurred: '2023-11-05',
    time_of_day: 'night'
  },
  {
    category: 'ufo-uap',
    title: 'Zigzagging Red Light',
    story_text: 'Standing on my balcony smoking when I noticed a red light in the sky moving erratically. It would stop, hover, then zip to a new position in zigzag patterns. No aircraft moves like that. After about 2 minutes it shot straight up and was gone. I felt a strange tingling sensation the entire time.',
    question_answers: { shape: 'orb', movement: 'zigzag', light_color: 'red', size: 'tiny' },
    tags: ['ufo', 'erratic-movement', 'red-light', 'physical-sensation'],
    emotions: ['confusion', 'excitement'],
    location_text: 'São Paulo, Brazil',
    location_lat: -23.5505,
    location_lng: -46.6333,
    date_occurred: '2024-07-01',
    time_of_day: 'night'
  },
  // Add 25 more UFO templates with variations...
  {
    category: 'ufo-uap',
    title: 'Fleet of Spheres in Formation',
    story_text: 'Early morning run when I saw 5-6 metallic spheres flying in perfect triangular formation. They moved in complete synchronization, making impossible turns. No sound. They hovered for a moment, then split off in different directions at incredible speeds.',
    question_answers: { shape: 'sphere', movement: 'erratic', light_color: 'white', size: 'small' },
    tags: ['ufo', 'multiple-objects', 'formation', 'synchroni zed'],
    emotions: ['amazement', 'excitement'],
    location_text: 'Tokyo, Japan',
    location_lat: 35.6762,
    location_lng: 139.6503,
    date_occurred: '2024-02-14',
    time_of_day: 'morning'
  },
]

// Generate remaining UFO variations programmatically
for (let i = 6; i < 30; i++) {
  const shapes = ['disc', 'triangle', 'orb', 'cigar', 'cylinder', 'sphere']
  const movements = ['hovering', 'fast', 'erratic', 'smooth', 'zigzag', 'ascending']
  const colors = ['red', 'blue', 'white', 'green', 'orange', 'yellow', 'multicolor']
  const sizes = ['tiny', 'small', 'medium', 'large', 'huge']

  const shape = shapes[i % shapes.length]
  const movement = movements[i % movements.length]
  const color = colors[i % colors.length]
  const size = sizes[i % sizes.length]

  ufoTemplates.push({
    category: 'ufo-uap',
    title: `${shape.charAt(0).toUpperCase() + shape.slice(1)} Craft Sighting #${i + 1}`,
    story_text: `Witnessed a ${size} ${shape}-shaped object with ${color} lights moving in a ${movement} pattern. The sighting lasted several minutes and left a lasting impression. The object defied conventional physics and made no sound.`,
    question_answers: { shape, movement, light_color: color, size },
    tags: ['ufo', shape, color, movement],
    emotions: ['awe', 'curiosity'],
    location_text: i % 3 === 0 ? 'London, UK' : i % 3 === 1 ? 'Berlin, Germany' : undefined,
    location_lat: i % 3 === 0 ? 51.5074 : i % 3 === 1 ? 52.5200 : undefined,
    location_lng: i % 3 === 0 ? -0.1278 : i % 3 === 1 ? 13.4050 : undefined,
    date_occurred: i % 4 === 0 ? `2024-${String((i % 12) + 1).padStart(2, '0')}-15` : undefined,
    time_of_day: i % 2 === 0 ? 'night' : 'evening'
  })
}

// ==================== DREAM TEMPLATES (25) ====================
const dreamTemplates: ExperienceTemplate[] = [
  {
    category: 'dreams',
    title: 'Lucid Flight Through Childhood Home',
    story_text: 'I became lucid during a recurring dream about my childhood home. The colors were incredibly vivid - more saturated than real life. I had full control and decided to fly through the ceiling. The experience felt more real than waking reality. When I woke up, I could remember every detail perfectly, which is unusual for my dreams.',
    question_answers: { dream_type: 'lucid', vividness: 'hyper_real', lucidity: 'full_control', visual_quality: 'enhanced_colors' },
    tags: ['lucid-dream', 'flying', 'vivid', 'childhood'],
    emotions: ['joy', 'freedom', 'wonder'],
    location_text: 'Melbourne, Australia',
    location_lat: -37.8136,
    location_lng: 144.9631,
    date_occurred: '2024-09-20',
    time_of_day: 'night'
  },
  {
    category: 'dreams',
    title: 'Recurring Nightmare About Dark Figure',
    story_text: 'For the third time this month, I had the same nightmare about a shadow figure standing at the foot of my bed. The dream is always hyper-realistic with enhanced colors and sounds. I try to scream but cannot. Eventually I wake up in sleep paralysis. The fear lingers for hours.',
    question_answers: { dream_type: 'recurring', vividness: 'hyper_real', lucidity: 'not_lucid', visual_quality: 'enhanced_colors' },
    tags: ['nightmare', 'recurring', 'shadow-figure', 'sleep-paralysis'],
    emotions: ['fear', 'dread', 'helplessness'],
    location_text: 'Portland, USA',
    location_lat: 45.5152,
    location_lng: -122.6784,
    date_occurred: '2024-08-30',
    time_of_day: 'night'
  },
  {
    category: 'dreams',
    title: 'Prophetic Dream Came True',
    story_text: 'Dreamed about a specific conversation with a coworker I rarely speak to. In the dream, she told me about her pregnancy. Three days later, she announced her pregnancy using the exact words from my dream. The dream was incredibly vivid and I wrote it down immediately after waking. This has happened to me before.',
    question_answers: { dream_type: 'prophetic', vividness: 'vivid', lucidity: 'semi_lucid', visual_quality: 'normal' },
    tags: ['prophetic', 'precognition', 'vivid', 'came-true'],
    emotions: ['shock', 'wonder', 'confusion'],
    date_occurred: '2024-06-12',
    time_of_day: 'night'
  },
]

// Generate remaining dream variations
for (let i = 3; i < 25; i++) {
  const dreamTypes = ['lucid', 'nightmare', 'recurring', 'prophetic', 'normal', 'vivid']
  const vividnesses = ['faint', 'normal', 'vivid', 'hyper_real']
  const lucidities = ['not_lucid', 'semi_lucid', 'fully_lucid', 'full_control']
  const visuals = ['enhanced_colors', 'black_white', 'normal', 'surreal']

  const dreamType = dreamTypes[i % dreamTypes.length]
  const vividness = vividnesses[i % vividnesses.length]
  const lucidity = lucidities[i % lucidities.length]
  const visual = visuals[i % visuals.length]

  dreamTemplates.push({
    category: 'dreams',
    title: `${dreamType.charAt(0).toUpperCase() + dreamType.slice(1)} Dream Experience #${i + 1}`,
    story_text: `Had a ${vividness} ${dreamType} dream with ${visual.replace('_', ' ')} and ${lucidity.replace('_', ' ')} awareness. The dream left a strong impression and felt significant. I've been thinking about it all day and trying to interpret its meaning.`,
    question_answers: { dream_type: dreamType, vividness, lucidity, visual_quality: visual },
    tags: ['dream', dreamType, vividness],
    emotions: ['curiosity', 'wonder'],
    location_text: i % 2 === 0 ? 'San Francisco, USA' : undefined,
    location_lat: i % 2 === 0 ? 37.7749 : undefined,
    location_lng: i % 2 === 0 ? -122.4194 : undefined,
    date_occurred: i % 3 === 0 ? `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : undefined,
    time_of_day: 'night'
  })
}

// ==================== PARANORMAL TEMPLATES (15) ====================
const paranormalTemplates: ExperienceTemplate[] = []
for (let i = 0; i < 15; i++) {
  paranormalTemplates.push({
    category: 'paranormal-anomalies',
    title: `Unexplained Occurrence #${i + 1}`,
    story_text: `Experienced strange unexplained phenomena in my home. Objects moved on their own, heard footsteps when alone, felt cold spots, and sensed a presence. The activity has been ongoing for weeks and multiple family members have witnessed it.`,
    question_answers: {},
    tags: ['paranormal', 'haunting', 'unexplained'],
    emotions: ['fear', 'curiosity'],
    location_text: i % 3 === 0 ? 'Edinburgh, Scotland' : i % 3 === 1 ? 'Salem, USA' : undefined,
    location_lat: i % 3 === 0 ? 55.9533 : i % 3 === 1 ? 42.5195 : undefined,
    location_lng: i % 3 === 0 ? -3.1883 : i % 3 === 1 ? -70.8967 : undefined,
    date_occurred: i % 2 === 0 ? `2024-${String((i % 12) + 1).padStart(2, '0')}-10` : undefined,
    time_of_day: i % 2 === 0 ? 'night' : 'evening'
  })
}

// ==================== PSYCHEDELIC TEMPLATES (10) ====================
const psychedelicTemplates: ExperienceTemplate[] = [
  {
    category: 'psychedelics',
    title: 'DMT Breakthrough With Entity Contact',
    story_text: 'Smoked DMT in a safe setting with a sitter. Within seconds, reality dissolved into fractal patterns. I met beings made of light who communicated telepathically. They showed me the interconnectedness of all things. The entire experience lasted 15 minutes but felt like hours. I came back with profound insights about consciousness.',
    question_answers: { substance: 'dmt', breakthrough: true, dosage_level: 'high' },
    tags: ['dmt', 'breakthrough', 'entity-contact', 'fractals', 'telepathy'],
    emotions: ['awe', 'love', 'transcendence'],
    location_text: 'Amsterdam, Netherlands',
    location_lat: 52.3676,
    location_lng: 4.9041,
    date_occurred: '2024-04-20',
    time_of_day: 'evening'
  },
  {
    category: 'psychedelics',
    title: 'Ayahuasca Ceremony - Life Review',
    story_text: 'Participated in traditional ayahuasca ceremony with experienced shaman. After drinking the brew, I experienced intense purging followed by visions of my entire life. Saw all my actions from others\' perspectives. Felt deep healing and forgiveness. The ceremony lasted all night. Woke up feeling reborn.',
    question_answers: { substance: 'ayahuasca', breakthrough: true, dosage_level: 'medium' },
    tags: ['ayahuasca', 'ceremony', 'shaman', 'healing', 'life-review'],
    emotions: ['healing', 'forgiveness', 'gratitude'],
    location_text: 'Iquitos, Peru',
    location_lat: -3.7437,
    location_lng: -73.2516,
    date_occurred: '2023-12-15',
    time_of_day: 'night'
  },
]

// Generate remaining psychedelic variations
for (let i = 2; i < 10; i++) {
  const substances = ['psilocybin', 'lsd', 'ayahuasca', 'dmt']
  const dosages = ['low', 'medium', 'high', 'heroic']
  const substance = substances[i % substances.length]
  const dosage = dosages[i % dosages.length]

  psychedelicTemplates.push({
    category: 'psychedelics',
    title: `${substance.toUpperCase()} Experience #${i + 1}`,
    story_text: `Had a ${dosage}-dose ${substance} journey. Experienced ego dissolution, profound insights, and connection to universal consciousness. The experience was challenging but ultimately healing and transformative.`,
    question_answers: { substance, breakthrough: i % 2 === 0, dosage_level: dosage },
    tags: ['psychedelic', substance, dosage, 'consciousness'],
    emotions: ['awe', 'healing'],
    location_text: i % 2 === 0 ? 'Oakland, USA' : undefined,
    location_lat: i % 2 === 0 ? 37.8044 : undefined,
    location_lng: i % 2 === 0 ? -122.2712 : undefined,
    date_occurred: `2024-${String((i % 12) + 1).padStart(2, '0')}-05`,
    time_of_day: 'evening'
  })
}

// ==================== SYNCHRONICITY TEMPLATES (8) ====================
const synchronicityTemplates: ExperienceTemplate[] = []
for (let i = 0; i < 8; i++) {
  const syncTypes = ['number', 'name', 'event', 'thought', 'person', 'object', 'multiple']
  const syncType = syncTypes[i % syncTypes.length]

  synchronicityTemplates.push({
    category: 'synchronicity',
    title: `Meaningful ${syncType.charAt(0).toUpperCase() + syncType.slice(1)} Synchronicity`,
    story_text: `Experienced an incredible synchronicity involving ${syncType}. I had been thinking about a specific topic when multiple unrelated events aligned perfectly. The timing was too precise to be coincidence. It felt like the universe was sending a message.`,
    question_answers: { sync_type: syncType },
    tags: ['synchronicity', syncType, 'meaningful-coincidence', 'signs'],
    emotions: ['wonder', 'validation'],
    location_text: i % 2 === 0 ? 'Paris, France' : undefined,
    location_lat: i % 2 === 0 ? 48.8566 : undefined,
    location_lng: i % 2 === 0 ? 2.3522 : undefined,
    date_occurred: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    time_of_day: i % 2 === 0 ? 'afternoon' : 'morning'
  })
}

// ==================== NDE/OBE TEMPLATES (7) ====================
const ndeTemplates: ExperienceTemplate[] = [
  {
    category: 'nde-obe',
    title: 'Cardiac Arrest NDE - Tunnel and Light',
    story_text: 'During cardiac arrest, I left my body and floated above the operating room. Saw doctors working on me. Then moved through a tunnel toward brilliant white light. Met deceased relatives who told me it wasn\'t my time. Came back with complete recall of the resuscitation procedure which doctors confirmed.',
    question_answers: { nde_type: 'cardiac_arrest', saw_tunnel: true, life_review: false, met_deceased: true, saw_light: true },
    tags: ['nde', 'cardiac-arrest', 'tunnel', 'deceased-relatives', 'veridical'],
    emotions: ['peace', 'love', 'awe'],
    location_text: 'Boston, USA',
    location_lat: 42.3601,
    location_lng: -71.0589,
    date_occurred: '2023-03-22',
    time_of_day: 'morning'
  },
]

// Generate remaining NDE variations
for (let i = 1; i < 7; i++) {
  const ndeTypes = ['clinical_death', 'obe_only', 'shared_death', 'near_drowning', 'accident']
  const ndeType = ndeTypes[i % ndeTypes.length]

  ndeTemplates.push({
    category: 'nde-obe',
    title: `${ndeType.replace('_', ' ').toUpperCase()} Experience`,
    story_text: `Had a profound near-death experience during ${ndeType.replace('_', ' ')}. Left my body and experienced transcendent reality. Felt unconditional love and connection to everything. The experience permanently changed my perspective on life and death.`,
    question_answers: {
      nde_type: ndeType,
      saw_tunnel: i % 2 === 0,
      life_review: i % 3 === 0,
      met_deceased: i % 2 === 1,
      saw_light: i % 3 === 1
    },
    tags: ['nde', 'near-death', ndeType, 'life-changing'],
    emotions: ['peace', 'love'],
    location_text: i % 2 === 0 ? 'Seattle, USA' : undefined,
    location_lat: i % 2 === 0 ? 47.6062 : undefined,
    location_lng: i % 2 === 0 ? -122.3321 : undefined,
    date_occurred: `202${i % 2 + 3}-${String((i % 12) + 1).padStart(2, '0')}-10`,
    time_of_day: 'afternoon'
  })
}

// ==================== GHOST TEMPLATES (5) ====================
const ghostTemplates: ExperienceTemplate[] = []
for (let i = 0; i < 5; i++) {
  ghostTemplates.push({
    category: 'ghosts-spirits',
    title: `Encounter with Deceased Relative #${i + 1}`,
    story_text: `Saw and felt the presence of a deceased loved one. They appeared translucent but clearly recognizable. Communicated a brief message of love and reassurance. The encounter brought comfort and closure. Multiple family members have had similar experiences in the same location.`,
    question_answers: {},
    tags: ['ghost', 'apparition', 'deceased-relative', 'message'],
    emotions: ['comfort', 'sadness', 'love'],
    location_text: i % 2 === 0 ? 'New Orleans, USA' : undefined,
    location_lat: i % 2 === 0 ? 29.9511 : undefined,
    location_lng: i % 2 === 0 ? -90.0715 : undefined,
    date_occurred: i % 2 === 0 ? `2024-${String((i % 12) + 1).padStart(2, '0')}-01` : undefined,
    time_of_day: 'night'
  })
}

// ==================== MAIN FUNCTION ====================
async function generateTestExperiences() {
  console.log('🚀 Starting test experience generation...\n')

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

  // Get a test user ID (use first user or create one)
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1)

  if (!users || users.length === 0) {
    console.error('❌ No users found. Please create a user first.')
    process.exit(1)
  }

  const testUserId = users[0].id
  console.log(`📝 Using user ID: ${testUserId}\n`)

  // Combine all templates
  const allTemplates = [
    ...ufoTemplates,
    ...dreamTemplates,
    ...paranormalTemplates,
    ...psychedelicTemplates,
    ...synchronicityTemplates,
    ...ndeTemplates,
    ...ghostTemplates,
  ]

  console.log(`📊 Generating ${allTemplates.length} test experiences:\n`)
  console.log(`   🛸 UFO/UAP: ${ufoTemplates.length}`)
  console.log(`   💭 Dreams: ${dreamTemplates.length}`)
  console.log(`   👻 Paranormal: ${paranormalTemplates.length}`)
  console.log(`   🍄 Psychedelics: ${psychedelicTemplates.length}`)
  console.log(`   ✨ Synchronicity: ${synchronicityTemplates.length}`)
  console.log(`   💫 NDE/OBE: ${ndeTemplates.length}`)
  console.log(`   👤 Ghosts: ${ghostTemplates.length}\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < allTemplates.length; i++) {
    const template = allTemplates[i]

    try {
      console.log(`🔄 [${i + 1}/${allTemplates.length}] Generating: ${template.title}`)

      // Build text for embedding
      const embeddingText = [
        template.title,
        template.story_text,
        template.category,
        ...template.tags,
      ].join(' ')

      // Generate embedding
      const embedding = await generateEmbedding(embeddingText)

      // Prepare experience data
      const experienceData = {
        user_id: testUserId,
        category: template.category,
        title: template.title,
        story_text: template.story_text,
        question_answers: template.question_answers,
        tags: template.tags,
        emotions: template.emotions,
        location_text: template.location_text || null,
        location_lat: template.location_lat || null,
        location_lng: template.location_lng || null,
        date_occurred: template.date_occurred || null,
        time_of_day: template.time_of_day || null,
        embedding: JSON.stringify(embedding),
        visibility: 'public',
        language: 'en',
        is_test_data: true,
        is_anonymous: false,
      }

      // Insert experience
      const { error: insertError } = await supabase
        .from('experiences')
        .insert(experienceData)

      if (insertError) {
        console.error(`   ❌ Error inserting experience:`, insertError.message)
        errorCount++
      } else {
        console.log(`   ✅ Successfully created`)
        successCount++
      }

      // Rate limiting: wait 200ms between requests
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error: any) {
      console.error(`   ❌ Error processing experience:`, error.message)
      errorCount++
    }
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📊 Total processed: ${successCount + errorCount}`)

  // Verify the data
  console.log('\n🔍 Verifying test data...')
  const { data: testExperiences, error: verifyError } = await supabase
    .from('experiences')
    .select('category')
    .eq('is_test_data', true)

  if (!verifyError && testExperiences) {
    const categoryCount: Record<string, number> = {}
    testExperiences.forEach((exp) => {
      categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1
    })

    console.log('\n📊 Category Distribution:')
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`)
    })
  }

  console.log('\n💡 To remove test data later, run:')
  console.log('   DELETE FROM experiences WHERE is_test_data = true;')
}

// Run the script
generateTestExperiences()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
