// ============================================================================
// COOKIE BANNER - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useSupabase';

// ============================================================================
// TIPOS
// ============================================================================

interface CookieBannerProps {
  className?: string;
  onAccept?: (preferences: CookiePreferences) => void;
  onReject?: () => void;
  showAdvanced?: boolean;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const COOKIE_TYPES = {
  necessary: {
    name: 'Cookies Necessários',
    description: 'Essenciais para o funcionamento básico do site',
    required: true,
    examples: ['Autenticação', 'Preferências de idioma', 'Segurança']
  },
  analytics: {
    name: 'Cookies de Analytics',
    description: 'Nos ajudam a entender como você usa o site',
    required: false,
    examples: ['Google Analytics', 'Métricas de uso', 'Performance']
  },
  marketing: {
    name: 'Cookies de Marketing',
    description: 'Usados para personalizar anúncios e conteúdo',
    required: false,
    examples: ['Anúncios personalizados', 'Redes sociais', 'Remarketing']
  },
  personalization: {
    name: 'Cookies de Personalização',
    description: 'Lembram suas preferências e configurações',
    required: false,
    examples: ['Tema preferido', 'Configurações de gamificação', 'Preferências de notificação']
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CookieBanner({ 
  className = '',
  onAccept,
  onReject,
  showAdvanced = true
}: CookieBannerProps) {
  const { trackEvent } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre necessário
    analytics: false,
    marketing: false,
    personalization: false
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };

    saveCookiePreferences(allAccepted);
    trackEvent('cookie_consent', { action: 'accept_all', preferences: allAccepted });
    
    if (onAccept) {
      onAccept(allAccepted);
    }
    
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };

    saveCookiePreferences(onlyNecessary);
    trackEvent('cookie_consent', { action: 'reject_all', preferences: onlyNecessary });
    
    if (onReject) {
      onReject();
    }
    
    setIsVisible(false);
  };

  const handleCustomAccept = () => {
    saveCookiePreferences(preferences);
    trackEvent('cookie_consent', { action: 'custom_accept', preferences });
    
    if (onAccept) {
      onAccept(preferences);
    }
    
    setIsVisible(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Não pode ser alterado
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const openPrivacyPolicy = () => {
    // Abrir política de privacidade em nova aba
    window.open('/politica-privacidade', '_blank');
  };

  const openCookiePolicy = () => {
    // Abrir política de cookies em nova aba
    window.open('/politica-cookies', '_blank');
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      >
        <div className="bg-gray-900 border-t border-gray-700 p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            {!showAdvancedOptions ? (
              // Banner Simples
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    🍪 Usamos cookies para melhorar sua experiência
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Utilizamos cookies para personalizar conteúdo, analisar tráfego e melhorar nossos serviços. 
                    Ao continuar navegando, você concorda com nossa{' '}
                    <button
                      onClick={openPrivacyPolicy}
                      className="text-pink-400 hover:text-pink-300 underline"
                    >
                      Política de Privacidade
                    </button>
                    {' '}e{' '}
                    <button
                      onClick={openCookiePolicy}
                      className="text-pink-400 hover:text-pink-300 underline"
                    >
                      Política de Cookies
                    </button>
                    .
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {showAdvanced && (
                    <button
                      onClick={() => setShowAdvancedOptions(true)}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                    >
                      Personalizar
                    </button>
                  )}
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    Aceitar Todos
                  </button>
                </div>
              </div>
            ) : (
              // Opções Avançadas
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Configurações de Cookies
                  </h3>
                  <button
                    onClick={() => setShowAdvancedOptions(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(COOKIE_TYPES).map(([key, config]) => (
                    <div key={key} className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          id={key}
                          checked={preferences[key as keyof CookiePreferences]}
                          onChange={(e) => handlePreferenceChange(key as keyof CookiePreferences, e.target.checked)}
                          disabled={key === 'necessary'}
                          className="w-4 h-4 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={key} className="block">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">
                              {config.name}
                            </span>
                            {config.required && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                Obrigatório
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {config.description}
                          </p>
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-1">Exemplos:</p>
                            <div className="flex flex-wrap gap-1">
                              {config.examples.map((example, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                                >
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                  >
                    Rejeitar Todos
                  </button>
                  <button
                    onClick={handleCustomAccept}
                    className="px-4 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    Salvar Preferências
                  </button>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  <p>
                    Você pode alterar suas preferências a qualquer momento nas configurações do seu navegador.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// HOOK PARA USAR COOKIE BANNER
// ============================================================================

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      try {
        setPreferences(JSON.parse(cookieConsent));
      } catch (error) {
        console.error('Erro ao carregar preferências de cookies:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const hasConsent = (type: keyof CookiePreferences): boolean => {
    return preferences?.[type] ?? false;
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  };

  const clearConsent = () => {
    setPreferences(null);
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
  };

  return {
    preferences,
    isLoaded,
    hasConsent,
    updatePreferences,
    clearConsent
  };
}
