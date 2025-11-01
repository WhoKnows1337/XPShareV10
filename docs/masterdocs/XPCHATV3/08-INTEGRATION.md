# XPChat v3 - Integration & Ecosystem Flow

**Status:** Planning Phase
**Created:** 2025-10-26

> **Architecture Context:** User-Kontext und Discovery History werden mit Mastra Memory (resource-scoped) persistiert. Siehe [01A-ARCHITECTURE-DECISIONS.md § Memory Strategy](./01A-ARCHITECTURE-DECISIONS.md#💾-memory-strategy) für die technische Implementierung.

---

## 🌐 The Discovery Ecosystem

XPChat v3 ist nicht isoliert - es ist das **Herzstück** eines Ökosystems, das Discovery, Submission und Community verbindet.

```
┌─────────────────────────────────────────────────────┐
│                  DISCOVERY LOOP                     │
│                                                     │
│  1. User fragt AI      →  2. AI findet Matches     │
│        ↓                         ↓                  │
│  5. Auto-Matching  ←  3. User fühlt sich validiert │
│        ↓                         ↓                  │
│  6. Notifications  ←  4. User trägt eigene XP ein  │
│        ↓                                            │
│  7. User kehrt zurück (Loop!)                       │
└─────────────────────────────────────────────────────┘
```

**Kernprinzip:** Jede Interaktion führt zurück zur Discovery

---

## 🔗 Integration 1: Chat ↔ Submit

### Flow: Discovery Before Submission

**Problem (Alt):**
```
User hat UFO-Erlebnis
  → Googled "UFO melden"
  → Landet auf /submit
  → Füllt Form aus (kalt, unpersönlich)
  → Hofft, dass jemand liest
```

**Solution (Neu):**
```
User hat UFO-Erlebnis
  → Googled "UFO München"
  → Landet auf /discover
  → Tippt "UFO gestern Nacht Englischer Garten"
  → AI zeigt 12 ähnliche Erlebnisse SOFORT
  → User fühlt: "Ich bin nicht allein!"
  → AI fragt: "Möchtest du dein Erlebnis teilen?"
  → Leitet zu AI-Guided Submission
```

### Implementation

#### Step 1: In Chat UI einbauen

**`app/[locale]/discover/page.tsx`**

```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { WelcomeScreen } from '@/components/discover/WelcomeScreen'
import { MessageBubble } from '@/components/discover/MessageBubble'
import { SubmissionPrompt } from '@/components/discover/SubmissionPrompt'

export default function DiscoverPage() {
  const { messages, sendMessage, status } = useChat({
    api: '/api/xpchat'
  })

  // Detect when to show submission prompt
  const shouldShowSubmissionPrompt = useMemo(() => {
    const lastAssistantMessage = messages
      .filter(m => m.role === 'assistant')
      .pop()

    // If AI found matches, offer submission
    if (lastAssistantMessage?.toolInvocations) {
      const searchResults = lastAssistantMessage.toolInvocations
        .find(t => t.toolName === 'unifiedSearch')?.result

      return searchResults?.experiences?.length > 0
    }

    return false
  }, [messages])

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4">
        <h1>Entdecke das Außergewöhnliche</h1>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <WelcomeScreen onQuestionSelect={sendMessage} />
        ) : (
          messages.map(m => (
            <MessageBubble key={m.id} message={m} />
          ))
        )}

        {/* Submission Prompt (erscheint nach Matches) */}
        {shouldShowSubmissionPrompt && (
          <SubmissionPrompt
            onSubmit={() => {
              // Pre-fill submission with context from chat
              const context = extractContextFromMessages(messages)
              router.push(`/submit?context=${encodeContext(context)}`)
            }}
          />
        )}
      </main>

      {/* Input */}
      <footer className="border-t p-4">
        <ChatInput onSend={sendMessage} disabled={status !== 'idle'} />
      </footer>
    </div>
  )
}
```

#### Step 2: Context weitergeben an Submit

**`app/[locale]/submit/page.tsx`**

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { AIGuidedSubmission } from '@/components/submit/AIGuidedSubmission'

export default function SubmitPage() {
  const searchParams = useSearchParams()
  const context = decodeContext(searchParams.get('context'))

  // context = {
  //   category: 'UFO',
  //   location: 'München, Englischer Garten',
  //   relatedExperiences: [id1, id2, id3],
  //   suggestedTags: ['licht', 'schnell', 'nacht'],
  //   userQuery: 'UFO gestern Nacht...'
  // }

  return (
    <AIGuidedSubmission
      initialContext={context}
      onComplete={(experienceId) => {
        // Nach Submit: Zurück zu Chat mit neuem Kontext
        router.push(`/discover?submitted=${experienceId}`)
      }}
    />
  )
}
```

#### Step 3: Auto-Matching nach Submit

**`app/api/experiences/route.ts`** (existing)

```typescript
export async function POST(req: Request) {
  const body = await req.json()
  const user = await getUser()

  // 1. Create experience
  const { data: experience } = await supabase
    .from('experiences')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  // 2. Generate embedding
  const embedding = await generateEmbedding(
    `${experience.title} ${experience.description}`
  )

  await supabase
    .from('experiences')
    .update({ embedding })
    .eq('id', experience.id)

  // 3. AUTO-MATCHING (NEU!)
  const { data: matches } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: 0.75, // High threshold for auto-matching
    match_count: 10,
  })

  // 4. Create notifications for matched users
  if (matches.length > 0) {
    await Promise.all(
      matches.map(match =>
        supabase.from('notifications').insert({
          user_id: match.user_id,
          type: 'experience_match',
          title: 'Ähnliches Erlebnis gefunden!',
          message: `Jemand hat ein Erlebnis geteilt, das deinem sehr ähnlich ist.`,
          link: `/experiences/${experience.id}`,
          metadata: {
            similarity: match.similarity,
            new_experience_id: experience.id,
            your_experience_id: match.id
          }
        })
      )
    )
  }

  return NextResponse.json({
    experience,
    matches: matches.length,
  })
}
```

### Multi-Tiered Matching (Advanced)

**Problem:** Single threshold (0.75) ist zu einfach - manche Matches brauchen LLM-Analyse, andere nicht.

**Solution:** 4-Level Tiered Approach

#### Matching Tiers

```typescript
// lib/matching/tiered-matcher.ts

