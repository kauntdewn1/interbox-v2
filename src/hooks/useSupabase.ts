// ============================================================================
// HOOKS SUPABASE - INTERBØX V2
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  User, 
  UserInsert, 
  UserUpdate,
  UserGamification,
  UserGamificationUpdate,
  Transaction,
  TransactionInsert,
  Notification,
  NotificationInsert,
  UserRole,
  TransactionType
} from '../types/supabase';

// ============================================================================
// HOOK PARA USUÁRIOS
// ============================================================================

export function useUser(clerkId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [clerkId]);

  const updateUser = useCallback(async (updates: UserUpdate) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      throw err;
    }
  }, [clerkId]);

  const createUser = useCallback(async (userData: UserInsert) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (clerkId) {
      fetchUser();
    }
  }, [clerkId, fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateUser,
    createUser
  };
}

// ============================================================================
// HOOK PARA GAMIFICAÇÃO
// ============================================================================

export function useGamification(userId: string) {
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setGamification(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar gamificação');
      setGamification(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateGamification = useCallback(async (updates: UserGamificationUpdate) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('user_gamification')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setGamification(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar gamificação');
      throw err;
    }
  }, [userId]);

  const addTokens = useCallback(async (amount: number, type: TransactionType = 'earn', description?: string) => {
    try {
      setError(null);

      // Usar função do Supabase para adicionar tokens
      const { data, error } = await supabase.rpc('add_tokens', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description
      });

      if (error) throw error;

      // Atualizar dados locais
      await fetchGamification();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar tokens');
      throw err;
    }
  }, [userId, fetchGamification]);

  useEffect(() => {
    if (userId) {
      fetchGamification();
    }
  }, [userId, fetchGamification]);

  return {
    gamification,
    loading,
    error,
    refetch: fetchGamification,
    updateGamification,
    addTokens
  };
}

// ============================================================================
// HOOK PARA TRANSAÇÕES
// ============================================================================

export function useTransactions(userId: string, limit: number = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar transações');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  const addTransaction = useCallback(async (transaction: TransactionInsert) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      
      // Adicionar à lista local
      setTransactions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar transação');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction
  };
}

// ============================================================================
// HOOK PARA NOTIFICAÇÕES
// ============================================================================

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const notifications = data || [];
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar notificações');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar como lida');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar todas como lidas');
      throw err;
    }
  }, [userId]);

  const addNotification = useCallback(async (notification: NotificationInsert) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      
      // Adicionar à lista local
      setNotifications(prev => [data, ...prev]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar notificação');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  };
}

// ============================================================================
// HOOK PARA CRIAR USUÁRIO COM GAMIFICAÇÃO
// ============================================================================

export function useCreateUserWithGamification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (
    clerkId: string,
    email: string,
    displayName: string,
    role: UserRole = 'publico'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('create_user_with_gamification', {
        p_clerk_id: clerkId,
        p_email: email,
        p_display_name: displayName,
        p_role: role
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    loading,
    error
  };
}

// ============================================================================
// HOOK PARA ANALYTICS
// ============================================================================

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackEvent = useCallback(async (
    eventName: string,
    eventData: Record<string, any> = {},
    userId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: eventName,
          event_data: eventData,
          user_agent: navigator.userAgent,
          ip_address: null // Será preenchido pelo Supabase
        });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rastrear evento');
      console.error('Erro ao rastrear evento:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trackEvent,
    loading,
    error
  };
}
