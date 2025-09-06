-- ============================================================================
-- MIGRAÇÃO COMPLETA - INTERBØX V2
-- ============================================================================
-- Migração que executa todo o setup do banco de dados
-- ============================================================================

-- ============================================================================
-- 1. LIMPEZA COMPLETA (SEGURA)
-- ============================================================================

-- Remover tabelas primeiro (CASCADE remove dependências)
DROP TABLE IF EXISTS transactions_audit CASCADE;
DROP TABLE IF EXISTS logs_gamification CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS patrocinadores CASCADE;
DROP TABLE IF EXISTS team_invites CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Remover tipos
DROP TYPE IF EXISTS audit_source_type CASCADE;
DROP TYPE IF EXISTS audit_status CASCADE;
DROP TYPE IF EXISTS audit_action_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS sponsor_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS gamification_level CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_gamification_level() CASCADE;
DROP FUNCTION IF EXISTS create_user_with_gamification(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS add_tokens(UUID, INTEGER, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.clerk_id() CASCADE;
DROP FUNCTION IF EXISTS public.user_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_staff() CASCADE;
DROP FUNCTION IF EXISTS public.is_atleta() CASCADE;
DROP FUNCTION IF EXISTS public.is_judge() CASCADE;
DROP FUNCTION IF EXISTS public.is_midia() CASCADE;
DROP FUNCTION IF EXISTS public.is_espectador() CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;

-- ============================================================================
-- 2. CRIAR TIPOS
-- ============================================================================

-- Tipos de usuário
CREATE TYPE user_role AS ENUM (
  'publico',
  'atleta', 
  'judge',
  'midia',
  'espectador',
  'admin',
  'dev',
  'marketing',
  'staff'
);

-- Status de usuário
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'pending'
);

-- Níveis de gamificação
CREATE TYPE gamification_level AS ENUM (
  'annie',    -- Iniciante
  'cindy',    -- Base
  'fran',     -- Intermediário
  'helen',    -- Avançado
  'matt',     -- Expert
  'murph'     -- Master
);

-- Tipos de transação
CREATE TYPE transaction_type AS ENUM (
  'earn',
  'spend',
  'bonus',
  'referral',
  'achievement'
);

-- Status de patrocinador
CREATE TYPE sponsor_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'inactive'
);

-- Tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'info',
  'success',
  'warning',
  'error'
);

-- Tipos de auditoria
CREATE TYPE audit_action_type AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'token_award',
  'token_spend'
);

CREATE TYPE audit_status AS ENUM (
  'success',
  'failed',
  'pending'
);

CREATE TYPE audit_source_type AS ENUM (
  'user_action',
  'system',
  'admin',
  'api',
  'qr_checkin'
);

-- ============================================================================
-- 3. CRIAR TABELAS
-- ============================================================================

-- Tabela de usuários
CREATE TABLE users (
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

-- Tabela de times
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  captain_id UUID REFERENCES users(id),
  atletas JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de gamificação
CREATE TABLE user_gamification (
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
  referrals TEXT[] DEFAULT '{}',
  total_actions INTEGER DEFAULT 1,
  frequencia_dias INTEGER DEFAULT 1,
  melhor_frequencia INTEGER DEFAULT 1,
  last_action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_login_frequencia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de patrocinadores
CREATE TABLE patrocinadores (
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

-- Tabela de eventos de analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de convites de time
CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de convites (sistema de referência)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  message TEXT,
  referral_code TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de gamificação
CREATE TABLE logs_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  tokens_before INTEGER DEFAULT 0,
  tokens_after INTEGER DEFAULT 0,
  tokens_delta INTEGER DEFAULT 0,
  level_before TEXT,
  level_after TEXT,
  source TEXT NOT NULL,
  origin TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de auditoria de transações
CREATE TABLE transactions_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type audit_action_type NOT NULL,
  amount_before INTEGER DEFAULT 0,
  amount_after INTEGER DEFAULT 0,
  source audit_source_type NOT NULL,
  origin TEXT,
  metadata JSONB DEFAULT '{}',
  status audit_status DEFAULT 'success',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. CRIAR ÍNDICES
-- ============================================================================

-- Índices para users
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Índices para gamificação
CREATE INDEX idx_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_gamification_tokens ON user_gamification(box_tokens DESC);
CREATE INDEX idx_gamification_level ON user_gamification(level);
CREATE INDEX idx_gamification_referral_code ON user_gamification(referral_code);

-- Índices para transações
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Índices para times
CREATE INDEX idx_teams_captain_id ON teams(captain_id);
CREATE INDEX idx_teams_nome ON teams(nome);
CREATE INDEX idx_teams_created_at ON teams(created_at);

-- Índices para convites de time
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_inviter_id ON team_invites(inviter_id);
CREATE INDEX idx_team_invites_invitee_email ON team_invites(invitee_email);
CREATE INDEX idx_team_invites_status ON team_invites(status);
CREATE INDEX idx_team_invites_expires_at ON team_invites(expires_at);

-- Índices para patrocinadores
CREATE INDEX idx_patrocinadores_status ON patrocinadores(status);
CREATE INDEX idx_patrocinadores_categoria ON patrocinadores(categoria);
CREATE INDEX idx_patrocinadores_created_at ON patrocinadores(created_at);

-- Índices para analytics
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Índices para notificações
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Índices para convites
CREATE INDEX idx_invites_inviter_id ON invites(inviter_id);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);

-- Índices para logs de gamificação
CREATE INDEX idx_logs_gamification_user_id ON logs_gamification(user_id);
CREATE INDEX idx_logs_gamification_action ON logs_gamification(action);
CREATE INDEX idx_logs_gamification_created_at ON logs_gamification(created_at DESC);

-- Índices para auditoria de transações
CREATE INDEX idx_transactions_audit_user_id ON transactions_audit(user_id);
CREATE INDEX idx_transactions_audit_transaction_id ON transactions_audit(transaction_id);
CREATE INDEX idx_transactions_audit_created_at ON transactions_audit(created_at DESC);

-- ============================================================================
-- 5. CRIAR FUNÇÕES BÁSICAS (SEM DEPENDÊNCIAS)
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar nível de gamificação
CREATE OR REPLACE FUNCTION update_gamification_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.box_tokens IS DISTINCT FROM OLD.box_tokens THEN
    NEW.level = CASE
      WHEN NEW.box_tokens >= 1000 THEN 'murph'
      WHEN NEW.box_tokens >= 500 THEN 'matt'
      WHEN NEW.box_tokens >= 200 THEN 'helen'
      WHEN NEW.box_tokens >= 100 THEN 'fran'
      WHEN NEW.box_tokens >= 50 THEN 'cindy'
      ELSE 'annie'
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para obter o clerk_id atual
CREATE OR REPLACE FUNCTION public.clerk_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

-- ============================================================================
-- 6. CRIAR FUNÇÕES DEPENDENTES (APÓS TABELAS)
-- ============================================================================

-- Função para obter o user_id baseado no clerk_id
CREATE OR REPLACE FUNCTION public.user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM users WHERE clerk_id = public.clerk_id();
$$;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'admin'
  );
$$;

-- Função para verificar se o usuário é staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
  );
