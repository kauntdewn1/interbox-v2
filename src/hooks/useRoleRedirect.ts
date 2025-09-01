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

    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Se não tem categoria definida → Redireciona para inscrições externas
    if (!user?.publicMetadata?.role || user?.publicMetadata?.role === 'publico') {
      // Redireciona para página de inscrições externas
      window.location.href = 'https://interbox-captacao.netlify.app/';
      return;
    }

    // 🔒 VERIFICAÇÃO DE SEGURANÇA: Se tem categoria mas perfil incompleto → Redireciona para inscrições externas
    if (!user?.publicMetadata?.profileComplete) {
      // Redireciona para página de inscrições externas baseada no role
      switch (user?.publicMetadata?.role) {
        case 'atleta':
          window.location.href = 'https://interbox-captacao.netlify.app/';
          break;
        case 'judge':
        case 'staff':
          window.location.href = 'https://interbox-captacao.netlify.app/captacao/judge-staff';
          break;
        case 'midia':
          window.location.href = 'https://interbox-captacao.netlify.app/audiovisual';
          break;
        case 'espectador':
          window.location.href = 'https://interbox-captacao.netlify.app/';
          break;
        default:
          window.location.href = 'https://interbox-captacao.netlify.app/';
          break;
      }
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