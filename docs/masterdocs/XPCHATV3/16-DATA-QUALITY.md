# 16. Data Quality - Validation, Parsing & Scoring

**Status:** Ready to Implement
**Version:** 3.0
**Created:** 2025-10-26

---

## 🎯 Überblick

Data Quality ist **KRITISCH**, weil:

1. **Garbage In = Garbage Out**: Schlechte Daten → Schlechte Discovery
2. **Trust**: User müssen Ergebnissen vertrauen können
3. **Spam Prevention**: Bot-Schutz ohne User zu nerven
4. **Search Performance**: Bessere Daten = Bessere Vector Search

**Anti-Pattern:** "We'll clean data later" → NO! Quality ist JETZT!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Data Quality Pipeline                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Step 1: Input Validation    → Basic checks        │
│  Step 2: Data Parsing        → NLP extraction      │
│  Step 3: Geocoding           → Lat/Lng lookup      │
│  Step 4: Date Normalization  → ISO timestamps      │
│  Step 5: Quality Scoring     → 0-100 score         │
│  Step 6: Spam Detection      → Block/Flag          │
│  Step 7: Enrichment          → Add metadata        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 1. Input Validation

### Schema Validation (Zod)

```typescript
// lib/validation/experience-schema.ts
import { z } from 'zod';

export const ExperienceSubmissionSchema = z.object({
  title: z.string()
    .min(10, 'Title zu kurz (min. 10 Zeichen)')
    .max(200, 'Title zu lang (max. 200 Zeichen)'),

  description: z.string()
    .min(50, 'Description zu kurz (min. 50 Zeichen)')
    .max(5000, 'Description zu lang (max. 5000 Zeichen)'),

  category: z.enum([
    'ufo', 'paranormal', 'mystisch', 'traum',
    'nde', 'oobe', 'synchronizität', 'heilung',
    'elektrik', 'telepathie', 'präkognition', 'andere'
  ]),

  occurred_at: z.union([
    z.string(),
    z.date()
  ]).optional().nullable(),

  location_name: z.string()
    .max(200, 'Location name zu lang')
    .optional().nullable(),

  location_lat: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional().nullable(),

  location_lng: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional().nullable(),

  witnesses: z.number()
    .int('Witnesses muss ganzzahlig sein')
    .min(0, 'Witnesses kann nicht negativ sein')
    .max(1000, 'Unglaubwürdig viele Witnesses')
    .default(0),

  media_urls: z.array(z.string().url('Invalid URL'))
    .max(10, 'Zu viele Media-Files (max. 10)')
    .default([]),

  is_private: z.boolean().default(false)
});

export type ExperienceSubmission = z.infer<typeof ExperienceSubmissionSchema>;

// Validation function
export function validateExperienceSubmission(data: unknown): {
  valid: boolean;
  data?: ExperienceSubmission;
  errors?: z.ZodError;
} {
  try {
    const validated = ExperienceSubmissionSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}
```

---

## 2. Natural Language Date Parsing

### Problem
User sagt: "gestern Nacht", "vor 3 Wochen", "Sommer 2020"

### Solution: Smart Date Parser

