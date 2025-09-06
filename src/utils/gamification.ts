import { GamificationLevel, GAMIFICATION_LEVEL_METADATA } from '../types';

// ============================================================================
// UTILITÁRIOS DE GAMIFICAÇÃO - ADAPTADOS PARA SUPABASE
// ============================================================================

/**
 * Calcula o nível de gamificação baseado no saldo de tokens $BOX
 * @param tokens - Saldo atual de tokens
 * @returns Nível de gamificação
 */
export function calculateGamificationLevel(tokens: number): GamificationLevel {
  if (tokens >= 2000) return 'matt';
  if (tokens >= 1000) return 'murph';
  if (tokens >= 600) return 'annie';
  if (tokens >= 300) return 'fran';
  if (tokens >= 100) return 'helen';
  return 'cindy';
}

/**
 * Calcula o progresso para o próximo nível
 * @param tokens - Saldo atual de tokens
 * @returns Objeto com informações de progresso
 */
export function calculateLevelProgress(tokens: number) {
  const currentLevel = calculateGamificationLevel(tokens);
  const metadata = GAMIFICATION_LEVEL_METADATA[currentLevel];
  
  let nextLevelTokens = 0;
  let progress = 0;
  let isMaxLevel = false;

  switch (currentLevel) {
    case 'cindy':
      nextLevelTokens = 100;
      progress = (tokens / 100) * 100;
      break;
    case 'helen':
      nextLevelTokens = 300;
      progress = ((tokens - 100) / 200) * 100;
      break;
    case 'fran':
      nextLevelTokens = 600;
      progress = ((tokens - 300) / 300) * 100;
      break;
    case 'annie':
      nextLevelTokens = 1000;
      progress = ((tokens - 600) / 400) * 100;
      break;
    case 'murph':
      nextLevelTokens = 2000;
      progress = ((tokens - 1000) / 1000) * 100;
      break;
    case 'matt':
      nextLevelTokens = Infinity;
      progress = 100;
      isMaxLevel = true;
      break;
  }

  return {
    currentLevel,
    metadata,
    nextLevelTokens,
    progress: Math.min(progress, 100),
    isMaxLevel,
    tokensToNextLevel: Math.max(0, nextLevelTokens - tokens)
  };
}

/**
 * Calcula tokens ganhos por ação
 * @param action - Tipo de ação realizada
 * @returns Quantidade de tokens ganhos
 */
export function getTokensForAction(action: string): number {
  // Usar configuração centralizada
  const { getTokensForAction: getTokens } = require('../config/gamification');
  return getTokens(action as any) || 0;
}

/**
 * Verifica se uma ação pode ser executada (rate limiting)
 * @param lastActionTime - Timestamp da última execução
 * @param action - Tipo de ação
 * @returns Se a ação pode ser executada
 */
export function canExecuteAction(lastActionTime: string | null, action: string): boolean {
  // Usar configuração centralizada
  const { canExecuteAction: canExecute } = require('../config/gamification');
  return canExecute(lastActionTime, action as any);
}

/**
 * Gera ID único para ações de gamificação
 * @param userId - ID do usuário
 * @param action - Tipo de ação
 * @param date - Data da ação
 * @returns ID único da ação
 */
export function generateActionId(userId: string, action: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${userId}:${action}:${dateStr}`;
}

/**
 * Calcula bônus por streak de login
 * @param streakDays - Dias consecutivos de login
 * @returns Bônus de tokens
 */
export function calculateLoginStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 50; // 30+ dias: +50 tokens
  if (streakDays >= 14) return 25; // 14+ dias: +25 tokens
  if (streakDays >= 7) return 15;  // 7+ dias: +15 tokens
  if (streakDays >= 3) return 5;   // 3+ dias: +5 tokens
  return 0;
}

/**
 * Valida se um usuário pode receber tokens
 * @param user - Dados do usuário
 * @returns Se pode receber tokens
 */
export function canReceiveTokens(user: { is_active: boolean; profile_complete: boolean }): boolean {
  return user.is_active && user.profile_complete;
}

/**
 * Calcula multiplicador de tokens por eventos especiais
 * @param eventType - Tipo de evento
 * @param userLevel - Nível do usuário
 * @returns Multiplicador de tokens
 */
export function calculateEventMultiplier(eventType: string, userLevel: GamificationLevel): number {
  const baseMultipliers: Record<string, number> = {
    'evento_principal': 2.0,
    'workshop': 1.5,
    'competicao': 1.8,
    'treino': 1.2,
    'social': 1.0
  };

  const levelMultipliers: Record<GamificationLevel, number> = {
    'cindy': 1.0,
    'helen': 1.1,
    'fran': 1.2,
    'annie': 1.3,
    'murph': 1.4,
    'matt': 1.5
  };

  const baseMultiplier = baseMultipliers[eventType] || 1.0;
  const levelMultiplier = levelMultipliers[userLevel] || 1.0;

  return baseMultiplier * levelMultiplier;
}

/**
 * Formata saldo de tokens para exibição
 * @param tokens - Quantidade de tokens
 * @returns String formatada
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K $BOX`;
  }
  return `${tokens} $BOX`;
}

/**
 * Verifica se um usuário pode subir de nível
 * @param currentTokens - Tokens atuais
 * @param newTokens - Novos tokens a serem adicionados
 * @returns Se pode subir de nível
 */
export function canLevelUp(currentTokens: number, newTokens: number): boolean {
  const currentLevel = calculateGamificationLevel(currentTokens);
  const newTotal = currentTokens + newTokens;
  const newLevel = calculateGamificationLevel(newTotal);
  
  return newLevel !== currentLevel;
}

/**
 * Retorna mensagem de conquista para novo nível
 * @param newLevel - Novo nível alcançado
 * @returns Mensagem de conquista
 */
export function getLevelUpMessage(newLevel: GamificationLevel): string {
  const messages: Record<GamificationLevel, string> = {
    'cindy': '🎉 Parabéns! Você deu o primeiro passo na Arena dos Consagrados!',
    'helen': '🔥 Incrível! Você está pegando fôlego e mostrando consistência!',
    'fran': '⚡ Uau! Você sobreviveu ao inferno curto! Agora é sério!',
    'annie': '💪 Fantástico! Sua coordenação está afiada como nunca!',
    'murph': '🏆 Épico! Você completou a prova final! Você é um guerreiro!',
    'matt': '👑 LENDÁRIO! Você é O ESCOLHIDO! Bem-vindo ao Hall da Fama!'
  };

  return messages[newLevel] || '🎯 Novo nível desbloqueado!';
}
