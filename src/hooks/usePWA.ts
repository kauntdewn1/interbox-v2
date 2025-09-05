import { useState, useEffect, useCallback } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
}

interface PWAHookReturn {
  isInstalled: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  showInstallPrompt: boolean;
  hideInstallPrompt: () => void;
  showSplash: boolean;
  hideSplash: () => void;
  showLoading: boolean;
  showOfflineIndicator: boolean;
  hideOfflineIndicator: () => void;
  deviceInfo: DeviceInfo;
  installApp: () => Promise<boolean>;
  trackEvent: (eventName: string, eventData?: Record<string, unknown>) => void;
}

export function usePWA(): PWAHookReturn {
  // Installation state
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  
  // UI state
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [showLoading] = useState<boolean>(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState<boolean>(false);
  
  // Device detection
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isChrome: false,
    isSafari: false,
    isFirefox: false,
    isEdge: false,
  });

  // Initialize device detection
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    
    const userAgent = navigator.userAgent.toLowerCase();
    setDeviceInfo({
      isMobile: /mobile|android|iphone|ipad|phone/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isChrome: /chrome/i.test(userAgent) && !/edge/i.test(userAgent),
      isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
      isFirefox: /firefox/i.test(userAgent),
      isEdge: /edge/i.test(userAgent),
    });
  }, []);

  // Check if app is in standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isInStandaloneMode = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(isInStandaloneMode());
    
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      // Não chamar preventDefault() aqui - vamos deixar o browser mostrar o banner
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Check if we should show the install prompt
      const lastPrompt = localStorage.getItem('pwa_install_reminder');
      if (!lastPrompt || Date.now() - parseInt(lastPrompt, 10) > 24 * 60 * 60 * 1000) {
        setShowInstallPrompt(true);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check if app is already installed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleAppInstalled = () => {
      console.log('PWA installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa_install_reminder', Date.now().toString());
    };
    
    const checkIfInstalled = () => {
      // Check if app is in standalone mode
      if (isStandalone) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    checkIfInstalled();
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOffline = () => {
      setShowOfflineIndicator(true);
    };
    
    const handleOnline = () => {
      setShowOfflineIndicator(false);
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Initial check
    setShowOfflineIndicator(!navigator.onLine);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Show splash screen on first load in standalone mode
  useEffect(() => {
    if (isStandalone) {
      const splashShown = sessionStorage.getItem('pwa_splash_shown');
      if (!splashShown) {
        setShowSplash(true);
        sessionStorage.setItem('pwa_splash_shown', 'true');
      }
    }
  }, [isStandalone]);

  // Function to hide install prompt
  const hideInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
  }, []);

  // Function to hide splash screen
  const hideSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Function to hide offline indicator
  const hideOfflineIndicator = useCallback(() => {
    setShowOfflineIndicator(false);
  }, []);

  // Function to install the app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return false;
    }
    
    try {
      // Show the install prompt
      (deferredPrompt as { prompt: () => void }).prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await (deferredPrompt as { userChoice: Promise<{ outcome: string }> }).userChoice;
      
      // Reset the deferred prompt variable
      setDeferredPrompt(null);
      
      // Check if user accepted
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Function to track PWA events
  const trackEvent = useCallback((eventName: string, eventData: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined') return;
    
    // Log event to console in development
    if (import.meta.env.DEV) {
      console.log(`PWA Event: ${eventName}`, eventData);
    }
    
    // Here you could send events to your analytics service
    // if (window.gtag) {
    //   window.gtag('event', eventName, {
    //     event_category: 'pwa',
    //     ...eventData
    //   });
    // }
  }, []);

  return {
    isInstalled,
    isInstallable,
    isStandalone,
    showInstallPrompt,
    hideInstallPrompt,
    showSplash,
    hideSplash,
    showLoading,
    showOfflineIndicator,
    hideOfflineIndicator,
    deviceInfo,
    installApp,
    trackEvent,
  };
}