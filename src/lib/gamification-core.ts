// ============================================================================
// FUNÇÕES CORE DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================
// Este arquivo implementa as funções essenciais de gamificação que estavam
// faltando na auditoria: processQRCheckin, getGamificationMetrics e awardTokens reforçado.
// ============================================================================

import { supabase } from './supabase';
import { 
  GAMIFICATION_CONFIG, 
  getTokensForAction, 
  validateAction,
  validateTokenAmount,
  calculateLevel,
  type GamificationAction 
} from '../config/gamification';
import { 
  emitGamificationEvent, 
  validateGamificationEvent 
} from './gamification-events';
import { 
  validateGamificationAction, 
  checkActionSecurity 
} from './gamification-validator';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface QRCheckinData {
  qrCode: string;
  eventId: string;
  userId: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  metadata?: Record<string, any>;
}

export interface QRCheckinResult {
  success: boolean;
  tokensAwarded: number;
  newLevel?: string;
  message: string;
  errors?: string[];
  metadata?: {
    eventName?: string;
    checkinTime: Date;
    location?: string;
  };
}

export interface GamificationMetrics {
  totalUsers: number;
  totalTokens: number;
  averageTokens: number;
  levelDistribution: Record<string, number>;
  topActions: Array<{
    action: string;
    count: number;
    totalTokens: number;
  }>;
  recentActivity: Array<{
    userId: string;
    action: string;
    tokens: number;
    timestamp: Date;
  }>;
  systemHealth: {
    databaseConnected: boolean;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
  };
  lastUpdated: Date;
}

export interface AwardTokensResult {
  success: boolean;
  tokensAwarded: number;
  newLevel?: string;
  message: string;
  errors?: string[];
  securityWarnings?: string[];
}

// ============================================================================
// FUNÇÕES CORE
// ============================================================================

/**
 * Processa check-in via QR Code
 * Função essencial para ativações físicas e rastreabilidade
 */
export async function processQRCheckin(data: QRCheckinData): Promise<QRCheckinResult> {
  try {
    // 1. Validar dados de entrada
    if (!data.qrCode || !data.eventId || !data.userId) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Dados obrigatórios não fornecidos',
        errors: ['qrCode, eventId e userId são obrigatórios']
      };
    }

    // 2. Verificar se o QR Code é válido
    const qrValidation = await validateQRCode(data.qrCode, data.eventId);
    if (!qrValidation.valid) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'QR Code inválido ou expirado',
        errors: qrValidation.errors
      };
    }

    // 3. Verificar se o usuário já fez check-in neste evento
    const existingCheckin = await checkExistingCheckin(data.userId, data.eventId);
    if (existingCheckin) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Usuário já fez check-in neste evento',
        errors: ['Check-in duplicado não permitido']
      };
    }

    // 4. Validar localização se fornecida
    if (data.location) {
      const locationValidation = await validateLocation(data.location, data.eventId);
      if (!locationValidation.valid) {
        return {
          success: false,
          tokensAwarded: 0,
          message: 'Localização inválida para este evento',
          errors: locationValidation.errors
        };
      }
    }

    // 5. Obter informações do evento
    const eventInfo = await getEventInfo(data.eventId);
    if (!eventInfo) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Evento não encontrado',
        errors: ['Evento inválido ou inativo']
      };
    }

    // 6. Validar se o evento está ativo
    const now = new Date();
    if (now < eventInfo.startDate || now > eventInfo.endDate) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Evento não está ativo no momento',
        errors: ['Evento fora do período de atividade']
      };
    }

    // 7. Emitir evento de gamificação
    const eventResult = await emitGamificationEvent(
      data.userId,
      'qr_scan_evento',
      `Check-in no evento ${eventInfo.name}`,
      {
        eventId: data.eventId,
        eventName: eventInfo.name,
        qrCode: data.qrCode,
        location: data.location,
        checkinTime: new Date().toISOString(),
        ...data.metadata
      }
    );

    if (!eventResult.success) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Erro ao processar check-in',
        errors: eventResult.errors
      };
    }

    // 8. Registrar check-in no banco
    await registerCheckin(data, eventInfo);

    return {
      success: true,
      tokensAwarded: eventResult.tokensAwarded || 0,
      newLevel: eventResult.newLevel,
      message: `Check-in realizado com sucesso! +${eventResult.tokensAwarded} $BØX`,
      metadata: {
        eventName: eventInfo.name,
        checkinTime: new Date(),
        location: data.location ? `${data.location.latitude}, ${data.location.longitude}` : undefined
      }
    };

  } catch (error) {
    console.error('Erro ao processar QR check-in:', error);
    return {
      success: false,
      tokensAwarded: 0,
      message: 'Erro interno do servidor',
      errors: [error instanceof Error ? error.message : 'Erro desconhecido']
    };
  }
}

/**
 * Obtém métricas completas de gamificação
 * Base para exibir stats reais no admin e gamify dados
 */