interface MatchTier {
  tier: 'auto-similar' | 'auto-related' | 'llm-analysis' | 'temporal';
  threshold: number;
  action: 'auto-notify' | 'suggest' | 'analyze' | 'context';
  confidence: number;
}

const MATCH_TIERS: MatchTier[] = [
  {
    tier: 'auto-similar',
    threshold: 0.85,
    action: 'auto-notify',
    confidence: 0.95
  },
  {
    tier: 'auto-related',
    threshold: 0.70,
    action: 'suggest',
    confidence: 0.80
  },
  {
    tier: 'llm-analysis',
    threshold: 0.50,
    action: 'analyze',
    confidence: 0.65
  },
  {
    tier: 'temporal',
    threshold: 0.0,
    action: 'context',
    confidence: 0.50
  }
];
```

#### Implementation

```typescript
// app/api/experiences/route.ts (updated)

export async function POST(req: Request) {
  const body = await req.json()
  const user = await getUser()

  // 1. Create experience (same)
  const { data: experience } = await supabase
    .from('experiences')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  // 2. Generate embedding (same)
  const embedding = await generateEmbedding(
    `${experience.title} ${experience.description}`
  )

  await supabase
    .from('experiences')
    .update({ embedding })
    .eq('id', experience.id)

  // 3. MULTI-TIERED MATCHING (NEW!)
  const matches = await findMatchesWithTiers(experience, embedding)

  // 4. Process by tier
  for (const match of matches) {
    switch (match.tier) {
      case 'auto-similar':
        // Very high confidence - auto-notify both users
        await createNotification({
          user_id: match.user_id,
          type: 'high_match',
          title: 'Fast identisches Erlebnis gefunden!',
          message: 'Jemand hat etwas sehr ähnliches erlebt.',
          link: `/experiences/${experience.id}`,
          confidence: match.confidence
        })
        break

      case 'auto-related':
        // Medium confidence - suggest in feed
        await createSuggestion({
          user_id: match.user_id,
          type: 'related_experience',
          experience_id: experience.id,
          confidence: match.confidence
        })
        break

      case 'llm-analysis':
        // Lower confidence - needs LLM verification
        await queueLLMAnalysis({
          experience_a: match.id,
          experience_b: experience.id,
          similarity: match.similarity
        })
        break

      case 'temporal':
        // Same time/place - contextual match
        await addToContext({
          experience_id: match.id,
          related_id: experience.id,
          reason: 'temporal_proximity'
        })
        break
    }
  }

  return NextResponse.json({
    experience,
    matches: {
      total: matches.length,
      by_tier: {
        auto_similar: matches.filter(m => m.tier === 'auto-similar').length,
        auto_related: matches.filter(m => m.tier === 'auto-related').length,
        llm_analysis: matches.filter(m => m.tier === 'llm-analysis').length,
        temporal: matches.filter(m => m.tier === 'temporal').length
      }
    }
  })
}

