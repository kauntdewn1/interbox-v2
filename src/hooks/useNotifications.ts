import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';

interface NotificationState {
  hasNotifications: boolean;
  notificationCount: number;
  notifications: Array<{
    id: string;
    type: 'level_up' | 'achievement' | 'system';
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

export function useNotifications(): NotificationState & {
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
} {
  const { user } = useAuth();

  const [notificationState, setNotificationState] = useState<NotificationState>({
    hasNotifications: false,
    notificationCount: 0,
    notifications: []
  });

  // 🎯 Verifica e simula notificações (placeholder)
  const checkNotifications = useCallback((): void => {
    if (!user?.id) return;

    const notifications: NotificationState['notifications'] = [];

    // TODO: Implementar sistema de notificações real quando gamificação estiver pronta
    // Por enquanto, mantém como placeholder

    const hasNotifications = notifications.length > 0;

    setNotificationState({
      hasNotifications,
      notificationCount: notifications.length,
      notifications
    });
  }, [user?.id]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  const clearNotifications = useCallback((): void => {
    setNotificationState(prev => ({
      ...prev,
      hasNotifications: false,
      notificationCount: 0,
      notifications: []
    }));
  }, []);

  const markAsRead = useCallback((id: string): void => {
    setNotificationState(prev => {
      const updated = prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        ...prev,
        notifications: updated,
        hasNotifications: updated.some(n => !n.read),
        notificationCount: updated.filter(n => !n.read).length
      };
    });
  }, []);

  return {
    ...notificationState,
    clearNotifications,
    markAsRead
  };
}
