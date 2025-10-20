# XPShare AI - API Reference

**Version:** 1.0
**Related:** 08_CODE_EXAMPLES.md

---

## 🎯 API Endpoints

### POST /api/discover

**Purpose:** Main conversational AI endpoint

**Request:**
```typescript
{
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    parts?: Array<{
      type: 'text' | 'tool-*'
      text?: string
      result?: any
    }>
  }>
}
```

**Response:** Server-Sent Events (SSE) stream
```
0:"textpart"
0:"More text"
2:[{"toolCallId":"1","toolName":"advanced_search","args":{...}}]
...
```

**Example:**
```typescript
const response = await fetch('/api/discover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { id: '1', role: 'user', content: 'Show me UFO sightings in Berlin' }
    ]
  })
})
```

---

## 🔧 SQL Functions Reference

### search_by_attributes

```sql
SELECT * FROM search_by_attributes(
  p_category TEXT,              -- 'dreams', 'ufo', etc.
  p_attribute_filters JSONB,    -- [{"key": "...", "value": "...", "operator": "equals"}]
  p_logic TEXT DEFAULT 'AND',   -- 'AND' | 'OR'
  p_min_confidence DECIMAL DEFAULT 0,
  p_limit INT DEFAULT 50
)
```

**Returns:**
```sql
TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category_slug TEXT,
  location_text TEXT,
  date_occurred DATE,
  matched_attributes JSONB
)
```

**Example:**
```sql
SELECT * FROM search_by_attributes(
  'dreams',
  '[{"key": "dream_symbol", "value": "bird", "operator": "contains"}]'::jsonb,
  'AND',
  0.7,
  10
);
```

---

### geo_search

```sql
SELECT * FROM geo_search(
  p_center_lat DECIMAL,
  p_center_lng DECIMAL,
  p_radius_km DECIMAL,
  p_bounding_box JSONB DEFAULT NULL,
  p_categories TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT 100
)
```

**Returns:**
```sql
TABLE (
  id UUID,
  title TEXT,
  category_slug TEXT,
  location_text TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
)
```

**Example:**
```sql
-- Radius search
SELECT * FROM geo_search(
  52.5200,  -- Berlin latitude
  13.4050,  -- Berlin longitude
  50,       -- 50km radius
  NULL,
  ARRAY['ufo', 'nde'],
  20
);

-- Bounding box search
SELECT * FROM geo_search(
  NULL, NULL, NULL,
  '{"north": 53, "south": 52, "east": 14, "west": 13}'::jsonb,
  NULL,
  100
);
```

---

### aggregate_users_by_category

```sql
SELECT * FROM aggregate_users_by_category(
  p_category TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_limit INT DEFAULT 10
)
```

**Returns:**
```sql
TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  location_city TEXT,
  experience_count BIGINT,
  total_xp INT,
  categories_contributed INT,
  first_experience DATE,
  last_experience DATE
)
```

**Example:**
```sql
-- Top 10 users in Dreams category from Berlin
SELECT * FROM aggregate_users_by_category(
  'dreams',
  'Berlin',
  '2024-01-01'::DATE,
  '2024-12-31'::DATE,
  10
);
```

---

### find_related_experiences

```sql
SELECT * FROM find_related_experiences(
  p_experience_id UUID,
  p_use_semantic BOOLEAN DEFAULT true,
  p_use_geographic BOOLEAN DEFAULT true,
  p_use_temporal BOOLEAN DEFAULT true,
  p_use_attributes BOOLEAN DEFAULT true,
  p_max_results INT DEFAULT 10,
  p_min_score DECIMAL DEFAULT 0.5
)
```

**Returns:**
```sql
TABLE (
  id UUID,
  title TEXT,
  category_slug TEXT,
  similarity_score DECIMAL,
  semantic_score DECIMAL,
  geographic_score DECIMAL,
  temporal_score DECIMAL,
  attribute_score DECIMAL
)
```

**Example:**
```sql
SELECT * FROM find_related_experiences(
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  true,   -- use semantic
  true,   -- use geographic
  true,   -- use temporal
  true,   -- use attributes
  10,     -- max results
  0.5     -- min score
);
```

---

## 📊 Tool Schemas

### advanced_search

```typescript
{
  categories?: string[]
  location?: {
    city?: string
    country?: string
    radius?: number
    lat?: number
    lng?: number
  }
  timeRange?: {
    from: string  // "HH:MM"
    to: string
  }
  dateRange?: {
    from: string  // ISO date
    to: string
  }
  attributes?: Array<{
    key: string
    value: any
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
  }>
  tags?: string[]
  emotions?: string[]
  minConfidence?: number  // 0-1
  limit?: number          // default 50
  offset?: number         // default 0
}
```

**Returns:**
```typescript
{
  results: Array<{
    id: string
    title: string
    description: string
    category: string
    location: string
    date: string
    time: string
    tags: string[]
    emotions: string[]
    attributes: Array<{
      attribute_key: string
      attribute_value: any
      confidence: number
    }>
  }>
  count: number
  hasMore: boolean
}
```

---

### rank_users

