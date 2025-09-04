// ============================================================================
// RLS SETUP - INTERBØX V2
// ============================================================================
// Configuração e verificação das políticas de Row Level Security

import { supabase } from './supabase';

// ============================================================================
// TIPOS PARA RLS
// ============================================================================

export interface RLSPolicy {
  table: string;
  policy: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  definition: string;
}

export interface RLSStatus {
  table: string;
  enabled: boolean;
  policies: number;
}

// ============================================================================
// POLÍTICAS RLS DEFINIDAS
// ============================================================================

export const RLS_POLICIES: RLSPolicy[] = [
  // Users policies
  {
    table: 'users',
    policy: 'Users can view own profile',
    command: 'SELECT',
    definition: 'clerk_id = auth.jwt() ->> \'sub\''
  },
  {
    table: 'users',
    policy: 'Users can update own profile',
    command: 'UPDATE',
    definition: 'clerk_id = auth.jwt() ->> \'sub\''
  },
  {
    table: 'users',
    policy: 'Users can insert own profile',
    command: 'INSERT',
    definition: 'clerk_id = auth.jwt() ->> \'sub\''
  },
  {
    table: 'users',
    policy: 'Staff can view all users',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'users',
    policy: 'Staff can update all users',
    command: 'UPDATE',
    definition: 'auth.is_staff()'
  },
  {
    table: 'users',
    policy: 'Public user data for leaderboard',
    command: 'SELECT',
    definition: 'true'
  },

  // User Gamification policies
  {
    table: 'user_gamification',
    policy: 'Users can view own gamification',
    command: 'SELECT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'user_gamification',
    policy: 'Users can update own gamification',
    command: 'UPDATE',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'user_gamification',
    policy: 'Users can insert own gamification',
    command: 'INSERT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'user_gamification',
    policy: 'Staff can view all gamification',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'user_gamification',
    policy: 'Staff can update all gamification',
    command: 'UPDATE',
    definition: 'auth.is_staff()'
  },
  {
    table: 'user_gamification',
    policy: 'Public leaderboard access',
    command: 'SELECT',
    definition: 'true'
  },

  // Transactions policies
  {
    table: 'transactions',
    policy: 'Users can view own transactions',
    command: 'SELECT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'transactions',
    policy: 'Users can insert own transactions',
    command: 'INSERT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'transactions',
    policy: 'Staff can view all transactions',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'transactions',
    policy: 'Staff can insert all transactions',
    command: 'INSERT',
    definition: 'auth.is_staff()'
  },

  // Teams policies
  {
    table: 'teams',
    policy: 'Users can view own teams',
    command: 'SELECT',
    definition: 'captain_id = auth.user_id() OR auth.user_id() = ANY(members)'
  },
  {
    table: 'teams',
    policy: 'Captains can update own teams',
    command: 'UPDATE',
    definition: 'captain_id = auth.user_id()'
  },
  {
    table: 'teams',
    policy: 'Captains can insert teams',
    command: 'INSERT',
    definition: 'captain_id = auth.user_id()'
  },
  {
    table: 'teams',
    policy: 'Staff can view all teams',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'teams',
    policy: 'Staff can update all teams',
    command: 'UPDATE',
    definition: 'auth.is_staff()'
  },

  // Team Invites policies
  {
    table: 'team_invites',
    policy: 'Users can view sent invites',
    command: 'SELECT',
    definition: 'inviter_id = auth.user_id()'
  },
  {
    table: 'team_invites',
    policy: 'Users can view received invites',
    command: 'SELECT',
    definition: 'invitee_email = (SELECT email FROM users WHERE clerk_id = auth.jwt() ->> \'sub\')'
  },
  {
    table: 'team_invites',
    policy: 'Users can insert invites',
    command: 'INSERT',
    definition: 'inviter_id = auth.user_id()'
  },
  {
    table: 'team_invites',
    policy: 'Users can update received invites',
    command: 'UPDATE',
    definition: 'invitee_email = (SELECT email FROM users WHERE clerk_id = auth.jwt() ->> \'sub\')'
  },
  {
    table: 'team_invites',
    policy: 'Staff can view all invites',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'team_invites',
    policy: 'Staff can update all invites',
    command: 'UPDATE',
    definition: 'auth.is_staff()'
  },

  // Patrocinadores policies
  {
    table: 'patrocinadores',
    policy: 'Staff can view all sponsors',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'patrocinadores',
    policy: 'Staff can insert sponsors',
    command: 'INSERT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'patrocinadores',
    policy: 'Staff can update sponsors',
    command: 'UPDATE',
    definition: 'auth.is_staff()'
  },
  {
    table: 'patrocinadores',
    policy: 'Staff can delete sponsors',
    command: 'DELETE',
    definition: 'auth.is_staff()'
  },

  // Analytics Events policies
  {
    table: 'analytics_events',
    policy: 'Users can insert own analytics',
    command: 'INSERT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'analytics_events',
    policy: 'Staff can view all analytics',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  },

  // Notifications policies
  {
    table: 'notifications',
    policy: 'Users can view own notifications',
    command: 'SELECT',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'notifications',
    policy: 'Users can update own notifications',
    command: 'UPDATE',
    definition: 'user_id = auth.user_id()'
  },
  {
    table: 'notifications',
    policy: 'Staff can insert notifications',
    command: 'INSERT',
    definition: 'auth.is_staff()'
  },
  {
    table: 'notifications',
    policy: 'Staff can view all notifications',
    command: 'SELECT',
    definition: 'auth.is_staff()'
  }
];

