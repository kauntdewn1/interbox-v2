import type { UserResource } from '@clerk/types';

// ============================================================================
// CONFIGURAÇÃO DO CLERK - SUBSTITUI FIREBASE AUTH
// ============================================================================

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY não encontrada no .env');
}

// 🔒 CONFIGURAÇÕES PARA USAR CLERK COMO IDP (OIDC/OAuth2)
export const CLERK_LOCAL_CONFIG = {
  // URLs OIDC/OAuth2
  discoveryUrl: 'https://clerk.cerradointerbox.com.br/.well-known/openid-configuration',
  authorizeUrl: 'https://clerk.cerradointerbox.com.br/oauth/authorize',
  tokenUrl: 'https://clerk.cerradointerbox.com.br/oauth/token',
  userInfoUrl: 'https://clerk.cerradointerbox.com.br/oauth/userinfo',
  tokenIntrospectionUrl: 'https://clerk.cerradointerbox.com.br/oauth/token_info',
  
  // URLs de redirecionamento
  signInUrl: 'https://accounts.cerradointerbox.com.br/sign-in',
  signUpUrl: 'https://accounts.cerradointerbox.com.br/sign-up',
  signInFallbackRedirectUrl: '/',
  signUpFallbackRedirectUrl: '/setup',
  userProfileUrl: '/perfil',
  
  // Configurações OAuth2
  clientId: import.meta.env.VITE_CLERK_CLIENT_ID,
  clientSecret: import.meta.env.VITE_CLERK_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_CLERK_REDIRECT_URI || window.location.origin + '/auth/callback',
  scope: 'openid profile email',
  
  // Permite redirecionamentos externos para autenticação
  allowUrlRedirects: true,
  // Usa roteamento externo para auth
  routing: 'hash' as const,
};

export const clerkConfig = {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  // Configurações específicas para produção
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
  // Configurações de produção
  production: true,
  // Força ambiente de produção
  environment: 'production',
  // 🔒 CONFIGURAÇÕES PARA USAR DOMÍNIO EXTERNO DO CLERK
  signInUrl: 'https://accounts.cerradointerbox.com.br/sign-in',
  signUpUrl: 'https://accounts.cerradointerbox.com.br/sign-up',
  signInFallbackRedirectUrl: '/',
  signUpFallbackRedirectUrl: '/setup',
  // Permite redirecionamentos externos para autenticação
  allowUrlRedirects: true,
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
  signIn: 'https://accounts.cerradointerbox.com.br/sign-in',
  signUp: 'https://accounts.cerradointerbox.com.br/sign-up',
  signInFallbackRedirectUrl: '/',
  signUpFallbackRedirectUrl: '/setup',
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

// ============================================================================
// INTERFACES DE TIPAGEM
// ============================================================================

interface ClerkPublicMetadata {
  role?: string;
  profile_complete?: boolean;
  isActive?: boolean;
  testUser?: boolean;
  permissions?: Record<string, boolean>;
}

// ============================================================================
// FUNÇÕES HELPER TIPADAS
// ============================================================================

export const clerkHelpers = {
  hasRole: (user: UserResource | null | undefined, role: string): boolean => {
    const metadata = user?.publicMetadata as ClerkPublicMetadata | undefined;
    return metadata?.role === role;
  },

  getUserRole: (user: UserResource | null | undefined): string => {
    const metadata = user?.publicMetadata as ClerkPublicMetadata | undefined;
    return metadata?.role || 'publico';
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
    const metadata = user?.publicMetadata as ClerkPublicMetadata | undefined;
    return metadata?.profile_complete === true;
  },

  isActive: (user: UserResource | null | undefined): boolean => {
    const metadata = user?.publicMetadata as ClerkPublicMetadata | undefined;
    return metadata?.isActive !== false;
  },

  isTestUser: (user: UserResource | null | undefined): boolean => {
    const metadata = user?.publicMetadata as ClerkPublicMetadata | undefined;
    return metadata?.testUser === true;
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