async function findMatchesWithTiers(
  experience: Experience,
  embedding: number[]
): Promise<Array<Match & { tier: string }>> {

  const allMatches: Array<Match & { tier: string }> = []

  // Tier 1-3: Vector similarity
  const { data: vectorMatches } = await supabase.rpc('match_experiences', {
    query_embedding: embedding,
    match_threshold: 0.50, // Include tier 3
    match_count: 50
  })

  vectorMatches?.forEach(match => {
    if (match.similarity >= 0.85) {
      allMatches.push({ ...match, tier: 'auto-similar' })
    } else if (match.similarity >= 0.70) {
      allMatches.push({ ...match, tier: 'auto-related' })
    } else {
      allMatches.push({ ...match, tier: 'llm-analysis' })
    }
  })

  // Tier 4: Temporal/Geographic proximity
  if (experience.occurred_at && experience.location_lat) {
    const { data: temporalMatches } = await supabase.rpc('find_nearby_experiences', {
      p_experience_id: experience.id,
      p_time_window_days: 30,
      p_distance_km: 100,
      p_limit: 20
    })

    temporalMatches?.forEach(match => {
      // Only add if not already matched by vector
      if (!allMatches.find(m => m.id === match.id)) {
        allMatches.push({ ...match, tier: 'temporal' })
      }
    })
  }

  return allMatches
}
```

#### LLM Analysis Queue (Background Job)

```typescript
// lib/matching/llm-analyzer.ts

export async function analyzeLowConfidenceMatches() {
  // Run periodically (cron job)

  const pending = await supabase
    .from('match_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10)

  for (const item of pending) {
    const { experience_a, experience_b } = await fetchExperiences(
      item.experience_a_id,
      item.experience_b_id
    )

    const prompt = `Analyze if these two experiences are meaningfully related:

Experience A:
${experience_a.title}
${experience_a.description}

Experience B:
${experience_b.title}
${experience_b.description}

Provide:
1. Are they related? (yes/no)
2. Reason (1 sentence)
3. Confidence (0-1)`

    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt,
      temperature: 0
    })

    const analysis = parseAnalysis(response.text)

    if (analysis.related && analysis.confidence > 0.7) {
      // Upgrade to 'auto-related' tier
      await createSuggestion({
        user_id: experience_a.user_id,
        type: 'llm_verified_match',
        experience_id: experience_b.id,
        confidence: analysis.confidence,
        reason: analysis.reason
      })
    }

    // Mark as processed
    await supabase
      .from('match_analysis_queue')
      .update({ status: 'completed', analysis })
      .eq('id', item.id)
  }
}
```

#### Statistics by Tier (Expected Distribution)

```
Tier 1 (Auto-Similar):     40% of matches (instant notification)
Tier 2 (Auto-Related):     25% of matches (suggested in feed)
Tier 3 (LLM Analysis):     30% of matches (background verification)
Tier 4 (Temporal):         5% of matches (contextual info)
```

**Benefits:**
- ✅ Precision: No false-positive notifications
- ✅ Cost-Efficient: Only LLM for unclear cases
- ✅ Better UX: Right notification for right match strength

**See Also:** [14-PATTERN-DETECTION.md § 5](./14-PATTERN-DETECTION.md) for similarity algorithms

---

## 🔗 Integration 2: Chat ↔ Profile

### Flow: Personalisierte Discovery

**Concept:** User's Discovery History → Personalized Suggestions

#### Step 1: Save Discovery Context

**`app/api/xpchat/route.ts`**

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json()
  const user = await getUser()

  const stream = await streamText({
    model: anthropic('claude-3-7-sonnet-20250219'),
    messages,
    tools: { unifiedSearch, visualize, discoverPatterns, manageContext },

    // Save context after each query
    onFinish: async ({ usage, text, toolResults }) => {
      // Save to discovery_history
      await supabase.from('discovery_history').insert({
        user_id: user.id,
        query: messages[messages.length - 1].content,
        categories_explored: extractCategories(toolResults),
        patterns_found: extractPatterns(toolResults),
        interactions: messages.length,
        cost: calculateCost(usage),
      })

      // Update user preferences
      await supabase.rpc('update_user_discovery_preferences', {
        user_id: user.id,
        categories: extractCategories(toolResults),
      })
    }
  })

  return stream.toDataStreamResponse()
}
```

#### Step 2: Profile zeigt Discovery Stats

**`app/[locale]/profile/page.tsx`**

