import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTokenActions, TokenAction } from '../hooks/useTokenActions';
import { TOKEN_ACTIONS } from '../hooks/useLevelSystem';

interface TokenActionsPanelProps {
  className?: string;
  showAll?: boolean;
  category?: 'daily' | 'social' | 'content' | 'achievement' | 'all';
}

export default function TokenActionsPanel({ 
  className = '', 
  showAll = false,
  category = 'all' 
}: TokenActionsPanelProps) {
  const { awardTokens } = useTokenActions();
  const [loading, setLoading] = useState<string | null>(null);

  // Categorizar ações
  const actionCategories = {
    daily: [
      'login_diario',
      'completou_missao_diaria',
      'bonus_7dias_ativos',
      'bonus_14dias_ativos',
    ],
    social: [
      'compartilhamento',
      'convidou_amigo',
      'rede_social_tag',
      'indicacao_confirmada',
    ],
    content: [
      'envio_conteudo',
      'assistiu_spoiler_video',
      'respondeu_quiz',
      'feedback_evento',
    ],
    achievement: [
      'chegou_nivel_fran',
      'desafio_semana_concluido',
      'completo_perfil',
      'compra_avatar_premium',
    ],
  };

  const getActionsToShow = () => {
    if (showAll) return Object.keys(TOKEN_ACTIONS) as Array<keyof typeof TOKEN_ACTIONS>;
    if (category === 'all') return Object.keys(TOKEN_ACTIONS) as Array<keyof typeof TOKEN_ACTIONS>;
    return actionCategories[category] as Array<keyof typeof TOKEN_ACTIONS>;
  };

  const getActionIcon = (action: keyof typeof TOKEN_ACTIONS): string => {
    const icons: Record<keyof typeof TOKEN_ACTIONS, string> = {
      cadastro: '👤',
      completar_perfil: '✅',
      login_diario: '🌅',
      compra_ingresso: '🎫',
      envio_conteudo: '📝',
      participacao_enquete: '📊',
      compartilhamento: '📤',
      qr_scan_evento: '📱',
      prova_extra: '🏃‍♂️',
      acesso_spoiler: '🔓',
      checkin_evento: '📍',
      indicacao_confirmada: '👥',
      assistiu_spoiler_video: '🎬',
      respondeu_quiz: '🧠',
      completou_missao_diaria: '📋',
      convidou_amigo: '💌',
      feedback_evento: '💬',
      rede_social_tag: '🏷️',
      desafio_semana_concluido: '🏆',
      bonus_7dias_ativos: '🔥',
      bonus_14dias_ativos: '💎',
      chegou_nivel_fran: '💪',
      compra_avatar_premium: '🛒',
    };
    return icons[action] || '🎯';
  };

  const getActionDescription = (action: keyof typeof TOKEN_ACTIONS): string => {
    const descriptions: Record<keyof typeof TOKEN_ACTIONS, string> = {
      cadastro: 'Cadastro realizado',
      completar_perfil: 'Perfil completado',
      login_diario: 'Login diário',
      compra_ingresso: 'Ingresso comprado',
      envio_conteudo: 'Conteúdo enviado',
      participacao_enquete: 'Participação em enquete',
      compartilhamento: 'Conteúdo compartilhado',
      qr_scan_evento: 'QR Code escaneado',
      prova_extra: 'Prova adicional',
      acesso_spoiler: 'Acesso a spoiler',
      checkin_evento: 'Check-in no evento',
      indicacao_confirmada: 'Indicação confirmada',
      assistiu_spoiler_video: 'Vídeo spoiler assistido',
      respondeu_quiz: 'Quiz respondido',
      completou_missao_diaria: 'Missão diária completada',
      convidou_amigo: 'Amigo convidado',
      feedback_evento: 'Feedback do evento',
      rede_social_tag: 'Post com marcação',
      desafio_semana_concluido: 'Desafio semanal concluído',
      bonus_7dias_ativos: 'Bônus 7 dias ativos',
      bonus_14dias_ativos: 'Bônus 14 dias ativos',
      chegou_nivel_fran: 'Nível Fran atingido',
      compra_avatar_premium: 'Avatar premium comprado',
    };
    return descriptions[action] || 'Ação realizada';
  };

  const handleAction = async (action: keyof typeof TOKEN_ACTIONS) => {
    setLoading(action);
    try {
      const success = await awardTokens(action);
      if (success) {
        // Mostrar feedback visual
        console.log(`✅ Ação ${action} executada com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    } finally {
      setLoading(null);
    }
  };

  const actions = getActionsToShow();

  return (
    <div className={`token-actions-panel ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action}
            onClick={() => handleAction(action)}
            disabled={loading === action}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              hover:scale-105 hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              ${loading === action 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-pink-300 bg-white'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getActionIcon(action)}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">
                  {getActionDescription(action)}
                </h3>
                <p className="text-sm text-gray-600">
                  +{TOKEN_ACTIONS[action]} $BØX
                </p>
              </div>
              {loading === action && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Componente para exibir resumo de ações disponíveis
export function TokenActionsSummary({ className = '' }: { className?: string }) {
  const totalActions = Object.keys(TOKEN_ACTIONS).length;
  const totalTokens = Object.values(TOKEN_ACTIONS).reduce((sum, tokens) => sum + tokens, 0);

  return (
    <div className={`bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        🎯 Sistema de Gamificação
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Ações disponíveis:</span>
          <span className="font-bold text-pink-600 ml-2">{totalActions}</span>
        </div>
        <div>
          <span className="text-gray-600">Total de tokens:</span>
          <span className="font-bold text-purple-600 ml-2">{totalTokens} $BØX</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Complete ações para ganhar tokens e subir de nível!
      </p>
    </div>
  );
}