$$;

-- Função para verificar se o usuário é atleta
CREATE OR REPLACE FUNCTION public.is_atleta()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'atleta'
  );
$$;

-- Função para verificar se o usuário é judge
CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'judge'
  );
$$;

-- Função para verificar se o usuário é mídia
CREATE OR REPLACE FUNCTION public.is_midia()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'midia'
  );
$$;

-- Função para verificar se o usuário é espectador
CREATE OR REPLACE FUNCTION public.is_espectador()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'espectador'
  );
$$;

-- Função para obter o role do usuário
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'publico') FROM users WHERE clerk_id = public.clerk_id();
$$;

-- Função para criar usuário com gamificação
CREATE OR REPLACE FUNCTION create_user_with_gamification(
  p_clerk_id TEXT,
  p_email TEXT,
  p_display_name TEXT,
  p_role TEXT DEFAULT 'publico'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Inserir usuário na tabela users
  INSERT INTO users (
    clerk_id,
    email,
    display_name,
    role,
    profile_complete,
    is_active,
    test_user
  ) VALUES (
    p_clerk_id,
    p_email,
    p_display_name,
    p_role::user_role,
    false,
    true,
    false
  ) RETURNING id INTO new_user_id;

  -- Inserir dados de gamificação
  INSERT INTO user_gamification (
    user_id,
    level,
    box_tokens,
    total_earned,
    achievements,
    badges
  ) VALUES (
    new_user_id,
    'cindy',
    0,
    0,
    '{}',
    '{}'
  );

  -- Retornar sucesso
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Usuário criado com sucesso'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao criar usuário'
    );
    
    RETURN result;
END;
$$;

-- Função para adicionar tokens
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Lógica da função mantida
  SELECT box_tokens INTO current_balance
  FROM user_gamification
  WHERE user_id = p_user_id;

  IF current_balance IS NULL THEN
    current_balance := 0;
  END IF;

  new_balance := current_balance + p_amount;

  UPDATE user_gamification
  SET box_tokens = new_balance
  WHERE user_id = p_user_id;

  INSERT INTO transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type::transaction_type, p_description)
  RETURNING id INTO transaction_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance
  );
END;
$$;

-- ============================================================================
-- 7. CRIAR TRIGGERS
-- ============================================================================

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_gamification_level();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patrocinadores_updated_at BEFORE UPDATE ON patrocinadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HABILITAR RLS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_audit ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. CRIAR POLÍTICAS RLS
-- ============================================================================

-- Políticas para users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = public.clerk_id());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = public.clerk_id());

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_id = public.clerk_id());

CREATE POLICY "Staff can view all users" ON users
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can update all users" ON users
  FOR UPDATE USING (public.is_staff());

CREATE POLICY "Public leaderboard access" ON users
  FOR SELECT USING (true);

-- Políticas para user_gamification
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (user_id = public.user_id());

CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "Staff can view all gamification" ON user_gamification
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can update all gamification" ON user_gamification
  FOR UPDATE USING (public.is_staff());

CREATE POLICY "Public leaderboard access" ON user_gamification
  FOR SELECT USING (true);

-- Políticas para transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = public.user_id());

-- Políticas para notificações
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = public.user_id());

-- Políticas para patrocinadores (apenas admins)
CREATE POLICY "Admins can manage patrocinadores" ON patrocinadores
  FOR ALL USING (public.is_admin());

-- ============================================================================
-- 9. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE user_gamification IS 'Sistema de gamificação dos usuários';
COMMENT ON TABLE transactions IS 'Transações de tokens dos usuários';
COMMENT ON TABLE teams IS 'Times de atletas';
COMMENT ON TABLE team_invites IS 'Convites para times';
COMMENT ON TABLE patrocinadores IS 'Patrocinadores do evento';
COMMENT ON TABLE analytics_events IS 'Eventos de analytics';
COMMENT ON TABLE notifications IS 'Notificações dos usuários';
COMMENT ON TABLE invites IS 'Sistema de convites por referência';
COMMENT ON TABLE logs_gamification IS 'Logs de ações de gamificação';
COMMENT ON TABLE transactions_audit IS 'Auditoria de transações';

-- ============================================================================
-- MIGRAÇÃO COMPLETA FINALIZADA
-- ============================================================================