```typescript
// lib/validation/date-parser.ts
import { parse, subDays, subWeeks, subMonths, subYears, setMonth } from 'date-fns';
import { de } from 'date-fns/locale';

interface ParsedDate {
  date: Date;
  confidence: number; // 0-1
  granularity: 'exact' | 'day' | 'month' | 'year' | 'season';
  source: string;
}

const PATTERNS = {
  // Relative dates
  yesterday: /gestern|yesterday/i,
  daysAgo: /vor (\d+) tag(en)?|(\d+) days? ago/i,
  weeksAgo: /vor (\d+) woche(n)?|(\d+) weeks? ago/i,
  monthsAgo: /vor (\d+) monat(en)?|(\d+) months? ago/i,
  yearsAgo: /vor (\d+) jahr(en)?|(\d+) years? ago/i,

  // Seasons
  spring: /frühling|frühjahr|spring/i,
  summer: /sommer|summer/i,
  fall: /herbst|fall|autumn/i,
  winter: /winter/i,

  // Specific dates
  isoDate: /\d{4}-\d{2}-\d{2}/,
  germanDate: /\d{1,2}\.\d{1,2}\.\d{4}/,
  monthYear: /(jan|feb|mär|apr|mai|jun|jul|aug|sep|okt|nov|dez)[a-z]*\s+\d{4}/i
};

export function parseNaturalLanguageDate(input: string): ParsedDate | null {
  const normalized = input.toLowerCase().trim();

  // 1. ISO Date (highest confidence)
  if (PATTERNS.isoDate.test(input)) {
    const date = parse(input, 'yyyy-MM-dd', new Date());
    if (isValid(date)) {
      return {
        date,
        confidence: 1.0,
        granularity: 'exact',
        source: input
      };
    }
  }

  // 2. German Date (DD.MM.YYYY)
  if (PATTERNS.germanDate.test(input)) {
    const date = parse(input, 'dd.MM.yyyy', new Date(), { locale: de });
    if (isValid(date)) {
      return {
        date,
        confidence: 1.0,
        granularity: 'exact',
        source: input
      };
    }
  }

  // 3. Relative dates
  if (PATTERNS.yesterday.test(normalized)) {
    return {
      date: subDays(new Date(), 1),
      confidence: 0.95,
      granularity: 'day',
      source: input
    };
  }

  const daysMatch = normalized.match(PATTERNS.daysAgo);
  if (daysMatch) {
    const days = parseInt(daysMatch[1] || daysMatch[3]);
    return {
      date: subDays(new Date(), days),
      confidence: 0.9,
      granularity: 'day',
      source: input
    };
  }

  const weeksMatch = normalized.match(PATTERNS.weeksAgo);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1] || weeksMatch[3]);
    return {
      date: subWeeks(new Date(), weeks),
      confidence: 0.85,
      granularity: 'day',
      source: input
    };
  }

  const monthsMatch = normalized.match(PATTERNS.monthsAgo);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1] || monthsMatch[3]);
    return {
      date: subMonths(new Date(), months),
      confidence: 0.8,
      granularity: 'month',
      source: input
    };
  }

  const yearsMatch = normalized.match(PATTERNS.yearsAgo);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1] || yearsMatch[3]);
    return {
      date: subYears(new Date(), years),
      confidence: 0.75,
      granularity: 'year',
      source: input
    };
  }

  // 4. Seasons (approximate)
  const seasonYear = extractYear(normalized);
  if (seasonYear) {
    if (PATTERNS.spring.test(normalized)) {
      return {
        date: new Date(seasonYear, 3, 1), // April 1
        confidence: 0.6,
        granularity: 'season',
        source: input
      };
    }
    if (PATTERNS.summer.test(normalized)) {
      return {
        date: new Date(seasonYear, 6, 1), // July 1
        confidence: 0.6,
        granularity: 'season',
        source: input
      };
    }
    if (PATTERNS.fall.test(normalized)) {
      return {
        date: new Date(seasonYear, 9, 1), // October 1
        confidence: 0.6,
        granularity: 'season',
        source: input
      };
    }
    if (PATTERNS.winter.test(normalized)) {
      return {
        date: new Date(seasonYear, 0, 1), // January 1
        confidence: 0.6,
        granularity: 'season',
        source: input
      };
    }
  }

  // 5. Month + Year
  if (PATTERNS.monthYear.test(input)) {
    const date = parse(input, 'MMMM yyyy', new Date(), { locale: de });
    if (isValid(date)) {
      return {
        date,
        confidence: 0.85,
        granularity: 'month',
        source: input
      };
    }
  }

  // 6. Just year
  const yearMatch = input.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    return {
      date: new Date(year, 0, 1), // January 1
      confidence: 0.7,
      granularity: 'year',
      source: input
    };
  }

  return null;
}

function extractYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : null;
}

function isValid(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
```

**Usage Example:**

```typescript
const examples = [
  'gestern',
  'vor 3 Wochen',
  'Sommer 2020',
  '15.08.2019',
  '2023-12-25',
  'vor 2 Jahren im Herbst'
];

examples.forEach(text => {
  const parsed = parseNaturalLanguageDate(text);
  console.log(text, '→', parsed);
});
```

---

## 3. Geocoding & Location Validation

### Problem
User sagt: "München", "in der Nähe von Paris", "bei 48.1351, 11.5820"

### Solution: Multi-Provider Geocoding

