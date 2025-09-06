-- ============================================================================
-- SETUP REMOTO - INTERBØX V2
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- ============================================================================

-- Criar tipos básicos
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
      'publico',
      'atleta', 
      'judge',
      'midia',
      'espectador',
      'admin',
      'dev',
      'marketing',
      'staff'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role user_role DEFAULT 'publico',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função básica
CREATE OR REPLACE FUNCTION public.clerk_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$;

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política básica
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (clerk_id = public.clerk_id());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (clerk_id = public.clerk_id());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON users
      FOR INSERT WITH CHECK (clerk_id = public.clerk_id());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verificar se foi criado
SELECT 'Setup básico concluído com sucesso!' as status;
