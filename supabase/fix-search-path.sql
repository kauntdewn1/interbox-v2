-- ============================================================================
-- CORREÇÃO DO SEARCH_PATH - INTERBØX V2
-- ============================================================================
-- Corrige todas as funções para ter search_path seguro
-- ============================================================================

-- ============================================================================
-- 1. FUNÇÕES DE GAMIFICAÇÃO
-- ============================================================================

-- Corrigir update_gamification_level
CREATE OR REPLACE FUNCTION public.update_gamification_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Lógica da função mantida
  IF NEW.box_tokens IS DISTINCT FROM OLD.box_tokens THEN
    NEW.level = CASE
      WHEN NEW.box_tokens >= 1000 THEN 'diamante'
      WHEN NEW.box_tokens >= 500 THEN 'ouro'
      WHEN NEW.box_tokens >= 200 THEN 'prata'
      WHEN NEW.box_tokens >= 100 THEN 'bronze'
      ELSE 'iniciante'
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Corrigir add_tokens
CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Lógica da função mantida
  SELECT box_tokens INTO current_balance
  FROM user_gamification
  WHERE user_id = p_user_id;

  IF current_balance IS NULL THEN
    current_balance := 0;
  END IF;

  new_balance := current_balance + p_amount;

  UPDATE user_gamification
  SET box_tokens = new_balance
  WHERE user_id = p_user_id;

  INSERT INTO transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type::transaction_type, p_description)
  RETURNING id INTO transaction_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance
  );
END;
$$;

-- ============================================================================
-- 2. FUNÇÕES DE AUTENTICAÇÃO E ROLES
-- ============================================================================

-- Corrigir is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role = 'admin'
  );
END;
$$;

-- Corrigir is_staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role IN ('admin', 'staff', 'dev')
  );
END;
$$;

-- Corrigir is_atleta
CREATE OR REPLACE FUNCTION public.is_atleta()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role = 'atleta'
  );
END;
$$;

-- Corrigir is_judge
CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role = 'judge'
  );
END;
$$;

-- Corrigir is_midia
CREATE OR REPLACE FUNCTION public.is_midia()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role = 'midia'
  );
END;
$$;

-- Corrigir is_espectador
CREATE OR REPLACE FUNCTION public.is_espectador()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND role = 'espectador'
  );
END;
$$;

-- Corrigir user_role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE clerk_id = auth.uid()::text;
  
  RETURN COALESCE(user_role, 'publico');
END;
$$;

-- Corrigir has_complete_profile
CREATE OR REPLACE FUNCTION public.has_complete_profile()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND display_name IS NOT NULL
    AND display_name != ''
    AND photo_url IS NOT NULL
    AND photo_url != ''
  );
END;
$$;

-- Corrigir is_user_active
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.uid()::text
    AND status = 'active'
  );
END;
$$;

-- ============================================================================
-- 3. FUNÇÕES DE CONVITES
-- ============================================================================

