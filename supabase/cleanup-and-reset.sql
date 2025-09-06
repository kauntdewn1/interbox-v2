-- ============================================================================
-- SCRIPT DE LIMPEZA E RESET - INTERBØX V2
-- ============================================================================
-- Execute este script para limpar tudo e começar do zero
-- ============================================================================

-- ============================================================================
-- 1. REMOVER VIEWS
-- ============================================================================

DROP VIEW IF EXISTS user_invite_stats;
DROP VIEW IF EXISTS invites_with_user_info;

-- ============================================================================
-- 2. REMOVER FUNÇÕES
-- ============================================================================

DROP FUNCTION IF EXISTS get_invite_stats(UUID);
DROP FUNCTION IF EXISTS accept_invite(UUID, VARCHAR);
DROP FUNCTION IF EXISTS create_invite(UUID, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS update_invites_updated_at();

-- ============================================================================
-- 3. REMOVER TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;

-- ============================================================================
-- 4. REMOVER TABELAS
-- ============================================================================

DROP TABLE IF EXISTS invites CASCADE;

-- ============================================================================
-- 5. REMOVER FUNÇÕES DE AUTENTICAÇÃO
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff();
DROP FUNCTION IF EXISTS public.is_atleta();
DROP FUNCTION IF EXISTS public.is_judge();
DROP FUNCTION IF EXISTS public.is_midia();
DROP FUNCTION IF EXISTS public.is_espectador();
DROP FUNCTION IF EXISTS public.user_role();

-- ============================================================================
-- 6. REMOVER TIPOS (CUIDADO - PODE AFETAR OUTRAS TABELAS)
-- ============================================================================

-- Só remover se não houver dependências
-- DROP TYPE IF EXISTS user_role CASCADE;
-- DROP TYPE IF EXISTS user_status CASCADE;
-- DROP TYPE IF EXISTS gamification_level CASCADE;
-- DROP TYPE IF EXISTS transaction_type CASCADE;
-- DROP TYPE IF EXISTS sponsor_status CASCADE;
-- DROP TYPE IF EXISTS notification_type CASCADE;

-- ============================================================================
-- 7. REMOVER EXTENSÕES (OPCIONAL)
-- ============================================================================

-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "pgcrypto";

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Após executar este script, execute na ordem correta:
-- 1. ../supabase-schema.sql
-- 2. supabase/complete-setup.sql
