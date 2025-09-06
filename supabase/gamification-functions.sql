-- ============================================================================
-- FUNÇÕES DE GAMIFICAÇÃO - INTERBØX V2
-- ============================================================================
-- Execute este arquivo após o setup-remoto.sql
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE GAMIFICAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  referral_code VARCHAR(50) UNIQUE,
  total_invites INTEGER DEFAULT 0,
  successful_invites INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_tokens ON user_gamification(tokens);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON user_gamification(level);
CREATE INDEX IF NOT EXISTS idx_user_gamification_referral_code ON user_gamification(referral_code);

-- ============================================================================
-- 2. TABELA DE TRANSAÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- 3. FUNÇÕES DE GAMIFICAÇÃO
-- ============================================================================

-- Função para criar usuário com gamificação
CREATE OR REPLACE FUNCTION public.create_user_with_gamification(
  p_clerk_id TEXT,
  p_email TEXT,
  p_display_name TEXT,
  p_photo_url TEXT,
  p_role user_role DEFAULT 'publico'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id UUID;
  referral_code TEXT;
BEGIN
  -- Inserir usuário
  INSERT INTO users (clerk_id, email, display_name, photo_url, role)
  VALUES (p_clerk_id, p_email, p_display_name, p_photo_url, p_role)
  RETURNING id INTO user_id;

  -- Gerar código de referral único
  LOOP
    referral_code := upper(substring(md5(random()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS(SELECT 1 FROM user_gamification WHERE referral_code = referral_code);
  END LOOP;

  -- Criar perfil de gamificação
  INSERT INTO user_gamification (user_id, referral_code)
  VALUES (user_id, referral_code);

  -- Adicionar tokens iniciais (25 $BØX por cadastro)
  INSERT INTO transactions (user_id, amount, type, description)
  VALUES (user_id, 25, 'registration_bonus', 'Bônus de cadastro inicial');

  -- Atualizar tokens do usuário
  UPDATE user_gamification 
  SET tokens = tokens + 25,
      updated_at = NOW()
  WHERE user_id = user_id;

  RETURN user_id;
END;
$$;

-- Função para adicionar tokens
CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verificar se usuário existe
  IF NOT EXISTS(SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN FALSE;
  END IF;

  -- Adicionar transação
  INSERT INTO transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, p_description);

  -- Atualizar tokens
  UPDATE user_gamification 
  SET tokens = tokens + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Função para obter leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  tokens INTEGER,
  level INTEGER,
  rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.display_name,
    ug.tokens,
    ug.level,
    ROW_NUMBER() OVER (ORDER BY ug.tokens DESC)::INTEGER as rank
  FROM users u
  JOIN user_gamification ug ON u.id = ug.user_id
  ORDER BY ug.tokens DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_gamification
DO $$ BEGIN
    CREATE POLICY "Users can view own gamification" ON user_gamification
      FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Políticas para transactions
DO $$ BEGIN
    CREATE POLICY "Users can view own transactions" ON transactions
      FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_id()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 5. VERIFICAÇÃO
-- ============================================================================

SELECT 'Funções de gamificação criadas com sucesso!' as status;
