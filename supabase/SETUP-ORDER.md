# 🚀 Ordem de Execução do Supabase - INTERBØX V2

## 📍 **Localização dos Arquivos:**

- `supabase-schema.sql` - **RAIZ DO PROJETO** (não está na pasta supabase/)
- `supabase/` - Pasta com arquivos de setup e correções

## 🎯 **OPÇÃO 1: Setup Completo (RECOMENDADO)**

Execute os arquivos na seguinte ordem:

### **1. Schema Principal (RAIZ)**
```sql
-- Execute este arquivo PRIMEIRO (está na raiz do projeto)
supabase-schema.sql
```

### **2. Setup Completo**
```sql
-- Execute este arquivo SEGUNDO
supabase/complete-setup-fixed.sql
```

### **3. Segurança e Auditoria**
```sql
-- Execute este arquivo TERCEIRO
supabase/security-audit-setup.sql
```

## 🔧 **OPÇÃO 2: Correção de Erros**

Se já executou na ordem errada ou tem erros:

### **1. Correção Simples**
```sql
supabase/simple-fix.sql
```

### **2. Setup Completo Corrigido**
```sql
supabase/complete-setup-fixed.sql
```

### **3. Segurança e Auditoria**
```sql
supabase/security-audit-setup.sql
```

## 🛠️ **OPÇÃO 3: Correção de Views e Funções**

Para corrigir erros de Security Definer View e Function Search Path:

### **1. Correção das Views**
```sql
supabase/force-fix-views.sql
```

### **2. Correção do Search Path**
```sql
supabase/fix-search-path.sql
```

### **3. Correção das Funções de Auth**
```sql
supabase/fix-auth-functions.sql
```

### **4. Funções Dependentes de Users**
```sql
supabase/fix-user-dependent-functions.sql
```

## ⚠️ **IMPORTANTE:**

- **NUNCA** execute `complete-setup.sql` antes de `supabase-schema.sql`
- **SEMPRE** execute `supabase-schema.sql` primeiro
- Se tiver erros, use as opções de correção

## 📁 **Estrutura de Arquivos:**

```
interbox-v2/
├── supabase-schema.sql          ← EXECUTE PRIMEIRO (RAIZ)
├── supabase/
│   ├── complete-setup-fixed.sql ← EXECUTE SEGUNDO
│   ├── security-audit-setup.sql ← EXECUTE TERCEIRO
│   ├── force-fix-views.sql      ← Para corrigir views
│   ├── fix-search-path.sql      ← Para corrigir search path
│   ├── fix-auth-functions.sql   ← Para corrigir auth
│   └── fix-user-dependent-functions.sql ← Para corrigir funções
```

## 🎯 **Para Resolver o Erro 404:**

1. Execute `supabase-schema.sql` (raiz)
2. Execute `supabase/fix-auth-functions.sql`
3. Execute `supabase/fix-user-dependent-functions.sql`
