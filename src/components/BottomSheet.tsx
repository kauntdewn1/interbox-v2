// ============================================================================
// BOTTOM SHEET - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerkSupabase } from '../hooks/useClerkSupabase';

// ============================================================================
// TIPOS
// ============================================================================

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  snapPoints?: number[];
  initialSnapPoint?: number;
}

interface BottomSheetItemProps {
  icon?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  snapPoints = [0.5, 0.8, 1],
  initialSnapPoint = 0
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y;
    const currentHeight = snapPoints[currentSnapPoint];
    
    if (velocity > 500) {
      // Swipe down rápido - fechar
      onClose();
    } else if (velocity < -500) {
      // Swipe up rápido - próximo snap point
      const nextIndex = Math.min(currentSnapPoint + 1, snapPoints.length - 1);
      setCurrentSnapPoint(nextIndex);
    } else {
      // Determinar snap point baseado na posição
      const threshold = 0.1;
      const newHeight = currentHeight + (info.offset.y / window.innerHeight);
      
      let closestIndex = currentSnapPoint;
      let closestDistance = Math.abs(newHeight - snapPoints[currentSnapPoint]);
      
      snapPoints.forEach((point, index) => {
        const distance = Math.abs(newHeight - point);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      setCurrentSnapPoint(closestIndex);
    }
    
    setIsDragging(false);
  };

  const getSnapPointHeight = () => {
    return snapPoints[currentSnapPoint] * 100;
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Bottom Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ 
              y: isDragging ? undefined : `${100 - getSnapPointHeight()}%` 
            }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300 
            }}
            className={`bg-white rounded-t-2xl shadow-2xl w-full max-h-[90vh] ${className}`}
            style={{ height: `${getSnapPointHeight()}vh` }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pb-4">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// COMPONENTE DE ITEM
// ============================================================================

export function BottomSheetItem({
  icon,
  title,
  subtitle,
  onClick,
  href,
  danger = false,
  disabled = false,
  badge,
  className = ''
}: BottomSheetItemProps) {
  const content = (
    <div className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : danger 
        ? 'hover:bg-red-50 cursor-pointer' 
        : 'hover:bg-gray-50 cursor-pointer'
    } ${className}`}>
      {icon && (
        <div className={`text-2xl ${danger ? 'text-red-500' : 'text-gray-600'}`}>
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold ${
            danger ? 'text-red-600' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          {badge && (
            <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return (
    <div onClick={disabled ? undefined : onClick}>
      {content}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE DIVISOR
// ============================================================================

export function BottomSheetDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`border-t border-gray-200 my-2 ${className}`} />
  );
}

// ============================================================================
// COMPONENTE DE SEÇÃO
// ============================================================================

export function BottomSheetSection({ 
  title, 
  children, 
  className = '' 
}: { 
  title?: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR BOTTOM SHEET
// ============================================================================

export function useBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}
