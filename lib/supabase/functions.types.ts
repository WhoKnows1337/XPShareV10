/**
 * Supabase RPC Function Type Definitions
 *
 * These types are manually defined since Supabase CLI doesn't generate
 * types for custom SQL functions. This file provides type safety for all
 * RPC function calls in the application.
 */

import { Database } from './database.types'

// Re-export common types
type Experience = Database['public']['Tables']['experiences']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type ExperienceAttribute = Database['public']['Tables']['experience_attributes']['Row']

/**
 * Search and Discovery Functions
 */
export interface SupabaseFunctions {
  // Core Search Functions
  hybrid_search: {
    Args: {
      p_query_text: string
      p_query_embedding?: number[]
      p_language?: string
      p_vector_weight?: number
      p_fts_weight?: number
      p_category?: string
      p_limit?: number
    }
    Returns: Array<Experience & {
      semantic_similarity?: number
      keyword_match?: boolean
      rank?: number
    }>
  }

  full_text_search: {
    Args: {
      search_query: string
      category?: string
      limit_count?: number
    }
    Returns: Experience[]
  }

  geo_search: {
    Args: {
      center_lat: number
      center_lng: number
      radius_km: number
      category?: string
      limit?: number
    }
    Returns: Array<Experience & {
      distance_km?: number
    }>
  }

  search_by_attributes: {
    Args: {
      attribute_filters: Record<string, any>
      category?: string
      limit_count?: number
    }
    Returns: Experience[]
  }

  // Feed Functions
  get_for_you_feed: {
    Args: {
      user_id: string
      page_size?: number
      page_offset?: number
    }
    Returns: Array<Experience & {
      relevance_score?: number
      user_profiles?: UserProfile
    }>
  }

  get_nearby_experiences: {
    Args: {
      lat: number
      lng: number
      radius_km?: number
      limit?: number
    }
    Returns: Array<Experience & {
      distance?: number
    }>
  }

  // Similarity and Relationships
  find_similar_experiences: {
    Args: {
      experience_id: string
      limit?: number
      threshold?: number
    }
    Returns: Array<{
      id: string
      title: string
      category: string
      similarity_score: number
      common_attributes?: string[]
    }>
  }

  find_related_experiences: {
    Args: {
      experience_id: string
      limit?: number
    }
    Returns: Array<Experience & {
      relationship_type?: string
      relationship_score?: number
    }>
  }

  count_similar_experiences: {
    Args: {
      experience_id: string
      threshold?: number
    }
    Returns: Array<{ count: number }>
  }

  // User Functions
  find_similar_users: {
    Args: {
      target_user_id: string
      limit?: number
    }
    Returns: Array<{
      user_id: string
      username: string
      display_name?: string
      avatar_url?: string
      similarity_score: number
      shared_categories?: string[]
      shared_experiences?: number
    }>
  }

  find_xp_twins: {
    Args: {
      user_id: string
      threshold?: number
      limit?: number
    }
    Returns: Array<{
      twin_user_id: string
      username: string
      display_name?: string
      avatar_url?: string
      similarity_score: number
      shared_categories: string[]
      common_experiences: number
    }>
  }

  get_xp_twins_stats: {
    Args: {
      user_id: string
    }
    Returns: Array<{
      total_twins: number
      top_category: string
      avg_similarity: number
    }>
  }

  calculate_user_similarity: {
    Args: {
      user1_id: string
      user2_id: string
    }
    Returns: Array<{ similarity_score: number }>
  }

  calculate_user_impact: {
    Args: {
      user_id: string
    }
    Returns: Array<{
      total_experiences: number
      total_views: number
      total_upvotes: number
      impact_score: number
    }>
  }

  get_user_comparison: {
    Args: {
      user1_id: string
      user2_id: string
    }
    Returns: Array<{
      shared_categories: string[]
      user1_total: number
      user2_total: number
      similarity: number
    }>
  }

  // Social Functions
  follow_user: {
    Args: {
      follower_id: string
      following_id: string
    }
    Returns: Array<{ success: boolean }>
  }

  unfollow_user: {
    Args: {
      follower_id: string
      following_id: string
    }
    Returns: Array<{ success: boolean }>
  }

  is_following: {
    Args: {
      follower_id: string
      following_id: string
    }
    Returns: Array<{ is_following: boolean }>
  }

  find_interested_users: {
    Args: {
      experience_id: string
      limit?: number
    }
    Returns: Array<UserProfile & {
      interest_score?: number
    }>
  }

  // Analytics Functions
  temporal_aggregation: {
    Args: {
      category?: string
      timeframe?: string
      aggregation_type?: string
    }
    Returns: Array<{
      time_bucket: string
      count: number
      category?: string
      avg_value?: number
    }>
  }

  detect_temporal_patterns: {
    Args: {
      category?: string
      min_support?: number
    }
    Returns: Array<{
      pattern_type: string
      pattern_value: any
      frequency: number
      confidence: number
    }>
  }

  find_temporal_clusters: {
    Args: {
      category?: string
      time_window?: string
    }
    Returns: Array<{
      cluster_id: number
      start_time: string
      end_time: string
      experience_count: number
      categories: string[]
    }>
  }

