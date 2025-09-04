# 🔐 Configuração Clerk + Supabase

> Guia para configurar a integração entre Clerk e Supabase

---

## 🚨 PROBLEMA IDENTIFICADO

O Supabase não está configurado para aceitar JWTs do Clerk, por isso o login não funciona mesmo após o deploy.

---

## ✅ SOLUÇÃO: Configurar JWT Template no Clerk

### **Passo 1: Acessar Clerk Dashboard**

1. Vá para [clerk.com](https://clerk.com)
2. Acesse seu projeto INTERBØX
3. Vá para **JWT Templates**

### **Passo 2: Criar Template para Supabase**

1. Clique em **"New template"**
2. Nome: `supabase`
3. Configuração:

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

### **Passo 3: Configurar Supabase Dashboard**

1. Acesse [supabase.com](https://supabase.com)
2. Vá para seu projeto INTERBØX
3. Acesse **Authentication > Settings**
4. Em **JWT Settings**, configure:

**JWT Secret**: Use o secret do template `supabase` do Clerk
**JWT Issuer**: `https://your-clerk-domain.clerk.accounts.dev`
**JWT Audience**: `authenticated`

---

## 🔧 Configuração no Código

### **Atualizar useClerkSupabase.ts**

```typescript
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase-clerk';

export function useClerkSupabase() {
  const { getToken, isSignedIn } = useAuth();
  
  const getAuthenticatedSupabase = async () => {
    if (!isSignedIn) return supabase;
    
    const token = await getToken({ template: 'supabase' });
    
    if (token) {
      // Configurar token no Supabase
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });
    }
    
    return supabase;
  };
  
  return { getAuthenticatedSupabase };
}
```

---

## 🧪 Teste de Configuração

### **1. Testar JWT Template**

```typescript
import { useAuth } from '@clerk/clerk-react';

function TestJWT() {
  const { getToken } = useAuth();
  
  const testToken = async () => {
    const token = await getToken({ template: 'supabase' });
    console.log('JWT Token:', token);
  };
  
  return <button onClick={testToken}>Testar JWT</button>;
}
```

### **2. Testar Conexão Supabase**

```typescript
import { testClerkSupabaseConnection } from '../lib/supabase-clerk';

const result = await testClerkSupabaseConnection();
console.log('Resultado:', result);
```

---

## 🔍 Verificações Necessárias

### **1. Variáveis de Ambiente**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Domínios Permitidos no Clerk**

- `https://cerradointerbox.com.br`
- `https://interbox-v2.vercel.app`
- `http://localhost:3000` (desenvolvimento)

### **3. CORS no Supabase**

```sql
-- Verificar configurações CORS
SELECT * FROM pg_settings WHERE name = 'cors.allowed_origins';
```

---

## 🚀 Deploy e Teste

### **1. Fazer Deploy**

```bash
git add .
git commit -m "fix: configurar integração Clerk + Supabase"
git push
```

### **2. Testar Login**

1. Acesse o site em produção
2. Tente fazer login
3. Verifique se o JWT está sendo enviado
4. Teste acesso aos dados do Supabase

---

## 🔧 Troubleshooting

### **Problema: "Invalid JWT"**

**Solução:**
1. Verificar se o JWT secret está correto no Supabase
2. Confirmar se o template `supabase` existe no Clerk
3. Verificar se o issuer está correto

### **Problema: "CORS Error"**

**Solução:**
1. Adicionar domínio no Clerk
2. Configurar CORS no Supabase
3. Verificar headers de requisição

### **Problema: "RLS Blocked"**

**Solução:**
1. Executar script `rls-policies-clerk.sql`
2. Verificar se as políticas estão aplicadas
3. Testar com usuário autenticado

---

## 📊 Status da Configuração

- [ ] JWT Template criado no Clerk
- [ ] Supabase configurado para aceitar JWT do Clerk
- [ ] Código atualizado para usar JWT
- [ ] Deploy realizado
- [ ] Login testado em produção

---

> **Próximo passo:** Configurar JWT Template no Clerk Dashboard
