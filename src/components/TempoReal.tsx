// ============================================================================
// TEMPO REAL - RANKING DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useClerkSupabase } from '../hooks/useClerkSupabase';
import { useLevelSystem } from '../hooks/useLevelSystem';
import type { User, UserGamification } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface TempoRealProps {
  className?: string;
  limit?: number;
  showCurrentUser?: boolean;
}

interface LeaderboardEntry {
  user: User;
  gamification: UserGamification;
  position: number;
  isCurrentUser: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const POSITION_ICONS = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TempoReal({ 
  className = '', 
  limit = 10, 
  showCurrentUser = true 
}: TempoRealProps) {
  const { user: currentUser } = useClerkSupabase();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    fetchLeaderboard();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLeaderboard, 30000);
    
    return () => clearInterval(interval);
  }, [limit, currentUser]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuários com gamificação ordenados por tokens
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_gamification (*)
        `)
        .eq('is_active', true)
        .eq('test_user', false)
        .order('user_gamification.box_tokens', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Processar dados do leaderboard
      const processedData: LeaderboardEntry[] = data
        .filter(item => item.user_gamification)
        .map((item, index) => ({
          user: item,
          gamification: item.user_gamification,
          position: index + 1,
          isCurrentUser: currentUser?.id === item.id
        }));

      setLeaderboard(processedData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
      console.error('Erro ao buscar leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (tokens: number): string => {
    return new Intl.NumberFormat('pt-BR').format(tokens);
  };

  const getPositionColor = (position: number): string => {
    if (position === 1) return 'text-yellow-400';
    if (position === 2) return 'text-gray-300';
    if (position === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getPositionBg = (position: number): string => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (position === 2) return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
    if (position === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'bg-gray-800/50 border-gray-700';
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-2xl p-6 border border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🏆 Ranking em Tempo Real</h2>
          <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 h-16 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-2xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">😞</div>
          <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar ranking</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-2xl p-6 border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏆</div>
          <div>
            <h2 className="text-xl font-bold text-white">Ranking em Tempo Real</h2>
            <p className="text-sm text-gray-400">
              Atualizado em {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="text-gray-400 hover:text-white transition-colors"
          title="Atualizar ranking"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Seção do usuário atual */}
      {currentUser && leaderboard.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser.image || '/images/default-avatar.png'}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
              />
              <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {leaderboard.find(entry => entry.isCurrentUser)?.position || '?'}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-pink-400">{currentUser.name}</h3>
              <p className="text-sm text-gray-300">
                {leaderboard.find(entry => entry.isCurrentUser)?.gamification.box_tokens || 0} $BØX
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-400">
                {leaderboard.find(entry => entry.isCurrentUser)?.gamification.box_tokens || 0}
              </div>
              <div className="text-xs text-gray-400">$BØX</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        <AnimatePresence>
          {leaderboard.map((entry, index) => {
            const { currentLevel, nextLevel, progressToNext, tokensToNext } = useLevelSystem(entry.gamification.box_tokens);
            const positionIcon = POSITION_ICONS[entry.position as keyof typeof POSITION_ICONS];
            
            return (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  entry.isCurrentUser 
                    ? 'bg-pink-500/10 border-pink-500/30 ring-2 ring-pink-500/20' 
                    : getPositionBg(entry.position)
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Posição */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.isCurrentUser ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {positionIcon || entry.position}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      {entry.user.photo_url ? (
                        <img
                          src={entry.user.photo_url}
                          alt={entry.user.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-300">
                          {entry.user.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold truncate ${
                        entry.isCurrentUser ? 'text-pink-400' : 'text-white'
                      }`}>
                        {entry.user.display_name}
                      </h3>
                      {entry.isCurrentUser && (
                        <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <img
                          src={currentLevel.image}
                          alt={currentLevel.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-sm text-pink-400 font-medium">
                          {currentLevel.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {entry.gamification.achievements.length} conquistas
                      </span>
                    </div>
                  </div>

                  {/* Tokens */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${
                      entry.isCurrentUser ? 'text-pink-400' : 'text-white'
                    }`}>
                      {formatTokens(entry.gamification.box_tokens)} $BØX
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTokens(entry.gamification.total_earned)} total
                    </div>
                  </div>
                </div>

                {/* Barra de progresso para o próximo nível */}
                {nextLevel && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progresso para {nextLevel.name}</span>
                      <span>{tokensToNext} $BØX restantes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Mostrando top {leaderboard.length} usuários</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Atualização automática</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR RANKING
// ============================================================================

export function useLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_gamification (*)
        `)
        .eq('is_active', true)
        .eq('test_user', false)
        .order('user_gamification.box_tokens', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const processedData: LeaderboardEntry[] = data
        .filter(item => item.user_gamification)
        .map((item, index) => ({
          user: item,
          gamification: item.user_gamification,
          position: index + 1,
          isCurrentUser: false
        }));

      setLeaderboard(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard
  };
}
