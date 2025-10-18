/**
 * Populate external_events table with moon phase data
 *
 * Generates moon phase dates for 2023-2025 using algorithmic calculations
 * from lib/utils/lunar-phase.ts
 *
 * Usage: npx tsx scripts/populate-moon-phases.ts
 */

// Load environment variables FIRST
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import {
  getMoonPhaseDatesInYear,
  calculateMoonPhase,
  type MoonPhase
} from '@/lib/utils/lunar-phase'

async function populateMoonPhases() {
  console.log('🌙 Starting moon phase population...\n')

  // Dynamic imports after env is loaded
  const { createClient } = await import('@supabase/supabase-js')

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Define years to process
  const years = [2023, 2024, 2025]

  // Define all 8 moon phases
  const phases: MoonPhase[] = [
    'new_moon',
    'waxing_crescent',
    'first_quarter',
    'waxing_gibbous',
    'full_moon',
    'waning_gibbous',
    'last_quarter',
    'waning_crescent'
  ]

  let totalInserted = 0
  let totalErrors = 0

  // Process each year
  for (const year of years) {
    console.log(`\n📅 Processing year ${year}...`)

    // Process each phase
    for (const phase of phases) {
      // Get all dates for this phase in this year
      const dates = getMoonPhaseDatesInYear(year, phase)

      console.log(`   🌑 ${phase}: ${dates.length} occurrences`)

      // Insert each date
      for (const date of dates) {
        // Get full phase data for metadata
        const phaseData = calculateMoonPhase(date)

        // Prepare event data
        const eventData = {
          event_type: phase,
          event_date: date.toISOString().split('T')[0], // YYYY-MM-DD
          event_name: phaseData.name,
          metadata: {
            emoji: phaseData.emoji,
            illumination: phaseData.illumination,
            age: phaseData.age,
            description: phaseData.description
          }
        }

        // Insert into database
        const { error } = await supabase
          .from('external_events')
          .insert(eventData)

        if (error) {
          console.error(`      ❌ Error inserting ${phase} on ${date.toISOString().split('T')[0]}:`, error.message)
          totalErrors++
        } else {
          totalInserted++
        }
      }
    }
  }

  // Summary
  console.log('\n\n📊 Population Summary:')
  console.log(`   ✅ Successfully inserted: ${totalInserted} events`)
  console.log(`   ❌ Errors: ${totalErrors}`)

  // Verify data
  console.log('\n🔍 Verifying data...')
  const { data: counts, error: countError } = await supabase
    .from('external_events')
    .select('event_type')
    .then(result => {
      if (result.error) return result

      // Count by type
      const typeCounts: Record<string, number> = {}
      result.data?.forEach((event: any) => {
        typeCounts[event.event_type] = (typeCounts[event.event_type] || 0) + 1
      })

      return { data: typeCounts, error: null }
    })

  if (!countError && counts) {
    console.log('\n📈 Events by type:')
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`)
      })
  }

  // Show sample of upcoming full moons
  console.log('\n🌕 Sample - Upcoming Full Moons in 2025:')
  const { data: fullMoons } = await supabase
    .from('external_events')
    .select('event_date, event_name, metadata')
    .eq('event_type', 'full_moon')
    .gte('event_date', '2025-01-01')
    .lte('event_date', '2025-12-31')
    .order('event_date')
    .limit(5)

  if (fullMoons) {
    fullMoons.forEach((moon: any) => {
      console.log(`   ${moon.event_date} - ${moon.event_name} ${moon.metadata.emoji}`)
    })
  }
}

// Run the script
populateMoonPhases()
  .then(() => {
    console.log('\n✨ Moon phase population complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