```typescript
// lib/validation/geocoder.ts

interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  country: string;
  confidence: number; // 0-1
  source: 'nominatim' | 'google' | 'user-input';
}

// OpenStreetMap Nominatim (free, no API key)
export async function geocodeWithNominatim(
  query: string
): Promise<GeocodedLocation | null> {

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'XPShare/1.0' // Required by Nominatim
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        country: result.address?.country || 'Unknown',
        confidence: parseFloat(result.importance || 0.5),
        source: 'nominatim'
      };
    }
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
  }

  return null;
}

// Google Maps Geocoding (fallback, requires API key)
export async function geocodeWithGoogle(
  query: string
): Promise<GeocodedLocation | null> {

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', query);
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const country = result.address_components.find((c: any) =>
        c.types.includes('country')
      )?.long_name || 'Unknown';

      return {
        name: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        country,
        confidence: 0.95,
        source: 'google'
      };
    }
  } catch (error) {
    console.error('Google geocoding error:', error);
  }

  return null;
}

// Main geocoding function (tries multiple providers)
export async function geocodeLocation(
  query: string
): Promise<GeocodedLocation | null> {

  // 1. Check if already coordinates
  const coordMatch = query.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    if (isValidCoordinate(lat, lng)) {
      // Reverse geocode to get name
      const name = await reverseGeocode(lat, lng);
      return {
        name: name || `${lat}, ${lng}`,
        lat,
        lng,
        country: 'Unknown',
        confidence: 1.0,
        source: 'user-input'
      };
    }
  }

  // 2. Try Nominatim first (free)
  const nominatimResult = await geocodeWithNominatim(query);
  if (nominatimResult && nominatimResult.confidence > 0.5) {
    return nominatimResult;
  }

  // 3. Fallback to Google (if API key available)
  const googleResult = await geocodeWithGoogle(query);
  if (googleResult) {
    return googleResult;
  }

  // 4. Return Nominatim result even with low confidence
  return nominatimResult;
}

// Reverse geocoding (lat/lng → name)
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lng.toString());
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'XPShare/1.0' }
    });

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
```

---

## 4. Quality Scoring System

### Problem
"Wie gut ist dieses Erlebnis?" → Objective Score

### Weighted Scoring Algorithm

