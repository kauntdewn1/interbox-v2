// ============================================================================
// RLS DASHBOARD - INTERBØX V2
// ============================================================================
// Componente para monitorar e testar Row Level Security

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRLS } from '../hooks/useRLS';
import { useUser } from '@clerk/clerk-react';
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  UserIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// TIPOS
// ============================================================================

interface RLSTestResult {
  test: string;
  passed: boolean;
  error?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function RLSDashboard() {
  const { user } = useUser();
  const { 
    status, 
    loading, 
    error, 
    testRLSAccess, 
    canAccess, 
    isStaff, 
    isAdmin,
    refresh 
  } = useRLS();
  
  const [testResults, setTestResults] = useState<RLSTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const runTests = async () => {
    setTesting(true);
    try {
      const results = await testRLSAccess();
      setTestResults(results);
    } catch (err) {
      console.error('Erro ao executar testes RLS:', err);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <CogIcon className="w-6 h-6 animate-spin text-blue-500" />;
    if (status.enabled) return <ShieldCheckIcon className="w-6 h-6 text-green-500" />;
    return <ShieldExclamationIcon className="w-6 h-6 text-red-500" />;
  };

  const getStatusColor = () => {
    if (loading) return 'text-blue-500';
    if (status.enabled) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (loading) return 'Verificando...';
    if (status.enabled) return 'RLS Ativo e Funcionando';
    return 'RLS com Problemas';
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h2 className="text-xl text-white/80 mb-2">Acesso Restrito</h2>
          <p className="text-white/60">Faça login para acessar o dashboard RLS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🔐 Dashboard RLS
              </h1>
              <p className="text-white/70">
                Monitoramento e testes de Row Level Security
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Status Geral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            {getStatusIcon()}
            <div>
              <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </h2>
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Usuário</span>
              </div>
              <p className="text-white/70 text-sm">
                {status.userAuthenticated ? 'Autenticado' : 'Não autenticado'}
              </p>
              {status.userRole && (
                <p className="text-purple-400 text-sm mt-1">
                  Role: {status.userRole}
                </p>
              )}
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Permissões</span>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">
                  Leitura própria: {status.permissions.canReadOwn ? '✅' : '❌'}
                </p>
                <p className="text-white/70 text-sm">
                  Escrita própria: {status.permissions.canWriteOwn ? '✅' : '❌'}
                </p>
                <p className="text-white/70 text-sm">
                  Leitura total: {status.permissions.canReadAll ? '✅' : '❌'}
                </p>
                <p className="text-white/70 text-sm">
                  Escrita total: {status.permissions.canWriteAll ? '✅' : '❌'}
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CogIcon className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Staff</span>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">
                  É Staff: {isStaff() ? '✅' : '❌'}
                </p>
                <p className="text-white/70 text-sm">
                  É Admin: {isAdmin() ? '✅' : '❌'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testes RLS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              🧪 Testes de Segurança
            </h2>
            <button
              onClick={runTests}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {testing ? 'Testando...' : 'Executar Testes'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                >
                  {result.passed ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{result.test}</p>
                    {result.error && (
                      <p className="text-red-400 text-sm mt-1">{result.error}</p>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    result.passed ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.passed ? 'PASSOU' : 'FALHOU'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Permissões Detalhadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            🔑 Permissões Detalhadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Recursos Próprios</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Perfil Próprio (Leitura)</span>
                  <span className={canAccess('own_profile', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('own_profile', 'read') ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Perfil Próprio (Escrita)</span>
                  <span className={canAccess('own_profile', 'write') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('own_profile', 'write') ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Gamificação Própria</span>
                  <span className={canAccess('own_gamification', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('own_gamification', 'read') ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Transações Próprias</span>
                  <span className={canAccess('own_transactions', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('own_transactions', 'read') ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Recursos Administrativos</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Todos os Usuários</span>
                  <span className={canAccess('all_users', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('all_users', 'read') ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Toda Gamificação</span>
                  <span className={canAccess('all_gamification', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('all_gamification', 'read') ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Patrocinadores</span>
                  <span className={canAccess('sponsors', 'read') ? 'text-green-400' : 'text-red-400'}>
                    {canAccess('sponsors', 'read') ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