  detect_geographic_clusters: {
    Args: {
      category?: string
      min_cluster_size?: number
    }
    Returns: Array<{
      cluster_id: number
      center_lat: number
      center_lng: number
      radius_km: number
      experience_count: number
    }>
  }

  find_geographic_clusters: {
    Args: {
      category?: string
      epsilon?: number
      min_points?: number
    }
    Returns: Array<{
      cluster_id: number
      lat: number
      lng: number
      count: number
      location_names: string[]
    }>
  }

  category_correlation: {
    Args: {
      category1: string
      category2: string
    }
    Returns: Array<{
      correlation: number
      shared_users: number
      shared_locations: number
    }>
  }

  detect_cross_category_patterns: {
    Args: {
      min_support?: number
      min_confidence?: number
    }
    Returns: Array<{
      pattern: string[]
      support: number
      confidence: number
      lift: number
    }>
  }

  get_cross_category_insights: {
    Args: {
      user_id?: string
    }
    Returns: Array<{
      category_pair: string[]
      correlation: number
      common_users: number
      insight_type: string
    }>
  }

  analyze_tag_network: {
    Args: {
      category?: string
      limit?: number
    }
    Returns: Array<{
      tag: string
      connections: string[]
      centrality: number
      frequency: number
    }>
  }

  aggregate_users_by_category: {
    Args: {}
    Returns: Array<{
      category: string
      user_count: number
      experience_count: number
      avg_experiences_per_user: number
    }>
  }

  predict_next_wave: {
    Args: {
      category: string
      lookback_days?: number
    }
    Returns: Array<{
      predicted_date: string
      confidence: number
      based_on_pattern: string
    }>
  }

  get_pattern_summary: {
    Args: {
      category?: string
    }
    Returns: Array<{
      pattern_type: string
      pattern_count: number
      top_patterns: any[]
    }>
  }

  // Gamification Functions
  award_xp: {
    Args: {
      user_id: string
      xp_amount: number
      reason: string
    }
    Returns: Array<{
      new_total_xp: number
      new_level: number
      level_up: boolean
    }>
  }

  check_and_award_badges: {
    Args: {
      user_id: string
    }
    Returns: Array<{
      badge_id: string
      badge_name: string
      awarded: boolean
    }>
  }

  update_user_streak: {
    Args: {
      user_id: string
    }
    Returns: Array<{
      current_streak: number
      longest_streak: number
      streak_continued: boolean
    }>
  }

  // Template Functions
  promote_ai_question_to_template: {
    Args: {
      question_id: string
      promoted_by: string
    }
    Returns: Array<{ template_id: string }>
  }

  increment_template_usage: {
    Args: {
      template_id: string
    }
    Returns: Array<{ new_count: number }>
  }

  increment_template_use: {
    Args: {
      template_id: string
    }
    Returns: Array<{ usage_count: number }>
  }

  get_ai_question_stats: {
    Args: {}
    Returns: Array<{
      total_questions: number
      promoted_count: number
      avg_usefulness: number
    }>
  }

  // Search Tracking
  track_search: {
    Args: {
      query: string
      category?: string
      results_count: number
      user_id?: string
    }
    Returns: Array<{ search_id: string }>
  }

  get_top_searches: {
    Args: {
      limit?: number
      timeframe?: string
    }
    Returns: Array<{
      query: string
      search_count: number
      avg_results: number
    }>
  }

  check_search_alerts: {
    Args: {
      user_id: string
    }
    Returns: Array<{
      alert_id: string
      query: string
      new_results: number
    }>
  }

  // Utility Functions
  refresh_analytics_summary: {
    Args: {}
    Returns: Array<{ success: boolean }>
  }

  get_similarity_explanation: {
    Args: {
      exp1_id: string
      exp2_id: string
    }
    Returns: Array<{
      similarity_score: number
      common_attributes: string[]
      explanation: string
    }>
  }

  get_citations_for_message: {
    Args: {
      message_id: string
    }
    Returns: Array<{
      experience_id: string
      title: string
      excerpt: string
      relevance: number
    }>
  }

  // Database utility (for Mastra tools)
  exec_sql: {
    Args: {
      query: string
    }
    Returns: any[]
  }

  exec: {
    Args: {
      sql: string
    }
    Returns: any[]
  }

  get_table_schema: {
    Args: {
      table_name: string
    }
    Returns: Array<{
      column_name: string
      data_type: string
      is_nullable: string
      column_default: string | null
    }>
  }

  // Deprecated/Legacy
  match_experiences: {
    Args: {
      query_embedding: number[]
      match_threshold?: number
      match_count?: number
    }
    Returns: Array<Experience & {
      similarity?: number
    }>
  }
}

/**
 * Extended Database type with RPC functions
 */
export interface DatabaseWithFunctions extends Database {
  public: Database['public'] & {
    Functions: SupabaseFunctions
  }
}

/**
 * Helper type for typed RPC calls
 * Usage: const { data } = await supabase.rpc<RPCResponse<'hybrid_search'>>('hybrid_search', params)
 */
export type RPCResponse<K extends keyof SupabaseFunctions> = SupabaseFunctions[K]['Returns']
export type RPCArgs<K extends keyof SupabaseFunctions> = SupabaseFunctions[K]['Args']