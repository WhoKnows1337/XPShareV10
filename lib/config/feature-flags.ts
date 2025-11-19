/**
 * Feature Flags System
 * Centralized configuration for experimental and beta features
 */

export interface FeatureFlags {
  // Search Enhancement
  crossEncoderReranking: boolean;
  rerankingModel: string;

  // Pattern Discovery
  advancedPatterns: boolean; // Enable 9 additional pattern types
  realTimePatterns: boolean; // Real-time pattern updates

  // Rate Limiting
  useVercelKV: boolean;

  // AI Features
  aiTextEnhancement: boolean;
  voiceTranscription: boolean;

  // Experimental
  experimentalMap: boolean;
  experimentalGraph: boolean;
  experimentalTimeline: boolean;
}

/**
 * Get feature flags from environment variables
 * Defaults to false for all experimental features
 */
function getFeatureFlags(): FeatureFlags {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isBrowser = typeof window !== 'undefined';

  return {
    // Search Enhancement
    crossEncoderReranking:
      process.env.NEXT_PUBLIC_ENABLE_RERANKING === 'true' || isDevelopment,
    rerankingModel:
      process.env.NEXT_PUBLIC_RERANKING_MODEL ||
      'cross-encoder/ms-marco-MiniLM-L-6-v2',

    // Pattern Discovery
    advancedPatterns:
      process.env.NEXT_PUBLIC_ADVANCED_PATTERNS === 'true' || isDevelopment,
    realTimePatterns:
      process.env.NEXT_PUBLIC_REALTIME_PATTERNS === 'true' || false,

    // Rate Limiting
    useVercelKV: process.env.KV_REST_API_URL !== undefined,

    // AI Features
    aiTextEnhancement:
      process.env.NEXT_PUBLIC_AI_TEXT_ENHANCEMENT !== 'false', // Enabled by default
    voiceTranscription:
      process.env.NEXT_PUBLIC_VOICE_TRANSCRIPTION !== 'false', // Enabled by default

    // Experimental (browser-only checks)
    experimentalMap:
      process.env.NEXT_PUBLIC_EXPERIMENTAL_MAP === 'true' || false,
    experimentalGraph:
      process.env.NEXT_PUBLIC_EXPERIMENTAL_GRAPH === 'true' || false,
    experimentalTimeline:
      process.env.NEXT_PUBLIC_EXPERIMENTAL_TIMELINE === 'true' || false,
  };
}

/**
 * Feature flags singleton
 * Initialized once at module load
 */
export const featureFlags: FeatureFlags = getFeatureFlags();

/**
 * Check if a feature is enabled
 * Useful for conditional rendering
 *
 * @param feature - Feature name to check
 * @returns boolean
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature] === true;
}

/**
 * Get all enabled features
 * Useful for debugging
 *
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled === true)
    .map(([feature]) => feature);
}

/**
 * Hook for feature flag checks in React components
 * Example: const hasReranking = useFeatureFlag('crossEncoderReranking')
 */
export function useFeatureFlag(feature: keyof FeatureFlags): FeatureFlags[keyof FeatureFlags] {
  // In SSR, return the server-side value
  if (typeof window === 'undefined') {
    return featureFlags[feature];
  }

  // In browser, return the client-side value
  return featureFlags[feature];
}

/**
 * Feature flag config for admin UI
 * Shows human-readable names and descriptions
 */
export const featureFlagMetadata: Record<
  keyof FeatureFlags,
  {
    name: string;
    description: string;
    category: 'search' | 'patterns' | 'infrastructure' | 'ai' | 'experimental';
    requiresRestart: boolean;
  }
> = {
  crossEncoderReranking: {
    name: 'Cross-Encoder Re-Ranking',
    description:
      'Improve search relevance by 15-30% using AI re-ranking. May add 500ms latency.',
    category: 'search',
    requiresRestart: false,
  },
  rerankingModel: {
    name: 'Re-Ranking Model',
    description: 'AI model used for re-ranking search results.',
    category: 'search',
    requiresRestart: true,
  },
  advancedPatterns: {
    name: 'Advanced Pattern Detection',
    description:
      'Enable 9 additional pattern types (Tag Matching, Witness Networks, etc.)',
    category: 'patterns',
    requiresRestart: false,
  },
  realTimePatterns: {
    name: 'Real-Time Pattern Updates',
    description: 'Update patterns in real-time as new experiences are submitted.',
    category: 'patterns',
    requiresRestart: true,
  },
  useVercelKV: {
    name: 'Vercel KV Rate Limiting',
    description: 'Use Vercel KV for persistent, distributed rate limiting.',
    category: 'infrastructure',
    requiresRestart: true,
  },
  aiTextEnhancement: {
    name: 'AI Text Enhancement',
    description: 'Enable AI-powered text enrichment in submit flow.',
    category: 'ai',
    requiresRestart: false,
  },
  voiceTranscription: {
    name: 'Voice Transcription',
    description: 'Enable voice-to-text transcription using Whisper API.',
    category: 'ai',
    requiresRestart: false,
  },
  experimentalMap: {
    name: 'Experimental Map View',
    description: 'Beta version of interactive map with new features.',
    category: 'experimental',
    requiresRestart: false,
  },
  experimentalGraph: {
    name: 'Experimental Graph View',
    description: 'Beta version of 3D relationship graph.',
    category: 'experimental',
    requiresRestart: false,
  },
  experimentalTimeline: {
    name: 'Experimental Timeline',
    description: 'Beta version of temporal visualization.',
    category: 'experimental',
    requiresRestart: false,
  },
};

/**
 * Log all feature flags on server startup
 * Only in development
 */
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  console.log('\n🚩 Feature Flags Initialized:');
  console.log('===============================');
  Object.entries(featureFlags).forEach(([key, value]) => {
    const status = value ? '✅ ENABLED' : '❌ DISABLED';
    console.log(`${status} - ${key}`);
  });
  console.log('===============================\n');
}
