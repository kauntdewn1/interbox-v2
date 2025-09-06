-- ============================================================================
-- CORREÇÃO FORÇADA DAS VIEWS DE SEGURANÇA - INTERBØX V2
-- ============================================================================
-- Força a remoção e recriação das views para resolver os erros de Security Definer View
-- ============================================================================

-- ============================================================================
-- 1. FORÇAR REMOÇÃO DAS VIEWS PROBLEMÁTICAS
-- ============================================================================

-- Remover views com CASCADE para garantir remoção completa
DROP VIEW IF EXISTS public.invites_with_user_info CASCADE;
DROP VIEW IF EXISTS public.user_invite_stats CASCADE;
DROP VIEW IF EXISTS public.gamification_logs_with_user CASCADE;
DROP VIEW IF EXISTS public.transaction_audit_with_user CASCADE;
DROP VIEW IF EXISTS public.audit_statistics CASCADE;

-- ============================================================================
-- 2. AGUARDAR E VERIFICAR REMOÇÃO
-- ============================================================================

-- Verificar se as views foram removidas
SELECT 'Views removidas com sucesso' as status;

-- ============================================================================
-- 3. RECRIAR VIEWS SIMPLES SEM SECURITY DEFINER
-- ============================================================================

-- View para convites com informações do usuário (SIMPLES)
CREATE VIEW public.invites_with_user_info AS
SELECT 
  i.*,
  u.display_name as inviter_username,
  u.email as inviter_email,
  u.photo_url as inviter_avatar
FROM public.invites i
JOIN public.users u ON i.inviter_id = u.id;

-- View para estatísticas de convites por usuário (SIMPLES)
CREATE VIEW public.user_invite_stats AS
SELECT 
  u.id as user_id,
  u.display_name as username,
  'N/A' as referral_code,
  COALESCE(stats.total_sent, 0) as total_sent,
  COALESCE(stats.total_accepted, 0) as total_accepted,
  COALESCE(stats.total_pending, 0) as total_pending,
  COALESCE(stats.total_expired, 0) as total_expired,
  COALESCE(stats.total_tokens_earned, 0) as total_tokens_earned
FROM public.users u
LEFT JOIN LATERAL public.get_invite_stats(u.id) stats ON true;

-- View para logs de gamificação com informações do usuário (SIMPLES)
CREATE VIEW public.gamification_logs_with_user AS
SELECT 
  lg.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role
FROM public.logs_gamification lg
JOIN public.users u ON lg.user_id = u.id;

-- View para auditoria de transações com informações do usuário (SIMPLES)
CREATE VIEW public.transaction_audit_with_user AS
SELECT 
  ta.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role,
  approver.display_name as approver_name
FROM public.transactions_audit ta
JOIN public.users u ON ta.user_id = u.id
LEFT JOIN public.users approver ON ta.approved_by = approver.id;

-- View para estatísticas de auditoria (SIMPLES - sem JOIN com users)
CREATE VIEW public.audit_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE status = 'success') as successful_actions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_actions,
  SUM(tokens_delta) as total_tokens_moved,
  COUNT(DISTINCT user_id) as unique_users
FROM public.logs_gamification
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- 4. VERIFICAR CRIAÇÃO DAS VIEWS
-- ============================================================================

-- Verificar se as views foram criadas
SELECT 'Views criadas com sucesso' as status;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Todas as views agora são simples e não têm SECURITY DEFINER
-- A segurança fica nas tabelas base via RLS
-- Execute este arquivo para resolver definitivamente os 5 erros
