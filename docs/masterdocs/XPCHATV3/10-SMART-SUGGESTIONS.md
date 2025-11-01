# XPChat v3 - Smart Suggestions & Prompt Engine

**Status:** Planning Phase
**Created:** 2025-10-26

---

## 🧠 The Challenge

**Problem:** User starrt auf leeres Eingabefeld und denkt: "Was soll ich fragen?"

**Solution:** Intelligente Suggestions die:
1. Context-aware sind (basierend auf bisherigen Queries)
2. Discovery anregen (nicht nur antworten, sondern neue Fragen aufwerfen)
3. Progressive complexity (einfach → komplex)

---

## 💡 The 4 Suggestion Types

### 1. Welcome Suggestions (Cold Start)

**Wann:** User hat noch nichts gesucht

**Ziel:** Onboarding, Inspire, Show Capabilities

```typescript
const WELCOME_SUGGESTIONS: Suggestion[] = [
  // Popular by Category
  {
    category: 'UFO',
    title: 'UFO-Sichtungen in Deutschland',
    query: 'Zeig mir UFO-Sichtungen in Deutschland',
    description: 'Entdecke außergewöhnliche Begegnungen in deiner Nähe',
    icon: '🛸',
    popularity: 0.9
  },
  {
    category: 'Dreams',
    title: 'Luzide Träume verstehen',
    query: 'Was sind Muster bei luziden Träumen?',
    description: 'Finde heraus, wie andere bewusst träumen',
    icon: '🌙',
    popularity: 0.85
  },
  {
    category: 'NDE',
    title: 'Nahtoderfahrungen mit Licht',
    query: 'Zeig mir Nahtoderfahrungen mit Licht-Beschreibungen',
    description: 'Erfahre von Menschen, die zurückgekehrt sind',
    icon: '✨',
    popularity: 0.8
  },

  // Trending
  {
    category: 'Trending',
    title: 'Aktuelle Phänomene 2024',
    query: 'Was sind die außergewöhnlichsten Erlebnisse in 2024?',
    description: 'Die meistdiskutierten Erfahrungen dieses Jahres',
    icon: '🔥',
    popularity: 0.95
  },

  // Patterns
  {
    category: 'Patterns',
    title: 'Verborgene Muster entdecken',
    query: 'Gibt es Zusammenhänge zwischen UFO-Sichtungen und Vollmond?',
    description: 'Lass die KI nach überraschenden Korrelationen suchen',
    icon: '🔍',
    popularity: 0.75
  },

  // Personal
  {
    category: 'Personal',
    title: 'Ähnliche Erlebnisse finden',
    query: 'Ich möchte Erlebnisse finden, die meinem ähnlich sind',
    description: 'Finde Menschen mit ähnlichen Erfahrungen',
    icon: '🤝',
    popularity: 0.7
  }
]
```

### 2. Follow-Up Suggestions (After Query)

**Wann:** User hat gerade eine Query gestellt, AI hat geantwortet

**Ziel:** Discovery Loop fortsetzen, tiefere Einblicke anbieten

