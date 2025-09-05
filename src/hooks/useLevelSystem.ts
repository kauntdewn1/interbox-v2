import { useMemo } from 'react';

// Sistema de níveis baseado em $BØX (badges conquistados)
export const LEVEL_SYSTEM = [
  { id: 'cindy', name: 'Cindy', image: '/images/levels/cindy.webp', minTokens: 0, maxTokens: 99, level: 'Base' },
  { id: 'beginner', name: 'Iniciante', image: '/images/levels/cindy.webp', minTokens: 100, maxTokens: 499, level: 'Iniciante' },
  { id: 'intermediate', name: 'Intermediário', image: '/images/levels/helen.webp', minTokens: 500, maxTokens: 999, level: 'Intermediário' },
  { id: 'advanced', name: 'Avançado', image: '/images/levels/fran.webp', minTokens: 1000, maxTokens: 1999, level: 'Avançado' },
  { id: 'expert', name: 'Especialista', image: '/images/levels/annie.webp', minTokens: 2000, maxTokens: 4999, level: 'Especialista' },
  { id: 'master', name: 'Mestre', image: '/images/levels/murph.webp', minTokens: 5000, maxTokens: 9999, level: 'Mestre' },
  { id: 'legendary', name: 'Lendário', image: '/images/levels/matt.webp', minTokens: 10000, maxTokens: Infinity, level: 'Lendário' },
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
};

export interface LevelInfo {
  id: string;
  name: string;
  image: string;
  minTokens: number;
  maxTokens: number;
  level: string;
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
