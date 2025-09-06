# 📚 Biblioteca de Gamificação - INTERBØX V2

## 🎯 Visão Geral

Esta biblioteca implementa um sistema completo de gamificação para o INTERBØX V2, incluindo:

- **Configuração Centralizada** (`gamification.ts`)
- **Sistema de Eventos** (`gamification-events.ts`)
- **Validações Robustas** (`gamification-validator.ts`)
- **Cache de Leaderboard** (`leaderboard-cache.ts`)

## 🚀 Como Usar

### 1. Configuração Centralizada

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
```

### 2. Sistema de Eventos

```typescript
import { 
  emitGamificationEvent, 
  validateGamificationEvent,
  getUserGamificationHistory 
} from '../lib/gamification-events';

// Emitir evento
const result = await emitGamificationEvent(
  'user_123',
  'cadastro',
  'Usuário se cadastrou',
  { source: 'web' }
);

// Validar evento
const validation = await validateGamificationEvent(
  'user_123',
  'cadastro',
  10,
  { source: 'web' }
);

// Obter histórico
const history = await getUserGamificationHistory('user_123', 50);
```

### 3. Validações Robustas

```typescript
import { 
  validateGamificationAction,
  checkActionSecurity,
  checkGamificationIntegrity 
} from '../lib/gamification-validator';

// Validar ação completa
const validation = await validateGamificationAction(
  'user_123',
  'cadastro',
  10,
  { source: 'web' }
);

// Verificar segurança
const security = await checkActionSecurity(
  'user_123',
  'cadastro',
  10
);

// Verificar integridade
const integrity = await checkGamificationIntegrity('user_123');
```

### 4. Cache de Leaderboard

```typescript
import { 
  getCachedLeaderboard,
  getCachedUserLeaderboard,
  getCachedLeaderboardStats 
} from '../lib/leaderboard-cache';

// Obter leaderboard
const leaderboard = await getCachedLeaderboard(50, 0);

// Obter leaderboard do usuário
const userLeaderboard = await getCachedUserLeaderboard('user_123', 10);

// Obter estatísticas
const stats = await getCachedLeaderboardStats();
```

## 🔧 Configuração

### Configuração de Cache

```typescript
import { leaderboardCache } from '../lib/leaderboard-cache';

// Atualizar configuração
leaderboardCache.updateConfig({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 2000, // 2000 entradas
  refreshThreshold: 0.7, // 70% do TTL
  enableCompression: true,
  enablePersistence: true
});
```

### Configuração de Validação

```typescript
import { gamificationValidator } from '../lib/gamification-validator';

// O validador usa configurações do GAMIFICATION_CONFIG
// Não requer configuração adicional
```

## 📊 Monitoramento

### Estatísticas de Cache

```typescript
import { getLeaderboardCacheStats } from '../lib/leaderboard-cache';

const stats = getLeaderboardCacheStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
console.log(`Hit rate: ${stats.hitRate}%`);
```

### Estatísticas de Eventos

```typescript
import { getGamificationStatistics } from '../lib/gamification-events';

const stats = await getGamificationStatistics('user_123');
console.log(`Total events: ${stats.totalEvents}`);
console.log(`Successful: ${stats.successfulEvents}`);
console.log(`Failed: ${stats.failedEvents}`);
```

## 🛡️ Segurança

### Validações Automáticas

O sistema inclui validações automáticas para:

- **Rate Limiting**: Previne spam de ações
- **Validação de Entrada**: Verifica tipos e formatos
- **Segurança**: Detecta padrões suspeitos
- **Integridade**: Verifica consistência dos dados

### Logs de Auditoria

Todos os eventos são logados para auditoria:

```typescript
// Eventos são automaticamente logados em analytics_events
// Incluem: ação, tokens, metadados, sucesso/erro, timestamp
```

## 🚨 Tratamento de Erros

### Validação de Eventos

```typescript
const result = await emitGamificationEvent('user_123', 'cadastro');

if (!result.success) {
  console.error('Erro ao emitir evento:', result.errors);
  // Tratar erro
}
```

### Validação de Segurança

```typescript
const security = await checkActionSecurity('user_123', 'cadastro', 10);

if (!security.secure) {
  console.warn('Ameaças detectadas:', security.threats);
  console.log('Recomendações:', security.recommendations);
}
```

## 🔄 Atualizações

### Refresh de Cache

```typescript
import { leaderboardCache } from '../lib/leaderboard-cache';

// Refresh manual
await leaderboardCache.refreshAll();

// Refresh automático baseado em TTL
// O cache se atualiza automaticamente quando necessário
```

### Limpeza de Cache

```typescript
import { clearLeaderboardCache } from '../lib/leaderboard-cache';

// Limpar cache
clearLeaderboardCache();
```

## 📈 Performance

### Otimizações Incluídas

- **Cache Inteligente**: TTL configurável e refresh automático
- **Compressão**: Reduz tamanho dos dados em memória
- **Persistência**: Mantém cache entre sessões
- **Rate Limiting**: Previne sobrecarga do sistema
- **Validação Assíncrona**: Não bloqueia operações principais

### Métricas de Performance

```typescript
const leaderboard = await getCachedLeaderboard();
console.log(`Processing time: ${leaderboard.metadata.processingTime}ms`);
console.log(`Source: ${leaderboard.metadata.source}`);
console.log(`Cache hit: ${leaderboard.metadata.cacheHit}`);
```

## 🧪 Testes

### Exemplos de Uso

Veja `src/examples/gamification-usage.ts` para exemplos completos de uso.

### Testes de Validação

```typescript
// Testar validação de tokens
const validation = validateTokenAmount(100);
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);

// Testar validação de ação
const actionValidation = validateAction('cadastro');
console.log('Valid:', actionValidation.valid);
```

## 🔧 Manutenção

### Limpeza Regular

```typescript
// Limpar cache periodicamente
setInterval(() => {
  clearLeaderboardCache();
}, 24 * 60 * 60 * 1000); // 24 horas
```

### Monitoramento de Erros

```typescript
// Monitorar erros de validação
const validation = await validateGamificationAction('user_123', 'cadastro', 10);
if (!validation.valid) {
  // Log para sistema de monitoramento
  console.error('Validation failed:', validation.errors);
}
```

## 📝 Notas Importantes

1. **Compatibilidade**: O sistema mantém compatibilidade com código existente
2. **Performance**: Cache reduz carga no banco de dados
3. **Segurança**: Validações robustas previnem abusos
4. **Auditoria**: Todos os eventos são logados
5. **Escalabilidade**: Sistema preparado para crescimento

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique os logs de erro
2. Consulte a documentação de cada módulo
3. Verifique as configurações de cache
4. Teste com dados de exemplo
