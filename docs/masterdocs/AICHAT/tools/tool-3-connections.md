# Tool 3: Find Connections

**File:** `/lib/ai/tools/connection-tool.ts`
**Purpose:** Discover relationships between experiences
**Used by:** Phase 2 `/app/api/discover/route.ts`

---

## 📋 Connection Types

1. **Similarity**: Semantic similarity (embeddings distance)
2. **Co-occurrence**: Share same tags/locations/timeframes
3. **User Network**: Users with multiple similar experiences
4. **Witness Connections**: Cross-referenced witnesses

## 🔧 Implementation

```typescript
// lib/ai/tools/connection-tool.ts
import { tool } from 'ai'
import { z } from 'zod'

const ConnectionParamsSchema = z.object({
  experienceIds: z.array(z.string()),
  connectionTypes: z.array(
    z.enum(['similarity', 'coOccurrence', 'userNetwork', 'witnesses'])
  ),
  threshold: z.number().min(0).max(1).default(0.7)
})

export const findConnectionsTool = tool({
  description: 'Find connections between experiences. Returns connection graph data.',
  parameters: ConnectionParamsSchema,

  execute: async (params) => {
    const connections = []

    for (const type of params.connectionTypes) {
      switch (type) {
        case 'similarity':
          connections.push(...await findSimilarityConnections(params.experienceIds, params.threshold))
          break
        case 'coOccurrence':
          connections.push(...await findCoOccurrenceConnections(params.experienceIds, params.threshold))
          break
        case 'userNetwork':
          connections.push(...await findUserNetworkConnections(params.experienceIds))
          break
        case 'witnesses':
          connections.push(...await findWitnessConnections(params.experienceIds))
          break
      }
    }

    return {
      connections,
      count: connections.length
    }
  }
})
```

## 📊 Output Example

```json
{
  "connections": [
    {
      "from": "exp-123",
      "to": "exp-456",
      "type": "similarity",
      "strength": 0.92,
      "reason": "Both describe hovering lights in night sky"
    },
    {
      "from": "exp-123",
      "to": "exp-789",
      "type": "coOccurrence",
      "strength": 0.85,
      "sharedAttributes": ["location:Berlin", "tag:ufo", "timeframe:night"]
    }
  ],
  "count": 2
}
```

---

**Next:** [Tool 4: Analyze Sentiment](./tool-4-sentiment.md)
