// ============================================================================
// HOOK DE MÉTRICAS DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================
// Este hook fornece acesso às métricas de gamificação para dashboards
// e relatórios administrativos.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { 
  getGamificationMetrics, 
  getBasicGamificationMetrics,
  type GamificationMetrics 
} from '../lib/gamification-core';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useGamificationMetrics() {
  const [metrics, setMetrics] = useState<GamificationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async (forceRefresh: boolean = false) => {
    if (loading && !forceRefresh) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await getGamificationMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar métricas';
      setError(errorMessage);
      console.error('Erro ao carregar métricas de gamificação:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const refreshMetrics = useCallback(() => {
    fetchMetrics(true);
  }, [fetchMetrics]);

  // Carregar métricas automaticamente
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refreshMetrics,
    fetchMetrics
  };
}

// ============================================================================
// HOOK DE MÉTRICAS BÁSICAS
// ============================================================================

export function useBasicGamificationMetrics() {
  const [basicMetrics, setBasicMetrics] = useState<{
    totalUsers: number;
    totalTokens: number;
    averageTokens: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBasicMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBasicGamificationMetrics();
      setBasicMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar métricas básicas';
      setError(errorMessage);
      console.error('Erro ao carregar métricas básicas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBasicMetrics();
  }, [fetchBasicMetrics]);

  return {
    basicMetrics,
    loading,
    error,
    refresh: fetchBasicMetrics
  };
}

// ============================================================================
// HOOK DE MÉTRICAS EM TEMPO REAL
// ============================================================================

export function useRealtimeGamificationMetrics(intervalMs: number = 30000) {
  const { metrics, loading, error, refreshMetrics } = useGamificationMetrics();
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      refreshMetrics();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isAutoRefresh, intervalMs, refreshMetrics]);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev);
  }, []);

  return {
    metrics,
    loading,
    error,
    isAutoRefresh,
    toggleAutoRefresh,
    refresh: refreshMetrics
  };
}

// ============================================================================
// HOOK DE MÉTRICAS POR PERÍODO
// ============================================================================

export function useGamificationMetricsByPeriod(period: 'day' | 'week' | 'month' | 'year') {
  const [periodMetrics, setPeriodMetrics] = useState<GamificationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por enquanto, retorna as métricas completas
      // Em uma implementação futura, poderia filtrar por período
      const data = await getGamificationMetrics();
      setPeriodMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar métricas do período';
      setError(errorMessage);
      console.error('Erro ao carregar métricas do período:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPeriodMetrics();
  }, [fetchPeriodMetrics]);

  return {
    periodMetrics,
    loading,
    error,
    refresh: fetchPeriodMetrics,
    period
  };
}
