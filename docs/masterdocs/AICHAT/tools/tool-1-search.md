# Tool 1: Search Experiences

**File:** `/lib/ai/tools/search-tool.ts`
**Purpose:** Hybrid search (Vector + Full-Text + RRF) for experiences
**Used by:** Phase 2 `/app/api/discover/route.ts`

---

## 📋 Overview

The search tool is the foundation of all discovery queries. It combines:
- **Vector Search** (semantic similarity via embeddings)
- **Full-Text Search** (PostgreSQL FTS)
- **Reciprocal Rank Fusion** (RRF) to merge results
- **Attribute Filtering** (category-specific structured data)

## 🔧 Implementation

```typescript
// lib/ai/tools/search-tool.ts
import { tool } from 'ai'
import { z } from 'zod'
import { generateEmbedding } from '@/lib/openai/client'
import { hybridSearch } from '@/lib/search/hybrid'

const SearchParamsSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional(),
  witnessesOnly: z.boolean().optional(),
  exclude: z.object({
    color: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),

  // 🆕 Category-specific attributes
  attributes: z.object({
    include: z.record(z.string(), z.array(z.string())).optional(),
    exclude: z.record(z.string(), z.array(z.string())).optional()
  }).optional(),

  similarTo: z.string().optional(), // Experience ID for similarity search
  maxResults: z.number().default(15),
  naturalQuery: z.string().optional() // For vector search
})

export type SearchParams = z.infer<typeof SearchParamsSchema>

export const searchExperiencesTool = tool({
  description: 'Search for experiences matching filters. Supports semantic search, full-text search, and attribute-based precision filtering.',
  parameters: SearchParamsSchema,

  execute: async (params: SearchParams) => {
    try {
      // 1. Generate embedding for semantic search (if naturalQuery provided)
      let embedding: number[] | null = null
      if (params.naturalQuery) {
        embedding = await generateEmbedding(params.naturalQuery)
      }

      // 2. Hybrid search (Vector + Full-Text + RRF)
      const results = await hybridSearch({
        embedding,
        filters: {
          category: params.category,
          tags: params.tags,
          location: params.location,
          dateRange: params.dateRange,
          witnessesOnly: params.witnessesOnly,
          exclude: params.exclude,
          attributes: params.attributes, // ✅ Attribute filtering
        },
        similarTo: params.similarTo,
        maxResults: params.maxResults
      })

      // 3. Return structured results
      return {
        experiences: results.map(exp => ({
          id: exp.id,
          title: exp.title,
          description: exp.description.substring(0, 200) + '...', // Truncate for cost
          category: exp.category_slug,
          location: exp.location,
          date: exp.experience_date,
          tags: exp.tags,
          attributes: exp.attributes,
          similarity_score: exp.similarity_score
        })),
        count: results.length,
        hasMore: results.length === params.maxResults,
        attributeFiltersApplied: !!params.attributes
      }

    } catch (error) {
      console.error('Search tool error:', error)
      return {
        experiences: [],
        count: 0,
        hasMore: false,
        error: 'Search failed'
      }
    }
  }
})
```

## 🗄️ Database Function: `hybrid_search()`

```sql
-- Function: hybrid_search()
-- Combines vector search + full-text search with RRF

CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1536),
  search_query text,
  filter_category text DEFAULT NULL,
  filter_tags text[] DEFAULT NULL,
  filter_location text DEFAULT NULL,
  max_results int DEFAULT 15
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category_slug text,
  location text,
  experience_date date,
  tags text[],
  attributes jsonb,
  similarity_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      e.id,
      1 - (e.embedding <=> query_embedding) AS score
    FROM experiences e
    WHERE
      (filter_category IS NULL OR e.category_slug = filter_category)
      AND (filter_tags IS NULL OR e.tags && filter_tags)
      AND (filter_location IS NULL OR e.location ILIKE '%' || filter_location || '%')
    ORDER BY e.embedding <=> query_embedding
    LIMIT 100
  ),
  fts_search AS (
    SELECT
      e.id,
      ts_rank(e.tsv, to_tsquery('german', search_query)) AS score
    FROM experiences e
    WHERE
      e.tsv @@ to_tsquery('german', search_query)
      AND (filter_category IS NULL OR e.category_slug = filter_category)
      AND (filter_tags IS NULL OR e.tags && filter_tags)
      AND (filter_location IS NULL OR e.location ILIKE '%' || filter_location || '%')
    ORDER BY score DESC
    LIMIT 100
  ),
  rrf_scores AS (
    SELECT
      COALESCE(v.id, f.id) AS id,
      COALESCE(1.0 / (60 + ROW_NUMBER() OVER (ORDER BY v.score DESC)), 0) +
      COALESCE(1.0 / (60 + ROW_NUMBER() OVER (ORDER BY f.score DESC)), 0) AS combined_score
    FROM vector_search v
    FULL OUTER JOIN fts_search f ON v.id = f.id
  )
  SELECT
    e.id,
    e.title,
    e.description,
    e.category_slug,
    e.location,
    e.experience_date,
    e.tags,
    e.attributes,
    rrf.combined_score AS similarity_score
  FROM rrf_scores rrf
  JOIN experiences e ON rrf.id = e.id
  ORDER BY rrf.combined_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 Usage Examples

### Simple Search

```typescript
const results = await searchExperiencesTool.execute({
  category: 'dreams',
  tags: ['ufo'],
  maxResults: 10
})
```

### Semantic Search

```typescript
const results = await searchExperiencesTool.execute({
  naturalQuery: 'strange lights in the night sky',
  category: 'ufo-uap',
  maxResults: 15
})
```

### Attribute-Based Search

```typescript
const results = await searchExperiencesTool.execute({
  category: 'ufo-uap',
  attributes: {
    include: {
      shape: ['triangle'],
      sound: ['silent'],
      light_color: ['red']
    },
    exclude: {
      surface: ['metallic']
    }
  },
  maxResults: 20
})
```

### Similarity Search

```typescript
const results = await searchExperiencesTool.execute({
  similarTo: 'exp-123', // Find experiences similar to this one
  maxResults: 10
})
```

## ✅ Success Criteria

- [ ] Returns results in < 500ms (with indexes)
- [ ] Properly combines vector + FTS results (RRF)
- [ ] Supports all filter types (category, tags, location, dates, attributes)
- [ ] Handles errors gracefully
- [ ] Returns truncated descriptions (cost optimization)
- [ ] Type-safe with Zod schema

## 🚨 Common Issues

**Issue:** Slow queries (> 1s)
**Solution:** Ensure indexes exist:
```sql
CREATE INDEX idx_experiences_embedding ON experiences USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_experiences_fts ON experiences USING gin(tsv);
CREATE INDEX idx_experiences_category ON experiences(category_slug);
```

**Issue:** Empty results for valid queries
**Solution:** Check embedding generation and FTS query format

---

**Next:** [Tool 2: Detect Patterns](./tool-2-patterns.md)
