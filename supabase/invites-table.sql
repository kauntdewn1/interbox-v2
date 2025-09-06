-- ============================================================================
-- TABELA INVITES - SISTEMA DE INDICAÇÕES INTERBØX V2
-- ============================================================================
-- Esta tabela gerencia o sistema de convites e recompensas por indicação
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

-- Adicionar coluna referral_code na tabela users se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;

-- Criar índice para referral_code na tabela users
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- ============================================================================
-- FUNÇÕES DE SISTEMA
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
  SELECT referral_code INTO v_referral_code
  FROM users 
  WHERE id = p_inviter_id;
  
  -- Se não tem referral_code, gerar um
  IF v_referral_code IS NULL THEN
    v_referral_code := generate_referral_code();
    UPDATE users 
    SET referral_code = v_referral_code 
    WHERE id = p_inviter_id;
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
    'earn',
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
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS na tabela invites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios convites
CREATE POLICY "Users can view their own invites" ON invites
  FOR SELECT USING (inviter_id = auth.uid());

-- Política: Usuários podem criar convites
CREATE POLICY "Users can create invites" ON invites
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Política: Usuários podem atualizar seus próprios convites
CREATE POLICY "Users can update their own invites" ON invites
  FOR UPDATE USING (inviter_id = auth.uid());

-- Política: Staff pode ver todos os convites
CREATE POLICY "Staff can view all invites" ON invites
  FOR ALL USING (public.is_staff());

-- ============================================================================
-- TRIGGERS
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

-- Trigger para limpar convites expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE invites 
  SET status = 'expired'
  WHERE status = 'pending' 
  AND expires_at <= NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View para convites com informações do usuário
CREATE OR REPLACE VIEW invites_with_user_info AS
SELECT 
  i.*,
  u.username as inviter_username,
  u.email as inviter_email,
  u.avatar_url as inviter_avatar
FROM invites i
JOIN users u ON i.inviter_id = u.id;

-- View para estatísticas de convites por usuário
CREATE OR REPLACE VIEW user_invite_stats AS
SELECT 
  u.id as user_id,
  u.username,
  u.referral_code,
  COALESCE(stats.total_sent, 0) as total_sent,
  COALESCE(stats.total_accepted, 0) as total_accepted,
  COALESCE(stats.total_pending, 0) as total_pending,
  COALESCE(stats.total_expired, 0) as total_expired,
  COALESCE(stats.total_tokens_earned, 0) as total_tokens_earned
FROM users u
LEFT JOIN LATERAL get_invite_stats(u.id) stats ON true;

-- ============================================================================
-- COMENTÁRIOS
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
COMMENT ON FUNCTION cleanup_expired_invites IS 'Marca convites expirados como expired';
