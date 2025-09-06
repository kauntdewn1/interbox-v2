-- ============================================================================
-- CRIAR TABELAS CORE PRIMEIRO - INTERBØX V2
-- ============================================================================
-- Cria as tabelas principais na ordem correta para resolver dependências
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA USERS PRIMEIRO
-- ============================================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role user_role DEFAULT 'publico',
  status user_status DEFAULT 'active',
  profile_complete BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  test_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CRIAR TABELA TEAMS
-- ============================================================================

-- Tabela de times
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  captain_id UUID REFERENCES users(id),
  atletas JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CRIAR TABELA USER_GAMIFICATION
-- ============================================================================

-- Tabela de gamificação
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level gamification_level DEFAULT 'cindy',
  box_tokens INTEGER DEFAULT 10,
  total_earned INTEGER DEFAULT 10,
  total_spent INTEGER DEFAULT 0,
  weekly_tokens INTEGER DEFAULT 10,
  monthly_tokens INTEGER DEFAULT 10,
  yearly_tokens INTEGER DEFAULT 10,
  referral_tokens INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{"primeiro_cadastro"}',
  badges TEXT[] DEFAULT '{"primeiro_cadastro"}',
  challenges JSONB DEFAULT '[]',
  rewards JSONB DEFAULT '[]',
  referral_code TEXT UNIQUE,
  referrals TEXT[] DEFAULT '[]',
  total_actions INTEGER DEFAULT 1,
  frequencia_dias INTEGER DEFAULT 1,
  melhor_frequencia INTEGER DEFAULT 1,
  last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_login_frequencia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CRIAR TABELA TRANSACTIONS
-- ============================================================================

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CRIAR TABELA PATROCINADORES
-- ============================================================================

-- Tabela de patrocinadores
CREATE TABLE IF NOT EXISTS patrocinadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  categoria TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  promessa TEXT,
  observacoes TEXT,
  logomarca_url TEXT,
  status sponsor_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. CRIAR TABELA ANALYTICS_EVENTS
-- ============================================================================

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. CRIAR TABELA NOTIFICATIONS
-- ============================================================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. CRIAR TABELA TEAM_INVITES
-- ============================================================================

-- Tabela de convites de time
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. VERIFICAR TABELAS CRIADAS
-- ============================================================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  tablename as table_name,
  schemaname as schema_name
FROM pg_tables 
WHERE tablename IN (
  'users',
  'teams',
  'user_gamification',
  'transactions',
  'patrocinadores',
  'analytics_events',
  'notifications',
  'team_invites'
)
ORDER BY tablename;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Tabelas core criadas na ordem correta
-- Agora execute supabase-schema.sql novamente
