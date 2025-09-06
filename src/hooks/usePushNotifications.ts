// ============================================================================
// HOOK: USE PUSH NOTIFICATIONS - INTERBØX V2
// ============================================================================
// Hook para gerenciar push notifications no frontend
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  action_url?: string;
  tag?: string;
  data?: any;
}

export function usePushNotifications() {
  const { user } = useUser();
  
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null
  });

  // Verificar suporte e permissões
  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Push notifications não são suportadas neste navegador'
        }));
        return;
      }

      const permission = Notification.permission;
      setState(prev => ({
        ...prev,
        isSupported: true,
        permission
      }));

      // Verificar se já está inscrito
      if (permission === 'granted') {
        await checkSubscriptionStatus();
      }
    };

    checkSupport();
  }, []);

  // Verificar status da inscrição
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription
      }));
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao verificar status da inscrição'
      }));
    }
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications não são suportadas'
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }));

      if (permission === 'granted') {
        await checkSubscriptionStatus();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: 'Permissão negada para push notifications'
        }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao solicitar permissão'
      }));
      return false;
    }
  }, [state.isSupported, checkSubscriptionStatus]);

  // Inscrever para push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já está inscrito
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          isLoading: false
        }));
        return true;
      }

      // Obter VAPID public key do servidor
      const response = await fetch('/api/get-vapid-public-key');
      const { publicKey } = await response.json();

      if (!publicKey) {
        throw new Error('VAPID public key não encontrada');
      }

      // Converter para Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Criar inscrição
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      // Salvar no Supabase
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const { error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user?.id,
          device_token: subscription.endpoint,
          platform: 'web',
          user_agent: navigator.userAgent,
          is_active: true,
          last_seen: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving subscription:', error);
        throw new Error('Erro ao salvar inscrição');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao inscrever para push notifications'
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission, user?.id]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remover do Supabase
      if (user?.id) {
        await supabase
          .from('user_devices')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('platform', 'web');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao cancelar inscrição'
      }));
      return false;
    }
  }, [user?.id]);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
    try {
      const response = await fetch('/api/send-push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          target_type: 'specific',
          target_users: user?.id ? [user.id] : [],
          icon_url: payload.icon,
          image_url: payload.image,
          action_url: payload.action_url,
          priority: 'normal'
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [user?.id]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscriptionStatus
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Converter URL base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Converter ArrayBuffer para base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
