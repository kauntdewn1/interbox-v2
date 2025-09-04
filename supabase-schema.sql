-- ============================================================================
-- SCHEMA COMPLETO DO SUPABASE - INTERBØX V2
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
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
  'active',
  'inactive'
);

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  role user_role DEFAULT 'publico',
  whatsapp TEXT,
  box TEXT,
  cidade TEXT,
  mensagem TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  test_user BOOLEAN DEFAULT FALSE,
  status user_status DEFAULT 'active',
  team_id UUID REFERENCES teams(id),
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
  referrals TEXT[] DEFAULT '[]',
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

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para users
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Índices para gamificação
CREATE INDEX idx_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_gamification_level ON user_gamification(level);
CREATE INDEX idx_gamification_referral_code ON user_gamification(referral_code);

-- Índices para transações
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Índices para analytics
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Índices para notificações
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON user_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patrocinadores_updated_at BEFORE UPDATE ON patrocinadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('admin', 'dev')
    )
  );

-- Políticas para gamificação
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

-- Políticas para transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

-- Políticas para notificações
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

-- Políticas para patrocinadores (apenas admins)
CREATE POLICY "Admins can manage patrocinadores" ON patrocinadores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('admin', 'marketing')
    )
  );

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para criar usuário com gamificação
CREATE OR REPLACE FUNCTION create_user_with_gamification(
  p_clerk_id TEXT,
  p_email TEXT,
  p_display_name TEXT,
  p_role user_role DEFAULT 'publico'
)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
  referral_code TEXT;
BEGIN
  -- Gerar código de referência único
  referral_code := 'REF' || UPPER(SUBSTRING(p_clerk_id, -6));
  
  -- Inserir usuário
  INSERT INTO users (clerk_id, email, display_name, role, profile_complete)
  VALUES (p_clerk_id, p_email, p_display_name, p_role, TRUE)
  RETURNING id INTO user_uuid;
  
  -- Inserir gamificação
  INSERT INTO user_gamification (
    user_id, 
    referral_code,
    box_tokens,
    total_earned,
    weekly_tokens,
    monthly_tokens,
    yearly_tokens
  )
  VALUES (
    user_uuid,
    referral_code,
    10, -- Tokens iniciais
    10,
    10,
    10,
    10
  );
  
  -- Inserir transação inicial
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (user_uuid, 'earn', 10, 'Primeiro cadastro - Bônus de boas-vindas');
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar tokens
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type DEFAULT 'earn',
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Atualizar gamificação
  UPDATE user_gamification 
  SET 
    box_tokens = box_tokens + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Inserir transação
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (p_user_id, p_type, p_amount, p_description);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir usuário admin padrão (se necessário)
-- INSERT INTO users (clerk_id, email, display_name, role, profile_complete)
-- VALUES ('admin_clerk_id', 'admin@interbox.com.br', 'Admin INTERBØX', 'admin', TRUE);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE users IS 'Usuários do sistema INTERBØX';
COMMENT ON TABLE teams IS 'Times de competição';
COMMENT ON TABLE user_gamification IS 'Sistema de gamificação dos usuários';
COMMENT ON TABLE transactions IS 'Transações de tokens';
COMMENT ON TABLE patrocinadores IS 'Patrocinadores do evento';
COMMENT ON TABLE analytics_events IS 'Eventos de analytics';
COMMENT ON TABLE notifications IS 'Notificações dos usuários';
COMMENT ON TABLE team_invites IS 'Convites para times';
