// ============================================================================
// SISTEMA DE EVENTOS DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================
// Este arquivo implementa um sistema de eventos para gamificação,
// permitindo validações, rate limiting e auditoria centralizados.
// ============================================================================

import { supabase } from './supabase';
import { 
  GAMIFICATION_CONFIG, 
  getTokensForAction, 
  canExecuteAction, 
  validateTokenAmount, 
  validateAction,
  calculateLevel,
  type GamificationAction 
} from '../config/gamification';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface GamificationEvent {
  id: string;
  userId: string;
  action: GamificationAction;
  tokens: number;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface EventValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EventEmissionResult {
  success: boolean;
  eventId?: string;
  tokensAwarded?: number;
  newLevel?: string;
  errors?: string[];
}

// ============================================================================
// CLASSE PRINCIPAL DO SISTEMA DE EVENTOS
// ============================================================================

export class GamificationEventBus {
  private static instance: GamificationEventBus;
  private eventQueue: GamificationEvent[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): GamificationEventBus {
    if (!GamificationEventBus.instance) {
      GamificationEventBus.instance = new GamificationEventBus();
    }
    return GamificationEventBus.instance;
  }

  // ============================================================================
  // VALIDAÇÃO DE EVENTOS
  // ============================================================================

  /**
   * Valida um evento de gamificação antes da execução
   */
  async validateEvent(
    userId: string, 
    action: GamificationAction, 
    tokens: number,
    metadata?: Record<string, any>
  ): Promise<EventValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validar ação
    if (!validateAction(action)) {
      errors.push(`Ação inválida: ${action}`);
    }

    // 2. Validar quantidade de tokens
    if (!validateTokenAmount(tokens)) {
      errors.push(`Quantidade de tokens inválida: ${tokens}`);
    }

    // 3. Validar usuário
    if (!userId || userId.trim() === '') {
      errors.push('ID do usuário é obrigatório');
    }

    // 4. Verificar rate limiting
    if (userId && action) {
      try {
        const { data: lastAction } = await supabase
          .from('user_gamification')
          .select('last_action_at')
          .eq('user_id', userId)
          .single();

        if (lastAction?.last_action_at) {
          const canExecute = canExecuteAction(lastAction.last_action_at, action);
          if (!canExecute) {
            errors.push(`Ação ${action} está em cooldown`);
          }
        }
      } catch (error) {
        warnings.push('Não foi possível verificar rate limiting');
      }
    }

    // 5. Verificar limites diários/semanais/mensais
    if (userId) {
      try {
        const { data: gamification } = await supabase
          .from('user_gamification')
          .select('weekly_tokens, monthly_tokens, box_tokens')
          .eq('user_id', userId)
          .single();

        if (gamification) {
          // Verificar limite diário (aproximado)
          if (tokens > GAMIFICATION_CONFIG.SECURITY.MAX_DAILY_TOKENS) {
            warnings.push(`Quantidade de tokens excede limite diário recomendado`);
          }

          // Verificar limite semanal
          if (gamification.weekly_tokens + tokens > GAMIFICATION_CONFIG.SECURITY.MAX_WEEKLY_TOKENS) {
            warnings.push(`Quantidade de tokens excede limite semanal`);
          }

          // Verificar limite mensal
          if (gamification.monthly_tokens + tokens > GAMIFICATION_CONFIG.SECURITY.MAX_MONTHLY_TOKENS) {
            warnings.push(`Quantidade de tokens excede limite mensal`);
          }
        }
      } catch (error) {
        warnings.push('Não foi possível verificar limites de tokens');
      }
    }

    // 6. Validar metadados específicos por ação
    if (metadata) {
      this.validateActionMetadata(action, metadata, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida metadados específicos por ação
   */
  private validateActionMetadata(
    action: GamificationAction, 
    metadata: Record<string, any>, 
    errors: string[], 
    warnings: string[]
  ): void {
    switch (action) {
      case 'qr_scan_evento':
        if (!metadata.eventId) {
          errors.push('eventId é obrigatório para qr_scan_evento');
        }
        break;

      case 'prova_extra':
        if (!metadata.provaId) {
          errors.push('provaId é obrigatório para prova_extra');
        }
        break;

      case 'indicacao_confirmada':
        if (!metadata.convidadoId) {
          errors.push('convidadoId é obrigatório para indicacao_confirmada');
        }
        break;

      case 'compra_ingresso':
        if (!metadata.ingressoId || !metadata.valor) {
          errors.push('ingressoId e valor são obrigatórios para compra_ingresso');
        }
        break;

      case 'envio_conteudo':
        if (!metadata.conteudoId || !metadata.tipo) {
          errors.push('conteudoId e tipo são obrigatórios para envio_conteudo');
        }
        break;

      case 'rede_social_tag':
        if (!metadata.plataforma || !metadata.url) {
          errors.push('plataforma e url são obrigatórios para rede_social_tag');
        }
        break;

      default:
        // Ações sem metadados obrigatórios
        break;
    }
  }

  // ============================================================================
  // EMISSÃO DE EVENTOS
  // ============================================================================

  /**
   * Emite um evento de gamificação
   */
  async emit(
    userId: string,
    action: GamificationAction,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<EventEmissionResult> {
    try {
      // 1. Obter quantidade de tokens para a ação
      const tokens = getTokensForAction(action);
      if (tokens === 0) {
        return {
          success: false,
          errors: [`Ação ${action} não possui tokens configurados`]
        };
      }

      // 2. Validar evento
      const validation = await this.validateEvent(userId, action, tokens, metadata);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // 3. Criar evento
      const event: GamificationEvent = {
        id: this.generateEventId(),
        userId,
        action,
        tokens,
        description: description || `Ação: ${action}`,
        metadata,
        timestamp: new Date(),
        success: false
      };

      // 4. Processar evento
      const result = await this.processEvent(event);

      // 5. Adicionar à fila para processamento assíncrono
      this.eventQueue.push(event);

      // 6. Processar fila se não estiver processando
      if (!this.isProcessing) {
        this.processQueue();
      }

      return result;

    } catch (error) {
      console.error('Erro ao emitir evento de gamificação:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }

  /**
   * Processa um evento de gamificação
   */
  private async processEvent(event: GamificationEvent): Promise<EventEmissionResult> {
    try {
      // 1. Obter estado atual do usuário
      const { data: currentGamification } = await supabase
        .from('user_gamification')
        .select('box_tokens, level')
        .eq('user_id', event.userId)
        .single();

      const currentBalance = currentGamification?.box_tokens || 0;
      const currentLevel = currentGamification?.level || 'cindy';

      // 2. Adicionar tokens ao usuário
      const { data, error } = await supabase.rpc('add_tokens', {
        p_user_id: event.userId,
        p_amount: event.tokens,
        p_type: 'earn',
        p_description: event.description
      });

      if (error) {
        throw new Error(`Erro ao adicionar tokens: ${error.message}`);
      }

      // 3. Obter novo estado do usuário
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('box_tokens, level')
        .eq('user_id', event.userId)
        .single();

      if (gamification) {
        const newLevel = calculateLevel(gamification.box_tokens);
        
        // 3. Atualizar nível se necessário
        if (newLevel !== gamification.level) {
          await supabase
            .from('user_gamification')
            .update({ level: newLevel })
            .eq('user_id', event.userId);

          // 4. Emitir evento de mudança de nível
          await this.emitLevelUpEvent(event.userId, gamification.level, newLevel);
        }

        // 5. Marcar evento como sucesso
        event.success = true;

        // 6. Registrar log de auditoria
        try {
          await supabase.rpc('log_gamification_action', {
            p_user_id: event.userId,
            p_action: event.action,
            p_tokens_before: currentBalance,
            p_tokens_after: gamification.box_tokens,
            p_level_before: currentLevel,
            p_level_after: newLevel,
            p_source: 'user_action',
            p_origin: event.metadata?.origin || 'api',
            p_metadata: {
              event_id: event.id,
              description: event.description,
              ...event.metadata
            },
            p_status: 'success'
          });
        } catch (logError) {
          console.warn('Erro ao registrar log de auditoria:', logError);
          // Não falhar a operação por causa do log
        }

        // 7. Log do evento
        await this.logEvent(event);

        return {
          success: true,
          eventId: event.id,
          tokensAwarded: event.tokens,
          newLevel: newLevel
        };
      }

      throw new Error('Usuário não encontrado');

    } catch (error) {
      event.success = false;
      event.error = error instanceof Error ? error.message : 'Erro desconhecido';
      
      await this.logEvent(event);

      return {
        success: false,
        errors: [event.error]
      };
    }
  }

  /**
   * Emite evento de mudança de nível
   */
  private async emitLevelUpEvent(userId: string, oldLevel: string, newLevel: string): Promise<void> {
    try {
      // Adicionar bônus por mudança de nível
      const levelUpBonus = GAMIFICATION_CONFIG.SYSTEM.LEVEL_UP_BONUS;
      
      await supabase.rpc('add_tokens', {
        p_user_id: userId,
        p_amount: levelUpBonus,
        p_type: 'achievement',
        p_description: `Bônus por atingir nível ${newLevel}`
      });

      // Log da mudança de nível
      console.log(`🎉 Usuário ${userId} subiu do nível ${oldLevel} para ${newLevel}`);
      
    } catch (error) {
      console.error('Erro ao processar mudança de nível:', error);
    }
  }

  /**
   * Processa a fila de eventos
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event) {
          await this.processEvent(event);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Log de evento para auditoria
   */
  private async logEvent(event: GamificationEvent): Promise<void> {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: event.userId,
          event_name: 'gamification_action',
          event_data: {
            action: event.action,
            tokens: event.tokens,
            description: event.description,
            metadata: event.metadata,
            success: event.success,
            error: event.error
          }
        });
    } catch (error) {
      console.error('Erro ao logar evento:', error);
    }
  }

  /**
   * Gera ID único para evento
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // MÉTODOS DE CONSULTA
  // ============================================================================

  /**
   * Obtém histórico de eventos de um usuário
   */
  async getUserEventHistory(userId: string, limit: number = 50): Promise<GamificationEvent[]> {
    try {
      const { data } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', 'gamification_action')
        .order('created_at', { ascending: false })
        .limit(limit);

      return data?.map(event => ({
        id: event.id,
        userId: event.user_id,
        action: event.event_data.action,
        tokens: event.event_data.tokens,
        description: event.event_data.description,
        metadata: event.event_data.metadata,
        timestamp: new Date(event.created_at),
        success: event.event_data.success,
        error: event.event_data.error
      })) || [];

    } catch (error) {
      console.error('Erro ao obter histórico de eventos:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de eventos
   */
  async getEventStatistics(userId?: string): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    totalTokensAwarded: number;
    mostCommonAction: string;
  }> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('event_name', 'gamification_action');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data } = await query;

      if (!data) {
        return {
          totalEvents: 0,
          successfulEvents: 0,
          failedEvents: 0,
          totalTokensAwarded: 0,
          mostCommonAction: ''
        };
      }

      const successfulEvents = data.filter(event => event.event_data.success);
      const failedEvents = data.filter(event => !event.event_data.success);
      const totalTokensAwarded = successfulEvents.reduce(
        (sum, event) => sum + (event.event_data.tokens || 0), 
        0
      );

      // Contar ações mais comuns
      const actionCounts: Record<string, number> = {};
      data.forEach(event => {
        const action = event.event_data.action;
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });

      const mostCommonAction = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return {
        totalEvents: data.length,
        successfulEvents: successfulEvents.length,
        failedEvents: failedEvents.length,
        totalTokensAwarded,
        mostCommonAction
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de eventos:', error);
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        totalTokensAwarded: 0,
        mostCommonAction: ''
      };
    }
  }

  // ============================================================================
 // MÉTODOS DE UTILIDADE
  // ============================================================================

  /**
   * Limpa a fila de eventos
   */
  clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Obtém tamanho da fila
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Verifica se está processando
   */
  isProcessingQueue(): boolean {
    return this.isProcessing;
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const gamificationEventBus = GamificationEventBus.getInstance();

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Emite um evento de gamificação de forma simples
 */
export async function emitGamificationEvent(
  userId: string,
  action: GamificationAction,
  description?: string,
  metadata?: Record<string, any>
): Promise<EventEmissionResult> {
  return gamificationEventBus.emit(userId, action, description, metadata);
}

/**
 * Valida um evento de gamificação
 */
export async function validateGamificationEvent(
  userId: string,
  action: GamificationAction,
  tokens: number,
  metadata?: Record<string, any>
): Promise<EventValidationResult> {
  return gamificationEventBus.validateEvent(userId, action, tokens, metadata);
}

/**
 * Obtém histórico de eventos de um usuário
 */
export async function getUserGamificationHistory(
  userId: string,
  limit: number = 50
): Promise<GamificationEvent[]> {
  return gamificationEventBus.getUserEventHistory(userId, limit);
}

/**
 * Obtém estatísticas de eventos
 */
export async function getGamificationStatistics(
  userId?: string
): Promise<{
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  totalTokensAwarded: number;
  mostCommonAction: string;
}> {
  return gamificationEventBus.getEventStatistics(userId);
}
