-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - INTERBØX V2
-- ============================================================================
-- Este arquivo contém todas as políticas de segurança para o Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter o user_id atual baseado no clerk_id
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub';
$$;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub' 
    AND role = 'admin'
  );
$$;

-- Função para verificar se o usuário é staff (admin, dev, marketing, staff)
CREATE OR REPLACE FUNCTION auth.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub' 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
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
-- POLÍTICAS PARA TABELA USERS
-- ============================================================================

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Usuários podem inserir seus próprios dados (registro)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Staff pode ver todos os usuários
CREATE POLICY "Staff can view all users" ON users
  FOR SELECT USING (auth.is_staff());

-- Staff pode atualizar todos os usuários
CREATE POLICY "Staff can update all users" ON users
  FOR UPDATE USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA USER_GAMIFICATION
-- ============================================================================

-- Usuários podem ver sua própria gamificação
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (user_id = auth.user_id());

-- Usuários podem atualizar sua própria gamificação
CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (user_id = auth.user_id());

-- Usuários podem inserir sua própria gamificação
CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Staff pode ver todas as gamificações
CREATE POLICY "Staff can view all gamification" ON user_gamification
  FOR SELECT USING (auth.is_staff());

-- Staff pode atualizar todas as gamificações
CREATE POLICY "Staff can update all gamification" ON user_gamification
  FOR UPDATE USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA TRANSACTIONS
-- ============================================================================

-- Usuários podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.user_id());

-- Usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Staff pode ver todas as transações
CREATE POLICY "Staff can view all transactions" ON transactions
  FOR SELECT USING (auth.is_staff());

-- Staff pode inserir transações para qualquer usuário
CREATE POLICY "Staff can insert all transactions" ON transactions
  FOR INSERT WITH CHECK (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA TEAMS
-- ============================================================================

-- Usuários podem ver times dos quais fazem parte
CREATE POLICY "Users can view own teams" ON teams
  FOR SELECT USING (
    captain_id = auth.user_id() 
    OR auth.user_id() = ANY(members)
  );

-- Capitães podem atualizar seus times
CREATE POLICY "Captains can update own teams" ON teams
  FOR UPDATE USING (captain_id = auth.user_id());

-- Capitães podem inserir times
CREATE POLICY "Captains can insert teams" ON teams
  FOR INSERT WITH CHECK (captain_id = auth.user_id());

-- Staff pode ver todos os times
CREATE POLICY "Staff can view all teams" ON teams
  FOR SELECT USING (auth.is_staff());

-- Staff pode atualizar todos os times
CREATE POLICY "Staff can update all teams" ON teams
  FOR UPDATE USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA TEAM_INVITES
-- ============================================================================

-- Usuários podem ver convites enviados por eles
CREATE POLICY "Users can view sent invites" ON team_invites
  FOR SELECT USING (inviter_id = auth.user_id());

-- Usuários podem ver convites recebidos (por email)
CREATE POLICY "Users can view received invites" ON team_invites
  FOR SELECT USING (
    invitee_email = (SELECT email FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Usuários podem inserir convites
CREATE POLICY "Users can insert invites" ON team_invites
  FOR INSERT WITH CHECK (inviter_id = auth.user_id());

-- Usuários podem atualizar convites que receberam
CREATE POLICY "Users can update received invites" ON team_invites
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Staff pode ver todos os convites
CREATE POLICY "Staff can view all invites" ON team_invites
  FOR SELECT USING (auth.is_staff());

-- Staff pode atualizar todos os convites
CREATE POLICY "Staff can update all invites" ON team_invites
  FOR UPDATE USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA PATROCINADORES
-- ============================================================================

-- Staff pode ver todos os patrocinadores
CREATE POLICY "Staff can view all sponsors" ON patrocinadores
  FOR SELECT USING (auth.is_staff());

-- Staff pode inserir patrocinadores
CREATE POLICY "Staff can insert sponsors" ON patrocinadores
  FOR INSERT WITH CHECK (auth.is_staff());

-- Staff pode atualizar patrocinadores
CREATE POLICY "Staff can update sponsors" ON patrocinadores
  FOR UPDATE USING (auth.is_staff());

-- Staff pode deletar patrocinadores
CREATE POLICY "Staff can delete sponsors" ON patrocinadores
  FOR DELETE USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA ANALYTICS_EVENTS
-- ============================================================================

-- Usuários podem inserir seus próprios eventos
CREATE POLICY "Users can insert own analytics" ON analytics_events
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Staff pode ver todos os eventos de analytics
CREATE POLICY "Staff can view all analytics" ON analytics_events
  FOR SELECT USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS PARA TABELA NOTIFICATIONS
-- ============================================================================

-- Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.user_id());

-- Usuários podem atualizar suas próprias notificações
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.user_id());

-- Staff pode inserir notificações para qualquer usuário
CREATE POLICY "Staff can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.is_staff());

-- Staff pode ver todas as notificações
CREATE POLICY "Staff can view all notifications" ON notifications
  FOR SELECT USING (auth.is_staff());

-- ============================================================================
-- POLÍTICAS ESPECIAIS PARA LEADERBOARD (LEITURA PÚBLICA)
-- ============================================================================

-- Permitir leitura pública do leaderboard (apenas dados necessários)
CREATE POLICY "Public leaderboard access" ON user_gamification
  FOR SELECT USING (true);

-- Permitir leitura pública de dados básicos dos usuários para leaderboard
CREATE POLICY "Public user data for leaderboard" ON users
  FOR SELECT USING (true);

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION auth.user_id() IS 'Retorna o user_id baseado no clerk_id do JWT';
COMMENT ON FUNCTION auth.is_admin() IS 'Verifica se o usuário atual é admin';
COMMENT ON FUNCTION auth.is_staff() IS 'Verifica se o usuário atual é staff (admin, dev, marketing, staff)';

-- ============================================================================
-- VERIFICAÇÃO DE SEGURANÇA
-- ============================================================================

-- Verificar se RLS está habilitado em todas as tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_gamification', 'transactions', 'teams', 'team_invites', 'patrocinadores', 'analytics_events', 'notifications')
ORDER BY tablename;