```typescript
export default async function ProfilePage() {
  const user = await getUser()

  const stats = await supabase
    .from('discovery_history')
    .select('*')
    .eq('user_id', user.id)

  const topCategories = aggregateCategories(stats)
  const totalQueries = stats.length
  const patternsDiscovered = stats.filter(s => s.patterns_found > 0).length

  return (
    <div>
      <UserInfo user={user} />

      {/* Discovery Stats */}
      <Card>
        <h2>Deine Discovery Journey</h2>
        <Stats>
          <Stat label="Queries" value={totalQueries} />
          <Stat label="Patterns entdeckt" value={patternsDiscovered} />
          <Stat label="Kategorien erkundet" value={topCategories.length} />
        </Stats>

        {/* Top Categories */}
        <CategoryCloud categories={topCategories} />

        {/* Saved Searches */}
        <SavedSearches userId={user.id} />
      </Card>

      {/* Personalized Suggestions (from AI) */}
      <PersonalizedSuggestions
        categories={topCategories}
        userId={user.id}
      />
    </div>
  )
}
```

#### Step 3: Personalisierte Welcome Screen

**`components/discover/WelcomeScreen.tsx`**

```typescript
export function WelcomeScreen({ onQuestionSelect }) {
  const { user } = useUser()
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (user) {
      // Load personalized suggestions
      fetch('/api/suggestions/personalized')
        .then(r => r.json())
        .then(data => setSuggestions(data.suggestions))
    }
  }, [user])

  return (
    <div>
      <h1>Entdecke das Außergewöhnliche</h1>

      {/* Personalized Suggestions (if logged in) */}
      {suggestions.length > 0 && (
        <section>
          <h2>Für dich empfohlen</h2>
          <div className="grid gap-4">
            {suggestions.map(s => (
              <SuggestionCard
                key={s.id}
                title={s.title}
                description={s.description}
                reason={s.reason} // "Basierend auf deinen UFO-Suchen"
                onClick={() => onQuestionSelect(s.query)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Default Example Questions */}
      <section>
        <h2>Beliebte Fragen</h2>
        <ExampleQuestions onSelect={onQuestionSelect} />
      </section>
    </div>
  )
}
```

---

## 🔗 Integration 3: Submit ↔ Profile

### Flow: Contribution & Community

#### Step 1: Profile zeigt Contributions

**`app/[locale]/profile/page.tsx`**

```typescript
export default async function ProfilePage() {
  const user = await getUser()

  const experiences = await supabase
    .from('experiences')
    .select('*, _count(comments), _count(matches)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalViews = experiences.reduce((sum, exp) => sum + exp.views, 0)
  const totalMatches = experiences.reduce((sum, exp) => sum + exp._count.matches, 0)

  return (
    <div>
      {/* Contribution Stats */}
      <Card>
        <h2>Deine Beiträge</h2>
        <Stats>
          <Stat label="Erlebnisse geteilt" value={experiences.length} />
          <Stat label="Aufrufe insgesamt" value={totalViews} />
          <Stat label="Matches gefunden" value={totalMatches} />
          <Stat label="Level" value={calculateLevel(user.xp)} />
        </Stats>

        {/* Badge Showcase */}
        <BadgeShowcase badges={user.badges} />
      </Card>

      {/* Experience List */}
      <section>
        <h2>Deine Erlebnisse</h2>
        {experiences.map(exp => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            showStats // Views, Matches, Comments
            showActions // Edit, Delete
          />
        ))}
      </section>

      {/* Matches (Andere User mit ähnlichen Erlebnissen) */}
      <section>
        <h2>Deine Matches</h2>
        <MatchesList userId={user.id} />
      </section>
    </div>
  )
}
```

#### Step 2: Notifications für Matches

**`components/layout/NotificationBell.tsx`**

```typescript
export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Poll for new notifications every 30s
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })

      setNotifications(data)
      setUnreadCount(data.length)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Popover>
      <PopoverTrigger>
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1">
            {unreadCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent>
        <h3>Benachrichtigungen</h3>
        {notifications.map(notif => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onRead={async () => {
              await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notif.id)

              setNotifications(prev => prev.filter(n => n.id !== notif.id))
              setUnreadCount(prev => prev - 1)
            }}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}
```

---

## 🔄 The Complete Loop

### Szenario: Sarah's Journey (mit allen Integrationen)

