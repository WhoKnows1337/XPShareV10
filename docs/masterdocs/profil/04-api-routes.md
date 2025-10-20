# XPShare Profile - API Routes

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Database](./03-database.md) | [➡️ Weiter zu Checklist](./00-CHECKLIST.md)

---

## ✅ Implemented APIs

### `/api/users/similarity` ✅
**GET** - Get similarity between two users

**Query Params:**
- `user1` (UUID) - First user ID
- `user2` (UUID) - Second user ID

**Response:**
```typescript
{
  similarity: {
    user1_id: string
    user2_id: string
    similarity_score: number // 0-1
    shared_categories: string[]
    shared_category_count: number
    same_location: boolean
  }
}
```

**Files:** `app/api/users/similarity/route.ts`

---

### `/api/users/[id]/similar` ✅
**GET** - Get users similar to given user

**Query Params:**
- `limit` (number) - Max results (default: 20)
- `minSimilarity` (number) - Min score 0-1 (default: 0.3)

**Response:**
```typescript
{
  similar_users: Array<{
    user_id: string
    username: string
    display_name: string
    avatar_url: string
    similarity_score: number
    shared_categories: string[]
    total_xp: number
  }>
}
```

**Files:** `app/api/users/[id]/similar/route.ts`

---

### `/api/users/[id]/category-stats` ✅
**GET** - Get user's category distribution

**Response:**
```typescript
{
  stats: Array<{
    category: string
    experience_count: number
    percentage: number
    last_experience_date: string
  }>
}
```

**Files:** `app/api/users/[id]/category-stats/route.ts`

---

### `/api/users/[id]/pattern-contributions` ✅
**GET** - Get user's pattern contributions

**Response:**
```typescript
{
  contributions: Array<{
    pattern_type: string
    pattern_title: string
    pattern_description: string
    contribution_count: number
    related_experience_ids: string[]
  }>
}
```

**Files:** `app/api/users/[id]/pattern-contributions/route.ts`

---

### `/api/users/[id]/activity` ✅
**GET** - Get user's activity timeline

**Response:**
```typescript
{
  activity: Array<{
    date: string
    experience_count: number
    xp_earned: number
  }>
}
```

**Files:** `app/api/users/[id]/activity/route.ts`

---

## ⚠️ Missing / Needs Enhancement

### `/api/users/[id]/xp-twins` ❌ MISSING
**GET** - Get detailed XP Twins data for Hero Section

**Should return:**
```typescript
{
  match_percentage: number // 87
  shared_dna: {
    categories: Array<{
      name: string
      your_percentage: number
      their_percentage: number
      is_top_for_both: boolean
    }>
  }
  shared_experiences: Array<{
    id: string
    title: string
    witness_count: number
  }>
  more_twins: Array<{
    user_id: string
    username: string
    match_percentage: number
    top_categories: string[]
  }>
}
```

**Priority:** HIGH (needed for XP Twins Hero Section)

---

### `/api/connections` ✅ PARTIAL
**POST** - Create connection request (implemented)
**GET** - Get user's connections (needs enhancement)

**Missing:**
- Filter by connection type (XP Twins, Location, Patterns, Mutual)
- Pagination
- Status filtering

---

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Database](./03-database.md) | [➡️ Weiter zu Checklist](./00-CHECKLIST.md)
