
import React from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';

/**
 * Componente para testar a localização do Clerk
 * Mostra os botões de SignIn e SignUp para verificar se estão em português
 */
export default function ClerkLocalizationTest() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl text-white mb-4">🔐 Teste de Localização Clerk</h2>
        <p className="text-white/70 mb-6">Verifique se os botões estão em português</p>
        
        <div className="space-y-4">
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Teste SignIn (Modal)
            </button>
          </SignInButton>
          
          <br />
          
          <SignUpButton mode="modal">
            <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors">
              Teste SignUp (Modal)
            </button>
          </SignUpButton>
        </div>
        
        {isSignedIn && (
          <div className="mt-6 p-4 bg-green-600/20 border border-green-500 rounded-lg">
            <p className="text-green-400">✅ Usuário logado! Localização funcionando.</p>
          </div>
        )}
      </div>
    </div>
  );
}
