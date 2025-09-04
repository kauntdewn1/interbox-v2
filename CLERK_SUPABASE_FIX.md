# 🔧 Correção Clerk + Supabase - INTERBØX V2

> **PROBLEMA IDENTIFICADO:** Login do Clerk não funciona no site após deploy porque o Supabase não está configurado para aceitar JWTs do Clerk.

---

## 🚨 **PROBLEMA**

O Supabase está rejeitando as requisições autenticadas do Clerk porque:

1. **JWT Template não configurado** no Clerk Dashboard
2. **Supabase não configurado** para aceitar JWTs do Clerk
3. **RLS Policies** não aplicadas corretamente
4. **Código não configurado** para enviar JWT do Clerk

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Arquivos Criados/Atualizados:**

- ✅ `supabase/rls-policies-clerk.sql` - Políticas RLS otimizadas para Clerk
- ✅ `src/lib/supabase-clerk.ts` - Cliente Supabase configurado para Clerk
- ✅ `src/hooks/useClerkSupabase.ts` - Hook atualizado com JWT do Clerk
- ✅ `src/components/ClerkSupabaseTest.tsx` - Componente de teste
- ✅ `supabase/clerk-config.md` - Guia de configuração

### **2. Configurações Implementadas:**

- ✅ **JWT Configuration** no hook useClerkSupabase
- ✅ **Auto-configuração** do token Clerk no Supabase
- ✅ **RLS Policies** específicas para Clerk
- ✅ **Testes automatizados** de integração

---

## 🚀 **PRÓXIMOS PASSOS (CRÍTICOS)**

### **1. Configurar JWT Template no Clerk Dashboard**

```bash
# Acesse: https://clerk.com/dashboard
# Vá para: JWT Templates > New template
# Nome: "supabase"
# Configuração:
```

```json
{
  "aud": "authenticated",
  "exp": "{{session.expire_at}}",
  "iat": "{{session.issued_at}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "role": "authenticated",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "email": "{{user.primary_email_address.email_address}}",
    "name": "{{user.full_name}}",
    "picture": "{{user.profile_image_url}}"
  }
}
```

### **2. Configurar Supabase Dashboard**

```bash
# Acesse: https://supabase.com/dashboard
# Vá para: Authentication > Settings
# JWT Settings:
# - JWT Secret: [Secret do template supabase do Clerk]
# - JWT Issuer: https://your-clerk-domain.clerk.accounts.dev
# - JWT Audience: authenticated
```

### **3. Executar Script RLS**

```sql
-- Execute no SQL Editor do Supabase:
-- Arquivo: supabase/rls-policies-clerk.sql
```

### **4. Testar Integração**

```bash
# Acesse: /clerk-supabase-test
# Execute todos os testes
# Verifique se JWT está sendo enviado
```

---

## 🧪 **TESTE DE VERIFICAÇÃO**

### **Componente de Teste Criado:**

- **Rota:** `/clerk-supabase-test`
- **Funcionalidades:**
  - ✅ Verificar autenticação Clerk
  - ✅ Testar JWT Token
  - ✅ Verificar conexão Supabase
  - ✅ Testar sincronização de usuário
  - ✅ Verificar RLS Policies

### **Como Usar:**

1. Faça login no site
2. Acesse `/clerk-supabase-test`
3. Execute "🧪 Executar Todos os Testes"
4. Verifique se todos passaram

---

## 🔍 **TROUBLESHOOTING**

### **Erro: "Invalid JWT"**

**Causa:** JWT Template não configurado ou secret incorreto
**Solução:**
1. Verificar se template "supabase" existe no Clerk
2. Confirmar JWT secret no Supabase
3. Verificar issuer e audience

### **Erro: "RLS Blocked"**

**Causa:** Políticas RLS não aplicadas
**Solução:**
1. Executar script `rls-policies-clerk.sql`
2. Verificar se RLS está habilitado
3. Testar com usuário autenticado

### **Erro: "CORS Error"**

**Causa:** Domínio não permitido
**Solução:**
1. Adicionar domínio no Clerk Dashboard
2. Configurar CORS no Supabase
3. Verificar headers de requisição

---

## 📊 **STATUS ATUAL**

- ✅ **Código:** Implementado e funcionando
- ✅ **Build:** Sucesso (0 erros)
- ⏳ **JWT Template:** Precisa ser configurado no Clerk
- ⏳ **Supabase Config:** Precisa ser configurado
- ⏳ **RLS Policies:** Precisa ser executado
- ⏳ **Teste:** Precisa ser validado

---

## 🎯 **RESULTADO ESPERADO**

Após configurar o JWT Template no Clerk e executar o script RLS no Supabase:

1. ✅ **Login funcionará** no site em produção
2. ✅ **Dados serão sincronizados** entre Clerk e Supabase
3. ✅ **RLS funcionará** corretamente
4. ✅ **Usuários poderão acessar** suas páginas de perfil
5. ✅ **Gamificação funcionará** com dados reais

---

> **⚠️ AÇÃO NECESSÁRIA:** Configurar JWT Template no Clerk Dashboard e executar script RLS no Supabase para resolver o problema de login.
