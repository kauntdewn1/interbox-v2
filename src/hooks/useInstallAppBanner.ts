import { useState, useCallback } from 'react';

export function useInstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerTrigger, setBannerTrigger] = useState<'login' | 'achievement' | 'manual'>('manual');

  const triggerBanner = useCallback((trigger: 'login' | 'achievement' | 'manual' = 'manual') => {
    setBannerTrigger(trigger);
    setShowBanner(true);
  }, []);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  return {
    showBanner,
    bannerTrigger,
    triggerBanner,
    hideBanner
  };
}