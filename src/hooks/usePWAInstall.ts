import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  canInstall: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  hasShown: boolean;
}

interface PWAInstallActions {
  install: () => Promise<boolean>;
  triggerBanner: (trigger: 'login' | 'achievement' | 'manual') => void;
  hideBanner: () => void;
  remindLater: () => void;
}

export function usePWAInstall(): PWAInstallState & PWAInstallActions {
  const [state, setState] = useState<PWAInstallState>({
    canInstall: false,
    isIOS: false,
    isInstalled: false,
    deferredPrompt: null,
    hasShown: false
  });



  // 🆕 DETECTAR PLATAFORMA E CAPACIDADES
  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = isStandalone || (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Verificar se já foi mostrado
    const hasShown = localStorage.getItem('interbox_pwa_banner_shown') === 'true';

    setState(prev => ({
      ...prev,
      isIOS: iOS,
      isInstalled,
      hasShown
    }));

    // Detectar beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e as BeforeInstallPromptEvent
      }));
    };

    // Detectar instalação bem-sucedida
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        canInstall: false,
        deferredPrompt: null,
        isInstalled: true,
        hasShown: true
      }));
      
      // Marcar como mostrado permanentemente
      localStorage.setItem('interbox_pwa_banner_shown', 'true');
      
      // 🎉 DAR RECOMPENSA APÓS INSTALAÇÃO
      giveUserBonusBox(10);
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 🆕 FUNÇÃO DE INSTALAÇÃO
  const install = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) return false;

    try {
      // Mostrar prompt nativo
      await state.deferredPrompt.prompt();
      
      // Aguardar escolha do usuário
      const { outcome } = await state.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Usuário aceitou instalação
        setState(prev => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null
        }));
        return true;
      } else {
        // Usuário recusou
        return false;
      }
    } catch (error) {
      console.error('Erro na instalação:', error);
      return false;
    }
  }, [state.deferredPrompt]);



  // 🆕 CONTROLE DO BANNER
  const triggerBanner = useCallback((trigger: 'login' | 'achievement' | 'manual') => {
    if (state.hasShown || state.isInstalled) return;

    // Verificar timing baseado no trigger
    const now = Date.now();
    const lastShown = localStorage.getItem('interbox_pwa_banner_last_shown');
    
    if (lastShown) {
      const timeSinceLastShown = now - parseInt(lastShown);
      const oneHour = 60 * 60 * 1000; // 1 hora
      
      if (timeSinceLastShown < oneHour) {
        return; // Não mostrar se foi exibido recentemente
      }
    }

    // Verificar se foi lembrado recentemente
    const reminderTime = localStorage.getItem('interbox_pwa_reminder');
    if (reminderTime) {
      const timeSinceReminder = now - parseInt(reminderTime);
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas
      
      if (timeSinceReminder < oneDay) {
        return; // Não mostrar se foi lembrado recentemente
      }
    }

    // 🚀 DISPARAR O BANNER!
    localStorage.setItem('interbox_pwa_banner_last_shown', now.toString());
    
    // Emitir evento customizado para o banner
    const event = new CustomEvent('pwa-install-trigger', { 
      detail: { trigger, timestamp: now } 
    });
    window.dispatchEvent(event);
  }, [state.hasShown, state.isInstalled]);

  const hideBanner = useCallback(() => {
    // Função para esconder banner
  }, []);

  const remindLater = useCallback(() => {
    localStorage.setItem('interbox_pwa_reminder', Date.now().toString());
  }, []);

  return {
    ...state,
    install,
    triggerBanner,
    hideBanner,
    remindLater
  };
}

// 🆕 FUNÇÃO PARA DAR RECOMPENSA $BOX
async function giveUserBonusBox(amount: number): Promise<void> {
  try {
    // Aqui você implementaria a lógica para dar $BOX ao usuário
    // Por exemplo, chamando uma Cloud Function ou atualizando o Firestore
    
    console.log(`🎉 Usuário ganhou +${amount} $BOX por instalar o PWA!`);
    
    // Exemplo de implementação:
    // await awardTokens('pwa_installation', amount);
    
    // Mostrar feedback visual
    // showFeedback(`🎉 +${amount} $BOX desbloqueados!`, 'success');
    
  } catch (error) {
    console.error('Erro ao dar recompensa $BOX:', error);
  }
}

    // 🆕 HOOK PARA TRIGGER EM EVENTOS ESPECÍFICOS
  export function usePWAInstallTrigger() {
    const pwaInstall = usePWAInstall();
  
    const triggerOnLogin = useCallback(() => {
      pwaInstall.triggerBanner('login');
    }, [pwaInstall]);
  
    const triggerOnAchievement = useCallback(() => {
      pwaInstall.triggerBanner('achievement');
    }, [pwaInstall]);
  
    const triggerManual = useCallback(() => {
      pwaInstall.triggerBanner('manual');
    }, [pwaInstall]);
  
    return {
      ...pwaInstall,
      triggerOnLogin,
      triggerOnAchievement,
      triggerManual
    };
  }
