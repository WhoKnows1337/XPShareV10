export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          last_activity: string | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          last_activity?: string | null
          permissions?: Json | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          last_activity?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      question_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          category: string
          comment_count: number | null
          created_at: string | null
          date_occurred: string | null
          embedding: string | null
          emotions: string[] | null
          id: string
          is_anonymous: boolean | null
          language: string | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          story_audio_url: string | null
          story_text: string | null
          story_transcription: string | null
          tags: string[] | null
          time_of_day: string | null
          title: string
          updated_at: string | null
          upvote_count: number | null
          user_id: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          category: string
          comment_count?: number | null
          created_at?: string | null
          date_occurred?: string | null
          embedding?: string | null
          emotions?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          language?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          story_audio_url?: string | null
          story_text?: string | null
          story_transcription?: string | null
          tags?: string[] | null
          time_of_day?: string | null
          title: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          category?: string
          comment_count?: number | null
          created_at?: string | null
          date_occurred?: string | null
          embedding?: string | null
          emotions?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          language?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          story_audio_url?: string | null
          story_text?: string | null
          story_transcription?: string | null
          tags?: string[] | null
          time_of_day?: string | null
          title?: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          id: string
          is_admin: boolean | null
          languages: string[] | null
          level: number | null
          location_city: string | null
          location_country: string | null
          longest_streak: number | null
          total_contributions: number | null
          total_experiences: number | null
          total_xp: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id: string
          is_admin?: boolean | null
          languages?: string[] | null
          level?: number | null
          location_city?: string | null
          location_country?: string | null
          longest_streak?: number | null
          total_contributions?: number | null
          total_experiences?: number | null
          total_xp?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_admin?: boolean | null
          languages?: string[] | null
          level?: number | null
          location_city?: string | null
          location_country?: string | null
          longest_streak?: number | null
          total_contributions?: number | null
          total_experiences?: number | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
          rarity: string | null
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          rarity?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          rarity?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      experience_views: {
        Row: {
          experience_id: string | null
          id: string
          viewed_at: string | null
          viewer_ip: string | null
          viewer_user_id: string | null
        }
        Insert: {
          experience_id?: string | null
          id?: string
          viewed_at?: string | null
          viewer_ip?: string | null
          viewer_user_id?: string | null
        }
        Update: {
          experience_id?: string | null
          id?: string
          viewed_at?: string | null
          viewer_ip?: string | null
          viewer_user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pattern_alerts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          last_triggered_at: string | null
          min_experience_count: number | null
          name: string
          pattern_category: string | null
          pattern_location_lat: number | null
          pattern_location_lng: number | null
          pattern_radius_km: number | null
          time_window_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_triggered_at?: string | null
          min_experience_count?: number | null
          name: string
          pattern_category?: string | null
          pattern_location_lat?: number | null
          pattern_location_lng?: number | null
          pattern_radius_km?: number | null
          time_window_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_triggered_at?: string | null
          min_experience_count?: number | null
          name?: string
          pattern_category?: string | null
          pattern_location_lat?: number | null
          pattern_location_lng?: number | null
          pattern_radius_km?: number | null
          time_window_days?: number | null
        }
        Relationships: []
      }
      research_citations: {
        Row: {
          added_at: string | null
          citation_authors: string | null
          citation_doi: string | null
          citation_title: string
          citation_url: string | null
          experience_id: string | null
          id: string
          relevance_score: number | null
        }
        Insert: {
          added_at?: string | null
          citation_authors?: string | null
          citation_doi?: string | null
          citation_title: string
          citation_url?: string | null
          experience_id?: string | null
          id?: string
          relevance_score?: number | null
        }
        Update: {
          added_at?: string | null
          citation_authors?: string | null
          citation_doi?: string | null
          citation_title?: string
          citation_url?: string | null
          experience_id?: string | null
          id?: string
          relevance_score?: number | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      witness_verifications: {
        Row: {
          created_at: string | null
          experience_id: string
          id: string
          status: string | null
          user_id: string
          verification_text: string
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          id?: string
          status?: string | null
          user_id: string
          verification_text: string
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          id?: string
          status?: string | null
          user_id?: string
          verification_text?: string
        }
        Relationships: []
      }
      dynamic_questions: {
        Row: {
          adaptive_conditions: Json | null
          ai_adaptive: boolean | null
          category_id: string | null
          conditional_logic: Json | null
          created_at: string | null
          created_by: string | null
          follow_up_question: Json | null
          help_text: string | null
          id: string
          is_active: boolean | null
          is_optional: boolean | null
          options: Json | null
          placeholder: string | null
          priority: number
          question_text: string
          question_type: string
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          adaptive_conditions?: Json | null
          ai_adaptive?: boolean | null
          category_id?: string | null
          conditional_logic?: Json | null
          created_at?: string | null
          created_by?: string | null
          follow_up_question?: Json | null
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          options?: Json | null
          placeholder?: string | null
          priority: number
          question_text: string
          question_type: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          adaptive_conditions?: Json | null
          ai_adaptive?: boolean | null
          category_id?: string | null
          conditional_logic?: Json | null
          created_at?: string | null
          created_by?: string | null
          follow_up_question?: Json | null
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          options?: Json | null
          placeholder?: string | null
          priority?: number
          question_text?: string
          question_type?: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          details: string | null
          experience_id: string
          id: string
          reason: string
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          experience_id: string
          id?: string
          reason: string
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          experience_id?: string
          id?: string
          reason?: string
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      question_templates: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          questions: Json
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          questions: Json
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          questions?: Json
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      question_change_history: {
        Row: {
          change_type: string
          changed_at: string | null
          changed_by: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          change_type: string
          changed_at?: string | null
          changed_by?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          change_type?: string
          changed_at?: string | null
          changed_by?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      question_analytics: {
        Row: {
          answer_distribution: Json | null
          answered_count: number | null
          avg_time_seconds: number | null
          category_id: string | null
          created_at: string | null
          date: string
          id: string
          question_id: string | null
          shown_count: number | null
          skipped_count: number | null
          updated_at: string | null
        }
        Insert: {
          answer_distribution?: Json | null
          answered_count?: number | null
          avg_time_seconds?: number | null
          category_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          question_id?: string | null
          shown_count?: number | null
          skipped_count?: number | null
          updated_at?: string | null
        }
        Update: {
          answer_distribution?: Json | null
          answered_count?: number | null
          avg_time_seconds?: number | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          question_id?: string | null
          shown_count?: number | null
          skipped_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          experience_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          experience_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          experience_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      upvotes: {
        Row: {
          created_at: string | null
          experience_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      question_analytics_summary: {
        Row: {
          answer_rate: number | null
          avg_response_time: number | null
          category_id: string | null
          category_name: string | null
          question_id: string | null
          question_text: string | null
          total_answered: number | null
          total_shown: number | null
          total_skipped: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
