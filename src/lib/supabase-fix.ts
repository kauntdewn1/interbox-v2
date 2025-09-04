// ============================================================================
// CLIENTE SUPABASE CORRIGIDO - INTERBØX V2
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente Supabase sem tipagem estrita temporariamente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Tipos básicos para uso temporário
export type UserRole = 'publico' | 'atleta' | 'judge' | 'midia' | 'espectador' | 'admin' | 'dev' | 'marketing' | 'staff';
export type GamificationLevel = 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt';
export type TransactionType = 'earn' | 'spend' | 'transfer' | 'bonus' | 'referral' | 'achievement';
export type SponsorStatus = 'bronze' | 'prata' | 'ouro' | 'platina' | 'pending' | 'rejected';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Helpers de erro para Supabase
export function handleSupabaseError(error: any, context: string): never {
  console.error(`Erro no Supabase (${context}):`, error);
  throw new Error(`Erro no Supabase (${context}): ${error.message}`);
}

export function validateData<T>(data: T | null, context: string): T {
  if (!data) throw new Error(`${context} não encontrado.`);
  return data;
}
