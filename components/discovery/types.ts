/**
 * Discovery Loading Screen - Type Definitions
 * Real-time discovery events during experience analysis
 */

export type DiscoveryEventType =
  | 'saved'
  | 'embedding'
  | 'scanning'
  | 'similar_found'
  | 'wave_detected'
  | 'category_match'
  | 'location_cluster'
  | 'temporal_pattern'
  | 'complete';

export interface DiscoveryEvent {
  type: DiscoveryEventType;
  timestamp: number;
  data?: {
    count?: number;
    percentage?: number;
    message?: string;
    location?: string;
    category?: string;
    timeframe?: string;
  };
}

export interface RewardsData {
  xpEarned: number;
  badgesEarned: string[];
  leveledUp: boolean;
  newLevel?: number;
  currentLevel: number;
}

export interface DiscoveryResult {
  experienceId: string;
  similarCount: number;
  categoryMatches: number;
  locationMatches: number;
  temporalMatches: number;
  hasActiveWave: boolean;
  patternStrength: number; // 0-100
  rewards: RewardsData;
}
