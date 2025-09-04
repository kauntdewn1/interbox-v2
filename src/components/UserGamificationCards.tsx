// ============================================================================
// USER GAMIFICATION CARDS - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerkSupabase, useIntegratedGamification } from '../hooks/useClerkSupabase';
import { useNotifications } from '../hooks/useSupabase';
import type { UserGamification, Transaction } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface GamificationCardProps {
  className?: string;
}

interface LevelInfo {
  name: string;
  description: string;
  minTokens: number;
  maxTokens: number;
  color: string;
  icon: string;
  benefits: string[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

const GAMIFICATION_LEVELS: Record<string, LevelInfo> = {
  'cindy': {
    name: 'Cindy',
    description: 'Base',
    minTokens: 0,
    maxTokens: 99,
    color: '#10B981',
    icon: '🏃‍♀️',
    benefits: ['Acesso básico', '10 $BOX iniciais']
  },
  'helen': {
    name: 'Helen',
    description: 'Avançado',
    minTokens: 100,
    maxTokens: 299,
    color: '#3B82F6',
    icon: '💪',
    benefits: ['Acesso premium', 'Descontos especiais', 'Conteúdo exclusivo']
  },
  'fran': {
    name: 'Fran',
    description: 'Intermediário',
    minTokens: 300,
    maxTokens: 599,
    color: '#8B5CF6',
    icon: '🔥',
    benefits: ['Acesso VIP', 'Early access', 'Badges exclusivos']
  },
  'annie': {
    name: 'Annie',
    description: 'Iniciante',
    minTokens: 600,
    maxTokens: 999,
    color: '#F59E0B',
    icon: '⭐',
    benefits: ['Acesso Elite', 'Mentoria', 'Networking premium']
  },
  'murph': {
    name: 'Murph',
    description: 'Expert',
    minTokens: 1000,
    maxTokens: 1999,
    color: '#EF4444',
    icon: '👑',
    benefits: ['Acesso Master', 'Coaching 1:1', 'Eventos privados']
  },
  'matt': {
    name: 'Matt',
    description: 'Master',
    minTokens: 2000,
    maxTokens: 9999,
    color: '#EC4899',
    icon: '🏆',
    benefits: ['Acesso Legend', 'Parcerias', 'Influência na comunidade']
  }
};

const ACHIEVEMENTS = {
  'primeiro_cadastro': { name: 'Primeiro Passo', icon: '🎯', description: 'Complete seu cadastro' },
  'perfil_completo': { name: 'Perfil Completo', icon: '✅', description: 'Complete todas as informações' },
  'primeira_compra': { name: 'Primeira Compra', icon: '🛒', description: 'Faça sua primeira compra' },
  'referral_confirmado': { name: 'Indicador', icon: '👥', description: 'Indique um amigo' },
  'streak_7_dias': { name: 'Consistência', icon: '🔥', description: '7 dias consecutivos' },
  'streak_30_dias': { name: 'Dedicação', icon: '💎', description: '30 dias consecutivos' },
  'nivel_helen': { name: 'Avançado', icon: '💪', description: 'Alcance o nível Helen' },
  'nivel_fran': { name: 'Intermediário', icon: '🔥', description: 'Alcance o nível Fran' },
  'nivel_annie': { name: 'Iniciante', icon: '⭐', description: 'Alcance o nível Annie' },
  'nivel_murph': { name: 'Expert', icon: '👑', description: 'Alcance o nível Murph' },
  'nivel_matt': { name: 'Master', icon: '🏆', description: 'Alcance o nível Matt' }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UserGamificationCards({ className = '' }: GamificationCardProps) {
  const { user, gamification, loading } = useClerkSupabase();
  const { notifications, unreadCount } = useNotifications(user?.id || '');
  const { getLevelInfo } = useIntegratedGamification();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'transactions'>('overview');
  const [showLevelUp, setShowLevelUp] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (gamification) {
      const currentLevel = getLevelInfo(gamification.level);
      const nextLevel = getNextLevel(gamification.level);
      
      if (nextLevel && gamification.box_tokens >= nextLevel.minTokens) {
        setShowLevelUp(true);
      }
    }
  }, [gamification, getLevelInfo]);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getNextLevel = (currentLevel: string): LevelInfo | null => {
    const levels = ['cindy', 'helen', 'fran', 'annie', 'murph', 'matt'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      return GAMIFICATION_LEVELS[levels[currentIndex + 1]];
    }
    
    return null;
  };

  const getProgressPercentage = (tokens: number, level: string): number => {
    const currentLevel = GAMIFICATION_LEVELS[level];
    const nextLevel = getNextLevel(level);
    
    if (!nextLevel) return 100;
    
    const progress = ((tokens - currentLevel.minTokens) / (nextLevel.minTokens - currentLevel.minTokens)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatTokens = (tokens: number): string => {
    return new Intl.NumberFormat('pt-BR').format(tokens);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-700 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-white mb-2">Gamificação não encontrada</h3>
        <p className="text-gray-400">Complete seu perfil para acessar a gamificação</p>
      </div>
    );
  }

  const currentLevel = GAMIFICATION_LEVELS[gamification.level];
  const nextLevel = getNextLevel(gamification.level);
  const progressPercentage = getProgressPercentage(gamification.box_tokens, gamification.level);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && nextLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-gray-300 mb-4">
                Você alcançou o nível <span className="font-semibold text-pink-400">{nextLevel.name}</span>!
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Novos Benefícios:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {nextLevel.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <span className="text-green-400 mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowLevelUp(false)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Principal - Nível e Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${currentLevel.color}20`, borderColor: currentLevel.color }}
            >
              {currentLevel.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentLevel.name}</h2>
              <p className="text-gray-400">{currentLevel.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-pink-400">
              {formatTokens(gamification.box_tokens)} $BOX
            </div>
            <p className="text-sm text-gray-400">Total ganho: {formatTokens(gamification.total_earned)}</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        {nextLevel && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progresso para {nextLevel.name}</span>
              <span>{formatTokens(gamification.box_tokens)} / {formatTokens(nextLevel.minTokens)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
              />
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{gamification.achievements.length}</div>
            <p className="text-sm text-gray-400">Ações</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{gamification.badges.length}</div>
            <p className="text-sm text-gray-400">Dias seguidos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{gamification.total_earned}</div>
            <p className="text-sm text-gray-400">Indicações</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{unreadCount}</div>
            <p className="text-sm text-gray-400">Notificações</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: '📊' },
          { id: 'achievements', label: 'Conquistas', icon: '🏆' },
          { id: 'transactions', label: 'Histórico', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              selectedTab === tab.id
                ? 'bg-pink-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Conquistas Recentes */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Conquistas Recentes</h3>
              <div className="space-y-3">
                {gamification.achievements.slice(-3).map((achievement, index) => {
                  const achievementInfo = ACHIEVEMENTS[achievement as keyof typeof ACHIEVEMENTS];
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-2xl">{achievementInfo?.icon || '🏆'}</div>
                      <div>
                        <p className="text-white font-medium">{achievementInfo?.name || achievement}</p>
                        <p className="text-sm text-gray-400">{achievementInfo?.description || 'Conquista desbloqueada'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Próximos Objetivos */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Próximos Objetivos</h3>
              <div className="space-y-3">
                {nextLevel && (
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{nextLevel.icon}</div>
                    <div>
                      <p className="text-white font-medium">Alcançar {nextLevel.name}</p>
                      <p className="text-sm text-gray-400">
                        Faltam {formatTokens(nextLevel.minTokens - gamification.box_tokens)} $BOX
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <p className="text-white font-medium">Streak de 7 dias</p>
                    <p className="text-sm text-gray-400">
                      {gamification.achievements.length} conquistas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
              const isUnlocked = gamification.achievements.includes(key);
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-gray-900 border-gray-700 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  {isUnlocked && (
                    <div className="mt-2 text-xs text-green-400 font-medium">✓ Desbloqueada</div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {selectedTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Histórico de Transações</h3>
            <div className="space-y-3">
              {/* Aqui seria integrado com useTransactions hook */}
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📈</div>
                <p>Histórico de transações será carregado aqui</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}