```typescript
export function generateFollowUpSuggestions(
  query: string,
  results: Experience[],
  toolResults: ToolResult[]
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Based on tool results
  const searchTool = toolResults.find(t => t.toolName === 'unifiedSearch')
  if (searchTool) {
    const { mode, category, location } = searchTool.args

    // If explore mode, suggest browse (see all)
    if (mode === 'explore') {
      suggestions.push({
        title: 'Alle Ergebnisse durchsuchen',
        query: `Zeig mir ALLE ${category}-Erlebnisse${location ? ` in ${location}` : ''}`,
        reason: 'Du hast nur die Top-Matches gesehen',
        icon: '📋'
      })
    }

    // Suggest temporal analysis
    if (results.length > 10) {
      suggestions.push({
        title: 'Zeitliche Muster',
        query: `Wann passieren die meisten ${category}-Erlebnisse?`,
        reason: 'Entdecke zeitliche Trends',
        icon: '📈'
      })
    }

    // Suggest geographic analysis
    const hasGeo = results.filter(r => r.lat && r.lng).length > 3
    if (hasGeo && !location) {
      suggestions.push({
        title: 'Wo passiert das?',
        query: `Zeig mir ${category}-Erlebnisse auf einer Karte`,
        reason: 'Visualisiere geografische Hotspots',
        icon: '🗺️'
      })
    }

    // Suggest similar experiences
    if (results.length > 0) {
      const topResult = results[0]
      suggestions.push({
        title: 'Ähnliche Erlebnisse',
        query: `Finde Erlebnisse ähnlich zu "${topResult.title.slice(0, 40)}..."`,
        reason: 'Entdecke verwandte Erfahrungen',
        icon: '🔗'
      })
    }

    // Suggest cross-category
    if (category) {
      const otherCategories = ['UFO', 'Dreams', 'NDE', 'Paranormal']
        .filter(c => c !== category)

      suggestions.push({
        title: `Gibt es Verbindungen zu ${otherCategories[0]}?`,
        query: `Gibt es Menschen mit ${category} UND ${otherCategories[0]}-Erlebnissen?`,
        reason: 'Cross-Category Patterns',
        icon: '🌐'
      })
    }
  }

  // Based on visualization shown
  const vizTool = toolResults.find(t => t.toolName === 'visualize')
  if (vizTool) {
    const { type } = vizTool.args

    if (type === 'map') {
      suggestions.push({
        title: 'Hotspot-Analyse',
        query: 'Welche Region hat die meisten Erlebnisse?',
        reason: 'Deep Dive in die Daten',
        icon: '📍'
      })
    }

    if (type === 'timeline') {
      suggestions.push({
        title: 'Peak-Zeiten',
        query: 'Wann war der Peak und warum?',
        reason: 'Verstehe die Trends',
        icon: '⏱️'
      })
    }
  }

  // Prioritize by relevance
  return suggestions
    .sort((a, b) => calculateRelevance(b, query) - calculateRelevance(a, query))
    .slice(0, 4) // Max 4 suggestions
}
```

### 3. Personalized Suggestions (Based on History)

**Wann:** User ist eingeloggt und hat History

**Ziel:** Relevant bleiben, User's Interessen verstehen

```typescript
export async function generatePersonalizedSuggestions(
  userId: string
): Promise<Suggestion[]> {
  // Get user's discovery history
  const { data: history } = await supabase
    .from('discovery_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get user preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('discovery_preferences')
    .eq('id', userId)
    .single()

  const preferences = profile?.discovery_preferences || {}
  const topCategories = preferences.categories || []

  const suggestions: Suggestion[] = []

  // Based on favorite categories
  if (topCategories.length > 0) {
    const favCategory = topCategories[0]
    suggestions.push({
      title: `Neue ${favCategory}-Erlebnisse`,
      query: `Zeig mir ${favCategory}-Erlebnisse aus den letzten 7 Tagen`,
      reason: `Du interessierst dich für ${favCategory}`,
      icon: getCategoryIcon(favCategory),
      personalized: true
    })
  }

  // Based on location
  if (preferences.location) {
    suggestions.push({
      title: 'Erlebnisse in deiner Nähe',
      query: `Außergewöhnliche Erlebnisse in der Nähe von ${preferences.location}`,
      reason: 'Lokale Phänomene entdecken',
      icon: '📍',
      personalized: true
    })
  }

  // Based on similar users
  const { data: similarUsers } = await supabase.rpc('find_similar_users', {
    user_id: userId,
    limit: 5
  })

  if (similarUsers.length > 0) {
    suggestions.push({
      title: 'Was andere User entdecken',
      query: `Zeig mir, was User mit ähnlichen Interessen entdeckt haben`,
      reason: 'Basierend auf ähnlichen Usern',
      icon: '👥',
      personalized: true
    })
  }

  // Re-engagement (if user hasn't visited in a while)
  const lastVisit = new Date(history[0]?.created_at)
  const daysSinceVisit = differenceInDays(new Date(), lastVisit)

  if (daysSinceVisit > 7) {
    suggestions.push({
      title: 'Was hast du verpasst?',
      query: `Zeig mir neue Erlebnisse seit meinem letzten Besuch`,
      reason: `${daysSinceVisit} Tage her`,
      icon: '🆕',
      personalized: true
    })
  }

  return suggestions.slice(0, 6)
}
```

### 4. Smart Questions (During Submission)

**Wann:** User trägt eigenes Erlebnis ein (AI-guided)

