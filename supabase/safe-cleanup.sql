-- ============================================================================
-- LIMPEZA SEGURA - INTERBØX V2
-- ============================================================================
-- Remove apenas o que foi criado pelo complete-setup.sql
-- ============================================================================

-- ============================================================================
-- 1. REMOVER VIEWS CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP VIEW IF EXISTS user_invite_stats;
DROP VIEW IF EXISTS invites_with_user_info;

-- ============================================================================
-- 2. REMOVER TRIGGERS CRIADOS PELO COMPLETE-SETUP
-- ============================================================================

DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;

-- ============================================================================
-- 3. REMOVER FUNÇÕES CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP FUNCTION IF EXISTS get_invite_stats(UUID);
DROP FUNCTION IF EXISTS accept_invite(UUID, VARCHAR);
DROP FUNCTION IF EXISTS create_invite(UUID, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS update_invites_updated_at();

-- ============================================================================
-- 4. REMOVER TABELA INVITES CRIADA PELO COMPLETE-SETUP
-- ============================================================================

DROP TABLE IF EXISTS invites CASCADE;

-- ============================================================================
-- 5. REMOVER FUNÇÕES DE AUTENTICAÇÃO CRIADAS PELO COMPLETE-SETUP
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff();
DROP FUNCTION IF EXISTS public.is_atleta();
DROP FUNCTION IF EXISTS public.is_judge();
DROP FUNCTION IF EXISTS public.is_midia();
DROP FUNCTION IF EXISTS public.is_espectador();
DROP FUNCTION IF EXISTS public.user_role();

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Agora execute na ordem correta:
-- 1. ../supabase-schema.sql (já executado, mas pode dar erro de tipos duplicados - ignore)
-- 2. supabase/complete-setup.sql
