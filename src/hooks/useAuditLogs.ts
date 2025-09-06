// ============================================================================
// HOOK PARA LOGS DE AUDITORIA - INTERBØX V2
// ============================================================================
// Hook para acessar logs de gamificação e auditoria de transações
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface GamificationLog {
  id: string;
  user_id: string;
  action: string;
  tokens_before: number;
  tokens_after: number;
  tokens_delta: number;
  level_before?: string;
  level_after?: string;
  source: string;
  origin?: string;
  metadata: Record<string, any>;
  status: 'success' | 'failed' | 'pending' | 'reverted';
  error_message?: string;
  created_at: string;
  expires_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
}

export interface TransactionAudit {
  id: string;
  transaction_id: string;
  user_id: string;
  action_type: 'create' | 'update' | 'delete' | 'revert';
  transaction_type: string;
  amount_before?: number;
  amount_after?: number;
  amount_delta?: number;
  description_before?: string;
  description_after?: string;
  metadata_before?: Record<string, any>;
  metadata_after?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'reverted';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  source: string;
  origin?: string;
  created_at: string;
  expires_at: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  approver_name?: string;
}

export interface AuditStatistics {
  date: string;
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  total_tokens_moved: number;
  unique_users: number;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useAuditLogs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // LOGS DE GAMIFICAÇÃO
  // ============================================================================

  const getGamificationLogs = useCallback(async (
    userId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GamificationLog[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('gamification_logs_with_user')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar logs';
      setError(errorMessage);
      console.error('Erro ao buscar logs de gamificação:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getGamificationLogsByAction = useCallback(async (
    action: string,
    limit: number = 50
  ): Promise<GamificationLog[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('gamification_logs_with_user')
        .select('*')
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar logs';
      setError(errorMessage);
      console.error('Erro ao buscar logs por ação:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // AUDITORIA DE TRANSAÇÕES
  // ============================================================================

  const getTransactionAudit = useCallback(async (
    userId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TransactionAudit[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transaction_audit_with_user')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar auditoria';
      setError(errorMessage);
      console.error('Erro ao buscar auditoria de transações:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactionAuditByStatus = useCallback(async (
    status: string,
    limit: number = 50
  ): Promise<TransactionAudit[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transaction_audit_with_user')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar auditoria';
      setError(errorMessage);
      console.error('Erro ao buscar auditoria por status:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // ESTATÍSTICAS DE AUDITORIA
  // ============================================================================

  const getAuditStatistics = useCallback(async (
    days: number = 30
  ): Promise<AuditStatistics[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('audit_statistics')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas de auditoria:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // VALIDAÇÃO DE AÇÕES
  // ============================================================================

  const validateAction = useCallback(async (action: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_valid_action', {
        action_name: action
      });

      if (error) {
        console.error('Erro ao validar ação:', error);
        return false;
      }

      return data || false;
    } catch (err) {
      console.error('Erro ao validar ação:', err);
      return false;
    }
  }, []);

  const validateSource = useCallback(async (source: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_valid_source', {
        source_name: source
      });

      if (error) {
        console.error('Erro ao validar origem:', error);
        return false;
      }

      return data || false;
    } catch (err) {
      console.error('Erro ao validar origem:', err);
      return false;
    }
  }, []);

  // ============================================================================
  // LIMPEZA DE LOGS
  // ============================================================================

  const cleanupExpiredLogs = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('cleanup_expired_logs');

      if (error) {
        throw new Error(error.message);
      }

      return data || 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar logs';
      setError(errorMessage);
      console.error('Erro ao limpar logs expirados:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estados
    loading,
    error,
    
    // Logs de Gamificação
    getGamificationLogs,
    getGamificationLogsByAction,
    
    // Auditoria de Transações
    getTransactionAudit,
    getTransactionAuditByStatus,
    
    // Estatísticas
    getAuditStatistics,
    
    // Validações
    validateAction,
    validateSource,
    
    // Limpeza
    cleanupExpiredLogs
  };
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

export function useGamificationLogs(userId?: string) {
  const [logs, setLogs] = useState<GamificationLog[]>([]);
  const { getGamificationLogs, loading, error } = useAuditLogs();

  useEffect(() => {
    if (userId) {
      getGamificationLogs(userId).then(setLogs);
    }
  }, [userId, getGamificationLogs]);

  return { logs, loading, error, refetch: () => getGamificationLogs(userId).then(setLogs) };
}

export function useTransactionAudit(userId?: string) {
  const [audit, setAudit] = useState<TransactionAudit[]>([]);
  const { getTransactionAudit, loading, error } = useAuditLogs();

  useEffect(() => {
    if (userId) {
      getTransactionAudit(userId).then(setAudit);
    }
  }, [userId, getTransactionAudit]);

  return { audit, loading, error, refetch: () => getTransactionAudit(userId).then(setAudit) };
}

export function useAuditStatistics(days: number = 30) {
  const [statistics, setStatistics] = useState<AuditStatistics[]>([]);
  const { getAuditStatistics, loading, error } = useAuditLogs();

  useEffect(() => {
    getAuditStatistics(days).then(setStatistics);
  }, [days, getAuditStatistics]);

  return { statistics, loading, error, refetch: () => getAuditStatistics(days).then(setStatistics) };
}