**Ziel:** Qualitativ hochwertige Submissions, vollständige Daten

```typescript
export function generateSubmissionQuestions(
  context: SubmissionContext
): Question[] {
  const { category, currentData, step } = context

  const questions: Question[] = []

  // Step 1: Basic Info
  if (step === 1) {
    questions.push({
      id: 'title',
      type: 'text',
      prompt: 'Gib deinem Erlebnis einen Titel',
      placeholder: 'z.B. "Helles Licht über dem Englischen Garten"',
      required: true,
      aiSuggestion: true // AI can suggest based on initial input
    })

    questions.push({
      id: 'when',
      type: 'conversational',
      prompt: 'Wann ist es passiert?',
      examples: [
        'Gestern Nacht gegen 23 Uhr',
        'Im Sommer 2020',
        'Ich weiß das genaue Datum nicht, aber es war vor 3 Jahren'
      ],
      required: true
    })
  }

  // Step 2: Details (category-specific)
  if (step === 2) {
    if (category === 'UFO') {
      questions.push({
        id: 'description',
        type: 'conversational',
        prompt: 'Erzähl mir, was du gesehen hast',
        followUps: [
          'Welche Form hatte es?',
          'Wie hat es sich bewegt?',
          'Wie lange hast du es beobachtet?',
          'Gab es Geräusche?',
          'Wie groß schätzt du es ein?'
        ],
        required: true
      })
    } else if (category === 'Dreams') {
      questions.push({
        id: 'description',
        type: 'conversational',
        prompt: 'Erzähl mir von deinem Traum',
        followUps: [
          'War es ein luzider Traum?',
          'Gab es besondere Symbole oder Motive?',
          'Wie hast du dich beim Aufwachen gefühlt?',
          'Wiederholt sich dieser Traum?'
        ],
        required: true
      })
    }
    // ... other categories
  }

  // Step 3: Context
  if (step === 3) {
    questions.push({
      id: 'location',
      type: 'location',
      prompt: 'Wo ist es passiert?',
      placeholder: 'Stadt, Land oder genauer Ort',
      required: false,
      geocode: true // Auto-geocode to lat/lng
    })

    questions.push({
      id: 'witnesses',
      type: 'conversational',
      prompt: 'Warst du allein oder gab es Zeugen?',
      examples: [
        'Ich war allein',
        'Meine Freundin war dabei',
        'Wir waren zu dritt'
      ],
      required: false
    })
  }

  // Step 4: AI Analysis & Tags
  if (step === 4) {
    // AI analyzes the description and suggests tags
    const suggestedTags = analyzeDescriptionForTags(currentData.description)

    questions.push({
      id: 'tags',
      type: 'multiselect',
      prompt: 'Welche dieser Tags passen zu deinem Erlebnis?',
      options: suggestedTags.map(tag => ({
        value: tag,
        label: tag,
        suggested: true
      })),
      allowCustom: true,
      required: false
    })

    // AI finds similar experiences
    const similar = await findSimilarExperiences(currentData)

    if (similar.length > 0) {
      questions.push({
        id: 'awareness',
        type: 'info',
        prompt: `Ich habe ${similar.length} ähnliche Erlebnisse gefunden!`,
        content: (
          <div>
            <p>Andere User haben ähnliches erlebt:</p>
            <ul>
              {similar.slice(0, 3).map(exp => (
                <li key={exp.id}>
                  <a href={`/experiences/${exp.id}`} target="_blank">
                    {exp.title}
                  </a>
                  <span className="text-sm text-gray-600">
                    {' '}({(exp.similarity * 100).toFixed(0)}% ähnlich)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })
    }
  }

  return questions
}
```

---

## 🎯 The Suggestion API

### Endpoint: `/api/suggestions`

```typescript
// app/api/suggestions/route.ts

export async function POST(req: Request) {
  const { type, context } = await req.json()
  const user = await getUser()

  let suggestions: Suggestion[] = []

  switch (type) {
    case 'welcome':
      suggestions = WELCOME_SUGGESTIONS
      break

    case 'followup':
      suggestions = generateFollowUpSuggestions(
        context.query,
        context.results,
        context.toolResults
      )
      break

    case 'personalized':
      if (user) {
        suggestions = await generatePersonalizedSuggestions(user.id)
      } else {
        suggestions = WELCOME_SUGGESTIONS
      }
      break

    case 'submission':
      suggestions = generateSubmissionQuestions(context)
      break

    default:
      suggestions = []
  }

  return NextResponse.json({ suggestions })
}
```

