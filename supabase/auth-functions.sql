-- ============================================================================
-- FUNÇÕES DE AUTENTICAÇÃO - INTERBØX V2
-- ============================================================================
-- Este arquivo define funções de autenticação personalizadas para o Supabase
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

-- Função para verificar se usuário tem perfil completo
CREATE OR REPLACE FUNCTION public.has_complete_profile()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem perfil completo
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND profile_complete = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário está ativo
CREATE OR REPLACE FUNCTION public.is_user_active()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário está ativo
  RETURN EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuário é admin ou dev';
COMMENT ON FUNCTION public.is_staff() IS 'Verifica se o usuário é staff (admin, dev, marketing, staff)';
COMMENT ON FUNCTION public.is_atleta() IS 'Verifica se o usuário é atleta';
COMMENT ON FUNCTION public.is_judge() IS 'Verifica se o usuário é judge';
COMMENT ON FUNCTION public.is_midia() IS 'Verifica se o usuário é mídia';
COMMENT ON FUNCTION public.is_espectador() IS 'Verifica se o usuário é espectador';
COMMENT ON FUNCTION public.user_role() IS 'Retorna o role do usuário atual';
COMMENT ON FUNCTION public.has_complete_profile() IS 'Verifica se o usuário tem perfil completo';
COMMENT ON FUNCTION public.is_user_active() IS 'Verifica se o usuário está ativo';
