-- ============================================================================
-- VERIFICAR TIPOS EXISTENTES - INTERBØX V2
-- ============================================================================
-- Script para verificar quais tipos já existem no banco
-- ============================================================================

-- Verificar tipos existentes
SELECT 
  typname as type_name,
  typtype as type_type,
  typcategory as category
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
)
ORDER BY typname;

-- Verificar tabelas existentes
SELECT 
  tablename as table_name,
  schemaname as schema_name
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
)
ORDER BY tablename;

-- Verificar funções existentes
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname IN (
  'clerk_id',
  'user_id',
  'is_admin',
  'is_staff',
  'is_atleta',
  'is_judge',
  'is_midia',
  'is_espectador',
  'user_role'
)
ORDER BY proname;