---

## 🧪 A/B Testing Suggestions

### Track Performance

```typescript
// Track which suggestions users click
export async function trackSuggestionClick(
  suggestionId: string,
  userId: string | null,
  context: string
) {
  await supabase.from('suggestion_clicks').insert({
    suggestion_id: suggestionId,
    user_id: userId,
    context,
    clicked_at: new Date().toISOString()
  })
}

// Analyze performance
export async function analyzeSuggestionPerformance() {
  const { data } = await supabase
    .from('suggestion_clicks')
    .select('suggestion_id, count')
    .groupBy('suggestion_id')

  // Calculate CTR (click-through rate)
  const performance = data.map(row => ({
    suggestionId: row.suggestion_id,
    clicks: row.count,
    ctr: row.count / impressions[row.suggestion_id]
  }))

  return performance
}
```

### Optimize Over Time

```typescript
// Machine Learning: Learn which suggestions work best
export function optimizeSuggestions(
  suggestions: Suggestion[],
  userProfile: UserProfile
): Suggestion[] {
  // Score based on:
  // 1. Historical CTR for this suggestion
  // 2. User's category preferences
  // 3. Time of day
  // 4. Recent trends

  return suggestions
    .map(s => ({
      ...s,
      score: calculateScore(s, userProfile)
    }))
    .sort((a, b) => b.score - a.score)
}
```

---

## 💬 Conversational Prompts

### The AI's Voice

```typescript
const CONVERSATIONAL_PROMPTS = {
  // After showing results
  afterResults: [
    'Möchtest du tiefer eintauchen?',
    'Interessiert dich ein bestimmtes Erlebnis?',
    'Soll ich nach weiteren Patterns suchen?',
    'Hast du auch ein ähnliches Erlebnis?'
  ],

  // After visualization
  afterVisualization: [
    'Fällt dir ein Muster auf?',
    'Soll ich einen anderen Zeitraum analysieren?',
    'Möchtest du eine andere Region erkunden?'
  ],

  // Empty results
  emptyResults: [
    'Hmm, ich habe nichts Passendes gefunden.',
    'Versuch es mal mit anderen Suchbegriffen.',
    'Möchtest du die Suche ausweiten?'
  ],

  // Encourage submission
  encourageSubmission: [
    'Hattest du auch so ein Erlebnis?',
    'Möchtest du deine Erfahrung teilen?',
    'Du kannst auch dein Erlebnis eintragen!'
  ]
}
```

---

## 🎨 UI Components

### SuggestionCard

```typescript
export function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        trackSuggestionClick(suggestion.id, user?.id, 'welcome')
        onClick(suggestion.query)
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{suggestion.icon}</div>
          <div className="flex-1">
            <CardTitle className="text-base">{suggestion.title}</CardTitle>
            {suggestion.reason && (
              <Badge variant="secondary" className="mt-1">
                {suggestion.reason}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{suggestion.description}</p>
      </CardContent>
    </Card>
  )
}
```

### FollowUpBar

```typescript
export function FollowUpBar({ suggestions }: FollowUpBarProps) {
  return (
    <div className="border-t p-4 bg-gray-50">
      <p className="text-sm text-gray-600 mb-2">Möchtest du auch wissen:</p>
      <div className="flex gap-2 flex-wrap">
        {suggestions.map(s => (
          <Button
            key={s.title}
            size="sm"
            variant="outline"
            onClick={() => sendMessage(s.query)}
          >
            {s.icon} {s.title}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Success Metrics

**Suggestion Quality:**
- ✅ Click-through rate: >25%
- ✅ Conversion to query: >80% (clicked → actual query sent)
- ✅ User satisfaction: >4.0/5 (implicit: did they engage?)

**Discovery Flow:**
- ✅ Avg queries per session: >3 (suggestions drive exploration)
- ✅ Return rate: >50% (good suggestions = return users)
- ✅ Submission conversion: >15% (suggestions lead to submissions)

---

**Nächstes Dokument:** 11-SUBMISSION-FLOW.md (AI-Guided Submission UX)
