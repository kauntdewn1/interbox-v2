// ============================================================================
// CLIENTE SUPABASE COM CLERK - INTERBØX V2
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente Supabase configurado para Clerk
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Clerk gerencia o refresh
    persistSession: false,   // Clerk gerencia a sessão
    detectSessionInUrl: false
  },
  global: {
    headers: {
      // Headers serão adicionados dinamicamente com o JWT do Clerk
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ============================================================================
// FUNÇÃO PARA CONFIGURAR JWT DO CLERK
// ============================================================================

export async function configureClerkAuth() {
  try {
    // Obter o token do Clerk
    const { getToken } = useAuth();
    const token = await getToken({ template: 'supabase' });
    
    if (token) {
      // Configurar o token no Supabase
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
      
      // Criar cliente com token
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });
      
      return client;
    } catch (error) {
      console.error('Erro ao obter cliente Supabase:', error);
      throw error;
    }
  };
  
  return {
    getSupabaseClient,
    isSignedIn
  };
}

// ============================================================================
// FUNÇÃO PARA TESTAR CONEXÃO CLERK + SUPABASE
// ============================================================================

export async function testClerkSupabaseConnection() {
  try {
    const { getToken } = useAuth();
    const token = await getToken({ template: 'supabase' });
    
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
      message: 'Conexão Clerk + Supabase funcionando'
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  supabase,
  configureClerkAuth,
  useSupabaseWithClerk,
  testClerkSupabaseConnection
};
