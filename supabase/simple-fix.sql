-- ============================================================================
-- CORREÇÃO SIMPLES - INTERBØX V2
-- ============================================================================
-- Apenas recria as funções de auth no schema correto
-- ============================================================================

-- ============================================================================
-- 1. RECRIAR FUNÇÕES DE AUTENTICAÇÃO NO SCHEMA PUBLIC
-- ============================================================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
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
  SELECT role INTO user_role
  FROM users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'publico');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Agora execute apenas:
-- supabase/complete-setup.sql
