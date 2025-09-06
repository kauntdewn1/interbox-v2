// ============================================================================
// VALIDADOR ROBUSTO DE GAMIFICAÇÃO - INTERBØX V2
// ============================================================================
// Este arquivo implementa validações robustas para o sistema de gamificação,
// incluindo validação de entrada, segurança e integridade de dados.
// ============================================================================

import { supabase } from './supabase';
import { 
  GAMIFICATION_CONFIG, 
  validateTokenAmount, 
  validateAction,
  canExecuteAction,
  type GamificationAction 
} from '../config/gamification';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

export interface SecurityCheckResult {
  secure: boolean;
  threats: string[];
  recommendations: string[];
}

export interface IntegrityCheckResult {
  consistent: boolean;
  issues: string[];
  fixes: string[];
}

// ============================================================================
// CLASSE PRINCIPAL DO VALIDADOR
// ============================================================================

export class GamificationValidator {
  private static instance: GamificationValidator;

  private constructor() {}

  static getInstance(): GamificationValidator {
    if (!GamificationValidator.instance) {
      GamificationValidator.instance = new GamificationValidator();
    }
    return GamificationValidator.instance;
  }

  // ============================================================================
  // VALIDAÇÕES BÁSICAS
  // ============================================================================

  /**
   * Valida se uma quantidade de tokens é válida
   */
  validateTokenAmount(amount: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Number.isInteger(amount)) {
      errors.push('Quantidade de tokens deve ser um número inteiro');
    }

    if (amount < GAMIFICATION_CONFIG.SECURITY.MIN_TOKENS_PER_ACTION) {
      errors.push(`Quantidade mínima de tokens é ${GAMIFICATION_CONFIG.SECURITY.MIN_TOKENS_PER_ACTION}`);
    }

    if (amount > GAMIFICATION_CONFIG.SECURITY.MAX_TOKENS_PER_ACTION) {
      errors.push(`Quantidade máxima de tokens é ${GAMIFICATION_CONFIG.SECURITY.MAX_TOKENS_PER_ACTION}`);
    }

    if (amount === 0) {
      warnings.push('Quantidade de tokens é zero - ação pode não ter efeito');
    }

