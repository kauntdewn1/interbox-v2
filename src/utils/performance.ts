// ============================================================================
// OTIMIZAÇÕES DE PERFORMANCE - INTERBØX V2
// ============================================================================

/**
 * Debounce function para evitar execuções excessivas
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function para limitar execuções por tempo
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * RequestAnimationFrame wrapper para animações suaves
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  };
}

/**
 * Otimizar scroll events
 */
export function optimizeScroll(callback: () => void) {
  return rafThrottle(throttle(callback, 16)); // ~60fps
}

/**
 * Otimizar resize events
 */
export function optimizeResize(callback: () => void) {
  return debounce(callback, 250);
}

/**
 * Lazy loading para imagens
 */
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  observer.observe(img);
}

/**
 * Preload de recursos críticos
 */
export function preloadCriticalResources() {
  const criticalImages = [
    '/logos/oficial_logo.png',
    '/images/default-avatar.png',
    '/images/levels/cindy.webp',
    '/images/levels/helen.webp',
    '/images/levels/fran.webp',
    '/images/levels/annie.webp',
    '/images/levels/murph.webp',
    '/images/levels/matt.webp',
  ];

  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Otimizar DOM queries
 */
export function optimizeDOMQueries() {
  // Cache de elementos frequentemente acessados
  const cache = new Map<string, HTMLElement>();
  
  return (selector: string): HTMLElement | null => {
    if (cache.has(selector)) {
      return cache.get(selector) || null;
    }
    
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      cache.set(selector, element);
    }
    
    return element;
  };
}

/**
 * Batch DOM updates para reduzir reflows
 */
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Otimizar event listeners
 */
export function optimizeEventListeners() {
  // Usar event delegation para melhor performance
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    // Delegar eventos específicos
    if (target.matches('[data-action="toggle"]')) {
      // Handle toggle actions
    }
    
    if (target.matches('[data-action="submit"]')) {
      // Handle submit actions
    }
  }, { passive: true });
}

/**
 * Inicializar otimizações de performance
 */
export function initPerformanceOptimizations() {
  // Preload recursos críticos
  preloadCriticalResources();
  
  // Otimizar event listeners
  optimizeEventListeners();
  
  // Configurar lazy loading para imagens
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => {
      lazyLoadImage(img as HTMLImageElement, img.getAttribute('data-src') || '');
    });
  });
  
  // Inicializar otimizações de imagem
  import('./imageOptimization').then(({ initImageOptimizations }) => {
    initImageOptimizations();
  });
}
