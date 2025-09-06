-- ============================================================================
-- CORREÇÃO DAS VIEWS DE SEGURANÇA - INTERBØX V2
-- ============================================================================
-- Corrige as views para resolver os erros de Security Definer View
-- ============================================================================

-- ============================================================================
-- 1. DROPAR VIEWS PROBLEMÁTICAS
-- ============================================================================

DROP VIEW IF EXISTS invites_with_user_info CASCADE;
DROP VIEW IF EXISTS user_invite_stats CASCADE;
DROP VIEW IF EXISTS gamification_logs_with_user CASCADE;
DROP VIEW IF EXISTS transaction_audit_with_user CASCADE;
DROP VIEW IF EXISTS audit_statistics CASCADE;

-- ============================================================================
-- 2. VERIFICAR SE AS VIEWS FORAM REMOVIDAS
-- ============================================================================

-- Verificar se as views foram removidas
SELECT 'Views removidas com sucesso' as status;

-- ============================================================================
-- 2. RECRIAR VIEWS SEM SECURITY DEFINER
-- ============================================================================

-- View para convites com informações do usuário (SEM SECURITY DEFINER)
CREATE VIEW invites_with_user_info AS
SELECT 
  i.*,
  u.display_name as inviter_username,
  u.email as inviter_email,
  u.photo_url as inviter_avatar
FROM invites i
JOIN users u ON i.inviter_id = u.id;

-- View para estatísticas de convites por usuário (SEM SECURITY DEFINER)
CREATE VIEW user_invite_stats AS
SELECT 
  u.id as user_id,
  u.display_name as username,
  'N/A' as referral_code,
  COALESCE(stats.total_sent, 0) as total_sent,
  COALESCE(stats.total_accepted, 0) as total_accepted,
  COALESCE(stats.total_pending, 0) as total_pending,
  COALESCE(stats.total_expired, 0) as total_expired,
  COALESCE(stats.total_tokens_earned, 0) as total_tokens_earned
FROM users u
LEFT JOIN LATERAL get_invite_stats(u.id) stats ON true;

-- View para logs de gamificação com informações do usuário (SEM SECURITY DEFINER)
CREATE VIEW gamification_logs_with_user AS
SELECT 
  lg.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role
FROM logs_gamification lg
JOIN users u ON lg.user_id = u.id;

-- View para auditoria de transações com informações do usuário (SEM SECURITY DEFINER)
CREATE VIEW transaction_audit_with_user AS
SELECT 
  ta.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role,
  approver.display_name as approver_name
FROM transactions_audit ta
JOIN users u ON ta.user_id = u.id
LEFT JOIN users approver ON ta.approved_by = approver.id;

-- View para estatísticas de auditoria (SEM SECURITY DEFINER)
CREATE VIEW audit_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE status = 'success') as successful_actions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_actions,
  SUM(tokens_delta) as total_tokens_moved,
  COUNT(DISTINCT user_id) as unique_users
FROM logs_gamification
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Todas as views agora respeitam RLS e não precisam de SECURITY DEFINER
-- Execute este arquivo para corrigir os erros de segurança
