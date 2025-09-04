// ============================================================================
// TOKEN NOTIFICATION - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntegratedGamification } from '../hooks/useClerkSupabase';
import type { TransactionType } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface TokenNotificationProps {
  className?: string;
}

interface NotificationData {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  timestamp: Date;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const NOTIFICATION_ICONS: Record<TransactionType, string> = {
  'earn': '💰',
  'spend': '💸',
  'bonus': '🎁',
  'referral': '👥',
  'achievement': '🏆'
};

const NOTIFICATION_COLORS: Record<TransactionType, string> = {
  'earn': 'text-green-400',
  'spend': 'text-red-400',
  'bonus': 'text-purple-400',
  'referral': 'text-blue-400',
  'achievement': 'text-yellow-400'
};

const NOTIFICATION_MESSAGES: Record<TransactionType, (amount: number, description?: string) => string> = {
  'earn': (amount, description) => `+${amount} $BOX ganhos! ${description || 'Continue assim!'}`,
  'spend': (amount, description) => `-${amount} $BOX gastos. ${description || 'Investimento realizado!'}`,
  'bonus': (amount, description) => `+${amount} $BOX de bônus! ${description || 'Presente especial!'}`,
  'referral': (amount, description) => `+${amount} $BOX por indicação! ${description || 'Obrigado por indicar!'}`,
  'achievement': (amount, description) => `+${amount} $BOX por conquista! ${description || 'Parabéns!'}`
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TokenNotification({ className = '' }: TokenNotificationProps) {
  const { awardTokens } = useIntegratedGamification();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    // Simular notificações de teste (remover em produção)
    const testNotifications: NotificationData[] = [
      {
        id: '1',
        amount: 10,
        type: 'earn',
        description: 'Login diário',
        timestamp: new Date()
      },
      {
        id: '2',
        amount: 25,
        type: 'achievement',
        description: 'Perfil completo',
        timestamp: new Date(Date.now() - 30000)
      }
    ];

    setNotifications(testNotifications);
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Manter apenas 5 notificações
    setIsVisible(true);

    // Auto-hide após 5 segundos
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR').format(amount);
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return timestamp.toLocaleDateString('pt-BR');
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-sm w-full"
          >
            <div className="flex items-start space-x-3">
              {/* Ícone */}
              <div className="flex-shrink-0">
                <div className={`text-2xl ${NOTIFICATION_COLORS[notification.type]}`}>
                  {NOTIFICATION_ICONS[notification.type]}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className={`text-lg font-bold ${NOTIFICATION_COLORS[notification.type]}`}>
                    {notification.type === 'spend' ? '-' : '+'}{formatAmount(notification.amount)} $BOX
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-sm text-gray-300 mt-1">
                  {NOTIFICATION_MESSAGES[notification.type](notification.amount, notification.description)}
                </p>
                
                <p className="text-xs text-gray-500 mt-2">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
            </div>

            {/* Barra de progresso animada */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-3"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Botão de teste (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => addNotification({
              amount: Math.floor(Math.random() * 50) + 10,
              type: ['earn', 'bonus', 'achievement'][Math.floor(Math.random() * 3)] as TransactionType,
              description: 'Teste de notificação'
            })}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg"
          >
            Testar Notificação
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR NOTIFICAÇÕES
// ============================================================================

export function useTokenNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (amount: number, type: TransactionType, description?: string) => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      amount,
      type,
      description,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    clearNotifications
  };
}