export async function getGamificationMetrics(): Promise<GamificationMetrics> {
  try {
    // 1. Métricas básicas de usuários
    const { data: userStats } = await supabase
      .from('user_gamification')
      .select('box_tokens, level, total_earned, total_spent');

    const totalUsers = userStats?.length || 0;
    const totalTokens = userStats?.reduce((sum, user) => sum + user.box_tokens, 0) || 0;
    const averageTokens = totalUsers > 0 ? totalTokens / totalUsers : 0;

    // 2. Distribuição de níveis
    const levelDistribution: Record<string, number> = {};
    userStats?.forEach(user => {
      const level = user.level || 'cindy';
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });

    // 3. Top ações
    const { data: actionStats } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'gamification_action')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias

    const actionCounts: Record<string, { count: number; totalTokens: number }> = {};
    actionStats?.forEach(event => {
      const action = event.event_data?.action;
      const tokens = event.event_data?.tokens || 0;
      if (action) {
        if (!actionCounts[action]) {
          actionCounts[action] = { count: 0, totalTokens: 0 };
        }
        actionCounts[action].count++;
        actionCounts[action].totalTokens += tokens;
      }
    });

    const topActions = Object.entries(actionCounts)
      .map(([action, stats]) => ({
        action,
        count: stats.count,
        totalTokens: stats.totalTokens
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Atividade recente
    const { data: recentActivity } = await supabase
      .from('analytics_events')
      .select('user_id, event_data, created_at')
      .eq('event_name', 'gamification_action')
      .order('created_at', { ascending: false })
      .limit(50);

    const recentActivityFormatted = recentActivity?.map(event => ({
      userId: event.user_id,
      action: event.event_data?.action || 'unknown',
      tokens: event.event_data?.tokens || 0,
      timestamp: new Date(event.created_at)
    })) || [];

    // 5. Saúde do sistema
    const systemHealth = await getSystemHealth();

    return {
      totalUsers,
      totalTokens,
      averageTokens,
      levelDistribution,
      topActions,
      recentActivity: recentActivityFormatted,
      systemHealth,
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error('Erro ao obter métricas de gamificação:', error);
    return {
      totalUsers: 0,
      totalTokens: 0,
      averageTokens: 0,
      levelDistribution: {},
      topActions: [],
      recentActivity: [],
      systemHealth: {
        databaseConnected: false,
        cacheHitRate: 0,
        averageResponseTime: 0,
        errorRate: 100
      },
      lastUpdated: new Date()
    };
  }
}

/**
 * Reforça awardTokens com validações internas robustas
 * Confirma ação válida, valor permitido e origem segura
 */
export async function awardTokens(
  userId: string,
  action: GamificationAction,
  customAmount?: number,
  description?: string,
  metadata?: Record<string, any>
): Promise<AwardTokensResult> {
  try {
    // 1. Validação básica de entrada
    if (!userId || !action) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'userId e action são obrigatórios',
        errors: ['Parâmetros obrigatórios não fornecidos']
      };
    }

    // 2. Validar ação
    if (!validateAction(action)) {
      return {
        success: false,
        tokensAwarded: 0,
        message: `Ação inválida: ${action}`,
        errors: [`Ação ${action} não é válida`]
      };
    }

    // 3. Obter quantidade de tokens
    const baseTokens = getTokensForAction(action);
    const finalAmount = customAmount || baseTokens;

    if (finalAmount <= 0) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Quantidade de tokens deve ser maior que zero',
        errors: ['Quantidade inválida de tokens']
      };
    }

    // 4. Validar quantidade de tokens
    if (!validateTokenAmount(finalAmount)) {
      return {
        success: false,
        tokensAwarded: 0,
        message: `Quantidade de tokens inválida: ${finalAmount}`,
        errors: [`Quantidade ${finalAmount} fora dos limites permitidos`]
      };
    }

    // 5. Validação completa de segurança
    const validation = await validateGamificationAction(userId, action, finalAmount, metadata);
    if (!validation.valid) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Validação de segurança falhou',
        errors: validation.errors,
        securityWarnings: validation.warnings
      };
    }

    // 6. Verificação de segurança adicional
    const securityCheck = await checkActionSecurity(userId, action, finalAmount);
    if (!securityCheck.secure) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Ação bloqueada por motivos de segurança',
        errors: securityCheck.threats,
        securityWarnings: securityCheck.recommendations
      };
    }

    // 7. Emitir evento de gamificação
    const eventResult = await emitGamificationEvent(
      userId,
      action,
      description || `Ação: ${action}`,
      metadata
    );

    if (!eventResult.success) {
      return {
        success: false,
        tokensAwarded: 0,
        message: 'Erro ao processar evento de gamificação',
        errors: eventResult.errors
      };
    }

    return {
      success: true,
      tokensAwarded: eventResult.tokensAwarded || 0,
      newLevel: eventResult.newLevel,
      message: `Tokens concedidos com sucesso! +${eventResult.tokensAwarded} $BØX`,
      securityWarnings: validation.warnings
    };

  } catch (error) {
    console.error('Erro ao conceder tokens:', error);
    return {
      success: false,
      tokensAwarded: 0,
      message: 'Erro interno do servidor',
      errors: [error instanceof Error ? error.message : 'Erro desconhecido']
    };
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Valida QR Code
 */
async function validateQRCode(qrCode: string, eventId: string): Promise<{ valid: boolean; errors: string[] }> {
  try {
    // Verificar se o QR Code existe e está ativo
    const { data, error } = await supabase
      .from('event_qr_codes')
      .select('id, event_id, is_active, expires_at')
      .eq('qr_code', qrCode)
      .eq('event_id', eventId)
      .single();

    if (error || !data) {
      return { valid: false, errors: ['QR Code não encontrado'] };
    }

    if (!data.is_active) {
      return { valid: false, errors: ['QR Code inativo'] };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, errors: ['QR Code expirado'] };
    }

    return { valid: true, errors: [] };

  } catch (error) {
    return { valid: false, errors: ['Erro ao validar QR Code'] };
  }
}

