import { useState, useEffect } from 'react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  deferredPrompt: any;
  showInstallPrompt: boolean;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isStandalone: false,
    deferredPrompt: null,
    showInstallPrompt: false
  });

  useEffect(() => {
    // Verificar se já está instalado
    const isInStandaloneMode = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true;

    setState(prev => ({
      ...prev,
      isStandalone: isInStandaloneMode(),
      isInstalled: isInStandaloneMode()
    }));

    // Detectar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
        showInstallPrompt: true
      }));
    };

    // Detectar instalação
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
        showInstallPrompt: false
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!state.deferredPrompt) return;

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
      } else {
        console.log('Usuário recusou a instalação');
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const hideInstallPrompt = () => {
    setState(prev => ({
      ...prev,
      showInstallPrompt: false
    }));
  };

  return {
    ...state,
    installApp,
    hideInstallPrompt
  };
}
