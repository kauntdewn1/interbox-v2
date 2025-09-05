-- ============================================================================
-- CORRIGIR WARNINGS - INTERBØX V2
-- ============================================================================
-- Script para corrigir as warnings de search_path das funções

-- Recriar funções com search_path definido
CREATE OR REPLACE FUNCTION public.clerk_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

CREATE OR REPLACE FUNCTION public.user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE clerk_id = public.clerk_id();
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role IN ('admin', 'dev', 'marketing', 'staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE clerk_id = public.clerk_id() 
    AND role = 'admin'
  );
$$;

-- Verificar se as funções foram atualizadas
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc 
WHERE proname IN ('clerk_id', 'user_id', 'is_staff', 'is_admin')
  AND pronamespace = 'public'::regnamespace;
