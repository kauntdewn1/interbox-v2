// ============================================================================
// USER HEADER - INTERBØX V2
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClerkSupabase, usePermissions } from '../hooks/useClerkSupabase';
import { useNotifications } from '../hooks/useSupabase';
import type { UserRole } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface UserHeaderProps {
  className?: string;
  showNotifications?: boolean;
  showGamification?: boolean;
  showRole?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ROLE_ICONS: Record<UserRole, string> = {
  'publico': 'ᚨ',
  'atleta': '⧖',
  'judge': '⨷',
  'midia': ' ⍤',
  'espectador': 'ᚨ',
  'admin': '⟠',
  'dev': '⟠',
  'marketing': '⟠',
  'staff': '⨷'
};

const ROLE_COLORS: Record<UserRole, string> = {
  'publico': 'text-gray-500',
  'atleta': 'text-blue-500',
  'judge': 'text-orange-500',
  'midia': 'text-purple-500',
  'espectador': 'text-green-500',
  'admin': 'text-red-500',
  'dev': 'text-indigo-500',
  'marketing': 'text-pink-500',
  'staff': 'text-yellow-500'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UserHeader({ 
  className = '',
  showNotifications = true,
  showGamification = true,
  showRole = true
}: UserHeaderProps) {
  const { user, gamification, loading, supabaseUser } = useClerkSupabase();
  const { notifications, unreadCount } = useNotifications(supabaseUser?.id || '');
  const { userRole } = usePermissions();
  
  const [showDropdown, setShowDropdown] = useState(false);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const formatTokens = (tokens: number): string => {
    return new Intl.NumberFormat('pt-BR').format(tokens);
  };

  const getLevelInfo = (level: string) => {
    const levels = {
      'cindy': { name: 'Cindy', color: '#10B981' },
      'helen': { name: 'Helen', color: '#3B82F6' },
      'fran': { name: 'Fran', color: '#8B5CF6' },
      'annie': { name: 'Annie', color: '#F59E0B' },
      'murph': { name: 'Murph', color: '#EF4444' },
      'matt': { name: 'Matt', color: '#EC4899' }
    };
    
    return levels[level as keyof typeof levels] || levels.cindy;
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`bg-gray-900 border-b border-gray-700 ${className}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-700 h-10 w-10 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const levelInfo = gamification ? getLevelInfo(gamification.level) : null;

  return (
    <div className={`bg-gray-900 border-b border-gray-700 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">
              {user?.name?.toUpperCase() || 'INTERBØX 2025'}
            </div>
            {showRole && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-800 ${ROLE_COLORS[userRole]}`}>
                <span className="text-sm">{ROLE_ICONS[userRole]}</span>
                <span className="text-sm font-medium capitalize">{userRole}</span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Gamificação */}
            {showGamification && gamification && (
              <div className="hidden md:flex items-center space-x-4">
                {/* Nível */}
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{levelInfo?.name}</div>
                    <div className="text-xs text-gray-400">Seu nível na Gamificação</div>
                  </div>
                </div>

                {/* Tokens */}
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-400">
                    {formatTokens(gamification.box_tokens)} $BOX
                  </div>
                  <div className="text-xs text-gray-400">Saldo</div>
                </div>
              </div>
            )}

            {/* Notificações */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de Notificações */}
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Notificações</h3>
                        <button
                          onClick={() => setShowDropdown(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                              !notification.read ? 'bg-gray-700/50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-300 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.created_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="text-4xl mb-2">🔔</div>
                          <p className="text-gray-400">Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Info do Usuário */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-white">
                  {user.name || 'Usuário'}
                </div>
                <div className="text-xs text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Gamification Bar */}
        {showGamification && gamification && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-sm font-semibold text-white">{levelInfo?.name}</div>
                  <div className="text-xs text-gray-400">Nível de Gamificação</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-pink-400">
                  {formatTokens(gamification.box_tokens)} $BOX
                </div>
                <div className="text-xs text-gray-400">Saldo</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
