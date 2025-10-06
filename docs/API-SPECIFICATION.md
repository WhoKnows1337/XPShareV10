# XP-Share API Specification

Complete REST API documentation for all endpoints with request/response schemas, authentication, and error handling.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Experiences API](#2-experiences-api)
3. [Users API](#3-users-api)
4. [AI Services API](#4-ai-services-api)
5. [Pattern Discovery API](#5-pattern-discovery-api)
6. [Notifications API](#6-notifications-api)
7. [Gamification API](#7-gamification-api)
8. [Admin API](#8-admin-api)
9. [Error Handling](#9-error-handling)

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://xp-share.app/api
```

---

## 1. Authentication

### Auth Flow

Uses **Supabase Auth** with JWT tokens.

**Client-side:**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
```

**Server-side (API Routes):**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 2. Experiences API

### POST `/api/experiences`

Create new experience (submit flow).

**Request:**
```typescript
{
  // Screen 2: Core content (required)
  story_text?: string          // Text version
  story_audio_url?: string     // Audio file URL (Supabase Storage)
  story_transcription?: string // Whisper transcription (if audio)

  // Screen 3: AI-extracted metadata
  category: string             // AI-suggested, user-confirmed
  tags: string[]               // AI-suggested tags
  emotions?: string[]          // ['Angst', 'Faszination', 'Verwirrung']

  // Screen 3: Location & Time
  location_text?: string       // "Berlin, Germany"
  location_lat?: number
  location_lng?: number
  date_occurred?: string       // ISO date "2024-01-15"
  time_of_day?: string         // 'morning' | 'afternoon' | 'evening' | 'night'

  // Screen 4: Dynamic questions (key-value pairs)
  dynamic_answers?: Record<string, any>

  // Screen 4.5: Collaborative
  is_collaborative?: boolean
  witness_usernames?: string[] // [@user1, @user2]

  // Screen 6: Privacy
  visibility: 'public' | 'community' | 'private'
  is_anonymous: boolean

  // Screen 7: Location privacy
  location_precision: 'exact' | 'city' | 'country' | 'hidden'

  // Optional
  language?: string            // Default: 'de'
  media_urls?: string[]        // Additional photos/videos
}
```

**Response (201 Created):**
```typescript
{
  id: string                   // UUID
  user_id: string
  category: string
  title: string                // AI-generated title
  story_text: string
  location_text: string
  created_at: string

  // Pattern insights (from Screen 5)
  similar_experiences_count: number
  pattern_match?: {
    wave_name: string          // "Berlin UFO Sightings June 2024"
    similar_count: number
    earliest_date: string
  }

  // Gamification
  xp_earned: number            // Base 10 XP
  badges_earned: Array<{
    id: string
    name: string
    description: string
    xp_reward: number
  }>
}
```

**Example:**
```bash
curl -X POST https://xp-share.app/api/experiences \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "story_text": "Ich habe gestern Abend ein helles, schwebendes Objekt über Berlin gesehen...",
    "category": "UFO",
    "tags": ["lights", "hovering", "silent"],
    "location_text": "Berlin, Germany",
    "location_lat": 52.5200,
    "location_lng": 13.4050,
    "date_occurred": "2024-06-15",
    "time_of_day": "evening",
    "visibility": "public",
    "is_anonymous": false,
    "location_precision": "city"
  }'
```

---

### GET `/api/experiences`

List experiences with filtering, sorting, pagination.

**Query Parameters:**
```typescript
{
  // Pagination
  page?: number              // Default: 1
  limit?: number             // Default: 20, max: 100

  // Filters
  category?: string          // 'UFO' | 'Paranormal' | 'Dream' | etc.
  tags?: string              // Comma-separated: "lights,hovering"
  user_id?: string           // Filter by author
  visibility?: string        // Default: 'public'

  // Location
  location_country?: string  // "Germany"
  location_city?: string     // "Berlin"
  near_lat?: number          // Geographic proximity
  near_lng?: number
  radius_km?: number         // Default: 50km

  // Time
  date_from?: string         // ISO date
  date_to?: string
  time_of_day?: string       // 'morning' | 'afternoon' | 'evening' | 'night'

  // Sorting
  sort_by?: 'created_at' | 'view_count' | 'upvote_count' | 'relevance'
  sort_order?: 'asc' | 'desc'

  // Search
  q?: string                 // Full-text search in title + story_text
}
```

**Response (200 OK):**
```typescript
{
  experiences: Array<{
    id: string
    user_id: string
    category: string
    title: string
    story_text: string        // Truncated to 200 chars
    location_text: string
    location_lat?: number
    location_lng?: number
    date_occurred: string
    tags: string[]
    emotions: string[]
    is_anonymous: boolean
    view_count: number
    upvote_count: number
    comment_count: number
    created_at: string

    // User (if not anonymous)
    user?: {
      id: string
      username: string
      avatar_url: string
      level: number
    }
  }>

  pagination: {
    page: number
    limit: number
    total_count: number
    total_pages: number
  }
}
```

**Example:**
```bash
curl "https://xp-share.app/api/experiences?category=UFO&location_city=Berlin&sort_by=created_at&sort_order=desc&page=1&limit=20"
```

---

### GET `/api/experiences/:id`

Get single experience with full details.

**Response (200 OK):**
```typescript
{
  id: string
  user_id: string
  category: string
  title: string
  story_text: string
  story_audio_url?: string
  story_transcription?: string
  location_text: string
  location_lat?: number      // null if location_precision = 'hidden'
  location_lng?: number
  date_occurred: string
  time_of_day: string
  tags: string[]
  emotions: string[]
  is_anonymous: boolean
  visibility: string
  language: string
  view_count: number
  upvote_count: number
  comment_count: number
  created_at: string
  updated_at: string

  // User (if not anonymous)
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url: string
    level: number
    total_experiences: number
  }

  // Dynamic answers (category-specific questions)
  dynamic_answers?: Record<string, any>

  // Media
  media_urls?: string[]

  // Collaborative
  witnesses?: Array<{
    user_id: string
    username: string
    avatar_url: string
    verification_comment?: string
    verified_at: string
  }>

  // Pattern insights
  similar_experiences?: Array<{
    id: string
    title: string
    similarity_score: number  // 0-1
    user: { username: string, avatar_url: string }
  }>

  // Research citations
  research_citations?: Array<{
    id: string
    title: string
    authors: string
    url: string
    doi?: string
    relevance_score: number
  }>

  // Cross-category insights (Aha Moment #11)
  cross_category_insights?: Array<{
    category: string
    insight: string
    related_experience_id: string
  }>
}
```

**Example:**
```bash
curl "https://xp-share.app/api/experiences/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### PATCH `/api/experiences/:id`

Update experience (only by author).

**Request:**
```typescript
{
  story_text?: string
  category?: string
  tags?: string[]
  visibility?: 'public' | 'community' | 'private'
  // ... any field from POST (except user_id, id)
}
```

**Response (200 OK):**
```typescript
{
  id: string
  updated_at: string
  message: "Experience updated successfully"
}
```

---

### DELETE `/api/experiences/:id`

Delete experience (only by author).

**Response (200 OK):**
```typescript
{
  message: "Experience deleted successfully"
}
```

---

### POST `/api/experiences/:id/upvote`

Upvote an experience.

**Response (200 OK):**
```typescript
{
  upvote_count: number       // New total
  xp_awarded_to_author: number
}
```

---

### POST `/api/experiences/:id/view`

Track view (increment view_count).

**Request:**
```typescript
{
  referrer?: string          // 'feed' | 'search' | 'profile' | 'similar'
}
```

**Response (200 OK):**
```typescript
{
  view_count: number
}
```

---

### POST `/api/experiences/:id/witness-verify`

Verify experience as witness (Aha Moment #10).

**Request:**
```typescript
{
  witness_user_id: string    // Current user
  verification_comment?: string
}
```

**Response (201 Created):**
```typescript
{
  verification_id: string
  xp_earned: number          // 20 XP
  badge_earned?: {
    name: 'verified_witness'
    description: '✅ Als Zeuge verifiziert'
    xp_reward: 20
  }
}
```

---

## 3. Users API

### GET `/api/users/:id`

Get user profile.

**Response (200 OK):**
```typescript
{
  id: string
  username: string
  display_name: string
  avatar_url: string
  bio?: string
  location_city?: string
  location_country?: string
  languages: string[]

  // Stats
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_experiences: number
  total_contributions: number

  // Badges
  badges: Array<{
    id: string
    name: string
    description: string
    icon_name: string
    rarity: string
    earned_at: string
  }>

  // Recent experiences (first 5)
  recent_experiences: Array<{
    id: string
    title: string
    category: string
    created_at: string
  }>

  created_at: string
}
```

---

### PATCH `/api/users/:id`

Update user profile (only own profile).

**Request:**
```typescript
{
  display_name?: string
  bio?: string
  avatar_url?: string        // Upload via `/api/upload` first
  location_city?: string
  location_country?: string
  languages?: string[]
}
```

**Response (200 OK):**
```typescript
{
  id: string
  updated_at: string
  message: "Profile updated successfully"
}
```

---

### GET `/api/users/:id/impact`

Get user impact dashboard (Aha Moment #3).

**Response (200 OK):**
```typescript
{
  total_views: number
  total_upvotes: number
  total_comments: number
  total_witnesses: number

  // Top experiences
  most_viewed_experience: {
    id: string
    title: string
    view_count: number
  }

  // Influence network
  inspired_users: Array<{
    user_id: string
    username: string
    avatar_url: string
    inspiration_count: number
  }>

  // Wave creator
  waves_created: Array<{
    wave_name: string
    experience_count: number
    created_at: string
  }>

  // Cross-category contributions
  categories_contributed: Array<{
    category: string
    count: number
  }>
}
```

---

### GET `/api/users/:id/similar`

Find similar users (Aha Moment #4).

**Query Parameters:**
```typescript
{
  min_similarity?: number    // Default: 0.7 (70%)
  limit?: number             // Default: 10
}
```

**Response (200 OK):**
```typescript
{
  similar_users: Array<{
    user_id: string
    username: string
    avatar_url: string
    similarity_score: number   // 0-1

    // Shared patterns
    shared_categories: string[]
    shared_locations: string[]
    shared_time_periods: Array<{ month: string, year: number }>

    // Intro message (Aha Moment #4)
    intro_message: string      // "Du und @user123 habt beide UFO-Sichtungen in Berlin im Juni 2024 geteilt"
  }>
}
```

---

## 4. AI Services API

### POST `/api/ai/analyze-text`

Analyze experience text with GPT-4o-mini (Screen 3).

**Request:**
```typescript
{
  text: string               // User's story
  language?: string          // Default: 'de'
}
```

**Response (200 OK):**
```typescript
{
  category: string           // Main category
  category_confidence: number // 0-1

  tags: string[]             // Max 10 tags
  emotions: string[]         // Detected emotions

  location_extracted?: {
    text: string             // "Berlin, Germany"
    lat?: number
    lng?: number
    confidence: number
  }

  date_extracted?: {
    date: string             // ISO date
    confidence: number
  }

  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'

  title_suggestion: string   // AI-generated title

  // Category-specific questions to ask (Screen 4)
  dynamic_questions: Array<{
    question_id: string
    question_text: string
    input_type: 'text' | 'select' | 'multiselect' | 'number' | 'date'
    options?: string[]
    required: boolean
  }>
}
```

**Example:**
```bash
curl -X POST https://xp-share.app/api/ai/analyze-text \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Gestern Abend habe ich über Berlin ein helles, schwebendes Objekt gesehen. Es war komplett lautlos und bewegte sich in Zickzack-Mustern.",
    "language": "de"
  }'
```

---

### POST `/api/ai/transcribe-audio`

Transcribe audio with Whisper.

**Request (multipart/form-data):**
```typescript
{
  audio: File                // .mp3, .wav, .m4a (max 25MB)
  language?: string          // Default: 'de'
}
```

**Response (200 OK):**
```typescript
{
  transcription: string
  language_detected: string
  duration_seconds: number

  // Auto-trigger text analysis
  analysis: {
    category: string
    tags: string[]
    // ... same as /analyze-text
  }
}
```

---

### POST `/api/ai/generate-embedding`

Generate embedding for experience (called automatically on submit).

**Request:**
```typescript
{
  text: string               // story_text + title + tags
}
```

**Response (200 OK):**
```typescript
{
  embedding: number[]        // 1536-dimensional vector
  model: "text-embedding-3-small"
}
```

---

## 5. Pattern Discovery API

### POST `/api/patterns/similar-experiences`

Find similar experiences using vector similarity (Screen 5).

**Request:**
```typescript
{
  experience_id?: string     // Find similar to this experience
  embedding?: number[]       // Or provide embedding directly
  limit?: number             // Default: 10, max: 50
  min_similarity?: number    // Default: 0.7 (70%)
}
```

**Response (200 OK):**
```typescript
{
  similar_experiences: Array<{
    id: string
    title: string
    category: string
    story_text: string       // Truncated
    similarity_score: number // 0-1
    user: {
      username: string
      avatar_url: string
    }
    date_occurred: string
    location_text: string
    tags: string[]
  }>

  // Wave detection (Aha Moment #1)
  wave_detected?: {
    wave_name: string        // "Berlin UFO Sightings June 2024"
    experience_count: number
    date_range: { start: string, end: string }
    location_cluster: string

    // Badge trigger
    wave_creator_badge_earned: boolean
  }
}
```

---

### GET `/api/patterns/time-travel`

Get experiences in time range (Aha Moment #2).

**Query Parameters:**
```typescript
{
  category?: string
  location_lat?: number
  location_lng?: number
  radius_km?: number
  date_from: string          // Required: ISO date
  date_to: string            // Required: ISO date
}
```

**Response (200 OK):**
```typescript
{
  experiences: Array<{
    id: string
    title: string
    date_occurred: string
    location_lat: number
    location_lng: number
    category: string
    tags: string[]
  }>

  // Timeline aggregation
  timeline: Array<{
    date: string             // ISO date
    count: number
  }>

  // Heatmap data
  heatmap: Array<{
    lat: number
    lng: number
    intensity: number        // 0-1
  }>
}
```

---

### GET `/api/patterns/predictions`

Pattern prediction for next occurrence (Aha Moment #5).

**Query Parameters:**
```typescript
{
  category: string
  location_lat?: number
  location_lng?: number
  radius_km?: number
}
```

**Response (200 OK):**
```typescript
{
  prediction: {
    next_likely_date: string // ISO date
    confidence: number       // 0-1
    based_on_count: number   // Historical experiences used

    // Seasonal pattern
    peak_months: number[]    // [6, 7, 8] = June, July, August
    peak_time_of_day: string

    // Moon phase correlation (if applicable)
    moon_phase_correlation?: {
      phase: string          // 'full_moon' | 'new_moon' | 'first_quarter' | 'last_quarter'
      correlation_strength: number
    }
  }
}
```

---

### GET `/api/patterns/seasonal`

Seasonal pattern analysis (Aha Moment #9).

**Query Parameters:**
```typescript
{
  category: string
  year?: number              // Default: current year
}
```

**Response (200 OK):**
```typescript
{
  seasonal_data: Array<{
    month: number            // 1-12
    count: number
    average_temperature?: number
    moon_phase_distribution?: Record<string, number>
  }>

  peak_season: {
    months: number[]
    reason?: string          // "Sommermonate zeigen 3x höhere UFO-Aktivität"
  }

  chart_data: {
    labels: string[]         // Month names
    values: number[]
  }
}
```

---

## 6. Notifications API

### GET `/api/notifications`

Get user notifications.

**Query Parameters:**
```typescript
{
  is_read?: boolean          // Filter: true/false/undefined (all)
  limit?: number             // Default: 20
  page?: number
}
```

**Response (200 OK):**
```typescript
{
  notifications: Array<{
    id: string
    type: string             // 'pattern_alert' | 'witness_verified' | 'upvote' | 'comment' | 'badge_earned'
    title: string
    message: string
    link_url?: string
    is_read: boolean
    created_at: string
  }>

  unread_count: number
}
```

---

### PATCH `/api/notifications/:id/read`

Mark notification as read.

**Response (200 OK):**
```typescript
{
  message: "Notification marked as read"
}
```

---

### POST `/api/notifications/subscribe`

Subscribe to pattern alert (Aha Moment #8).

**Request:**
```typescript
{
  pattern_category: string
  location_lat?: number
  location_lng?: number
  radius_km?: number         // Default: 50km
  min_experience_count?: number // Default: 3
}
```

**Response (201 Created):**
```typescript
{
  alert_id: string
  message: "Du erhältst eine Benachrichtigung, wenn 3+ UFO-Sichtungen in Berlin (50km) gemeldet werden"
}
```

---

## 7. Gamification API

### GET `/api/gamification/badges`

Get all available badges.

**Response (200 OK):**
```typescript
{
  badges: Array<{
    id: string
    name: string
    description: string
    icon_name: string        // Lucide icon name
    category: string         // 'milestone' | 'social' | 'trust' | 'insight' | 'diversity' | 'impact' | 'engagement' | 'fun'
    xp_reward: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'

    // Progress (if user authenticated)
    earned: boolean
    earned_at?: string
    progress?: {
      current: number
      required: number
      percentage: number
    }
  }>
}
```

---

### POST `/api/gamification/award-badge`

Award badge to user (internal, called by system).

**Request:**
```typescript
{
  user_id: string
  badge_name: string         // 'first_experience' | 'wave_creator' | etc.
}
```

**Response (201 Created):**
```typescript
{
  badge_id: string
  xp_awarded: number
  new_level?: number         // If user leveled up

  notification_sent: boolean
}
```

---

### GET `/api/gamification/leaderboard`

Get XP leaderboard.

**Query Parameters:**
```typescript
{
  time_range?: 'week' | 'month' | 'all_time' // Default: 'all_time'
  category?: string          // Filter by category contributions
  limit?: number             // Default: 100
}
```

**Response (200 OK):**
```typescript
{
  leaderboard: Array<{
    rank: number
    user_id: string
    username: string
    avatar_url: string
    total_xp: number
    level: number
    badge_count: number

    // This week's XP
    week_xp?: number
  }>

  current_user_rank?: number // If authenticated
}
```

---

## 8. Admin API

### POST `/api/admin/questions`

Create dynamic question for category (Admin Panel).

**Request:**
```typescript
{
  category: string           // 'UFO' | 'Paranormal' | etc.
  question_text: string
  input_type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'time'
  options?: string[]         // For select/multiselect
  required: boolean
  help_text?: string
  validation_rules?: {
    min?: number
    max?: number
    pattern?: string
  }
}
```

**Response (201 Created):**
```typescript
{
  question_id: string
  message: "Question added successfully"
}
```

---

### GET `/api/admin/questions/:category`

Get all questions for category.

**Response (200 OK):**
```typescript
{
  questions: Array<{
    id: string
    question_text: string
    input_type: string
    options?: string[]
    required: boolean
    created_at: string
  }>
}
```

---

### DELETE `/api/admin/questions/:id`

Delete dynamic question.

**Response (200 OK):**
```typescript
{
  message: "Question deleted successfully"
}
```

---

## 9. Error Handling

### Standard Error Response

```typescript
{
  error: string              // Error message
  code: string               // Error code
  details?: any              // Additional context
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | User not allowed to perform action |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request body/params |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_SERVICE_ERROR` | 503 | OpenAI API unavailable |
| `DATABASE_ERROR` | 500 | Supabase/Neo4j error |

### Examples

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**400 Validation Error:**
```json
{
  "error": "Invalid request body",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "category",
    "message": "Category is required"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retry_after": 60,
    "limit": "10 requests per minute"
  }
}
```

---

## 10. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/experiences` (POST) | 10 requests | 1 hour |
| `/api/ai/*` | 30 requests | 1 minute |
| `/api/experiences` (GET) | 100 requests | 1 minute |
| All other endpoints | 60 requests | 1 minute |

**Implementation:**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
})
```

---

## 11. Webhooks (Optional - Phase 2)

### POST `/api/webhooks/supabase`

Supabase database webhooks for real-time updates.

**Triggers:**
- New experience created → Trigger pattern matching
- User earns badge → Send notification
- Pattern alert triggered → Notify subscribed users

---

## Complete Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Experiences** |
| POST | `/api/experiences` | Create experience | ✅ |
| GET | `/api/experiences` | List experiences | ❌ |
| GET | `/api/experiences/:id` | Get single experience | ❌ |
| PATCH | `/api/experiences/:id` | Update experience | ✅ |
| DELETE | `/api/experiences/:id` | Delete experience | ✅ |
| POST | `/api/experiences/:id/upvote` | Upvote experience | ✅ |
| POST | `/api/experiences/:id/view` | Track view | ❌ |
| POST | `/api/experiences/:id/witness-verify` | Verify as witness | ✅ |
| **Users** |
| GET | `/api/users/:id` | Get user profile | ❌ |
| PATCH | `/api/users/:id` | Update profile | ✅ |
| GET | `/api/users/:id/impact` | Get impact dashboard | ❌ |
| GET | `/api/users/:id/similar` | Find similar users | ✅ |
| **AI Services** |
| POST | `/api/ai/analyze-text` | Analyze experience text | ✅ |
| POST | `/api/ai/transcribe-audio` | Transcribe audio | ✅ |
| POST | `/api/ai/generate-embedding` | Generate embedding | ✅ |
| **Pattern Discovery** |
| POST | `/api/patterns/similar-experiences` | Find similar experiences | ✅ |
| GET | `/api/patterns/time-travel` | Time-based patterns | ❌ |
| GET | `/api/patterns/predictions` | Pattern predictions | ❌ |
| GET | `/api/patterns/seasonal` | Seasonal analysis | ❌ |
| **Notifications** |
| GET | `/api/notifications` | Get notifications | ✅ |
| PATCH | `/api/notifications/:id/read` | Mark as read | ✅ |
| POST | `/api/notifications/subscribe` | Subscribe to pattern alert | ✅ |
| **Gamification** |
| GET | `/api/gamification/badges` | List all badges | ❌ |
| POST | `/api/gamification/award-badge` | Award badge (internal) | ✅ |
| GET | `/api/gamification/leaderboard` | Get leaderboard | ❌ |
| **Admin** |
| POST | `/api/admin/questions` | Create dynamic question | ✅ Admin |
| GET | `/api/admin/questions/:category` | Get category questions | ❌ |
| DELETE | `/api/admin/questions/:id` | Delete question | ✅ Admin |

**Total Endpoints:** 30

---

**API Specification Complete!** All endpoints documented with request/response schemas. 🚀
