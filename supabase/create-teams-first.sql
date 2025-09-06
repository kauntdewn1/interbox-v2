-- ============================================================================
-- CRIAR TABELA TEAMS PRIMEIRO - INTERBØX V2
-- ============================================================================
-- Cria a tabela teams antes de continuar com o schema
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA TEAMS
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
-- 2. CRIAR ÍNDICES PARA TEAMS
-- ============================================================================

-- Índices para teams
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_teams_nome ON teams(nome);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);

-- ============================================================================
-- 3. VERIFICAR CRIAÇÃO
-- ============================================================================

-- Verificar se a tabela teams foi criada
SELECT 
  tablename as table_name,
  schemaname as schema_name
FROM pg_tables 
WHERE tablename = 'teams';

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Tabela teams criada com sucesso
-- Agora execute supabase-schema.sql novamente
