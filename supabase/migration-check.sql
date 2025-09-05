-- ============================================================================
-- VERIFICAÇÃO E MIGRAÇÃO DO SCHEMA - INTERBØX V2
-- ============================================================================
-- Script para verificar se o schema está atualizado e aplicar correções

-- ============================================================================
-- VERIFICAÇÃO DE CAMPOS FALTANTES
-- ============================================================================

-- Verificar se todos os campos necessários existem na tabela users
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col TEXT;
    required_columns TEXT[] := ARRAY[
        'whatsapp', 'mensagem', 'is_active', 'test_user', 'team_id', 'avatar_url'
    ];
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = col
            AND table_schema = 'public'
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Campos faltantes na tabela users: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Todos os campos necessários existem na tabela users';
    END IF;
END $$;

-- Verificar se todos os campos necessários existem na tabela user_gamification
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col TEXT;
    required_columns TEXT[] := ARRAY[
        'level', 'badges'
    ];
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_gamification' 
            AND column_name = col
            AND table_schema = 'public'
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Campos faltantes na tabela user_gamification: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Todos os campos necessários existem na tabela user_gamification';
    END IF;
END $$;

-- ============================================================================
-- ADICIONAR CAMPOS FALTANTES (se necessário)
-- ============================================================================

-- Adicionar campos faltantes na tabela users
DO $$
BEGIN
    -- Adicionar whatsapp se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'whatsapp' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN whatsapp TEXT;
        RAISE NOTICE 'Campo whatsapp adicionado à tabela users';
    END IF;

    -- Adicionar mensagem se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'mensagem' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN mensagem TEXT;
        RAISE NOTICE 'Campo mensagem adicionado à tabela users';
    END IF;

    -- Adicionar is_active se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Campo is_active adicionado à tabela users';
    END IF;

    -- Adicionar test_user se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'test_user' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN test_user BOOLEAN DEFAULT false;
        RAISE NOTICE 'Campo test_user adicionado à tabela users';
    END IF;

    -- Adicionar team_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'team_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN team_id UUID;
        RAISE NOTICE 'Campo team_id adicionado à tabela users';
    END IF;

    -- Adicionar avatar_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url' AND table_schema = 'public'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Campo avatar_url adicionado à tabela users';
    END IF;
END $$;

-- Adicionar campos faltantes na tabela user_gamification
DO $$
BEGIN
    -- Adicionar level se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_gamification' AND column_name = 'level' AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_gamification ADD COLUMN level gamification_level DEFAULT 'cindy';
        RAISE NOTICE 'Campo level adicionado à tabela user_gamification';
    END IF;

    -- Adicionar badges se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_gamification' AND column_name = 'badges' AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_gamification ADD COLUMN badges TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo badges adicionado à tabela user_gamification';
    END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar estrutura final da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura final da tabela user_gamification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_gamification' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_gamification')
ORDER BY tablename;
