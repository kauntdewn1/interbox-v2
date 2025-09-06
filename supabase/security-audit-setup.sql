-- ============================================================================
-- SETUP DE SEGURANÇA E AUDITORIA - INTERBØX V2
-- ============================================================================
-- Implementa logs de gamificação, auditoria de transações e validações de backend
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE LOGS DE GAMIFICAÇÃO
-- ============================================================================

-- Tabela para histórico detalhado de ações de gamificação por usuário
CREATE TABLE IF NOT EXISTS logs_gamification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  tokens_before INTEGER NOT NULL DEFAULT 0,
  tokens_after INTEGER NOT NULL DEFAULT 0,
  tokens_delta INTEGER NOT NULL DEFAULT 0,
  level_before VARCHAR(20),
  level_after VARCHAR(20),
  source VARCHAR(50) NOT NULL, -- 'user_action', 'admin_award', 'system_bonus', 'referral', etc.
  origin VARCHAR(100), -- IP, user_agent, referrer, etc.
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending', 'reverted')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 years') -- Retenção de 2 anos
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_logs_gamification_user_id ON logs_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_action ON logs_gamification(action);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_source ON logs_gamification(source);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_status ON logs_gamification(status);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_created_at ON logs_gamification(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_expires_at ON logs_gamification(expires_at);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_logs_gamification_user_action ON logs_gamification(user_id, action);
CREATE INDEX IF NOT EXISTS idx_logs_gamification_user_created ON logs_gamification(user_id, created_at);

-- ============================================================================
-- 2. TABELA DE AUDITORIA DE TRANSAÇÕES
-- ============================================================================

-- Tabela para auditoria completa de transações
CREATE TABLE IF NOT EXISTS transactions_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'revert'
  transaction_type transaction_type NOT NULL,
  amount_before INTEGER,
  amount_after INTEGER,
  amount_delta INTEGER,
  description_before TEXT,
  description_after TEXT,
  metadata_before JSONB,
  metadata_after JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'reverted')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  source VARCHAR(50) NOT NULL, -- 'user_action', 'admin_action', 'system_action', 'api_call'
  origin VARCHAR(100), -- IP, user_agent, API endpoint, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 years') -- Retenção de 7 anos
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_audit_transaction_id ON transactions_audit(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_user_id ON transactions_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_action_type ON transactions_audit(action_type);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_status ON transactions_audit(status);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_source ON transactions_audit(source);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_created_at ON transactions_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_expires_at ON transactions_audit(expires_at);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_transactions_audit_user_status ON transactions_audit(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_audit_transaction_action ON transactions_audit(transaction_id, action_type);

-- ============================================================================
-- 3. FUNÇÕES DE VALIDAÇÃO NO BACKEND
-- ============================================================================

-- Função para validar ação no backend
CREATE OR REPLACE FUNCTION public.is_valid_action(action_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  valid_actions TEXT[] := ARRAY[
    'cadastro_inicial',
    'perfil_completo',
    'login_diario',
    'checkin_evento',
    'convite_aceito',
    'primeira_compra',
    'assistiu_video',
    'respondeu_quiz',
    'compartilhou_social',
    'venceu_desafio',
    'participou_sorteio',
    'referral',
    'achievement',
    'admin_award',
    'admin_remove',
    'qr_checkin',
    'indicacao_confirmada',
    'compra_ingresso',
    'envio_conteudo',
    'qr_scan_evento',
    'prova_extra',
    'participacao_enquete',
    'acesso_spoiler',
    'compartilhamento',
    'completar_perfil'
  ];
BEGIN
  RETURN action_name = ANY(valid_actions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar origem da ação
CREATE OR REPLACE FUNCTION public.is_valid_source(source_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  valid_sources TEXT[] := ARRAY[
    'user_action',
    'admin_action',
    'system_action',
    'api_call',
    'referral',
    'bonus',
    'correction',
    'migration'
  ];
BEGIN
  RETURN source_name = ANY(valid_sources);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar log de gamificação
CREATE OR REPLACE FUNCTION public.log_gamification_action(
  p_user_id UUID,
  p_action TEXT,
  p_tokens_before INTEGER,
  p_tokens_after INTEGER,
  p_level_before TEXT DEFAULT NULL,
  p_level_after TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'user_action',
  p_origin TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  tokens_delta INTEGER;
BEGIN
  -- Validar entrada
  IF NOT public.is_valid_action(p_action) THEN
    RAISE EXCEPTION 'Ação inválida: %', p_action;
  END IF;
  
  IF NOT public.is_valid_source(p_source) THEN
    RAISE EXCEPTION 'Origem inválida: %', p_source;
  END IF;
  
  -- Calcular delta de tokens
  tokens_delta := p_tokens_after - p_tokens_before;
  
  -- Inserir log
  INSERT INTO logs_gamification (
    user_id,
    action,
    tokens_before,
    tokens_after,
    tokens_delta,
    level_before,
    level_after,
    source,
    origin,
    metadata,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_action,
    p_tokens_before,
    p_tokens_after,
    tokens_delta,
    p_level_before,
    p_level_after,
    p_source,
    p_origin,
    p_metadata,
    p_status,
    p_error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar auditoria de transação
CREATE OR REPLACE FUNCTION public.audit_transaction(
  p_transaction_id UUID,
  p_user_id UUID,
  p_action_type TEXT,
  p_transaction_type transaction_type,
  p_amount_before INTEGER DEFAULT NULL,
  p_amount_after INTEGER DEFAULT NULL,
  p_description_before TEXT DEFAULT NULL,
  p_description_after TEXT DEFAULT NULL,
  p_metadata_before JSONB DEFAULT NULL,
  p_metadata_after JSONB DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_approved_by UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'user_action',
  p_origin TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
  amount_delta INTEGER;
BEGIN
  -- Validar entrada
  IF p_action_type NOT IN ('create', 'update', 'delete', 'revert') THEN
    RAISE EXCEPTION 'Tipo de ação inválido: %', p_action_type;
  END IF;
  
  IF p_status NOT IN ('pending', 'approved', 'rejected', 'reverted') THEN
    RAISE EXCEPTION 'Status inválido: %', p_status;
  END IF;
  
  IF NOT public.is_valid_source(p_source) THEN
    RAISE EXCEPTION 'Origem inválida: %', p_source;
  END IF;
  
  -- Calcular delta de valor
  amount_delta := COALESCE(p_amount_after, 0) - COALESCE(p_amount_before, 0);
  
  -- Inserir auditoria
  INSERT INTO transactions_audit (
    transaction_id,
    user_id,
    action_type,
    transaction_type,
    amount_before,
    amount_after,
    amount_delta,
    description_before,
    description_after,
    metadata_before,
    metadata_after,
    status,
    approved_by,
    approved_at,
    source,
    origin
  ) VALUES (
    p_transaction_id,
    p_user_id,
    p_action_type,
    p_transaction_type,
    p_amount_before,
    p_amount_after,
    amount_delta,
    p_description_before,
    p_description_after,
    p_metadata_before,
    p_metadata_after,
    p_status,
    p_approved_by,
    CASE WHEN p_approved_by IS NOT NULL THEN NOW() ELSE NULL END,
    p_source,
    p_origin
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ============================================================================

-- Trigger para auditar transações automaticamente
CREATE OR REPLACE FUNCTION public.trigger_audit_transaction()
RETURNS TRIGGER AS $$
DECLARE
  audit_id UUID;
BEGIN
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    audit_id := public.audit_transaction(
      NEW.id,
      NEW.user_id,
      'create',
      NEW.type,
      NULL,
      NEW.amount,
      NULL,
      NEW.description,
      NULL,
      NEW.metadata,
      'approved',
      NULL,
      'system_action',
      'trigger'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    audit_id := public.audit_transaction(
      NEW.id,
      NEW.user_id,
      'update',
      NEW.type,
      OLD.amount,
      NEW.amount,
      OLD.description,
      NEW.description,
      OLD.metadata,
      NEW.metadata,
      'approved',
      NULL,
      'system_action',
      'trigger'
    );
  ELSIF TG_OP = 'DELETE' THEN
    audit_id := public.audit_transaction(
      OLD.id,
      OLD.user_id,
      'delete',
      OLD.type,
      OLD.amount,
      NULL,
      OLD.description,
      NULL,
      OLD.metadata,
      NULL,
      'approved',
      NULL,
      'system_action',
      'trigger'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_audit_transaction'
  ) THEN
    CREATE TRIGGER trigger_audit_transaction
      AFTER INSERT OR UPDATE OR DELETE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_audit_transaction();
  END IF;
END $$;

-- ============================================================================
-- 5. POLÍTICAS RLS
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE logs_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_audit ENABLE ROW LEVEL SECURITY;

-- Políticas para logs_gamification
CREATE POLICY "Users can view own gamification logs" ON logs_gamification
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

CREATE POLICY "Staff can view all gamification logs" ON logs_gamification
  FOR ALL USING (public.is_staff());

-- Políticas para transactions_audit
CREATE POLICY "Users can view own transaction audit" ON transactions_audit
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.uid()::text
    )
  );

CREATE POLICY "Staff can view all transaction audit" ON transactions_audit
  FOR ALL USING (public.is_staff());

-- ============================================================================
-- 6. VIEWS ÚTEIS PARA AUDITORIA
-- ============================================================================

-- View para logs de gamificação com informações do usuário
CREATE OR REPLACE VIEW gamification_logs_with_user AS
SELECT 
  lg.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role
FROM logs_gamification lg
JOIN users u ON lg.user_id = u.id
WHERE u.clerk_id = auth.uid()::text OR public.is_staff();

-- View para auditoria de transações com informações do usuário
CREATE OR REPLACE VIEW transaction_audit_with_user AS
SELECT 
  ta.*,
  u.display_name as user_name,
  u.email as user_email,
  u.role as user_role,
  approver.display_name as approver_name
FROM transactions_audit ta
JOIN users u ON ta.user_id = u.id
LEFT JOIN users approver ON ta.approved_by = approver.id
WHERE u.clerk_id = auth.uid()::text OR public.is_staff();

-- View para estatísticas de auditoria
CREATE OR REPLACE VIEW audit_statistics AS
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
-- 7. FUNÇÕES DE LIMPEZA AUTOMÁTICA
-- ============================================================================

-- Função para limpar logs expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_gamification INTEGER;
  deleted_audit INTEGER;
  total_deleted INTEGER;
BEGIN
  -- Limpar logs de gamificação expirados
  DELETE FROM logs_gamification 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_gamification = ROW_COUNT;
  
  -- Limpar auditoria de transações expirada
  DELETE FROM transactions_audit 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_audit = ROW_COUNT;
  
  -- Calcular total
  total_deleted := deleted_gamification + deleted_audit;
  
  RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE logs_gamification IS 'Logs detalhados de ações de gamificação por usuário';
COMMENT ON TABLE transactions_audit IS 'Auditoria completa de transações com histórico de mudanças';
COMMENT ON FUNCTION public.is_valid_action IS 'Valida se uma ação de gamificação é válida';
COMMENT ON FUNCTION public.is_valid_source IS 'Valida se uma origem de ação é válida';
COMMENT ON FUNCTION public.log_gamification_action IS 'Registra log de ação de gamificação';
COMMENT ON FUNCTION public.audit_transaction IS 'Registra auditoria de transação';
COMMENT ON FUNCTION public.cleanup_expired_logs IS 'Remove logs e auditoria expirados';
