-- ============================================================================
-- CORRIGIR RLS PARA NOTIFICAÇÕES COM CLERK - INTERBØX V2
-- ============================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Staff can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Staff can view all notifications" ON notifications;

-- Criar políticas compatíveis com Clerk
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = public.user_id());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = public.user_id());

CREATE POLICY "Staff can insert notifications" ON notifications
  FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Staff can view all notifications" ON notifications
  FOR SELECT USING (public.is_staff());

-- Permitir leitura pública para notificações (se necessário)
CREATE POLICY "Public notifications access" ON notifications
  FOR SELECT USING (true);

-- ============================================================================
-- VERIFICAR SE A TABELA NOTIFICATIONS EXISTE
-- ============================================================================

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

-- Criar enum se não existir
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se a tabela existe e tem RLS habilitado
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
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'notifications'
ORDER BY policyname;
