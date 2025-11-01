# 14. Pattern Detection - Algorithmen & Statistical Methods

**Status:** Ready to Implement
**Version:** 3.0
**Created:** 2025-10-26

---

## 🎯 Überblick

Pattern Detection ist das **Herzstück** der Discovery Experience. Es geht NICHT darum, User mit Statistiken zu bombardieren, sondern **echte Insights** zu finden die helfen:

1. **Ähnliche Erlebnisse** zu entdecken (andere hatten das Gleiche!)
2. **Zeitliche Muster** zu erkennen (häuft sich im Frühling?)
3. **Geografische Cluster** zu finden (Hotspots entdecken)
4. **Semantische Themes** zu identifizieren (worüber reden Menschen wirklich?)
5. **Cross-Category Correlations** zu zeigen (UFOs + Elektrik = Pattern?)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Pattern Detection Engine                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Temporal Patterns   → Timeline Clusters        │
│  2. Geographic Patterns → Map Hotspots             │
│  3. Semantic Patterns   → Topic Themes             │
│  4. Correlation Patterns→ Cross-Category Links     │
│  5. Similarity Patterns → Similar Experiences      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 1. Temporal Pattern Detection

### Problem
User fragt: "Gibt es mehr UFO-Sichtungen im Sommer?"

### Algorithmen

#### 1.1 Time Series Clustering (DBSCAN)

**Was:** Gruppiert Erlebnisse nach zeitlicher Nähe

**Wann verwenden:**
- Query nach zeitlichen Mustern
- "Gibt es Häufungen?"
- Zeitbasierte Visualisierungen

**Implementation:**

```typescript
// lib/patterns/temporal-detector.ts

interface TemporalCluster {
  cluster_id: number;
  start_date: Date;
  end_date: Date;
  experience_count: number;
  experiences: string[]; // experience IDs
  confidence: number; // 0-1
}

export async function detectTemporalClusters(
  category: string,
  minClusterSize: number = 3,
  timeWindowDays: number = 30
): Promise<TemporalCluster[]> {

  // 1. Fetch experiences with dates
  const { data: experiences } = await supabase
    .from('experiences')
    .select('id, occurred_at')
    .eq('category', category)
    .not('occurred_at', 'is', null)
    .order('occurred_at');

  if (!experiences || experiences.length < minClusterSize) {
    return [];
  }

  // 2. Convert to timestamps for DBSCAN
  const timestamps = experiences.map(e =>
    new Date(e.occurred_at).getTime() / (1000 * 60 * 60 * 24) // days since epoch
  );

  // 3. Apply DBSCAN (epsilon = timeWindowDays)
  const clusters = dbscan(timestamps, timeWindowDays, minClusterSize);

  // 4. Format results
  return clusters.map((cluster, idx) => {
    const clusterExperiences = cluster.map(i => experiences[i]);
    const dates = clusterExperiences.map(e => new Date(e.occurred_at));

    return {
      cluster_id: idx,
      start_date: new Date(Math.min(...dates.map(d => d.getTime()))),
      end_date: new Date(Math.max(...dates.map(d => d.getTime()))),
      experience_count: cluster.length,
      experiences: clusterExperiences.map(e => e.id),
      confidence: calculateTemporalConfidence(cluster.length, experiences.length)
    };
  });
}

function calculateTemporalConfidence(clusterSize: number, totalSize: number): number {
  // Higher confidence if cluster is significant portion of total
  const proportion = clusterSize / totalSize;

  // Statistical significance (chi-square test)
  // Expected: uniform distribution
  const expected = totalSize / 12; // roughly per month
  const chiSquare = Math.pow(clusterSize - expected, 2) / expected;

  // Convert to 0-1 confidence (chi-square > 3.84 = p < 0.05)
  return Math.min(1, chiSquare / 10);
}
```

#### 1.2 Seasonal Analysis

**Was:** Identifiziert saisonale Muster (Frühling/Sommer/Herbst/Winter)

```typescript
export async function detectSeasonalPatterns(
  category: string
): Promise<SeasonalPattern[]> {

  const { data } = await supabase.rpc('analyze_seasonal_distribution', {
    p_category: category
  });

  return data.map(season => ({
    season: season.season_name,
    count: season.experience_count,
    percentage: season.percentage,
    isSignificant: season.p_value < 0.05, // chi-square test
    topLocations: season.top_locations
  }));
}
```