/**
 * Verifica check-in existente
 */
async function checkExistingCheckin(userId: string, eventId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('event_checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Valida localização
 */
async function validateLocation(
  location: { latitude: number; longitude: number; accuracy?: number },
  eventId: string
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    // Obter localização do evento
    const { data: event } = await supabase
      .from('events')
      .select('location_lat, location_lng, location_radius')
      .eq('id', eventId)
      .single();

    if (!event || !event.location_lat || !event.location_lng) {
      return { valid: true, errors: [] }; // Evento sem localização específica
    }

    // Calcular distância (fórmula de Haversine simplificada)
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      event.location_lat,
      event.location_lng
    );

    const maxRadius = event.location_radius || 100; // 100 metros por padrão

    if (distance > maxRadius) {
      return {
        valid: false,
        errors: [`Usuário está a ${Math.round(distance)}m do evento (máximo: ${maxRadius}m)`]
      };
    }

    return { valid: true, errors: [] };

  } catch (error) {
    return { valid: false, errors: ['Erro ao validar localização'] };
  }
}

/**
 * Calcula distância entre duas coordenadas
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distância em metros
}

/**
 * Obtém informações do evento
 */
async function getEventInfo(eventId: string): Promise<{
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, name, start_date, end_date, location_name')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      location: data.location_name
    };

  } catch {
    return null;
  }
}

/**
 * Registra check-in no banco
 */
async function registerCheckin(data: QRCheckinData, eventInfo: {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}): Promise<void> {
  try {
    await supabase
      .from('event_checkins')
      .insert({
        user_id: data.userId,
        event_id: data.eventId,
        qr_code: data.qrCode,
        checkin_time: new Date().toISOString(),
        location_lat: data.location?.latitude,
        location_lng: data.location?.longitude,
        location_accuracy: data.location?.accuracy,
        metadata: data.metadata
      });
  } catch (error) {
    console.error('Erro ao registrar check-in:', error);
  }
}

/**
 * Obtém saúde do sistema
 */
async function getSystemHealth(): Promise<{
  databaseConnected: boolean;
  cacheHitRate: number;
  averageResponseTime: number;
  errorRate: number;
}> {
  try {
    // Testar conexão com banco
    const startTime = Date.now();
    const { error } = await supabase
      .from('user_gamification')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    const databaseConnected = !error;

    // Obter estatísticas de cache (simuladas por enquanto)
    const cacheHitRate = 0.85; // 85% hit rate
    const averageResponseTime = responseTime;
    const errorRate = error ? 100 : 0;

    return {
      databaseConnected,
      cacheHitRate,
      averageResponseTime,
      errorRate
    };

  } catch (error) {
    return {
      databaseConnected: false,
      cacheHitRate: 0,
      averageResponseTime: 0,
      errorRate: 100
    };
  }
}

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Processa check-in simples (sem validação de localização)
 */
export async function processSimpleQRCheckin(
  qrCode: string,
  eventId: string,
  userId: string
): Promise<QRCheckinResult> {
  return processQRCheckin({
    qrCode,
    eventId,
    userId
  });
}

/**
 * Obtém métricas básicas (versão simplificada)
 */
export async function getBasicGamificationMetrics(): Promise<{
  totalUsers: number;
  totalTokens: number;
  averageTokens: number;
}> {
  const metrics = await getGamificationMetrics();
  return {
    totalUsers: metrics.totalUsers,
    totalTokens: metrics.totalTokens,
    averageTokens: metrics.averageTokens
  };
}

/**
 * Concede tokens com validação básica
 */
export async function awardTokensSimple(
  userId: string,
  action: GamificationAction,
  description?: string
): Promise<AwardTokensResult> {
  return awardTokens(userId, action, undefined, description);
}
