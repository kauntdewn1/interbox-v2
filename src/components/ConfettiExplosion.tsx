// ============================================================================
// CONFETTI EXPLOSION - INTERBØX V2
// ============================================================================

import React, { useEffect, useRef } from 'react';
import confetti, { type Options } from 'canvas-confetti';

// ============================================================================
// TIPOS
// ============================================================================

interface ConfettiExplosionProps {
  trigger?: boolean;
  type?: 'success' | 'achievement' | 'levelup' | 'purchase' | 'custom';
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
  className?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CONFETTI_PRESETS = {
  success: {
    particleCount: 50,
    spread: 45,
    origin: { y: 0.6 },
    colors: ['#10B981', '#34C759', '#22C55E'],
    shapes: ['square', 'circle']
  },
  achievement: {
    particleCount: 100,
    spread: 60,
    origin: { y: 0.5 },
    colors: ['#F59E0B', '#F97316', '#EF4444', '#EC4899'],
    shapes: ['star', 'circle']
  },
  levelup: {
    particleCount: 150,
    spread: 70,
    origin: { y: 0.4 },
    colors: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'],
    shapes: ['star', 'circle', 'square']
  },
  purchase: {
    particleCount: 80,
    spread: 50,
    origin: { y: 0.6 },
    colors: ['#EC4899', '#F472B6', '#FBBF24', '#F59E0B'],
    shapes: ['circle', 'square']
  },
  custom: {
    particleCount: 50,
    spread: 45,
    origin: { y: 0.6 },
    colors: ['#007AFF', '#34C759', '#FF9500'],
    shapes: ['circle']
  }
};

const INTENSITY_MULTIPLIERS = {
  low: 0.5,
  medium: 1,
  high: 1.5
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ConfettiExplosion({
  trigger = false,
  type = 'success',
  intensity = 'medium',
  duration = 3000,
  colors,
  onComplete,
  className = ''
}: ConfettiExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (trigger) {
      triggerConfetti();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, type, intensity, duration, colors]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const triggerConfetti = () => {
    const preset = CONFETTI_PRESETS[type];
    const multiplier = INTENSITY_MULTIPLIERS[intensity];
    
    // Configuração base
    const config: Options = {
      particleCount: Math.floor(preset.particleCount * multiplier),
      spread: preset.spread,
      origin: preset.origin,
      colors: colors || preset.colors,
      shapes: preset.shapes as any,
      gravity: 0.8,
      drift: 0.1,
      ticks: 300
    };

    // Efeito principal
    confetti(config);

    // Efeitos adicionais baseados no tipo
    switch (type) {
      case 'achievement':
        // Explosão em sequência
        setTimeout(() => {
          confetti({
            ...config,
            particleCount: Math.floor(config.particleCount * 0.7),
            origin: { x: 0.2, y: 0.6 }
          });
        }, 200);
        
        setTimeout(() => {
          confetti({
            ...config,
            particleCount: Math.floor(config.particleCount * 0.7),
            origin: { x: 0.8, y: 0.6 }
          });
        }, 400);
        break;

      case 'levelup': {
        // Explosão em múltiplas direções
        const directions = [
          { x: 0.2, y: 0.4 },
          { x: 0.8, y: 0.4 },
          { x: 0.5, y: 0.2 }
        ];
        
        directions.forEach((direction, index) => {
          setTimeout(() => {
            confetti({
              ...config,
              particleCount: Math.floor(config.particleCount * 0.6),
              origin: direction
            });
          }, index * 300);
        });
        break;
      }

      case 'purchase':
        // Efeito de moedas caindo
        setTimeout(() => {
          confetti({
            ...config,
            particleCount: Math.floor(config.particleCount * 0.5),
            shapes: ['circle'],
            colors: ['#FBBF24', '#F59E0B', '#D97706']
          });
        }, 500);
        break;
    }

    // Callback de conclusão
    if (onComplete) {
      timeoutRef.current = setTimeout(() => {
        onComplete();
      }, duration);
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR CONFETTI
// ============================================================================

export function useConfetti() {
  const [trigger, setTrigger] = React.useState(false);

  const triggerConfetti = (
    type: ConfettiExplosionProps['type'] = 'success',
    intensity: ConfettiExplosionProps['intensity'] = 'medium'
  ) => {
    setTrigger(true);
    
    // Reset trigger após um frame
    requestAnimationFrame(() => {
      setTrigger(false);
    });
  };

  const ConfettiComponent = (props: Omit<ConfettiExplosionProps, 'trigger'>) => (
    <ConfettiExplosion {...props} trigger={trigger} />
  );

  return {
    triggerConfetti,
    ConfettiComponent
  };
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

export const confettiUtils = {
  // Explosão simples
  burst: (options?: Partial<ConfettiExplosionProps>) => {
    const config = {
      particleCount: 50,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#007AFF', '#34C759', '#FF9500'],
      ...options
    };
    
    confetti(config);
  },

  // Explosão em sequência
  sequence: (count: number = 3, delay: number = 200) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { 
            x: Math.random(),
            y: 0.6 
          },
          colors: ['#007AFF', '#34C759', '#FF9500', '#EC4899']
        });
      }, i * delay);
    }
  },

  // Explosão em forma de coração
  heart: () => {
    const heart = (x: number, y: number) => {
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { x, y },
        colors: ['#EC4899', '#F472B6', '#FBBF24'],
        shapes: ['circle']
      });
    };

    // Desenhar coração
    heart(0.3, 0.4);
    heart(0.7, 0.4);
    heart(0.5, 0.6);
  },

  // Explosão de celebração
  celebration: () => {
    // Explosão central
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE']
    });

    // Explosões laterais
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#F59E0B', '#F97316', '#EF4444']
      });
    }, 300);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#10B981', '#34C759', '#22C55E']
      });
    }, 600);
  }
};
