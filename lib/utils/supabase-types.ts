/**
 * Supabase Type Helpers
 *
 * TEMPORARY: These utilities exist because database.types.ts returns `never` for all queries.
 * TODO: Regenerate database.types.ts with: npx supabase gen types typescript --project-id gtuxnucmbocjtnaiflds
 *
 * Once fixed, these helpers can be removed and TypeScript will infer types automatically.
 */

/**
 * Type-safe assertion for Supabase query results.
 * Use when database.types.ts returns `never` instead of proper types.
 *
 * @example
 * const { data } = await supabase.from('user_profiles').select('*')
 * const profile = assertType<UserProfile>(data)
 */
export function assertType<T>(value: unknown): T | null {
  return value as T | null
}

/**
 * Common Supabase table types (frequently used)
 * Add more as needed - these are just the most common ones
 */

export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  location_city: string | null
  location_country: string | null
  total_xp: number | null
  level: number | null
  current_streak: number | null
  longest_streak: number | null
  total_contributions: number | null
  created_at: string | null
  updated_at: string | null
}

export interface Experience {
  id: string
  user_id: string
  title: string
  story_text: string | null
  category: string
  date_occurred: string | null
  created_at: string | null
  updated_at: string | null
  location_text: string | null
  location_lat: number | null
  location_lng: number | null
  time_of_day: string | null
  tags: string[] | null
  view_count: number | null
  upvote_count: number | null
  comment_count: number | null
  visibility: string | null
}

export interface ExperienceWithProfile extends Experience {
  user_profiles: {
    id?: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}
