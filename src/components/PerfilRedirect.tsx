import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function PerfilRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    // Se não há usuário, redireciona para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Se não tem role definido, vai para seleção de tipo
    if (!user?.unsafeMetadata?.role) {
      navigate('/selecao-tipo-cadastro', { replace: true });
      return;
    }

    // Se tem role mas perfil incompleto, vai para setup
    if (!user?.unsafeMetadata?.profileComplete) {
      navigate('/setup', { replace: true });
      return;
    }

    // Redireciona baseado no role
    const role = user.unsafeMetadata.role as string;
    switch (role) {
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
        // Para roles não reconhecidos, vai para espectador
        navigate('/perfil/espectador', { replace: true });
        break;
    }
  }, [user, loading, navigate]);

  // Mostra loading enquanto redireciona
  return <LoadingScreen />;
}
