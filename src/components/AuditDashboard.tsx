// ============================================================================
// DASHBOARD DE AUDITORIA - INTERBØX V2
// ============================================================================
// Componente para exibir logs de gamificação e auditoria de transações
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuditLogs, useAuditStatistics, useGamificationLogs, useTransactionAudit, type GamificationLog, type TransactionAudit, type AuditStatistics } from '../hooks/useAuditLogs';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AuditDashboard() {
  const [activeTab, setActiveTab] = useState<'logs' | 'transactions' | 'statistics'>('logs');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [days, setDays] = useState<number>(30);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Auditoria
        </h1>
        <p className="text-gray-600">
          Monitore logs de gamificação e auditoria de transações
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário (opcional)
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="ID do usuário"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período (dias)
            </label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={365}>1 ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Logs de Gamificação
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auditoria de Transações
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estatísticas
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'logs' && (
            <GamificationLogsTab userId={selectedUserId} />
          )}
          {activeTab === 'transactions' && (
            <TransactionAuditTab userId={selectedUserId} />
          )}
          {activeTab === 'statistics' && (
            <StatisticsTab days={days} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB DE LOGS DE GAMIFICAÇÃO
// ============================================================================

function GamificationLogsTab({ userId }: { userId: string }) {
  const { logs, loading, error, refetch } = useGamificationLogs(userId || undefined);

  if (loading) {
    return <div className="text-center py-8">Carregando logs...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Erro: {error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Logs de Gamificação</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Atualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nível
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {log.user_name || 'Usuário'}
                    </div>
                    <div className="text-sm text-gray-500">{log.user_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="text-gray-500">{log.tokens_before}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{log.tokens_after}</span>
                    <span className={`ml-2 text-sm ${log.tokens_delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({log.tokens_delta >= 0 ? '+' : ''}{log.tokens_delta})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.level_before && log.level_after ? (
                    <div className="flex items-center">
                      <span className="text-gray-500">{log.level_before}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{log.level_after}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'failed' ? 'bg-red-100 text-red-800' :
                    log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum log encontrado
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB DE AUDITORIA DE TRANSAÇÕES
// ============================================================================

function TransactionAuditTab({ userId }: { userId: string }) {
  const { audit, loading, error, refetch } = useTransactionAudit(userId || undefined);

  if (loading) {
    return <div className="text-center py-8">Carregando auditoria...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Erro: {error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Auditoria de Transações</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Atualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {audit.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.user_name || 'Usuário'}
                    </div>
                    <div className="text-sm text-gray-500">{item.user_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.action_type === 'create' ? 'bg-green-100 text-green-800' :
                    item.action_type === 'update' ? 'bg-blue-100 text-blue-800' :
                    item.action_type === 'delete' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.action_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.transaction_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.amount_before !== null && item.amount_after !== null ? (
                    <div className="flex items-center">
                      <span className="text-gray-500">{item.amount_before}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{item.amount_after}</span>
                      {item.amount_delta !== null && (
                        <span className={`ml-2 text-sm ${item.amount_delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({item.amount_delta >= 0 ? '+' : ''}{item.amount_delta})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'approved' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {audit.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma auditoria encontrada
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB DE ESTATÍSTICAS
// ============================================================================

function StatisticsTab({ days }: { days: number }) {
  const { statistics, loading, error, refetch } = useAuditStatistics(days);

  if (loading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Erro: {error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Estatísticas de Auditoria</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {statistics.reduce((sum, stat) => sum + stat.total_actions, 0)}
          </div>
          <div className="text-sm text-blue-800">Total de Ações</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {statistics.reduce((sum, stat) => sum + stat.successful_actions, 0)}
          </div>
          <div className="text-sm text-green-800">Ações Bem-sucedidas</div>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {statistics.reduce((sum, stat) => sum + stat.failed_actions, 0)}
          </div>
          <div className="text-sm text-red-800">Ações Falhadas</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {statistics.reduce((sum, stat) => sum + stat.total_tokens_moved, 0)}
          </div>
          <div className="text-sm text-purple-800">Tokens Movimentados</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total de Ações
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sucessos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Falhas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens Movidos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuários Únicos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.map((stat, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(stat.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.total_actions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {stat.successful_actions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {stat.failed_actions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.total_tokens_moved}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.unique_users}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statistics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma estatística encontrada
        </div>
      )}
    </div>
  );
}
