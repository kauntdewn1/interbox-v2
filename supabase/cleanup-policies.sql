-- ============================================================================
-- LIMPEZA DE POLÍTICAS RLS - INTERBØX V2
-- ============================================================================
-- Remove todas as políticas RLS que dependem das funções de auth
-- ============================================================================

-- ============================================================================
-- 1. REMOVER POLÍTICAS DA TABELA USERS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can update all users" ON users;

-- ============================================================================
-- 2. REMOVER POLÍTICAS DA TABELA USER_GAMIFICATION
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all gamification" ON user_gamification;
DROP POLICY IF EXISTS "Staff can update all gamification" ON user_gamification;

-- ============================================================================
-- 3. REMOVER POLÍTICAS DA TABELA TRANSACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can insert all transactions" ON transactions;

-- ============================================================================
-- 4. REMOVER POLÍTICAS DA TABELA TEAMS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all teams" ON teams;
DROP POLICY IF EXISTS "Staff can update all teams" ON teams;

-- ============================================================================
-- 5. REMOVER POLÍTICAS DA TABELA TEAM_INVITES
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all invites" ON team_invites;
DROP POLICY IF EXISTS "Staff can update all invites" ON team_invites;

-- ============================================================================
-- 6. REMOVER POLÍTICAS DA TABELA PATROCINADORES
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all sponsors" ON patrocinadores;
DROP POLICY IF EXISTS "Staff can insert sponsors" ON patrocinadores;
DROP POLICY IF EXISTS "Staff can update sponsors" ON patrocinadores;
DROP POLICY IF EXISTS "Staff can delete sponsors" ON patrocinadores;

-- ============================================================================
-- 7. REMOVER POLÍTICAS DA TABELA ANALYTICS_EVENTS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can view all analytics" ON analytics_events;

-- ============================================================================
-- 8. REMOVER POLÍTICAS DA TABELA NOTIFICATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Staff can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Staff can view all notifications" ON notifications;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Agora execute:
-- 1. supabase/safe-cleanup.sql
-- 2. supabase/complete-setup.sql
