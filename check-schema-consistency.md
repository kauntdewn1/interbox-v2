# 🔍 VERIFICAÇÃO DE CONSISTÊNCIA - SCHEMA vs CÓDIGO

## 📊 ANÁLISE COMPARATIVA

### **TABELA USERS - Schema vs Código**

| Campo | Schema Supabase | Código SetupProfile | Status |
|-------|----------------|-------------------|--------|
| `id` | UUID PRIMARY KEY | ✅ Opcional | ✅ OK |
| `clerk_id` | TEXT UNIQUE NOT NULL | ✅ Obrigatório | ✅ OK |
| `email` | TEXT NOT NULL | ✅ Obrigatório | ✅ OK |
| `display_name` | TEXT | ✅ Opcional | ✅ OK |
| `photo_url` | TEXT | ✅ Opcional | ✅ OK |
| `role` | user_role DEFAULT 'publico' | ✅ String | ⚠️ **INCONSISTÊNCIA** |
| `whatsapp` | TEXT | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `box` | TEXT | ✅ Opcional | ✅ OK |
| `cidade` | TEXT | ✅ Opcional | ✅ OK |
| `mensagem` | TEXT | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `profile_complete` | BOOLEAN DEFAULT false | ✅ Opcional | ✅ OK |
| `is_active` | BOOLEAN DEFAULT true | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `test_user` | BOOLEAN DEFAULT false | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `team_id` | UUID | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `avatar_url` | TEXT | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `created_at` | TIMESTAMP WITH TIME ZONE | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `updated_at` | TIMESTAMP WITH TIME ZONE | ❌ **FALTANDO** | ❌ **PROBLEMA** |

### **TABELA USER_GAMIFICATION - Schema vs Código**

| Campo | Schema Supabase | Código SetupProfile | Status |
|-------|----------------|-------------------|--------|
| `id` | UUID PRIMARY KEY | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `user_id` | UUID REFERENCES users(id) | ✅ Obrigatório | ✅ OK |
| `level` | gamification_level DEFAULT 'cindy' | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `box_tokens` | INTEGER DEFAULT 0 | ✅ Obrigatório | ✅ OK |
| `total_earned` | INTEGER DEFAULT 0 | ✅ Obrigatório | ✅ OK |
| `achievements` | TEXT[] DEFAULT '{}' | ✅ Obrigatório | ✅ OK |
| `badges` | TEXT[] DEFAULT '{}' | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `last_action` | TIMESTAMP WITH TIME ZONE | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `created_at` | TIMESTAMP WITH TIME ZONE | ❌ **FALTANDO** | ❌ **PROBLEMA** |
| `updated_at` | TIMESTAMP WITH TIME ZONE | ❌ **FALTANDO** | ❌ **PROBLEMA** |

## 🚨 PROBLEMAS IDENTIFICADOS

### **1. INCONSISTÊNCIA DE TIPOS**
- **Schema**: `role` é do tipo `user_role` (ENUM)
- **Código**: `role` é tratado como `string`
- **Impacto**: Pode causar erros de validação

### **2. CAMPOS FALTANDO NO CÓDIGO**
- `whatsapp` - Campo existe no formulário mas não é salvo
- `mensagem` - Campo existe no formulário mas não é salvo
- `is_active` - Campo importante para controle de usuários
- `test_user` - Campo importante para separar usuários de teste
- `team_id` - Campo para associação com times
- `avatar_url` - Campo específico para avatar (diferente de photo_url)

### **3. CAMPOS FALTANDO NA GAMIFICAÇÃO**
- `level` - Nível de gamificação do usuário
- `badges` - Badges conquistados
- `last_action` - Deveria ser TIMESTAMP, não string

## 🔧 CORREÇÕES NECESSÁRIAS

### **1. Atualizar Interface UserInsertData**
```typescript
interface UserInsertData {
  id?: string;
  clerk_id: string;
  email: string;
  display_name?: string | null;
  photo_url?: string | null;
  role: user_role; // Mudar de string para user_role
  whatsapp?: string | null; // ADICIONAR
  box?: string | null;
  cidade?: string | null;
  mensagem?: string | null; // ADICIONAR
  profile_complete?: boolean;
  is_active?: boolean; // ADICIONAR
  test_user?: boolean; // ADICIONAR
  team_id?: string | null; // ADICIONAR
  avatar_url?: string | null; // ADICIONAR
}
```

### **2. Atualizar Interface UserGamificationData**
```typescript
interface UserGamificationData {
  user_id: string;
  level?: gamification_level; // ADICIONAR
  box_tokens?: number;
  total_earned?: number;
  achievements?: string[];
  badges?: string[]; // ADICIONAR
  last_action?: string | null; // Manter como string por enquanto
}
```

### **3. Atualizar Código de Salvamento**
- Incluir campos `whatsapp` e `mensagem` do formulário
- Adicionar campos padrão como `is_active: true`, `test_user: false`
- Corrigir tipo do `role` para usar o ENUM

## 📋 PRÓXIMOS PASSOS

1. ✅ **Identificar inconsistências** - FEITO
2. 🔄 **Atualizar interfaces TypeScript**
3. 🔄 **Atualizar código de salvamento**
4. 🔄 **Testar integração**
5. 🔄 **Verificar se schema precisa de ajustes**
