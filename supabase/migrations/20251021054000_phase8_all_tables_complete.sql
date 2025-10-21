-- =====================================================
-- Phase 8 Tables Migration - COMPLETE
-- Generated: 2025-10-21
-- Source: Production database schema (via Supabase MCP)
-- Tables: 9 (citations, discovery_chats, discovery_messages, message_attachments,
--           message_branches, prompt_templates, shared_chats, usage_tracking, user_memory)
-- Total Columns: 83
-- =====================================================

-- 1. CITATIONS (10 columns)
CREATE TABLE IF NOT EXISTS public.citations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  experience_id uuid,
  citation_number int4 NOT NULL,
  relevance_score numeric,
  snippet_text text,
  context_before text,
  context_after text,
  created_at timestamptz DEFAULT now(),
  tool_name text,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_citations_message_id ON public.citations(message_id);
CREATE INDEX IF NOT EXISTS idx_citations_experience_id ON public.citations(experience_id);

-- 2. DISCOVERY_CHATS (9 columns)
CREATE TABLE IF NOT EXISTS public.discovery_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  pinned bool DEFAULT false,
  archived bool DEFAULT false,
  tags jsonb DEFAULT '[]'::jsonb,
  archived_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_discovery_chats_user_id ON public.discovery_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_chats_updated_at ON public.discovery_chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_chats_pinned ON public.discovery_chats(pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_discovery_chats_archived ON public.discovery_chats(archived) WHERE archived = true;
CREATE INDEX IF NOT EXISTS idx_discovery_chats_tags ON public.discovery_chats USING gin(tags);

-- 3. DISCOVERY_MESSAGES (7 columns)
CREATE TABLE IF NOT EXISTS public.discovery_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  messages jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  branch_id uuid,
  reply_to_id uuid,
  thread_id uuid,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_discovery_messages_chat_id ON public.discovery_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_discovery_messages_branch_id ON public.discovery_messages(branch_id);
CREATE INDEX IF NOT EXISTS idx_discovery_messages_reply_to_id ON public.discovery_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_discovery_messages_thread_id ON public.discovery_messages(thread_id);

-- 4. MESSAGE_ATTACHMENTS (11 columns)
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  filename text NOT NULL,
  media_type text NOT NULL,
  file_size int8 NOT NULL,
  storage_path text NOT NULL,
  storage_url text NOT NULL,
  extracted_text text,
  vision_description text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_user_id ON public.message_attachments(user_id);

-- 5. MESSAGE_BRANCHES (5 columns)
CREATE TABLE IF NOT EXISTS public.message_branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  parent_message_id uuid,
  branch_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_message_branches_chat_id ON public.message_branches(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_branches_parent_message_id ON public.message_branches(parent_message_id);

-- 6. PROMPT_TEMPLATES (12 columns)
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general'::text,
  prompt_text text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_system bool DEFAULT false,
  is_favorite bool DEFAULT false,
  use_count int4 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON public.prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON public.prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_system ON public.prompt_templates(is_system);

-- 7. SHARED_CHATS (7 columns)
CREATE TABLE IF NOT EXISTS public.shared_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  share_token text NOT NULL,
  created_by uuid NOT NULL,
  expires_at timestamptz,
  view_count int4 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_chats_share_token ON public.shared_chats(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_chats_chat_id ON public.shared_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_shared_chats_created_by ON public.shared_chats(created_by);

-- 8. USAGE_TRACKING (12 columns)
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  message_id uuid,
  model text NOT NULL DEFAULT 'gpt-4o-mini'::text,
  prompt_tokens int8 NOT NULL,
  completion_tokens int8 NOT NULL,
  total_tokens int8 NOT NULL,
  prompt_cost numeric NOT NULL DEFAULT 0,
  completion_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_session_id ON public.usage_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at DESC);

-- 9. USER_MEMORY (10 columns)
CREATE TABLE IF NOT EXISTS public.user_memory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confidence numeric DEFAULT 0.80,
  source text,
  expires_at timestamptz,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_scope ON public.user_memory(scope);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_memory_user_scope_key ON public.user_memory(user_id, scope, key);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

-- Citations
ALTER TABLE public.citations
  ADD CONSTRAINT fk_citations_message_id
  FOREIGN KEY (message_id) REFERENCES public.discovery_messages(id) ON DELETE CASCADE;

ALTER TABLE public.citations
  ADD CONSTRAINT fk_citations_experience_id
  FOREIGN KEY (experience_id) REFERENCES public.experiences(id) ON DELETE CASCADE;

-- Discovery Chats
ALTER TABLE public.discovery_chats
  ADD CONSTRAINT fk_discovery_chats_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Discovery Messages
ALTER TABLE public.discovery_messages
  ADD CONSTRAINT fk_discovery_messages_chat_id
  FOREIGN KEY (chat_id) REFERENCES public.discovery_chats(id) ON DELETE CASCADE;

ALTER TABLE public.discovery_messages
  ADD CONSTRAINT fk_discovery_messages_branch_id
  FOREIGN KEY (branch_id) REFERENCES public.message_branches(id) ON DELETE SET NULL;

ALTER TABLE public.discovery_messages
  ADD CONSTRAINT fk_discovery_messages_reply_to_id
  FOREIGN KEY (reply_to_id) REFERENCES public.discovery_messages(id) ON DELETE SET NULL;

-- Message Attachments
ALTER TABLE public.message_attachments
  ADD CONSTRAINT fk_message_attachments_message_id
  FOREIGN KEY (message_id) REFERENCES public.discovery_messages(id) ON DELETE CASCADE;

ALTER TABLE public.message_attachments
  ADD CONSTRAINT fk_message_attachments_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Message Branches
ALTER TABLE public.message_branches
  ADD CONSTRAINT fk_message_branches_chat_id
  FOREIGN KEY (chat_id) REFERENCES public.discovery_chats(id) ON DELETE CASCADE;

ALTER TABLE public.message_branches
  ADD CONSTRAINT fk_message_branches_parent_message_id
  FOREIGN KEY (parent_message_id) REFERENCES public.discovery_messages(id) ON DELETE CASCADE;

-- Prompt Templates
ALTER TABLE public.prompt_templates
  ADD CONSTRAINT fk_prompt_templates_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Shared Chats
ALTER TABLE public.shared_chats
  ADD CONSTRAINT fk_shared_chats_chat_id
  FOREIGN KEY (chat_id) REFERENCES public.discovery_chats(id) ON DELETE CASCADE;

ALTER TABLE public.shared_chats
  ADD CONSTRAINT fk_shared_chats_created_by
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Usage Tracking
ALTER TABLE public.usage_tracking
  ADD CONSTRAINT fk_usage_tracking_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- User Memory
ALTER TABLE public.user_memory
  ADD CONSTRAINT fk_user_memory_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Citations (via discovery_messages → discovery_chats)
CREATE POLICY "Users can view own citations" ON public.citations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.discovery_messages dm
    JOIN public.discovery_chats dc ON dm.chat_id = dc.id
    WHERE dm.id = message_id AND dc.user_id = auth.uid()
  ));

