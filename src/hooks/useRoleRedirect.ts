import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth.ts';

export default function useRoleRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Se não há usuário, redireciona para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // 🔄 NOVO FLUXO: Se não tem role definido → Vai para seleção de tipo
    if (!user?.publicMetadata?.role) {
      navigate('/selecao-tipo-cadastro', { replace: true });
      return;
    }

    // 🔄 NOVO FLUXO: Se tem role mas perfil incompleto → Vai para setup
    if (!user?.publicMetadata?.profileComplete) {
      navigate('/setup', { replace: true });
      return;
    }

    // ✅ Se chegou aqui, usuário tem perfil completo → Redireciona baseado no role
    switch (user?.publicMetadata?.role) {
      case 'atleta':
        navigate('/perfil/atleta', { replace: true });
        break;
      case 'judge':
        navigate('/perfil/judge', { replace: true });
        break;
      case 'midia':
        navigate('/perfil/midia', { replace: true });
        break;
      case 'espectador':
        navigate('/perfil/espectador', { replace: true });
        break;
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'dev':
        navigate('/dev', { replace: true });
        break;
      case 'marketing':
        navigate('/marketing', { replace: true });
        break;
      default:
        navigate('/perfil', { replace: true });
        break;
    }
  }, [user, loading, navigate]);

  return { user, loading };
} 