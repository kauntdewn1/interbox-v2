import { SignInButton, useSignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Login() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { signIn, isLoaded } = useSignIn();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn]);

  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (!isLoaded) return;

      await signIn?.create({
        identifier: email,
        password,
      });

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Credenciais inválidas ou erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-600 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">INTERBØX</h1>
          <p className="text-gray-300 text-sm">Entre na Arena dos Consagrados</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/25"
          >
            {loading ? 'Entrando...' : 'Entrar com Email'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400">ou</span>
            </div>
          </div>

          <SignInButton mode="modal">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500">
              Entrar com Google
            </button>
          </SignInButton>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <a href="/signup" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
