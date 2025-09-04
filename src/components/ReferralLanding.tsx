// ============================================================================
// REFERRAL LANDING - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useClerkSupabase, useIntegratedGamification } from '../hooks/useClerkSupabase';
import { useAnalytics } from '../hooks/useSupabase';
import { ConfettiExplosion } from './ConfettiExplosion';

// ============================================================================
// TIPOS
// ============================================================================

interface ReferralLandingProps {
  className?: string;
}

interface ReferralData {
  referrer: {
    id: string;
    name: string;
    role: string;
    tokens: number;
    level: string;
  };
  referralCode: string;
  isValid: boolean;
  rewards: {
    referrer: number;
    referee: number;
  };
}

// ============================================================================
// CONSTANTES
// ============================================================================

const REFERRAL_REWARDS = {
  referrer: 50, // Tokens para quem indica
  referee: 25   // Tokens para quem é indicado
};

const REFERRAL_STEPS = [
  {
    step: 1,
    title: 'Cadastre-se',
    description: 'Crie sua conta no INTERBØX 2025',
    icon: '👤',
    color: 'text-blue-500'
  },
  {
    step: 2,
    title: 'Complete seu perfil',
    description: 'Defina seu tipo de participação',
    icon: '✅',
    color: 'text-green-500'
  },
  {
    step: 3,
    title: 'Ganhe tokens',
    description: 'Receba bônus de indicação',
    icon: '💰',
    color: 'text-yellow-500'
  },
  {
    step: 4,
    title: 'Participe',
    description: 'Junte-se à comunidade',
    icon: '🎉',
    color: 'text-purple-500'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ReferralLanding({ className = '' }: ReferralLandingProps) {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();
  const { user, gamification } = useClerkSupabase();
  const { awardTokens } = useIntegratedGamification();
  const { trackEvent } = useAnalytics();
  
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (referralCode) {
      fetchReferralData();
    } else {
      setError('Código de indicação não encontrado');
      setLoading(false);
    }
  }, [referralCode]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular busca de dados do referrer (substituir por query real do Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dados simulados (substituir por query real)
      const mockReferralData: ReferralData = {
        referrer: {
          id: 'user123',
          name: 'João Silva',
          role: 'atleta',
          tokens: 150,
          level: 'helen'
        },
        referralCode: referralCode || '',
        isValid: true,
        rewards: REFERRAL_REWARDS
      };

      setReferralData(mockReferralData);
      trackEvent('referral_landing_view', { 
        referral_code: referralCode,
        referrer_id: mockReferralData.referrer.id
      });
    } catch (err) {
      setError('Erro ao carregar dados da indicação');
      console.error('Erro ao buscar dados de indicação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReferral = async () => {
    if (!referralData || !user) return;

    try {
      setIsProcessing(true);

      // Simular processamento da indicação
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Adicionar tokens para o usuário atual
      await awardTokens(REFERRAL_REWARDS.referee, 'referral', 'Bônus de indicação');

      // Simular adição de tokens para o referrer (substituir por lógica real)
      console.log('Adicionando tokens para o referrer:', referralData.referrer.id);

      // Rastrear evento
      trackEvent('referral_accepted', {
        referral_code: referralCode,
        referrer_id: referralData.referrer.id,
        referee_id: user.id,
        tokens_awarded: REFERRAL_REWARDS.referee
      });

      setShowSuccess(true);

      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/selecao-tipo-cadastro');
      }, 3000);

    } catch (err) {
      console.error('Erro ao processar indicação:', err);
      alert('Erro ao processar indicação. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipReferral = () => {
    trackEvent('referral_skipped', { referral_code: referralCode });
    navigate('/selecao-tipo-cadastro');
  };

  const formatTokens = (tokens: number): string => {
    return new Intl.NumberFormat('pt-BR').format(tokens);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando indicação...</p>
        </div>
      </div>
    );
  }

  if (error || !referralData) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Indicação não encontrada</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ir para Home
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <ConfettiExplosion type="achievement" intensity="high" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Indicação aceita!
          </h2>
          <p className="text-gray-600 mb-6">
            Você recebeu <span className="font-bold text-pink-500">
              +{formatTokens(REFERRAL_REWARDS.referee)} $BOX
            </span> de bônus!
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando para o cadastro...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Você foi convidado para o INTERBØX 2025!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold text-pink-500">{referralData.referrer.name}</span> te convidou para participar do maior evento de CrossFit do Brasil
            </p>
          </div>

          {/* Card do Referrer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg mb-8 border border-gray-200"
          >
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                {referralData.referrer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {referralData.referrer.name}
                </h3>
                <p className="text-gray-600 mb-2">
                  {referralData.referrer.role.charAt(0).toUpperCase() + referralData.referrer.role.slice(1)} no INTERBØX
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Nível:</span>
                    <span className="ml-1 font-semibold text-purple-500">
                      {referralData.referrer.level.charAt(0).toUpperCase() + referralData.referrer.level.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Tokens:</span>
                    <span className="ml-1 font-semibold text-pink-500">
                      {formatTokens(referralData.referrer.tokens)} $BOX
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recompensas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              🎁 Recompensas de Indicação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">👤</div>
                <h3 className="text-lg font-semibold mb-2">Para você</h3>
                <div className="text-2xl font-bold">
                  +{formatTokens(referralData.rewards.referee)} $BOX
                </div>
                <p className="text-sm opacity-90 mt-1">
                  Bônus de boas-vindas
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-lg font-semibold mb-2">Para {referralData.referrer.name}</h3>
                <div className="text-2xl font-bold">
                  +{formatTokens(referralData.rewards.referrer)} $BOX
                </div>
                <p className="text-sm opacity-90 mt-1">
                  Bônus de indicação
                </p>
              </div>
            </div>
          </motion.div>

          {/* Passos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Como funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {REFERRAL_STEPS.map((step, index) => (
                <div key={step.step} className="text-center">
                  <div className={`text-4xl mb-3 ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {step.step}. {step.title}
                  </div>
                  <p className="text-xs text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center"
          >
            <button
              onClick={handleSkipReferral}
              className="px-8 py-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              Pular indicação
            </button>
            <button
              onClick={handleAcceptReferral}
              disabled={isProcessing}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  Aceitar indicação
                  <span className="ml-2">
                    +{formatTokens(REFERRAL_REWARDS.referee)} $BOX
                  </span>
                </>
              )}
            </button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-12 text-sm text-gray-500"
          >
            <p>
              Ao aceitar esta indicação, você concorda com nossos{' '}
              <a href="/termos" className="text-pink-500 hover:text-pink-600 underline">
                Termos de Uso
              </a>
              {' '}e{' '}
              <a href="/politica-privacidade" className="text-pink-500 hover:text-pink-600 underline">
                Política de Privacidade
              </a>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