-- Discovery Chats
CREATE POLICY "Users can view own chats" ON public.discovery_chats FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can create own chats" ON public.discovery_chats FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own chats" ON public.discovery_chats FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete own chats" ON public.discovery_chats FOR DELETE
  USING (user_id = auth.uid());

-- Discovery Messages
CREATE POLICY "Users can view own messages" ON public.discovery_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.discovery_chats dc WHERE dc.id = chat_id AND dc.user_id = auth.uid()));
CREATE POLICY "Users can create own messages" ON public.discovery_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.discovery_chats dc WHERE dc.id = chat_id AND dc.user_id = auth.uid()));

-- Message Attachments
CREATE POLICY "Users can view own attachments" ON public.message_attachments FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can create own attachments" ON public.message_attachments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Message Branches
CREATE POLICY "Users can view own branches" ON public.message_branches FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.discovery_chats dc WHERE dc.id = chat_id AND dc.user_id = auth.uid()));
CREATE POLICY "Users can create own branches" ON public.message_branches FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.discovery_chats dc WHERE dc.id = chat_id AND dc.user_id = auth.uid()));

-- Prompt Templates
CREATE POLICY "Users can view own and system templates" ON public.prompt_templates FOR SELECT
  USING (user_id = auth.uid() OR is_system = true);
CREATE POLICY "Users can create own templates" ON public.prompt_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Shared Chats (public read, owner write)
CREATE POLICY "Anyone can view shared chats" ON public.shared_chats FOR SELECT
  USING (expires_at IS NULL OR expires_at > now());
CREATE POLICY "Users can create shares for own chats" ON public.shared_chats FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Usage Tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can create own usage" ON public.usage_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User Memory
CREATE POLICY "Users can view own memory" ON public.user_memory FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can create own memory" ON public.user_memory FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own memory" ON public.user_memory FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete own memory" ON public.user_memory FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.citations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovery_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovery_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_branches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memory TO authenticated;

-- Allow anon to view shared chats
GRANT SELECT ON public.shared_chats TO anon;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger for discovery_chats
CREATE OR REPLACE FUNCTION update_discovery_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discovery_chats_updated_at
  BEFORE UPDATE ON public.discovery_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_discovery_chats_updated_at();

-- Updated_at trigger for user_memory
CREATE OR REPLACE FUNCTION update_user_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_user_memory_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.citations IS 'Source citations for AI-generated responses with relevance scoring';
COMMENT ON TABLE public.discovery_chats IS 'Discovery chat sessions with persistence, pinning, and archiving';
COMMENT ON TABLE public.discovery_messages IS 'Messages within discovery chats (stored as JSONB)';
COMMENT ON TABLE public.message_attachments IS 'File attachments for messages with vision analysis';
COMMENT ON TABLE public.message_branches IS 'Conversation branches for multi-path discussions';
COMMENT ON TABLE public.prompt_templates IS 'Reusable prompt templates with variables';
COMMENT ON TABLE public.shared_chats IS 'Publicly shared chat sessions with expiration';
COMMENT ON TABLE public.usage_tracking IS 'Token and cost tracking for AI API usage';
COMMENT ON TABLE public.user_memory IS 'User preferences and personalization data';

-- End of Phase 8 migration