```typescript
// lib/validation/quality-scorer.ts

interface QualityScore {
  total: number; // 0-100
  breakdown: {
    completeness: number;
    detail: number;
    attributes: number;
    media: number;
    witnesses: number;
    community: number;
  };
  flags: string[];
  tier: 'excellent' | 'good' | 'fair' | 'poor';
}

const WEIGHTS = {
  completeness: 0.30, // Has all required fields?
  detail: 0.20,       // Text length, richness
  attributes: 0.15,   // Structured data extracted
  media: 0.10,        // Photos, audio, sketches
  witnesses: 0.15,    // Corroboration
  community: 0.10     // Likes, shares, reports
};

export function calculateQualityScore(experience: {
  title: string;
  description: string;
  category: string;
  occurred_at: Date | null;
  location_lat: number | null;
  location_lng: number | null;
  witnesses: number;
  media_urls: string[];
  attributes?: any[];
  likes_count?: number;
  reports_count?: number;
  view_count?: number;
}): QualityScore {

  const scores = {
    completeness: scoreCompleteness(experience),
    detail: scoreDetail(experience),
    attributes: scoreAttributes(experience),
    media: scoreMedia(experience),
    witnesses: scoreWitnesses(experience),
    community: scoreCommunity(experience)
  };

  // Calculate weighted total
  const total = Math.round(
    Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * WEIGHTS[key as keyof typeof WEIGHTS]);
    }, 0)
  );

  // Identify issues
  const flags = identifyQualityFlags(experience, scores);

  // Determine tier
  const tier = total >= 80 ? 'excellent'
    : total >= 60 ? 'good'
    : total >= 40 ? 'fair'
    : 'poor';

  return {
    total,
    breakdown: scores,
    flags,
    tier
  };
}

function scoreCompleteness(exp: any): number {
  let score = 0;

  // Required fields (40 points)
  if (exp.title && exp.title.length >= 10) score += 10;
  if (exp.description && exp.description.length >= 50) score += 10;
  if (exp.category) score += 10;
  if (exp.occurred_at) score += 10;

  // Optional but important (60 points)
  if (exp.location_lat && exp.location_lng) score += 30;
  if (exp.witnesses > 0) score += 15;
  if (exp.media_urls && exp.media_urls.length > 0) score += 15;

  return score;
}

function scoreDetail(exp: any): number {
  const text = `${exp.title} ${exp.description}`;
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length;

  let score = 0;

  // Word count (50 points)
  if (wordCount >= 300) score += 50;
  else if (wordCount >= 150) score += 35;
  else if (wordCount >= 75) score += 20;
  else score += 10;

  // Sentence structure (25 points)
  const avgWordsPerSentence = wordCount / sentenceCount;
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    score += 25; // Good readability
  } else {
    score += 10;
  }

  // Paragraph structure (25 points)
  const paragraphs = exp.description.split(/\n\n+/);
  if (paragraphs.length >= 2) {
    score += 25; // Well structured
  } else {
    score += 10;
  }

  return score;
}

function scoreAttributes(exp: any): number {
  if (!exp.attributes || exp.attributes.length === 0) {
    return 0;
  }

  // More extracted attributes = better
  const count = exp.attributes.length;

  if (count >= 10) return 100;
  if (count >= 7) return 80;
  if (count >= 5) return 60;
  if (count >= 3) return 40;
  return 20;
}

function scoreMedia(exp: any): number {
  if (!exp.media_urls || exp.media_urls.length === 0) {
    return 0;
  }

  const count = exp.media_urls.length;

  // Diminishing returns (more isn't always better)
  if (count >= 5) return 100;
  if (count >= 3) return 80;
  if (count >= 2) return 60;
  return 40;
}

function scoreWitnesses(exp: any): number {
  const witnesses = exp.witnesses || 0;

  if (witnesses >= 10) return 100;
  if (witnesses >= 5) return 80;
  if (witnesses >= 2) return 60;
  if (witnesses === 1) return 40;
  return 0; // Solo experience
}

function scoreCommunity(exp: any): number {
  const likes = exp.likes_count || 0;
  const reports = exp.reports_count || 0;
  const views = exp.view_count || 0;

  let score = 0;

  // Positive signals (70 points)
  if (likes >= 20) score += 40;
  else if (likes >= 10) score += 30;
  else if (likes >= 5) score += 20;
  else if (likes >= 1) score += 10;

  if (views >= 100) score += 30;
  else if (views >= 50) score += 20;
  else if (views >= 10) score += 10;

  // Negative signals (deduct)
  if (reports >= 3) score -= 50; // Suspicious
  else if (reports >= 1) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function identifyQualityFlags(exp: any, scores: any): string[] {
  const flags: string[] = [];

  if (scores.completeness < 50) flags.push('incomplete-data');
  if (scores.detail < 40) flags.push('low-detail');
  if (scores.attributes < 30) flags.push('few-attributes');
  if (!exp.occurred_at) flags.push('no-date');
  if (!exp.location_lat || !exp.location_lng) flags.push('no-location');
  if (exp.witnesses === 0) flags.push('no-witnesses');
  if (!exp.media_urls || exp.media_urls.length === 0) flags.push('no-media');

  // Spam indicators
  if (exp.description.includes('http://') || exp.description.includes('https://')) {
    flags.push('contains-urls');
  }
  if (exp.reports_count > 3) flags.push('multiple-reports');

  return flags;
}
```

---

## 5. Spam Detection

### Problem
Bots, Trolls, Low-Effort Posts

### Solution: Multi-Layer Spam Filter

```typescript
// lib/validation/spam-detector.ts

interface SpamCheckResult {
  isSpam: boolean;
  confidence: number; // 0-1
  reasons: string[];
  action: 'block' | 'flag' | 'allow';
}

export function detectSpam(experience: {
  title: string;
  description: string;
  user_id: string;
  created_at: Date;
}): SpamCheckResult {

  const reasons: string[] = [];
  let spamScore = 0;

  // 1. Text analysis
  const text = `${experience.title} ${experience.description}`.toLowerCase();

  // URL spam
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount >= 3) {
    spamScore += 40;
    reasons.push('multiple-urls');
  }

  // Repetitive text
  const words = text.split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueness = uniqueWords.size / words.length;
  if (uniqueness < 0.3) {
    spamScore += 30;
    reasons.push('repetitive-text');
  }

  // All caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 50) {
    spamScore += 20;
    reasons.push('excessive-caps');
  }

  // Keyword spam
  const spamKeywords = ['click here', 'buy now', 'limited offer', 'act now', 'free money'];
  spamKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      spamScore += 15;
      reasons.push(`spam-keyword: ${keyword}`);
    }
  });

  // 2. Title analysis
  if (experience.title.length < 10) {
    spamScore += 10;
    reasons.push('title-too-short');
  }

  if (experience.description.length < 50) {
    spamScore += 20;
    reasons.push('description-too-short');
  }

  // 3. Determine action
  let action: 'block' | 'flag' | 'allow';
  if (spamScore >= 70) {
    action = 'block';
  } else if (spamScore >= 40) {
    action = 'flag'; // Needs human review
  } else {
    action = 'allow';
  }

  return {
    isSpam: spamScore >= 70,
    confidence: spamScore / 100,
    reasons,
    action
  };
}

// Rate limiting (detect mass posting)
export async function checkUserPostingRate(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { count } = await supabase
    .from('experiences')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  if (count && count >= 10) {
    return {
      allowed: false,
      reason: 'Too many posts in 24h (max 10)'
    };
  }

  return { allowed: true };
}
```

