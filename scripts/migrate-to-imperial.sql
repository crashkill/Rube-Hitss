-- ============================================
-- RUBE-LOCAL MIGRATION TO IMPERIAL SUPABASE
-- ============================================
-- Execute este script no SQL Editor do 
-- Supabase Imperial (https://supabase.fsw-hitss.duckdns.org)
-- ============================================

-- ============================================
-- PASSO 1: CRIAR TABELAS DE CONVERSAS
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- PASSO 2: CRIAR TABELAS DE RECIPES
-- ============================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  apps JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- PASSO 3: CRIAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_recipes_is_featured ON recipes(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON user_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipes_recipe_id ON user_recipes(recipe_id);

-- ============================================
-- PASSO 4: HABILITAR RLS
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 5: POLÍTICAS RLS - CONVERSATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASSO 6: POLÍTICAS RLS - MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON messages;
CREATE POLICY "Users can delete messages from their conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- PASSO 7: POLÍTICAS RLS - RECIPES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active recipes" ON recipes;
CREATE POLICY "Anyone can view active recipes"
  ON recipes FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- PASSO 8: POLÍTICAS RLS - USER_RECIPES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own user_recipes" ON user_recipes;
CREATE POLICY "Users can view their own user_recipes"
  ON user_recipes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own user_recipes" ON user_recipes;
CREATE POLICY "Users can insert their own user_recipes"
  ON user_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own user_recipes" ON user_recipes;
CREATE POLICY "Users can update their own user_recipes"
  ON user_recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own user_recipes" ON user_recipes;
CREATE POLICY "Users can delete their own user_recipes"
  ON user_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASSO 9: FUNÇÃO updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASSO 10: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASSO 11: DADOS INICIAIS - RECIPES
-- ============================================

INSERT INTO recipes (title, description, apps, category, prompt_template, is_featured) VALUES
(
  'Weekly PRs to Slack',
  'Get a weekly summary of all merged pull requests sent to your Slack channel',
  '[{"name": "GitHub", "icon": "github", "color": "#24292e"}, {"name": "Slack", "icon": "slack", "color": "#4A154B"}]'::jsonb,
  'Development',
  'List all merged pull requests from this week across my GitHub repositories and send a summary to my main Slack channel.',
  TRUE
),
(
  'Daily Email Summary',
  'Get a summary of your unread emails every morning',
  '[{"name": "Gmail", "icon": "gmail", "color": "#EA4335"}]'::jsonb,
  'Email',
  'Summarize my unread emails from the last 24 hours. Group them by importance and sender.',
  TRUE
),
(
  'Slack & Email To-Do List',
  'Generate a daily to-do list from your Slack messages and emails',
  '[{"name": "Slack", "icon": "slack", "color": "#4A154B"}, {"name": "Gmail", "icon": "gmail", "color": "#EA4335"}]'::jsonb,
  'Productivity',
  'Analyze my Slack messages and emails from today and extract action items into a to-do list.',
  TRUE
),
(
  'Daily Standup Report',
  'Compile team updates from Slack into a Notion page automatically',
  '[{"name": "Slack", "icon": "slack", "color": "#4A154B"}, {"name": "Notion", "icon": "notion", "color": "#000000"}]'::jsonb,
  'Productivity',
  'Collect all standup messages from the #standup Slack channel and create a formatted report in Notion.',
  FALSE
),
(
  'Auto-respond to Emails',
  'Automatically draft responses to common email inquiries',
  '[{"name": "Gmail", "icon": "gmail", "color": "#EA4335"}]'::jsonb,
  'Email',
  'Check my unread emails and draft professional responses for each one. Show me the drafts before sending.',
  FALSE
),
(
  'Calendar to Slack Reminder',
  'Send Slack reminders 15 minutes before calendar events',
  '[{"name": "Google Calendar", "icon": "calendar", "color": "#4285F4"}, {"name": "Slack", "icon": "slack", "color": "#4A154B"}]'::jsonb,
  'Productivity',
  'Check my calendar for upcoming meetings and send me a Slack reminder for each one.',
  FALSE
),
(
  'GitHub Issues to Linear',
  'Sync GitHub issues to Linear for project management',
  '[{"name": "GitHub", "icon": "github", "color": "#24292e"}, {"name": "Linear", "icon": "linear", "color": "#5E6AD2"}]'::jsonb,
  'Development',
  'List my open GitHub issues and create corresponding tasks in my Linear workspace.',
  FALSE
),
(
  'Social Media Post Creator',
  'Create and schedule posts across social media platforms',
  '[{"name": "Twitter", "icon": "twitter", "color": "#1DA1F2"}]'::jsonb,
  'Social Media',
  'Create an engaging Twitter post about the latest tech news. Make it informative yet engaging.',
  FALSE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    RAISE NOTICE '✓ Tabela "conversations" criada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE NOTICE '✓ Tabela "messages" criada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipes') THEN
    RAISE NOTICE '✓ Tabela "recipes" criada';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_recipes') THEN
    RAISE NOTICE '✓ Tabela "user_recipes" criada';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Atualize .env.local com credenciais imperiais';
  RAISE NOTICE '2. Reinicie o servidor: npm run dev';
  RAISE NOTICE '3. Teste o login e funcionalidades';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
