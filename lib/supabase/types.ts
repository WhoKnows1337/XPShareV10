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
        Relationships: [
          {
            foreignKeyName: "experience_views_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_views_viewer_user_id_fkey"
            columns: ["viewer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "research_citations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_streak: number | null
          display_name: string | null
          id: string
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
      witness_verifications: {
        Row: {
          experience_id: string | null
          id: string
          status: string | null
          verification_comment: string | null
          verified_at: string | null
          witness_user_id: string | null
        }
        Insert: {
          experience_id?: string | null
          id?: string
          status?: string | null
          verification_comment?: string | null
          verified_at?: string | null
          witness_user_id?: string | null
        }
        Update: {
          experience_id?: string | null
          id?: string
          status?: string | null
          verification_comment?: string | null
          verified_at?: string | null
          witness_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "witness_verifications_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "witness_verifications_witness_user_id_fkey"
            columns: ["witness_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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

type DefaultSchema = Database[keyof Database]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
