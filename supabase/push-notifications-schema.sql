-- ============================================================================
-- PUSH NOTIFICATIONS SCHEMA - INTERBØX V2
-- ============================================================================
-- Sistema completo de push notifications para marketing e dev
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE push_status AS ENUM ('draft', 'pending_approval', 'approved', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE push_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE push_target_type AS ENUM ('all', 'role', 'specific', 'segment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABELAS
-- ============================================================================

-- Tabela de campanhas de push
CREATE TABLE IF NOT EXISTS push_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon_url TEXT,
  image_url TEXT,
  action_url TEXT,
  target_type push_target_type NOT NULL DEFAULT 'all',
  target_role user_role,
  target_users UUID[],
  target_segment TEXT,
  priority push_priority DEFAULT 'normal',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status push_status DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de push notifications
CREATE TABLE IF NOT EXISTS push_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES push_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  device_token TEXT,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de dispositivos dos usuários
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'android', 'ios'
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNÇÕES
-- ============================================================================

-- Função para criar campanha de push
CREATE OR REPLACE FUNCTION create_push_campaign(
  p_title TEXT,
  p_body TEXT,
  p_target_type push_target_type,
  p_target_role user_role DEFAULT NULL,
  p_target_users UUID[] DEFAULT NULL,
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_priority push_priority DEFAULT 'normal',
  p_icon_url TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  campaign_id UUID;
  current_user_id UUID;
BEGIN
  -- Obter ID do usuário atual
  SELECT id INTO current_user_id FROM users WHERE clerk_id = public.clerk_id();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Criar campanha
  INSERT INTO push_campaigns (
    title, body, target_type, target_role, target_users,
    scheduled_at, priority, icon_url, image_url, action_url,
    created_by
  ) VALUES (
    p_title, p_body, p_target_type, p_target_role, p_target_users,
    p_scheduled_at, p_priority, p_icon_url, p_image_url, p_action_url,
    current_user_id
  ) RETURNING id INTO campaign_id;
  
  RETURN campaign_id;
END;
$$;

-- Função para aprovar campanha
CREATE OR REPLACE FUNCTION approve_push_campaign(
  p_campaign_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Obter ID do usuário atual
  SELECT id INTO current_user_id FROM users WHERE clerk_id = public.clerk_id();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Verificar se é admin
  SELECT role = 'admin' OR role = 'dev' INTO is_admin 
  FROM users WHERE id = current_user_id;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Aprovar campanha
  UPDATE push_campaigns 
  SET 
    status = 'approved',
    approved_by = current_user_id,
    approved_at = NOW()
  WHERE id = p_campaign_id AND status = 'pending_approval';
  
  RETURN FOUND;
END;
$$;

-- Função para obter estatísticas de campanha
CREATE OR REPLACE FUNCTION get_campaign_stats(p_campaign_id UUID)
RETURNS TABLE (
  total_recipients BIGINT,
  delivered_count BIGINT,
  opened_count BIGINT,
  clicked_count BIGINT,
  delivery_rate NUMERIC,
  open_rate NUMERIC,
  click_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.total_recipients,
    pc.delivered_count,
    pc.opened_count,
    pc.clicked_count,
    CASE 
      WHEN pc.total_recipients > 0 
      THEN ROUND((pc.delivered_count::NUMERIC / pc.total_recipients::NUMERIC) * 100, 2)
      ELSE 0 
    END as delivery_rate,
    CASE 
      WHEN pc.delivered_count > 0 
      THEN ROUND((pc.opened_count::NUMERIC / pc.delivered_count::NUMERIC) * 100, 2)
      ELSE 0 
    END as open_rate,
    CASE 
      WHEN pc.opened_count > 0 
      THEN ROUND((pc.clicked_count::NUMERIC / pc.opened_count::NUMERIC) * 100, 2)
      ELSE 0 
    END as click_rate
  FROM push_campaigns pc
  WHERE pc.id = p_campaign_id;
END;
$$;

-- ============================================================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE push_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Políticas para push_campaigns
CREATE POLICY "Users can view campaigns they created" ON push_campaigns
  FOR SELECT USING (created_by = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));

CREATE POLICY "Admins can view all campaigns" ON push_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = public.clerk_id() 
      AND (role = 'admin' OR role = 'dev')
    )
  );

CREATE POLICY "Users can create campaigns" ON push_campaigns
  FOR INSERT WITH CHECK (created_by = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));

CREATE POLICY "Admins can update campaigns" ON push_campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = public.clerk_id() 
      AND (role = 'admin' OR role = 'dev')
    )
  );

-- Políticas para push_logs
CREATE POLICY "Users can view their own logs" ON push_logs
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));

CREATE POLICY "Admins can view all logs" ON push_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = public.clerk_id() 
      AND (role = 'admin' OR role = 'dev')
    )
  );

-- Políticas para user_devices
CREATE POLICY "Users can manage their own devices" ON user_devices
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));

CREATE POLICY "Admins can view all devices" ON user_devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = public.clerk_id() 
      AND (role = 'admin' OR role = 'dev')
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_push_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_campaigns_updated_at
  BEFORE UPDATE ON push_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_push_campaigns_updated_at();

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_push_campaigns_status ON push_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_push_campaigns_created_by ON push_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_push_campaigns_scheduled_at ON push_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_push_logs_campaign_id ON push_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_user_id ON push_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

SELECT 'Push Notifications Schema criado com sucesso!' as status;