```
Tag 1 (Discovery):
  00:00 → Sarah googled "UFO München"
  00:01 → Landet auf /discover
  00:02 → Tippt "UFO gestern Nacht Englischer Garten"
  00:07 → AI zeigt 12 Matches + Karte
  00:10 → Sarah fühlt: "Ich bin nicht allein!" ✅
  00:15 → AI fragt: "Möchtest du dein Erlebnis teilen?"
  00:16 → Sarah klickt "Ja, jetzt eintragen"

Tag 1 (Submission):
  00:17 → Leitet zu /submit mit Context
  00:18 → AI-Guided: "Erzähl mir von deinem Erlebnis..."
  00:23 → Sarah erzählt (conversational, nicht Form)
  00:28 → AI schlägt Tags vor: #licht #schnell #nacht
  00:30 → Submit erfolgreich ✅

Tag 1 (Auto-Matching):
  00:31 → System generiert Embedding
  00:32 → Findet 8 ähnliche Erlebnisse (>75% similarity)
  00:33 → Notifications an 8 User: "Ähnliches Erlebnis gefunden!"
  00:34 → Badge awarded: "First Contribution" (10 XP)

Tag 2 (Match Notification):
  09:00 → Sarah öffnet XPShare
  09:01 → Bell zeigt 3 Notifications
  09:02 → "Michael hat auf dein UFO-Erlebnis reagiert"
  09:03 → "Anna hat auch UFO im Engl. Garten gesehen"
  09:04 → Sarah klickt, liest Anna's Erlebnis
  09:10 → Sarah kommentiert: "Ja, genau so war es!" ✅

Tag 3 (Discovery Loop):
  20:00 → Sarah kehrt zurück zu /discover
  20:01 → Welcome Screen zeigt personalisierte Suggestions:
          "Für dich empfohlen (basierend auf deinen UFO-Suchen):"
          - "UFO-Sichtungen in Deutschland 2024"
          - "Patterns bei Licht-Phänomenen"
  20:02 → Sarah klickt "UFO-Sichtungen Deutschland 2024"
  20:10 → Exploriert 20 Minuten lang
  20:30 → Badge awarded: "Explorer" (50 XP)

Tag 7 (Community):
  → Sarah hat 23 Profile Views
  → 5 Matches gefunden
  → 2 Kommentare auf ihrem Erlebnis
  → Level 2 erreicht
  → Fühlt sich als Teil der Community ✅
```

**Ergebnis:** Sarah ist vom Suchenden zum Community-Mitglied geworden, durch nahtlose Integration aller Flows.

---

## 🛠️ Technical Implementation Checklist

### Database Changes

```sql
-- Discovery History Table (NEW)
CREATE TABLE discovery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  query TEXT NOT NULL,
  categories_explored TEXT[],
  patterns_found INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 1,
  cost DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences (UPDATE)
ALTER TABLE profiles ADD COLUMN discovery_preferences JSONB DEFAULT '{
  "categories": [],
  "notification_frequency": "daily",
  "auto_match": true
}'::jsonb;

-- Discovery Stats Function
CREATE OR REPLACE FUNCTION update_user_discovery_preferences(
  user_id UUID,
  categories TEXT[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET discovery_preferences = jsonb_set(
    discovery_preferences,
    '{categories}',
    to_jsonb(categories)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### API Routes

```
✅ /api/xpchat           - Main chat endpoint (exists)
✅ /api/experiences      - Submit experience (exists)
🆕 /api/suggestions/personalized  - Get suggestions
🆕 /api/matches/[experienceId]    - Get matches for experience
🆕 /api/notifications    - Poll notifications
```

### Components

```
✅ app/[locale]/discover/page.tsx         - Chat UI (to create)
✅ app/[locale]/submit/page.tsx           - Submit UI (exists)
✅ app/[locale]/profile/page.tsx          - Profile UI (exists)

🆕 components/discover/SubmissionPrompt.tsx
🆕 components/discover/PersonalizedSuggestions.tsx
🆕 components/submit/AIGuidedSubmission.tsx
🆕 components/profile/DiscoveryStats.tsx
🆕 components/profile/MatchesList.tsx
🆕 components/layout/NotificationBell.tsx
```

---

## 🎯 Success Metrics

**Integration Quality:**
- ✅ Discovery → Submit conversion: >30%
- ✅ Auto-match notification rate: >80%
- ✅ User returns after submission: >50% (7d)
- ✅ Personalized suggestion click-rate: >20%

**User Journey Completion:**
- ✅ Discovery → Submit → Match → Return: >40%
- ✅ Average session time: >10 min
- ✅ Sessions per week: >2

---

**Nächstes Dokument:** 09-VISUAL-SYSTEM.md (Design System für Visualisierungen)
