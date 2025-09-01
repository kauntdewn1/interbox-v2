import { useState } from 'react';

// Hook para usar feedback de gamificação
export function useGamificationFeedback(): {
  feedback: {
    message: string;
    type: 'success' | 'warning' | 'info' | 'achievement';
    isVisible: boolean;
  };
  showFeedback: (message: string, type?: 'success' | 'warning' | 'info' | 'achievement') => void;
  hideFeedback: () => void;
  showAchievement: (achievement: string) => void;
  showLevelUp: (newLevel: string) => void;
  showPointsEarned: (points: number, action: string) => void;
} {
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info' | 'achievement';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showFeedback = (message: string, type: 'success' | 'warning' | 'info' | 'achievement' = 'info') => {
    setFeedback({
      message,
      type,
      isVisible: true
    });
  };

  const hideFeedback = () => {
    setFeedback(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const showAchievement = (achievement: string) => {
    showFeedback(`🏆 Nova Conquista: ${achievement}!`, 'achievement');
  };

  const showLevelUp = (newLevel: string) => {
    showFeedback(`🚀 Nível Up! Você agora é ${newLevel}!`, 'success');
  };

  const showPointsEarned = (points: number, action: string) => {
    showFeedback(`+${points} $BOX por ${action}!`, 'success');
  };

  return {
    feedback,
    showFeedback,
    hideFeedback,
    showAchievement,
    showLevelUp,
    showPointsEarned
  };
}
