-- ============================================================================
-- SETUP COMPLETO DO SUPABASE - INTERBØX V2
-- ============================================================================
-- Execute este arquivo completo para configurar todo o sistema
-- ============================================================================

-- ============================================================================
-- 1. FUNÇÕES DE AUTENTICAÇÃO
-- ============================================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de admin
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'dev')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de staff
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é atleta
CREATE OR REPLACE FUNCTION public.is_atleta()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de atleta
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'atleta'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é judge
CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de judge
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'judge'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é mídia
CREATE OR REPLACE FUNCTION public.is_midia()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de mídia
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'midia'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é espectador
CREATE OR REPLACE FUNCTION public.is_espectador()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role de espectador
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'espectador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obter role do usuário
  SELECT role INTO user_role
  FROM users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'publico');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TABELA DE CONVITES
-- ============================================================================

-- Criar tabela invites
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invites_inviter_id ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee_email ON invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invites_referral_code ON invites(referral_code);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_invites_inviter_status ON invites(inviter_id, status);

-- A coluna referral_code já existe na tabela user_gamification
-- Não é necessário adicionar na tabela users

-- ============================================================================
-- 3. FUNÇÕES DE SISTEMA DE CONVITES
-- ============================================================================

-- Função para gerar código de referral único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código de 8 caracteres (letras e números)
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    
    -- Se não existe, sair do loop
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Função para criar convite
CREATE OR REPLACE FUNCTION create_invite(
  p_inviter_id UUID,
  p_invitee_email VARCHAR(255),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
  invite_id UUID,
  referral_code VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_referral_code VARCHAR(50);
  v_invite_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se o usuário existe e tem referral_code
  -- Primeiro verificar se a tabela user_gamification existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_gamification') THEN
    SELECT ug.referral_code INTO v_referral_code
    FROM user_gamification ug
    WHERE ug.user_id = p_inviter_id;
    
    -- Se não tem referral_code, gerar um
    IF v_referral_code IS NULL THEN
      v_referral_code := generate_referral_code();
      UPDATE user_gamification 
      SET referral_code = v_referral_code 
      WHERE user_id = p_inviter_id;
    END IF;
  ELSE
    -- Se a tabela não existe, gerar um código único baseado no ID do usuário
    v_referral_code := 'REF' || UPPER(SUBSTRING(p_inviter_id::text, -8));
  END IF;
  
  -- Verificar se já existe convite pendente para este email
  IF EXISTS(
    SELECT 1 FROM invites 
    WHERE invitee_email = p_invitee_email 
    AND status = 'pending' 
    AND expires_at > NOW()
  ) THEN
    RAISE EXCEPTION 'Convite já existe para este email';
  END IF;
  
  -- Definir data de expiração (30 dias)
  v_expires_at := NOW() + INTERVAL '30 days';
  
  -- Criar convite
  INSERT INTO invites (
    inviter_id,
    invitee_email,
    referral_code,
    status,
    expires_at,
    metadata
  ) VALUES (
    p_inviter_id,
    p_invitee_email,
    v_referral_code,
    'pending',
    v_expires_at,
    p_metadata
  ) RETURNING id INTO v_invite_id;
  
  -- Retornar dados do convite
  RETURN QUERY SELECT v_invite_id, v_referral_code, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION accept_invite(
  p_invitee_id UUID,
  p_referral_code VARCHAR(50)
)
RETURNS TABLE(
  success BOOLEAN,
  inviter_id UUID,
  tokens_awarded INTEGER,
  message TEXT
) AS $$
DECLARE
  v_invite RECORD;
  v_inviter_id UUID;
  v_tokens_awarded INTEGER := 50; -- Recompensa por indicação confirmada
BEGIN
  -- Buscar convite válido
  SELECT * INTO v_invite
  FROM invites 
  WHERE referral_code = p_referral_code 
  AND status = 'pending' 
  AND expires_at > NOW()
  LIMIT 1;
  
  -- Verificar se encontrou convite
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0, 'Convite não encontrado ou expirado';
    RETURN;
  END IF;
  
  -- Verificar se o usuário já foi convidado por este código
  IF EXISTS(
    SELECT 1 FROM invites 
    WHERE invitee_email = (
      SELECT email FROM users WHERE id = p_invitee_id
    )
    AND referral_code = p_referral_code
    AND status = 'accepted'
  ) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0, 'Convite já foi aceito anteriormente';
    RETURN;
  END IF;
  
  -- Marcar convite como aceito
  UPDATE invites 
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = v_invite.id;
  
  -- Obter ID do convidador
  v_inviter_id := v_invite.inviter_id;
  
  -- Conceder tokens para o convidador
  PERFORM add_tokens(
    v_inviter_id,
    v_tokens_awarded,
    'referral'::transaction_type,
    'Recompensa por indicação confirmada'
  );
  
  -- Registrar evento de gamificação
  INSERT INTO analytics_events (
    user_id,
    event_name,
    event_data
  ) VALUES (
    v_inviter_id,
    'gamification_action',
    jsonb_build_object(
      'action', 'indicacao_confirmada',
      'tokens', v_tokens_awarded,
      'description', 'Recompensa por indicação confirmada',
      'metadata', jsonb_build_object(
        'invitee_id', p_invitee_id,
        'referral_code', p_referral_code
      )
    )
  );
  
  -- Retornar sucesso
  RETURN QUERY SELECT TRUE, v_inviter_id, v_tokens_awarded, 'Convite aceito com sucesso!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de convites
CREATE OR REPLACE FUNCTION get_invite_stats(p_user_id UUID)
RETURNS TABLE(
  total_sent INTEGER,
  total_accepted INTEGER,
  total_pending INTEGER,
  total_expired INTEGER,
  total_tokens_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_sent,
    COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as total_accepted,
    COUNT(*) FILTER (WHERE status = 'pending' AND expires_at > NOW())::INTEGER as total_pending,
    COUNT(*) FILTER (WHERE status = 'expired' OR expires_at <= NOW())::INTEGER as total_expired,
    COALESCE(SUM(
      CASE 
        WHEN status = 'accepted' THEN 50 
        ELSE 0 
      END
    ), 0)::INTEGER as total_tokens_earned
  FROM invites 
  WHERE inviter_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. POLÍTICAS RLS
-- ============================================================================

-- Habilitar RLS na tabela invites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios convites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invites' 
    AND policyname = 'Users can view their own invites'
  ) THEN
    CREATE POLICY "Users can view their own invites" ON invites
      FOR SELECT USING (inviter_id = auth.uid());
  END IF;
END $$;

-- Política: Usuários podem criar convites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invites' 
    AND policyname = 'Users can create invites'
  ) THEN
    CREATE POLICY "Users can create invites" ON invites
      FOR INSERT WITH CHECK (inviter_id = auth.uid());
  END IF;
