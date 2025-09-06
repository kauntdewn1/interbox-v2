// ============================================================================
// OTIMIZAÇÃO DE IMAGENS - INTERBØX V2
// ============================================================================

/**
 * Carregar imagem de forma otimizada
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy loading para imagens com Intersection Observer
 */
export function setupLazyLoading() {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    { 
      rootMargin: '50px 0px',
      threshold: 0.01 
    }
  );

  // Observar todas as imagens lazy
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Preload de imagens críticas (sempre necessárias)
 */
export function preloadCriticalImages() {
  const criticalImages = [
    '/logos/oficial_logo.png',
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
 * Preload de imagens de gamificação (apenas quando necessário)
 */
export function preloadGamificationImages() {
  const gamificationImages = [
    '/images/levels/cindy.webp',
    '/images/levels/helen.webp',
    '/images/levels/fran.webp',
    '/images/levels/annie.webp',
    '/images/levels/murph.webp',
    '/images/levels/matt.webp',
  ];

  gamificationImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Otimizar imagens existentes
 */
export function optimizeExistingImages() {
  const images = document.querySelectorAll('img');
  
  images.forEach((img) => {
    // Adicionar loading="lazy" se não tiver
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Adicionar decoding="async" para melhor performance
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

/**
 * Substituir document.write() por métodos modernos
 */
export function replaceDocumentWrite() {
  // Interceptar document.write se necessário
  const originalWrite = document.write;
  
  document.write = function(content: string) {
    console.warn('document.write() is deprecated. Use modern DOM methods instead.');
    
    // Criar elemento temporário
    const temp = document.createElement('div');
    temp.innerHTML = content;
    
    // Adicionar ao DOM de forma otimizada
    requestAnimationFrame(() => {
      document.body.appendChild(temp);
    });
  };
}

/**
 * Inicializar otimizações de imagem
 */
export function initImageOptimizations() {
  // Preload imagens críticas
  preloadCriticalImages();
  
  // Configurar lazy loading
  if ('IntersectionObserver' in window) {
    setupLazyLoading();
  }
  
  // Otimizar imagens existentes
  optimizeExistingImages();
  
  // Substituir document.write
  replaceDocumentWrite();
}
