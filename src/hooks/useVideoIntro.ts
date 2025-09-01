import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

interface VideoIntroState {
  shouldShow: boolean;
  isVisible: boolean;
  lastVideoDate: string | null;
  hasSeenVideoToday: boolean;
  willShow: boolean;
}

export function useVideoIntro(): VideoIntroState & {
  markVideoAsSeen: () => void;
  hideVideo: () => void;
} {
  const { user } = useAuth();
  const [state, setState] = useState<VideoIntroState>({
    shouldShow: false,
    isVisible: false,
    lastVideoDate: null,
    hasSeenVideoToday: false,
    willShow: false
  });

  const checkVideoIntroStatus = useCallback(() => {
    const today = new Date().toDateString();
    const lastVideoDate = localStorage.getItem('interbox_video_intro_date');
    const userId = user?.id || 'anonymous';
    const userLastVideoDate = localStorage.getItem(`interbox_video_intro_${userId}`);

    // Verificar se é primeiro acesso
    const isFirstVisit = !localStorage.getItem('interbox_first_visit');
    
    // Verificar se viu o vídeo hoje
    const hasSeenVideoToday = lastVideoDate === today;
    
    // Verificar se viu o vídeo nos últimos 3 dias
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const hasSeenVideoRecently = lastVideoDate && new Date(lastVideoDate) >= threeDaysAgo;
    
    // Lógica para mostrar o vídeo
    let shouldShow = false;
    
    if (isFirstVisit) {
      // Primeiro acesso - sempre mostrar
      shouldShow = true;
      localStorage.setItem('interbox_first_visit', today);
    } else if (!hasSeenVideoToday && !hasSeenVideoRecently) {
      // Não viu hoje e não viu nos últimos 3 dias
      shouldShow = true;
    }

    // Verificar se usuário específico viu o vídeo hoje
    const userHasSeenVideoToday = userLastVideoDate === today;

    setState({
      shouldShow,
      isVisible: shouldShow,
      lastVideoDate,
      hasSeenVideoToday: userHasSeenVideoToday,
      willShow: shouldShow && !userHasSeenVideoToday
    });
  }, [user]);

  useEffect(() => {
    checkVideoIntroStatus();
  }, [checkVideoIntroStatus]);

  const markVideoAsSeen = () => {
    const today = new Date().toDateString();
    const userId = user?.id || 'anonymous';
    
    // Marcar data global
    localStorage.setItem('interbox_video_intro_date', today);
    
    // Marcar data para usuário específico
    localStorage.setItem(`interbox_video_intro_${userId}`, today);
    
    setState(prev => ({
      ...prev,
      shouldShow: false,
      isVisible: false,
      hasSeenVideoToday: true,
      willShow: false
    }));
  };

  const hideVideo = () => {
    setState(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    ...state,
    markVideoAsSeen,
    hideVideo
  };
}