// ============================================================================
// FUNÇÕES DE VERIFICAÇÃO RLS
// ============================================================================

/**
 * Verifica o status do RLS em todas as tabelas
 */
export async function checkRLSStatus(): Promise<RLSStatus[]> {
  try {
    const { data, error } = await supabase.rpc('get_rls_status');
    
    if (error) {
      console.error('Erro ao verificar status RLS:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Erro ao verificar status RLS:', err);
    return [];
  }
}

/**
 * Verifica se o RLS está habilitado em uma tabela específica
 */
export async function isRLSEnabled(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('rowsecurity')
      .eq('tablename', tableName)
      .eq('schemaname', 'public')
      .single();

    if (error) {
      console.error(`Erro ao verificar RLS para ${tableName}:`, error);
      return false;
    }

    return data?.rowsecurity || false;
  } catch (err) {
    console.error(`Erro ao verificar RLS para ${tableName}:`, err);
    return false;
  }
}

/**
 * Verifica se as funções auxiliares do RLS existem
 */
export async function checkRLSFunctions(): Promise<boolean> {
  try {
    const functions = ['auth.user_id', 'auth.is_admin', 'auth.is_staff'];
    
    for (const func of functions) {
      const { data, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', func.split('.')[1])
        .eq('pronamespace', 'auth')
        .single();

      if (error || !data) {
        console.error(`Função ${func} não encontrada`);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Erro ao verificar funções RLS:', err);
    return false;
  }
}

// ============================================================================
// FUNÇÕES DE TESTE RLS
// ============================================================================

/**
 * Testa se o RLS está funcionando corretamente
 */
export async function testRLS(): Promise<{
  success: boolean;
  tests: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
}> {
  const tests = [];

  try {
    // Teste 1: Verificar se RLS está habilitado
    const rlsEnabled = await isRLSEnabled('users');
    tests.push({
      name: 'RLS habilitado em users',
      passed: rlsEnabled
    });

    // Teste 2: Verificar funções auxiliares
    const functionsExist = await checkRLSFunctions();
    tests.push({
      name: 'Funções auxiliares existem',
      passed: functionsExist
    });

    // Teste 3: Tentar acessar dados sem autenticação (deve falhar)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      tests.push({
        name: 'Acesso sem autenticação bloqueado',
        passed: error !== null || data === null
      });
    } catch (err) {
      tests.push({
        name: 'Acesso sem autenticação bloqueado',
        passed: true
      });
    }

    const allPassed = tests.every(test => test.passed);

    return {
      success: allPassed,
      tests
    };
  } catch (err) {
    return {
      success: false,
      tests: [{
        name: 'Teste geral RLS',
        passed: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }]
    };
  }
}

// ============================================================================
// FUNÇÃO DE INICIALIZAÇÃO RLS
// ============================================================================

/**
 * Inicializa e verifica a configuração RLS
 */
export async function initializeRLS(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🔐 Inicializando verificação RLS...');

    // Verificar status geral
    const rlsStatus = await checkRLSStatus();
    const functionsExist = await checkRLSFunctions();
    const testResults = await testRLS();

    const details = {
      rlsStatus,
      functionsExist,
      testResults
    };

    if (testResults.success) {
      return {
        success: true,
        message: '✅ RLS configurado e funcionando corretamente',
        details
      };
    } else {
      return {
        success: false,
        message: '❌ RLS não está funcionando corretamente',
        details
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `❌ Erro ao inicializar RLS: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      details: { error: err }
    };
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  RLS_POLICIES,
  checkRLSStatus,
  isRLSEnabled,
  checkRLSFunctions,
  testRLS,
  initializeRLS
};
