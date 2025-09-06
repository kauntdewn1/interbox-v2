# 🚀 Setup do Supabase - INTERBØX V2

## 🎯 **OPÇÃO 1: Setup Completo (RECOMENDADO)**

Execute os arquivos na seguinte ordem:

```sql
-- 1. Primeiro execute o schema principal
../supabase-schema.sql

-- 2. Depois execute o setup completo
supabase/complete-setup.sql
```

## ⚠️ **SE EXECUTOU NA ORDEM ERRADA:**

Se executou `complete-setup.sql` primeiro e depois `supabase-schema.sql`:

### **SOLUÇÃO SIMPLES (RECOMENDADO)**
```sql
-- 1. Execute a correção simples
supabase/simple-fix.sql

-- 2. Execute o setup completo corrigido
supabase/complete-setup-fixed.sql

-- 3. Execute o setup de segurança e auditoria
supabase/security-audit-setup.sql
```

### **OPÇÃO ALTERNATIVA: Limpeza Completa**
```sql
-- 1. Execute a limpeza de políticas primeiro
supabase/cleanup-policies.sql

-- 2. Execute a limpeza segura
supabase/safe-cleanup.sql

-- 3. Execute o setup completo
supabase/complete-setup.sql
```

## 📋 **OPÇÃO 2: Setup Manual (se necessário)**

Execute os arquivos SQL na seguinte ordem para evitar erros de dependência:

### 1. **Schema Principal** (PRIMEIRO)
```sql
-- Execute este arquivo primeiro (na raiz do projeto)
../supabase-schema.sql
```

### 2. **Funções de Autenticação**
```sql
-- Execute este arquivo segundo
supabase/auth-functions.sql
```

### 3. **Tabela de Convites**
```sql
-- Execute este arquivo terceiro
supabase/invites-table.sql
```

## 🔧 Comandos de Execução

### Via Supabase CLI:
```bash
# 1. Funções de autenticação
supabase db reset --file supabase/auth-functions.sql

# 2. Schema principal
supabase db reset --file supabase-schema.sql

# 3. Tabela de convites
supabase db reset --file supabase/invites-table.sql
```

### Via Dashboard do Supabase:
1. Acesse o Dashboard do Supabase
2. Vá em **SQL Editor**
3. Execute cada arquivo na ordem indicada
4. Verifique se não há erros

## ✅ Verificação

Após executar todos os scripts, verifique se as seguintes funções existem:

```sql
-- Verificar funções de autenticação
SELECT proname FROM pg_proc WHERE proname LIKE 'auth.is_%';

-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_gamification', 'invites');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🚨 Troubleshooting

### Erro: "function auth.is_staff() does not exist"
**Solução:** Execute primeiro o arquivo `supabase/auth-functions.sql`

### Erro: "relation 'users' does not exist"
**Solução:** Execute primeiro o arquivo `supabase-schema.sql`

### Erro: "function add_tokens does not exist"
**Solução:** Execute o arquivo `supabase/create-user-function.sql`

## 📊 Estrutura Final

Após a execução completa, você terá:

- ✅ **Tabelas:** `users`, `user_gamification`, `invites`, `transactions`, etc.
- ✅ **Funções:** `add_tokens`, `create_user_with_gamification`, `create_invite`, etc.
- ✅ **Políticas RLS:** Configuradas para todas as tabelas
- ✅ **Funções de Auth:** `auth.is_staff()`, `auth.is_admin()`, etc.
- ✅ **Triggers:** Atualização automática de timestamps
- ✅ **Views:** Para consultas otimizadas

## 🔐 Segurança

Todas as funções são criadas com `SECURITY DEFINER` para garantir:
- ✅ Execução com privilégios do criador
- ✅ Validação de permissões adequada
- ✅ Proteção contra SQL injection
- ✅ Auditoria completa de ações