END $$;

-- Política: Usuários podem atualizar seus próprios convites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invites' 
    AND policyname = 'Users can update their own invites'
  ) THEN
    CREATE POLICY "Users can update their own invites" ON invites
      FOR UPDATE USING (inviter_id = auth.uid());
  END IF;
END $$;

-- Política: Staff pode ver todos os convites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invites' 
    AND policyname = 'Staff can view all invites'
  ) THEN
    CREATE POLICY "Staff can view all invites" ON invites
      FOR ALL USING (public.is_staff());
  END IF;
END $$;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_invites_updated_at();

-- ============================================================================
-- 6. VIEWS ÚTEIS (MOVIDAS PARA O FINAL)
-- ============================================================================

-- ============================================================================
-- 7. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE invites IS 'Tabela de convites e sistema de indicações';
COMMENT ON COLUMN invites.inviter_id IS 'ID do usuário que enviou o convite';
COMMENT ON COLUMN invites.invitee_email IS 'Email do usuário convidado';
COMMENT ON COLUMN invites.referral_code IS 'Código de referência único';
COMMENT ON COLUMN invites.status IS 'Status do convite: pending, accepted, expired, cancelled';
COMMENT ON COLUMN invites.expires_at IS 'Data de expiração do convite (30 dias)';
COMMENT ON COLUMN invites.metadata IS 'Metadados adicionais do convite';

COMMENT ON FUNCTION create_invite IS 'Cria um novo convite e retorna o código de referência';
COMMENT ON FUNCTION accept_invite IS 'Aceita um convite e concede recompensas';
COMMENT ON FUNCTION get_invite_stats IS 'Retorna estatísticas de convites de um usuário';
COMMENT ON FUNCTION generate_referral_code IS 'Gera um código de referência único';

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuário é admin ou dev';
COMMENT ON FUNCTION public.is_staff() IS 'Verifica se o usuário é staff (admin, dev, marketing, staff)';
COMMENT ON FUNCTION public.is_atleta() IS 'Verifica se o usuário é atleta';
COMMENT ON FUNCTION public.is_judge() IS 'Verifica se o usuário é judge';
COMMENT ON FUNCTION public.is_midia() IS 'Verifica se o usuário é mídia';
COMMENT ON FUNCTION public.is_espectador() IS 'Verifica se o usuário é espectador';
COMMENT ON FUNCTION public.user_role() IS 'Retorna o role do usuário atual';

-- ============================================================================
-- 8. VIEWS ÚTEIS (CRIADAS APÓS TODAS AS TABELAS)
-- ============================================================================

-- View para convites com informações do usuário
CREATE OR REPLACE VIEW invites_with_user_info AS
SELECT 
  i.*,
  u.display_name as inviter_username,
  u.email as inviter_email,
  u.photo_url as inviter_avatar
FROM invites i
JOIN users u ON i.inviter_id = u.id;

-- View para estatísticas de convites por usuário
CREATE OR REPLACE VIEW user_invite_stats AS
SELECT 
  u.id as user_id,
  u.display_name as username,
  'N/A' as referral_code, -- Será atualizada quando user_gamification existir
  COALESCE(stats.total_sent, 0) as total_sent,
  COALESCE(stats.total_accepted, 0) as total_accepted,
  COALESCE(stats.total_pending, 0) as total_pending,
  COALESCE(stats.total_expired, 0) as total_expired,
  COALESCE(stats.total_tokens_earned, 0) as total_tokens_earned
FROM users u
LEFT JOIN LATERAL get_invite_stats(u.id) stats ON true;
