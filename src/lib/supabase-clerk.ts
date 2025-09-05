// ============================================================================
// SUPABASE + CLERK INTEGRATION - INTERBØX V2
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente Supabase padrão
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Configurar autenticação do Clerk no Supabase
 */
export async function configureClerkAuth(token: string) {
  try {
    if (token) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });
      console.log('✅ JWT do Clerk configurado no Supabase');
      return true;
    } else {
      console.warn('⚠️ Token do Clerk não encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao configurar JWT do Clerk:', error);
    return false;
  }
}

/**
 * Testar conexão Clerk + Supabase
 */
export async function testClerkSupabaseConnection(token: string) {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Token do Clerk não encontrado'
      };
    }

    // Testar conexão com Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: `Erro Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Conexão Clerk + Supabase funcionando!',
      data
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// ============================================================================
// HOOK PARA USAR SUPABASE COM CLERK
// ============================================================================

export function useSupabaseWithClerk() {
  const { getToken, isSignedIn } = useAuth();

  const getSupabaseClient = async () => {
    if (!isSignedIn) {
      throw new Error('Usuário não está autenticado');
    }
    
    try {
      // Obter token do Clerk
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        throw new Error('Token do Clerk não disponível');
      }
      
      // Configurar autenticação no Supabase
      await configureClerkAuth(token);
      
      return supabase;
    } catch (error) {
      console.error('Erro ao obter cliente Supabase:', error);
      throw error;
    }
  };

  return { getSupabaseClient };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase as default };
