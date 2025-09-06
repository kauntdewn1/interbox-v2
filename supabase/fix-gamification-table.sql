-- ============================================================================
-- CORREÇÃO DA TABELA USER_GAMIFICATION - INTERBØX V2
-- ============================================================================
-- Corrigir nome da coluna de tokens para box_tokens
-- ============================================================================

-- 1. Verificar se a tabela existe e renomear coluna
DO $$ 
BEGIN
    -- Renomear coluna tokens para box_tokens se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_gamification' 
        AND column_name = 'tokens'
    ) THEN
        ALTER TABLE user_gamification RENAME COLUMN tokens TO box_tokens;
        RAISE NOTICE 'Coluna tokens renomeada para box_tokens';
    END IF;
    
    -- Verificar se box_tokens já existe, se não, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_gamification' 
        AND column_name = 'box_tokens'
    ) THEN
        ALTER TABLE user_gamification ADD COLUMN box_tokens INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna box_tokens criada';
    END IF;
END $$;

-- 2. Atualizar índices
DROP INDEX IF EXISTS idx_user_gamification_tokens;
CREATE INDEX IF NOT EXISTS idx_user_gamification_box_tokens ON user_gamification(box_tokens);

-- 3. Atualizar função add_tokens para usar box_tokens
CREATE OR REPLACE FUNCTION add_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_action_type VARCHAR DEFAULT 'manual',
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_tokens INTEGER;
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;

    -- Atualizar tokens na tabela user_gamification
    UPDATE user_gamification 
    SET 
        box_tokens = COALESCE(box_tokens, 0) + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Se não existir registro de gamificação, criar
    IF NOT FOUND THEN
        INSERT INTO user_gamification (user_id, box_tokens)
        VALUES (p_user_id, p_amount);
    END IF;

    -- Registrar transação
    INSERT INTO transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, p_action_type, p_description);

    -- Obter tokens atuais
    SELECT box_tokens INTO current_tokens 
    FROM user_gamification 
    WHERE user_id = p_user_id;

    RAISE NOTICE 'Tokens adicionados: % | Total atual: %', p_amount, current_tokens;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao adicionar tokens: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- 4. Atualizar função get_leaderboard para usar box_tokens
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    photo_url TEXT,
    box_tokens INTEGER,
    level INTEGER,
    rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ug.user_id,
        COALESCE(u.display_name, u.email, 'Usuário') as display_name,
        u.photo_url,
        COALESCE(ug.box_tokens, 0) as box_tokens,
        COALESCE(ug.level, 1) as level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(ug.box_tokens, 0) DESC)::INTEGER as rank
    FROM user_gamification ug
    INNER JOIN users u ON ug.user_id = u.id
    ORDER BY ug.box_tokens DESC
    LIMIT limit_count;
END;
$$;

-- 5. Garantir que políticas RLS existam
DO $$ 
BEGIN
    -- Política para visualizar própria gamificação
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_gamification' 
        AND policyname = 'Users can view own gamification'
    ) THEN
        CREATE POLICY "Users can view own gamification" ON user_gamification
            FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    -- Política para atualizar própria gamificação
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_gamification' 
        AND policyname = 'Users can update own gamification'
    ) THEN
        CREATE POLICY "Users can update own gamification" ON user_gamification
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
    
    -- Política para visualizar leaderboard
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_gamification' 
        AND policyname = 'Anyone can view leaderboard'
    ) THEN
        CREATE POLICY "Anyone can view leaderboard" ON user_gamification
            FOR SELECT USING (true);
    END IF;
END $$;

-- 6. Ativar RLS se não estiver ativo
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TESTE RÁPIDO E CONFIRMAÇÃO
-- ============================================================================

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_gamification' 
ORDER BY ordinal_position;

-- Confirmação final
DO $$ 
BEGIN
    RAISE NOTICE 'Correção da tabela user_gamification concluída!';
    RAISE NOTICE 'Tabela user_gamification agora usa box_tokens em vez de tokens';
    RAISE NOTICE 'Funções add_tokens() e get_leaderboard() atualizadas';
    RAISE NOTICE 'Políticas RLS verificadas e ativadas';
END $$;
