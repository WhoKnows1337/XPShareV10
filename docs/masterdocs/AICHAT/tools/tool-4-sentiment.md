# Tool 4: Analyze Sentiment

**File:** `/lib/ai/tools/sentiment-tool.ts`
**Purpose:** Multi-dimensional sentiment analysis
**Used by:** Phase 2 `/app/api/discover/route.ts`

---

## 📋 Sentiment Dimensions

1. **Valence**: Positive/Negative
2. **Arousal**: Calm/Excited
3. **Emotions**: Fear, Wonder, Confusion, Awe, Disbelief, Curiosity

## 🔧 Implementation

```typescript
// lib/ai/tools/sentiment-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const SentimentParamsSchema = z.object({
  experienceIds: z.array(z.string()),
  dimensions: z.array(
    z.enum(['valence', 'arousal', 'fear', 'wonder', 'confusion', 'awe', 'curiosity'])
  ),
  includeTimeSeries: z.boolean().default(false)
})

export const analyzeSentimentTool = tool({
  description: 'Analyze emotional tone of experiences. Returns multi-dimensional sentiment scores.',
  parameters: SentimentParamsSchema,

  execute: async (params) => {
    const experiences = await getExperiences(params.experienceIds)

    // Aggregate sentiment scores
    const aggregate: Record<string, number> = {}

    for (const dim of params.dimensions) {
      aggregate[dim] = await calculateSentimentScore(experiences, dim)
    }

    // Distribution
    const distribution = {
      positive: experiences.filter(e => e.sentiment_score > 0.6).length,
      neutral: experiences.filter(e => e.sentiment_score >= 0.4 && e.sentiment_score <= 0.6).length,
      negative: experiences.filter(e => e.sentiment_score < 0.4).length
    }

    return {
      aggregate,
      distribution,
      timeSeries: params.includeTimeSeries ? await getSentimentTimeSeries(experiences) : undefined
    }
  }
})
```

## 📊 Output Example

```json
{
  "aggregate": {
    "valence": 0.65,
    "arousal": 0.82,
    "fear": 0.45,
    "wonder": 0.88
  },
  "distribution": {
    "positive": 12,
    "neutral": 3,
    "negative": 2
  }
}
```

---

**Next:** [Tool 5: Generate Visualization](./tool-5-visualization.md)