**SQL Function:**

```sql
-- migrations/add_seasonal_analysis.sql

CREATE OR REPLACE FUNCTION analyze_seasonal_distribution(
  p_category TEXT
)
RETURNS TABLE(
  season_name TEXT,
  experience_count INT,
  percentage NUMERIC,
  p_value NUMERIC,
  top_locations TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH seasonal_counts AS (
    SELECT
      CASE
        WHEN EXTRACT(MONTH FROM occurred_at) IN (3,4,5) THEN 'Spring'
        WHEN EXTRACT(MONTH FROM occurred_at) IN (6,7,8) THEN 'Summer'
        WHEN EXTRACT(MONTH FROM occurred_at) IN (9,10,11) THEN 'Fall'
        ELSE 'Winter'
      END AS season,
      COUNT(*) AS count,
      ARRAY_AGG(DISTINCT location_name) AS locations
    FROM experiences
    WHERE category = p_category
      AND occurred_at IS NOT NULL
    GROUP BY season
  ),
  total AS (
    SELECT SUM(count) AS total_count FROM seasonal_counts
  )
  SELECT
    sc.season::TEXT,
    sc.count::INT,
    ROUND((sc.count::NUMERIC / t.total_count) * 100, 2) AS percentage,
    -- Chi-square test for uniformity
    power(
      (sc.count - (t.total_count / 4.0)) / SQRT(t.total_count / 4.0),
      2
    ) AS p_value,
    sc.locations[1:5] AS top_locations
  FROM seasonal_counts sc, total t
  ORDER BY sc.count DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 🗺️ 2. Geographic Pattern Detection

### Problem
User fragt: "Wo gibt es die meisten Sichtungen?"

### Algorithmen

#### 2.1 Spatial Clustering (PostGIS ST_ClusterDBSCAN)

**Was:** Findet geografische Hotspots

```typescript
// lib/patterns/geographic-detector.ts

interface GeoCluster {
  cluster_id: number;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  experience_count: number;
  experiences: string[];
  density: number; // experiences per km²
}

export async function detectGeographicClusters(
  category?: string,
  minClusterSize: number = 5,
  radiusKm: number = 50
): Promise<GeoCluster[]> {

  const { data } = await supabase.rpc('find_geographic_clusters', {
    p_category: category,
    p_min_size: minClusterSize,
    p_radius_meters: radiusKm * 1000
  });

  return data.map(cluster => ({
    cluster_id: cluster.cluster_id,
    center_lat: cluster.center_lat,
    center_lng: cluster.center_lng,
    radius_km: cluster.radius_km,
    experience_count: cluster.count,
    experiences: cluster.experience_ids,
    density: cluster.density
  }));
}
```

**SQL Function:**

```sql
-- migrations/add_geographic_clustering.sql

