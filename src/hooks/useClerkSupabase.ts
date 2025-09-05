// ============================================================================
// HOOK PARA INTEGRAÇÃO CLERK + SUPABASE - INTERBØX V2
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { useUser as useSupabaseUser, useGamification, useCreateUserWithGamification } from './useSupabase';
import type { User, UserRole } from '../types/supabase';

// ============================================================================
// HOOK PRINCIPAL DE INTEGRAÇÃO
// ============================================================================

export function useClerkSupabase() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useAuth();
  const [_supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks do Supabase
  const { 
    user: dbUser, 
    loading: userLoading, 
    error: userError,
    createUser: _createDbUser 
  } = useSupabaseUser(clerkUser?.id || '');
  
  const { 
    gamification, 
    loading: gamificationLoading,
    addTokens 
  } = useGamification(dbUser?.id || '');
  
  const { 
    createUser: createUserWithGamification,
    loading: createLoading 
  } = useCreateUserWithGamification();

  // ============================================================================
  // CONFIGURAÇÃO JWT DO CLERK
  // ============================================================================

  const configureClerkJWT = useCallback(async () => {
    if (!clerkUser) return false;
    
    try {
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
  }, [clerkUser, getToken]);

  // ============================================================================
  // FUNÇÕES DE SINCRONIZAÇÃO
  // ============================================================================

  const syncUserToSupabase = useCallback(async () => {
    if (!clerkUser || !clerkLoaded) return;

    try {
      setLoading(true);
      setError(null);

      // Verificar se usuário já existe no Supabase
      if (dbUser) {
        // Atualizar dados se necessário
        const updates: Record<string, unknown> = {};
        
        if (dbUser.email !== clerkUser.emailAddresses[0]?.emailAddress) {
          updates.email = clerkUser.emailAddresses[0]?.emailAddress;
        }
        
        if (dbUser.display_name !== clerkUser.fullName) {
          updates.display_name = clerkUser.fullName;
        }
        
        if (dbUser.photo_url !== clerkUser.imageUrl) {
          updates.photo_url = clerkUser.imageUrl;
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('users')
            .update(updates)
            .eq('clerk_id', clerkUser.id);
        }
      } else {
        // Criar novo usuário no Supabase
        const role = (clerkUser.publicMetadata?.role as UserRole) || 'publico';
        
        await createUserWithGamification(
          clerkUser.id,
          clerkUser.emailAddresses[0]?.emailAddress || '',
          clerkUser.fullName || 'Usuário',
          role
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sincronizar usuário');
      console.error('Erro ao sincronizar usuário:', err);
    } finally {
      setLoading(false);
    }
  }, [clerkUser, clerkLoaded, dbUser, createUserWithGamification]);

  const updateUserRole = useCallback(async (role: UserRole) => {
    if (!clerkUser || !dbUser) return;

    try {
      setError(null);

      // Atualizar no Supabase
      await supabase
        .from('users')
        .update({ role, profile_complete: true })
        .eq('clerk_id', clerkUser.id);

      // Atualizar no Clerk (comentado temporariamente devido a problemas de tipagem)
      // await clerkUser.update({
      //   publicMetadata: {
      //     ...clerkUser.publicMetadata,
      //     role,
      //     profileComplete: true
      //   }
      // });

      // Adicionar tokens por completar perfil
      if (gamification) {
        await addTokens(25, 'achievement', 'Perfil completo - Bônus de boas-vindas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar role');
      throw err;
    }
  }, [clerkUser, dbUser, gamification, addTokens]);

  const completeProfile = useCallback(async (profileData: {
    whatsapp?: string;
    box?: string;
    cidade?: string;
    mensagem?: string;
    role: UserRole;
  }) => {
    if (!clerkUser || !dbUser) return;

    try {
      setError(null);

      // Atualizar no Supabase
      await supabase
        .from('users')
        .update({
          ...profileData,
          profile_complete: true
        })
        .eq('clerk_id', clerkUser.id);

      // Atualizar no Clerk (comentado temporariamente devido a problemas de tipagem)
      // await clerkUser.update({
      //   publicMetadata: {
      //     ...clerkUser.publicMetadata,
      //     role: profileData.role,
      //     profileComplete: true
      //   }
      // });

      // Adicionar tokens por completar perfil
      if (gamification) {
        await addTokens(25, 'achievement', 'Perfil completo - Bônus de boas-vindas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar perfil');
      throw err;
    }
  }, [clerkUser, dbUser, gamification, addTokens]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      // Configurar JWT do Clerk primeiro
      configureClerkJWT().then(() => {
        // Depois sincronizar usuário
        syncUserToSupabase();
      });
    }
  }, [clerkLoaded, clerkUser, configureClerkJWT, syncUserToSupabase]);

  useEffect(() => {
    setSupabaseUser(dbUser);
  }, [dbUser]);

  // ============================================================================
  // ESTADO COMPUTADO
  // ============================================================================

  const isLoading = loading || userLoading || gamificationLoading || createLoading || !clerkLoaded;
  const hasError = error || userError;

  const isProfileComplete = Boolean(
    dbUser?.profile_complete && 
    clerkUser?.publicMetadata?.profileComplete
  );

  const userRole = (clerkUser?.publicMetadata?.role as UserRole) || 
                   dbUser?.role || 
                   'publico';

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estados
    clerkUser,
    supabaseUser: dbUser,
    gamification,
    loading: isLoading,
    error: hasError,
    
    // Flags
    isProfileComplete,
    userRole,
    isLoaded: clerkLoaded,
    
    // Funções
    syncUserToSupabase,
    updateUserRole,
    completeProfile,
    addTokens,
    configureClerkJWT,
    
    // Dados combinados
    user: {
      id: clerkUser?.id,
      email: clerkUser?.emailAddresses[0]?.emailAddress,
      name: clerkUser?.fullName,
      image: clerkUser?.imageUrl,
      role: userRole,
      profileComplete: isProfileComplete,
      tokens: gamification?.box_tokens || 0,
      level: gamification?.level || 'cindy',
      achievements: gamification?.achievements || [],
      badges: gamification?.badges || []
    }
  };
}

// ============================================================================
// HOOK PARA VERIFICAÇÃO DE PERMISSÕES
// ============================================================================

export function usePermissions() {
  const { userRole, isProfileComplete } = useClerkSupabase();

  const hasRole = useCallback((requiredRole: UserRole | UserRole[]) => {
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }, [userRole]);

  const isAdmin = hasRole(['admin', 'dev']);
  const isStaff = hasRole(['admin', 'dev', 'marketing', 'staff']);
  const isAtleta = hasRole('atleta');
  const isJudge = hasRole('judge');
  const isMidia = hasRole('midia');

  return {
    hasRole,
    isAdmin,
    isStaff,
    isAtleta,
    isJudge,
    isMidia,
    isProfileComplete,
    userRole
  };
}

// ============================================================================
// HOOK PARA GAMIFICAÇÃO INTEGRADA
// ============================================================================

export function useIntegratedGamification() {
  const { gamification, addTokens, userRole } = useClerkSupabase();
  const [loading, setLoading] = useState(false);

  const awardTokens = useCallback(async (
    action: string,
    amount: number,
    description?: string
  ) => {
    try {
      setLoading(true);
      await addTokens(amount, 'earn', description || `Ação: ${action}`);
    } catch (err) {
      console.error('Erro ao conceder tokens:', err);
    } finally {
      setLoading(false);
    }
  }, [addTokens]);

  const getLevelInfo = useCallback((level: string) => {
    const levels = {
      'cindy': { name: 'Cindy', description: 'Base', minTokens: 0, color: '#10B981' },
      'helen': { name: 'Helen', description: 'Avançado', minTokens: 100, color: '#3B82F6' },
      'fran': { name: 'Fran', description: 'Intermediário', minTokens: 300, color: '#8B5CF6' },
      'annie': { name: 'Annie', description: 'Iniciante', minTokens: 600, color: '#F59E0B' },
      'murph': { name: 'Murph', description: 'Expert', minTokens: 1000, color: '#EF4444' },
      'matt': { name: 'Matt', description: 'Master', minTokens: 2000, color: '#EC4899' }
    };
    
    return levels[level as keyof typeof levels] || levels.cindy;
  }, []);

  return {
    gamification,
    awardTokens,
    getLevelInfo,
    loading,
    userRole
  };
}
