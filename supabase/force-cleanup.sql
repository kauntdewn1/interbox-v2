-- ============================================================================
-- LIMPEZA FORÇADA - INTERBØX V2
-- ============================================================================
-- Remove tudo com CASCADE para garantir limpeza completa
-- ============================================================================

-- ============================================================================
-- 1. REMOVER VIEWS CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP VIEW IF EXISTS user_invite_stats CASCADE;
DROP VIEW IF EXISTS invites_with_user_info CASCADE;

-- ============================================================================
-- 2. REMOVER TABELA INVITES E TODAS AS DEPENDÊNCIAS
-- ============================================================================

DROP TABLE IF EXISTS invites CASCADE;

-- ============================================================================
-- 3. REMOVER FUNÇÕES CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP FUNCTION IF EXISTS get_invite_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS accept_invite(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_invite(UUID, VARCHAR, JSONB) CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS update_invites_updated_at() CASCADE;

-- ============================================================================
-- 4. REMOVER FUNÇÕES DE AUTENTICAÇÃO CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_staff() CASCADE;
DROP FUNCTION IF EXISTS public.is_atleta() CASCADE;
DROP FUNCTION IF EXISTS public.is_judge() CASCADE;
DROP FUNCTION IF EXISTS public.is_midia() CASCADE;
DROP FUNCTION IF EXISTS public.is_espectador() CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Agora execute na ordem correta:
-- 1. ../supabase-schema.sql (já executado, mas pode dar erro de tipos duplicados - ignore)
-- 2. supabase/complete-setup.sql
