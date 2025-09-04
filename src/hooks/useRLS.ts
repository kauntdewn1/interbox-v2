// ============================================================================
// HOOK RLS - INTERBØX V2
// ============================================================================
// Hook para gerenciar Row Level Security no frontend

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

// ============================================================================
// TIPOS
// ============================================================================

export interface RLSStatus {
  enabled: boolean;
  userAuthenticated: boolean;
  userRole?: string;
  permissions: {
    canReadOwn: boolean;
    canWriteOwn: boolean;
    canReadAll: boolean;
    canWriteAll: boolean;
  };
}

export interface RLSTestResult {
  test: string;
  passed: boolean;
  error?: string;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useRLS() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<RLSStatus>({
    enabled: false,
    userAuthenticated: false,
    permissions: {
      canReadOwn: false,
      canWriteOwn: false,
      canReadAll: false,
      canWriteAll: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const checkUserRole = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar role do usuário:', error);
        return null;
      }

      return data?.role || null;
    } catch (err) {
      console.error('Erro ao verificar role do usuário:', err);
      return null;
    }
  }, [user]);

  const checkPermissions = useCallback(async (userRole: string | null) => {
    const permissions = {
      canReadOwn: false,
      canWriteOwn: false,
      canReadAll: false,
      canWriteAll: false
    };

    if (!userRole) return permissions;

    // Permissões básicas para usuários autenticados
    permissions.canReadOwn = true;
    permissions.canWriteOwn = true;

    // Permissões especiais para staff
    const staffRoles = ['admin', 'dev', 'marketing', 'staff'];
    if (staffRoles.includes(userRole)) {
      permissions.canReadAll = true;
      permissions.canWriteAll = true;
    }

    return permissions;
  }, []);

  // ============================================================================
  // FUNÇÕES DE TESTE
  // ============================================================================

  const testRLSAccess = useCallback(async (): Promise<RLSTestResult[]> => {
    const tests: RLSTestResult[] = [];

    if (!user) {
      tests.push({
        test: 'Usuário autenticado',
        passed: false,
        error: 'Usuário não está autenticado'
      });
      return tests;
    }

    try {
      // Teste 1: Acesso aos próprios dados
      const { data: ownData, error: ownError } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('clerk_id', user.id)
        .single();

      tests.push({
        test: 'Acesso aos próprios dados',
        passed: !ownError && ownData !== null,
        error: ownError?.message
      });

      // Teste 2: Tentativa de acesso a dados de outros usuários
      const { data: otherData, error: otherError } = await supabase
        .from('users')
        .select('id, display_name')
        .neq('clerk_id', user.id)
        .limit(1);

      tests.push({
        test: 'Bloqueio de acesso a dados de outros',
        passed: otherError !== null || otherData === null,
        error: otherError?.message
      });

      // Teste 3: Acesso à gamificação própria
      if (ownData) {
        const { data: gamificationData, error: gamificationError } = await supabase
          .from('user_gamification')
          .select('user_id, box_tokens')
          .eq('user_id', ownData.id)
          .single();

        tests.push({
          test: 'Acesso à própria gamificação',
          passed: !gamificationError && gamificationData !== null,
          error: gamificationError?.message
        });
      }

    } catch (err) {
      tests.push({
        test: 'Teste geral de acesso',
        passed: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    return tests;
  }, [user]);

  // ============================================================================
  // FUNÇÕES DE VERIFICAÇÃO
  // ============================================================================

  const checkRLSStatus = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const userRole = await checkUserRole();
      const permissions = await checkPermissions(userRole);
      const tests = await testRLSAccess();

      const allTestsPassed = tests.every(test => test.passed);

      setStatus({
        enabled: allTestsPassed,
        userAuthenticated: !!user,
        userRole: userRole || undefined,
        permissions
      });

      if (!allTestsPassed) {
        const failedTests = tests.filter(test => !test.passed);
        setError(`RLS não está funcionando: ${failedTests.map(t => t.test).join(', ')}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar RLS');
      setStatus(prev => ({
        ...prev,
        enabled: false,
        userAuthenticated: !!user
      }));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, checkUserRole, checkPermissions, testRLSAccess]);

  // ============================================================================
  // FUNÇÕES DE UTILIDADE
  // ============================================================================

  const canAccess = useCallback((resource: string, action: 'read' | 'write' = 'read') => {
    if (!status.userAuthenticated) return false;

    switch (resource) {
      case 'own_profile':
        return action === 'read' ? status.permissions.canReadOwn : status.permissions.canWriteOwn;
      case 'own_gamification':
        return action === 'read' ? status.permissions.canReadOwn : status.permissions.canWriteOwn;
      case 'own_transactions':
        return action === 'read' ? status.permissions.canReadOwn : status.permissions.canWriteOwn;
      case 'all_users':
        return action === 'read' ? status.permissions.canReadAll : status.permissions.canWriteAll;
      case 'all_gamification':
        return action === 'read' ? status.permissions.canReadAll : status.permissions.canWriteAll;
      case 'sponsors':
        return action === 'read' ? status.permissions.canReadAll : status.permissions.canWriteAll;
      default:
        return false;
    }
  }, [status]);

  const isStaff = useCallback(() => {
    if (!status.userRole) return false;
    const staffRoles = ['admin', 'dev', 'marketing', 'staff'];
    return staffRoles.includes(status.userRole);
  }, [status.userRole]);

  const isAdmin = useCallback(() => {
    return status.userRole === 'admin';
  }, [status.userRole]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    checkRLSStatus();
  }, [checkRLSStatus]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    status,
    loading,
    error,

    // Funções de verificação
    checkRLSStatus,
    testRLSAccess,

    // Funções de utilidade
    canAccess,
    isStaff,
    isAdmin,

    // Helpers
    refresh: checkRLSStatus
  };
}

// ============================================================================
// HOOK SIMPLIFICADO PARA VERIFICAÇÕES RÁPIDAS
// ============================================================================

export function useRLSPermissions() {
  const { status, canAccess, isStaff, isAdmin } = useRLS();

  return {
    canReadOwn: canAccess('own_profile', 'read'),
    canWriteOwn: canAccess('own_profile', 'write'),
    canReadAll: canAccess('all_users', 'read'),
    canWriteAll: canAccess('all_users', 'write'),
    canManageSponsors: canAccess('sponsors', 'write'),
    isStaff: isStaff(),
    isAdmin: isAdmin(),
    userRole: status.userRole,
    authenticated: status.userAuthenticated
  };
}

export default useRLS;
