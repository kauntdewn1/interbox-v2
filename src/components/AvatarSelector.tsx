// ============================================================================
// AVATAR SELECTOR - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerkSupabase } from '../hooks/useClerkSupabase';
import { useNotifications } from '../hooks/useSupabase';

// ============================================================================
// TIPOS
// ============================================================================

interface AvatarSelectorProps {
  className?: string;
  onAvatarSelect?: (avatar: string) => void;
  selectedAvatar?: string;
  showPremium?: boolean;
}

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  category: 'free' | 'premium';
  cost: number;
  unlocked: boolean;
  description: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const AVATARS_FREE: Avatar[] = [
  {
    id: 'default',
    name: 'Padrão',
    emoji: '👤',
    category: 'free',
    cost: 0,
    unlocked: true,
    description: 'Avatar padrão do sistema'
  },
  {
    id: 'atleta',
    name: 'Atleta',
    emoji: '🏃‍♀️',
    category: 'free',
    cost: 0,
    unlocked: true,
    description: 'Para atletas dedicados'
  },
  {
    id: 'judge',
    name: 'Judge',
    emoji: '⚖️',
    category: 'free',
    cost: 0,
    unlocked: true,
    description: 'Para juízes oficiais'
  },
  {
    id: 'midia',
    name: 'Mídia',
    emoji: '📸',
    category: 'free',
    cost: 0,
    unlocked: true,
    description: 'Para profissionais de mídia'
  },
  {
    id: 'espectador',
    name: 'Torcida',
    emoji: '🎉',
    category: 'free',
    cost: 0,
    unlocked: true,
    description: 'Para a torcida animada'
  }
];

