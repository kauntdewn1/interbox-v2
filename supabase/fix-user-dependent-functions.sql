-- ============================================================================
-- FUNÇÕES QUE DEPENDEM DA TABELA USERS - INTERBØX V2
-- ============================================================================
-- Execute este arquivo APÓS a tabela users existir
-- ============================================================================

-- ============================================================================
-- 1. FUNÇÕES QUE DEPENDEM DA TABELA USERS
-- ============================================================================

-- Função para obter o user_id baseado no clerk_id
CREATE OR REPLACE FUNCTION public.user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM users WHERE clerk_id = public.clerk_id();
$$;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'admin'
  );
$$;

-- Função para verificar se o usuário é staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
  );
$$;

-- Função para verificar se o usuário é atleta
CREATE OR REPLACE FUNCTION public.is_atleta()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'atleta'
  );
$$;

-- Função para verificar se o usuário é judge
CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'judge'
  );
$$;

-- Função para verificar se o usuário é mídia
CREATE OR REPLACE FUNCTION public.is_midia()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'midia'
  );
$$;

-- Função para verificar se o usuário é espectador
CREATE OR REPLACE FUNCTION public.is_espectador()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'espectador'
  );
$$;

-- Função para obter o role do usuário
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'publico') FROM users WHERE clerk_id = public.clerk_id();
$$;

-- ============================================================================
-- 2. POLÍTICAS RLS PARA USERS
-- ============================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can update all users" ON users;
DROP POLICY IF EXISTS "Public leaderboard access" ON users;

-- Recriar políticas com funções consistentes
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id = public.clerk_id());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = public.clerk_id());

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_id = public.clerk_id());

CREATE POLICY "Staff can view all users" ON users
  FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff can update all users" ON users
  FOR UPDATE USING (public.is_staff());

CREATE POLICY "Public leaderboard access" ON users
  FOR SELECT USING (true);

-- ============================================================================
-- 3. VERIFICAR FUNÇÕES CRIADAS
-- ============================================================================

-- Verificar se as funções foram criadas corretamente
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  proargnames as argument_names
FROM pg_proc 
WHERE proname IN ('user_id', 'is_admin', 'is_staff', 'is_atleta', 'is_judge', 'is_midia', 'is_espectador', 'user_role')
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Todas as funções que dependem da tabela users foram criadas
-- Execute este arquivo APÓS a tabela users existir
-- para resolver o erro 404 no PATCH /users
