// ============================================================================
// CONFIGURAÇÃO DO SUPABASE - SUBSTITUI FIRESTORE
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_KEY não encontrada no .env');
}

// Cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'interbox-v2',
    },
  },
});

// ============================================================================
// FUNÇÕES HELPER PARA SUPABASE
// ============================================================================

// Helper para tratamento de erros
export function handleSupabaseError(error: any, context: string): never {
  console.error(`❌ Erro no Supabase (${context}):`, error);
  
  if (error.code === 'PGRST116') {
    throw new Error('Dados não encontrados');
  }
  
  if (error.code === 'PGRST301') {
    throw new Error('Erro de validação dos dados');
  }
  
  if (error.code === 'PGRST302') {
    throw new Error('Erro de permissão');
  }
  
  throw new Error(error.message || 'Erro desconhecido no banco de dados');
}

// Helper para validação de dados
export function validateData<T>(data: T | null, context: string): T {
  if (data === null) {
    throw new Error(`${context} não encontrado`);
  }
  return data;
}

// Helper para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function buildPaginationQuery(params: PaginationParams) {
  const { page, limit, sortBy, sortOrder } = params;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('users')
    .select('*');
  
  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }
  
  // Aplicar paginação manualmente
  return { query, offset, limit };
}

// ============================================================================
// FUNÇÕES DE USUÁRIO
// ============================================================================

// Buscar usuário por ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) handleSupabaseError(error, 'getUserById');
  return validateData(data, 'Usuário');
}

// Buscar usuário por Clerk ID
export async function getUserByClerkId(clerkId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error) handleSupabaseError(error, 'getUserByClerkId');
  return validateData(data, 'Usuário');
}

// Criar usuário
export async function createUser(userData: {
  clerk_id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  role: string;
  box?: string;
  cidade?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      is_active: true,
      profile_complete: false,
      test_user: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'createUser');
  return validateData(data, 'Usuário criado');
}

// Atualizar usuário
export async function updateUser(userId: string, updates: Partial<{
  display_name: string;
  photo_url: string;
  role: string;
  box: string;
  cidade: string;
  is_active: boolean;
  profile_complete: boolean;
}>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'updateUser');
  return validateData(data, 'Usuário atualizado');
}

// Buscar usuários com filtros
export async function getUsers(filters: {
  role?: string;
  is_active?: boolean;
  profile_complete?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('users')
    .select('*');
  
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  
  if (filters.profile_complete !== undefined) {
    query = query.eq('profile_complete', filters.profile_complete);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) handleSupabaseError(error, 'getUsers');
  return data || [];
}

// ============================================================================
// FUNÇÕES DE GAMIFICAÇÃO
// ============================================================================

// Buscar dados de gamificação do usuário
export async function getUserGamification(userId: string) {
  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) handleSupabaseError(error, 'getUserGamification');
  return data;
}

// Atualizar tokens do usuário
export async function updateUserTokens(userId: string, tokens: number, action: string) {
  const { data, error } = await supabase
    .from('user_gamification')
    .upsert({
      user_id: userId,
      box_tokens: tokens,
      last_action: action,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'updateUserTokens');
  return validateData(data, 'Gamificação atualizada');
}

// Registrar ação de gamificação
export async function logGamificationAction(actionData: {
  user_id: string;
  action: string;
  tokens_earned: number;
  metadata?: any;
}) {
  const { data, error } = await supabase
    .from('gamification_actions')
    .insert([{
      ...actionData,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'logGamificationAction');
  return validateData(data, 'Ação de gamificação registrada');
}

// ============================================================================
// FUNÇÕES DE PAGAMENTO
// ============================================================================

// Criar pagamento
export async function createPayment(paymentData: {
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  correlation_id: string;
  metadata?: any;
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      ...paymentData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'createPayment');
  return validateData(data, 'Pagamento criado');
}

// Atualizar status do pagamento
export async function updatePaymentStatus(paymentId: string, status: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'updatePaymentStatus');
  return validateData(data, 'Status do pagamento atualizado');
}

// ============================================================================
// FUNÇÕES DE EVENTO
// ============================================================================

// Buscar eventos
export async function getEvents(filters: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('events')
    .select('*');
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) handleSupabaseError(error, 'getEvents');
  return data || [];
}

// ============================================================================
// FUNÇÕES DE INSCRIÇÃO
// ============================================================================

// Criar inscrição
export async function createRegistration(registrationData: {
  user_id: string;
  event_id: string;
  category: string;
  lot: string;
}) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      ...registrationData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'createRegistration');
  return validateData(data, 'Inscrição criada');
}

// ============================================================================
// FUNÇÕES DE PATROCINADOR
// ============================================================================

// Buscar patrocinadores
export async function getSponsors(filters: {
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('sponsors')
    .select('*');
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) handleSupabaseError(error, 'getSponsors');
  return data || [];
}

// ============================================================================
// FUNÇÕES DE CONVITE
// ============================================================================

// Criar convite
export async function createInvite(inviteData: {
  inviter_id: string;
  invitee_email: string;
  role: string;
}) {
  const { data, error } = await supabase
    .from('invites')
    .insert([{
      ...inviteData,
      status: 'pendente',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'createInvite');
  return validateData(data, 'Convite criado');
}

// Atualizar status do convite
export async function updateInviteStatus(inviteId: string, status: string) {
  const { data, error } = await supabase
    .from('invites')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inviteId)
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'updateInviteStatus');
  return validateData(data, 'Status do convite atualizado');
}

// ============================================================================
// FUNÇÕES DE NOTIFICAÇÃO
// ============================================================================

// Criar notificação
export async function createNotification(notificationData: {
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      ...notificationData,
      read: false,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'createNotification');
  return validateData(data, 'Notificação criada');
}

// Marcar notificação como lida
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({
      read: true,
    })
    .eq('id', notificationId)
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'markNotificationAsRead');
  return validateData(data, 'Notificação marcada como lida');
}

// ============================================================================
// FUNÇÕES DE ANALYTICS
// ============================================================================

// Registrar evento de analytics
export async function logAnalyticsEvent(eventData: {
  user_id?: string;
  event_name: string;
  event_data?: any;
  user_agent?: string;
  ip_address?: string;
}) {
  const { data, error } = await supabase
    .from('analytics_events')
    .insert([{
      ...eventData,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'logAnalyticsEvent');
  return validateData(data, 'Evento de analytics registrado');
}

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================================================================

// Buscar configuração da aplicação
export async function getAppConfig(key: string) {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) handleSupabaseError(error, 'getAppConfig');
  return data?.value;
}

// Atualizar configuração da aplicação
export async function updateAppConfig(key: string, value: string, description?: string) {
  const { data, error } = await supabase
    .from('app_config')
    .upsert({
      key,
      value,
      description,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error, 'updateAppConfig');
  return validateData(data, 'Configuração atualizada');
}