```typescript
{
  metric: 'experience_count' | 'category_count' | 'total_xp' | 'contribution_score'
  filters?: {
    category?: string
    location?: string
    dateRange?: {
      from: string
      to: string
    }
  }
  topN?: number  // default 10
}
```

**Returns:**
```typescript
{
  users: Array<{
    id: string
    username: string
    avatar_url: string
    location_city: string
    experience_count?: number
    total_xp?: number
    categories_contributed?: number
  }>
  count: number
  metric: string
  filters?: object
}
```

---

### temporal_analysis

```typescript
{
  categories?: string[]
  granularity: 'hour' | 'day' | 'week' | 'month' | 'year'
  dateRange?: {
    from: string
    to: string
  }
  groupBy?: 'category' | 'location' | 'none'  // default 'none'
}
```

**Returns:**
```typescript
{
  data: Array<{
    time: string
    group?: string  // if groupBy !== 'none'
    count: number
  }>
  granularity: string
  groupBy: string
  totalPoints: number
}
```

---

### find_connections

```typescript
{
  experienceId: string  // UUID
  dimensions: Array<'semantic' | 'geographic' | 'temporal' | 'attributes' | 'tags'>
  weights?: {
    semantic?: number   // 0-1, default 0.4
    geographic?: number // 0-1, default 0.2
    temporal?: number   // 0-1, default 0.2
    attributes?: number // 0-1, default 0.1
    tags?: number       // 0-1, default 0.1
  }
  maxResults?: number           // default 10
  minSimilarity?: number        // default 0.5
}
```

**Returns:**
```typescript
{
  connections: Array<{
    experience: {
      id: string
      title: string
      description: string
      category: string
      location: string
      date: string
    }
    similarity: number
    breakdown: {
      semantic?: number
      geographic?: number
      temporal?: number
      attributes?: number
      tags?: number
    }
  }>
  count: number
  source: {
    id: string
    title: string
  }
  dimensions: string[]
}
```

---

## 📈 Rate Limits

**Anonymous Users:**
- 10 requests/minute
- 100 requests/hour

**Authenticated Users:**
- 60 requests/minute
- 1000 requests/hour

**Premium Users:**
- 120 requests/minute
- Unlimited

---

## 🔒 Authentication

All endpoints support optional authentication via Supabase:

```typescript
const supabase = createClient(url, anonKey)

const { data: { session } } = await supabase.auth.getSession()

fetch('/api/discover', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

---

## 🐛 Error Responses

```typescript
{
  error: string
  code: string
  details?: any
}
```

**Common Errors:**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 💬 UX Enhancement Endpoints

### POST /api/memory

**Purpose:** Set or update user memory (preferences, context)

**Request:**
```typescript
{
  scope: 'profile' | 'session'
  key: string
  value: any
  source?: 'user_stated' | 'inferred' | 'system'
}
```

**Response:**
```typescript
{
  id: string
  user_id: string
  scope: string
  key: string
  value: any
  created_at: string
  updated_at: string
}
```

**Example:**
```typescript
await fetch('/api/memory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    scope: 'profile',
    key: 'preferred_categories',
    value: ['ufo', 'dreams', 'nde'],
    source: 'user_stated'
  })
})
```

---

### GET /api/memory

**Purpose:** Retrieve user memory

**Query Parameters:**
- `scope` (optional): 'profile' | 'session'
- `key` (optional): Specific key to retrieve

**Response:**
```typescript
{
  memories: Array<{
    id: string
    scope: string
    key: string
    value: any
    source: string
    updated_at: string
  }>
}
```

**Example:**
```typescript
const res = await fetch('/api/memory?scope=profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

### POST /api/feedback

**Purpose:** Submit message feedback (thumbs up/down)

**Request:**
```typescript
{
  messageId: string
  rating: 1 | -1  // thumbs up = 1, thumbs down = -1
  feedbackText?: string
}
```

**Response:**
```typescript
{
  id: string
  message_id: string
  user_id: string
  rating: number
  created_at: string
}
```

**Example:**
```typescript
await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messageId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 1
  })
})
```

---

### POST /api/upload

**Purpose:** Upload attachments (images, files)

**Request:** `multipart/form-data`
- `file`: File to upload (max 10MB)
- `messageId`: UUID of message

**Response:**
```typescript
{
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_url: string
  created_at: string
}
```

**Example:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('messageId', messageId)

await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

---

### POST /api/share

**Purpose:** Create shareable link for chat

**Request:**
```typescript
{
  chatId: string
  expiresInHours?: number  // default: null (no expiry)
}
```

**Response:**
```typescript
{
  id: string
  chat_id: string
  share_token: string
  expires_at: string | null
  share_url: string  // e.g., "/share/abc123def456"
}
```

**Example:**
```typescript
await fetch('/api/share', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    chatId: '123e4567-e89b-12d3-a456-426614174000',
    expiresInHours: 24
  })
})
```

---

### GET /api/share/[token]

**Purpose:** Retrieve shared chat by token

**Response:**
```typescript
{
  chat: {
    id: string
    title: string
    messages: Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      created_at: string
    }>
  }
  expires_at: string | null
}
```

---

**Next:** See 10_DEPLOYMENT_GUIDE.md for production deployment.
