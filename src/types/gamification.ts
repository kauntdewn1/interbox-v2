// ============================================================================
// TIPOS DE GAMIFICAÇÃO - INTERBØX V2
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
  | 'completar_perfil'   // +25 $BOX;

export type GamificationLevel =
  | 'cindy'        // 0-99 $BOX - A Base
  | 'helen'        // 100-299 $BOX - O Fôlego
  | 'fran'         // 300-599 $BOX - O Inferno Curto
  | 'annie'        // 600-999 $BOX - A Coordenação
  | 'murph'        // 1000-1999 $BOX - A Prova Final
  | 'matt';        // 2000+ $BOX - O Escolhido

export interface GamificationLevelMetadata {
  name: string;
  icon: string;
  color: string;
  texture: string;
  description: string;
  achievement: string;
}

export const GAMIFICATION_LEVEL_METADATA: Record<GamificationLevel, GamificationLevelMetadata> = {
  cindy: {
    name: 'Cindy',
    icon: '/images/levels/cindy.webp',
    color: '#9CA3AF',
    texture: 'Leve névoa, base de concreto',
    description: 'Pegada/Passo inicial - A Base',
    achievement: 'primeiro_cadastro'
  },
  helen: {
    name: 'Helen',
    icon: '/images/levels/helen.webp',
    color: '#3B82F6',
    texture: 'Traços de movimento ao redor',
    description: 'Vento/Cardio - O Fôlego',
    achievement: 'helen_conquistada'
  },
  fran: {
    name: 'Fran',
    icon: '/images/levels/fran.webp',
    color: '#EF4444',
    texture: 'Chamas intensas',
    description: 'Inferno Curto - A Intensidade',
    achievement: 'fran_conquistada'
  },
  annie: {
    name: 'Annie',
    icon: '/images/levels/annie.webp',
    color: '#8B5CF6',
    texture: 'Energia elétrica',
    description: 'Coordenação - A Precisão',
    achievement: 'annie_conquistada'
  },
  murph: {
    name: 'Murph',
    icon: '/images/levels/murph.webp',
    color: '#F59E0B',
    texture: 'Metal brilhante',
    description: 'Prova Final - A Resistência',
    achievement: 'murph_conquistada'
  },
  matt: {
    name: 'Matt',
    icon: '/images/levels/matt.webp',
    color: '#10B981',
    texture: 'Cristal translúcido',
    description: 'O Escolhido - A Maestria',
    achievement: 'matt_conquistada'
  }
};

// ============================================================================
// FUNÇÕES DE GAMIFICAÇÃO
// ============================================================================

// 🏋️‍♂️ Cálculo de nível baseado nos WODs ICÔNICOS
export const calculateGamificationLevel = (tokens: number): GamificationLevel => {
  if (tokens >= 2000) return 'matt';        // O Escolhido
  if (tokens >= 1000) return 'murph';       // A Prova Final
  if (tokens >= 600) return 'annie';        // A Coordenação
  if (tokens >= 300) return 'fran';         // O Inferno Curto
  if (tokens >= 100) return 'helen';        // O Fôlego
  return 'cindy';                            // A Base
};

// Tokens por ação
export const GAMIFICATION_TOKENS: Record<GamificationAction, number> = {
  cadastro: 10,              // +10 $BOX - Começa a jornada
  indicacao_confirmada: 50,  // +50 $BOX - Constrói comunidade
  compra_ingresso: 100,      // +100 $BOX - Compromisso com o evento
  envio_conteudo: 75,        // +75 $BOX - Contribui para o box
  qr_scan_evento: 25,        // +25 $BOX - Presença confirmada
  prova_extra: 50,           // +50 $BOX - Desafio aceito
  participacao_enquete: 15,  // +15 $BOX - Engajamento ativo
  acesso_spoiler: 20,        // +20 $BOX - Conhecimento exclusivo
  checkin_evento: 30,        // +30 $BOX - Chegou para treinar
  compartilhamento: 10,      // +10 $BOX - Espalha a cultura
  login_diario: 5,           // +5 $BOX - Consistência diária
  completar_perfil: 25,      // +25 $BOX - Perfil completo
};

// Funções utilitárias
export const calculateTokensForAction = (action: GamificationAction, metadata?: Record<string, unknown>): number => {
  const baseTokens = GAMIFICATION_TOKENS[action];
  
  if (metadata?.multiplier) {
    return Math.floor(baseTokens * (metadata.multiplier as number));
  }
  
  return baseTokens;
};

export const generateReferralCode = (userId: string): string => {
  const prefix = 'REF';
  const suffix = userId.substring(0, 8).toUpperCase();
  return `${prefix}${suffix}`;
};

// ============================================================================
// CONSTANTES ADICIONAIS
// ============================================================================

export const GAMIFICATION_LEVEL_LABELS: Record<GamificationLevel, string> = {
  cindy: 'Cindy - A Base',
  helen: 'Helen - O Fôlego',
  fran: 'Fran - O Inferno Curto',
  annie: 'Annie - A Coordenação',
  murph: 'Murph - A Prova Final',
  matt: 'Matt - O Escolhido',
};

export const GAMIFICATION_LEVEL_COLORS: Record<GamificationLevel, string> = {
  cindy: '#9CA3AF',      // Cinza claro fosco
  helen: '#3B82F6',      // Azul dinâmico
  fran: '#DC2626',       // Vermelho intenso
  annie: '#8B5CF6',      // Roxo neon
  murph: '#1F2937',      // Preto fosco com dourado
  matt: '#F59E0B',       // Ouro queimado
};

export const GAMIFICATION_LEVEL_ICONS: Record<GamificationLevel, string> = {
  cindy: '👣',
  helen: '🌀',
  fran: '💣',
  annie: '⛓️',
  murph: '🛡️',
  matt: '👑',
};

export const GAMIFICATION_LEVEL_DESCRIPTIONS: Record<GamificationLevel, string> = {
  cindy: 'Pegada/Passo inicial - A Base',
  helen: 'Vento/Cardio - O Fôlego',
  fran: 'Mini explosão - O Inferno Curto',
  annie: 'Corda/Ritmo - A Coordenação',
  murph: 'Escudo com cicatriz - A Prova Final',
  matt: 'Coroa/Laurel minimal - O Escolhido',
};
