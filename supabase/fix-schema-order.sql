-- ============================================================================
-- CORREÇÃO DA ORDEM DAS TABELAS - INTERBØX V2
-- ============================================================================
-- Corrige a ordem de criação das tabelas para resolver dependências
-- ============================================================================

-- ============================================================================
-- 1. REMOVER TABELA PROBLEMÁTICA
-- ============================================================================

-- Remover team_invites que está causando o erro
DROP TABLE IF EXISTS team_invites CASCADE;

-- ============================================================================
-- 2. RECRIAR TABELA NA ORDEM CORRETA
-- ============================================================================

-- Recriar team_invites APÓS teams existir
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
-- 3. CRIAR ÍNDICES PARA TEAM_INVITES
-- ============================================================================

-- Índices para team_invites
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_inviter_id ON team_invites(inviter_id);
CREATE INDEX idx_team_invites_invitee_email ON team_invites(invitee_email);
CREATE INDEX idx_team_invites_status ON team_invites(status);
CREATE INDEX idx_team_invites_expires_at ON team_invites(expires_at);

-- ============================================================================
-- 4. VERIFICAR TABELAS CRIADAS
-- ============================================================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  tablename as table_name,
  schemaname as schema_name
FROM pg_tables 
WHERE tablename IN (
  'users',
  'teams',
  'team_invites',
  'user_gamification',
  'transactions',
  'patrocinadores',
  'analytics_events',
  'notifications'
)
ORDER BY tablename;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Ordem das tabelas corrigida
-- teams foi criada antes de team_invites
-- Execute este arquivo para resolver o erro de dependência
