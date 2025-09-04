// ============================================================================
// SELEÇÃO TIPO CADASTRO - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClerkSupabase } from '../hooks/useClerkSupabase';
import { useNotifications } from '../hooks/useSupabase';
import confetti from 'canvas-confetti';
import type { UserRole } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface SelecaoTipoCadastroProps {
  className?: string;
}

interface TipoCadastro {
  id: UserRole;
  titulo: string;
  descricao: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  benefits: string[];
  tokens: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TIPOS_CADASTRO: TipoCadastro[] = [
  {
    id: 'atleta',
    titulo: 'Atleta',
    descricao: 'Quero competir no INTERBØX 2025',
    icon: '🏃‍♀️',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    benefits: ['Acesso às competições', 'Gamificação completa', 'Networking com atletas'],
    tokens: 10
  },
  {
    id: 'judge',
    titulo: 'Judge',
    descricao: 'Quero ser judge do evento',
    icon: '⚖️',
    accentColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    benefits: ['Acesso ao painel de judges', 'Certificação oficial', 'Experiência técnica'],
    tokens: 15
  },
  {
    id: 'midia',
    titulo: 'Mídia',
    descricao: 'Quero cobrir o evento',
    icon: '📸',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefits: ['Acesso à área de mídia', 'Credencial oficial', 'Conteúdo exclusivo'],
    tokens: 12
  },
  {
    id: 'espectador',
    titulo: 'Torcida',
    descricao: 'Acompanhe as competições e participe da comunidade',
    icon: '🎉',
    accentColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    benefits: ['Acesso ao evento', 'Gamificação básica', 'Comunidade ativa'],
    tokens: 8
  },
  {
    id: 'publico',
    titulo: 'Público Geral',
    descricao: 'Outro tipo de participação',
    icon: '👥',
    accentColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    benefits: ['Acesso geral', 'Informações do evento', 'Comunidade'],
    tokens: 5
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SelecaoTipoCadastro({ className = '' }: SelecaoTipoCadastroProps) {
  const navigate = useNavigate();
  const { user, completeProfile, loading } = useClerkSupabase();
  const { addNotification } = useNotifications(user?.id || '');
  
  const [selectedType, setSelectedType] = useState<UserRole | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    whatsapp: '',
    box: '',
    cidade: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (user && user.profileComplete) {
      // Usuário já tem perfil completo, redirecionar
      navigate(`/perfil/${user.role}`);
    }
  }, [user, navigate]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const handleTypeSelect = (tipo: UserRole) => {
    setSelectedType(tipo);
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !user) return;

    setIsSubmitting(true);
    try {
      // Completar perfil no Supabase e Clerk
      await completeProfile({
        ...formData,
        role: selectedType
      });

      // Adicionar notificação de sucesso
      await addNotification({
        title: '🎉 Cadastro realizado com sucesso!',
        message: `Bem-vindo ao INTERBØX 2025 como ${TIPOS_CADASTRO.find(t => t.id === selectedType)?.titulo}!`,
        type: 'success',
        read: false,
        metadata: {
          tokens: TIPOS_CADASTRO.find(t => t.id === selectedType)?.tokens || 0,
          role: selectedType
        }
      });

      // Efeito de confetti
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#34C759', '#FF9500', '#FF3B30']
      });

      // Redirecionar após delay
      setTimeout(() => {
        navigate(`/perfil/${selectedType}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      alert('Erro ao completar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedType(null);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!showForm ? (
            // Seleção de Tipo
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">🎯</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Bem-vindo ao INTERBØX 2025!
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Escolha como você quer participar do maior evento de CrossFit do Brasil
                </p>
              </div>

              {/* Cards de Seleção */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TIPOS_CADASTRO.map((tipo, index) => (
                  <motion.div
                    key={tipo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleTypeSelect(tipo.id)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-pink-200"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        {tipo.icon}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${tipo.accentColor}`}>
                        {tipo.titulo}
                      </h3>
                      <p className="text-gray-600 mb-4">{tipo.descricao}</p>
                      
                      {/* Benefícios */}
                      <div className="space-y-2 mb-4">
                        {tipo.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-500">
                            <span className="text-green-500 mr-2">✓</span>
                            {benefit}
                          </div>
                        ))}
                      </div>

                      {/* Tokens */}
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Bônus de boas-vindas</div>
                        <div className="text-lg font-bold text-pink-500">
                          +{tipo.tokens} $BOX
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center mt-12">
                <p className="text-gray-500">
                  Você pode alterar seu tipo de participação a qualquer momento
                </p>
              </div>
            </motion.div>
          ) : (
            // Formulário de Dados
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Header do Formulário */}
              <div className="text-center mb-8">
                <button
                  onClick={handleBack}
                  className="text-gray-500 hover:text-gray-700 mb-4 flex items-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                
                <div className="text-4xl mb-4">
                  {TIPOS_CADASTRO.find(t => t.id === selectedType)?.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {TIPOS_CADASTRO.find(t => t.id === selectedType)?.titulo}
                </h2>
                <p className="text-gray-600">
                  Complete suas informações para finalizar o cadastro
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="space-y-6">
                  {/* WhatsApp */}
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Box */}
                  <div>
                    <label htmlFor="box" className="block text-sm font-medium text-gray-700 mb-2">
                      Box/Academia
                    </label>
                    <input
                      type="text"
                      id="box"
                      name="box"
                      value={formData.box}
                      onChange={handleInputChange}
                      placeholder="Nome da sua box"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      placeholder="Sua cidade"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      placeholder="Conte-nos um pouco sobre você..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botão de Submit */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Finalizando cadastro...
                      </>
                    ) : (
                      <>
                        Finalizar Cadastro
                        <span className="ml-2">
                          +{TIPOS_CADASTRO.find(t => t.id === selectedType)?.tokens} $BOX
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
