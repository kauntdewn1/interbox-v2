-- ============================================================================
-- CORREÇÃO APENAS DAS FUNÇÕES - INTERBØX V2
-- ============================================================================
-- Remover e recriar funções com box_tokens
-- ============================================================================

-- 1. Remover funções existentes
DROP FUNCTION IF EXISTS get_leaderboard(integer);
DROP FUNCTION IF EXISTS add_tokens(UUID, INTEGER, VARCHAR, TEXT);

-- 2. Recriar função add_tokens com box_tokens
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

-- 3. Recriar função get_leaderboard com box_tokens
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

-- 4. Verificar se create_user_with_gamification existe, se não, criar
CREATE OR REPLACE FUNCTION create_user_with_gamification(
    p_clerk_id TEXT,
    p_display_name TEXT,
    p_email TEXT,
    p_photo_url TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'publico'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_uuid UUID;
    referral_code TEXT;
BEGIN
    -- Gerar código de convite único
    referral_code := UPPER(SUBSTRING(MD5(p_clerk_id || NOW()::TEXT) FROM 1 FOR 8));
    
    -- Inserir usuário
    INSERT INTO users (clerk_id, display_name, email, photo_url, role)
    VALUES (p_clerk_id, p_display_name, p_email, p_photo_url, p_role::user_role)
    RETURNING id INTO user_uuid;
    
    -- Criar registro de gamificação com 25 tokens iniciais
    INSERT INTO user_gamification (user_id, box_tokens, referral_code)
    VALUES (user_uuid, 25, referral_code);
    
    -- Registrar transação inicial
    INSERT INTO transactions (user_id, amount, type, description)
    VALUES (user_uuid, 25, 'cadastro', 'Tokens de boas-vindas');
    
    RETURN user_uuid;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
END;
$$;

-- Confirmação
DO $$ 
BEGIN
    RAISE NOTICE 'Funções atualizadas com sucesso!';
    RAISE NOTICE 'add_tokens() agora usa box_tokens';
    RAISE NOTICE 'get_leaderboard() agora usa box_tokens';
    RAISE NOTICE 'create_user_with_gamification() verificada';
END $$;
