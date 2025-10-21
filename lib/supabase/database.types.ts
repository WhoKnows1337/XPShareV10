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
      ai_generated_questions: {
        Row: {
          admin_reviewed: boolean | null
          answer_text: string | null
          answered_at: string | null
          context_used: Json | null
          experience_id: string | null
          generated_at: string | null
          generated_question_text: string
          id: string
          options: Json | null
          parent_question_id: string | null
          promoted_to_template: boolean | null
          quality_rating: number | null
          question_type: string
          user_answer: string
          user_id: string | null
        }
        Insert: {
          admin_reviewed?: boolean | null
          answer_text?: string | null
          answered_at?: string | null
          context_used?: Json | null
          experience_id?: string | null
          generated_at?: string | null
          generated_question_text: string
          id?: string
          options?: Json | null
          parent_question_id?: string | null
          promoted_to_template?: boolean | null
          quality_rating?: number | null
          question_type: string
          user_answer: string
          user_id?: string | null
        }
        Update: {
          admin_reviewed?: boolean | null
          answer_text?: string | null
          answered_at?: string | null
          context_used?: Json | null
          experience_id?: string | null
          generated_at?: string | null
          generated_question_text?: string
          id?: string
          options?: Json | null
          parent_question_id?: string | null
          promoted_to_template?: boolean | null
          quality_rating?: number | null
          question_type?: string
          user_answer?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_questions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_questions_parent_question_id_fkey"
            columns: ["parent_question_id"]
            isOneToOne: false
            referencedRelation: "dynamic_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_questions_parent_question_id_fkey"
            columns: ["parent_question_id"]
            isOneToOne: false
            referencedRelation: "question_analytics_summary"
            referencedColumns: ["question_id"]
          },
        ]
      }
      attribute_schema: {
        Row: {
          allowed_values: Json | null
          category_slug: string | null
          created_at: string | null
          data_type: string | null
          description: string | null
          display_name: string
          display_name_de: string | null
          display_name_es: string | null
          display_name_fr: string | null
          is_filterable: boolean | null
          is_searchable: boolean | null
          key: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_values?: Json | null
          category_slug?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          display_name: string
          display_name_de?: string | null
          display_name_es?: string | null
          display_name_fr?: string | null
          is_filterable?: boolean | null
          is_searchable?: boolean | null
          key: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_values?: Json | null
          category_slug?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          display_name?: string
          display_name_de?: string | null
          display_name_es?: string | null
          display_name_fr?: string | null
          is_filterable?: boolean | null
          is_searchable?: boolean | null
          key?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attribute_suggestions: {
        Row: {
          attribute_key: string
          attribute_value: string
          created_at: string | null
          downvotes: number | null
          experience_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_by: string | null
          upvotes: number | null
        }
        Insert: {
          attribute_key: string
          attribute_value: string
          created_at?: string | null
          downvotes?: number | null
          experience_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
          upvotes?: number | null
        }
        Update: {
          attribute_key?: string
          attribute_value?: string
          created_at?: string | null
          downvotes?: number | null
          experience_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attribute_suggestions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
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
      category_follows: {
        Row: {
          category_slug: string
          created_at: string | null
          id: string
          notify_new_experiences: boolean | null
          notify_trending: boolean | null
          user_id: string
        }
        Insert: {
          category_slug: string
          created_at?: string | null
          id?: string
          notify_new_experiences?: boolean | null
          notify_trending?: boolean | null
          user_id: string
        }
        Update: {
          category_slug?: string
          created_at?: string | null
          id?: string
          notify_new_experiences?: boolean | null
          notify_trending?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      citations: {
        Row: {
          citation_number: number
          context_after: string | null
          context_before: string | null
          created_at: string | null
          experience_id: string | null
          id: string
          message_id: string
          relevance_score: number | null
          snippet_text: string | null
          tool_name: string | null
        }
        Insert: {
          citation_number: number
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          message_id: string
          relevance_score?: number | null
          snippet_text?: string | null
          tool_name?: string | null
        }
        Update: {
          citation_number?: number
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          message_id?: string
          relevance_score?: number | null
          snippet_text?: string | null
          tool_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          experience_id: string
          id: string
          parent_id: string | null
          reply_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          experience_id: string
          id?: string
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          experience_id?: string
          id?: string
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_attribute_suggestions: {
        Row: {
          attribute_key: string
          canonical_value: string
          created_at: string | null
          custom_value: string
          id: string
          last_used_at: string | null
          merged_into: string | null
          status: string | null
          times_used: number | null
        }
        Insert: {
          attribute_key: string
          canonical_value: string
          created_at?: string | null
          custom_value: string
          id?: string
          last_used_at?: string | null
          merged_into?: string | null
          status?: string | null
          times_used?: number | null
        }
        Update: {
          attribute_key?: string
          canonical_value?: string
          created_at?: string | null
          custom_value?: string
          id?: string
          last_used_at?: string | null
          merged_into?: string | null
          status?: string | null
          times_used?: number | null
        }
        Relationships: []
      }
      discovery_chats: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          created_at: string
          id: string
          pinned: boolean | null
          tags: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discovery_messages: {
        Row: {
          branch_id: string | null
          chat_id: string
          created_at: string
          id: string
          messages: Json
          reply_to_id: string | null
          thread_id: string | null
        }
        Insert: {
          branch_id?: string | null
          chat_id: string
          created_at?: string
          id?: string
          messages: Json
          reply_to_id?: string | null
          thread_id?: string | null
        }
        Update: {
          branch_id?: string | null
          chat_id?: string
          created_at?: string
          id?: string
          messages?: Json
          reply_to_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_messages_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "message_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "discovery_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "discovery_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discovery_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_questions: {
        Row: {
          adaptive_conditions: Json | null
          ai_adaptive: boolean | null
          allow_custom_value: boolean | null
          category_id: string | null
          conditional_logic: Json | null
          conditional_on_attribute: string | null
          conditional_value: string | null
          created_at: string | null
          created_by: string | null
          follow_up_question: Json | null
          help_text: string | null
          id: string
          is_active: boolean | null
          is_optional: boolean | null
          maps_to_attribute: string | null
          options: Json | null
          placeholder: string | null
          priority: number
          question_text: string
          question_type: string
          show_if: Json | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          adaptive_conditions?: Json | null
          ai_adaptive?: boolean | null
          allow_custom_value?: boolean | null
          category_id?: string | null
          conditional_logic?: Json | null
          conditional_on_attribute?: string | null
          conditional_value?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_question?: Json | null
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          maps_to_attribute?: string | null
          options?: Json | null
          placeholder?: string | null
          priority: number
          question_text: string
          question_type: string
          show_if?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          adaptive_conditions?: Json | null
          ai_adaptive?: boolean | null
          allow_custom_value?: boolean | null
          category_id?: string | null
          conditional_logic?: Json | null
          conditional_on_attribute?: string | null
          conditional_value?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_question?: Json | null
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          maps_to_attribute?: string | null
          options?: Json | null
          placeholder?: string | null
          priority?: number
          question_text?: string
          question_type?: string
          show_if?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_questions_maps_to_attribute_fkey"
            columns: ["maps_to_attribute"]
            isOneToOne: false
            referencedRelation: "attribute_schema"
            referencedColumns: ["key"]
          },
        ]
      }
      experience_answers: {
        Row: {
          answer_value: Json
          created_at: string | null
          experience_id: string
          id: string
          question_id: string
          updated_at: string | null
        }
        Insert: {
          answer_value: Json
          created_at?: string | null
          experience_id: string
          id?: string
          question_id: string
          updated_at?: string | null
        }
        Update: {
          answer_value?: Json
          created_at?: string | null
          experience_id?: string
          id?: string
          question_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_answers_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "dynamic_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_analytics_summary"
            referencedColumns: ["question_id"]
          },
        ]
      }
      experience_attributes: {
        Row: {
          attribute_key: string
          attribute_value: string
          confidence: number | null
          created_at: string | null
          created_by: string | null
          custom_value: string | null
          evidence: string | null
          experience_id: string
          id: string
          is_custom_value: boolean | null
          promoted_from_custom: string | null
          replaced_by: string | null
          source: string | null
          verified_by_user: boolean | null
        }
        Insert: {
          attribute_key: string
          attribute_value: string
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_value?: string | null
          evidence?: string | null
          experience_id: string
          id?: string
          is_custom_value?: boolean | null
          promoted_from_custom?: string | null
          replaced_by?: string | null
          source?: string | null
          verified_by_user?: boolean | null
        }
        Update: {
          attribute_key?: string
          attribute_value?: string
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_value?: string | null
          evidence?: string | null
          experience_id?: string
          id?: string
          is_custom_value?: boolean | null
          promoted_from_custom?: string | null
          replaced_by?: string | null
          source?: string | null
          verified_by_user?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_attributes_attribute_key_fkey"
            columns: ["attribute_key"]
            isOneToOne: false
            referencedRelation: "attribute_schema"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "experience_attributes_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_attributes_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "experience_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_drafts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experience_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          link_type: string | null
          linked_experience_id: string
          source_experience_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          link_type?: string | null
          linked_experience_id: string
          source_experience_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          link_type?: string | null
          linked_experience_id?: string
          source_experience_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_links_linked_experience_id_fkey"
            columns: ["linked_experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_links_source_experience_id_fkey"
            columns: ["source_experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_media: {
        Row: {
          caption: string | null
          created_at: string | null
          duration_seconds: number | null
          experience_id: string
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          sort_order: number | null
          type: string
          url: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          experience_id: string
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          sort_order?: number | null
          type: string
          url: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          experience_id?: string
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          sort_order?: number | null
          type?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_media_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_shares: {
        Row: {
          created_at: string | null
          experience_id: string
          id: string
          platform: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          id?: string
          platform: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          id?: string
          platform?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_shares_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "analytics_user_rankings"
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
      experience_witnesses: {
        Row: {
          contact_info: string | null
          created_at: string | null
          experience_id: string
          id: string
          is_verified: boolean | null
          name: string
          testimony: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          experience_id: string
          id?: string
          is_verified?: boolean | null
          name: string
          testimony?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          experience_id?: string
          id?: string
          is_verified?: boolean | null
          name?: string
          testimony?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_witnesses_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_witnesses_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_witnesses_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          ai_enhancement_used: boolean | null
          category: string
          comment_count: number | null
          created_at: string | null
          date_occurred: string | null
          embedding: string | null
          emotions: string[] | null
          enhancement_model: string | null
          geog: unknown | null
          id: string
          is_anonymous: boolean | null
          is_test_data: boolean | null
          language: string | null
          language_detected: string | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          options: Json | null
          question_answers: Json | null
          search_vector_de: unknown | null
          search_vector_en: unknown | null
          search_vector_es: unknown | null
          search_vector_fr: unknown | null
          story_audio_url: string | null
          story_text: string | null
          story_transcription: string | null
          sub_category: string | null
          tags: string[] | null
          time_of_day: string | null
          title: string
          translations: Json | null
          updated_at: string | null
          upvote_count: number | null
          user_edited_ai: boolean | null
          user_id: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          ai_enhancement_used?: boolean | null
          category: string
          comment_count?: number | null
          created_at?: string | null
          date_occurred?: string | null
          embedding?: string | null
          emotions?: string[] | null
          enhancement_model?: string | null
          geog?: unknown | null
          id?: string
          is_anonymous?: boolean | null
          is_test_data?: boolean | null
          language?: string | null
          language_detected?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          options?: Json | null
          question_answers?: Json | null
          search_vector_de?: unknown | null
          search_vector_en?: unknown | null
          search_vector_es?: unknown | null
          search_vector_fr?: unknown | null
          story_audio_url?: string | null
          story_text?: string | null
          story_transcription?: string | null
          sub_category?: string | null
          tags?: string[] | null
          time_of_day?: string | null
          title: string
          translations?: Json | null
          updated_at?: string | null
          upvote_count?: number | null
          user_edited_ai?: boolean | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          ai_enhancement_used?: boolean | null
          category?: string
          comment_count?: number | null
          created_at?: string | null
          date_occurred?: string | null
          embedding?: string | null
          emotions?: string[] | null
          enhancement_model?: string | null
          geog?: unknown | null
          id?: string
          is_anonymous?: boolean | null
          is_test_data?: boolean | null
          language?: string | null
          language_detected?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          options?: Json | null
          question_answers?: Json | null
          search_vector_de?: unknown | null
          search_vector_en?: unknown | null
          search_vector_es?: unknown | null
          search_vector_fr?: unknown | null
          story_audio_url?: string | null
          story_text?: string | null
          story_transcription?: string | null
          sub_category?: string | null
          tags?: string[] | null
          time_of_day?: string | null
          title?: string
          translations?: Json | null
          updated_at?: string | null
          upvote_count?: number | null
          user_edited_ai?: boolean | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_events: {
        Row: {
          created_at: string | null
          event_date: string
          event_name: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          event_date: string
          event_name?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          event_date?: string
          event_name?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          browser_info: Json | null
          console_logs: Json | null
          created_at: string
          description: string
          id: string
          page_url: string | null
          priority: string
          screenshot_url: string | null
          screenshots: Json | null
          status: string
          submitter_email: string | null
          submitter_name: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          console_logs?: Json | null
          created_at?: string
          description: string
          id?: string
          page_url?: string | null
          priority?: string
          screenshot_url?: string | null
          screenshots?: Json | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          console_logs?: Json | null
          created_at?: string
          description?: string
          id?: string
          page_url?: string | null
          priority?: string
          screenshot_url?: string | null
          screenshots?: Json | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          comment: string
          created_at: string
          feedback_id: string
          id: string
          is_internal: boolean | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          feedback_id: string
          id?: string
          is_internal?: boolean | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          feedback_id?: string
          id?: string
          is_internal?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string | null
          file_size: number | null
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          original_url: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_url: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_url?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string | null
          extracted_text: string | null
          file_size: number
          filename: string
          id: string
          media_type: string
          message_id: string
          storage_path: string
          storage_url: string
          user_id: string
          vision_description: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_text?: string | null
          file_size: number
          filename: string
          id?: string
          media_type: string
          message_id: string
          storage_path: string
          storage_url: string
          user_id: string
          vision_description?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_text?: string | null
          file_size?: number
          filename?: string
          id?: string
          media_type?: string
          message_id?: string
          storage_path?: string
          storage_url?: string
          user_id?: string
          vision_description?: string | null
        }
        Relationships: []
      }
      message_branches: {
        Row: {
          branch_name: string
          chat_id: string
          created_at: string | null
          id: string
          parent_message_id: string | null
        }
        Insert: {
          branch_name: string
          chat_id: string
          created_at?: string | null
          id?: string
          parent_message_id?: string | null
        }
        Update: {
          branch_name?: string
          chat_id?: string
          created_at?: string | null
          id?: string
          parent_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_branches_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "discovery_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_branches_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "discovery_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          message_id: string
          rating: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id: string
          rating: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_id?: string
          rating?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
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
      pattern_insights: {
        Row: {
          created_at: string | null
          experience_id: string
          expires_at: string | null
          id: string
          insight_data: Json
          pattern_type: string
          strength: number | null
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          expires_at?: string | null
          id?: string
          insight_data: Json
          pattern_type: string
          strength?: number | null
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          expires_at?: string | null
          id?: string
          insight_data?: Json
          pattern_type?: string
          strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_insights_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_system: boolean | null
          prompt_text: string
          title: string
          updated_at: string | null
          use_count: number | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          prompt_text: string
          title: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          prompt_text?: string
          title?: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
          variables?: Json | null
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
        Relationships: [
          {
            foreignKeyName: "question_analytics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_analytics_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "dynamic_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_analytics_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_analytics_summary"
            referencedColumns: ["question_id"]
          },
        ]
      }
      question_categories: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          emoji: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          level: number | null
          name: string
          parent_category_id: string | null
          slug: string
          sort_order: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name: string
          parent_category_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          name?: string
          parent_category_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "question_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query_text: string
          result_count: number | null
          search_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query_text: string
          result_count?: number | null
          search_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query_text?: string
          result_count?: number | null
          search_type?: string | null
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "reports_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      saved_searches: {
        Row: {
          alert_frequency: string | null
          created_at: string | null
          filters: Json | null
          id: string
          is_alert_enabled: boolean
          last_alert_sent_at: string | null
          name: string
          query: string
          search_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_frequency?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_alert_enabled?: boolean
          last_alert_sent_at?: string | null
          name: string
          query: string
          search_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_frequency?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_alert_enabled?: boolean
          last_alert_sent_at?: string | null
          name?: string
          query?: string
          search_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_alert_matches: {
        Row: {
          experience_id: string
          id: string
          matched_at: string
          notified_at: string | null
          saved_search_id: string
          was_notified: boolean
        }
        Insert: {
          experience_id: string
          id?: string
          matched_at?: string
          notified_at?: string | null
          saved_search_id: string
          was_notified?: boolean
        }
        Update: {
          experience_id?: string
          id?: string
          matched_at?: string
          notified_at?: string | null
          saved_search_id?: string
          was_notified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "search_alert_matches_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_alert_matches_saved_search_id_fkey"
            columns: ["saved_search_id"]
            isOneToOne: false
            referencedRelation: "saved_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      search_alerts: {
        Row: {
          created_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_result_count: number | null
          last_triggered_at: string | null
          name: string
          query_config: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_result_count?: number | null
          last_triggered_at?: string | null
          name: string
          query_config: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_result_count?: number | null
          last_triggered_at?: string | null
          name?: string
          query_config?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string | null
          execution_time_ms: number | null
          filters: Json | null
          id: string
          language: string | null
          query_embedding: string | null
          query_text: string
          result_count: number | null
          search_type: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          language?: string | null
          query_embedding?: string | null
          query_text: string
          result_count?: number | null
          search_type?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          language?: string | null
          query_embedding?: string | null
          query_text?: string
          result_count?: number | null
          search_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_clicked_result_id_fkey"
            columns: ["clicked_result_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          clicked_position: number | null
          clicked_result_id: string | null
          created_at: string | null
          execution_time_ms: number | null
          filters: Json | null
          id: string
          language: string | null
          query_text: string
          result_count: number | null
          search_type: string
          session_id: string | null
          time_to_click_ms: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_position?: number | null
          clicked_result_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          language?: string | null
          query_text: string
          result_count?: number | null
          search_type: string
          session_id?: string | null
          time_to_click_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_position?: number | null
          clicked_result_id?: string | null
          created_at?: string | null
          execution_time_ms?: number | null
          filters?: Json | null
          id?: string
          language?: string | null
          query_text?: string
          result_count?: number | null
          search_type?: string
          session_id?: string | null
          time_to_click_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_queries_clicked_result_id_fkey"
            columns: ["clicked_result_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      session_memory: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          session_id: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          session_id: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          session_id?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      shared_chats: {
        Row: {
          chat_id: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          share_token: string
          view_count: number | null
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          share_token: string
          view_count?: number | null
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          share_token?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_chats_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "discovery_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      streak_activity_log: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "upvotes_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          completion_cost: number
          completion_tokens: number
          created_at: string | null
          id: string
          message_id: string | null
          model: string
          prompt_cost: number
          prompt_tokens: number
          session_id: string | null
          total_cost: number
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_cost?: number
          completion_tokens: number
          created_at?: string | null
          id?: string
          message_id?: string | null
          model?: string
          prompt_cost?: number
          prompt_tokens: number
          session_id?: string | null
          total_cost?: number
          total_tokens: number
          user_id: string
        }
        Update: {
          completion_cost?: number
          completion_tokens?: number
          created_at?: string | null
          id?: string
          message_id?: string | null
          model?: string
          prompt_cost?: number
          prompt_tokens?: number
          session_id?: string | null
          total_cost?: number
          total_tokens?: number
          user_id?: string
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
            referencedRelation: "analytics_user_rankings"
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
      user_category_stats: {
        Row: {
          category: string
          created_at: string | null
          experience_count: number
          id: string
          is_top_category: boolean
          last_experience_date: string | null
          percentage: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          experience_count?: number
          id?: string
          is_top_category?: boolean
          last_experience_date?: string | null
          percentage?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          experience_count?: number
          id?: string
          is_top_category?: boolean
          last_experience_date?: string | null
          percentage?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_category_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_category_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          message: string | null
          requester_id: string
          responded_at: string | null
          similarity_score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          message?: string | null
          requester_id: string
          responded_at?: string | null
          similarity_score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string
          responded_at?: string | null
          similarity_score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          scope: string
          source: string | null
          updated_at: string | null
          user_id: string
          value: Json
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          scope: string
          source?: string | null
          updated_at?: string | null
          user_id: string
          value: Json
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          scope?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      user_pattern_contributions: {
        Row: {
          contribution_count: number
          created_at: string | null
          first_contribution_date: string | null
          id: string
          last_contribution_date: string | null
          pattern_description: string | null
          pattern_title: string
          pattern_type: string
          related_experience_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contribution_count?: number
          created_at?: string | null
          first_contribution_date?: string | null
          id?: string
          last_contribution_date?: string | null
          pattern_description?: string | null
          pattern_title: string
          pattern_type: string
          related_experience_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contribution_count?: number
          created_at?: string | null
          first_contribution_date?: string | null
          id?: string
          last_contribution_date?: string | null
          pattern_description?: string | null
          pattern_title?: string
          pattern_type?: string
          related_experience_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pattern_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pattern_contributions_user_id_fkey"
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
      user_similarity_cache: {
        Row: {
          calculated_at: string
          same_location: boolean | null
          shared_categories: string[] | null
          shared_category_count: number | null
          similar_user_id: string
          similarity_score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          same_location?: boolean | null
          shared_categories?: string[] | null
          shared_category_count?: number | null
          similar_user_id: string
          similarity_score: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          same_location?: boolean | null
          shared_categories?: string[] | null
          shared_category_count?: number | null
          similar_user_id?: string
          similarity_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_similarity_cache_similar_user_id_fkey"
            columns: ["similar_user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_similarity_cache_similar_user_id_fkey"
            columns: ["similar_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_similarity_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_similarity_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          total_comments: number | null
          total_experiences: number | null
          total_reactions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_comments?: number | null
          total_experiences?: number | null
          total_reactions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_comments?: number | null
          total_experiences?: number | null
          total_reactions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      witness_verifications: {
        Row: {
          author_user_id: string | null
          created_at: string | null
          experience_id: string
          id: string
          status: string | null
          updated_at: string
          verification_comment: string | null
          verified_at: string | null
          witness_user_id: string
        }
        Insert: {
          author_user_id?: string | null
          created_at?: string | null
          experience_id: string
          id?: string
          status?: string | null
          updated_at?: string
          verification_comment?: string | null
          verified_at?: string | null
          witness_user_id: string
        }
        Update: {
          author_user_id?: string | null
          created_at?: string | null
          experience_id?: string
          id?: string
          status?: string | null
          updated_at?: string
          verification_comment?: string | null
          verified_at?: string | null
          witness_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "witness_verifications_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "analytics_user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "witness_verifications_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "witness_verifications_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_dna_cache: {
        Row: {
          category_distribution: Json
          category_vector: Json
          created_at: string
          date_range: unknown | null
          experience_ids: string[]
          last_calculated_at: string
          location_centroid: unknown | null
          top_categories: string[]
          total_experiences: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_distribution?: Json
          category_vector?: Json
          created_at?: string
          date_range?: unknown | null
          experience_ids?: string[]
          last_calculated_at?: string
          location_centroid?: unknown | null
          top_categories?: string[]
          total_experiences?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_distribution?: Json
          category_vector?: Json
          created_at?: string
          date_range?: unknown | null
          experience_ids?: string[]
          last_calculated_at?: string
          location_centroid?: unknown | null
          top_categories?: string[]
          total_experiences?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_category_stats: {
        Row: {
          category: string | null
          geo_count: number | null
          temporal_count: number | null
          total_count: number | null
          total_upvotes: number | null
          total_views: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_geo_hotspots: {
        Row: {
          category: string | null
          center_lat: number | null
          center_lng: number | null
          count: number | null
          grid_lat: number | null
          grid_lng: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_temporal_monthly: {
        Row: {
          category: string | null
          count: number | null
          month: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_user_rankings: {
        Row: {
          categories_count: number | null
          display_name: string | null
          experience_count: number | null
          id: string | null
          total_upvotes: number | null
          total_views: number | null
          username: string | null
        }
        Relationships: []
      }
      failed_searches: {
        Row: {
          affected_users: number | null
          failure_count: number | null
          last_failed: string | null
          query_text: string | null
          search_type: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      popular_searches: {
        Row: {
          avg_execution_time: number | null
          avg_results: number | null
          click_through_rate: number | null
          last_searched: string | null
          query_text: string | null
          search_count: number | null
          unique_users: number | null
        }
        Relationships: []
      }
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
        Relationships: [
          {
            foreignKeyName: "dynamic_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connection_status: {
        Row: {
          connection_id: string | null
          created_at: string | null
          direction: string | null
          other_user_id: string | null
          similarity_score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          direction?: never
          other_user_id?: never
          similarity_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          direction?: never
          other_user_id?: never
          similarity_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      analyze_attribute_correlation: {
        Args: {
          p_attribute_key1: string
          p_attribute_value1: string
          p_category_slug?: string
        }
        Returns: {
          attribute_key: string
          attribute_value: string
          correlation_count: number
          correlation_percentage: number
          strength: string
        }[]
      }
      analyze_tag_network: {
        Args: { p_experience_ids: string[]; p_min_cooccurrence?: number }
        Returns: {
          cooccurrence_count: number
          experiences: string[]
          metadata: Json
          tag1: string
          tag2: string
        }[]
      }
      apply_question_template: {
        Args: {
          p_category_id: string
          p_template_id: string
          p_user_id: string
        }
        Returns: {
          adaptive_conditions: Json | null
          ai_adaptive: boolean | null
          allow_custom_value: boolean | null
          category_id: string | null
          conditional_logic: Json | null
          conditional_on_attribute: string | null
          conditional_value: string | null
          created_at: string | null
          created_by: string | null
          follow_up_question: Json | null
          help_text: string | null
          id: string
          is_active: boolean | null
          is_optional: boolean | null
          maps_to_attribute: string | null
          options: Json | null
          placeholder: string | null
          priority: number
          question_text: string
          question_type: string
          show_if: Json | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }[]
      }
      approve_attribute_suggestion: {
        Args: { p_reviewer_id: string; p_suggestion_id: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_cosine_similarity: {
        Args:
          | { user_id_1: string; user_id_2: string }
          | { vector1: Json; vector2: Json }
        Returns: number
      }
      calculate_jaccard_similarity: {
        Args:
          | { categories1: string[]; categories2: string[] }
          | { user_id_1: string; user_id_2: string }
        Returns: number
      }
      calculate_location_proximity: {
        Args: { loc1: unknown; loc2: unknown }
        Returns: number
      }
      calculate_pattern_strength: {
        Args: { p_experience_id1: string; p_experience_id2: string }
        Returns: number
      }
      calculate_search_ctr: {
        Args: { time_window_days?: number }
        Returns: {
          avg_ctr: number
          total_clicks: number
          total_searches: number
        }[]
      }
      calculate_similarity_score: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: number
      }
      calculate_temporal_overlap: {
        Args: { range1: unknown; range2: unknown }
        Returns: number
      }
      calculate_user_impact: {
        Args: { target_user_id: string }
        Returns: {
          categories_contributed: number
          countries_reached: number
          impact_score: number
          influence_multiplier: number
          total_experiences: number
          total_reactions: number
          total_views: number
        }[]
      }
      calculate_user_similarity: {
        Args: { user1_id: string; user2_id: string }
        Returns: Json
      }
      calculate_user_xp_dna: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_search_alerts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      count_experiences_by_attributes: {
        Args: {
          p_attribute_filters: Json
          p_category_slug?: string
          p_match_mode?: string
        }
        Returns: number
      }
      count_similar_experiences: {
        Args: {
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          count: number
        }[]
      }
      delete_expired_session_memory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_old_drafts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_cross_category_patterns: {
        Args: { p_experience_ids: string[]; p_min_overlap?: number }
        Returns: {
          category1: string
          category2: string
          experiences: string[]
          metadata: Json
          overlap_count: number
        }[]
      }
      detect_geo_clusters: {
        Args: {
          p_categories?: string[]
          p_epsilon_km?: number
          p_min_points?: number
        }
        Returns: {
          avg_distance_km: number
          category_distribution: Json
          center_lat: number
          center_lng: number
          cluster_id: number
          experience_count: number
        }[]
      }
      detect_geographic_clusters: {
        Args: {
          p_epsilon_km?: number
          p_experience_ids: string[]
          p_min_points?: number
        }
        Returns: {
          cluster_id: number
          experiences: string[]
          metadata: Json
          pattern_count: number
        }[]
      }
      detect_temporal_patterns: {
        Args: { p_experience_ids: string[] }
        Returns: {
          experiences: string[]
          metadata: Json
          pattern_count: number
          pattern_type: string
        }[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      execute_saved_search: {
        Args: {
          p_filters: Json
          p_query: string
          p_search_id: string
          p_search_type: string
        }
        Returns: {
          experience_id: string
          similarity: number
          title: string
        }[]
      }
      find_attribute_geographic_clusters: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_min_count?: number
        }
        Returns: {
          date_range: unknown
          latitude: number
          location_text: string
          longitude: number
          sighting_count: number
        }[]
      }
      find_attribute_temporal_patterns: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_granularity?: string
        }
        Returns: {
          percentage: number
          sighting_count: number
          time_period: string
        }[]
      }
      find_experiences_by_shared_attributes: {
        Args: {
          p_experience_id: string
          p_limit?: number
          p_threshold?: number
        }
        Returns: {
          experience_id: string
          shared_attributes: Json
          shared_count: number
          similarity_score: number
          total_attributes: number
        }[]
      }
      find_geographic_clusters: {
        Args: {
          category_filter?: string
          center_lat: number
          center_lng: number
          search_radius_km?: number
        }
        Returns: {
          center: unknown
          count: number
          radius_km: number
          region: string
        }[]
      }
      find_interested_users: {
        Args: {
          category_filter?: string
          location_filter?: string
          max_users?: number
        }
        Returns: {
          experience_count: number
          id: string
          match_score: number
          username: string
        }[]
      }
      find_related_experiences: {
        Args: {
          p_experience_id: string
          p_max_results?: number
          p_min_score?: number
          p_use_attributes?: boolean
          p_use_geographic?: boolean
          p_use_semantic?: boolean
          p_use_temporal?: boolean
        }
        Returns: {
          attribute_score: number
          category: string
          geographic_score: number
          id: string
          semantic_score: number
          similarity_score: number
          temporal_score: number
          title: string
        }[]
      }
      find_similar_experiences: {
        Args: {
          category_filter?: string
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          content: string
          created_at: string
          id: string
          location: Json
          occurred_at: string
          similarity: number
          title: string
          user_data: Json
        }[]
      }
      find_similar_users: {
        Args:
          | { limit_count?: number; target_user_id: string }
          | {
              match_count?: number
              match_threshold?: number
              target_user_id: string
            }
        Returns: {
          avatar_url: string
          common_categories: string[]
          similarity_score: number
          user_id: string
          username: string
        }[]
      }
      find_temporal_clusters: {
        Args: {
          category_filter?: string
          days_window?: number
          target_date: string
        }
        Returns: {
          count: number
          end_date: string
          period: string
          start_date: string
        }[]
      }
      find_xp_twins: {
        Args:
          | {
              match_limit?: number
              min_similarity?: number
              target_user_id: string
            }
          | { p_limit?: number; p_min_score?: number; p_user_id: string }
        Returns: {
          connection_status: string
          shared_categories: string[]
          similarity_breakdown: Json
          similarity_score: number
          twin_avatar_url: string
          twin_display_name: string
          twin_top_categories: string[]
          twin_total_xp: number
          twin_user_id: string
          twin_username: string
        }[]
      }
      follow_user: {
        Args:
          | { p_follower_id: string; p_following_id: string }
          | { target_user_id: string }
        Returns: Json
      }
      full_text_search: {
        Args: {
          p_categories?: string[]
          p_date_from?: string
          p_date_to?: string
          p_language?: string
          p_limit?: number
          p_query: string
        }
        Returns: {
          category: string
          created_at: string
          date_occurred: string
          description: string
          id: string
          location_text: string
          rank: number
          title: string
          upvote_count: number
          user_id: string
          view_count: number
        }[]
      }
      geo_search: {
        Args: {
          p_bounding_box?: Json
          p_categories?: string[]
          p_center_lat?: number
          p_center_lng?: number
          p_limit?: number
          p_radius_km?: number
        }
        Returns: {
          category: string
          created_at: string
          description: string
          distance_km: number
          id: string
          location_lat: number
          location_lng: number
          location_text: string
          title: string
        }[]
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_ai_question_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_quality: number
          needs_review: number
          promoted_count: number
          total_answered: number
          total_generated: number
        }[]
      }
      get_attribute_co_occurrence: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_min_occurrences?: number
        }
        Returns: {
          co_attribute_key: string
          co_attribute_value: string
          co_occurrence_percentage: number
          occurrence_count: number
        }[]
      }
      get_attribute_confidence_stats: {
        Args: { p_attribute_key?: string }
        Returns: {
          ai_extracted: number
          attribute_key: string
          avg_ai_confidence: number
          avg_confirmed_confidence: number
          confirmation_rate: number
          total_extractions: number
          user_confirmed: number
        }[]
      }
      get_attribute_correlation: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_category?: string
          p_correlation_category?: string
        }
        Returns: {
          correlation_count: number
          correlation_percentage: number
          total_count: number
        }[]
      }
      get_attribute_geographic_clusters: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_min_sightings?: number
        }
        Returns: {
          center_lat: number
          center_lng: number
          location_text: string
          sighting_count: number
        }[]
      }
      get_attribute_patterns: {
        Args: { p_attribute_key: string; p_min_occurrences?: number }
        Returns: {
          attribute_value: string
          co_occurring_attributes: Json
          occurrence_count: number
          percentage: number
        }[]
      }
      get_attribute_temporal_patterns: {
        Args: {
          p_attribute_key: string
          p_attribute_value: string
          p_granularity?: string
          p_limit?: number
        }
        Returns: {
          sighting_count: number
          time_period: string
        }[]
      }
      get_attribute_value_counts: {
        Args: { p_attribute_key: string; p_category_slug?: string }
        Returns: {
          attribute_value: string
          count: number
        }[]
      }
      get_attribute_value_distribution: {
        Args: { p_attribute_key: string; p_category?: string }
        Returns: {
          attribute_value: string
          avg_confidence: number
          value_count: number
          value_percentage: number
        }[]
      }
      get_attribute_values_for_key: {
        Args: {
          p_attribute_key: string
          p_category_slug?: string
          p_min_count?: number
        }
        Returns: {
          attribute_value: string
          categories: Json
          experience_count: number
        }[]
      }
      get_available_attribute_keys: {
        Args: { p_category_slug?: string }
        Returns: {
          attribute_key: string
          experience_count: number
          sample_values: string[]
          value_count: number
        }[]
      }
      get_available_attribute_values: {
        Args: {
          p_attribute_key: string
          p_category_slug?: string
          p_min_count?: number
        }
        Returns: {
          attribute_value: string
          avg_confidence: number
          experience_count: number
        }[]
      }
      get_category_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          answer_rate_percent: number
          avg_response_time: number
          category_id: string
          category_name: string
          category_slug: string
          total_answered: number
          total_questions: number
          total_shown: number
          total_skipped: number
        }[]
      }
      get_category_stats: {
        Args: { p_categories?: string[] }
        Returns: {
          category: string
          geo_count: number
          temporal_count: number
          total_count: number
          total_upvotes: number
          total_views: number
          unique_users: number
        }[]
      }
      get_cross_category_insights: {
        Args: { p_category: string }
        Returns: {
          category_icon: string
          category_name: string
          category_slug: string
          correlation: number
        }[]
      }
      get_experience_attributes: {
        Args: { p_experience_id: string; p_locale?: string }
        Returns: {
          attribute_key: string
          attribute_value: string
          confidence: number
          display_name: string
          display_value: string
          source: string
          verified_by_user: boolean
        }[]
      }
      get_followed_categories: {
        Args: { p_user_id: string }
        Returns: {
          category_slug: string
          created_at: string
          notify_new_experiences: boolean
          notify_trending: boolean
        }[]
      }
      get_follower_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_following_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_following_feed: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          category: string
          comment_count: number
          created_at: string
          date_occurred: string
          id: string
          location_text: string
          story_text: string
          tags: string[]
          time_of_day: string
          title: string
          upvote_count: number
          user_profiles: Json
          view_count: number
        }[]
      }
      get_for_you_feed: {
        Args: {
          p_liked_categories: string[]
          p_limit?: number
          p_offset?: number
          p_user_id: string
          p_user_location?: string
        }
        Returns: {
          category: string
          comment_count: number
          created_at: string
          date_occurred: string
          id: string
          location_text: string
          story_text: string
          tags: string[]
          time_of_day: string
          title: string
          upvote_count: number
          user_profiles: Json
          view_count: number
        }[]
      }
      get_nearby_experiences: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          category: string
          created_at: string
          distance_km: number
          id: string
          location_lat: number
          location_lng: number
          title: string
        }[]
      }
      get_next_question_priority: {
        Args: { p_category_id: string }
        Returns: number
      }
      get_pattern_summary: {
        Args: { p_experience_ids: string[]; p_options?: Json }
        Returns: Json
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_same_time_experiences: {
        Args: { p_experience_id: string; p_time_window_days?: number }
        Returns: {
          category: string
          date_occurred: string
          id: string
          time_difference_hours: number
          title: string
          user_profiles: Json
        }[]
      }
      get_seasonal_pattern: {
        Args: { category_slug_param: string }
        Returns: {
          avg_experiences: number
          experience_count: number
          month: number
          month_name: string
          trend: string
        }[]
      }
      get_shared_categories: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: string[]
      }
      get_similar_experiences_by_attributes: {
        Args: {
          p_experience_id: string
          p_limit?: number
          p_min_shared_attributes?: number
        }
        Returns: {
          category: string
          shared_attributes_count: number
          similar_experience_id: string
          similarity_score: number
          title: string
        }[]
      }
      get_similarity_explanation: {
        Args: { p_experience_id1: string; p_experience_id2: string }
        Returns: Json
      }
      get_top_searches: {
        Args: { days_ago?: number; limit_count?: number }
        Returns: {
          avg_results: number
          count: number
          last_searched: string
          query: string
        }[]
      }
      get_user_category_stats: {
        Args: { target_user_id: string }
        Returns: {
          category: string
          experience_count: number
          is_top_category: boolean
          last_experience_date: string
          percentage: number
        }[]
      }
      get_user_comparison: {
        Args: { p_user1_id: string; p_user2_id: string }
        Returns: Json
      }
      get_xp_twins_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_zero_result_searches: {
        Args: { result_limit?: number; time_window_days?: number }
        Returns: {
          language: string
          last_searched: string
          query_text: string
          search_count: number
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      hybrid_search: {
        Args: {
          p_category?: string
          p_fts_weight?: number
          p_language?: string
          p_limit?: number
          p_query_embedding: string
          p_query_text: string
          p_vector_weight?: number
        }
        Returns: {
          avatar_url: string
          category: string
          combined_score: number
          created_at: string
          date_occurred: string
          display_name: string
          fts_score: number
          id: string
          location_lat: number
          location_lng: number
          location_text: string
          story_text: string
          tags: string[]
          title: string
          user_id: string
          username: string
          vector_score: number
        }[]
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_following: {
        Args:
          | { p_follower_id: string; p_following_id: string }
          | { target_user_id: string }
        Returns: boolean
      }
      is_following_category: {
        Args: { p_category_slug: string; p_user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_experiences: {
        Args: {
          filter_category?: string
          filter_date_from?: string
          filter_date_to?: string
          filter_keywords?: string[]
          filter_tags?: string[]
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          date_occurred: string
          exact_match: boolean
          id: string
          location_text: string
          similarity: number
          story_text: string
          tags: string[]
          title: string
        }[]
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      predict_next_wave: {
        Args:
          | { category_param: string; days_ahead?: number }
          | { p_category?: string }
        Returns: {
          date_range: string
          event_type: string
          probability: number
        }[]
      }
      promote_ai_question_to_template: {
        Args: { ai_question_id: string; template_question_text?: string }
        Returns: string
      }
      refresh_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_analytics_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_stale_similarity_caches: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      refresh_user_similarity_cache: {
        Args: { target_user_id: string }
        Returns: number
      }
      reject_attribute_suggestion: {
        Args: { p_reviewer_id: string; p_suggestion_id: string }
        Returns: Json
      }
      search_by_attributes: {
        Args:
          | {
              p_attribute_filters: Json
              p_category: string
              p_limit?: number
              p_logic?: string
              p_min_confidence?: number
            }
          | { p_attribute_filters: Json; p_limit?: number; p_offset?: number }
        Returns: {
          category: string
          date_occurred: string
          id: string
          location_text: string
          matched_attributes: Json
          story_text: string
          title: string
        }[]
      }
      search_experiences_by_attributes: {
        Args: {
          p_attribute_filters: Json
          p_category_slug?: string
          p_limit?: number
          p_match_mode?: string
          p_offset?: number
        }
        Returns: {
          category: string
          comment_count: number
          created_at: string
          id: string
          matched_attributes: Json
          summary: string
          title: string
          upvote_count: number
          user_id: string
          view_count: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      temporal_aggregation: {
        Args: {
          p_categories?: string[]
          p_date_from?: string
          p_date_to?: string
          p_granularity?: string
          p_group_by?: string
        }
        Returns: {
          category: string
          count: number
          period: string
          unique_users: number
        }[]
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      track_question_answered: {
        Args: {
          p_answer?: Json
          p_category_id: string
          p_question_id: string
          p_time_seconds?: number
        }
        Returns: undefined
      }
      track_question_shown: {
        Args: { p_category_id: string; p_question_id: string }
        Returns: undefined
      }
      track_question_skipped: {
        Args: { p_category_id: string; p_question_id: string }
        Returns: undefined
      }
      track_search: {
        Args: {
          p_execution_time_ms?: number
          p_filters?: Json
          p_language?: string
          p_query_text: string
          p_result_count: number
          p_search_type: string
          p_user_id: string
        }
        Returns: string
      }
      track_search_click: {
        Args: {
          p_position: number
          p_query_id: string
          p_result_id: string
          p_time_to_click_ms?: number
        }
        Returns: undefined
      }
      track_search_query: {
        Args: {
          p_execution_time_ms?: number
          p_filters?: Json
          p_language?: string
          p_query_text: string
          p_result_count?: number
          p_search_type: string
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      unfollow_user: {
        Args:
          | { p_follower_id: string; p_following_id: string }
          | { target_user_id: string }
        Returns: Json
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_pattern_insights_for_experience: {
        Args: { p_experience_id: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_activity_type?: string; p_user_id: string }
        Returns: Json
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