---

## 6. Data Enrichment

### Problem
User gibt minimal info → We add metadata

### Solution: AI-Powered Enrichment

```typescript
// lib/validation/enricher.ts

interface EnrichedExperience {
  original: any;
  enriched: {
    extracted_entities: string[];
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    intensity: number; // 0-1
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
    weather?: string;
    emotions?: string[];
  };
}

export async function enrichExperience(
  experience: {
    title: string;
    description: string;
    occurred_at?: Date | null;
  }
): Promise<EnrichedExperience['enriched']> {

  const text = `${experience.title}\n${experience.description}`;

  // 1. Entity extraction (NER)
  const entities = extractNamedEntities(text);

  // 2. Keyword extraction
  const keywords = extractKeywords(text);

  // 3. Sentiment analysis
  const sentiment = analyzeSentiment(text);

  // 4. Intensity/Emotion detection
  const intensity = detectIntensity(text);
  const emotions = detectEmotions(text);

  // 5. Time of day (if available)
  const timeOfDay = experience.occurred_at
    ? getTimeOfDay(experience.occurred_at)
    : undefined;

  return {
    extracted_entities: entities,
    keywords,
    sentiment: sentiment.label,
    intensity: intensity,
    time_of_day: timeOfDay,
    emotions
  };
}

function extractNamedEntities(text: string): string[] {
  // Simplified NER (could use spaCy or similar)
  const entities: string[] = [];

  // Capitalize words (likely proper nouns)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern) || [];

  return [...new Set(matches)];
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq = new Map<string, number>();

  words.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeSentiment(text: string): {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
} {
  // Simplified sentiment (could use transformers.js)
  const positive = ['amazing', 'beautiful', 'wonderful', 'incredible', 'love'];
  const negative = ['scary', 'terrifying', 'fear', 'panic', 'horrible'];

  let score = 0;

  positive.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 1;
  });

  negative.forEach(word => {
    if (text.toLowerCase().includes(word)) score -= 1;
  });

  if (score > 0) return { label: 'positive', score };
  if (score < 0) return { label: 'negative', score: Math.abs(score) };
  return { label: 'neutral', score: 0 };
}

function detectIntensity(text: string): number {
  // Exclamation marks, all caps, intensity words
  const exclamations = (text.match(/!/g) || []).length;
  const intensityWords = ['sehr', 'extrem', 'massiv', 'unglaublich', 'total'];

  let score = 0;
  score += Math.min(exclamations * 0.1, 0.3);

  intensityWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 0.15;
  });

  return Math.min(score, 1);
}

function detectEmotions(text: string): string[] {
  const emotionKeywords = {
    fear: ['angst', 'furcht', 'erschrecken', 'panik'],
    joy: ['freude', 'glück', 'begeisterung'],
    surprise: ['überraschung', 'schock', 'staunen'],
    awe: ['ehrfurcht', 'bewunderung', 'respekt'],
    confusion: ['verwirrung', 'ratlos', 'unklar']
  };

  const detected: string[] = [];

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
      detected.push(emotion);
    }
  });

  return detected;
}

function getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const STOP_WORDS = new Set([
  'der', 'die', 'das', 'und', 'ist', 'war', 'ein', 'eine',
  'ich', 'mich', 'mir', 'wir', 'uns', 'haben', 'hatte'
]);
```

---

## 7. Complete Validation Pipeline

