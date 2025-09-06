// ============================================================================
// COMPONENTE DO SISTEMA DE CONVITES - INTERBØX V2
// ============================================================================
// Este componente implementa a interface completa do sistema de convites
// ============================================================================

import React, { useState } from 'react';
import { useInviteSystem } from '../hooks/useInviteSystem';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function InviteSystem() {
  const {
    invites,
    stats,
    referralCode,
    loading,
    error,
    createInvite,
    acceptInvite,
    cancelInvite,
    resendInvite,
    generateInviteLink,
    shareInvite,
    clearError
  } = useInviteSystem();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [referralInput, setReferralInput] = useState('');

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createInvite({
      inviteeEmail: inviteEmail,
      message: inviteMessage
    });

    if (result.success) {
      setInviteEmail('');
      setInviteMessage('');
      setShowCreateForm(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await acceptInvite(referralInput);
    
    if (result.success) {
      setReferralInput('');
    }
  };

  const handleShareInvite = async () => {
    if (!referralCode) return;
    
    const success = await shareInvite(referralCode, 'Junte-se ao INTERBØX!');
    if (success) {
      // Feedback visual de sucesso
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🎁 Sistema de Convites</h2>
        <p className="text-blue-100">
          Convide amigos e ganhe <span className="font-bold">+50 $BØX</span> para cada indicação confirmada!
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
            <div className="text-sm text-gray-600">Convites Enviados</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.totalAccepted}</div>
            <div className="text-sm text-gray-600">Aceitos</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{stats.totalTokensEarned}</div>
            <div className="text-sm text-gray-600">$BØX Ganhos</div>
          </div>
        </div>
      )}

      {/* Código de Referência */}
      {referralCode && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Seu Código de Referência</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
              />
            </div>
            <button
              onClick={handleShareInvite}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Compartilhar
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Compartilhe este código com seus amigos para ganhar recompensas!
          </p>
        </div>
      )}

      {/* Aceitar Convite */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Aceitar Convite</h3>
        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Referência
            </label>
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              placeholder="Digite o código de referência"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processando...' : 'Aceitar Convite'}
          </button>
        </form>
      </div>

      {/* Criar Convite */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Enviar Convite</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancelar' : 'Novo Convite'}
          </button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do Amigo
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="amigo@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Conte ao seu amigo sobre o INTERBØX..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Convite'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Convites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Seus Convites</h3>
          </div>
          <div className="divide-y">
            {invites.map((invite) => (
              <InviteItem
                key={invite.id}
                invite={invite}
                onCancel={() => cancelInvite(invite.id)}
                onResend={() => resendInvite(invite.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE ITEM DE CONVITE
// ============================================================================

interface InviteItemProps {
  invite: {
    id: string;
    inviteeEmail: string;
    status: string;
    invitedAt: Date;
    acceptedAt?: Date;
    expiresAt: Date;
  };
  onCancel: () => void;
  onResend: () => void;
}

function InviteItem({ invite, onCancel, onResend }: InviteItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Aceito';
      case 'pending': return 'Pendente';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const isExpired = new Date(invite.expiresAt) < new Date();
  const canResend = invite.status === 'expired' || invite.status === 'cancelled';
  const canCancel = invite.status === 'pending';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="font-medium text-gray-900">{invite.inviteeEmail}</div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
              {getStatusText(invite.status)}
            </span>
            {isExpired && invite.status === 'pending' && (
              <span className="text-red-500 text-xs">Expirado</span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Enviado em {invite.invitedAt.toLocaleDateString('pt-BR')}
            {invite.acceptedAt && (
              <span className="ml-2">
                • Aceito em {invite.acceptedAt.toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canResend && (
            <button
              onClick={onResend}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reenviar
            </button>
          )}
          {canCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE PÁGINA DE ACEITAÇÃO DE CONVITE
// ============================================================================

interface AcceptInvitePageProps {
  referralCode: string;
}

export function AcceptInvitePage({ referralCode }: AcceptInvitePageProps) {
  const { acceptInvite, loading, error } = useInviteSystem();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    tokensAwarded?: number;
  } | null>(null);

  const handleAccept = async () => {
    const result = await acceptInvite(referralCode);
    setResult(result);
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {result.success ? (
            <div>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                Convite Aceito!
              </h1>
              <p className="text-gray-600 mb-4">{result.message}</p>
              {result.tokensAwarded && (
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-lg font-semibold text-green-800">
                    +{result.tokensAwarded} $BØX
                  </div>
                  <div className="text-sm text-green-600">
                    Recompensa por indicação confirmada
                  </div>
                </div>
              )}
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para o INTERBØX
              </button>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Erro ao Aceitar Convite
              </h1>
              <p className="text-gray-600 mb-4">{result.message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Voltar ao INTERBØX
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Convite para INTERBØX
          </h1>
          <p className="text-gray-600">
            Você foi convidado para participar do INTERBØX!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-800">
            <strong>Código de Referência:</strong> {referralCode}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
        >
          {loading ? 'Processando...' : 'Aceitar Convite'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Ao aceitar, você e quem te convidou ganharão recompensas!
          </p>
        </div>
      </div>
    </div>
  );
}
