
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthModal } from '../hooks/useAuthModal';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

/**
 * Componente BRUTAL para testar o modal do Cerrado INTERBØX
 * Agora com tradução PT-BR e estilização foda
 */
export default function ClerkLocalizationTest() {
  const { isSignedIn } = useUser();
  const { isSignInOpen, isSignUpOpen, openSignIn, openSignUp, closeAll } = useAuthModal();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">🔥 Modal BRUTAL do Cerrado INTERBØX</h2>
          <p className="text-white/70 mb-6">Agora com MetaMask, PT-BR e estilização foda!</p>
          
          <div className="space-y-4">
            <button 
              onClick={openSignIn}
              className="block w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-bold"
            >
              🔐 ENTRAR (Modal Brutal)
            </button>
            
            <button 
              onClick={openSignUp}
              className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
            >
              🚀 CADASTRAR (Modal Brutal)
            </button>
          </div>
          
          {isSignedIn && (
            <div className="mt-6 p-4 bg-green-600/20 border border-green-500 rounded-lg">
              <p className="text-green-400">✅ Usuário logado! Modal funcionando perfeitamente!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SignInModal isOpen={isSignInOpen} onClose={closeAll} />
      <SignUpModal isOpen={isSignUpOpen} onClose={closeAll} />
    </>
  );
}
