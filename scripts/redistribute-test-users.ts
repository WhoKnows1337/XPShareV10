/**
 * Create 2 additional test users and redistribute 100 test experiences
 * evenly across 10 users (~10 experiences each)
 *
 * Usage: npx tsx scripts/redistribute-test-users.ts
 */

// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function redistributeTestUsers() {
  console.log('🚀 Starting test user redistribution...\n')

  // Dynamic imports after env is loaded
  const { createClient } = await import('@supabase/supabase-js')
  const { randomUUID } = await import('crypto')

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Step 1: Get all existing users
  const { data: existingUsers, error: usersError } = await supabase
    .from('user_profiles')
    .select('id, username')
    .order('created_at')

  if (usersError || !existingUsers) {
    console.error('❌ Error fetching users:', usersError)
    process.exit(1)
  }

  console.log(`📊 Found ${existingUsers.length} existing users`)

  // Step 2: Create 2 additional test user profiles
  const testUsernames = ['test_user_9', 'test_user_10']
  const newUserIds: string[] = []

  for (const username of testUsernames) {
    // Generate UUID for user
    const userId = randomUUID()

    // Create user_profile (without auth.users entry - for testing only)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username,
        display_name: username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        bio: 'Test user for pattern detection',
        avatar_url: null,
      })

    if (profileError) {
      console.error(`❌ Error creating user ${username}:`, profileError.message)
    } else {
      console.log(`✅ Created test user: ${username}`)
      newUserIds.push(userId)
    }
  }

  // Step 3: Get all user IDs (existing + new)
  const { data: allUsers, error: allUsersError } = await supabase
    .from('user_profiles')
    .select('id, username')
    .order('created_at')

  if (allUsersError || !allUsers) {
    console.error('❌ Error fetching all users:', allUsersError)
    process.exit(1)
  }

  console.log(`\n📊 Total users: ${allUsers.length}`)
  console.log('User list:')
  allUsers.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.username} (${user.id})`)
  })

  // Step 4: Get all test experiences
  const { data: testExperiences, error: expError } = await supabase
    .from('experiences')
    .select('id, title, category')
    .eq('is_test_data', true)
    .order('created_at')

  if (expError || !testExperiences) {
    console.error('❌ Error fetching test experiences:', expError)
    process.exit(1)
  }

  console.log(`\n📊 Found ${testExperiences.length} test experiences`)

  // Step 5: Redistribute experiences evenly
  console.log('\n🔄 Redistributing experiences across users...\n')

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < testExperiences.length; i++) {
    const experience = testExperiences[i]
    const userIndex = i % allUsers.length // Round-robin distribution
    const assignedUser = allUsers[userIndex]

    const { error: updateError } = await supabase
      .from('experiences')
      .update({ user_id: assignedUser.id })
      .eq('id', experience.id)

    if (updateError) {
      console.error(`   ❌ Error updating experience ${experience.id}:`, updateError.message)
      errorCount++
    } else {
      console.log(`   ✅ [${i + 1}/${testExperiences.length}] Assigned to ${assignedUser.username}: ${experience.title}`)
      successCount++
    }
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)

  // Step 6: Verify distribution
  console.log('\n🔍 Verifying distribution...')
  const { data: distribution, error: distError } = await supabase
    .from('experiences')
    .select('user_id, user_profiles(username)')
    .eq('is_test_data', true)

  if (!distError && distribution) {
    const userCounts: Record<string, number> = {}
    distribution.forEach((exp: any) => {
      const username = exp.user_profiles?.username || 'unknown'
      userCounts[username] = (userCounts[username] || 0) + 1
    })

    console.log('\n📊 Experiences per user:')
    Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([username, count]) => {
        console.log(`   ${username}: ${count} experiences`)
      })
  }
}

// Run the script
redistributeTestUsers()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
