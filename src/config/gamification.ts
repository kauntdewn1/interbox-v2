// ============================================================================
// CONFIGURAÇÃO CENTRALIZADA DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================
// Este arquivo centraliza todas as configurações de gamificação para evitar
// inconsistências entre diferentes partes do sistema.
// ============================================================================

export type GamificationAction =
  | 'cadastro'           // +10 $BOX
  | 'indicacao_confirmada' // +50 $BOX
  | 'compra_ingresso'    // +100 $BOX
  | 'envio_conteudo'     // +75 $BOX
  | 'qr_scan_evento'     // +25 $BOX (variável)
  | 'prova_extra'        // +50 $BOX (variável)
  | 'participacao_enquete' // +15 $BOX
  | 'acesso_spoiler'     // +20 $BOX
  | 'checkin_evento'     // +30 $BOX
  | 'compartilhamento'   // +10 $BOX
  | 'login_diario'       // +5 $BOX
  | 'completar_perfil'   // +25 $BOX
  | 'assistiu_spoiler_video' // +20 $BOX
  | 'respondeu_quiz'     // +15 $BOX
  | 'completou_missao_diaria' // +30 $BOX
  | 'convidou_amigo'     // +10 $BOX
  | 'feedback_evento'    // +25 $BOX
  | 'rede_social_tag'    // +20 $BOX
  | 'desafio_semana_concluido' // +50 $BOX
  | 'bonus_7dias_ativos' // +40 $BOX
  | 'bonus_14dias_ativos' // +100 $BOX
  | 'chegou_nivel_fran'  // +25 $BOX
  | 'compra_avatar_premium'; // +50 $BOX

export type GamificationLevel =
  | 'cindy'        // 0-99 $BOX - A Base
  | 'helen'        // 100-299 $BOX - Avançado
  | 'fran'         // 300-599 $BOX - Intermediário
  | 'annie'        // 600-999 $BOX - Iniciante
  | 'murph'        // 1000-1999 $BOX - Expert
  | 'matt';        // 2000+ $BOX - Master

export interface LevelConfig {
  name: string;
  description: string;
  minTokens: number;
  maxTokens: number;
  color: string;
  icon: string;
  benefits: readonly string[];
}

export interface RateLimitConfig {
  action: GamificationAction;
  cooldownMs: number;
  description: string;
}

// ============================================================================
// CONFIGURAÇÃO CENTRALIZADA
// ============================================================================

export const GAMIFICATION_CONFIG = {
  // Tokens por ação
  TOKENS: {
    cadastro: 10,
    indicacao_confirmada: 50,
    compra_ingresso: 100,
    envio_conteudo: 75,
    qr_scan_evento: 25,
    prova_extra: 50,
    participacao_enquete: 15,
    acesso_spoiler: 20,
    checkin_evento: 30,
    compartilhamento: 10,
    login_diario: 5,
    completar_perfil: 25,
    assistiu_spoiler_video: 20,
    respondeu_quiz: 15,
    completou_missao_diaria: 30,
    convidou_amigo: 10,
    feedback_evento: 25,
    rede_social_tag: 20,
    desafio_semana_concluido: 50,
    bonus_7dias_ativos: 40,
    bonus_14dias_ativos: 100,
    chegou_nivel_fran: 25,
    compra_avatar_premium: 50
  } as const,

  // Configuração de níveis
  LEVELS: {
    cindy: {
      name: 'Cindy',
      description: 'A Base',
      minTokens: 0,
      maxTokens: 99,
      color: '#10B981',
      icon: '🌱',
      benefits: [
        'Acesso básico à plataforma',
        'Participação em eventos',
        'Sistema de conquistas'
      ]
    },
    helen: {
      name: 'Helen',
      description: 'Avançado',
      minTokens: 100,
      maxTokens: 299,
      color: '#3B82F6',
      icon: '💪',
      benefits: [
        'Acesso a conteúdo exclusivo',
        'Descontos em eventos',
        'Badges especiais'
      ]
    },
    fran: {
      name: 'Fran',
      description: 'Intermediário',
      minTokens: 300,
      maxTokens: 599,
      color: '#8B5CF6',
      icon: '🔥',
      benefits: [
        'Acesso a spoilers',
        'Participação em grupos VIP',
        'Recompensas especiais'
      ]
    },
    annie: {
      name: 'Annie',
      description: 'Iniciante',
      minTokens: 600,
      maxTokens: 999,
      color: '#F59E0B',
      icon: '⭐',
      benefits: [
        'Acesso a treinos exclusivos',
        'Mentoria personalizada',
        'Kit de boas-vindas'
      ]
    },
    murph: {
      name: 'Murph',
      description: 'Expert',
      minTokens: 1000,
      maxTokens: 1999,
      color: '#EF4444',
      icon: '🏆',
      benefits: [
        'Acesso a eventos privados',
        'Descontos premium',
        'Reconhecimento especial'
      ]
    },
    matt: {
      name: 'Matt',
      description: 'Master',
      minTokens: 2000,
      maxTokens: Infinity,
      color: '#EC4899',
      icon: '👑',
      benefits: [
        'Acesso total à plataforma',
        'Privilégios de admin',
        'Recompensas exclusivas'
      ]
    }
  } as const,

  // Rate limiting por ação
  RATE_LIMITS: [
    {
      action: 'login_diario' as GamificationAction,
      cooldownMs: 24 * 60 * 60 * 1000, // 24 horas
      description: 'Login diário - uma vez por dia'
    },
    {
      action: 'checkin_evento' as GamificationAction,
      cooldownMs: 60 * 60 * 1000, // 1 hora
      description: 'Check-in em evento - uma vez por hora'
    },
    {
      action: 'compartilhamento' as GamificationAction,
      cooldownMs: 30 * 60 * 1000, // 30 minutos
      description: 'Compartilhamento - a cada 30 minutos'
    },
    {
      action: 'qr_scan_evento' as GamificationAction,
      cooldownMs: 5 * 60 * 1000, // 5 minutos
      description: 'QR Scan - a cada 5 minutos'
    },
    {
      action: 'participacao_enquete' as GamificationAction,
      cooldownMs: 60 * 60 * 1000, // 1 hora
      description: 'Participação em enquete - uma vez por hora'
    },
    {
      action: 'acesso_spoiler' as GamificationAction,
      cooldownMs: 12 * 60 * 60 * 1000, // 12 horas
      description: 'Acesso a spoiler - duas vezes por dia'
    }
  ] as const,

  // Configurações de segurança
  SECURITY: {
    MAX_TOKENS_PER_ACTION: 10000,
    MIN_TOKENS_PER_ACTION: 1,
    MAX_DAILY_TOKENS: 500,
    MAX_WEEKLY_TOKENS: 2000,
    MAX_MONTHLY_TOKENS: 5000
  } as const,

  // Configurações de sistema
  SYSTEM: {
    DEFAULT_LEVEL: 'cindy' as GamificationLevel,
    INITIAL_TOKENS: 10,
    REFERRAL_BONUS: 25,
    ACHIEVEMENT_BONUS: 50,
    LEVEL_UP_BONUS: 25
  } as const
} as const;

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Obtém a quantidade de tokens para uma ação
 */
