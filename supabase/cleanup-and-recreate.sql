-- ============================================================================
-- LIMPEZA E RECRIAÇÃO COMPLETA - INTERBØX V2
-- ============================================================================
-- Script para limpar tipos existentes e recriar o schema completo
-- ============================================================================

-- ============================================================================
-- 1. REMOVER DEPENDÊNCIAS PRIMEIRO
-- ============================================================================

-- Remover políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can update all users" ON users;
DROP POLICY IF EXISTS "Public leaderboard access" ON users;
DROP POLICY IF EXISTS "Users can view own gamification" ON user_gamification;
DROP POLICY IF EXISTS "Users can update own gamification" ON user_gamification;
DROP POLICY IF EXISTS "Users can insert own gamification" ON user_gamification;
DROP POLICY IF EXISTS "Staff can view all gamification" ON user_gamification;
DROP POLICY IF EXISTS "Staff can update all gamification" ON user_gamification;
DROP POLICY IF EXISTS "Public leaderboard access" ON user_gamification;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage patrocinadores" ON patrocinadores;

-- Remover triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_gamification_updated_at ON user_gamification;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_patrocinadores_updated_at ON patrocinadores;
DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;

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
-- 2. REMOVER TABELAS
-- ============================================================================

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

-- ============================================================================
-- 3. REMOVER TIPOS
-- ============================================================================

DROP TYPE IF EXISTS audit_source_type CASCADE;
DROP TYPE IF EXISTS audit_status CASCADE;
DROP TYPE IF EXISTS audit_action_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS sponsor_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS gamification_level CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- 4. VERIFICAR LIMPEZA
-- ============================================================================

-- Verificar se os tipos foram removidos
SELECT 
  typname as type_name
FROM pg_type 
WHERE typname IN (
  'user_role',
  'user_status', 
  'gamification_level',
  'transaction_type',
  'sponsor_status',
  'notification_type',
  'audit_action_type',
  'audit_status',
  'audit_source_type'
);

-- Verificar se as tabelas foram removidas
SELECT 
  tablename as table_name
FROM pg_tables 
WHERE tablename IN (
  'users',
  'user_gamification',
  'transactions',
  'teams',
  'team_invites',
  'patrocinadores',
  'analytics_events',
  'notifications',
  'invites',
  'logs_gamification',
  'transactions_audit'
);

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Limpeza completa realizada
-- Agora execute supabase-schema.sql novamente
