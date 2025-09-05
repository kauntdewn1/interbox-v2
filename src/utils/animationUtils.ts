// ============================================================================
// UTILITÁRIOS DE ANIMAÇÃO - FRAMER MOTION
// ============================================================================

import { AnimationProps } from 'framer-motion';

// Configurações de animação seguras (evitam problemas de performance)
export const safeOpacityAnimation = (
  enabled: boolean = true,
  y: number = 0
): Partial<AnimationProps> => {
  if (!enabled) return {};
  
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };
};

export const safeSlideAnimation = (
  enabled: boolean = true,
  x: number = 0,
  delay: number = 0
): Partial<AnimationProps> => {
  if (!enabled) return {};
  
  return {
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      delay 
    }
  };
};

export const safeScaleAnimation = (
  enabled: boolean = true,
  scale: number = 0.8,
  delay: number = 0
): Partial<AnimationProps> => {
  if (!enabled) return {};
  
  return {
    initial: { opacity: 0, scale },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      delay 
    }
  };
};

export const safeRotateAnimation = (
  enabled: boolean = true,
  rotate: number = -180,
  delay: number = 0
): Partial<AnimationProps> => {
  if (!enabled) return {};
  
  return {
    initial: { opacity: 0, rotate },
    animate: { opacity: 1, rotate: 0 },
    transition: { 
      duration: 0.7, 
      ease: "easeOut",
      delay 
    }
  };
};

// Animações de entrada em sequência
export const staggerContainer = (
  staggerChildren: number = 0.1,
  delayChildren: number = 0
) => ({
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerItem = (
  y: number = 20,
  duration: number = 0.6
) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, ease: "easeOut" },
});

// Animações de hover
export const hoverScale = (scale: number = 1.05) => ({
  whileHover: { scale },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2, ease: "easeInOut" },
});

export const hoverLift = (y: number = -5) => ({
  whileHover: { y },
  whileTap: { y: 0 },
  transition: { duration: 0.2, ease: "easeInOut" },
});

export const hoverGlow = (color: string = "#ec4899") => ({
  whileHover: {
    boxShadow: `0 0 20px ${color}40`,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
});

// Animações de loading
export const loadingPulse = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const loadingSpin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const loadingBounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Animações de página
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export const pageSlideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Animações de modal
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: "easeInOut" },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Animações de lista
export const listContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Animações de card
export const cardHover = {
  whileHover: {
    y: -5,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  whileTap: { y: 0 },
};

export const cardTap = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1, ease: "easeInOut" },
};

// Animações de texto
export const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const textTypewriter = (delay: number = 0) => ({
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 1, delay, ease: "easeInOut" },
});

// Animações de botão
export const buttonHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2, ease: "easeInOut" },
};

export const buttonPulse = {
  whileHover: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Animações de ícone
export const iconSpin = {
  whileHover: {
    rotate: 360,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export const iconBounce = {
  whileHover: {
    y: [-2, 2, -2],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

// Animações de progresso
export const progressBar = (progress: number) => ({
  initial: { width: 0 },
  animate: { width: `${progress}%` },
  transition: { duration: 1, ease: "easeOut" },
});

// Animações de contador
export const counterAnimation = () => ({
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
});

// Animações de confete
export const confettiAnimation = {
  initial: { opacity: 0, scale: 0, rotate: 0 },
  animate: { 
    opacity: [0, 1, 0], 
    scale: [0, 1, 0.8], 
    rotate: [0, 180, 360],
    y: [0, -100, -200],
  },
  transition: { 
    duration: 2, 
    ease: "easeOut",
    times: [0, 0.3, 1],
  },
};

// Animações responsivas
export const responsiveAnimation = (mobile: Record<string, unknown>, desktop: Record<string, unknown>) => {
  const isMobile = window.innerWidth < 768;
  return isMobile ? mobile : desktop;
};

// Animações condicionais
export const conditionalAnimation = (
  condition: boolean,
  enabled: Record<string, unknown>,
  disabled: Record<string, unknown> = {}
) => {
  return condition ? enabled : disabled;
};

// Animações de scroll
export const scrollAnimation = (threshold: number = 0.1) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, threshold },
  transition: { duration: 0.6, ease: "easeOut" },
});

// Animações de entrada
export const entranceAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };
};
