-- ============================================================================
-- FUNÇÃO PARA CRIAR USUÁRIO COM GAMIFICAÇÃO - INTERBØX V2
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

-- ============================================================================
-- COMENTÁRIOS E PERMISSÕES
-- ============================================================================

COMMENT ON FUNCTION create_user_with_gamification IS 'Cria um novo usuário com dados de gamificação iniciais';

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION create_user_with_gamification TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_gamification TO anon;