const AVATARS_PREMIUM: Avatar[] = [
  {
    id: 'champion',
    name: 'Campeão',
    emoji: '🏆',
    category: 'premium',
    cost: 100,
    unlocked: false,
    description: 'Para verdadeiros campeões'
  },
  {
    id: 'legend',
    name: 'Lenda',
    emoji: '👑',
    category: 'premium',
    cost: 200,
    unlocked: false,
    description: 'Status de lenda do CrossFit'
  },
  {
    id: 'dragon',
    name: 'Dragão',
    emoji: '🐉',
    category: 'premium',
    cost: 300,
    unlocked: false,
    description: 'Força e poder lendários'
  },
  {
    id: 'phoenix',
    name: 'Fênix',
    emoji: '🔥',
    category: 'premium',
    cost: 250,
    unlocked: false,
    description: 'Renascimento e transformação'
  },
  {
    id: 'titan',
    name: 'Titã',
    emoji: '⚡',
    category: 'premium',
    cost: 400,
    unlocked: false,
    description: 'Poder divino e força suprema'
  },
  {
    id: 'viking',
    name: 'Viking',
    emoji: '🛡️',
    category: 'premium',
    cost: 350,
    unlocked: false,
    description: 'Guerreiro nórdico destemido'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AvatarSelector({ 
  className = '',
  onAvatarSelect,
  selectedAvatar,
  showPremium = true
}: AvatarSelectorProps) {
  const { user, gamification, addTokens } = useClerkSupabase();
  const { addNotification } = useNotifications(user?.id || '');
  
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPremiumAvatar, setSelectedPremiumAvatar] = useState<Avatar | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadAvatars();
  }, [gamification]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadAvatars = () => {
    setLoading(true);
    
    // Combinar avatares livres e premium
    const allAvatars = [...AVATARS_FREE];
    
    if (showPremium) {
      // Verificar quais avatares premium estão desbloqueados
      const premiumAvatars = AVATARS_PREMIUM.map(avatar => ({
        ...avatar,
        unlocked: gamification ? gamification.achievements.includes(`avatar_${avatar.id}`) : false
      }));
      
      allAvatars.push(...premiumAvatars);
    }
    
    setAvatars(allAvatars);
    setLoading(false);
  };

  const handleAvatarClick = (avatar: Avatar) => {
    if (avatar.category === 'free' || avatar.unlocked) {
      // Avatar disponível
      if (onAvatarSelect) {
        onAvatarSelect(avatar.id);
      }
    } else if (avatar.category === 'premium') {
      // Avatar premium - mostrar modal de compra
      setSelectedPremiumAvatar(avatar);
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseAvatar = async () => {
    if (!selectedPremiumAvatar || !gamification) return;

    try {
      // Verificar se tem tokens suficientes
      if (gamification.box_tokens < selectedPremiumAvatar.cost) {
        alert('Tokens insuficientes!');
        return;
      }

      // Simular compra (substituir por lógica real do Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Adicionar conquista
      const newAchievements = [...gamification.achievements, `avatar_${selectedPremiumAvatar.id}`];
      
      // Atualizar gamificação (substituir por chamada real do Supabase)
      console.log('Avatar comprado:', selectedPremiumAvatar.id);
      console.log('Novas conquistas:', newAchievements);

      // Adicionar notificação
      await addNotification({
        user_id: user?.id || '',
        title: '🎉 Avatar desbloqueado!',
        message: `Você desbloqueou o avatar ${selectedPremiumAvatar.name} por ${selectedPremiumAvatar.cost} $BOX!`,
        type: 'success',
        read: false,
        metadata: {
          avatar: selectedPremiumAvatar.id,
          cost: selectedPremiumAvatar.cost
        }
      });

      // Fechar modal e recarregar avatares
      setShowPurchaseModal(false);
      setSelectedPremiumAvatar(null);
      loadAvatars();

      // Selecionar o avatar automaticamente
      if (onAvatarSelect) {
        onAvatarSelect(selectedPremiumAvatar.id);
      }

    } catch (error) {
      console.error('Erro ao comprar avatar:', error);
      alert('Erro ao comprar avatar. Tente novamente.');
    }
  };

  const formatTokens = (tokens: number): string => {
    return new Intl.NumberFormat('pt-BR').format(tokens);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Escolha seu Avatar</h2>
        <p className="text-gray-400">
          Personalize sua identidade no INTERBØX 2025
        </p>
        {gamification && (
          <div className="mt-2 text-sm text-pink-400">
            Seu saldo: {formatTokens(gamification.box_tokens)} $BOX
          </div>
        )}
      </div>

      {/* Avatares Livres */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Avatares Gratuitos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {avatars.filter(avatar => avatar.category === 'free').map((avatar) => (
            <motion.div
              key={avatar.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAvatarClick(avatar)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedAvatar === avatar.id
                  ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-pink-300 hover:bg-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{avatar.emoji}</div>
                <h4 className="text-sm font-semibold text-white">{avatar.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{avatar.description}</p>
                <div className="mt-2 text-xs text-green-400">✓ Gratuito</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Avatares Premium */}
      {showPremium && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Avatares Premium</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatars.filter(avatar => avatar.category === 'premium').map((avatar) => (
              <motion.div
                key={avatar.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAvatarClick(avatar)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedAvatar === avatar.id
                    ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/20'
                    : avatar.unlocked
                    ? 'border-purple-500 bg-purple-500/10 hover:border-purple-300 hover:bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{avatar.emoji}</div>
                  <h4 className="text-sm font-semibold text-white">{avatar.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{avatar.description}</p>
                  
                  {avatar.unlocked ? (
                    <div className="mt-2 text-xs text-purple-400">✓ Desbloqueado</div>
                  ) : (
                    <div className="mt-2 text-xs text-yellow-400">
                      {formatTokens(avatar.cost)} $BOX
                    </div>
                  )}
                </div>

                {/* Badge de premium */}
                {!avatar.unlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </div>
                  </div>
                )}

                {/* Badge de desbloqueado */}
                {avatar.unlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Compra */}
      <AnimatePresence>
        {showPurchaseModal && selectedPremiumAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">{selectedPremiumAvatar.emoji}</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedPremiumAvatar.name}
              </h2>
              <p className="text-gray-300 mb-6">
                {selectedPremiumAvatar.description}
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-lg font-semibold text-white mb-2">
                  Custo: {formatTokens(selectedPremiumAvatar.cost)} $BOX
                </div>
                {gamification && (
                  <div className="text-sm text-gray-400">
                    Seu saldo: {formatTokens(gamification.box_tokens)} $BOX
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchaseAvatar}
                  disabled={!gamification || gamification.box_tokens < selectedPremiumAvatar.cost}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Comprar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
