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

// Cliente Supabase configurado para usar Clerk
// Usar instância global para evitar múltiplas instâncias
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usar tokens do Clerk em vez da autenticação nativa do Supabase
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'interbox-v2-clerk'
    }
  }
});

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

  // Cliente Supabase configurado com token do Clerk
  const getSupabaseClient = async () => {
    let headers: Record<string, string> = {};
    
    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Erro ao obter token do Clerk:', error);
      }
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers
      }
    });
  };

  return { getSupabaseClient };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase as default };
