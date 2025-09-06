// ============================================================================
// HOOK: USE PUSH CAMPAIGNS - INTERBØX V2
// ============================================================================
// Hook para gerenciar campanhas de push notifications
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface PushCampaign {
  id: string;
  title: string;
  body: string;
  target_type: 'all' | 'role' | 'specific' | 'segment';
  target_role?: string;
  target_users?: string[];
  target_segment?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  updated_at: string;
  icon_url?: string;
  image_url?: string;
  action_url?: string;
}

interface CampaignStats {
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

interface CreateCampaignData {
  title: string;
  body: string;
  target_type: 'all' | 'role' | 'specific' | 'segment';
  target_role?: string;
  target_users?: string[];
  target_segment?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  icon_url?: string;
  image_url?: string;
  action_url?: string;
}

export function usePushCampaigns() {
  const { user } = useUser();
  
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar campanhas
  const loadCampaigns = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('push_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCampaigns(data || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  // Carregar campanhas na inicialização
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Criar nova campanha
  const createCampaign = useCallback(async (data: CreateCampaignData): Promise<string | null> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: campaign, error } = await supabase
        .from('push_campaigns')
        .insert({
          ...data,
          created_by: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recarregar campanhas
      await loadCampaigns();

      return campaign.id;
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Erro ao criar campanha');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id, loadCampaigns]);

  // Enviar campanha para aprovação
  const submitForApproval = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('push_campaigns')
        .update({ status: 'pending_approval' })
        .eq('id', campaignId);

      if (error) {
        throw error;
      }

      // Recarregar campanhas
      await loadCampaigns();

      return true;
    } catch (err) {
      console.error('Error submitting for approval:', err);
      setError('Erro ao enviar para aprovação');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadCampaigns]);

  // Aprovar campanha
  const approveCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('approve_push_campaign', {
        p_campaign_id: campaignId
      });

      if (error) {
        throw error;
      }

      // Recarregar campanhas
      await loadCampaigns();

      return true;
    } catch (err) {
      console.error('Error approving campaign:', err);
      setError('Erro ao aprovar campanha');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadCampaigns]);

  // Enviar campanha
  const sendCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar dados da campanha
      const { data: campaign, error: campaignError } = await supabase
        .from('push_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campanha não encontrada');
      }

      // Enviar via API
      const response = await fetch('/api/send-push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          title: campaign.title,
          body: campaign.body,
          target_type: campaign.target_type,
          target_role: campaign.target_role,
          target_users: campaign.target_users,
          priority: campaign.priority,
          icon_url: campaign.icon_url,
          image_url: campaign.image_url,
          action_url: campaign.action_url
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao enviar campanha');
      }

      // Recarregar campanhas
      await loadCampaigns();

      return true;
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError('Erro ao enviar campanha');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadCampaigns]);

  // Obter estatísticas da campanha
  const getCampaignStats = useCallback(async (campaignId: string): Promise<CampaignStats | null> => {
    try {
      const { data, error } = await supabase.rpc('get_campaign_stats', {
        p_campaign_id: campaignId
      });

      if (error) {
        throw error;
      }

      return data?.[0] || null;
    } catch (err) {
      console.error('Error getting campaign stats:', err);
      setError('Erro ao obter estatísticas');
      return null;
    }
  }, [supabase]);

  // Cancelar campanha
  const cancelCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('push_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', campaignId);

      if (error) {
        throw error;
      }

      // Recarregar campanhas
      await loadCampaigns();

      return true;
    } catch (err) {
      console.error('Error cancelling campaign:', err);
      setError('Erro ao cancelar campanha');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadCampaigns]);

  // Deletar campanha
  const deleteCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('push_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        throw error;
      }

      // Recarregar campanhas
      await loadCampaigns();

      return true;
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Erro ao deletar campanha');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    loadCampaigns,
    createCampaign,
    submitForApproval,
    approveCampaign,
    sendCampaign,
    getCampaignStats,
    cancelCampaign,
    deleteCampaign
  };
}