    if (amount > 1000) {
      warnings.push('Quantidade de tokens muito alta - verificar se é intencional');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { amount }
    };
  }

  /**
   * Valida se uma ação é válida
   */
  validateAction(action: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!action || typeof action !== 'string') {
      errors.push('Ação é obrigatória e deve ser uma string');
      return { valid: false, errors, warnings };
    }

    if (!validateAction(action)) {
      errors.push(`Ação inválida: ${action}`);
      errors.push(`Ações válidas: ${Object.keys(GAMIFICATION_CONFIG.TOKENS).join(', ')}`);
    }

    if (action.length > 50) {
      warnings.push('Nome da ação muito longo - pode indicar problema');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { action }
    };
  }

  /**
   * Valida se um ID de usuário é válido
   */
  validateUserId(userId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!userId || typeof userId !== 'string') {
      errors.push('ID do usuário é obrigatório e deve ser uma string');
      return { valid: false, errors, warnings };
    }

    if (userId.trim() === '') {
      errors.push('ID do usuário não pode ser vazio');
    }

    if (userId.length < 10) {
      warnings.push('ID do usuário muito curto - pode ser inválido');
    }

    if (userId.length > 100) {
      warnings.push('ID do usuário muito longo - pode ser inválido');
    }

    // Verificar se contém apenas caracteres válidos
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      warnings.push('ID do usuário contém caracteres especiais - verificar se é válido');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { userId }
    };
  }

  // ============================================================================
  // VALIDAÇÕES DE SEGURANÇA
  // ============================================================================

  /**
   * Verifica se uma ação é segura para executar
   */
  async validateActionSecurity(
    userId: string, 
    action: GamificationAction, 
    tokens: number
  ): Promise<SecurityCheckResult> {
    const threats: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Verificar se usuário existe e está ativo
      const { data: user } = await supabase
        .from('users')
        .select('id, is_active, status, test_user')
        .eq('id', userId)
        .single();

      if (!user) {
        threats.push('Usuário não encontrado');
        return { secure: false, threats, recommendations };
      }

      if (!user.is_active) {
        threats.push('Usuário inativo');
        recommendations.push('Verificar status do usuário antes de conceder tokens');
      }

      if (user.test_user) {
        recommendations.push('Usuário de teste - considerar limites especiais');
      }

      // 2. Verificar rate limiting
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('last_action_at, total_actions, box_tokens')
        .eq('user_id', userId)
        .single();

      if (gamification?.last_action_at) {
        const canExecute = canExecuteAction(gamification.last_action_at, action);
        if (!canExecute) {
          threats.push(`Ação ${action} está em cooldown`);
        }
      }

      // 3. Verificar limites de segurança
      if (tokens > GAMIFICATION_CONFIG.SECURITY.MAX_DAILY_TOKENS) {
        threats.push(`Quantidade de tokens excede limite diário de segurança`);
        recommendations.push('Implementar aprovação manual para valores altos');
      }

      // 4. Verificar padrões suspeitos
      if (gamification?.total_actions > 1000) {
        threats.push('Usuário com muitas ações - possível abuso');
        recommendations.push('Implementar monitoramento adicional');
      }

      // 5. Verificar saldo atual
      if (gamification?.box_tokens > 10000) {
        recommendations.push('Usuário com saldo alto - verificar origem dos tokens');
      }

      // 6. Verificar ações recentes
      const { data: recentActions } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_name', 'gamification_action')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
        .limit(10);

      if (recentActions && recentActions.length > 5) {
        threats.push('Muitas ações recentes - possível automação');
        recommendations.push('Implementar CAPTCHA ou verificação adicional');
      }

      return {
        secure: threats.length === 0,
        threats,
        recommendations
      };

    } catch (error) {
      threats.push(`Erro ao verificar segurança: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { secure: false, threats, recommendations };
    }
  }

  /**
   * Verifica se metadados são seguros
   */
  validateMetadata(metadata: Record<string, any>): SecurityCheckResult {
    const threats: string[] = [];
    const recommendations: string[] = [];

    if (!metadata || typeof metadata !== 'object') {
      return { secure: true, threats, recommendations };
    }

    // Verificar tamanho dos metadados
    const metadataSize = JSON.stringify(metadata).length;
    if (metadataSize > 10000) {
      threats.push('Metadados muito grandes - possível ataque');
      recommendations.push('Limitar tamanho dos metadados');
    }

    // Verificar chaves suspeitas
    const suspiciousKeys = ['script', 'eval', 'function', 'exec', 'system'];
    const keys = Object.keys(metadata).map(k => k.toLowerCase());
    
    for (const key of keys) {
      if (suspiciousKeys.some(suspicious => key.includes(suspicious))) {
        threats.push(`Chave suspeita encontrada: ${key}`);
        recommendations.push('Validar chaves dos metadados');
      }
    }

    // Verificar valores suspeitos
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && value.length > 1000) {
        threats.push(`Valor muito longo para chave ${key}`);
        recommendations.push('Limitar tamanho dos valores');
      }

      if (typeof value === 'string' && /<script|javascript:|data:/i.test(value)) {
        threats.push(`Possível XSS na chave ${key}`);
        recommendations.push('Sanitizar valores dos metadados');
      }
    }

    return {
      secure: threats.length === 0,
      threats,
      recommendations
    };
  }

  // ============================================================================
  // VALIDAÇÕES DE INTEGRIDADE
  // ============================================================================

  /**
   * Verifica integridade dos dados de gamificação
   */
  async validateGamificationIntegrity(userId: string): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    const fixes: string[] = [];

    try {
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!gamification) {
        issues.push('Dados de gamificação não encontrados');
        fixes.push('Criar registro de gamificação para o usuário');
        return { consistent: false, issues, fixes };
      }

      // 1. Verificar consistência de níveis
      const expectedLevel = this.calculateExpectedLevel(gamification.box_tokens);
      if (gamification.level !== expectedLevel) {
        issues.push(`Nível inconsistente: atual=${gamification.level}, esperado=${expectedLevel}`);
        fixes.push('Atualizar nível baseado no saldo de tokens');
      }

      // 2. Verificar saldo negativo
      if (gamification.box_tokens < 0) {
        issues.push('Saldo de tokens negativo');
        fixes.push('Corrigir saldo de tokens');
      }

      // 3. Verificar total_earned vs box_tokens
      if (gamification.total_earned < gamification.box_tokens) {
        issues.push('total_earned menor que box_tokens');
        fixes.push('Recalcular total_earned');
      }

      // 4. Verificar arrays de achievements e badges
      if (!Array.isArray(gamification.achievements)) {
        issues.push('achievements não é um array');
        fixes.push('Corrigir tipo de achievements');
      }

      if (!Array.isArray(gamification.badges)) {
        issues.push('badges não é um array');
        fixes.push('Corrigir tipo de badges');
      }

      // 5. Verificar timestamps
      if (gamification.last_action_at && new Date(gamification.last_action_at) > new Date()) {
        issues.push('last_action_at no futuro');
        fixes.push('Corrigir timestamp de last_action_at');
      }

      return {
        consistent: issues.length === 0,
        issues,
        fixes
      };

    } catch (error) {
      issues.push(`Erro ao verificar integridade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { consistent: false, issues, fixes };
    }
  }

  /**
   * Calcula o nível esperado baseado nos tokens
   */
  private calculateExpectedLevel(tokens: number): string {
    if (tokens >= 2000) return 'matt';
    if (tokens >= 1000) return 'murph';
    if (tokens >= 600) return 'annie';
    if (tokens >= 300) return 'fran';
    if (tokens >= 100) return 'helen';
    return 'cindy';
  }

  // ============================================================================
  // VALIDAÇÕES DE NEGÓCIO
  // ============================================================================

  /**
   * Valida se uma ação de negócio é válida
   */
  async validateBusinessAction(
    userId: string,
    action: GamificationAction,
    metadata?: Record<string, any>
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Verificar se usuário pode executar a ação
      const { data: user } = await supabase
        .from('users')
        .select('role, profile_complete')
        .eq('id', userId)
        .single();

      if (!user) {
        errors.push('Usuário não encontrado');
        return { valid: false, errors, warnings };
      }

      // 2. Verificar permissões por role
      if (action === 'prova_extra' && !['atleta', 'judge'].includes(user.role)) {
        errors.push('Apenas atletas e juízes podem executar provas extras');
      }

      if (action === 'envio_conteudo' && !['midia', 'atleta'].includes(user.role)) {
        errors.push('Apenas mídia e atletas podem enviar conteúdo');
      }

      // 3. Verificar pré-requisitos
      if (action === 'completar_perfil' && user.profile_complete) {
        warnings.push('Perfil já está completo');
      }

      // 4. Verificar metadados específicos por ação
      if (metadata) {
        const metadataValidation = this.validateActionMetadata(action, metadata);
        errors.push(...metadataValidation.errors);
        warnings.push(...metadataValidation.warnings);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: { userId, action, userRole: user.role }
      };

    } catch (error) {
      errors.push(`Erro ao validar ação de negócio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { valid: false, errors, warnings };
    }
  }

  /**
   * Valida metadados específicos por ação
   */
  private validateActionMetadata(action: GamificationAction, metadata: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (action) {
      case 'qr_scan_evento':
        if (!metadata.eventId) {
          errors.push('eventId é obrigatório para qr_scan_evento');
        }
        if (metadata.eventId && typeof metadata.eventId !== 'string') {
          errors.push('eventId deve ser uma string');
        }
        break;

      case 'prova_extra':
        if (!metadata.provaId) {
          errors.push('provaId é obrigatório para prova_extra');
        }
        if (metadata.provaId && typeof metadata.provaId !== 'string') {
          errors.push('provaId deve ser uma string');
        }
        break;

      case 'indicacao_confirmada':
        if (!metadata.convidadoId) {
          errors.push('convidadoId é obrigatório para indicacao_confirmada');
        }
        if (metadata.convidadoId && typeof metadata.convidadoId !== 'string') {
          errors.push('convidadoId deve ser uma string');
        }
        break;

      case 'compra_ingresso':
        if (!metadata.ingressoId) {
          errors.push('ingressoId é obrigatório para compra_ingresso');
        }
        if (!metadata.valor) {
          errors.push('valor é obrigatório para compra_ingresso');
        }
        if (metadata.valor && typeof metadata.valor !== 'number') {
          errors.push('valor deve ser um número');
        }
        if (metadata.valor && metadata.valor <= 0) {
          errors.push('valor deve ser maior que zero');
        }
        break;

      case 'envio_conteudo':
        if (!metadata.conteudoId) {
          errors.push('conteudoId é obrigatório para envio_conteudo');
        }
        if (!metadata.tipo) {
          errors.push('tipo é obrigatório para envio_conteudo');
        }
        if (metadata.tipo && !['foto', 'video', 'texto'].includes(metadata.tipo)) {
          errors.push('tipo deve ser foto, video ou texto');
        }
        break;

      case 'rede_social_tag':
        if (!metadata.plataforma) {
          errors.push('plataforma é obrigatória para rede_social_tag');
        }
        if (!metadata.url) {
          errors.push('url é obrigatória para rede_social_tag');
        }
        if (metadata.url && !this.isValidUrl(metadata.url)) {
          errors.push('url deve ser uma URL válida');
        }
        break;

      default:
        // Ações sem metadados obrigatórios
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida se uma URL é válida
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // VALIDAÇÕES DE PERFORMANCE
  // ============================================================================

  /**
   * Valida se uma ação pode ser executada considerando performance
   */
  async validatePerformance(userId: string, action: GamificationAction): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Verificar quantas ações o usuário executou recentemente
      const { data: recentActions } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_name', 'gamification_action')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
        .limit(100);

      if (recentActions && recentActions.length > 50) {
        warnings.push('Muitas ações recentes - pode impactar performance');
      }

      // Verificar se há muitas ações pendentes na fila
      const { data: pendingActions } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_name', 'gamification_action')
        .is('processed_at', null)
        .limit(10);

      if (pendingActions && pendingActions.length > 5) {
        warnings.push('Ações pendentes na fila - considerar rate limiting');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: { 
          recentActions: recentActions?.length || 0,
          pendingActions: pendingActions?.length || 0
        }
      };

    } catch (error) {
      errors.push(`Erro ao verificar performance: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { valid: false, errors, warnings };
    }
  }

  // ============================================================================
  // VALIDAÇÃO COMPLETA
  // ============================================================================

  /**
   * Executa todas as validações para uma ação
   */
  async validateComplete(
    userId: string,
    action: GamificationAction,
    tokens: number,
    metadata?: Record<string, any>
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    security: SecurityCheckResult;
    integrity: IntegrityCheckResult;
    performance: ValidationResult;
  }> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validações básicas
    const tokenValidation = this.validateTokenAmount(tokens);
    const actionValidation = this.validateAction(action);
    const userValidation = this.validateUserId(userId);

    allErrors.push(...tokenValidation.errors);
    allErrors.push(...actionValidation.errors);
    allErrors.push(...userValidation.errors);
    allWarnings.push(...tokenValidation.warnings);
    allWarnings.push(...actionValidation.warnings);
    allWarnings.push(...userValidation.warnings);

    // Validações de segurança
    const security = await this.validateActionSecurity(userId, action, tokens);
    if (!security.secure) {
      allErrors.push(...security.threats);
    }
    allWarnings.push(...security.recommendations);

    // Validação de metadados
    if (metadata) {
      const metadataSecurity = this.validateMetadata(metadata);
      if (!metadataSecurity.secure) {
        allErrors.push(...metadataSecurity.threats);
      }
      allWarnings.push(...metadataSecurity.recommendations);
    }

    // Validação de integridade
    const integrity = await this.validateGamificationIntegrity(userId);

    // Validação de negócio
    const businessValidation = await this.validateBusinessAction(userId, action, metadata);
    allErrors.push(...businessValidation.errors);
    allWarnings.push(...businessValidation.warnings);

    // Validação de performance
    const performance = await this.validatePerformance(userId, action);
    allErrors.push(...performance.errors);
    allWarnings.push(...performance.warnings);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      security,
      integrity,
      performance
    };
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const gamificationValidator = GamificationValidator.getInstance();

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Valida uma ação de gamificação de forma simples
 */
export async function validateGamificationAction(
  userId: string,
  action: GamificationAction,
  tokens: number,
  metadata?: Record<string, any>
): Promise<ValidationResult> {
  const validator = GamificationValidator.getInstance();
  const result = await validator.validateComplete(userId, action, tokens, metadata);
  
  return {
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings
  };
}

/**
 * Verifica segurança de uma ação
 */
export async function checkActionSecurity(
  userId: string,
  action: GamificationAction,
  tokens: number
): Promise<SecurityCheckResult> {
  const validator = GamificationValidator.getInstance();
  return validator.validateActionSecurity(userId, action, tokens);
}

/**
 * Verifica integridade dos dados de gamificação
 */
export async function checkGamificationIntegrity(userId: string): Promise<IntegrityCheckResult> {
  const validator = GamificationValidator.getInstance();
  return validator.validateGamificationIntegrity(userId);
}
