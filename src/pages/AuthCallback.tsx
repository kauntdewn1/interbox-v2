import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useOAuth2 from '../hooks/useOAuth2';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exchangeCodeForTokens, getUserInfo, isLoading, error } = useOAuth2();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          console.error('Erro de autorização:', error);
          return;
        }

        if (!code) {
          setStatus('error');
          console.error('Código de autorização não encontrado');
          return;
        }

        // Trocar código por tokens
        const tokens = await exchangeCodeForTokens(code, state || '');
        
        // Salvar tokens
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('id_token', tokens.id_token);
        if (tokens.refresh_token) {
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }

        // Obter informações do usuário
        await getUserInfo(tokens.access_token);

        setStatus('success');
        
        // Redirecionar para home após 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (err) {
        console.error('Erro no callback:', err);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, exchangeCodeForTokens, getUserInfo, navigate]);

  if (isLoading || status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Processando autenticação...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Erro na Autenticação</h2>
          <p className="text-gray-300 mb-6">
            Ocorreu um erro durante o processo de autenticação.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700 max-w-md mx-4">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-4">Autenticação Bem-sucedida!</h2>
        <p className="text-gray-300 mb-6">
          Você foi autenticado com sucesso. Redirecionando...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
      </div>
    </div>
  );
}
