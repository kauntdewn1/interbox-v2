// ============================================================================
// HOOK DO SISTEMA DE CONVITES - INTERBØX V2
// ============================================================================
// Este hook gerencia todo o sistema de convites e recompensas por indicação
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { emitGamificationEvent } from '../lib/gamification-events';
import { useClerkSupabase } from './useClerkSupabase';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface Invite {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  referralCode: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
  metadata: Record<string, unknown>;
}

export interface InviteStats {
  totalSent: number;
  totalAccepted: number;
  totalPending: number;
  totalExpired: number;
  totalTokensEarned: number;
}

export interface CreateInviteData {
  inviteeEmail: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateInviteResult {
  success: boolean;
  inviteId?: string;
  referralCode?: string;
  expiresAt?: Date;
  message: string;
  errors?: string[];
}

export interface AcceptInviteResult {
  success: boolean;
  inviterId?: string;
  tokensAwarded?: number;
  message: string;
  errors?: string[];
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useInviteSystem() {
  const { user } = useClerkSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // ============================================================================
  // FUNÇÕES DE CONVITE
  // ============================================================================

  /**
   * Cria um novo convite
   */
  const createInvite = useCallback(async (data: CreateInviteData): Promise<CreateInviteResult> => {
    if (!user?.id) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        errors: ['Usuário não encontrado']
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Validar email
      if (!data.inviteeEmail || !isValidEmail(data.inviteeEmail)) {
        return {
          success: false,
          message: 'Email inválido',
          errors: ['Formato de email inválido']
        };
      }

      // Verificar se já existe convite pendente para este email
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('id, status, expires_at')
        .eq('invitee_email', data.inviteeEmail)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvite) {
        return {
          success: false,
          message: 'Já existe um convite pendente para este email',
          errors: ['Convite duplicado']
        };
      }

      // Criar convite usando função RPC
      const { data: result, error } = await supabase.rpc('create_invite', {
        p_inviter_id: user.id,
        p_invitee_email: data.inviteeEmail,
        p_metadata: {
          message: data.message,
          ...data.metadata
        }
      });

      if (error) {
        throw new Error(`Erro ao criar convite: ${error.message}`);
      }

      if (!result || result.length === 0) {
        throw new Error('Erro ao criar convite: resultado vazio');
      }

      const inviteData = result[0];

      // Atualizar lista de convites
      await fetchInvites();

      return {
        success: true,
        inviteId: inviteData.invite_id,
        referralCode: inviteData.referral_code,
        expiresAt: new Date(inviteData.expires_at),
        message: 'Convite criado com sucesso!'
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Aceita um convite usando código de referência
   */
  const acceptInvite = useCallback(async (referralCode: string): Promise<AcceptInviteResult> => {
    if (!user?.id) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        errors: ['Usuário não encontrado']
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Validar código de referência
      if (!referralCode || referralCode.trim().length === 0) {
        return {
          success: false,
          message: 'Código de referência inválido',
          errors: ['Código obrigatório']
        };
      }

      // Aceitar convite usando função RPC
      const { data: result, error } = await supabase.rpc('accept_invite', {
        p_invitee_id: user.id,
        p_referral_code: referralCode.trim().toUpperCase()
      });

      if (error) {
        throw new Error(`Erro ao aceitar convite: ${error.message}`);
      }

      if (!result || result.length === 0) {
        throw new Error('Erro ao aceitar convite: resultado vazio');
      }

      const inviteResult = result[0];

      if (!inviteResult.success) {
        return {
          success: false,
          message: inviteResult.message,
          errors: [inviteResult.message]
        };
      }

      // Emitir evento de gamificação para o convidador
      if (inviteResult.inviter_id) {
        await emitGamificationEvent(
          inviteResult.inviter_id,
          'indicacao_confirmada',
          'Indicação confirmada',
          {
            inviteeId: user.id,
            referralCode: referralCode,
            tokensAwarded: inviteResult.tokens_awarded
          }
        );
      }

      // Atualizar estatísticas
      await fetchStats();

      return {
        success: true,
        inviterId: inviteResult.inviter_id,
        tokensAwarded: inviteResult.tokens_awarded,
        message: inviteResult.message
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Busca convites do usuário
   */
  const fetchInvites = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('inviter_id', user.id)
        .order('invited_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar convites: ${error.message}`);
      }

      const formattedInvites: Invite[] = (data || []).map(invite => ({
        id: invite.id,
        inviterId: invite.inviter_id,
        inviteeEmail: invite.invitee_email,
        referralCode: invite.referral_code,
        status: invite.status,
        invitedAt: new Date(invite.invited_at),
        acceptedAt: invite.accepted_at ? new Date(invite.accepted_at) : undefined,
        expiresAt: new Date(invite.expires_at),
        metadata: invite.metadata || {}
      }));

      setInvites(formattedInvites);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar convites:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Busca estatísticas de convites
   */
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);

      const { data, error } = await supabase.rpc('get_invite_stats', {
        p_user_id: user.id
      });

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          totalSent: statsData.total_sent || 0,
          totalAccepted: statsData.total_accepted || 0,
          totalPending: statsData.total_pending || 0,
          totalExpired: statsData.total_expired || 0,
          totalTokensEarned: statsData.total_tokens_earned || 0
        });
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [user?.id]);

  /**
   * Busca código de referência do usuário
   */
  const fetchReferralCode = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar código de referência: ${error.message}`);
      }

      setReferralCode(data?.referral_code || null);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar código de referência:', err);
    }
  }, [user?.id]);

  /**
   * Cancela um convite
   */
  const cancelInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('invites')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('inviter_id', user.id);

      if (error) {
        throw new Error(`Erro ao cancelar convite: ${error.message}`);
      }

      // Atualizar lista de convites
      await fetchInvites();
      return true;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao cancelar convite:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchInvites]);

  /**
   * Reenvia um convite (cria novo se expirado)
   */
  const resendInvite = useCallback(async (inviteId: string): Promise<CreateInviteResult> => {
    if (!user?.id) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        errors: ['Usuário não encontrado']
      };
    }

    try {
      // Buscar convite original
      const { data: originalInvite, error: fetchError } = await supabase
        .from('invites')
        .select('invitee_email, metadata')
        .eq('id', inviteId)
        .eq('inviter_id', user.id)
        .single();

      if (fetchError || !originalInvite) {
        return {
          success: false,
          message: 'Convite não encontrado',
          errors: ['Convite inválido']
        };
      }

      // Criar novo convite
      return await createInvite({
        inviteeEmail: originalInvite.invitee_email,
        metadata: originalInvite.metadata
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }, [user?.id, createInvite]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      fetchInvites();
      fetchStats();
      fetchReferralCode();
    }
  }, [user?.id, fetchInvites, fetchStats, fetchReferralCode]);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  /**
   * Valida formato de email
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Gera link de convite
   */
  const generateInviteLink = (referralCode: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/convite/${referralCode}`;
  };

  /**
   * Compartilha convite via Web Share API
   */
  const shareInvite = useCallback(async (referralCode: string, message?: string): Promise<boolean> => {
    if (!navigator.share) {
      // Fallback: copiar para clipboard
      const link = generateInviteLink(referralCode);
      const text = message || `Junte-se ao INTERBØX! Use meu código: ${referralCode}\n${link}`;
      
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }

    try {
      const link = generateInviteLink(referralCode);
      const shareText = message || `Junte-se ao INTERBØX! Use meu código: ${referralCode}`;
      
      await navigator.share({
        title: 'Convite para INTERBØX',
        text: shareText,
        url: link
      });
      
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // Estado
    invites,
    stats,
    referralCode,
    loading,
    error,
    
    // Ações
    createInvite,
    acceptInvite,
    cancelInvite,
    resendInvite,
    fetchInvites,
    fetchStats,
    fetchReferralCode,
    
    // Utilitários
    generateInviteLink,
    shareInvite,
    isValidEmail,
    
    // Helpers
    clearError: () => setError(null)
  };
}

// ============================================================================
// HOOKS AUXILIARES
// ============================================================================

/**
 * Hook para aceitar convite via URL
 */
export function useAcceptInviteFromUrl() {
  const { acceptInvite, loading, error } = useInviteSystem();
  const [processing, setProcessing] = useState(false);

  const acceptFromUrl = useCallback(async (referralCode: string): Promise<AcceptInviteResult> => {
    setProcessing(true);
    try {
      return await acceptInvite(referralCode);
    } finally {
      setProcessing(false);
    }
  }, [acceptInvite]);

  return {
    acceptFromUrl,
    processing: processing || loading,
    error
  };
}

/**
 * Hook para estatísticas de convites em tempo real
 */
export function useInviteStats() {
  const { stats, fetchStats, loading, error } = useInviteSystem();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  return {
    stats,
    loading,
    error,
    autoRefresh,
    setAutoRefresh,
    refresh: fetchStats
  };
}
