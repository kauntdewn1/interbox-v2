import { useMemo } from 'react';

// Sistema de níveis baseado em $BØX (badges conquistados)
export const LEVEL_SYSTEM = [
  { 
    id: 'cindy', 
    name: 'Cindy', 
    image: '/images/levels/cindy.webp', 
    minTokens: 0, 
    maxTokens: 99, 
    level: 'Cindy',
    description: 'Todo mundo começa de algum lugar. Cindy é a centelha — a confirmação de que você entrou no jogo.'
  },
  { 
    id: 'helen', 
    name: 'Helen', 
    image: '/images/levels/helen.webp', 
    minTokens: 100, 
    maxTokens: 299, 
    level: 'Helen',
    description: 'Você pegou ritmo. Helen representa o fôlego que sustenta quem vem para ficar.'
  },
  { 
    id: 'fran', 
    name: 'Fran', 
    image: '/images/levels/fran.webp', 
    minTokens: 300, 
    maxTokens: 599, 
    level: 'Fran',
    description: 'A intensidade aperta. Fran é para quem encara o caos e transforma dor em progresso.'
  },
  { 
    id: 'annie', 
    name: 'Annie', 
    image: '/images/levels/annie.webp', 
    minTokens: 600, 
    maxTokens: 999, 
    level: 'Annie',
    description: 'Nível técnico. Aqui, a força exige coordenação, foco e domínio. Você já não é mais iniciante.'
  },
  { 
    id: 'murph', 
    name: 'Murph', 
    image: '/images/levels/murph.webp', 
    minTokens: 1000, 
    maxTokens: 1999, 
    level: 'Murph',
    description: 'A prova definitiva. Murph é brutal, é longa, e poucos chegam até aqui. Mas você está resistindo.'
  },
  { 
    id: 'matt', 
    name: 'Matt', 
    image: '/images/levels/matt.webp', 
    minTokens: 2000, 
    maxTokens: Infinity, 
    level: 'Matt',
    description: 'O Escolhido. Um atleta que transcendeu o ranking e virou lenda viva do Cerrado Interbøx.'
  },
];

// Sistema de tokens por ação
export const TOKEN_ACTIONS = {
  cadastro: 10,
  completar_perfil: 25,
  login_diario: 5,
  compra_ingresso: 100,
  envio_conteudo: 75,
  participacao_enquete: 15,
  compartilhamento: 10,
  qr_scan_evento: 25,
  prova_extra: 50,
  acesso_spoiler: 20,
  checkin_evento: 30,
  indicacao_confirmada: 50,
  
  // ✅ Novas ações gamificadas
  assistiu_spoiler_video: 20,        // Conteúdo desbloqueável
  respondeu_quiz: 15,                // Quiz interativo
  completou_missao_diaria: 30,       // Check de objetivos diários
  convidou_amigo: 10,                // Convite via link/WhatsApp
  feedback_evento: 25,               // Pesquisa de opinião pré-evento
  rede_social_tag: 20,               // Post nas redes com marcação
  desafio_semana_concluido: 50,      // Missão semanal completa
  bonus_7dias_ativos: 40,            // Atividade por 7 dias seguidos
  bonus_14dias_ativos: 100,          // Atividade por 14 dias seguidos
  chegou_nivel_fran: 25,             // Atingiu o nível Fran
  compra_avatar_premium: 50         // Cashback promocional na loja
};

export interface LevelInfo {
  id: string;
  name: string;
  image: string;
  minTokens: number;
  maxTokens: number;
  level: string;
  description: string;
}

export function useLevelSystem(boxTokens: number) {
  const currentLevel = useMemo((): LevelInfo => {
    const level = LEVEL_SYSTEM.find(
      l => boxTokens >= l.minTokens && boxTokens <= l.maxTokens
    );
    return level || LEVEL_SYSTEM[0]; // Fallback para Cindy
  }, [boxTokens]);

  const nextLevel = useMemo((): LevelInfo | null => {
    const currentIndex = LEVEL_SYSTEM.findIndex(l => l.id === currentLevel.id);
    return currentIndex < LEVEL_SYSTEM.length - 1 
      ? LEVEL_SYSTEM[currentIndex + 1] 
      : null;
  }, [currentLevel]);

  const progressToNext = useMemo((): number => {
    if (!nextLevel) return 100; // Já no nível máximo
    
    const currentRange = currentLevel.maxTokens - currentLevel.minTokens;
    const progress = ((boxTokens - currentLevel.minTokens) / currentRange) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [boxTokens, currentLevel, nextLevel]);

  const tokensToNext = useMemo((): number => {
    if (!nextLevel) return 0;
    return nextLevel.minTokens - boxTokens;
  }, [boxTokens, nextLevel]);

  return {
    currentLevel,
    nextLevel,
    progressToNext,
    tokensToNext,
    allLevels: LEVEL_SYSTEM,
  };
}

export default useLevelSystem;
