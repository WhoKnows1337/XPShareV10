// =====================================================
// ADMIN PANEL TYPES
// Type definitions for the admin questions system
// =====================================================

export type QuestionType =
  // Existing types
  | 'chips'              // Single choice (radio buttons)
  | 'chips-multi'        // Multiple choice (checkboxes)
  | 'text'               // Short text input
  | 'boolean'            // Yes/No
  | 'slider'             // Numeric slider
  | 'date'               // Date picker
  | 'time'               // Time picker
  // Enhanced types
  | 'dropdown'           // Single dropdown select
  | 'dropdown-multi'     // Multi-select dropdown
  | 'image-select'       // Select from images (single)
  | 'image-multi'        // Select from images (multiple)
  | 'rating'             // Star rating (1-5)
  | 'color'              // Color picker
  | 'range'              // Min-Max range
  | 'ai-text'            // AI extracts attribute from free text
  | 'textarea'           // Long text input

export type ChangeType = 'created' | 'updated' | 'deleted' | 'reordered' | 'activated' | 'deactivated'

export type EntityType = 'category' | 'question'

export type AdminRole = 'super_admin' | 'content_manager' | 'analyst'

// =====================================================
// QUESTION CATEGORY
// =====================================================
export interface QuestionCategory {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface QuestionCategoryWithQuestions extends QuestionCategory {
  questions?: DynamicQuestion[]
  question_count?: number
}

// =====================================================
// DYNAMIC QUESTION
// =====================================================
export interface QuestionOption {
  value: string
  label: string
  icon?: string
  image_url?: string        // For image-select/image-multi types
  image_id?: string         // Reference to media library
  color?: string            // For color options
  description?: string      // Optional description/tooltip
}

export interface ConditionalLogic {
  show_if?: {
    question_id: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: string | number | boolean
  }[]
}

export interface FollowUpQuestion {
  trigger_value: string | number | boolean
  question: Omit<DynamicQuestion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
}

export interface DynamicQuestion {
  id: string
  category_id: string | null
  question_text: string
  question_type: QuestionType
  options: QuestionOption[]
  priority: number
  is_optional: boolean
  help_text: string | null
  placeholder: string | null
  conditional_logic: ConditionalLogic
  follow_up_question: FollowUpQuestion | null
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  analytics?: {
    total_shown: number
    total_answered: number
    answer_rate_percent: number
    avg_time: number
  }
}

// =====================================================
// QUESTION CHANGE HISTORY
// =====================================================
export interface QuestionChangeHistory {
  id: string
  entity_type: EntityType
  entity_id: string
  changed_by: string | null
  changed_at: string
  change_type: ChangeType
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  description: string | null
}

export interface QuestionChangeHistoryWithUser extends QuestionChangeHistory {
  user?: {
    email: string
    username: string | null
  }
}

// =====================================================
// QUESTION TEMPLATE
// =====================================================
export interface QuestionTemplate {
  id: string
  name: string
  description: string | null
  category_id: string | null
  questions: Omit<DynamicQuestion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[]
  tags: string[]
  is_public: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface QuestionTemplateWithCategory extends QuestionTemplate {
  category?: QuestionCategory
}

// =====================================================
// ADMIN ROLE
// =====================================================
export interface AdminRoleData {
  id: string
  user_id: string
  role: AdminRole
  permissions: {
    can_manage_categories?: boolean
    can_manage_questions?: boolean
    can_view_analytics?: boolean
    can_manage_users?: boolean
    can_manage_templates?: boolean
  }
  created_at: string
  updated_at: string
}

export interface AdminRoleWithUser extends AdminRoleData {
  user?: {
    email: string
    username: string | null
  }
}

// =====================================================
// QUESTION ANALYTICS
// =====================================================
export interface QuestionAnalytics {
  id: string
  question_id: string
  date: string
  views_count: number
  responses_count: number
  completion_rate: number | null
  avg_response_length: number | null
  created_at: string
  updated_at: string
}

export interface QuestionAnalyticsWithQuestion extends QuestionAnalytics {
  question?: DynamicQuestion
}

// =====================================================
// FORM TYPES (for admin UI)
// =====================================================
export interface CreateQuestionCategoryInput {
  slug: string
  name: string
  description?: string
  icon?: string
  sort_order?: number
  is_active?: boolean
}

export interface UpdateQuestionCategoryInput extends Partial<CreateQuestionCategoryInput> {
  id: string
}

export interface CreateDynamicQuestionInput {
  category_id: string | null
  question_text: string
  question_type: QuestionType
  options?: QuestionOption[]
  priority?: number
  is_optional?: boolean
  help_text?: string
  placeholder?: string
  conditional_logic?: ConditionalLogic
  follow_up_question?: FollowUpQuestion
  tags?: string[]
  is_active?: boolean
}

export interface UpdateDynamicQuestionInput extends Partial<CreateDynamicQuestionInput> {
  id: string
}

export interface CreateQuestionTemplateInput {
  name: string
  description?: string
  category_id?: string
  questions: Omit<DynamicQuestion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[]
  tags?: string[]
  is_public?: boolean
}

export interface ReorderQuestionsInput {
  category_id: string
  question_ids: string[]
}

// =====================================================
// API RESPONSE TYPES
// =====================================================
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// =====================================================
// ANALYTICS TYPES
// =====================================================
export interface CategoryAnalytics {
  category_id: string
  category_name: string
  total_questions: number
  active_questions: number
  total_views: number
  total_responses: number
  avg_completion_rate: number
}

export interface QuestionPerformance {
  question_id: string
  question_text: string
  question_type: QuestionType
  views: number
  responses: number
  completion_rate: number
  avg_response_length: number | null
}

// =====================================================
// BULK OPERATIONS
// =====================================================
export interface BulkQuestionOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'tag' | 'untag' | 'move'
  question_ids: string[]
  params?: {
    tags?: string[]
    category_id?: string
  }
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors: Array<{
    question_id: string
    error: string
  }>
}
