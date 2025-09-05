// ============================================================================
// TESTE CLERK + SUPABASE - INTERBØX V2
// ============================================================================
// Componente para testar a integração entre Clerk e Supabase

import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useClerkSupabase } from '../hooks/useClerkSupabase';
import { supabase } from '../lib/supabase';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ClerkSupabaseTest() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { configureClerkJWT, user: supabaseUser, loading, error } = useClerkSupabase();
  
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'pending';
    message: string;
  }>>([]);
  const [testing, setTesting] = useState(false);

  // ============================================================================
  // FUNÇÕES DE TESTE
  // ============================================================================

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Usuário autenticado no Clerk',
        test: () => isSignedIn && !!user
      },
      {
        name: 'JWT Token disponível',
        test: async () => {
          const token = await getToken({ template: 'supabase' });
          return !!token;
        }
      },
      {
        name: 'Configuração JWT no Supabase',
        test: async () => {
          const result = await configureClerkJWT();
          return result;
        }
      },
      {
        name: 'Acesso aos dados do Supabase',
        test: async () => {
          const { data, error } = await supabase
            .from('users')
            .select('id, email, role')
            .limit(1);
          
          return !error && data !== null;
        }
      },
      {
        name: 'Usuário sincronizado no Supabase',
        test: () => !!supabaseUser
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        setTestResults(prev => [...prev, {
          test: test.name,
          status: result ? 'success' : 'error',
          message: result ? '✅ Passou' : '❌ Falhou'
        }]);
      } catch (err) {
        setTestResults(prev => [...prev, {
          test: test.name,
          status: 'error',
          message: `❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
        }]);
      }
    }

    setTesting(false);
  };

  const testJWTToken = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      console.log('JWT Token:', token);
      
      if (token) {
        // Decodificar JWT para verificar conteúdo
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        
        alert(`JWT Token obtido com sucesso!\n\nPayload:\n${JSON.stringify(payload, null, 2)}`);
      } else {
        alert('❌ JWT Token não encontrado. Verifique se o template "supabase" está configurado no Clerk.');
      }
    } catch (err) {
      console.error('Erro ao obter JWT:', err);
      alert(`❌ Erro ao obter JWT: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5);

      if (error) {
        console.error('Erro Supabase:', error);
        alert(`❌ Erro Supabase: ${error.message}`);
      } else {
        console.log('Dados Supabase:', data);
        alert(`✅ Conexão Supabase funcionando!\n\nDados encontrados: ${data?.length || 0} usuários`);
      }
    } catch (err) {
      console.error('Erro na conexão:', err);
      alert(`❌ Erro na conexão: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">🔐 Teste Clerk + Supabase</h2>
          <p className="text-white/70 mb-4">Faça login para testar a integração</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Teste Clerk + Supabase
          </h1>
          <p className="text-white/70">
            Verificação da integração entre autenticação Clerk e banco Supabase
          </p>
        </div>

        {/* Status do Usuário */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">👤 Status do Usuário</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Clerk</h3>
              <p className="text-white/70 text-sm">ID: {user?.id}</p>
              <p className="text-white/70 text-sm">Email: {user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-white/70 text-sm">Nome: {user?.fullName}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Supabase</h3>
              {loading ? (
                <p className="text-white/70 text-sm">Carregando...</p>
              ) : supabaseUser ? (
                <>
                  <p className="text-white/70 text-sm">ID: {supabaseUser.id}</p>
                  <p className="text-white/70 text-sm">Email: {supabaseUser.email}</p>
                  <p className="text-white/70 text-sm">Role: {supabaseUser.role}</p>
                </>
              ) : (
                <p className="text-red-400 text-sm">Usuário não encontrado no Supabase</p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">❌ Erro: {error}</p>
            </div>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔧 Testes Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={runTests}
              disabled={testing}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {testing ? 'Testando...' : '🧪 Executar Todos os Testes'}
            </button>
            
            <button
              onClick={testJWTToken}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              🔑 Testar JWT Token
            </button>
            
            <button
              onClick={testSupabaseConnection}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              🗄️ Testar Conexão Supabase
            </button>
          </div>
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Resultados dos Testes</h2>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    result.status === 'success' 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-red-500/20 border border-red-500/50'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    result.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.status === 'success' ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{result.test}</p>
                    <p className={`text-sm ${
                      result.status === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Instruções</h2>
          <div className="text-white/70 space-y-2">
            <p>1. <strong>JWT Template:</strong> Certifique-se de que o template &quot;supabase&quot; está configurado no Clerk Dashboard</p>
            <p>2. <strong>Supabase Config:</strong> Configure o JWT secret no Supabase Dashboard</p>
            <p>3. <strong>RLS Policies:</strong> Execute o script rls-policies-clerk.sql no Supabase</p>
            <p>4. <strong>Variáveis de Ambiente:</strong> Verifique se todas as variáveis estão configuradas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
