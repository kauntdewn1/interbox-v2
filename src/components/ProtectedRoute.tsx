import React from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

// ============================================================================
// TIPOS
// ============================================================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

interface AccessControlProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

interface AccessDeniedProps {
  title: string;
  message: string;
  userRole?: string;
  fallback?: React.ReactNode;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/login',
  showLoading = true,
}: ProtectedRouteProps) {
  const { isSignedIn, loading, } = useAuth();

  if (loading && showLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-black"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </motion.div>
    );
  }

  if (!isSignedIn) {
    window.location.href = redirectTo;
    return null;
  }

  if (requiredRole || requiredPermission) {
    return (
      <AccessControl
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        fallback={fallback}
      >
        {children}
      </AccessControl>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE DE CONTROLE DE ACESSO
// ============================================================================
function AccessControl({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: AccessControlProps) {
  const { user } = useAuth();

  const userRole = user?.unsafeMetadata?.role as string | undefined;
  const permissions = (user?.unsafeMetadata?.permissions || {}) as Record<string, boolean>;

  if (requiredRole && userRole !== requiredRole) {
    return (
      <AccessDenied
        title="Acesso Negado"
        message={`Esta página requer o role: ${requiredRole}`}
        userRole={userRole}
        fallback={fallback}
      />
    );
  }

  if (requiredPermission && !permissions[requiredPermission]) {
    return (
      <AccessDenied
        title="Permissão Insuficiente"
        message="Você não tem permissão para acessar esta funcionalidade."
        userRole={userRole}
        fallback={fallback}
      />
    );
  }

  return <>{children}</>;
}

// ============================================================================
// COMPONENTE DE ACESSO NEGADO
// ============================================================================
function AccessDenied({ title, message, userRole, fallback }: AccessDeniedProps) {
  if (fallback) return <>{fallback}</>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-screen bg-black"
    >
      <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700 max-w-md mx-4">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-4">{message}</p>
        {userRole && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-400">Seu role atual:</p>
            <p className="text-pink-400 font-semibold capitalize">{userRole}</p>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Ir para Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ROTAS ESPECÍFICAS
// ============================================================================
export const AdminRoute = (props: ProtectedRouteProps) => (
  <ProtectedRoute requiredRole="admin" {...props} />
);

export const AtletaRoute = (props: ProtectedRouteProps) => (
  <ProtectedRoute requiredRole="atleta" {...props} />
);

export const JudgeRoute = (props: ProtectedRouteProps) => (
  <ProtectedRoute requiredRole="judge" {...props} />
);

export const MidiaRoute = (props: ProtectedRouteProps) => (
  <ProtectedRoute requiredRole="midia" {...props} />
);

export const StaffRoute = (props: ProtectedRouteProps) => (
  <ProtectedRoute requiredRole="staff" {...props} />
);

export const ProfileCompleteRoute = ({ children, }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const { user } = useAuth();
  const isComplete = user?.unsafeMetadata?.profileComplete;

  if (!isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen bg-black"
      >
        <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700 max-w-md mx-4">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-4">Perfil Incompleto</h2>
          <p className="text-gray-300 mb-6">
            Complete seu perfil para acessar esta funcionalidade.
          </p>
          <button
            onClick={() => window.location.href = '/perfil'}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Completar Perfil
          </button>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// HOOK DE ACESSO (opcional)
// ============================================================================
export function useRouteAccess(requiredRole?: string, requiredPermission?: string) {
    const { isSignedIn, loading, user } = useAuth();
  
    const role = user?.unsafeMetadata?.role as string | undefined;
    const permissions = (user?.unsafeMetadata?.permissions || {}) as Record<string, boolean>;
  
    const hasAccess = React.useMemo(() => {
      if (loading || !isSignedIn) return false;
      if (requiredRole && role !== requiredRole) return false;
      if (requiredPermission && !permissions[requiredPermission]) return false;
      return true;
    }, [loading, isSignedIn, role, requiredRole, requiredPermission, permissions]);
  
    return {
      hasAccess,
      loading,
      user,
      permissions,
    };
  }
  