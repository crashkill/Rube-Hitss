-- ============================================
-- OPEN RUBE - RECIPES DATABASE SETUP
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para criar as tabelas de recipes
-- ============================================

-- Tabela de recipes (workflows pré-configurados)
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

-- Tabela de recipes favoritos do usuário
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
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_category 
  ON recipes(category);

CREATE INDEX IF NOT EXISTS idx_recipes_is_active 
  ON recipes(is_active);

CREATE INDEX IF NOT EXISTS idx_recipes_is_featured 
  ON recipes(is_featured);

CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id 
  ON user_recipes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_recipes_recipe_id 
  ON user_recipes(recipe_id);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURANÇA - RECIPES
-- ============================================

-- Permitir que todos vejam recipes ativos (público)
DROP POLICY IF EXISTS "Anyone can view active recipes" ON recipes;
CREATE POLICY "Anyone can view active recipes"
  ON recipes FOR SELECT
  USING (is_active = TRUE);

-- Apenas admins podem inserir/atualizar/deletar recipes
-- (por enquanto, sem admin role, apenas service_role pode modificar)

-- ============================================
-- POLÍTICAS DE SEGURANÇA - USER_RECIPES
-- ============================================

-- Usuários podem ver seus próprios favoritos
DROP POLICY IF EXISTS "Users can view their own user_recipes" ON user_recipes;
CREATE POLICY "Users can view their own user_recipes"
  ON user_recipes FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus favoritos
DROP POLICY IF EXISTS "Users can insert their own user_recipes" ON user_recipes;
CREATE POLICY "Users can insert their own user_recipes"
  ON user_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus favoritos
DROP POLICY IF EXISTS "Users can update their own user_recipes" ON user_recipes;
CREATE POLICY "Users can update their own user_recipes"
  ON user_recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus favoritos
DROP POLICY IF EXISTS "Users can delete their own user_recipes" ON user_recipes;
CREATE POLICY "Users can delete their own user_recipes"
  ON user_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DADOS INICIAIS - RECIPES PADRÃO
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
-- TRIGGER PARA UPDATED_AT
-- ============================================

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipes') THEN
    RAISE NOTICE '✓ Tabela "recipes" criada com sucesso';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_recipes') THEN
    RAISE NOTICE '✓ Tabela "user_recipes" criada com sucesso';
  END IF;
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
