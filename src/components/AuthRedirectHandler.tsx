import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function AuthRedirectHandler() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Usuário não logado - redireciona para login
      navigate('/login', { replace: true });
      return;
    }

    // Usuário logado - verifica o fluxo correto
    if (!user.unsafeMetadata?.role) {
      // Sem role definido - vai para seleção de tipo
      navigate('/selecao-tipo-cadastro', { replace: true });
      return;
    }

    if (!user.unsafeMetadata?.profileComplete) {
      // Com role mas perfil incompleto - vai para setup
      navigate('/setup', { replace: true });
      return;
    }

    // Perfil completo - redireciona baseado no role
    const role = user.unsafeMetadata.role as string;
    const roleMap: Record<string, string> = {
      'atleta': '/perfil/atleta',
      'judge': '/perfil/judge',
      'midia': '/perfil/midia',
      'espectador': '/perfil/espectador',
      'admin': '/admin',
      'dev': '/dev',
      'marketing': '/marketing',
    };

    const redirectPath = roleMap[role] || '/perfil/espectador';
    navigate(redirectPath, { replace: true });
  }, [user, isLoaded, navigate]);

  // Mostra loading enquanto processa
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-white">Redirecionando...</p>
      </div>
    </div>
  );
}
