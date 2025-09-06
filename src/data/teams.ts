// ============================================================================
// LISTA DE TIMES - INTERBØX 2025
// ============================================================================

export interface TeamData {
  id: string;
  name: string;
  description: string;
  category: 'masculino' | 'feminino' | 'misto';
  maxMembers: number;
  currentMembers: number;
  captain?: string;
  isOpen: boolean;
  color: string;
  icon: string;
}

export const TEAMS_LIST: TeamData[] = [
  // Times Masculinos
  {
    id: 'team-001',
    name: 'CrossFit Cerrado',
    description: 'Time oficial do CrossFit Cerrado - força e resistência',
    category: 'masculino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#3B82F6',
    icon: '💪'
  },
  {
    id: 'team-002',
    name: 'Box Warriors',
    description: 'Guerreiros da caixa - disciplina e foco',
    category: 'masculino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#EF4444',
    icon: '⚔️'
  },
  {
    id: 'team-003',
    name: 'Iron Brothers',
    description: 'Irmãos de ferro - união e força',
    category: 'masculino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#8B5CF6',
    icon: '🔩'
  },
  {
    id: 'team-004',
    name: 'Alpha Squad',
    description: 'Esquadrão alfa - liderança e excelência',
    category: 'masculino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#F59E0B',
    icon: '👑'
  },

  // Times Femininos
  {
    id: 'team-005',
    name: 'CrossFit Queens',
    description: 'Rainhas do CrossFit - poder e graça',
    category: 'feminino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#EC4899',
    icon: '👑'
  },
  {
    id: 'team-006',
    name: 'Box Divas',
    description: 'Divas da caixa - estilo e força',
    category: 'feminino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#8B5CF6',
    icon: '💄'
  },
  {
    id: 'team-007',
    name: 'Iron Sisters',
    description: 'Irmãs de ferro - união e determinação',
    category: 'feminino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#10B981',
    icon: '🌺'
  },
  {
    id: 'team-008',
    name: 'Power Girls',
    description: 'Garotas do poder - energia e força',
    category: 'feminino',
    maxMembers: 6,
    currentMembers: 0,
    isOpen: true,
    color: '#F97316',
    icon: '⚡'
  },

  // Times Mistos
  {
    id: 'team-009',
    name: 'Unified Force',
    description: 'Força unificada - diversidade e união',
    category: 'misto',
    maxMembers: 8,
    currentMembers: 0,
    isOpen: true,
    color: '#06B6D4',
    icon: '🤝'
  },
  {
    id: 'team-010',
    name: 'Box United',
    description: 'Caixa unida - todos juntos pela vitória',
    category: 'misto',
    maxMembers: 8,
    currentMembers: 0,
    isOpen: true,
    color: '#84CC16',
    icon: '🌍'
  },
  {
    id: 'team-011',
    name: 'Elite Squad',
    description: 'Esquadrão de elite - excelência em equipe',
    category: 'misto',
    maxMembers: 8,
    currentMembers: 0,
    isOpen: true,
    color: '#6366F1',
    icon: '⭐'
  },
  {
    id: 'team-012',
    name: 'Champions United',
    description: 'Campeões unidos - vitória em equipe',
    category: 'misto',
    maxMembers: 8,
    currentMembers: 0,
    isOpen: true,
    color: '#F59E0B',
    icon: '🏆'
  }
];

// Funções auxiliares
export const getTeamsByCategory = (category: 'masculino' | 'feminino' | 'misto'): TeamData[] => {
  return TEAMS_LIST.filter(team => team.category === category);
};

export const getOpenTeams = (): TeamData[] => {
  return TEAMS_LIST.filter(team => team.isOpen);
};

export const getTeamById = (id: string): TeamData | undefined => {
  return TEAMS_LIST.find(team => team.id === id);
};

export const getTeamsByAvailability = (): TeamData[] => {
  return TEAMS_LIST.filter(team => team.currentMembers < team.maxMembers);
};
