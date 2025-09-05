import React from 'react';

interface LoadingScreenProps {
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
  borderOpacity?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Preparando a sala...', 
  variant = 'fullscreen',
  size = 'md',
  showLogo = true,
  borderOpacity
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24'
  };

  const containerClasses = {
    fullscreen: 'fixed inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center z-50',
    inline: 'flex items-center justify-center p-4',
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'
  };

  const spinnerClasses = {
    sm: 'border-t-2 border-b-2',
    md: 'border-t-4 border-b-4',
    lg: 'border-t-6 border-b-6'
  };

  return (
    <div className={containerClasses[variant]}>
      <div className="flex flex-col items-center space-y-6 text-center">
        
        {/* Logo INTERBØX animado */}
        {showLogo && (
          <div className="animate-pulse flex justify-center">
            <img
              src="/logos/nome_hrz.png"
              alt="INTERBØX"
              className="w-32 md:w-40 h-auto opacity-90 object-contain"
            />
          </div>
        )}

        {/* Spinner personalizado INTERBØX */}
        <div className="relative">
          {/* Spinner principal */}
          <div
            className={`${sizeClasses[size]} ${spinnerClasses[size]} animate-spin rounded-full border-pink-500 ${typeof borderOpacity === 'number' ? `border-opacity-${Math.floor(borderOpacity * 100)}` : 'border-opacity-30'}`}
          />
          
          {/* Spinner secundário (rotação reversa) */}
          <div
            className={`${sizeClasses[size]} ${spinnerClasses[size]} animate-spin animate-reverse rounded-full border-blue-500 border-opacity-30 absolute inset-0`}
            style={{ animationDirection: 'reverse' }}
          />
          
          {/* Glow interno */}
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 blur-sm absolute inset-0 animate-pulse`} />
          
          {/* Logo oficial no centro do círculo */}
          <div className={`${sizeClasses[size]} absolute inset-0 flex items-center justify-center`}>
            <img
              src="/logos/oficial_logo.png"
              alt="INTERBØX Logo Oficial"
              className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} object-contain opacity-90 animate-pulse`}
            />
          </div>
        </div>

        {/* Mensagem */}
        <div className="text-white/90">
          <p className="text-lg md:text-xl font-semibold mb-2">{message}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full loading-dot" />
            <div className="w-2 h-2 bg-blue-500 rounded-full loading-dot" />
            <div className="w-2 h-2 bg-pink-500 rounded-full loading-dot" />
          </div>
        </div>

        {/* Texto da marca */}
        <div className="text-white/60 text-sm">
          <p className="font-mono">CERRADO INTERBØX 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

// CSS para animação dos dots de loading
const loadingDotStyles = `
  .loading-dot {
    animation: loading-dot 1.4s infinite ease-in-out both;
  }
  
  .loading-dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .loading-dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes loading-dot {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Injetar CSS no head do documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = loadingDotStyles;
  document.head.appendChild(style);
}