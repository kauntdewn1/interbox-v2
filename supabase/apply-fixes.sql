-- ============================================================================
-- APLICAR CORREÇÕES CRÍTICAS - INTERBØX V2
-- ============================================================================

-- 1. CRIAR FUNÇÃO create_user_with_gamification
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_with_gamification(
  p_clerk_id TEXT,
  p_email TEXT,
  p_display_name TEXT,
  p_role TEXT DEFAULT 'publico'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Inserir usuário na tabela users
  INSERT INTO users (
    clerk_id,
    email,
    display_name,
    role,
    profile_complete,
    is_active,
    test_user
  ) VALUES (
    p_clerk_id,
    p_email,
    p_display_name,
    p_role::user_role,
    false,
    true,
    false
  ) RETURNING id INTO new_user_id;

  -- Inserir dados de gamificação
  INSERT INTO user_gamification (
    user_id,
    level,
    box_tokens,
    total_earned,
    achievements,
    badges
  ) VALUES (
    new_user_id,
    'cindy',
    0,
    0,
    '{}',
    '{}'
  );

  -- Retornar sucesso
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Usuário criado com sucesso'
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Retornar erro
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erro ao criar usuário'
    );
    
    RETURN result;
END;
$$;

-- 2. CORRIGIR TABELA NOTIFICATIONS
-- ============================================================================

-- Criar enum se não existir
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CORRIGIR RLS PARA NOTIFICAÇÕES
-- ============================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Staff can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Staff can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Public notifications access" ON notifications;

-- Criar políticas compatíveis com Clerk
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = public.user_id());

CREATE POLICY "Staff can insert notifications" ON notifications
  FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Staff can view all notifications" ON notifications
  FOR SELECT USING (public.is_staff());

-- Permitir leitura pública para notificações
CREATE POLICY "Public notifications access" ON notifications
  FOR SELECT USING (true);

-- 4. CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 5. HABILITAR RLS
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. PERMISSÕES
-- ============================================================================

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION create_user_with_gamification TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_gamification TO anon;

-- 7. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_user_with_gamification';

-- Verificar se a tabela notifications existe
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'notifications';

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'notifications'
ORDER BY policyname;