-- Enable PostGIS if not already
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE OR REPLACE FUNCTION find_geographic_clusters(
  p_category TEXT DEFAULT NULL,
  p_min_size INT DEFAULT 5,
  p_radius_meters NUMERIC DEFAULT 50000
)
RETURNS TABLE(
  cluster_id INT,
  center_lat NUMERIC,
  center_lng NUMERIC,
  radius_km NUMERIC,
  count INT,
  experience_ids TEXT[],
  density NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH clustered AS (
    SELECT
      e.id,
      e.category,
      ST_ClusterDBSCAN(
        ST_SetSRID(ST_MakePoint(e.location_lng, e.location_lat), 4326)::geometry,
        eps := p_radius_meters,
        minpoints := p_min_size
      ) OVER () AS cluster_id,
      e.location_lat,
      e.location_lng
    FROM experiences e
    WHERE e.location_lat IS NOT NULL
      AND e.location_lng IS NOT NULL
      AND (p_category IS NULL OR e.category = p_category)
  ),
  cluster_stats AS (
    SELECT
      c.cluster_id,
      COUNT(*) AS exp_count,
      AVG(c.location_lat) AS center_lat,
      AVG(c.location_lng) AS center_lng,
      ARRAY_AGG(c.id) AS exp_ids,
      -- Calculate actual radius (max distance from center)
      MAX(
        ST_Distance(
          ST_SetSRID(ST_MakePoint(c.location_lng, c.location_lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(AVG(c.location_lng), AVG(c.location_lat)), 4326)::geography
        )
      ) / 1000.0 AS radius_km
    FROM clustered c
    WHERE c.cluster_id IS NOT NULL
    GROUP BY c.cluster_id
    HAVING COUNT(*) >= p_min_size
  )
  SELECT
    cs.cluster_id::INT,
    cs.center_lat::NUMERIC,
    cs.center_lng::NUMERIC,
    cs.radius_km::NUMERIC,
    cs.exp_count::INT,
    cs.exp_ids,
    -- Density: experiences per km²
    (cs.exp_count / (PI() * POWER(cs.radius_km, 2)))::NUMERIC AS density
  FROM cluster_stats cs
  ORDER BY cs.exp_count DESC;
END;
$$ LANGUAGE plpgsql;
```

#### 2.2 H3 Hexagon Grid Analysis

**Was:** Verwendet Uber's H3 für gleichmäßige geografische Aggregation

```typescript
// lib/patterns/h3-analyzer.ts
import { latLngToCell, cellToBoundary } from 'h3-js';

interface H3Hotspot {
  h3_index: string;
  lat: number;
  lng: number;
  count: number;
  boundary: [number, number][]; // polygon for map display
}

export async function detectH3Hotspots(
  resolution: number = 6, // ~36km² hexagons
  category?: string,
  minCount: number = 3
): Promise<H3Hotspot[]> {

  // 1. Fetch all experiences with locations
  let query = supabase
    .from('experiences')
    .select('id, location_lat, location_lng')
    .not('location_lat', 'is', null);

  if (category) query = query.eq('category', category);

  const { data: experiences } = await query;

  // 2. Convert to H3 indices
  const h3Counts = new Map<string, number>();

  experiences?.forEach(exp => {
    const h3Index = latLngToCell(exp.location_lat, exp.location_lng, resolution);
    h3Counts.set(h3Index, (h3Counts.get(h3Index) || 0) + 1);
  });

  // 3. Filter by minimum count & format
  const hotspots: H3Hotspot[] = [];

  h3Counts.forEach((count, h3Index) => {
    if (count >= minCount) {
      const boundary = cellToBoundary(h3Index);
      const center = boundary.reduce(
        (acc, [lat, lng]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
        { lat: 0, lng: 0 }
      );

      hotspots.push({
        h3_index: h3Index,
        lat: center.lat / boundary.length,
        lng: center.lng / boundary.length,
        count,
        boundary
      });
    }
  });

  return hotspots.sort((a, b) => b.count - a.count);
}
```

---

## 🧠 3. Semantic Pattern Detection

### Problem
User fragt: "Worüber reden Menschen, wenn sie über UFOs sprechen?"

### Algorithmen

#### 3.1 Embedding Clustering (KMeans)

**Was:** Gruppiert Erlebnisse nach semantischer Ähnlichkeit

```typescript
// lib/patterns/semantic-detector.ts
import { createClient } from '@supabase/supabase-js';
import kmeans from 'ml-kmeans';

interface SemanticTheme {
  theme_id: number;
  representative_text: string;
  experience_count: number;
  experiences: string[];
  keywords: string[];
  avg_similarity: number;
}

export async function detectSemanticThemes(
  category: string,
  numThemes: number = 5
): Promise<SemanticTheme[]> {

  // 1. Fetch experiences with embeddings
  const { data: experiences } = await supabase
    .from('experiences')
    .select('id, title, description, embedding')
    .eq('category', category)
    .not('embedding', 'is', null);

  if (!experiences || experiences.length < numThemes * 2) {
    return [];
  }

  // 2. Extract embeddings as vectors
  const vectors = experiences.map(e => e.embedding);

  // 3. Apply KMeans clustering
  const result = kmeans(vectors, numThemes, {
    initialization: 'kmeans++',
    maxIterations: 100
  });

  // 4. Group experiences by cluster
  const themes: SemanticTheme[] = result.clusters.map((clusterIdx, themeId) => {
    const clusterExperiences = experiences.filter((_, i) => result.clusters[i] === themeId);

    // Find most central (representative) experience
    const centroid = result.centroids[themeId];
    const representative = clusterExperiences.reduce((best, exp) => {
      const similarity = cosineSimilarity(exp.embedding, centroid);
      return similarity > best.similarity ? { exp, similarity } : best;
    }, { exp: clusterExperiences[0], similarity: -1 });

    return {
      theme_id: themeId,
      representative_text: representative.exp.title,
      experience_count: clusterExperiences.length,
      experiences: clusterExperiences.map(e => e.id),
      keywords: extractKeywords(clusterExperiences),
      avg_similarity: representative.similarity
    };
  });

  return themes.sort((a, b) => b.experience_count - a.experience_count);
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

function extractKeywords(experiences: any[]): string[] {
  // Simple TF-IDF-style keyword extraction
  const words = new Map<string, number>();

  experiences.forEach(exp => {
    const text = `${exp.title} ${exp.description}`.toLowerCase();
    const tokens = text.match(/\b\w{4,}\b/g) || [];
    tokens.forEach(word => {
      if (!STOP_WORDS.has(word)) {
        words.set(word, (words.get(word) || 0) + 1);
      }
    });
  });

  return Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

const STOP_WORDS = new Set(['the', 'and', 'was', 'that', 'this', 'with', 'from', 'have', 'been', 'very']);
```

#### 3.2 LDA Topic Modeling (Optional - Advanced)

**Was:** Identifiziert latente Topics in Texten

**Wann verwenden:**
- Bei sehr großen Datensätzen (>1000 Erlebnisse)
- Wenn Themes nicht durch Embedding-Clustering erkannt werden
- Für Research/Admin Dashboards

```typescript
// lib/patterns/lda-detector.ts
import lda from 'lda';

export async function detectTopicsLDA(
  category: string,
  numTopics: number = 5,
  topWordsPerTopic: number = 10
): Promise<Topic[]> {

  const { data: experiences } = await supabase
    .from('experiences')
    .select('id, title, description')
    .eq('category', category);

  // Prepare documents
  const documents = experiences.map(e =>
    `${e.title} ${e.description}`.toLowerCase()
  );

  // Run LDA
  const result = lda(documents, numTopics, topWordsPerTopic);

  return result.map((topic, idx) => ({
    topic_id: idx,
    words: topic.map(t => t.term),
    weights: topic.map(t => t.probability)
  }));
}
```

---

## 🔗 4. Correlation Pattern Detection

### Problem
User fragt: "Gibt es einen Zusammenhang zwischen UFO-Sichtungen und Elektrik-Problemen?"

### Algorithmus: Cross-Category Correlation

```typescript
// lib/patterns/correlation-detector.ts

interface CategoryCorrelation {
  category_a: string;
  category_b: string;
  correlation_score: number; // 0-1
  confidence: number; // p-value < 0.05
  shared_locations: number;
  temporal_overlap: number; // days
  examples: string[]; // experience IDs
}

export async function detectCategoryCorrelations(
  categoryA: string,
  categoryB: string,
  timeWindowDays: number = 7,
  distanceKm: number = 50
): Promise<CategoryCorrelation | null> {

  const { data } = await supabase.rpc('find_category_correlation', {
    p_category_a: categoryA,
    p_category_b: categoryB,
    p_time_window_days: timeWindowDays,
    p_distance_meters: distanceKm * 1000
  });

  if (!data || data.correlation_count < 3) return null;

  // Calculate correlation strength
  const totalA = data.total_category_a;
  const totalB = data.total_category_b;
  const correlated = data.correlation_count;

  // Bayesian correlation score
  const priorA = totalA / (totalA + totalB);
  const priorB = totalB / (totalA + totalB);
  const expected = priorA * priorB * (totalA + totalB);
  const score = Math.min(1, correlated / expected);

  // Chi-square test for significance
  const chiSquare = Math.pow(correlated - expected, 2) / expected;
  const pValue = 1 - chiSquareCDF(chiSquare, 1);

  return {
    category_a: categoryA,
    category_b: categoryB,
    correlation_score: score,
    confidence: pValue < 0.05 ? 1 - pValue : 0,
    shared_locations: data.shared_locations,
    temporal_overlap: data.avg_time_diff_days,
    examples: data.example_pairs
  };
}
```

**SQL Function:**

```sql
CREATE OR REPLACE FUNCTION find_category_correlation(
  p_category_a TEXT,
  p_category_b TEXT,
  p_time_window_days INT DEFAULT 7,
  p_distance_meters NUMERIC DEFAULT 50000
)
RETURNS TABLE(
  correlation_count INT,
  total_category_a INT,
  total_category_b INT,
  shared_locations INT,
  avg_time_diff_days NUMERIC,
  example_pairs TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH category_a AS (
    SELECT id, location_lat, location_lng, occurred_at
    FROM experiences
    WHERE category = p_category_a
      AND location_lat IS NOT NULL
      AND occurred_at IS NOT NULL
  ),
  category_b AS (
    SELECT id, location_lat, location_lng, occurred_at
    FROM experiences
    WHERE category = p_category_b
      AND location_lat IS NOT NULL
      AND occurred_at IS NOT NULL
  ),
  correlations AS (
    SELECT
      a.id AS id_a,
      b.id AS id_b,
      ABS(EXTRACT(EPOCH FROM (a.occurred_at - b.occurred_at)) / 86400) AS days_diff,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(a.location_lng, a.location_lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(b.location_lng, b.location_lat), 4326)::geography
      ) / 1000.0 AS distance_km
    FROM category_a a
    CROSS JOIN category_b b
    WHERE ABS(EXTRACT(EPOCH FROM (a.occurred_at - b.occurred_at)) / 86400) <= p_time_window_days
      AND ST_Distance(
        ST_SetSRID(ST_MakePoint(a.location_lng, a.location_lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(b.location_lng, b.location_lat), 4326)::geography
      ) <= p_distance_meters
  )
  SELECT
    COUNT(*)::INT AS correlation_count,
    (SELECT COUNT(*)::INT FROM category_a) AS total_category_a,
    (SELECT COUNT(*)::INT FROM category_b) AS total_category_b,
    COUNT(DISTINCT (c.id_a || c.id_b))::INT AS shared_locations,
    AVG(c.days_diff)::NUMERIC AS avg_time_diff_days,
    ARRAY_AGG(c.id_a || ',' || c.id_b) AS example_pairs
  FROM correlations c;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 5. Similarity Pattern Detection (Multi-Tiered)

### Problem
"Finde ähnliche Erlebnisse" - aber WIE ähnlich?

### Multi-Tiered Approach

```typescript
// lib/patterns/similarity-detector.ts

interface SimilarityTier {
  tier: 'auto-similar' | 'auto-related' | 'llm-analysis' | 'temporal';
  threshold: number;
  description: string;
}

const SIMILARITY_TIERS: SimilarityTier[] = [
  { tier: 'auto-similar', threshold: 0.85, description: 'Fast identisch' },
  { tier: 'auto-related', threshold: 0.70, description: 'Stark verwandt' },
  { tier: 'llm-analysis', threshold: 0.50, description: 'Semantisch verbunden' },
  { tier: 'temporal', threshold: 0.0, description: 'Zeitlich/Geografisch nah' }
];

export async function findSimilarExperiences(
  experienceId: string,
  limit: number = 20
): Promise<SimilarExperience[]> {

  // 1. Get source experience with embedding
  const { data: source } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', experienceId)
    .single();

  if (!source) return [];

  // 2. Vector search for similar embeddings
  const { data: vectorMatches } = await supabase.rpc('match_experiences', {
    query_embedding: source.embedding,
    match_threshold: 0.5, // Include tier 3
    match_count: limit * 2
  });

  // 3. Temporal/Geographic nearby (even if embedding similarity low)
  const { data: temporalMatches } = await supabase.rpc('find_nearby_experiences', {
    p_experience_id: experienceId,
    p_time_window_days: 30,
    p_distance_km: 100,
    p_limit: 10
  });

  // 4. Combine & tier
  const allMatches = new Map<string, any>();

  vectorMatches?.forEach(match => {
    allMatches.set(match.id, {
      ...match,
      tier: getTier(match.similarity),
      similarity: match.similarity
    });
  });

  temporalMatches?.forEach(match => {
    if (!allMatches.has(match.id)) {
      allMatches.set(match.id, {
        ...match,
        tier: 'temporal',
        similarity: 0.3 // Lower than semantic matches
      });
    }
  });

  // 5. For tier 3 (LLM analysis), run Claude Sonnet
  const tier3Matches = Array.from(allMatches.values())
    .filter(m => m.tier === 'llm-analysis');

  if (tier3Matches.length > 0) {
    const llmAnalyzed = await analyzeSimilarityWithLLM(source, tier3Matches);
    llmAnalyzed.forEach(result => {
      if (allMatches.has(result.id)) {
        allMatches.set(result.id, {
          ...allMatches.get(result.id),
          llm_reason: result.reason,
          llm_confidence: result.confidence
        });
      }
    });
  }

  // 6. Sort by similarity & tier
  return Array.from(allMatches.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function getTier(similarity: number): SimilarityTier['tier'] {
  if (similarity >= 0.85) return 'auto-similar';
  if (similarity >= 0.70) return 'auto-related';
  return 'llm-analysis';
}

async function analyzeSimilarityWithLLM(
  source: any,
  candidates: any[]
): Promise<{ id: string; reason: string; confidence: number }[]> {

  const prompt = `Given this experience:

${source.title}
${source.description}

Analyze why these might be related:

${candidates.map((c, i) => `${i + 1}. ${c.title}\n${c.description}`).join('\n\n')}

For each, provide:
- reason (1 sentence)
- confidence (0-1)`;

  const response = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt,
    temperature: 0
  });

  // Parse structured output
  return parseJSON(response.text);
}
```

**SQL Function for Temporal/Geographic Nearby:**

```sql
CREATE OR REPLACE FUNCTION find_nearby_experiences(
  p_experience_id UUID,
  p_time_window_days INT DEFAULT 30,
  p_distance_km NUMERIC DEFAULT 100,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  category TEXT,
  days_diff NUMERIC,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH source AS (
    SELECT location_lat, location_lng, occurred_at, category
    FROM experiences
    WHERE id = p_experience_id
  )
  SELECT
    e.id,
    e.title,
    e.category,
    ABS(EXTRACT(EPOCH FROM (e.occurred_at - s.occurred_at)) / 86400)::NUMERIC AS days_diff,
    (ST_Distance(
      ST_SetSRID(ST_MakePoint(e.location_lng, e.location_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(s.location_lng, s.location_lat), 4326)::geography
    ) / 1000.0)::NUMERIC AS distance_km
  FROM experiences e, source s
  WHERE e.id != p_experience_id
    AND e.location_lat IS NOT NULL
    AND ABS(EXTRACT(EPOCH FROM (e.occurred_at - s.occurred_at)) / 86400) <= p_time_window_days
    AND ST_Distance(
      ST_SetSRID(ST_MakePoint(e.location_lng, e.location_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(s.location_lng, s.location_lat), 4326)::geography
    ) / 1000.0 <= p_distance_km
  ORDER BY
    -- Prioritize same category
    CASE WHEN e.category = s.category THEN 0 ELSE 1 END,
    -- Then by temporal proximity
    ABS(EXTRACT(EPOCH FROM (e.occurred_at - s.occurred_at)) / 86400) ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 6. Statistical Significance Testing

### Problem
"Ist das Pattern ECHT oder Zufall?"

### Chi-Square Test Implementation

```typescript
// lib/patterns/statistical-tests.ts

export function chiSquareTest(
  observed: number[],
  expected: number[]
): { chiSquare: number; pValue: number; isSignificant: boolean } {

  if (observed.length !== expected.length) {
    throw new Error('Arrays must have same length');
  }

  // Calculate chi-square statistic
  const chiSquare = observed.reduce((sum, obs, i) => {
    const exp = expected[i];
    if (exp === 0) return sum;
    return sum + Math.pow(obs - exp, 2) / exp;
  }, 0);

  // Degrees of freedom
  const df = observed.length - 1;

  // Calculate p-value (approximate)
  const pValue = 1 - chiSquareCDF(chiSquare, df);

  return {
    chiSquare,
    pValue,
    isSignificant: pValue < 0.05 // 95% confidence
  };
}

// Chi-square cumulative distribution function (approximation)
function chiSquareCDF(x: number, df: number): number {
  // Simplified Wilson-Hilferty approximation
  if (x <= 0) return 0;
  if (df === 1) return Math.sqrt(2 / Math.PI) * Math.sqrt(x) * Math.exp(-x / 2);

  const z = Math.pow(x / df, 1/3) - (1 - 2/(9*df)) / Math.sqrt(2/(9*df));
  return standardNormalCDF(z);
}

function standardNormalCDF(z: number): number {
  // Approximation of standard normal CDF
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}
```

### Correlation Coefficient (Pearson's r)

```typescript
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Arrays must have same length');

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return numerator / denominator;
}
```

---

## 🎨 7. Visualization Mapping

**Welcher Pattern → Welche Visualization?**

```typescript
// lib/patterns/visualization-mapper.ts

export function getVisualizationForPattern(
  patternType: 'temporal' | 'geographic' | 'semantic' | 'correlation' | 'similarity'
): VisualizationType {

  const mapping = {
    temporal: 'timeline',
    geographic: 'map',
    semantic: 'network',
    correlation: 'comparison',
    similarity: 'card-grid'
  };

  return mapping[patternType];
}

export function formatPatternForVisualization(
  pattern: any,
  type: 'temporal' | 'geographic' | 'semantic' | 'correlation'
): VisualizationData {

  switch (type) {
    case 'temporal':
      return {
        type: 'timeline',
        data: pattern.clusters.map(c => ({
          date: c.start_date,
          count: c.experience_count,
          label: `${c.experience_count} Erlebnisse`,
          experiences: c.experiences
        }))
      };

    case 'geographic':
      return {
        type: 'map',
        data: pattern.clusters.map(c => ({
          lat: c.center_lat,
          lng: c.center_lng,
          radius: c.radius_km,
          count: c.experience_count,
          label: `${c.experience_count} Erlebnisse`
        }))
      };

    case 'semantic':
      return {
        type: 'network',
        nodes: pattern.themes.map(t => ({
          id: t.theme_id,
          label: t.representative_text,
          size: t.experience_count,
          keywords: t.keywords
        })),
        edges: [] // Calculate similarity between themes
      };

    case 'correlation':
      return {
        type: 'comparison',
        data: {
          categoryA: pattern.category_a,
          categoryB: pattern.category_b,
          score: pattern.correlation_score,
          confidence: pattern.confidence,
          examples: pattern.examples
        }
      };
  }
}
```

---

## 🔧 Integration with `discoverPatterns` Tool

```typescript
// app/api/chat/tools/discover-patterns.ts

export const discoverPatternsToolDefinition = {
  name: 'discoverPatterns',
  description: 'Identifies patterns in experience data (temporal, geographic, semantic, correlations)',
  parameters: z.object({
    patternType: z.enum(['temporal', 'geographic', 'semantic', 'correlation', 'all']),
    category: z.string().optional(),
    correlateWith: z.string().optional(),
    minConfidence: z.number().min(0).max(1).default(0.7)
  })
};

export async function executeDiscoverPatterns(params: {
  patternType: string;
  category?: string;
  correlateWith?: string;
  minConfidence: number;
}) {

  const results: any = {};

  if (params.patternType === 'temporal' || params.patternType === 'all') {
    results.temporal = await detectTemporalClusters(params.category || 'ufo', 3, 30);
    results.seasonal = await detectSeasonalPatterns(params.category || 'ufo');
  }

  if (params.patternType === 'geographic' || params.patternType === 'all') {
    results.geographic = await detectGeographicClusters(params.category, 5, 50);
    results.h3Hotspots = await detectH3Hotspots(6, params.category, 3);
  }

  if (params.patternType === 'semantic' || params.patternType === 'all') {
    results.semantic = await detectSemanticThemes(params.category || 'ufo', 5);
  }

  if (params.patternType === 'correlation') {
    if (!params.correlateWith) {
      throw new Error('correlateWith required for correlation analysis');
    }
    results.correlation = await detectCategoryCorrelations(
      params.category || 'ufo',
      params.correlateWith,
      7,
      50
    );
  }

  // Filter by confidence
  Object.keys(results).forEach(key => {
    if (Array.isArray(results[key])) {
      results[key] = results[key].filter((item: any) =>
        (item.confidence || 1) >= params.minConfidence
      );
    }
  });

  return {
    patterns: results,
    visualization: getVisualizationForPattern(params.patternType)
  };
}
```

---

## 📈 Performance Optimization

### Caching Strategy

```typescript
// lib/patterns/pattern-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedPattern<T>(
  key: string,
  ttlSeconds: number,
  computeFn: () => Promise<T>
): Promise<T> {

  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Compute
  const result = await computeFn();

  // Cache for next time
  await redis.setex(key, ttlSeconds, JSON.stringify(result));

  return result;
}

// Usage example:
export async function detectTemporalClustersCached(category: string) {
  const cacheKey = `patterns:temporal:${category}`;
  const ttl = 60 * 60; // 1 hour

  return getCachedPattern(
    cacheKey,
    ttl,
    () => detectTemporalClusters(category)
  );
}
```

### Batch Processing for Large Datasets

```typescript
export async function detectPatternsInBatch(
  experienceIds: string[],
  batchSize: number = 100
): Promise<Map<string, Pattern[]>> {

  const results = new Map<string, Pattern[]>();

  for (let i = 0; i < experienceIds.length; i += batchSize) {
    const batch = experienceIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(id => findSimilarExperiences(id, 10))
    );

    batch.forEach((id, idx) => {
      results.set(id, batchResults[idx]);
    });
  }

  return results;
}
```

---

## ✅ Success Metrics

**Wie messen wir Erfolg?**

1. **Pattern Discovery Rate**
   - Target: >60% der Queries finden mindestens 1 Pattern
   - Measurement: Track in analytics

2. **Pattern Confidence**
   - Target: Avg confidence >0.75
   - Measurement: Statistical tests

3. **User Engagement**
   - Target: >40% Pattern click-through rate
   - Measurement: Click tracking

4. **Response Time**
   - Target: <3s for pattern detection
   - Measurement: Performance monitoring

5. **False Positive Rate**
   - Target: <10% user reports "not relevant"
   - Measurement: Feedback buttons

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] SQL Functions (clustering, correlation)
- [ ] Temporal detection (DBSCAN, seasonal)
- [ ] Geographic detection (PostGIS, H3)
- [ ] Basic statistical tests

### Phase 2: Advanced (Week 3-4)
- [ ] Semantic clustering (KMeans)
- [ ] Multi-tiered similarity
- [ ] LLM analysis integration
- [ ] Visualization mapping

### Phase 3: Optimization (Week 5-6)
- [ ] Caching layer (Redis)
- [ ] Batch processing
- [ ] Performance monitoring
- [ ] A/B testing framework

### Phase 4: Production (Week 7-8)
- [ ] User feedback loop
- [ ] Analytics dashboard
- [ ] Documentation
- [ ] Success metrics tracking

---

## 📚 Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "h3-js": "^4.1.0",
    "ml-kmeans": "^6.0.0",
    "lda": "^2.0.2"
  }
}
```

**PostGIS Extension:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 📝 Notes & Learnings

### What Makes Pattern Detection Work:

1. **Statistical Rigor** - Immer p-values checken
2. **Multi-Modal Approach** - Embedding + Geo + Time = besser als einzeln
3. **Confidence Thresholds** - Lieber zu vorsichtig als zu viele False Positives
4. **Caching** - Pattern ändern sich selten, cache aggressiv
5. **Visualization** - Pattern sind nur gut wenn User sie SIEHT

### Common Pitfalls:

- ❌ Zu kleine Datensätze (<30 Experiences) → keine statistisch signifikanten Patterns
- ❌ Zu viele Patterns auf einmal → User Overwhelm
- ❌ Keine Confidence Scores → User vertrauen nicht
- ❌ Keine Explanation → "Warum ist das ein Pattern?"

---

**Ready für Implementation? → [TODO-MASTER.md](./TODO-MASTER.md) Phase 4-6**
