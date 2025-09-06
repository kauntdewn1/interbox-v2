-- ============================================================================
-- SETUP SIMPLES - INTERBØX V2
-- ============================================================================
-- Migração simples para testar a criação das tabelas
-- ============================================================================

-- Criar tipos básicos
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

-- Criar tabela users
CREATE TABLE users (
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
