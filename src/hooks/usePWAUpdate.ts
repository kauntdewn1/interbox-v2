import { useState, useEffect, useCallback } from 'react';
import { BUILD_INFO } from '@/config/version';

interface PWAUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  newVersion: string;
  buildDate: string;
  isChecking: boolean;
  isUpdating: boolean;
}

export function usePWAUpdate(): PWAUpdateInfo & {
  checkUpdate: () => Promise<void>;
  applyUpdate: () => void;
  dismissUpdate: () => void;
} {
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo>({
    hasUpdate: false,
    currentVersion: '',
    newVersion: BUILD_INFO.version,
    buildDate: BUILD_INFO.buildDate,
    isChecking: false,
    isUpdating: false
  });

  // Verificar se há atualizações disponíveis
  const checkUpdate = useCallback(async () => {
    setUpdateInfo(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Em desenvolvimento, não verificar atualizações para evitar erros de CORS
      if (import.meta.env.DEV) {
        console.log('🔧 Modo desenvolvimento: pulando verificação de atualizações');
        setUpdateInfo(prev => ({ ...prev, isChecking: false }));
        return;
      }
      
      // Verificar atualizações no servidor
      const response = await fetch(
        `https://us-central1-interbox-app-8d400.cloudfunctions.net/healthCheck?version=${BUILD_INFO.version}&buildId=${BUILD_INFO.buildId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Erro ao verificar atualizações');
      
      const data = await response.json();
      
      if (data.hasUpdate) {
        // Verificar se há nova versão do Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          
          if (registration && registration.waiting) {
            setUpdateInfo(prev => ({
              ...prev,
              hasUpdate: true,
              currentVersion: BUILD_INFO.version,
              newVersion: data.serverVersion,
              buildDate: data.buildDate,
              isChecking: false
            }));
            return;
          }
        }
        
        // Atualização detectada via servidor
        setUpdateInfo(prev => ({
          ...prev,
          hasUpdate: true,
          currentVersion: BUILD_INFO.version,
          newVersion: data.serverVersion,
          buildDate: data.buildDate,
          isChecking: false
        }));
      } else {
        setUpdateInfo(prev => ({
          ...prev,
          hasUpdate: false,
          currentVersion: BUILD_INFO.version,
          isChecking: false
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      setUpdateInfo(prev => ({ ...prev, isChecking: false }));
    }
  }, []);

  // Aplicar atualização
  const applyUpdate = useCallback(() => {
    setUpdateInfo(prev => ({ ...prev, isUpdating: true }));
    
    try {
      // Atualizar Service Worker se disponível
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            window.location.reload();
          }
        });
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao aplicar atualização:', error);
      setUpdateInfo(prev => ({ ...prev, isUpdating: false }));
    }
  }, []);

  // Ignorar atualização
  const dismissUpdate = useCallback(() => {
    setUpdateInfo(prev => ({ ...prev, hasUpdate: false }));
    localStorage.setItem('interbox_update_dismissed', Date.now().toString());
  }, []);

  // Verificar atualizações ao montar o componente
  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  return {
    ...updateInfo,
    checkUpdate,
    applyUpdate,
    dismissUpdate
  };
}

// Hook para verificar atualizações do Service Worker
export function useServiceWorkerUpdate() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleUpdateFound = () => {
        setSwUpdateAvailable(true);
      };

      const handleControllerChange = () => {
        setSwUpdateAvailable(false);
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound);
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return swUpdateAvailable;
}

// Hook para verificar periodicamente por atualizações
export function usePeriodicUpdateCheck(intervalMs: number = 5 * 60 * 1000) {
  const { checkUpdate } = usePWAUpdate();

  useEffect(() => {
    const interval = setInterval(() => {
      checkUpdate();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [checkUpdate, intervalMs]);
}