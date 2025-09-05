-- ============================================================================
-- SCHEMA COMPLETO + RLS - INTERBØX V2
-- ============================================================================
-- Script completo para criar todas as tabelas e políticas RLS

-- ============================================================================
-- CRIAR ENUMS
-- ============================================================================

-- User roles
DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gamification levels
DO $$ BEGIN
    CREATE TYPE gamification_level AS ENUM (
        'cindy',
        'helen',
        'fran',
        'annie',
        'murph',
        'matt'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction types
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM (
        'earn',
        'spend',
        'transfer',
        'bonus',
        'referral',
        'achievement'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sponsor status
DO $$ BEGIN
    CREATE TYPE sponsor_status AS ENUM (
        'bronze',
        'prata',
        'ouro',
        'platina',
        'pending',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification types
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'info',
        'success',
        'warning',
        'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Team invite status
DO $$ BEGIN
    CREATE TYPE team_invite_status AS ENUM (
        'pending',
        'accepted',
        'rejected',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CRIAR TABELAS
-- ============================================================================

-- Tabela users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    role user_role DEFAULT 'publico' NOT NULL,
    whatsapp TEXT,
    box TEXT,
    cidade TEXT,
    mensagem TEXT,
    profile_complete BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    test_user BOOLEAN DEFAULT false,
    team_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela user_gamification
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    level gamification_level DEFAULT 'cindy',
    box_tokens INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    last_action TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type transaction_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT,
    status TEXT,
    captain_id UUID REFERENCES users(id) ON DELETE CASCADE,
    members UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela team_invites
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status team_invite_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela patrocinadores
CREATE TABLE IF NOT EXISTS patrocinadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    empresa TEXT NOT NULL,
    categoria TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    promessa TEXT NOT NULL,
    observacoes TEXT,
    logomarca_url TEXT,
    status sponsor_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_data JSONB NOT NULL,
    user_agent TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CRIAR ÍNDICES
-- ============================================================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_tokens ON user_gamification(box_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================================
-- CRIAR FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter o clerk_id atual
CREATE OR REPLACE FUNCTION public.clerk_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

-- Função para obter o user_id baseado no clerk_id
CREATE OR REPLACE FUNCTION public.user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE clerk_id = public.clerk_id();
$$;

-- Função para verificar se o usuário é staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
  );
$$;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'admin'
  );
$$;

-- ============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
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

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "Staff can view all transactions" ON transactions
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can insert all transactions" ON transactions
  FOR INSERT WITH CHECK (public.is_staff());

-- Políticas para teams
CREATE POLICY "Users can view own teams" ON teams
  FOR SELECT USING (
    captain_id = public.user_id() 
    OR public.user_id() = ANY(members)
  );

CREATE POLICY "Captains can update own teams" ON teams
  FOR UPDATE USING (captain_id = public.user_id());

CREATE POLICY "Captains can insert teams" ON teams
  FOR INSERT WITH CHECK (captain_id = public.user_id());

CREATE POLICY "Staff can view all teams" ON teams
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can update all teams" ON teams
  FOR UPDATE USING (public.is_staff());

-- Políticas para team_invites
CREATE POLICY "Users can view sent invites" ON team_invites
  FOR SELECT USING (inviter_id = public.user_id());

CREATE POLICY "Users can view received invites" ON team_invites
  FOR SELECT USING (
    invitee_email = (SELECT email FROM users WHERE clerk_id = public.clerk_id())
  );

CREATE POLICY "Users can insert invites" ON team_invites
  FOR INSERT WITH CHECK (inviter_id = public.user_id());

CREATE POLICY "Users can update received invites" ON team_invites
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM users WHERE clerk_id = public.clerk_id())
  );

CREATE POLICY "Staff can view all invites" ON team_invites
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can update all invites" ON team_invites
  FOR UPDATE USING (public.is_staff());

-- Políticas para patrocinadores
CREATE POLICY "Staff can view all sponsors" ON patrocinadores
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can insert sponsors" ON patrocinadores
  FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update sponsors" ON patrocinadores
  FOR UPDATE USING (public.is_staff());

CREATE POLICY "Staff can delete sponsors" ON patrocinadores
  FOR DELETE USING (public.is_staff());

-- Políticas para analytics_events
CREATE POLICY "Users can insert own analytics" ON analytics_events
  FOR INSERT WITH CHECK (user_id = public.user_id());

CREATE POLICY "Staff can view all analytics" ON analytics_events
  FOR SELECT USING (public.is_staff());

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = public.user_id());

CREATE POLICY "Staff can insert notifications" ON notifications
  FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Staff can view all notifications" ON notifications
  FOR SELECT USING (public.is_staff());

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_gamification', 'transactions', 'teams', 'team_invites', 'patrocinadores', 'analytics_events', 'notifications')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
