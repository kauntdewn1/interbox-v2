// ============================================================================
// CARD - INTERBØX V2
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TIPOS
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  gradient?: boolean;
  glass?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CARD_VARIANTS = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-100',
  outlined: 'bg-transparent border-2 border-gray-300',
  filled: 'bg-gray-50 border border-gray-200'
};

const CARD_SIZES = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const CARD_PADDING = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

const CARD_ROUNDED = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl'
};

const CARD_SHADOW = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Card({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  onClick,
  disabled = false,
  loading = false,
  padding,
  rounded = 'lg',
  shadow = 'sm',
  border = true,
  gradient = false,
  glass = false
}: CardProps) {
  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const getCardClasses = () => {
    const baseClasses = 'transition-all duration-200';
    
    // Variante
    const variantClasses = CARD_VARIANTS[variant];
    
    // Tamanho (se padding não for especificado)
    const sizeClasses = padding ? '' : CARD_SIZES[size];
    
    // Padding customizado
    const paddingClasses = padding ? CARD_PADDING[padding] : '';
    
    // Arredondamento
    const roundedClasses = CARD_ROUNDED[rounded];
    
    // Sombra
    const shadowClasses = CARD_SHADOW[shadow];
    
    // Estados
    const stateClasses = [
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      clickable && !disabled ? 'cursor-pointer' : '',
      hover && !disabled ? 'hover:shadow-lg hover:-translate-y-1' : '',
      gradient ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' : '',
      glass ? 'bg-white/10 backdrop-blur-md border border-white/20' : ''
    ].filter(Boolean).join(' ');
    
    // Border
    const borderClasses = border ? '' : 'border-0';
    
    return [
      baseClasses,
      variantClasses,
      sizeClasses,
      paddingClasses,
      roundedClasses,
      shadowClasses,
      stateClasses,
      borderClasses,
      className
    ].filter(Boolean).join(' ');
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  const cardContent = (
    <div className={getCardClasses()}>
      {loading ? (
        <div className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );

  if (clickable && onClick && !disabled) {
    return (
      <motion.div
        whileHover={{ scale: hover ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="block"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

// ============================================================================
// COMPONENTES ESPECÍFICOS
// ============================================================================

// Card de Gamificação
export function GamificationCard({ 
  children, 
  className = '',
  level,
  tokens,
  ...props 
}: CardProps & { 
  level?: string; 
  tokens?: number; 
}) {
  return (
    <Card
      {...props}
      className={`bg-gradient-to-br from-pink-500 to-purple-500 text-white ${className}`}
      variant="filled"
      shadow="lg"
    >
      {children}
    </Card>
  );
}

// Card de Usuário
export function UserCard({ 
  children, 
  className = '',
  user,
  ...props 
}: CardProps & { 
  user?: { 
    name: string; 
    role: string; 
    avatar?: string; 
  }; 
}) {
  return (
    <Card
      {...props}
      className={`hover:shadow-lg transition-all duration-200 ${className}`}
      variant="elevated"
      clickable
    >
      {children}
    </Card>
  );
}

// Card de Estatística
export function StatCard({ 
  title, 
  value, 
  change, 
  icon,
  className = '',
  ...props 
}: CardProps & { 
  title: string; 
  value: string | number; 
  change?: { 
    value: number; 
    type: 'increase' | 'decrease'; 
  }; 
  icon?: string; 
}) {
  return (
    <Card
      {...props}
      className={`text-center ${className}`}
      variant="elevated"
    >
      <div className="flex flex-col items-center space-y-2">
        {icon && (
          <div className="text-3xl text-pink-500">
            {icon}
          </div>
        )}
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        <div className="text-sm text-gray-600">
          {title}
        </div>
        {change && (
          <div className={`text-xs ${
            change.type === 'increase' ? 'text-green-500' : 'text-red-500'
          }`}>
            {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
          </div>
        )}
      </div>
    </Card>
  );
}

// Card de Ação
export function ActionCard({ 
  title, 
  description, 
  action, 
  icon,
  className = '',
  ...props 
}: CardProps & { 
  title: string; 
  description: string; 
  action: () => void; 
  icon?: string; 
}) {
  return (
    <Card
      {...props}
      className={`text-center hover:shadow-lg transition-all duration-200 ${className}`}
      variant="elevated"
      clickable
      onClick={action}
    >
      <div className="space-y-3">
        {icon && (
          <div className="text-4xl text-pink-500">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>
    </Card>
  );
}

// Card de Notificação
export function NotificationCard({ 
  title, 
  message, 
  type = 'info',
  timestamp,
  className = '',
  ...props 
}: CardProps & { 
  title: string; 
  message: string; 
  type?: 'info' | 'success' | 'warning' | 'error'; 
  timestamp?: string; 
}) {
  const typeColors = {
    info: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <Card
      {...props}
      className={`border-l-4 ${typeColors[type]} ${className}`}
      variant="filled"
    >
      <div className="flex items-start space-x-3">
        <div className="text-lg">
          {typeIcons[type]}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {message}
          </p>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-2">
              {timestamp}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
