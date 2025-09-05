import { useEffect, useRef } from 'react';
import { preloadGamificationImages } from '../utils/imageOptimization';

/**
 * Hook para preload de imagens de gamificação apenas quando necessário
 * Evita warnings de preload não utilizado para usuários não logados
 */
export function useGamificationPreload(shouldPreload: boolean = false) {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (shouldPreload && !hasPreloaded.current) {
      preloadGamificationImages();
      hasPreloaded.current = true;
    }
  }, [shouldPreload]);

  return { hasPreloaded: hasPreloaded.current };
}
