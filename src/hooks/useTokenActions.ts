import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useClerkSupabase } from './useClerkSupabase';
import { TOKEN_ACTIONS } from './useLevelSystem';

export interface TokenAction {
  action: keyof typeof TOKEN_ACTIONS;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

export function useTokenActions() {
  const { user } = useClerkSupabase();

  const awardTokens = useCallback(async (
    action: keyof typeof TOKEN_ACTIONS,
    amount?: number,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) {
      console.error('Usuário não autenticado');
      return false;
    }

    const tokenAmount = amount || TOKEN_ACTIONS[action];
    const actionDescription = description || getActionDescription(action);

    try {
      // Buscar dados atuais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Erro ao buscar usuário:', userError);
        return false;
      }

      // Buscar gamificação atual
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (gamificationError && gamificationError.code !== 'PGRST116') {
        console.error('Erro ao buscar gamificação:', gamificationError);
        return false;
      }

      const currentTokens = gamificationData?.box_tokens || 0;
      const currentTotal = gamificationData?.total_earned || 0;
      const currentAchievements = gamificationData?.achievements || [];

      // Calcular novos valores
      const newTokens = currentTokens + tokenAmount;
      const newTotal = currentTotal + tokenAmount;
      const newAchievements = [...currentAchievements, action];

      // Verificar se atingiu novo nível
      const newLevel = getLevelFromTokens(newTokens);

      // Atualizar ou inserir gamificação
      const gamificationUpdate = {
        user_id: userData.id,
        box_tokens: newTokens,
        total_earned: newTotal,
        achievements: newAchievements,
        last_action: action,
        level: newLevel,
        updated_at: new Date().toISOString(),
      };

      if (gamificationData) {
        // Atualizar existente
        const { error: updateError } = await supabase
          .from('user_gamification')
          .update(gamificationUpdate)
          .eq('user_id', userData.id);

        if (updateError) {
          console.error('Erro ao atualizar gamificação:', updateError);
          return false;
        }
      } else {
        // Inserir novo
        const { error: insertError } = await supabase
          .from('user_gamification')
          .insert({
            ...gamificationUpdate,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Erro ao inserir gamificação:', insertError);
          return false;
        }
      }

      // Registrar transação
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userData.id,
          type: 'earn',
          amount: tokenAmount,
          description: actionDescription,
          metadata: {
            action,
            ...metadata,
          },
          created_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('Erro ao registrar transação:', transactionError);
        // Não falhar por causa da transação
      }

      console.log(`✅ Tokens concedidos: +${tokenAmount} $BØX por ${action}`);
      return true;

    } catch (error) {
      console.error('Erro ao conceder tokens:', error);
      return false;
    }
  }, [user]);

  const getActionDescription = (action: keyof typeof TOKEN_ACTIONS): string => {
    const descriptions: Record<keyof typeof TOKEN_ACTIONS, string> = {
      cadastro: 'Cadastro realizado',
      completar_perfil: 'Perfil completado',
      login_diario: 'Login diário',
      compra_ingresso: 'Ingresso comprado',
      envio_conteudo: 'Conteúdo enviado',
      participacao_enquete: 'Participação em enquete',
      compartilhamento: 'Conteúdo compartilhado',
      qr_scan_evento: 'QR Code escaneado',
      prova_extra: 'Prova adicional',
      acesso_spoiler: 'Acesso a spoiler',
      checkin_evento: 'Check-in no evento',
      indicacao_confirmada: 'Indicação confirmada',
      assistiu_spoiler_video: 'Vídeo spoiler assistido',
      respondeu_quiz: 'Quiz respondido',
      completou_missao_diaria: 'Missão diária completada',
      convidou_amigo: 'Amigo convidado',
      feedback_evento: 'Feedback do evento',
      rede_social_tag: 'Post com marcação',
      desafio_semana_concluido: 'Desafio semanal concluído',
      bonus_7dias_ativos: 'Bônus 7 dias ativos',
      bonus_14dias_ativos: 'Bônus 14 dias ativos',
      chegou_nivel_fran: 'Nível Fran atingido',
      compra_avatar_premium: 'Avatar premium comprado',
    };

    return descriptions[action] || 'Ação realizada';
  };

  const getLevelFromTokens = (tokens: number): string => {
    if (tokens >= 2000) return 'matt';
    if (tokens >= 1000) return 'murph';
    if (tokens >= 600) return 'annie';
    if (tokens >= 300) return 'fran';
    if (tokens >= 100) return 'helen';
    return 'cindy';
  };

  const checkDailyLogin = useCallback(async () => {
    if (!user) return false;

    try {
      // Verificar se já fez login hoje
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayLogin, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'earn')
        .eq('metadata->action', 'login_diario')
        .gte('created_at', `${today}T00:00:00`)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar login diário:', error);
        return false;
      }

      if (todayLogin && todayLogin.length > 0) {
        return false; // Já fez login hoje
      }

      // Conceder tokens de login diário
      return await awardTokens('login_diario');
    } catch (error) {
      console.error('Erro no check de login diário:', error);
      return false;
    }
  }, [user, awardTokens]);

  return {
    awardTokens,
    checkDailyLogin,
    TOKEN_ACTIONS,
  };
}

export default useTokenActions;