export function getTokensForAction(action: GamificationAction): number {
  return GAMIFICATION_CONFIG.TOKENS[action] || 0;
}

/**
 * Obtém a configuração de um nível
 */
export function getLevelConfig(level: GamificationLevel): LevelConfig {
  return GAMIFICATION_CONFIG.LEVELS[level];
}

/**
 * Calcula o nível baseado na quantidade de tokens
 */
export function calculateLevel(tokens: number): GamificationLevel {
  if (tokens >= GAMIFICATION_CONFIG.LEVELS.matt.minTokens) return 'matt';
  if (tokens >= GAMIFICATION_CONFIG.LEVELS.murph.minTokens) return 'murph';
  if (tokens >= GAMIFICATION_CONFIG.LEVELS.annie.minTokens) return 'annie';
  if (tokens >= GAMIFICATION_CONFIG.LEVELS.fran.minTokens) return 'fran';
  if (tokens >= GAMIFICATION_CONFIG.LEVELS.helen.minTokens) return 'helen';
  return 'cindy';
}

/**
 * Calcula o progresso para o próximo nível
 */
export function calculateLevelProgress(tokens: number) {
  const currentLevel = calculateLevel(tokens);
  const currentLevelConfig = getLevelConfig(currentLevel);
  
  // Se é o nível máximo, não há progresso
  if (currentLevel === 'matt') {
    return {
      currentLevel,
      currentLevelConfig,
      nextLevel: null,
      nextLevelConfig: null,
      progress: 100,
      tokensToNextLevel: 0
    };
  }

  // Encontrar próximo nível
  const levels: GamificationLevel[] = ['cindy', 'helen', 'fran', 'annie', 'murph', 'matt'];
  const currentIndex = levels.indexOf(currentLevel);
  const nextLevel = levels[currentIndex + 1] as GamificationLevel;
  const nextLevelConfig = getLevelConfig(nextLevel);

  const progress = Math.min(
    100,
    ((tokens - currentLevelConfig.minTokens) / 
     (nextLevelConfig.minTokens - currentLevelConfig.minTokens)) * 100
  );

  return {
    currentLevel,
    currentLevelConfig,
    nextLevel,
    nextLevelConfig,
    progress: Math.max(0, progress),
    tokensToNextLevel: Math.max(0, nextLevelConfig.minTokens - tokens)
  };
}

/**
 * Verifica se uma ação pode ser executada (rate limiting)
 */
export function canExecuteAction(lastActionTime: string | null, action: GamificationAction): boolean {
  if (!lastActionTime) return true;

  const rateLimit = GAMIFICATION_CONFIG.RATE_LIMITS.find(rl => rl.action === action);
  if (!rateLimit) return true; // Ações sem rate limit

  const now = new Date();
  const lastAction = new Date(lastActionTime);
  const timeDiff = now.getTime() - lastAction.getTime();

  return timeDiff >= rateLimit.cooldownMs;
}

/**
 * Valida se uma quantidade de tokens é válida
 */
export function validateTokenAmount(amount: number): boolean {
  return amount >= GAMIFICATION_CONFIG.SECURITY.MIN_TOKENS_PER_ACTION &&
         amount <= GAMIFICATION_CONFIG.SECURITY.MAX_TOKENS_PER_ACTION;
}

/**
 * Valida se uma ação é válida
 */
export function validateAction(action: string): action is GamificationAction {
  return action in GAMIFICATION_CONFIG.TOKENS;
}

/**
 * Obtém todas as ações disponíveis
 */
export function getAllActions(): GamificationAction[] {
  return Object.keys(GAMIFICATION_CONFIG.TOKENS) as GamificationAction[];
}

/**
 * Obtém todas as configurações de níveis
 */
export function getAllLevels(): LevelConfig[] {
  return Object.values(GAMIFICATION_CONFIG.LEVELS);
}

/**
 * Obtém configurações de rate limiting para uma ação
 */
export function getRateLimitConfig(action: GamificationAction): RateLimitConfig | null {
  return GAMIFICATION_CONFIG.RATE_LIMITS.find(rl => rl.action === action) || null;
}
