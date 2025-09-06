# 🔄 Migração para Configuração Centralizada de Gamificação

## 📋 Resumo

Este documento descreve a migração para a configuração centralizada de gamificação em `src/config/gamification.ts`.

## ✅ Arquivos Atualizados

### 1. **src/config/gamification.ts** (NOVO)

- ✅ Configuração centralizada de todos os tokens
- ✅ Configuração de níveis com metadados completos
- ✅ Rate limiting centralizado
- ✅ Validações de segurança
- ✅ Funções utilitárias

### 2. **src/hooks/useLevelSystem.ts**

- ✅ Atualizado para usar `GAMIFICATION_CONFIG.TOKENS`
- ✅ Mantém compatibilidade com código existente
- ✅ Adicionado aviso de depreciação

### 3. **src/types/gamification.ts**

- ✅ Atualizado para usar `GAMIFICATION_CONFIG.TOKENS`
- ✅ Mantém compatibilidade com código existente
- ✅ Adicionado aviso de depreciação

### 4. **src/utils/gamification.ts**

- ✅ Atualizado para usar funções centralizadas
- ✅ Mantém compatibilidade com código existente

### 5. **src/hooks/useClerkSupabase.ts**

- ✅ Atualizado `getLevelInfo` para usar configuração centralizada

### 6. **src/components/LevelDisplay.tsx**

- ✅ Adicionado import da configuração centralizada

## 🚀 Próximos Passos

### Fase 1: Migração Completa (Recomendado)

1. **Atualizar todos os componentes** para usar `src/config/gamification.ts`
2. **Remover arquivos duplicados** após migração completa
3. **Atualizar testes** para usar nova configuração

### Fase 2: Otimizações
1. **Implementar cache** para configurações
2. **Adicionar validações** em tempo de execução
3. **Criar sistema de eventos** para mudanças de nível

## 📊 Benefícios da Migração

- ✅ **Consistência**: Uma única fonte de verdade para tokens
- ✅ **Manutenibilidade**: Mudanças em um local só
- ✅ **Segurança**: Validações centralizadas
- ✅ **Performance**: Funções otimizadas
- ✅ **Tipagem**: TypeScript completo

## ⚠️ Avisos Importantes

1. **Compatibilidade**: Código existente continua funcionando
2. **Depreciação**: Arquivos antigos marcados como deprecated
3. **Migração**: Recomendado migrar gradualmente
4. **Testes**: Verificar se todos os testes passam

## 🔧 Como Usar a Nova Configuração

```typescript
import { 
  GAMIFICATION_CONFIG, 
  getTokensForAction, 
  calculateLevel,
  validateTokenAmount 
} from '../config/gamification';

// Obter tokens para uma ação
const tokens = getTokensForAction('cadastro'); // 10

// Calcular nível
const level = calculateLevel(150); // 'helen'

// Validar quantidade
const isValid = validateTokenAmount(50); // true

// Obter configuração de nível
const levelConfig = getLevelConfig('helen');
```

## 📝 Checklist de Migração

- [x] Criar arquivo de configuração centralizada
- [x] Atualizar hooks existentes
- [x] Atualizar utilitários
- [x] Atualizar componentes
- [ ] Migrar todos os componentes restantes
- [ ] Remover arquivos deprecated
- [ ] Atualizar testes
- [ ] Documentar mudanças
