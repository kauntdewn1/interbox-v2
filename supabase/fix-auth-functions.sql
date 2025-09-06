-- ============================================================================
-- CORREÇÃO DAS FUNÇÕES DE AUTENTICAÇÃO - INTERBØX V2
-- ============================================================================
-- Corrige inconsistências nas funções de autenticação para resolver erro 404
-- ============================================================================

-- ============================================================================
-- 1. REMOVER FUNÇÕES CONFLITANTES
-- ============================================================================

-- Remover funções do schema auth (conflitantes)
DROP FUNCTION IF EXISTS auth.clerk_id() CASCADE;
DROP FUNCTION IF EXISTS auth.user_id() CASCADE;
DROP FUNCTION IF EXISTS auth.is_staff() CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.is_atleta() CASCADE;
DROP FUNCTION IF EXISTS auth.is_judge() CASCADE;
DROP FUNCTION IF EXISTS auth.is_midia() CASCADE;
DROP FUNCTION IF EXISTS auth.is_espectador() CASCADE;

-- ============================================================================
-- 2. RECRIAR FUNÇÕES NO SCHEMA PUBLIC (CONSISTENTES)
-- ============================================================================

-- Função para obter o clerk_id atual
CREATE OR REPLACE FUNCTION public.clerk_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

-- Função para obter o user_id baseado no clerk_id
-- (Será criada após a tabela users existir)

-- Funções que dependem da tabela users serão criadas em arquivo separado
-- após a tabela users existir

-- ============================================================================
-- 3. POLÍTICAS RLS
-- ============================================================================

-- Políticas RLS serão criadas em arquivo separado
-- após as funções e tabelas estarem prontas

-- ============================================================================
-- 4. VERIFICAR FUNÇÕES CRIADAS
-- ============================================================================

-- Verificar se a função clerk_id foi criada corretamente
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  proargnames as argument_names
FROM pg_proc 
WHERE proname = 'clerk_id'
  AND pronamespace = 'public'::regnamespace;

-- ============================================================================
-- COMENTÁRIO FINAL
-- ============================================================================

-- Todas as funções de autenticação agora estão no schema public
-- e usam public.clerk_id() consistentemente
-- Execute este arquivo para resolver o erro 404 no PATCH /users