-- Corrigir create_invite
CREATE OR REPLACE FUNCTION public.create_invite(
  p_email TEXT,
  p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inviter_id UUID;
  referral_code TEXT;
  invite_id UUID;
BEGIN
  -- Lógica da função mantida
  SELECT id INTO inviter_id
  FROM users
  WHERE clerk_id = auth.uid()::text;

  IF inviter_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

  -- Gerar código de referência
  referral_code := public.generate_referral_code();

  INSERT INTO invites (inviter_id, email, message, referral_code)
  VALUES (inviter_id, p_email, p_message, referral_code)
  RETURNING id INTO invite_id;

  RETURN json_build_object(
    'success', true,
    'invite_id', invite_id,
    'referral_code', referral_code
  );
END;
$$;

-- Corrigir accept_invite
CREATE OR REPLACE FUNCTION public.accept_invite(
  p_invite_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invite_record RECORD;
  new_user_id UUID;
BEGIN
  -- Lógica da função mantida
  SELECT * INTO invite_record
  FROM invites
  WHERE id = p_invite_id
  AND status = 'pending'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Convite inválido ou expirado');
  END IF;

  -- Obter ID do usuário atual
  SELECT id INTO new_user_id
  FROM users
  WHERE clerk_id = auth.uid()::text;

  IF new_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

  -- Atualizar convite
  UPDATE invites
  SET status = 'accepted', accepted_at = NOW(), accepted_by = new_user_id
  WHERE id = p_invite_id;

  -- Dar tokens para quem convidou
  PERFORM public.add_tokens(
    invite_record.inviter_id,
    50,
    'referral'::transaction_type,
    'Convite aceito por ' || p_email
  );

  RETURN json_build_object('success', true, 'message', 'Convite aceito com sucesso');
END;
$$;

-- Corrigir get_invite_stats
CREATE OR REPLACE FUNCTION public.get_invite_stats(p_user_id UUID)
RETURNS TABLE(
  total_sent INTEGER,
  total_accepted INTEGER,
  total_pending INTEGER,
  total_expired INTEGER,
  total_tokens_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_sent,
    COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as total_accepted,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as total_pending,
    COUNT(*) FILTER (WHERE status = 'expired')::INTEGER as total_expired,
    (COUNT(*) FILTER (WHERE status = 'accepted') * 50)::INTEGER as total_tokens_earned
  FROM invites
  WHERE inviter_id = p_user_id;
END;
$$;

-- Corrigir generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    SELECT EXISTS(
      SELECT 1 FROM user_gamification 
      WHERE referral_code = code
    ) INTO exists_code;
    
    EXIT WHEN NOT exists_code;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Corrigir update_invites_updated_at
CREATE OR REPLACE FUNCTION public.update_invites_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. FUNÇÕES DE AUDITORIA
-- ============================================================================

-- Corrigir is_valid_action
DROP FUNCTION IF EXISTS public.is_valid_action(TEXT);
CREATE FUNCTION public.is_valid_action(p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN p_action IN (
    'register', 'profile_complete', 'checkin', 'referral',
    'payment', 'social_share', 'event_participation'
  );
END;
$$;

-- Corrigir is_valid_source
DROP FUNCTION IF EXISTS public.is_valid_source(TEXT);
CREATE FUNCTION public.is_valid_source(p_source TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN p_source IN (
    'user_action', 'system', 'admin', 'api', 'qr_checkin'
  );
END;
$$;

-- Corrigir log_gamification_action
CREATE OR REPLACE FUNCTION public.log_gamification_action(
  p_user_id UUID,
  p_action TEXT,
  p_tokens_before INTEGER,
  p_tokens_after INTEGER,
  p_level_before TEXT,
  p_level_after TEXT,
  p_source TEXT,
  p_origin TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_status TEXT DEFAULT 'success'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO logs_gamification (
    user_id, action, tokens_before, tokens_after,
    level_before, level_after, source, origin, metadata, status
  ) VALUES (
    p_user_id, p_action, p_tokens_before, p_tokens_after,
    p_level_before, p_level_after, p_source, p_origin, p_metadata, p_status
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Corrigir audit_transaction
CREATE OR REPLACE FUNCTION public.audit_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO transactions_audit (
    transaction_id, user_id, action_type, amount_before, amount_after,
    source, origin, status, metadata
  ) VALUES (
    NEW.id, NEW.user_id, 'create', 0, NEW.amount,
    'user_action', 'api', 'success', json_build_object('type', NEW.type)
  );
  
  RETURN NEW;
END;
$$;

-- Corrigir trigger_audit_transaction
CREATE OR REPLACE FUNCTION public.trigger_audit_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO transactions_audit (
      transaction_id, user_id, action_type, amount_before, amount_after,
      source, origin, status, metadata
    ) VALUES (
      NEW.id, NEW.user_id, 'create', 0, NEW.amount,
      'user_action', 'api', 'success', json_build_object('type', NEW.type)
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Corrigir cleanup_expired_logs
CREATE OR REPLACE FUNCTION public.cleanup_expired_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_gamification INTEGER := 0;
  deleted_transactions INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- Limpar logs de gamificação antigos (mais de 90 dias)
  DELETE FROM logs_gamification
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_gamification = ROW_COUNT;
  
  -- Limpar auditoria de transações antigas (mais de 1 ano)
  DELETE FROM transactions_audit
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_transactions = ROW_COUNT;
  
  total_deleted := deleted_gamification + deleted_transactions;
  
  RETURN total_deleted;
END;
$$;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Todas as funções agora têm search_path seguro
-- Execute este arquivo para corrigir as 22 warnings