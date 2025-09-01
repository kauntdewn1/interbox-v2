import type { UserResource } from '@clerk/types';

// ============================================================================
// CONFIGURAÇÃO DO CLERK - SUBSTITUI FIREBASE AUTH
// ============================================================================

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY não encontrada no .env');
}

export const clerkConfig = {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  appearance: {
    baseTheme: 'dark',
    variables: {
      colorPrimary: '#ec4899',
      colorBackground: '#000000',
      colorText: '#ffffff',
      colorTextSecondary: '#9ca3af',
      colorInputBackground: '#1f2937',
      colorInputBorder: '#374151',
      colorSuccess: '#10b981',
      colorDanger: '#ef4444',
      colorWarning: '#f59e0b',
    },
    elements: {
      formButtonPrimary: {
        backgroundColor: '#ec4899',
        '&:hover': {
          backgroundColor: '#db2777',
        },
      },
      card: {
        backgroundColor: '#111827',
        border: '1px solid #374151',
      },
      headerTitle: {
        color: '#ec4899',
      },
    },
  },
  localization: {
    locale: 'pt-BR',
    signIn: {
      title: 'Bem-vindo à INTERBØX',
      subtitle: 'Entre na Arena dos Consagrados',
    },
    signUp: {
      title: 'Junte-se à INTERBØX',
      subtitle: 'Crie sua conta e comece sua jornada',
    },
  },
};

export const clerkRedirectUrls = {
  signIn: '/login',
  signUp: '/cadastro',
  afterSignIn: '/dashboard',
  afterSignUp: '/setup-profile',
  userProfile: '/perfil',
};

export const clerkSecurityConfig = {
  allowedEmailDomains: [],
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialCharacters: true,
  },
  sessionConfig: {
    singleSessionMode: false,
    sessionTimeout: 30 * 24 * 60 * 60 * 1000,
  },
};

// FUNÇÕES HELPER TIPADAS
export const clerkHelpers = {
  hasRole: (user: UserResource | null | undefined, role: string): boolean => {
    return user?.publicMetadata?.role === role
  },

  getUserRole: (user: UserResource | null | undefined): string => {
    return (user?.publicMetadata?.role as string) || 'publico'
  },

  isAdmin: (user: UserResource | null | undefined): boolean => {
    const role = clerkHelpers.getUserRole(user)
    return role === 'admin' || role === 'dev'
  },

  isAtleta: (user: UserResource | null | undefined): boolean => {
    return clerkHelpers.getUserRole(user) === 'atleta'
  },

  isJudge: (user: UserResource | null | undefined): boolean => {
    return clerkHelpers.getUserRole(user) === 'judge'
  },

  isMidia: (user: UserResource | null | undefined): boolean => {
    return clerkHelpers.getUserRole(user) === 'midia'
  },

  isStaff: (user: UserResource | null | undefined): boolean => {
    return clerkHelpers.getUserRole(user) === 'staff'
  },

  isEspectador: (user: UserResource | null | undefined): boolean => {
    return clerkHelpers.getUserRole(user) === 'espectador'
  },

  hasCompleteProfile: (user: UserResource | null | undefined): boolean => {
    return user?.publicMetadata?.profileComplete === true
  },

  isActive: (user: UserResource | null | undefined): boolean => {
    return user?.publicMetadata?.isActive !== false
  },

  isTestUser: (user: UserResource | null | undefined): boolean => {
    return user?.publicMetadata?.testUser === true
  },
}


export const clerkWebhookConfig = {
  endpoints: {
    userCreated: '/api/webhooks/clerk/user-created',
    userUpdated: '/api/webhooks/clerk/user-updated',
    userDeleted: '/api/webhooks/clerk/user-deleted',
  },
  events: [
    'user.created',
    'user.updated',
    'user.deleted',
    'session.created',
    'session.ended',
  ],
};

export default clerkConfig;