```typescript
// lib/validation/pipeline.ts

export async function validateAndEnrichExperience(
  rawData: unknown
): Promise<{
  valid: boolean;
  data?: ProcessedExperience;
  errors?: string[];
}> {

  const errors: string[] = [];

  // Step 1: Schema validation
  const validation = validateExperienceSubmission(rawData);
  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors?.errors.map(e => e.message)
    };
  }

  const data = validation.data!;

  // Step 2: Spam detection
  const spamCheck = detectSpam({
    title: data.title,
    description: data.description,
    user_id: 'user-id-here', // From auth
    created_at: new Date()
  });

  if (spamCheck.action === 'block') {
    return {
      valid: false,
      errors: ['Content blocked as spam', ...spamCheck.reasons]
    };
  }

  // Step 3: Date parsing (if natural language)
  let occurredAt = data.occurred_at;
  if (typeof occurredAt === 'string') {
    const parsed = parseNaturalLanguageDate(occurredAt);
    if (parsed && parsed.confidence > 0.6) {
      occurredAt = parsed.date;
    } else {
      errors.push('Could not parse date');
    }
  }

  // Step 4: Geocoding (if location name but no coords)
  let location = {
    name: data.location_name,
    lat: data.location_lat,
    lng: data.location_lng
  };

  if (data.location_name && (!data.location_lat || !data.location_lng)) {
    const geocoded = await geocodeLocation(data.location_name);
    if (geocoded) {
      location = {
        name: geocoded.name,
        lat: geocoded.lat,
        lng: geocoded.lng
      };
    } else {
      errors.push('Could not geocode location');
    }
  }

  // Step 5: Quality scoring
  const qualityScore = calculateQualityScore({
    title: data.title,
    description: data.description,
    category: data.category,
    occurred_at: occurredAt as Date,
    location_lat: location.lat,
    location_lng: location.lng,
    witnesses: data.witnesses,
    media_urls: data.media_urls
  });

  // Step 6: Enrichment
  const enriched = await enrichExperience({
    title: data.title,
    description: data.description,
    occurred_at: occurredAt as Date | null
  });

  // Step 7: Assemble processed experience
  const processed: ProcessedExperience = {
    ...data,
    occurred_at: occurredAt as Date | null,
    location_name: location.name || null,
    location_lat: location.lat || null,
    location_lng: location.lng || null,
    quality_score: qualityScore.total,
    quality_tier: qualityScore.tier,
    quality_flags: qualityScore.flags,
    is_flagged: spamCheck.action === 'flag',
    enrichment: enriched
  };

  return {
    valid: true,
    data: processed,
    errors: errors.length > 0 ? errors : undefined
  };
}

interface ProcessedExperience {
  title: string;
  description: string;
  category: string;
  occurred_at: Date | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  witnesses: number;
  media_urls: string[];
  is_private: boolean;
  quality_score: number;
  quality_tier: string;
  quality_flags: string[];
  is_flagged: boolean;
  enrichment: any;
}
```

---

## 8. Database Schema Updates

```sql
-- migrations/add_quality_scoring.sql

-- Add quality columns to experiences table
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS quality_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality_tier TEXT,
ADD COLUMN IF NOT EXISTS quality_flags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enrichment JSONB DEFAULT '{}';

-- Index for filtering by quality
CREATE INDEX idx_experiences_quality_score ON experiences(quality_score DESC);
CREATE INDEX idx_experiences_quality_tier ON experiences(quality_tier);
CREATE INDEX idx_experiences_is_flagged ON experiences(is_flagged) WHERE is_flagged = true;

-- Function to recalculate quality scores
CREATE OR REPLACE FUNCTION recalculate_quality_scores()
RETURNS void AS $$
BEGIN
  -- This would call the quality scoring logic
  -- In practice, run via API endpoint
  RAISE NOTICE 'Quality scores recalculation triggered';
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ Success Metrics

1. **Data Completeness**
   - Target: >80% of experiences have location + date
   - Measurement: Aggregate query

2. **Spam Block Rate**
   - Target: <1% false positives
   - Measurement: User reports

3. **Quality Distribution**
   - Target: >60% "good" or "excellent"
   - Measurement: quality_tier distribution

4. **Geocoding Success Rate**
   - Target: >90% successful geocoding
   - Measurement: Track geocoding failures

---

## 📝 Notes & Learnings

### What Makes Quality Work:

1. **Multi-Layer Validation** - Schema → Spam → Quality
2. **User-Friendly Errors** - Clear messages, not technical
3. **Progressive Enhancement** - Accept minimal, enrich automatically
4. **Transparent Scoring** - Show users WHY score is X
5. **Continuous Improvement** - Retrain spam filters based on reports

---

**Ready für Implementation? → [TODO-MASTER.md](./TODO-MASTER.md) Phase 2-3**
