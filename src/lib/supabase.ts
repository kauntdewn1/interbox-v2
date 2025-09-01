// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Create Supabase client - using any temporarily to avoid type issues
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'placeholder',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
) as any;

// 4. Constatantes e tipos de negócio
export type UserRole = 'publico' | 'atleta' | 'judge' | 'midia' | 'admin' | 'dev' | 'marketing' | 'fotografo' | 'espectador' | 'staff';
export const TIPOS_CADASTRO: UserRole[] = ['atleta', 'fotografo', 'midia', 'judge', 'staff'];

export type GamificationAction = 'cadastro' | 'indicacao_confirmada' | 'compra_ingresso' | 'envio_conteudo' | 'qr_scan_evento' | 'prova_extra' | 'participacao_enquete' | 'acesso_spoiler' | 'checkin_evento' | 'compartilhamento' | 'login_diario' | 'completar_perfil';
export type GamificationLevel = 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt';

export const GAMIFICATION_TOKENS: Record<GamificationAction, number> = {
  cadastro: 10,
  indicacao_confirmada: 50,
  compra_ingresso: 100,
  envio_conteudo: 75,
  qr_scan_evento: 25,
  prova_extra: 50,
  participacao_enquete: 15,
  acesso_spoiler: 20,
  checkin_evento: 30,
  compartilhamento: 10,
  login_diario: 5,
  completar_perfil: 25,
};

export const calculateGamificationLevel = (tokens: number): GamificationLevel => {
  if (tokens >= 2000) return 'matt';
  if (tokens >= 1000) return 'murph';
  if (tokens >= 600) return 'annie';
  if (tokens >= 300) return 'fran';
  if (tokens >= 100) return 'helen';
  return 'cindy';
};

// 5. Helpers de erro para Supabase
export function handleSupabaseError(error: any, context: string): never {
  console.error(`Erro no Supabase (${context}):`, error);
  throw new Error(`Erro no Supabase (${context}): ${error.message}`);
}

export function validateData<T>(data: T | null, context: string): T {
  if (!data) throw new Error(`${context} não encontrado.`);
  return data;
}


